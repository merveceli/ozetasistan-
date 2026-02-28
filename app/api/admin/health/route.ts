import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.app_metadata?.is_admin !== true) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Real health metrics would normally come from an infra monitoring API (Datadog, AWS, Vercel API, etc.)
        // For this demo/production integration, we'll probe the DB and check environment.

        const startTime = Date.now();
        const { data: dbCheck, error: dbError } = await supabase.from('profiles').select('id').limit(1);
        const dbLatency = Date.now() - startTime;

        return NextResponse.json({
            status: dbError ? 'warning' : 'healthy',
            database: {
                status: dbError ? 'disconnected' : 'connected',
                latency: `${dbLatency}ms`,
                error: dbError?.message || null
            },
            api: {
                status: 'healthy',
                version: 'v1.2.0',
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
            },
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
