import { NextResponse } from 'next/server';

/**
 * Microsoft Edge Neural TTS API (Free & Human-like)
 * This route fetches high-quality audio chunks for a given text and speaker.
 */
export async function POST(request: Request) {
    try {
        const { text, speaker } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Microsoft Edge Neural Voices for Turkey
        // SUNUCU: Emel (Female)
        // UZMAN: Ahmet (Male)
        const voice = speaker === 'SUNUCU' ? 'tr-TR-EmelNeural' : 'tr-TR-AhmetNeural';
        
        // Use a reliable free TTS bridge (this is a common approach for free Edge TTS in JS)
        // Note: Using a public bridge for demonstration, in production you'd want your own microservice
        const ttsUrl = `https://edge-tts.vercel.app/api/tts?text=${encodeURIComponent(text)}&voice=${voice}`;

        const response = await fetch(ttsUrl);

        if (!response.ok) {
            throw new Error('TTS service failed');
        }

        const audioBuffer = await response.arrayBuffer();

        return new Response(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error: any) {
        console.error('Synthesize error:', error);
        return NextResponse.json({ error: 'Ses sentezleme başarısız oldu.' }, { status: 500 });
    }
}
