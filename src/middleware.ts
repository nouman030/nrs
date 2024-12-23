import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define routes that should be publicly accessible (no authentication required)
const publicRoutes = createRouteMatcher([
  '/site',                    // Public site route
  '/api/uploadthing',         // Public API route
  '/agency/sign-in(.*)',      // Public sign-in route
  '/agency/sign-up(.*)'       // Public sign-up route
]);

// Custom authentication middleware
const customAuthMiddleware = clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;
  const searchParams = url.searchParams.toString();
  const hostname = req.headers.get('host');

  // Construct the URL with search params
  const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // Check if the route is public and protect other routes
  if (!publicRoutes(req)) {
    // Protect routes that are not public
    await auth.protect();
  }

  // Handle the sign-in or sign-up redirect (ensure we don't redirect to the same page again)
  if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
    return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
  }

  // Extract the custom subdomain from the hostname (if any)
  const customSubDomain = hostname?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`).filter(Boolean)[0];

  // If a custom subdomain is detected, rewrite the URL to the appropriate subdomain route
  if (customSubDomain) {
    return NextResponse.rewrite(new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url));
  }

  // Handle case for the root or specific paths on the main domain
  if (url.pathname === '/' || (url.pathname === '/site' && url.hostname === process.env.NEXT_PUBLIC_DOMAIN)) {
    return NextResponse.rewrite(new URL('/site', req.url));
  }

  // Handle paths under /agency or /subaccount (likely user-specific routes)
  if (url.pathname.startsWith('/agency') || url.pathname.startsWith('/subaccount')) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
  }

  // Ensure the request continues if none of the conditions match
  return NextResponse.next();
});

// Export the custom authentication middleware
export { customAuthMiddleware as default };

// Define route matcher configuration for Next.js middleware
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
};
