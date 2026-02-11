import Link from "next/link";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Button } from "./ui/button";
import { ConditionalExportButton } from "./ConditionalExportButton";
import { NavbarLinks } from "./NavbarLinks";
import { UserMenu } from "./UserMenu";

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
            <NavbarLinks
              items={[
                {
                  href: "/dashboard",
                  label: "Dashboard",
                  visible: hasPermission(role, "dashboard", "read"),
                },
                {
                  href: "/customers",
                  label: "รายชื่อลูกค้า",
                  visible: true,
                },
                {
                  href: "/products",
                  label: "รายชื่อสินค้า",
                  visible: true,
                },
                {
                  href: "/search",
                  label: "ค้นหาใบงาน",
                  visible: true,
                },
                {
                  href: "/import",
                  label: "Import",
                  visible: hasPermission(role, "import", "execute"),
                },
                {
                  href: "/parts",
                  label: "อะไหล่",
                  visible: hasPermission(role, "dashboard", "read"),
                },
              ]}
            />
          )}
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              {hasPermission(role, "export", "execute") && (
                <ConditionalExportButton />
              )}
              <UserMenu
                user={{
                  username: session.username,
                  role: role,
                  name: session.name,
                }}
                roleStyles={
                  ROLE_BADGE_STYLES[role || "User"] || ROLE_BADGE_STYLES["User"]
                }
              />
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
