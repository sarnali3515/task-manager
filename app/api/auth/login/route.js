import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";

export async function POST(req) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json(
            { message: "Email and password required" },
            { status: 400 }
        );
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
        return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 401 }
        );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 401 }
        );
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return NextResponse.json({
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
        },
    });
}
