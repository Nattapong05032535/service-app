import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "mssql",
    dbCredentials: {
        server: "localhost",
        port: 1435,
        user: "sa",
        password: "Password123!",
        database: "salesforce",
        options: {
            encrypt: true,
            trustServerCertificate: true,
        },
    },
});
