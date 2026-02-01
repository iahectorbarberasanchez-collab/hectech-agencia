import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Proteger la ruta /dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const session = request.cookies.get('hectech_session');
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
}
