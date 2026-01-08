import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Button } from "./ui/button";

export async function Navbar() {
    const session = await getSession();

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Salesforce Mock
                    </Link>
                    {session && (
                        <div className="hidden md:flex gap-4 text-sm font-medium">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground italic">Welcome, {session.username}</span>
                            <form action="/api/auth/logout" method="POST">
                                <Button variant="outline" size="sm">Logout</Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Register</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
