export const runtime = "nodejs";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const headers = new Headers(req.headers);
        headers.set("x-user-id", decoded.id);
        headers.set("x-user-role", decoded.role);

        return NextResponse.next({ request: { headers } });
    } catch (err) {
        console.error("JWT Error:", err.message);
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}

export const config = {
    matcher: ["/api/tasks/:path*"],
};
