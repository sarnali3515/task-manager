import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { getSequelize } from "@/lib/db";
import { apiError } from "../../../../lib/apiError";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        //  Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Name, email and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const sequelize = getSequelize();
        await sequelize.sync();

        //  Check existing user
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { message: "Email already registered" },
                { status: 409 }
            );
        }

        //  Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // role to user 
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
        });

        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        );

    } catch (error) {
        return apiError(error);
    }
}
