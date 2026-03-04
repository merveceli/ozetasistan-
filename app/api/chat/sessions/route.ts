import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Kullanıcının tüm sohbet oturumlarını listele
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: sessions, error } = await supabase
            .from('chat_sessions')
            .select('id, title, created_at, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ sessions: sessions || [] });
    } catch (error) {
        console.error('Chat sessions error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE: Belirli bir sohbeti sil
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = await request.json();
        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Mesajları sil
        await supabase
            .from('chat_messages')
            .delete()
            .eq('session_id', sessionId);

        // Oturumu sil (sadece kendi oturumu)
        await supabase
            .from('chat_sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete session error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
