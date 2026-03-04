import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Güvenlik doğrulaması: Bu oturum gerçekten bu kullanıcıya mı ait?
        const { data: session } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (!session) {
            return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
        }

        // Oturuma ait tüm mesajları kronolojik sırayla getir
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true }); // kronolojik sıra

        if (error) throw error;

        return NextResponse.json({ messages: messages || [] });
    } catch (error) {
        console.error('Messages fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
