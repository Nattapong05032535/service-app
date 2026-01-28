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
            Warranty Distribution
          </h3>
          <p className="text-sm text-slate-500">
            Overview of current product warranty statuses
          </p>
        </div>
        <WarrantyPieChart data={warrantyStats} />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Service Activity Trends
          </h3>
          <p className="text-sm text-slate-500">
            Monthly breakdown of service jobs (last 6 months)
          </p>
        </div>
        <ServiceBarChart data={monthlyServiceData} />
      </div>
    </div>
  );
}
