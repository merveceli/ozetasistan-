import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL gereklidir.' }, { status: 400 });
        }

        console.log('🎬 Fetching YouTube transcript for:', url);

        try {
            // Video ID'sini çek
            let videoId = '';
            if (url.includes('v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else {
                throw new Error('Geçersiz YouTube URL formatı.');
            }

            // Transkripti çek (Türkçe öncelikli, yoksa varsayılan)
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'tr' })
                .catch(() => YoutubeTranscript.fetchTranscript(videoId)); // Türkçe yoksa varsayılanı dene

            if (!transcriptItems || transcriptItems.length === 0) {
                throw new Error('Bu video için transkript bulunamadı. Lütfen altyazısı olan bir video deneyin.');
            }

            const transcript = transcriptItems
                .map(item => item.text)
                .join(' ')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");

            console.log('✅ Transcript fetched, length:', transcript.length);

            // Basit bir başlık oluştur
            const title = `YouTube Video (${videoId})`;

            return NextResponse.json({ 
                transcript, 
                title,
                videoId 
            });

        } catch (fetchError: any) {
            console.error('YouTube Fetch Error:', fetchError);
            return NextResponse.json({ 
                error: 'YouTube transkripti alınamadı. Videonun altyazı desteği olduğundan veya herkese açık olduğundan emin olun.',
                details: fetchError.message 
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('YouTube API Error:', error);
        return NextResponse.json({ 
            error: 'Bir sunucu hatası oluştu.',
            details: error.message 
        }, { status: 500 });
    }
}
