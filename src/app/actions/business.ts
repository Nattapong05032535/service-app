"use server";

import { dataProvider } from "@/db/provider";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function createOrUpdateCompany(formData: FormData): Promise<void> {
    const session = await getSession();
    if (!session) redirect("/login");

    const id = formData.get("id");
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        if (e.message?.includes("NEXT_REDIRECT")) throw e;
        throw new Error(e.message || "Failed to save company");
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
}

export async function createProduct(formData: FormData): Promise<void> {
    const companyId = formData.get("companyId");
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
            pmCount,
            notes: notes || "",
        }) as unknown as { id: string };

        const warrantyId = result.id;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        throw new Error(e.message || "Failed to create warranty");
    }

    revalidatePath(`/product/${productId}`);
}

export async function createService(formData: FormData): Promise<void> {
    const warrantyId = formData.get("warrantyId");
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        throw new Error(e.message || "Failed to create service");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = await dataProvider.getWarrantyById(warrantyId) as any;
    if (w) {
        revalidatePath(`/product/${w.productId}`);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        throw new Error(e.message || "Failed to update service");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = await dataProvider.getWarrantyById(warrantyId) as any;
    if (w) {
        revalidatePath(`/product/${w.productId}`);
    }
}
