import Link from "next/link";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Button } from "./ui/button";
import { ConditionalExportButton } from "./ConditionalExportButton";

const ROLE_BADGE_STYLES: Record<string, string> = {
  "Super Admin": "bg-red-100 text-red-700 border-red-300",
  Manager: "bg-blue-100 text-blue-700 border-blue-300",
  User: "bg-gray-100 text-gray-600 border-gray-300",
};

export async function Navbar() {
  const session = await getSession();
  const role = session?.role as string | undefined;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/customers"
            className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Service App
          </Link>
          {session && (
            <div className="hidden md:flex gap-4 text-lg font-medium">
              <Link
                href="/customers"
                className="hover:text-primary transition-colors"
              >
                รายชื่อลูกค้า
              </Link>
              <Link
                href="/products"
                className="hover:text-primary transition-colors"
              >
                รายชื่อสินค้า
              </Link>
              <Link
                href="/search"
                className="hover:text-primary transition-colors"
              >
                ค้นหาใบงาน
              </Link>
              {hasPermission(role, "import", "execute") && (
                <Link
                  href="/import"
                  className="hover:text-primary transition-colors"
                >
                  Import
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground italic">
                {session.username}
              </span>
              {role && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES["User"]}`}
                >
                  {role}
                </span>
              )}
              {hasPermission(role, "export", "execute") && (
                <ConditionalExportButton />
              )}
              <form action="/api/auth/logout" method="POST">
                <Button variant="outline" size="sm">
                  Logout
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
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
