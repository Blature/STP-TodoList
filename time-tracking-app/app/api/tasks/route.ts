import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Task } from "@/lib/entities/Task";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const taskRepo = dataSource.getRepository(Task);
    const tasks = await taskRepo.find({
      where: { isActive: true },
      order: { name: "ASC" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, type } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const taskRepo = dataSource.getRepository(Task);
    
    const newTask = taskRepo.create({ 
      name, 
      type: type || "Normal" 
    });
    await taskRepo.save(newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
