"use server";

import { revalidatePath } from "next/cache";
import { dataProvider } from "@/db/provider";
import { z } from "zod";
import { TNewTechnician } from "@/types/database";

// Validations
const technicianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  contactNumber: z.string().optional().nullable(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  notes: z.string().optional().nullable(),
});

type TTechnicianFormData = z.infer<typeof technicianSchema>;

/**
 * Updates the user's profile information.
 */
export async function updateUserProfileAction(id: string | number, data: { name: string }) {
  try {
    if (!data.name) throw new Error("Name is required");
    
    await dataProvider.updateUser(id, { username: data.name });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Adds a new technician.
 */
export async function addTechnicianAction(data: TTechnicianFormData) {
  try {
    const validated = technicianSchema.parse(data);
    await dataProvider.createTechnician(validated as TNewTechnician);
    revalidatePath("/settings");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Failed to add technician:", error);
    return { success: false, error: "Failed to add technician" };
  }
}

/**
 * Updates an existing technician.
 */
export async function updateTechnicianAction(id: string | number, data: Partial<TTechnicianFormData>) {
  try {
    // For partial update, we logic check what's passed
    await dataProvider.updateTechnician(id, data as Partial<TNewTechnician>);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update technician:", error);
    return { success: false, error: "Failed to update technician" };
  }
}

/**
 * Deletes a technician.
 */
export async function deleteTechnicianAction(id: string | number) {
  try {
    await dataProvider.deleteTechnician(id);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete technician:", error);
    return { success: false, error: "Failed to delete technician" };
  }
}
