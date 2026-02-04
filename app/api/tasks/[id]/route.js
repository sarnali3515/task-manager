// import { NextResponse } from "next/server";
// import { Task } from "@/models/Task";

// export async function PUT(req, { params }) {
//     const body = await req.json();
//     const task = await Task.findByPk(params.id);
//     if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
//     await task.update(body);
//     return NextResponse.json(task);
// }

// export async function DELETE(req, { params }) {
//     const task = await Task.findByPk(params.id);
//     if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
//     await task.destroy();
//     return NextResponse.json({ message: "Deleted" });
// }
