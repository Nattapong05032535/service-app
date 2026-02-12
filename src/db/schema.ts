import { sql } from "drizzle-orm";
// Note: Drizzle has specific dialects. For SQL Server it uses 'mssql'.
// But wait, let me check the drizzle-orm documentation for MS SQL.
// Actually, it's mssql-core for MS SQL.

import { mssqlTable, bigint, nvarchar, datetime2, decimal } from "drizzle-orm/mssql-core";

export const users = mssqlTable("users", {
    id: bigint("id", { mode: "number" }).primaryKey().identity(),
    username: nvarchar("username", { length: 255 }).notNull().unique(),
    password: nvarchar("password", { length: 255 }).notNull(), // Should be hashed
    email: nvarchar("email", { length: 255 }),
    createdAt: datetime2("created_at").default(sql`GETDATE()`),
});

export const companies = mssqlTable("companies", {
    id: bigint("id", { mode: "number" }).primaryKey().identity(),
    name: nvarchar("name", { length: 255 }).notNull(),
    nameSecondary: nvarchar("name_secondary", { length: 255 }),
    taxId: nvarchar("tax_id", { length: 255 }),
    contactInfo: nvarchar("contact_info", { length: 1000 }),
    createdBy: bigint("created_by", { mode: "number" }).references(() => users.id),
    createdAt: datetime2("created_at").default(sql`GETDATE()`),
});

export const products = mssqlTable("products", {
    id: bigint("id", { mode: "number" }).primaryKey().identity(),
    companyId: bigint("company_id", { mode: "number" }).references(() => companies.id),
    name: nvarchar("name", { length: 255 }).notNull(),
    serialNumber: nvarchar("serial_number", { length: 255 }).notNull(),
    purchaseDate: datetime2("purchase_date"),
    contactPerson: nvarchar("contact_person", { length: 255 }),
    branch: nvarchar("branch", { length: 255 }),
    createdAt: datetime2("created_at").default(sql`GETDATE()`),
});

export const warranties = mssqlTable("warranties", {
    id: bigint("id", { mode: "number" }).primaryKey().identity(),
    productId: bigint("product_id", { mode: "number" }).references(() => products.id),
    startDate: datetime2("start_date").notNull(),
    endDate: datetime2("end_date").notNull(),
    type: nvarchar("type", { length: 50 }).default("Warranty"), // Warranty or MA
    notes: nvarchar("notes", { length: 1000 }),
    createdAt: datetime2("created_at").default(sql`GETDATE()`),
});

export const services = mssqlTable("services", {
    id: bigint("id", { mode: "number" }).primaryKey().identity(),
    productId: bigint("product_id", { mode: "number" }).references(() => products.id),
    warrantyId: bigint("warranty_id", { mode: "number" }).references(() => warranties.id),
    type: nvarchar("type", { length: 50 }).notNull(), // PM, CM, SERVICE
    entryTime: datetime2("entry_time").notNull(),
    exitTime: datetime2("exit_time").notNull(),
    description: nvarchar("description", { length: 1000 }),
    technician: nvarchar("technician", { length: 255 }),
    status: nvarchar("status", { length: 50 }),
    notes: nvarchar("notes", { length: 1000 }),
    techService: nvarchar("techservice", { length: 2000 }),
    orderCase: nvarchar("order_case", { length: 50 }),
    createdAt: datetime2("created_at").default(sql`GETDATE()`),
});

export const serviceParts = mssqlTable("service_parts", {
    id: bigint("id", { mode: "number" }).primaryKey().identity(),
    orderCase: nvarchar("order_case", { length: 50 }),
    partNo: nvarchar("part_no", { length: 100 }),
    details: nvarchar("details", { length: 500 }),
    qty: decimal("qty", { precision: 10, scale: 2 }),
    createdAt: datetime2("created_at").default(sql`GETDATE()`),
});

export const technicians = mssqlTable("technicians", {
    id: bigint("id", { mode: "number" }).primaryKey().identity(),
    name: nvarchar("name", { length: 255 }).notNull(),
    position: nvarchar("position", { length: 255 }),
    contactNumber: nvarchar("contact_number", { length: 50 }),
    email: nvarchar("email", { length: 255 }),
    skills: nvarchar("skills", { length: 1000 }), 
    status: nvarchar("status", { length: 50 }).default("Active"),
    notes: nvarchar("notes", { length: 1000 }),
    createdAt: datetime2("created_at").default(sql`GETDATE()`),
});
