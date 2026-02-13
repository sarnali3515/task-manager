import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Task, User } from "@/models";
import { apiError } from "../../../../lib/apiError";

export const runtime = "nodejs";

export async function GET(req) {
    try {
        //  Get session from cookie
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        let tasks;

        if (session.user.role === "admin") {
            // Admin sees all tasks
            tasks = await Task.findAll({
                include: {
                    model: User,
                    as: "assignedTo",
                    attributes: ["id", "name", "email"],
                },
                order: [["createdAt", "DESC"]],
            });
        } else {
            // User sees only their assigned tasks
            tasks = await Task.findAll({
                where: { assignedToId: session.user.id },
                include: {
                    model: User,
                    as: "assignedTo",
                    attributes: ["id", "name", "email"],
                },
                order: [["createdAt", "DESC"]],
            });
        }

        return NextResponse.json(
            { tasks },
            { status: 200 }
        );

    } catch (error) {
        return apiError(error);
    }
}
