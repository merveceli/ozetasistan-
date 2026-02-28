import { createClient } from '@/lib/supabase/server';
import { getQuotaStatus } from '@/lib/quota';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const quotaStatus = await getQuotaStatus(user.id);

        if (!quotaStatus) {
            return NextResponse.json(
                { error: 'Quota bilgisi alınamadı' },
                { status: 500 }
            );
        }

        return NextResponse.json({ quotaStatus });
    } catch (error) {
        console.error('Quota status error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
