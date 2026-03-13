import "reflect-metadata";
import { DataSource } from "typeorm";
import { Employee } from "./entities/Employee";
import { Task } from "./entities/Task";
import { ActiveSession } from "./entities/ActiveSession";
import { WorkLog } from "./entities/WorkLog";

const globalForTypeorm = global as unknown as { typeorm: DataSource };

export const AppDataSource = globalForTypeorm.typeorm || new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "time_tracking",
  synchronize: true, // set to false in production
  logging: false,
  entities: [Employee, Task, ActiveSession, WorkLog],
  subscribers: [],
  migrations: [],
});

if (process.env.NODE_ENV !== "production") globalForTypeorm.typeorm = AppDataSource;

export const getDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    } catch (err) {
      console.error("Error during Data Source initialization", err);
      // Check if it was initialized by another process or race condition
      if (!AppDataSource.isInitialized) {
         throw err;
      }
    }
  }
  return AppDataSource;
};
