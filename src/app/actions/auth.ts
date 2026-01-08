"use server";

import { dataProvider } from "@/db/provider";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";
import { redirect } from "next/navigation";

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

        const isValid = await bcrypt.compare(password, (user as any).password);
        if (!isValid) {
            redirect("/login?error=Invalid credentials");
        }

        await setSession({ id: user.id.toString(), username: (user as any).username });
    } catch (e: any) {
        if (e.message?.includes("NEXT_REDIRECT")) throw e;
        redirect(`/login?error=${encodeURIComponent(e.message || "Something went wrong")}`);
    }

    redirect("/dashboard");
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

        await setSession({ id: user.id.toString(), username: (user as any).username });
    } catch (e: any) {
        if (e.message?.includes("NEXT_REDIRECT")) throw e;
        redirect(`/register?error=${encodeURIComponent(e.message || "Username already exists")}`);
    }

    redirect("/dashboard");
}
