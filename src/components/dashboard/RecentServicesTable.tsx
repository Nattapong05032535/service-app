"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentService {
  id: string;
  type: string;
  status: string;
  entryTime: string;
  exitTime: string;
  description: string;
  technician: string;
  orderCase: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  เสร็จสิ้น: {
    label: "เสร็จสิ้น",
    className: "bg-emerald-100 text-emerald-700",
  },
  ยกเลิก: { label: "ยกเลิก", className: "bg-red-100 text-red-700" },
  รอดำเนินการ: {
    label: "รอดำเนินการ",
    className: "bg-amber-100 text-amber-700",
  },
};

export function RecentServicesTable({
  services,
}: {
  services: RecentService[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = services.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (services.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        ยังไม่มีใบงาน Service
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Order Case</th>
              <th className="pb-3 font-medium">ประเภท</th>
              <th className="pb-3 font-medium">สถานะ</th>
              <th className="pb-3 font-medium hidden md:table-cell">
                วันเข้างาน
              </th>
              <th className="pb-3 font-medium hidden lg:table-cell">
                ช่างเทคนิค
              </th>
              <th className="pb-3 font-medium hidden lg:table-cell">
                รายละเอียด
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedServices.map((svc) => {
              const statusConfig =
                STATUS_CONFIG[svc.status] || STATUS_CONFIG["รอดำเนินการ"];
              return (
                <tr
                  key={svc.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 font-mono text-xs">
                    {svc.orderCase || "-"}
                  </td>
                  <td className="py-3">
                    <Badge
                      className={
                        svc.type === "CM" ||
                        svc.type === "Corrective Maintenance"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {svc.type || "-"}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                  </td>
                  <td className="py-3 hidden md:table-cell text-muted-foreground">
                    {svc.entryTime ? formatDate(svc.entryTime) : "-"}
                  </td>
                  <td className="py-3 hidden lg:table-cell text-muted-foreground">
                    {svc.technician || "-"}
                  </td>
                  <td className="py-3 hidden lg:table-cell text-muted-foreground max-w-[200px] truncate">
                    {svc.description || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm text-muted-foreground">
            แสดง {startIndex + 1} ถึง{" "}
            {Math.min(startIndex + itemsPerPage, services.length)} จากทั้งหมด{" "}
            {services.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </Button>
            <span className="text-sm font-medium">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
