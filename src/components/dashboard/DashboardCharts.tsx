import React from "react";
import WarrantyPieChart from "./WarrantyPieChart";
import ServiceBarChart from "./ServiceBarChart";

interface DashboardChartsProps {
  warrantyStats: {
    active: number;
    nearExpiry: number;
    expired: number;
    noWarranty: number;
  };
  monthlyServiceData: {
    month: string;
    PM: number;
    CM: number;
    SERVICE: number;
  }[];
}

export default function DashboardCharts({
  warrantyStats,
  monthlyServiceData,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            สัดส่วนการรับประกัน
          </h3>
          <p className="text-sm text-slate-500">
            ภาพรวมสถานะการรับประกันสินค้าทั้งหมด
          </p>
        </div>
        <WarrantyPieChart data={warrantyStats} />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            แนวโน้มงานบริการ
          </h3>
          <p className="text-sm text-slate-500">
            สรุปงานบริการรายเดือน (ย้อนหลัง 6 เดือน)
          </p>
        </div>
        <ServiceBarChart data={monthlyServiceData} />
      </div>
    </div>
  );
}
