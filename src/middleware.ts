import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Proteger la ruta /dashboard
    // TODO: Implementar validación de sesión de Supabase correctamente.
    // Por ahora, confiamos en la validación del lado del cliente en dashboard/page.tsx
    // para evitar conflictos con las cookies (ya que 'hectech_session' era del sistema anterior).

    /*
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const session = request.cookies.get('hectech_session');
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    */
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
}
