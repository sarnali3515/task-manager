import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Task, User, syncDB } from "@/models";
import { apiError } from "../../../../lib/apiError";

export const runtime = "nodejs";

export async function PATCH(req) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        // Only admin can assign
        if (decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await syncDB();

        const { taskId, assignedToId } = await req.json();

        if (!taskId || !assignedToId) {
            return NextResponse.json({ message: "Task ID and Assigned User ID required" }, { status: 400 });
        }

        const task = await Task.findByPk(taskId);
        if (!task) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        const user = await User.findByPk(assignedToId);
        if (!user) {
            return NextResponse.json({ message: "Assigned user not found" }, { status: 404 });
        }

        // Assign task
        task.assignedToId = user.id;
        await task.save();

        // Reload task with assigned user
        const taskWithUser = await Task.findByPk(task.id, {
            include: {
                model: User,
                as: "assignedTo",
                attributes: ["id", "name", "email"],
            },
        });

        return NextResponse.json({
            message: "Task assigned successfully",
            task: taskWithUser,
        });
    } catch (error) {
        return apiError(error);
    }
}
