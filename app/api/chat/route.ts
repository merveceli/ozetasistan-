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

        // Supabase RPC ile hem oturumu hem mesajı tek seferde (veya atomik olarak) kaydet
        const saveMessage = async (role: 'user' | 'assistant', content: string, isImage: boolean = false) => {
            if (user && sessionId) {
                try {
                    await supabase.rpc('save_chat_message_v2', {
                        p_session_id: sessionId,
                        p_user_id: user.id,
                        p_role: role,
                        p_content: content,
                        p_image_url: isImage ? `[Görsel eklendi]` : null,
                        p_title: role === 'user' ? (content.slice(0, 80) + (content.length > 80 ? '...' : '')) : null
                    });
                } catch (e) {
                    console.error(`Chat ${role} save error:`, e);
                }
            }
        };

        // Kullanıcı mesajını hemen kaydet (arka planda)
        const saveUserMessagePromise = saveMessage('user', message, !!imageBase64);

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
                        if (user && sessionId) {
                            try {
                                await saveUserMessagePromise;
                                await saveMessage('assistant', fullText);
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
                    await saveMessage('assistant', text);
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
