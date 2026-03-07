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

    // Now check authentication
    const { data: { user } } = await supabase.auth.getUser();

    // Logged-in user hitting /landing → send them to dashboard
    if (user && pathname.startsWith('/landing')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Public routes pass through (for non-logged-in users)
    if (isPublicRoute) {
        return response;
    }

    // If user is logged in and trying to access auth pages, redirect to home
    if (user && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If no user → always redirect to landing page
    if (!user) {
        console.log('Unauthenticated user, redirecting to /landing');
        return NextResponse.redirect(new URL('/landing', request.url));
    }

    // Admin Route Protection — user is already loaded above
    if (pathname.startsWith('/admin')) {
        const isAdmin = user?.app_metadata?.is_admin === true;

        if (!isAdmin) {
            console.log('Access denied for non-admin user, redirecting to /');
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
