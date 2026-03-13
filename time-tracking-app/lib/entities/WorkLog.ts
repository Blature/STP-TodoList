import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Employee } from "./Employee";
import type { Task } from "./Task";

@Entity("work_logs")
export class WorkLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  employeeId: string;

  @ManyToOne("Employee", (employee: Employee) => employee.workLogs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employeeId" })
  employee: Employee;

  @Column({ type: "uuid", nullable: true })
  mainTaskId: string | null;

  @ManyToOne("Task", (task: Task) => task.workLogs, { onDelete: "SET NULL" })
  @JoinColumn({ name: "mainTaskId" })
  mainTask: Task | null;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({ type: "int" }) // Total duration in minutes
  durationMinutes: number;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "int", nullable: true })
  totalCalls: number | null;

  @Column({ type: "int", nullable: true })
  answeredCalls: number | null;

  @Column({ type: "jsonb", nullable: true })
  secondaryTasks: { type: string; minutes: number; description?: string | null }[] | null; // JSON array of secondary tasks

  @CreateDateColumn()
  createdAt: Date;
}
