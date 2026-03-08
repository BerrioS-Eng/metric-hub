import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/api/auth"];

function isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.some((route) => path.startsWith(route));
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    
    const sessionCookie =
        request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token"); // en producción con HTTPS

    
    if (!sessionCookie) {
        if (pathname.startsWith("/api")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)" ],
};