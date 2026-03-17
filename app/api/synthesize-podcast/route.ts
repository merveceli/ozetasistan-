import { NextResponse } from 'next/server';
import { WebSocket } from 'ws';

/**
 * NotebookLM Style High-Quality TTS Engine
 * Supports ElevenLabs (Premium) and Microsoft Edge Neural (Free/Robust)
 * Edge TTS uses the same WebSocket protocol as Microsoft Edge browser internally.
 */
export const maxDuration = 30;
export const runtime = 'nodejs'; // Required for 'ws' package to run
export const dynamic = 'force-dynamic';

const EDGE_TTS_WS_URL =
    'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1' +
    '?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';

function uuid(): string {
    return crypto.randomUUID().replaceAll('-', '');
}

function edgeTTS(text: string, voice: string, pitch = '+0Hz', rate = '+0%'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`${EDGE_TTS_WS_URL}&ConnectionId=${uuid()}`, {
            host: 'speech.platform.bing.com',
            origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.66 Safari/537.36 Edg/103.0.1264.44',
            },
        });

        const audioChunks: Buffer[] = [];

        ws.on('message', (rawData: Buffer | string, isBinary: boolean) => {
            if (!isBinary) {
                const msg = rawData.toString('utf8');
                if (msg.includes('turn.end')) {
                    resolve(Buffer.concat(audioChunks));
                    ws.close();
                }
                return;
            }
            const data = rawData as Buffer;
            const separator = 'Path:audio\r\n';
            const sepIdx = data.indexOf(separator);
            if (sepIdx !== -1) {
                audioChunks.push(data.subarray(sepIdx + separator.length));
            }
        });

        ws.on('error', reject);

        ws.on('open', () => {
            const configMessage =
                `X-Timestamp:${new Date().toISOString()}\r\n` +
                `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
                JSON.stringify({
                    context: {
                        synthesis: {
                            audio: {
                                metadataoptions: { sentenceBoundaryEnabled: false, wordBoundaryEnabled: false },
                                outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
                            },
                        },
                    },
                });

            ws.send(configMessage, (err) => {
                if (err) return reject(err);

                const ssmlMessage =
                    `X-RequestId:${uuid()}\r\nContent-Type:application/ssml+xml\r\n` +
                    `X-Timestamp:${new Date().toISOString()}Z\r\nPath:ssml\r\n\r\n` +
                    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='tr-TR'>` +
                    `<voice name='${voice}'>` +
                    `<prosody pitch='${pitch}' rate='${rate}' volume='+0%'>${text}</prosody>` +
                    `</voice></speak>`;

                ws.send(ssmlMessage, (ssmlErr) => {
                    if (ssmlErr) return reject(ssmlErr);
                });
            });
        });
    });
}

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
                const voiceId =
                    speaker === 'SUNUCU'
                        ? '21m00Tcm4lJC8rq7d593' // Rachel
                        : 'pNInz6obpg8n9HB4tNoL'; // Adam

                const response = await fetch(
                    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'xi-api-key': ELEVENLABS_API_KEY,
                        },
                        body: JSON.stringify({
                            text,
                            model_id: 'eleven_multilingual_v2',
                            voice_settings: {
                                stability: 0.4,
                                similarity_boost: 0.8,
                                style: 0.5,
                                use_speaker_boost: true,
                            },
                        }),
                    }
                );

                if (response.ok) {
                    const audioBuffer = await response.arrayBuffer();
                    return new Response(audioBuffer, {
                        headers: { 'Content-Type': 'audio/mpeg' },
                    });
                }
                console.warn('ElevenLabs failed, falling back to Edge TTS:', await response.text());
            } catch (err) {
                console.error('ElevenLabs Error:', err);
            }
        }

        // --- OPTION 2: Microsoft Edge Neural TTS (Free, High Quality) ---
        // SUNUCU: tr-TR-EmelNeural (Kadın), UZMAN: tr-TR-AhmetNeural (Erkek)
        try {
            const voice = speaker === 'SUNUCU' ? 'tr-TR-EmelNeural' : 'tr-TR-AhmetNeural';
            const pitch = speaker === 'SUNUCU' ? '+5Hz' : '-5Hz';
            const rate = speaker === 'SUNUCU' ? '+5%' : '+0%';

            const audioBuffer = await edgeTTS(text, voice, pitch, rate);

            if (audioBuffer.length > 1000) {
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
        return NextResponse.json(
            { error: 'Ses sentezleme başarısız oldu.', details: error.message },
            { status: 500 }
        );
    }
}
