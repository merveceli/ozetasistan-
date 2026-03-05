import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Belirli bir sohbetin mesajlarını getir
export async function GET(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }


        // Önce oturumun bu kullanıcıya ait olduğunu doğrula
        const { data: session, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('id, title, created_at')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('id, role, content, image_url, created_at')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ session, messages: messages || [] });
    } catch (error) {
        console.error('Chat messages error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
