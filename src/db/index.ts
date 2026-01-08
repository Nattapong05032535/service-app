import { drizzle } from "drizzle-orm/node-mssql";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "sqlserver://sa:Password123!@localhost:1435/salesforce?encrypt=true&trustServerCertificate=true";

export const db = drizzle(connectionString, { schema });
