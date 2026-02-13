import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User } from "@/models";
import { apiError } from "../../../lib/apiError";

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

        //  Only admin can access
        if (session.user.role !== "admin") {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        // Fetch all users
        const users = await User.findAll({
            attributes: ["id", "name", "email", "role", "createdAt"],
            order: [["createdAt", "DESC"]],
        });

        return NextResponse.json(
            { users },
            { status: 200 }
        );

    } catch (error) {
        return apiError(error);
    }
}
