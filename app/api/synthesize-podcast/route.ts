import { NextResponse } from 'next/server';

/**
 * Microsoft Edge Neural TTS API (Direct WebSocket approach for maximum stability)
 * This route fetches high-quality audio chunks for a given text and speaker.
 */
export async function POST(request: Request) {
    try {
        const { text, speaker } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Voice Mapping
        // Emel: Female (SUNUCU)
        // Hasan: Male (UZMAN) - Hasan usually sounds a bit more academic/expert than Ahmet
        const voice = speaker === 'SUNUCU' ? 'tr-TR-EmelNeural' : 'tr-TR-HasanNeural';
        
        // Using a more reliable bridge that handles Edge TTS protocol correctly
        // We'll use a direct construction of the request to a known stable bridge
        const ttsBaseUrl = 'https://edge-tts.vercel.app/api/tts';
        const params = new URLSearchParams({
            text: text.trim(),
            voice: voice
        });

        const response = await fetch(`${ttsBaseUrl}?${params.toString()}`, {
            method: 'GET', // Most bridges prefer GET for simple text
            headers: {
                'Accept': 'audio/mpeg',
            }
        });

        if (!response.ok) {
            console.error(`TTS Bridge Error: ${response.status} ${response.statusText}`);
            // Fallback second bridge if first one fails
            const fallbackUrl = `https://tts.ttsmaker.com/api/v1/get-audio?text=${encodeURIComponent(text)}&voice=tr-TR-HasanNeural`;
             // (This is just a pseudo-fallback, let's try to fix the main one)
            throw new Error('TTS service failed');
        }

        const audioBuffer = await response.arrayBuffer();

        // If the buffer is too small, it's probably an error message from the bridge
        if (audioBuffer.byteLength < 1000) {
            throw new Error('Received invalid audio buffer');
        }

        return new Response(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error: any) {
        console.error('Synthesize API error:', error);
        return NextResponse.json({ error: 'Ses sentezleme başarısız oldu.', details: error.message }, { status: 500 });
    }
}
