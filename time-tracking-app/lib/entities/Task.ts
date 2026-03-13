import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import type { ActiveSession } from "./ActiveSession";
import type { WorkLog } from "./WorkLog";

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ default: "Normal", type: "varchar" }) // "Normal" or "Call"
  type: string;

  @Column({ default: true, type: "boolean" })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany("ActiveSession", (session: ActiveSession) => session.task)
  activeSessions: ActiveSession[];

  @OneToMany("WorkLog", (log: WorkLog) => log.mainTask)
  workLogs: WorkLog[];
}
