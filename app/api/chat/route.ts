import { model } from '@/lib/gemini';
import { NextResponse } from 'next/server';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const SYSTEM_PROMPT = `
Sen çok yönlü bir akademik asistan ve eğitim rehberisin. 

TEMEL GÖREVLERİN:
1. Genel Bilgi: Kullanıcının sorduğu her türlü akademik, bilimsel veya genel kültür sorusuna doğru, yardımcı ve anlaşılır cevaplar ver.
2. Analiz Desteği: Eğer kullanıcı sana bir ANALIZ_PAKETI içeriği sunarsa, bu içeriğe dayanarak özetler, zihin haritaları ve sunum içerikleri üret.

KURALLAR:
- Her zaman Türkçe cevap ver.
- Eğer bir ANALIZ_PAKETI sunulmuşsa, bu doküman hakkındaki soruları öncelikle bu paketteki bilgilere dayanarak cevapla.
- Dokümanda olmayan ama genel akademik bilgi dahilinde olan soruları kendi eğitilmiş bilgilerini kullanarak cevaplayabilirsin (ancak dokümanla ilgili kesin bilgilerde dokümana sadık kal).
- Akademik, profesyonel ama samimi bir dil kullan.
- Karmaşık konuları açıklarken eğitimci kimliğini ön plana çıkar.

ZİHİN HARİTASI VE SUNUM İSTEKLERİNDE:
Eğer kullanıcı bir sunum veya zihin haritası isterse ve elinde bir analiz paketi varsa, daha önce belirlenen yapısal formatları (Slayt 1, Slayt 2... veya Merkez konu->Alt dallar) takip etmeye devam et.
`;

export async function POST(request: Request) {
    try {
        const { message, history } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Initial system setup
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

        // Format and clean the chat history from the client
        // Ensure it starts with a user message if we append it to baseHistory which ends with model
        let formattedHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        // If the first message in history is from 'model', skip it because our baseHistory already ends with 'model'
        if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
            formattedHistory = formattedHistory.slice(1);
        }

        const chat = model.startChat({
            history: [
                ...baseHistory,
                ...formattedHistory,
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            message: text,
            role: 'assistant',
        });

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
