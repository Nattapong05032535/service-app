"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface WarrantyPieChartProps {
  data: {
    active: number;
    nearExpiry: number;
    expired: number;
    noWarranty: number;
  };
}

export default function WarrantyPieChart({ data }: WarrantyPieChartProps) {
  const chartData = [
    { name: "ยังมีการรับประกัน", value: data.active, color: "#10b981" },
    { name: "ใกล้หมดประกัน", value: data.nearExpiry, color: "#f59e0b" },
    { name: "หมดประกันแล้ว", value: data.expired, color: "#ef4444" },
    { name: "ไม่มีการรับประกัน", value: data.noWarranty, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
