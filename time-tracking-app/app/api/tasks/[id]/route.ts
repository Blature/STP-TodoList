import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Task } from "@/lib/entities/Task";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const taskRepo = dataSource.getRepository(Task);

    const task = await taskRepo.findOneBy({ id });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Soft delete
    task.isActive = false;
    await taskRepo.save(task);

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
