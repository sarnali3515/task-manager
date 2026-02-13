import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Task } from "@/models";
import { apiError } from "../../../../lib/apiError";

export const runtime = "nodejs";

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);

        //  Not logged in
        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { taskId, description, status } = await req.json();

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

        //  Only admin or assigned user can update
        if (session.user.role !== "admin" && session.user.id !== task.assignedToId) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        // Validate status
        const allowedStatuses = ["pending", "in-progress", "done"];
        if (status && !allowedStatuses.includes(status)) {
            return NextResponse.json(
                { message: "Invalid status" },
                { status: 400 }
            );
        }

        // Update fields
        if (description !== undefined) task.description = description;
        if (status) task.status = status;

        await task.save();

        return NextResponse.json(
            { message: "Task updated successfully", task },
            { status: 200 }
        );

    } catch (error) {
        return apiError(error);
    }
}
