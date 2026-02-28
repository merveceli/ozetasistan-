import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const packageParam = searchParams.get('package');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // If package parameter exists, update profile
            if (packageParam) {
                await supabase
                    .from('profiles')
                    .update({ subscription_tier: packageParam })
                    .eq('id', data.user.id);
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return to error page if exchange fails
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
