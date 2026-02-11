"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PartRecord {
  id: string;
  partNo: string;
  details: string;
  qty: number;
  orderCase: string;
  createdAt: string;
}

export function PartsTable({ parts }: { parts: PartRecord[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 15;

  const filteredParts = parts.filter(
    (p) =>
      p.partNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderCase.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParts = filteredParts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-start gap-2">
        <div className="relative max-w-xl w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาตามรหัสอะไหล่, รายละเอียด หรือเลขที่ใบงาน..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        {/* <Button
          variant="outline"
          className="bg-blue-600 text-white"
          onClick={(e) => {
            setSearchQuery("");
            setCurrentPage(1);
          }}
        >
          <Search className="h-4 w-4" />
        </Button> */}
      </div>

      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-muted/30">
                <th className="p-3 font-medium">รหัสอะไหล่ (Part No.)</th>
                <th className="p-3 font-medium">รายละเอียด</th>
                <th className="p-3 font-medium text-center">จำนวน (Qty)</th>
                <th className="p-3 font-medium text-right">
                  ใบงาน (Order Case)
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedParts.length > 0 ? (
                paginatedParts.map((part) => (
                  <tr
                    key={part.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs font-semibold">
                      {part.partNo || "-"}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {part.details || "-"}
                    </td>
                    <td className="p-3 text-center font-bold text-orange-600">
                      {part.qty.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {part.orderCase ? (
                        <Link
                          href={`/search?q=${part.orderCase}`}
                          className="font-mono text-xs text-primary font-bold hover:underline hover:text-primary/80 transition-colors"
                        >
                          {part.orderCase}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground italic"
                  >
                    ไม่พบข้อมูลอะไหล่ที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm text-muted-foreground">
            แสดง {startIndex + 1} ถึง{" "}
            {Math.min(startIndex + itemsPerPage, filteredParts.length)}{" "}
            จากทั้งหมด {filteredParts.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              ก่อนหน้า
            </Button>
            <span className="text-sm font-medium px-4">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              ถัดไป
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
