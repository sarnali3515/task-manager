import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Task } from "@/models";
import { apiError } from "../../../../lib/apiError";

export const runtime = "nodejs";

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { taskId } = await req.json();

        if (!taskId) {
            return NextResponse.json(
                { message: "Task ID is required" },
                { status: 400 }
            );
        }

        const task = await Task.findByPk(taskId);

        if (!task) {
            return NextResponse.json(
                { message: "Task not found" },
                { status: 404 }
            );
        }

        await task.destroy();

        return NextResponse.json({
            message: "Task deleted",
            taskId,
        });

    } catch (error) {
        return apiError(error);
    }
}
