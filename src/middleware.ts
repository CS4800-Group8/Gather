import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// AnN add: Middleware to protect routes that require authentication on 10/23
export function middleware(request: NextRequest) {
  // Check if user has auth cookie
  const gatherUserCookie = request.cookies.get('gatherUser');

  // List of protected routes that require login
  const protectedPaths = ['/profile', '/user-settings', '/explore-recipes'];

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If trying to access protected route without auth cookie, redirect to signin
  if (isProtectedPath && !gatherUserCookie) {
    const signInUrl = new URL('/signin', request.url);
    // Add redirect parameter so we can send them back after signin
    signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If logged in and trying to access signin/signup, redirect to home
  if (gatherUserCookie && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
