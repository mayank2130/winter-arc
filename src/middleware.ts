import { auth, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';


const isProtectedRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/dashboard(.*)",
    "/pricing(.*)",
  ]);

const isPublicRoute = createRouteMatcher([
    "/api/webhooks(.*)",
    "/pricing(.*)",
    "/(.*)",
  ]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public access to short code routes (like /Qr_ukT) and webhooks
  if (isPublicRoute(req)) return;
  
  // Protect all other routes except the ones explicitly listed as protected
  if (!isProtectedRoute(req)) await auth.protect();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};