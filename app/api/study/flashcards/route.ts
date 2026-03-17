import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { documentId, cardIndex, performance } = await request.json() as { 
            documentId: string, 
            cardIndex: number, 
            performance: 'easy' | 'good' | 'hard' | 'again' 
        };

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

        // Belgeyi çek
        const { data: document, error: fetchError } = await supabase
            .from('documents')
            .select('metadata')
            .eq('id', documentId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !document) throw new Error('Document not found');

        const metadata = document.metadata || {};
        const studyProgress = metadata.study_progress || {};
        const cardKey = `card_${cardIndex}`;
        const currentData = studyProgress[cardKey] || { interval: 0, ease: 2.5, nextReview: new Date().toISOString() };

        // Basit SM-2 Algoritması (Simplified)
        let { interval, ease, nextReview } = currentData;
        
        if (performance === 'again') {
            interval = 0;
        } else if (performance === 'hard') {
            interval = interval === 0 ? 1 : interval * 1.2;
            ease = Math.max(1.3, ease - 0.2);
        } else if (performance === 'good') {
            interval = interval === 0 ? 1 : (interval === 1 ? 3 : interval * ease);
        } else if (performance === 'easy') {
            interval = interval === 0 ? 4 : interval * ease * 1.3;
            ease += 0.1;
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + Math.round(interval));
        
        studyProgress[cardKey] = {
            interval,
            ease,
            nextReview: nextDate.toISOString(),
            lastReviewed: new Date().toISOString()
        };

        metadata.study_progress = studyProgress;

        // Güncelle
        const { error: updateError } = await supabase
            .from('documents')
            .update({ metadata })
            .eq('id', documentId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, nextReview: nextDate });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
