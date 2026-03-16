import { NextResponse } from 'next/server';

/**
 * NotebookLM Style High-Quality TTS Engine
 * Supports ElevenLabs (Premium) and Microsoft Edge Neural (Free/Robust)
 */
export async function POST(request: Request) {
    try {
        const { text, speaker, usePremiumTTS = true } = await request.json();
        const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // --- OPTION 1: ElevenLabs (NotebookLM Quality - Premium) ---
        if (ELEVENLABS_API_KEY && usePremiumTTS) {
            try {
                // Sunucu: Rachel (Daha enerjik), Uzman: Adam (Daha otoriter)
                // Bu sesler ElevenLabs'in en popüler ve insansı sesleridir.
                const voiceId = speaker === 'SUNUCU' 
                    ? '21m00Tcm4lJC8rq7d593' // Rachel
                    : 'pNInz6obpg8n9HB4tNoL'; // Adam

                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': ELEVENLABS_API_KEY,
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: 'eleven_multilingual_v2',
                        voice_settings: {
                            stability: 0.4,
                            similarity_boost: 0.8,
                            style: 0.5,
                            use_speaker_boost: true
                        }
                    }),
                });

                if (response.ok) {
                    const audioBuffer = await response.arrayBuffer();
                    return new Response(audioBuffer, {
                        headers: { 'Content-Type': 'audio/mpeg' },
                    });
                }
                console.warn('ElevenLabs API failed, falling back to Edge:', await response.text());
            } catch (err) {
                console.error('ElevenLabs Error:', err);
            }
        }

        // --- OPTION 2: Microsoft Edge Neural (High Quality - Free) ---
        // Farklı bir bridge ve daha spesifik ses ayarları kullanıyoruz.
        // Sunucu: Emel (Kadın), Uzman: Ahmet (Erkek)
        const edgeVoice = speaker === 'SUNUCU' ? 'tr-TR-EmelNeural' : 'tr-TR-AhmetNeural';
        
        // Bu bridge daha stabil ve parametreleri doğru işliyor
        const ttsUrl = `https://api.ttsmaker.com/v1/get-audio`; 
        // Not: TTSMaker API anahtarı gerektirebilir, ancak Edge TTS ücretsizdir.
        // Ücretsiz stabil bir Edge TTS bridge'i deniyoruz:
        const freeBridgeUrl = `https://edge-tts.vercel.app/api/tts?text=${encodeURIComponent(text)}&voice=${edgeVoice}`;

        const response = await fetch(freeBridgeUrl);
        
        if (response.ok) {
            const audioBuffer = await response.arrayBuffer();
            if (audioBuffer.byteLength > 1000) {
                return new Response(audioBuffer, {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            }
        }

        throw new Error('All TTS engines failed');

    } catch (error: any) {
        console.error('Synthesize API error:', error);
        return NextResponse.json({ 
            error: 'Ses sentezleme başarısız oldu.', 
            details: error.message 
        }, { status: 500 });
    }
}
