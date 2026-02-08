import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Task, syncDB } from "@/models";
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
        } catch (err) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        await syncDB(); // ensure models & associations are loaded

        const { taskId, description, status } = await req.json();

        if (!taskId) {
            return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
        }

        const task = await Task.findByPk(taskId);
        if (!task) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        // Only assigned user or admin can update
        if (decoded.role !== "admin" && decoded.id !== task.assignedToId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Validate status
        const allowedStatuses = ["pending", "in-progress", "done"];
        if (status && !allowedStatuses.includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        // Update task
        if (description !== undefined) task.description = description;
        if (status) task.status = status;

        await task.save();

        return NextResponse.json({
            message: "Task updated",
            task,
        });
    } catch (error) {
        return apiError(error);
    }
}
