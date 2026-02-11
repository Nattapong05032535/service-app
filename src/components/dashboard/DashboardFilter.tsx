"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [company, setCompany] = useState(searchParams.get("company") || "");
  const [startDate, setStartDate] = useState(searchParams.get("from") || "");
  const [endDate, setEndDate] = useState(searchParams.get("to") || "");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (company) params.set("company", company);
    if (startDate) params.set("from", startDate);
    if (endDate) params.set("to", endDate);

    // Replace current URL with new params
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleReset = () => {
    setCompany("");
    setStartDate("");
    setEndDate("");
    router.push("/dashboard");
  };

  return (
    <div className="p-4 rounded-lg  mb-6 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4 bg-gray-0">
      {/* Company Search */}
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">ค้นหาตามชื่อบริษัท</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ระบุชื่อบริษัท..."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Date Range */}
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">ช่วงเวลา (วันที่เริ่ม)</label>
        <div className="relative">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">ถึงวันที่</label>
        <div className="relative">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          ค้นหา
        </Button>
        {(company || startDate || endDate) && (
          <Button variant="outline" onClick={handleReset}>
            ล้างตัวกรอง
          </Button>
        )}
      </div>
    </div>
  );
}
