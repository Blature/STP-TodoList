import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import type { ActiveSession } from "./ActiveSession";
import type { WorkLog } from "./WorkLog";

@Entity("employees")
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ default: true, type: "boolean" })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany("ActiveSession", (session: ActiveSession) => session.employee)
  activeSessions: ActiveSession[];

  @OneToMany("WorkLog", (log: WorkLog) => log.employee)
  workLogs: WorkLog[];
}
