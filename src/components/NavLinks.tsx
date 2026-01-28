"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  // Calendar,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const navItems = [
  {
    href: "/dashboard",
    label: "แดชบอร์ด",
    icon: LayoutDashboard,
  },
  // {
  //   href: "/calendar",
  //   label: "ปฏิทิน",
  //   icon: Calendar,
  // },
  {
    href: "/customers",
    label: "รายชื่อลูกค้า",
    icon: Users,
  },
  {
    href: "/products",
    label: "รายชื่อสินค้า",
    icon: Package,
  },
  {
    href: "/services",
    label: "ประวัติบริการ",
    icon: Wrench,
  },
];

export function NavLinks() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-blue-50 hover:text-blue-600",
                isActive
                  ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 bg-white border-b shadow-lg z-50 md:hidden",
          "transform transition-all duration-300 ease-in-out",
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="container mx-auto py-4 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                  isActive
                    ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
