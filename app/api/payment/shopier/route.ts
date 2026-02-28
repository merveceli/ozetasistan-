import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Shopier } from '@/lib/shopier';

// Frontend ile tutarlı paket tanımları
const PACKAGES: Record<string, { display_name: string; price_monthly: number }> = {
    student: { display_name: 'Öğrenci Paketi', price_monthly: 49.90 },
    academic: { display_name: 'Akademik Paket', price_monthly: 99.90 },
};

export async function POST(request: Request) {
    try {
        const { packageId } = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        // 1. Paket bilgisini hardcoded map'ten al (DB bağımlılığı yok)
        const pkg = PACKAGES[packageId];
        if (!pkg) {
            return NextResponse.json({ error: 'Geçersiz paket' }, { status: 400 });
        }

        // 2. Shopier form verisi üret
        const shopier = new Shopier();
        const paymentDetails = shopier.generateForm({
            user_id: user.id,
            package_id: packageId,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
            amount: pkg.price_monthly,
        });

        // 3. Bekleyen ödemeyi DB'ye kaydet (hata olursa form üretimini engelleme)
        try {
            await supabase.from('payments').insert({
                user_id: user.id,
                amount: pkg.price_monthly,
                status: 'pending',
                package_id: packageId,
                provider_id: paymentDetails.fields.platform_order_id,
            });
        } catch (dbErr) {
            console.warn('Payment log DB error (non-blocking):', dbErr);
        }

        // 4. Frontend'e form bilgilerini döndür
        return NextResponse.json(paymentDetails);

    } catch (error: any) {
        console.error('Shopier Initiation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
