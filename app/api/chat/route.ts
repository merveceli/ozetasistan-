import { model } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
}

const SYSTEM_PROMPT = `
Sen çok yönlü bir akademik asistan ve eğitim rehberisin. 

TEMEL GÖREVLERİN:
1. Genel Bilgi: Kullanıcının sorduğu her türlü akademik, bilimsel veya genel kültür sorusuna doğru, yardımcı ve anlaşılır cevaplar ver.
2. Analiz Desteği: Eğer kullanıcı sana bir ANALIZ_PAKETI içeriği sunarsa, bu içeriğe dayanarak özetler, zihin haritaları ve sunum içerikleri üret.
3. Görsel Analiz: Kullanıcı sana bir görsel gönderirse, görsel içeriğini analiz ederek açıklama, özetleme veya ilgili akademik bilgi sağla.

KURALLAR:
- Her zaman Türkçe cevap ver.
- Eğer bir ANALIZ_PAKETI sunulmuşsa, bu doküman hakkındaki soruları öncelikle bu paketteki bilgilere dayanarak cevapla.
- Dokümanda olmayan ama genel akademik bilgi dahilinde olan soruları kendi eğitilmiş bilgilerini kullanarak cevaplayabilirsin.
- Akademik, profesyonel ama samimi bir dil kullan.
- Karmaşık konuları açıklarken eğitimci kimliğini ön plana çıkar.

ZİHİN HARİTASI VE SUNUM İSTEKLERİNDE:
Eğer kullanıcı bir sunum veya zihin haritası isterse ve elinde bir analiz paketi varsa, daha önce belirlenen yapısal formatları (Slayt 1, Slayt 2... veya Merkez konu->Alt dallar) takip etmeye devam et.
`;

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { message, history, sessionId, imageBase64, imageMimeType, stream = false } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const baseHistory = [
            {
                role: 'user',
                parts: [{ text: SYSTEM_PROMPT }],
            },
            {
                role: 'model',
                parts: [{ text: 'Anladım. Sadece verilen ANALIZ_PAKETI içeriğini kullanarak akademik analiz, zihin haritası ve sunum üretmeye hazırım.' }],
            },
        ];

        let formattedHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
            formattedHistory = formattedHistory.slice(1);
        }

        const chat = model.startChat({
            history: [
                ...baseHistory,
                ...formattedHistory,
            ],
        });

        // Build message parts (text + optional image)
        const messageParts: any[] = [{ text: message }];
        if (imageBase64 && imageMimeType) {
            messageParts.push({
                inlineData: {
                    mimeType: imageMimeType,
                    data: imageBase64,
                },
            });
        }

        // TAVSİYE 2: Veritabanı Kaydı İçin Paralel (Arka Plan) İşlem
        // Kullanıcının mesaj kaydının Gemini request'ini yavaşlatmasını önlemek için ayrı asenkron task başlatıyoruz.
        const saveUserMessagePromise = (async () => {
            if (user && sessionId) {
                try {
                    const { data: existingSession } = await supabase
                        .from('chat_sessions')
                        .select('id')
                        .eq('id', sessionId)
                        .eq('user_id', user.id)
                        .single();

                    if (!existingSession) {
                        await supabase.from('chat_sessions').insert({
                            id: sessionId,
                            user_id: user.id,
                            title: message.slice(0, 80) + (message.length > 80 ? '...' : ''),
                        });
                    } else {
                        await supabase
                            .from('chat_sessions')
                            .update({ updated_at: new Date().toISOString() })
                            .eq('id', sessionId);
                    }

                    await supabase.from('chat_messages').insert({
                        session_id: sessionId,
                        role: 'user',
                        content: message,
                        image_url: imageBase64 ? `[Görsel eklendi]` : null,
                    });
                } catch (e) {
                    console.error('Chat user DB save error:', e);
                }
            }
        })();

        // TAVSİYE 1: AI Yanıtlarında Streaming
        if (stream) {
            const result = await chat.sendMessageStream(messageParts);

            const readable = new ReadableStream({
                async start(controller) {
                    let fullText = '';
                    try {
                        for await (const chunk of result.stream) {
                            const chunkText = chunk.text();
                            fullText += chunkText;
                            controller.enqueue(new TextEncoder().encode(chunkText));
                        }
                    } catch (err) {
                        console.error("Stream error", err);
                        controller.error(err);
                    } finally {
                        controller.close();

                        // Stream tamamlandığında asistan yanıtını arka planda kaydet.
                        // (Bu aşamada kullanıcı ilk kelimeleri çoktan görüp okumaya başladı bile)
                        if (user && sessionId) {
                            try {
                                await saveUserMessagePromise; // User tablosunun sorunsuz yazıldığından emin ol
                                await supabase.from('chat_messages').insert({
                                    session_id: sessionId,
                                    role: 'assistant',
                                    content: fullText,
                                });
                            } catch (e) {
                                console.error('Chat assistant DB save error:', e);
                            }
                        }
                    }
                }
            });

            return new Response(readable, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-cache',
                }
            });
        } else {
            // Frontend eski şekilde JSON isterse geriye dönük uyumluluk sürsün
            const result = await chat.sendMessage(messageParts);
            const response = await result.response;
            const text = response.text();

            if (user && sessionId) {
                try {
                    await saveUserMessagePromise;
                    await supabase.from('chat_messages').insert({
                        session_id: sessionId,
                        role: 'assistant',
                        content: text,
                    });
                } catch (e) {
                    console.error('Chat DB error:', e);
                }
            }

            return NextResponse.json({
                message: text,
                role: 'assistant',
            });
        }

    } catch (error: any) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            {
                error: 'Yanıt oluşturulurken bir hata meydana geldi.',
                details: error?.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}
