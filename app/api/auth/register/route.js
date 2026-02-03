import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { getSequelize } from "@/lib/db";

export async function POST(req) {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
        return NextResponse.json(
            { message: "All fields required" },
            { status: 400 }
        );
    }

    const sequelize = getSequelize();
    await sequelize.sync();

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return NextResponse.json(
            { message: "User already exists" },
            { status: 409 }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "user", // default user
    });

    return NextResponse.json({
        message: "User created",
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
}
