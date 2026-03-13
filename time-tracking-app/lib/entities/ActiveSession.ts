import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Employee } from "./Employee";
import type { Task } from "./Task";

@Entity("active_sessions")
export class ActiveSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  employeeId: string;

  @ManyToOne("Employee", (employee: Employee) => employee.activeSessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employeeId" })
  employee: Employee;

  @Column({ type: "uuid" })
  taskId: string;

  @ManyToOne("Task", (task: Task) => task.activeSessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskId" })
  task: Task;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "int", nullable: true })
  totalCalls: number | null;

  @Column({ type: "int", nullable: true })
  answeredCalls: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
