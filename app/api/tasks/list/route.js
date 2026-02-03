import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Task, User, syncDB } from "@/models";

export const runtime = "nodejs";

export async function GET(req) {
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

    await syncDB();

    let tasks;
    if (decoded.role === "admin") {
        // Admin sees all tasks
        tasks = await Task.findAll({
            include: {
                model: User,
                as: "assignedTo",
                attributes: ["id", "name", "email"]
            },
            order: [["createdAt", "DESC"]]
        });
    } else {
        // User sees only their assigned tasks
        tasks = await Task.findAll({
            where: { assignedToId: decoded.id },
            include: {
                model: User,
                as: "assignedTo",
                attributes: ["id", "name", "email"]
            },
            order: [["createdAt", "DESC"]]
        });
    }

    return NextResponse.json({ tasks });
}
