import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Task, User, syncDB } from "@/models";

export const runtime = "nodejs";

export async function POST(req) {
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

    if (decoded.role !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await syncDB();

    const { title, description, assignedToId, status } = await req.json();

    if (!title) {
        return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    // Check if assigned user exists
    let assignedUser = null;
    if (assignedToId) {
        assignedUser = await User.findByPk(assignedToId);
        if (!assignedUser) {
            return NextResponse.json({ message: "Assigned user not found" }, { status: 404 });
        }
    }

    // Create task
    const task = await Task.create({
        title,
        description: description || "",
        status: status || "pending",
        assignedToId: assignedUser ? assignedUser.id : null,
    });

    // Reload task including assigned user
    const taskWithUser = await Task.findByPk(task.id, {
        include: {
            model: User,
            as: "assignedTo",
            attributes: ["id", "name", "email"],
        },
    });

    return NextResponse.json({
        message: "Task created",
        task: taskWithUser,
    });
}
