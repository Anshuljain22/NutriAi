import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;

    // Protect these routes explicitly
    const protectedRoutes = ["/dashboard", "/workout"];

    // Checking if the request is targeting a protected path
    const isProtected = protectedRoutes.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    // Stop logged-in users from seeing the login/signup page again or the root landing page
    const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");
    const isRootPage = request.nextUrl.pathname === "/";

    if (isProtected) {
        if (!token) {
            // Redirect to login if no token is found for a protected route
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Verify the JWT signature securely on the Edge
        const payload = await verifyToken(token);
        if (!payload) {
            // Invalid or expired token
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("auth_token");
            return response;
        }
    }

    if ((isAuthPage || isRootPage) && token) {
        // If they have a token, ensure it is still valid before redirecting away from login/root
        const payload = await verifyToken(token);
        if (payload) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/workout/:path*",
        "/communities/:path*",
        "/profile/:path*",
        "/social/:path*",
        "/chat/:path*",
        "/login",
        "/signup"
    ],
};
