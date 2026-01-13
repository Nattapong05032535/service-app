import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/RegisterForm";
import Link from "next/link";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Register</CardTitle>
                    <p className="text-muted-foreground mt-2">Create a new account to get started</p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <RegisterForm />
                    <div className="mt-6 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Login here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
