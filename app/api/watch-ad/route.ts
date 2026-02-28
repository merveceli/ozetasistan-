import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
        }

        // Güvenli Supabase RPC fonksiyonu ile kredileri artır
        // Bu fonksiyon SECURITY DEFINER ile tanımlandığı için güvenli
        const { data: newCredits, error: rpcError } = await supabase.rpc(
            'increment_user_credits',
            { p_user_id: user.id, p_amount: 1 }
        );

        if (rpcError) {
            console.error('RPC error:', rpcError);
            throw rpcError;
        }

        // Feature log kaydı ekle
        await supabase.from('feature_usage_logs').insert({
            user_id: user.id,
            feature_name: 'ad_reward',
            credits_used: -1, // Kredi kazanımı
        });

        return NextResponse.json({
            success: true,
            message: 'Analiz kredisi kazanıldı!',
            newCredits: newCredits ?? 1,
        });

    } catch (error: any) {
        console.error('Watch ad error:', error);
        return NextResponse.json({
            error: 'Sunucu hatası oluştu.'
        }, { status: 500 });
    }
}
