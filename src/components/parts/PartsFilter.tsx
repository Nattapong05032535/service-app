"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FilterX } from "lucide-react";

export function PartsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [company, setCompany] = useState(searchParams.get("company") || "");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (company) params.set("company", company);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/parts?${params.toString()}`);
  };

  const handleReset = () => {
    setCompany("");
    setFrom("");
    setTo("");
    router.push("/parts");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-x-4 gap-y-4 p-4 mb-6">
      {/* Company Search */}
      <div className="flex-1 space-y-1.5">
        <label className="text-sm font-bold text-foreground/80">
          ค้นหาตามชื่อบริษัท
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ระบุชื่อบริษัท..."
            className="pl-9 h-11 rounded-xl border-border/50 bg-background shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
      </div>

      {/* Date Start */}
      <div className="w-full md:w-[280px] space-y-1.5">
        <label className="text-sm font-bold text-foreground/80">
          ช่วงเวลา (วันที่เริ่ม)
        </label>
        <Input
          type="date"
          className="h-11 rounded-xl border-border/50 bg-background shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>

      {/* Date End */}
      <div className="w-full md:w-[280px] space-y-1.5">
        <label className="text-sm font-bold text-foreground/80">
          ถึงวันที่
        </label>
        <Input
          type="date"
          className="h-11 rounded-xl border-border/50 bg-background shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSearch}
          className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Search className="w-4 h-4 mr-2" />
          ค้นหา
        </Button>
        {(company || from || to) && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="h-11 w-11 p-0 rounded-xl border-border/50 shadow-sm hover:bg-muted"
          >
            <FilterX className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
