"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  LogOut,
  ChevronDown,
  Settings as SettingsIcon,
} from "lucide-react";

interface IUserMenuProps {
  user: {
    username: string;
    role?: string;
    name?: string;
  };
  roleStyles: string;
}

export function UserMenu({ user, roleStyles }: IUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-all border border-transparent hover:border-border group"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <User className="w-4 h-4" />
        </div>
        <div className="hidden sm:flex flex-col items-start px-1">
          <span className="text-sm font-bold leading-tight">
            {user.username}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-popover text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden">
          <div className="p-4 bg-muted/30 border-b">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold leading-none">
                {user.name || user.username}
              </p>
              {user.role && (
                <div className="flex mt-2">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${roleStyles}`}
                  >
                    {user.role}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-1 border-b border-muted">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors group"
            >
              <SettingsIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>ตั้งค่า (Settings)</span>
            </Link>
          </div>
          <div className="p-1">
            <form action="/api/auth/logout" method="POST" className="w-full">
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span>ออกจากระบบ (Logout)</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
