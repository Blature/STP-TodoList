import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Employee } from "@/lib/entities/Employee";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const employeeRepo = dataSource.getRepository(Employee);
    const employees = await employeeRepo.find({
      where: { isActive: true },
      order: { name: "ASC" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const employeeRepo = dataSource.getRepository(Employee);
    
    const newEmployee = employeeRepo.create({ name });
    await employeeRepo.save(newEmployee);

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
