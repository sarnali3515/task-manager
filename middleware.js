import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Only handle API requests
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-id", token.id);
    headers.set("x-user-role", token.role);

    return NextResponse.next({ request: { headers } });
}

export const config = {
    matcher: [
        "/api/tasks/:path*",
    ],
};
