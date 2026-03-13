import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { ActiveSession } from "@/lib/entities/ActiveSession";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const sessionRepo = dataSource.getRepository(ActiveSession);

    const activeSessions = await sessionRepo.find({
      relations: ["employee", "task"],
      order: { startTime: "DESC" },
    });

    return NextResponse.json(activeSessions);
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return NextResponse.json({ error: "Failed to fetch active sessions" }, { status: 500 });
  }
}
