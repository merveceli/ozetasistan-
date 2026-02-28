import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Shopier } from '@/lib/shopier';

// Paket süresi hesaplama (aylık)
function calculateEndDate(packageId: string): Date {
    const now = new Date();
    const endDate = new Date(now);

    switch (packageId) {
        case 'academic':
            endDate.setMonth(now.getMonth() + 1);
            break;
        case 'student':
            endDate.setMonth(now.getMonth() + 1);
            break;
        default:
            endDate.setMonth(now.getMonth() + 1);
    }

    return endDate;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const postData = Object.fromEntries(formData.entries()) as Record<string, string>;

        const shopier = new Shopier();

        // 1. İmza Doğrulama
        if (!shopier.verifyCallback(postData)) {
            console.error('Invalid Shopier Signature', { postData });
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
        }

        const supabase = await createClient();
        const orderId = postData.platform_order_id as string;

        // 2. Bekleyen ödeme kaydını bul
        const { data: payment, error: payError } = await supabase
            .from('payments')
            .select()
            .eq('provider_id', orderId)
            .single();

        if (payError || !payment) {
            console.error('Payment record not found for Order:', orderId);
            // Shopier'a başarılı olduğunu söyle ama logla
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?status=error&reason=not_found`);
        }

        // 3. Tekrarlı işlemi engelle (idempotency)
        if (payment.status === 'success') {
            console.log('Payment already processed:', orderId);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?status=success`);
        }

        // 4. Abonelik bitiş tarihi hesapla
        const subscriptionEndDate = calculateEndDate(payment.package_id);

        // 5. Ödeme durumunu güncelle
        const { error: payUpdateError } = await supabase
            .from('payments')
            .update({
                status: 'success',
                subscription_end_date: subscriptionEndDate.toISOString(),
            })
            .eq('id', payment.id);

        if (payUpdateError) {
            console.error('Payment update error:', payUpdateError);
        }

        // 6. Kullanıcı profilini güncelle: plan + bitiş tarihi
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: payment.package_id,
                subscription_status: 'active',
                subscription_end_date: subscriptionEndDate.toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', payment.user_id);

        if (profileError) {
            console.error('Profile update error:', profileError);
        }

        // 7. usage_tracking'i sıfırlama (yeni abonelik başladığında)
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const { error: usageError } = await supabase
            .from('usage_tracking')
            .upsert({
                user_id: payment.user_id,
                month_year: currentMonth,
                documents_uploaded: 0,
                analyses_completed: 0,
                presentations_created: 0,
                storage_used_mb: 0,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,month_year' });

        if (usageError) {
            console.error('Usage tracking reset error:', usageError);
        }

        // 8. Admin audit log
        await supabase.from('admin_audit_logs').insert({
            admin_id: null, // Sistem aksiyonu
            action_type: 'subscription_upgrade',
            target_user_id: payment.user_id,
            details: {
                packageId: payment.package_id,
                orderId,
                amount: payment.amount,
                currency: payment.currency,
                subscriptionEndDate: subscriptionEndDate.toISOString(),
            },
        });

        console.log(`✅ Shopier payment processed: user=${payment.user_id}, package=${payment.package_id}`);

        // 9. Kullanıcıyı başarı sayfasına yönlendir
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?status=success&plan=${payment.package_id}`);

    } catch (error: any) {
        console.error('Shopier Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
