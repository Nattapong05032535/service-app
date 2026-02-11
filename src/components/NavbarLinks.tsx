"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  visible: boolean;
}

export function NavbarLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex gap-6 text-sm font-medium">
      {items.map((item) => {
        if (!item.visible) return null;

        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-all relative py-1 hover:text-primary",
              isActive ? "text-primary font-bold" : "text-muted-foreground",
            )}
          >
            {item.label}
            {isActive && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full transition-all" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
