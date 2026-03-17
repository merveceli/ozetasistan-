import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

        // Tüm dökümanları çek (metadata içindeki study_progress'i kontrol edeceğiz)
        const { data: documents, error } = await supabase
            .from('documents')
            .select('id, title, metadata')
            .eq('user_id', user.id)
            .not('metadata', 'is', null);

        if (error) throw error;

        const now = new Date();
        const dueFlashcards: any[] = [];

        documents.forEach((doc: any) => {
            const studyProgress = doc.metadata?.study_progress;
            const studyModule = doc.metadata?.student?.study_module || doc.metadata?.academic?.study_module || doc.metadata?.professor?.study_module;

            if (studyModule?.flashcards) {
                studyModule.flashcards.forEach((card: any, index: number) => {
                    const progress = studyProgress?.[`card_${index}`];
                    
                    // Eğer hiç çalışılmadıysa veya zamanı geldiyse
                    if (!progress || new Date(progress.nextReview) <= now) {
                        dueFlashcards.push({
                            documentId: doc.id,
                            documentTitle: doc.title,
                            cardIndex: index,
                            front: card.front,
                            back: card.back,
                            nextReview: progress?.nextReview || 'Sıfır'
                        });
                    }
                });
            }
        });

        return NextResponse.json({ 
            dueCount: dueFlashcards.length,
            flashcards: dueFlashcards.sort(() => Math.random() - 0.5).slice(0, 50) // Karıştır ve sınırla
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
