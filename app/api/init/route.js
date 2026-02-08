export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { syncDB } from "@/models";
import { getSequelize } from "@/lib/db";
import "@/models/User";
import "@/models/Task";

const sequelize = getSequelize();

export async function GET() {
    await syncDB();
    await sequelize.sync();
    return NextResponse.json({ message: "Database initialized" });
}
