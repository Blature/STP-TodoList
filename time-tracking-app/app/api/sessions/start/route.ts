import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { ActiveSession } from "@/lib/entities/ActiveSession";
import { Employee } from "@/lib/entities/Employee";
import { Task } from "@/lib/entities/Task";

export async function POST(request: Request) {
  try {
    const { employeeId, taskId, description } = await request.json();
    
    if (!employeeId || !taskId) {
      return NextResponse.json({ error: "Employee and Task are required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const sessionRepo = dataSource.getRepository(ActiveSession);

    // Check if employee already has an active session
    const existingSession = await sessionRepo.findOne({
      where: { employeeId },
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "Employee already has an active session. Please finish it first." },
        { status: 400 }
      );
    }

    const newSession = sessionRepo.create({
      employeeId,
      taskId,
      description,
      startTime: new Date(),
    });

    await sessionRepo.save(newSession);

    // Fetch complete relation objects to return
    const sessionWithRelations = await sessionRepo.findOne({
      where: { id: newSession.id },
      relations: ["employee", "task"],
    });

    return NextResponse.json(sessionWithRelations, { status: 201 });
  } catch (error) {
    console.error("Error starting session:", error);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}
