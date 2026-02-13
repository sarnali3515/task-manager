import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Task, User } from "@/models";
import { apiError } from "../../../../lib/apiError";

export const runtime = "nodejs";

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);

        // Not logged in
        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        //  Only admin can assign tasks
        if (session.user.role !== "admin") {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const { taskId, assignedToId } = await req.json();

        if (!taskId || !assignedToId) {
            return NextResponse.json(
                { message: "Task ID and Assigned User ID are required" },
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

        const user = await User.findByPk(assignedToId);
        if (!user) {
            return NextResponse.json(
                { message: "Assigned user not found" },
                { status: 404 }
            );
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

        return NextResponse.json(
            { message: "Task assigned successfully", task: taskWithUser },
            { status: 200 }
        );

    } catch (error) {
        return apiError(error);
    }
}
