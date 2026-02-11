"use server";

import { dataProvider } from "@/db/provider";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DEFAULT_ROLE } from "@/config/permissions";

export async function loginAction(formData: FormData): Promise<void> {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        redirect("/login?error=Please fill all fields");
    }

    try {
        const user = await dataProvider.findUserByUsername(username);

        if (!user) {
            redirect("/login?error=Invalid credentials");
        }

        const isValid = await bcrypt.compare(password, (user as { password: string }).password);
        if (!isValid) {
            redirect("/login?error=Invalid credentials");
        }

        const role = (user as { role?: string }).role || DEFAULT_ROLE;
        await setSession({ id: user.id.toString(), username: (user as { username: string }).username, role });
    } catch (e: unknown) {
        const error = e as Error;
        if (error.message?.includes("NEXT_REDIRECT")) throw e;
        redirect(`/login?error=${encodeURIComponent(error.message || "Something went wrong")}`);
    }

    redirect("/customers");
}

export async function registerAction(formData: FormData): Promise<void> {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;

    if (!username || !password) {
        redirect("/register?error=Please fill all fields");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await dataProvider.createUser({
            username,
            password: hashedPassword,
            email,
        });

        if (!user) {
            throw new Error("Failed to register user");
        }

        await setSession({ id: user.id.toString(), username: (user as { username: string }).username, role: DEFAULT_ROLE });
    } catch (e: unknown) {
        const error = e as Error;
        if (error.message?.includes("NEXT_REDIRECT")) throw e;
        redirect(`/register?error=${encodeURIComponent(error.message || "Username already exists")}`);
    }

    redirect("/customers");
}
