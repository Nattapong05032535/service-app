import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Button } from "./ui/button";
import { ConditionalExportButton } from "./ConditionalExportButton";
import { NavLinks } from "./NavLinks";
import { SyncButton } from "./SyncButton";
import { LogOut, User } from "lucide-react";

export async function Navbar() {
  const session = await getSession();

  return (
    <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all duration-300">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
              Service App
            </span>
          </Link>

          {session && <NavLinks />}
        </div>

        {/* Right Section - User Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              {/* Sync Button */}
              <SyncButton />

              {/* User Info Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600 font-medium">
                  {session.username}
                </span>
              </div>

              <ConditionalExportButton />

              <form action="/api/auth/logout" method="POST">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-600">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
