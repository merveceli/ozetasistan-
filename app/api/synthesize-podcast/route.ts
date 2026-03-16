import { NextResponse } from 'next/server';

/**
 * NotebookLM Style High-Quality TTS Engine
 * Supports ElevenLabs (Premium) and Microsoft Edge Neural via edge-tts (Free/Robust)
 */
export const maxDuration = 30;

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
                console.warn('ElevenLabs API failed, falling back to Edge TTS:', await response.text());
            } catch (err) {
                console.error('ElevenLabs Error:', err);
            }
        }

        // --- OPTION 2: Microsoft Edge Neural via edge-tts NPM (High Quality - Free) ---
        // SUNUCU: Emel (Kadın, enerjik), UZMAN: Ahmet (Erkek, sakin)
        try {
            const edgeTTS = await import('edge-tts');
            const voice = speaker === 'SUNUCU' ? 'tr-TR-EmelNeural' : 'tr-TR-AhmetNeural';

            const audioBuffer = await edgeTTS.tts(text, {
                voice,
                rate: speaker === 'SUNUCU' ? '+5%' : '+0%',
                pitch: speaker === 'SUNUCU' ? '+5Hz' : '-5Hz',
            });

            if (audioBuffer && audioBuffer.length > 1000) {
                return new Response(new Uint8Array(audioBuffer), {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            }
        } catch (edgeErr) {
            console.error('Edge TTS Error:', edgeErr);
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
