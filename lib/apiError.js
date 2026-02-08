import { NextResponse } from "next/server";

export function apiError(error, status = 500) {
    console.error("API ERROR:", error);

    return NextResponse.json(
        {
            success: false,
            message: error?.message || "Internal server error",
        },
        { status }
    );
}
