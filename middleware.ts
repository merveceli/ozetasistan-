import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: any) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const { pathname } = request.nextUrl;
    console.log(`Middleware processing path: ${pathname}`);

    // API routes and static files - skip auth entirely
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
        return response;
    }

    // Public routes - allow without auth
    const publicRoutes = ['/landing', '/auth/login', '/auth/signup', '/auth/callback'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
        return response;
    }

    // Now check authentication for protected routes
    const { data: { user } } = await supabase.auth.getUser();

    // If user is logged in and trying to access auth pages, redirect to home
    if (user && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If no user and accessing protected route (like '/')
    if (!user) {
        // Check if guest trial is COMPLETED
        const trialCompleted = request.cookies.get('trial_completed');

        // If trying to access dashboard ('/') or other tool pages
        if (pathname === '/' || pathname.startsWith('/asistan') || pathname.startsWith('/sunum-uret')) {
            if (trialCompleted?.value === 'true') {
                // Trial already used (1 action done), force login
                console.log('Trial completed, redirecting guest to login');
                return NextResponse.redirect(new URL('/auth/login', request.url));
            } else {
                // First visit or 1st action not yet completed, allow access to dashboard
                console.log('Allowing guest access to dashboard');
                return response;
            }
        }

        // Default: allow access to other pages unless explicitly blocked
        // But for consistency, let's redirect unknown protected routes to login if trial used
        if (trialCompleted?.value === 'true') {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Admin Route Protection
    if (pathname.startsWith('/admin')) {
        const { data: { user } } = await supabase.auth.getUser();
        const isAdmin = user?.app_metadata?.is_admin === true;

        if (!isAdmin) {
            console.log('Access denied for non-admin user');
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
