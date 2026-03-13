import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Employee } from "@/lib/entities/Employee";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOneBy({ id });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Soft delete
    employee.isActive = false;
    await employeeRepo.save(employee);

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
