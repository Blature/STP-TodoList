import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { ActiveSession } from "@/lib/entities/ActiveSession";
import { WorkLog } from "@/lib/entities/WorkLog";
import { appendToSheet } from "@/lib/googleSheets";
import { format } from "date-fns";

type SecondaryTaskInput = {
  type: string;
  minutes: number | string;
  description?: string | null;
};

type SecondaryTask = {
  type: string;
  minutes: number;
  description?: string | null;
};

function formatTime(date: Date) {
  return format(date, "HH:mm:ss");
}

function getDayName(date: Date) {
  return format(date, "EEEE");
}

function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export async function POST(request: Request) {
  try {
    const { employeeId, description, totalCalls, answeredCalls, secondaryTasks } = await request.json();
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    // Explicitly use entity class instead of string to avoid metadata lookup failure
    const sessionRepo = dataSource.getRepository(ActiveSession);
    const workLogRepo = dataSource.getRepository(WorkLog);

    // Find active session with relations
    const activeSession = await sessionRepo.findOne({
      where: { employeeId },
      relations: ["employee", "task"],
    });

    if (!activeSession) {
      return NextResponse.json({ error: "No active session found for this employee" }, { status: 404 });
    }

    const endTime = new Date();
    const startTime = activeSession.startTime;
    const totalMs = endTime.getTime() - startTime.getTime();
    const totalMinutes = Math.max(Math.floor(totalMs / 60000), 1);
    const totalSeconds = Math.max(Math.floor(totalMs / 1000), 1);

    // Calculate secondary tasks duration
    const secTasksRaw: SecondaryTaskInput[] = Array.isArray(secondaryTasks) ? secondaryTasks : [];
    const secTasks: SecondaryTask[] = secTasksRaw.map((task) => ({
      type: task.type,
      minutes: parseInt(String(task.minutes), 10) || 0,
      description: task.description ?? null
    }));
    const secTotalSeconds = secTasks.reduce((sum, t) => sum + (t.minutes * 60), 0);
    const primarySeconds = Math.max(totalSeconds - secTotalSeconds, 0);

    // Create WorkLog
    const workLog = workLogRepo.create();
    workLog.employee = activeSession.employee;
    workLog.mainTask = activeSession.task;
    workLog.startTime = activeSession.startTime;
    workLog.endTime = endTime;
    workLog.durationMinutes = totalMinutes;
    workLog.description = description || activeSession.description;
    // Safe integer parsing helper
    const safeInt = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return null;
      const parsed = parseInt(String(val), 10);
      return Number.isNaN(parsed) ? null : parsed;
    };

    workLog.totalCalls = safeInt(totalCalls);
    workLog.answeredCalls = safeInt(answeredCalls);
    workLog.secondaryTasks = secTasks;

    await workLogRepo.save(workLog);

    // Prepare Google Sheets Data
    const rows = [];
    const dateStr = formatDate(startTime);
    const dayStr = getDayName(startTime);
    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);
    const durationStr = formatDuration(primarySeconds);

    // Main Task Row
    rows.push([
      dateStr,
      dayStr,
      activeSession.task.name,
      startTimeStr,
      endTimeStr,
      durationStr, // Formatted Duration HH:MM:SS
      description || activeSession.description || "",
      totalCalls || "",
      answeredCalls || ""
    ]);

    // Send to Google Sheets
    let sheetSuccess = false;
    try {
      await appendToSheet(activeSession.employee.name, rows);
      sheetSuccess = true;
    } catch (sheetError) {
      console.error("Google Sheets Sync Failed:", sheetError);
    }

    // Delete Active Session
    await sessionRepo.remove(activeSession);

    return NextResponse.json({ 
        message: "Session stopped and logged successfully", 
        workLog,
        sheetStatus: sheetSuccess ? "success" : "failed"
    });
  } catch (error) {
    console.error("Error stopping session:", error);
    return NextResponse.json({ error: "Failed to stop session" }, { status: 500 });
  }
}
