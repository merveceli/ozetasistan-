import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { full_name, email, message } = await request.json();

        if (!full_name || !email || !message) {
            return NextResponse.json(
                { error: 'Lütfen tüm alanları doldurun' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from('contact_messages')
            .insert([
                {
                    full_name,
                    email,
                    message
                }
            ]);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Mesajınız başarıyla iletildi.' });
    } catch (error: any) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Mesaj gönderilirken bir hata oluştu.' },
            { status: 500 }
        );
    }
}
