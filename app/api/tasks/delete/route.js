import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Task, syncDB } from "@/models";
import { apiError } from "../../../../lib/apiError";

export const runtime = "nodejs";

export async function DELETE(req) {
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

        if (decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await syncDB();

        const { taskId } = await req.json();

        if (!taskId) {
            return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
        }

        const task = await Task.findByPk(taskId);
        if (!task) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        await task.destroy();

        return NextResponse.json({
            message: "Task deleted",
            taskId,
        });
    } catch (error) {
        return apiError(error)
    }
}
