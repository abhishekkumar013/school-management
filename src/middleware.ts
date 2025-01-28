import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  // console.log(sessionClaims);
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  // console.log("Role:", role);
  // console.log("Request URL:", req.url);

  for (const { matcher, allowedRoles } of matchers) {
    // console.log(`Checking route: ${req.url} `);
    if (matcher(req) && !allowedRoles.includes(role)) {
      // console.log(`Access denied for role: ${role} on route: ${req.url}`);
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
