import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Task, User } from "@/models";
import { apiError } from "../../../../lib/apiError";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        //  Not logged in
        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        //  Role check (safe optional chaining)
        if (session.user?.role !== "admin") {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const {
            title,
            description = "",
            assignedToId = null,
            status = "pending",
        } = body;

        //  Validation
        if (!title || title.trim() === "") {
            return NextResponse.json(
                { message: "Title is required" },
                { status: 400 }
            );
        }

        let assignedUser = null;

        if (assignedToId) {
            assignedUser = await User.findByPk(assignedToId);

            if (!assignedUser) {
                return NextResponse.json(
                    { message: "Assigned user not found" },
                    { status: 404 }
                );
            }
        }

        //  Create Task
        const task = await Task.create({
            title: title.trim(),
            description: description.trim(),
            status,
            assignedToId: assignedUser ? assignedUser.id : null,
            createdById: session.user.id, //  track who created it
        });

        //  Reload with relation
        const taskWithUser = await Task.findByPk(task.id, {
            include: {
                model: User,
                as: "assignedTo",
                attributes: ["id", "name", "email"],
            },
        });

        return NextResponse.json(
            {
                message: "Task created successfully",
                task: taskWithUser,
            },
            { status: 201 }
        );

    } catch (error) {
        return apiError(error);
    }
}
