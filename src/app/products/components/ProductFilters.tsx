"use client";

import {
  Search,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

interface ProductFiltersProps {
  initialQ: string;
  initialStatus: string;
}

export function ProductFilters({
  initialQ,
  initialStatus,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Update local state if initialQ changes (e.g. back navigation)
  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  // Reset active action when pending is finished
  useEffect(() => {
    if (!isPending) {
      setActiveAction(null);
    }
  }, [isPending]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveAction("search");
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    params.set("status", "all");

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const setStatus = (status: string) => {
    setActiveAction(status);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {isPending && (
        <div className="fixed top-0 left-0 w-full h-1 z-50 overflow-hidden">
          <div className="h-full bg-primary animate-progress-interstitial" />
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-[800px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า หรือ Serial No..."
              className="pl-10 h-10 rounded-full"
              disabled={isPending}
            />
          </div>
          <Button
            type="submit"
            className="rounded-full h-10 px-6 gap-2 shrink-0"
            disabled={isPending}
          >
            {isPending && activeAction === "search" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            ค้นหา
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={initialStatus === "all" ? "primary" : "outline"}
            size="sm"
            className="gap-2 min-w-[80px] rounded-full h-10"
            onClick={() => setStatus("all")}
            disabled={isPending}
          >
            {isPending && activeAction === "all" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            {isPending && activeAction === "all" ? "กำลังโหลด..." : "ทั้งหมด"}
          </Button>
          <Button
            variant={initialStatus === "active" ? "primary" : "outline"}
            size="sm"
            className="gap-2 rounded-full h-10 px-4"
            onClick={() => setStatus("active")}
            disabled={isPending}
          >
            {isPending && activeAction === "active" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {isPending && activeAction === "active"
              ? "กำลังโหลด..."
              : "อยู่ในประกัน"}
          </Button>
          <Button
            variant={initialStatus === "near_expiry" ? "primary" : "outline"}
            size="sm"
            className="gap-2 rounded-full h-10 px-4"
            onClick={() => setStatus("near_expiry")}
            disabled={isPending}
          >
            {isPending && activeAction === "near_expiry" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
            {isPending && activeAction === "near_expiry"
              ? "กำลังโหลด..."
              : "ใกล้หมดประกัน"}
          </Button>
          <Button
            variant={initialStatus === "expired" ? "primary" : "outline"}
            size="sm"
            className="gap-2 rounded-full h-10 px-4"
            onClick={() => setStatus("expired")}
            disabled={isPending}
          >
            {isPending && activeAction === "expired" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldX className="w-4 h-4" />
            )}
            {isPending && activeAction === "expired"
              ? "กำลังโหลด..."
              : "หมดประกัน"}
          </Button>
        </div>
      </div>
    </div>
  );
}
