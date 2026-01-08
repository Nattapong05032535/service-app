import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Login</CardTitle>
                    <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <form action={loginAction} className="space-y-4">
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
                    <div className="mt-6 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary hover:underline">
                            Register here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
