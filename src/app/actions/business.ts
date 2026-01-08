"use server";

import { dataProvider } from "@/db/provider";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function createOrUpdateCompany(formData: FormData): Promise<void> {
    const session = await getSession();
    if (!session) redirect("/login");

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const nameSecondary = formData.get("nameSecondary") as string;
    const taxId = formData.get("taxId") as string;
    const contactInfo = formData.get("contactInfo") as string;

    try {
        if (id) {
            await dataProvider.updateCompany(id, {
                name,
                nameSecondary,
                taxId,
                contactInfo,
            });
        } else {
            await dataProvider.createCompany({
                name,
                nameSecondary,
                taxId,
                contactInfo,
                createdBy: session.id,
            });
        }
    } catch (e: unknown) {
        if (e instanceof Error && e.message?.includes("NEXT_REDIRECT")) throw e;
        throw new Error(e instanceof Error ? e.message : "Failed to save company");
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
}

export async function createProduct(formData: FormData): Promise<void> {
    const companyId = formData.get("companyId") as string;
    const name = formData.get("name") as string;
    const serialNumber = formData.get("serialNumber") as string;
    const purchaseDate = formData.get("purchaseDate") as string;
    const contactPerson = formData.get("contactPerson") as string;
    const branch = formData.get("branch") as string;

    await dataProvider.createProduct({
        companyId,
        name,
        serialNumber,
        purchaseDate,
        contactPerson,
        branch,
    });

    revalidatePath(`/company/${companyId}`);
}

export async function createWarranty(formData: FormData): Promise<void> {
    const productId = formData.get("productId") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const type = formData.get("type") as string;
    const pmCountStr = formData.get("pmCount") as string;
    const pmIntervalStr = formData.get("pmInterval") as string;
    const notes = formData.get("notes") as string;

    if (!startDateStr || !endDateStr) {
        throw new Error("Start and end dates are required");
    }

    try {
        const pmCount = parseInt(pmCountStr || "0");
        const pmInterval = parseInt(pmIntervalStr || "0");

        const result = await dataProvider.createWarranty({
            productId,
            startDate: startDateStr,
            endDate: endDateStr,
            type,
            // @ts-expect-error - pmCount might not be in the schema but used for generation
            pmCount,
            notes: notes || "",
        });

        const warrantyId = (result as { id: string | number }).id;

        // Auto-generate PM schedules
        if (pmCount > 0 && pmInterval > 0) {
            const startDate = new Date(startDateStr);
            for (let i = 1; i <= pmCount; i++) {
                const pmDate = new Date(startDate);
                pmDate.setMonth(pmDate.getMonth() + (i * pmInterval));

                // Set time to morning (e.g., 09:00)
                pmDate.setHours(9, 0, 0, 0);
                const entryTime = pmDate.toISOString().slice(0, 16);

                // Set exit time to afternoon (e.g., 12:00)
                pmDate.setHours(12, 0, 0, 0);
                const exitTime = pmDate.toISOString().slice(0, 16);

                await dataProvider.createService({
                    warrantyId,
                    type: "PM",
                    entryTime,
                    exitTime,
                    description: `แผนงานบำรุงรักษาเชิงป้องกัน (PM) ครั้งที่ ${i}`,
                });
            }
        }
    } catch (e: unknown) {
        throw new Error(e instanceof Error ? e.message : "Failed to create warranty");
    }

    revalidatePath(`/product/${productId}`);
}

export async function createService(formData: FormData): Promise<void> {
    const warrantyId = formData.get("warrantyId") as string;
    const type = formData.get("type") as string;
    const entryTime = formData.get("entryTime") as string;
    const exitTime = formData.get("exitTime") as string;
    const description = formData.get("description") as string;

    try {
        await dataProvider.createService({
            warrantyId,
            type,
            entryTime,
            exitTime,
            description,
        });
    } catch (e: unknown) {
        throw new Error(e instanceof Error ? e.message : "Failed to create service");
    }

    const w = await dataProvider.getWarrantyById(warrantyId);
    if (w) {
        revalidatePath(`/product/${(w as { productId: string | number }).productId}`);
    }
}

export async function updateServiceAction(formData: FormData): Promise<void> {
    const id = formData.get("id") as string;
    const entryTime = formData.get("entryTime") as string;
    const exitTime = formData.get("exitTime") as string;
    const description = formData.get("description") as string;
    const technician = formData.get("technician") as string;
    const notes = formData.get("notes") as string;
    const status = formData.get("status") as string;
    const warrantyId = formData.get("warrantyId") as string;

    try {
        await dataProvider.updateService(id, {
            entryTime,
            exitTime,
            description,
            technician,
            notes,
            status,
        });
    } catch (e: unknown) {
        throw new Error(e instanceof Error ? e.message : "Failed to update service");
    }

    const w = await dataProvider.getWarrantyById(warrantyId);
    if (w) {
        revalidatePath(`/product/${(w as { productId: string | number }).productId}`);
    }
}

export async function importDataAction(rows: any[]) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    let successCount = 0;

    const parseThaiDate = (dateVal: unknown) => {
        if (!dateVal) return null;
        
        // If it's already a date object
        if (dateVal instanceof Date) return dateVal;
        
        // If it's a number (Excel date serial)
        if (typeof dateVal === 'number') {
            // Excel serial date 1 = 1900-01-01
            // JS date starts from 1970-01-01
            // There's a 25569 day difference
            return new Date((dateVal - 25569) * 86400 * 1000);
        }

        const dateStr = String(dateVal).trim();
        if (!dateStr || dateStr === "-") return null;

        // Try MM/DD/YYYY (BE)
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const m = parseInt(parts[0]);
            const d = parseInt(parts[1]);
            const y = parseInt(parts[2]);
            if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
                // BE to CE: y - 543
                // If y is already small (like 25), assume it's short year or already CE
                const year = y > 2400 ? y - 543 : y;
                return new Date(year, m - 1, d);
            }
        }
        
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;
        
        return null;
    };

    for (const row of rows) {
        try {
            const companyName = row["ชื่อลูกค้า"] || "-";
            const productName = row["สินค้า"] || "-";
            const serialNumber = String(row["เลขที่ซีเรียลสินค้า"] || "-");
            const contactPerson = row["ผู้ติดต่อ"] || "-";
            const purchaseDate = parseThaiDate(row["วันที่ซื้อ"]);
            const warrantyEndDate = parseThaiDate(row["วันที่สิ้นสุดการรับประกัน"]);
            const pmStatus = row["สถานะ PM"];
            const warrantyStatus = row["สถานะการรับประกัน"];

            // 1. Find or Create Company
            let company = await dataProvider.findCompanyByName(companyName);
            if (!company) {
                const newCompany = await dataProvider.createCompany({
                    name: companyName,
                    createdBy: session.id
                });
                company = newCompany as any;
            }

            // 2. Create Product (Always create duplicate as requested)
            const product = await dataProvider.createProduct({
                companyId: String(company!.id),
                name: productName,
                serialNumber: serialNumber,
                contactPerson: contactPerson,
                purchaseDate: purchaseDate ? purchaseDate.toISOString() : null,
                branch: "-"
            });
            const productId = (product as any).id;

            // 3. Create Warranty if End Date exists
            if (warrantyEndDate && warrantyStatus) {
                await dataProvider.createWarranty({
                    productId: String(productId),
                    startDate: purchaseDate ? purchaseDate.toISOString() : new Date().toISOString(),
                    endDate: warrantyEndDate.toISOString(),
                    type: "Warranty",
                    notes: `data import${pmStatus ? ` | PM Status: ${pmStatus}` : ""}`
                });
            }

            successCount++;
        } catch (error) {
            console.error("Failed to import row:", row, error);
        }
    }

    revalidatePath("/dashboard");
    revalidatePath("/products");
    return { success: true, count: successCount };
}
