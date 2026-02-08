
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models";
import { apiError } from "../../../lib/apiError";

export const runtime = "nodejs";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        // Only admin 
        if (decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Ensure DB is synced
        // await syncDB();

        const users = await User.findAll({
            attributes: ["id", "name", "email", "role", "createdAt"],
            order: [["createdAt", "DESC"]],
        });

        return NextResponse.json({ users });
    } catch (error) {
        return apiError(error)
    }
}
