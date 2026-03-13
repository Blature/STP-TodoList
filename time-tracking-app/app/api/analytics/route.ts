import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { WorkLog } from "@/lib/entities/WorkLog";
import { Between, FindOptionsWhere } from "typeorm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dataSource = await getDataSource();
    const workLogRepo = dataSource.getRepository(WorkLog);

    const where: FindOptionsWhere<WorkLog> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (startDate && endDate) {
      where.startTime = Between(new Date(startDate), new Date(endDate));
    } else {
      // Default to current month if not specified?
      // Or just return last 30 days?
      // For now, if no date provided, return all (or limit to recent)
      // Let's limit to recent 1000 logs to avoid huge payload
    }

    const workLogs = await workLogRepo.find({
      where,
      relations: ["employee", "mainTask"],
      order: { startTime: "DESC" },
      take: 1000,
    });

    return NextResponse.json(workLogs);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
