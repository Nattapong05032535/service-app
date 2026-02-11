"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PartRecord {
  id: string;
  partNo: string;
  details: string;
  qty: number;
  orderCase: string;
  createdAt: string;
}

interface GroupedPart {
  partNo: string;
  details: string;
  totalQty: number;
  usageCount: number;
}

export function PartsSummaryTable({ parts }: { parts: PartRecord[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Grouping logic
  const grouped = parts.reduce(
    (acc, part) => {
      const key = part.partNo.trim().toUpperCase() || "UNKNOWN";
      if (!acc[key]) {
        acc[key] = {
          partNo: key,
          details: part.details,
          totalQty: 0,
          usageCount: 0,
        };
      }
      acc[key].totalQty += part.qty;
      acc[key].usageCount += 1;
      return acc;
    },
    {} as Record<string, GroupedPart>,
  );

  const groupedList = Object.values(grouped).sort(
    (a, b) => b.totalQty - a.totalQty,
  );

  const filtered = groupedList.filter(
    (p) =>
      p.partNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.details.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาตามชื่ออะไหล่..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-muted/30">
                <th className="p-3 font-medium">รหัสอะไหล่ (Part No.)</th>
                <th className="p-3 font-medium">รายละเอียดล่าสุด</th>
                <th className="p-3 font-medium text-center">
                  ถูกใช้ไป (ครั้ง)
                </th>
                <th className="p-3 font-medium text-right text-orange-600">
                  จำนวนรวม (Total Qty)
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr
                    key={item.partNo}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs font-bold uppercase tracking-tight">
                      {item.partNo}
                    </td>
                    <td className="p-3 text-muted-foreground truncate max-w-[300px]">
                      {item.details || "-"}
                    </td>
                    <td className="p-3 text-center text-muted-foreground">
                      {item.usageCount.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-black text-lg text-orange-600">
                      {item.totalQty.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground italic"
                  >
                    ไม่พบข้อมูลอะไหล่
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm text-muted-foreground">
            แสดง {startIndex + 1} ถึง{" "}
            {Math.min(startIndex + itemsPerPage, filtered.length)} จาก{" "}
            {filtered.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> ก่อนหน้า
            </Button>
            <span className="text-sm font-medium px-4">
              หน้า {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              ถัดไป <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
