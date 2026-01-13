"use client";

import { useLoading } from "@/context/LoadingContext";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
    const { withLoading } = useLoading();

    async function handleSubmit(formData: FormData) {
        await withLoading(async () => {
            try {
                await loginAction(formData);
            } catch (error) {
                console.error("Login failed:", error);
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input name="username" placeholder="johndoe" required />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input name="password" type="password" placeholder="••••••••" required />
            </div>
            <Button className="w-full mt-4" type="submit">Sign In</Button>
        </form>
    );
}
