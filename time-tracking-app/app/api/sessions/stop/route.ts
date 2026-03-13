import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { ActiveSession } from "@/lib/entities/ActiveSession";
import { WorkLog } from "@/lib/entities/WorkLog";
import { appendToSheet } from "@/lib/googleSheets";
import { format } from "date-fns";

function formatTime(date: Date) {
  return format(date, "HH:mm:ss");
}

function getDayName(date: Date) {
  return format(date, "EEEE");
}

function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
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

    // Calculate secondary tasks duration
    const secTasks: any[] = Array.isArray(secondaryTasks) ? secondaryTasks : [];
    const secTotal = secTasks.reduce((sum, t) => sum + (parseInt(t.minutes) || 0), 0);
    const primaryMinutes = Math.max(totalMinutes - secTotal, 1);

    // Create WorkLog
    const workLog = workLogRepo.create();
    workLog.employee = activeSession.employee;
    workLog.mainTask = activeSession.task;
    workLog.startTime = activeSession.startTime;
    workLog.endTime = endTime;
    workLog.durationMinutes = totalMinutes;
    workLog.description = description || activeSession.description;
    // Safe integer parsing helper
    const safeInt = (val: any) => {
      const parsed = parseInt(val);
      return isNaN(parsed) ? null : parsed;
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
    const durationStr = formatDuration(primaryMinutes);

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

    // Secondary Tasks Rows
    secTasks.forEach((t) => {
      rows.push([
        dateStr,
        dayStr,
        t.type,
        "", // Start Time (unknown for secondary)
        "", // End Time (unknown for secondary)
        formatDuration(t.minutes), // Formatted Duration for secondary
        t.description || "",
        "", // Total Calls (N/A for secondary usually)
        ""  // Answered Calls (N/A for secondary usually)
      ]);
    });

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
