"use client";

import React, { useState, useMemo } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { th } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Building2, Clock, TrendingUp, BarChart2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

interface Service {
  id: string;
  orderCase: string;
  type: string;
  status: string;
  entryTime: string;
  productName: string;
  companyName: string;
  techService: string;
}

export default function ServiceCalendarContainer({
  initialServices,
  compact = false,
}: {
  initialServices: Service[];
  compact?: boolean;
}) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  // Group services by date
  const servicesByDate = useMemo(() => {
    const groups: Record<string, Service[]> = {};
    initialServices.forEach((s) => {
      if (s.entryTime) {
        const dateKey = format(parseISO(s.entryTime), "yyyy-MM-dd");
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(s);
      }
    });
    return groups;
  }, [initialServices]);

  // Services for the selected day
  const selectedServices = useMemo(() => {
    if (!selectedDay) return [];
    const dateKey = format(selectedDay, "yyyy-MM-dd");
    return servicesByDate[dateKey] || [];
  }, [selectedDay, servicesByDate]);

  const isCompleted = (status: string) => {
    const s = (status || "").toLowerCase();
    return (
      s.includes("success") ||
      s.includes("เสร็จสิ้น") ||
      s.includes("เรียบร้อย")
    );
  };

  // Monthly statistics for the chart
  const monthlyStats = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const monthlyServices = initialServices.filter((s) => {
      if (!s.entryTime) return false;
      const date = parseISO(s.entryTime);
      return isWithinInterval(date, { start, end });
    });

    const counts = {
      PM: monthlyServices.filter((s) => s.type === "PM").length,
      CM: monthlyServices.filter((s) => s.type === "CM").length,
      SERVICE: monthlyServices.filter((s) => s.type !== "PM" && s.type !== "CM")
        .length,
      COMPLETED: monthlyServices.filter((s) => isCompleted(s.status)).length,
    };

    // Daily distribution data for the entire month
    const daysInMonth = eachDayOfInterval({ start, end });
    const dailyData = daysInMonth.map((day) => {
      const dayServices = initialServices.filter(
        (s) => s.entryTime && isSameDay(parseISO(s.entryTime), day),
      );

      return {
        date: format(day, "d"),
        fullDate: format(day, "d MMM", { locale: th }),
        PM: dayServices.filter((s) => s.type === "PM").length,
        CM: dayServices.filter((s) => s.type === "CM").length,
        SERVICE: dayServices.filter((s) => s.type !== "PM" && s.type !== "CM")
          .length,
        total: dayServices.length,
      };
    });

    return { counts, dailyData, total: monthlyServices.length };
  }, [initialServices, month]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 items-start",
        !compact ? "lg:grid-cols-12" : "w-full",
      )}
    >
      {/* LEFT: Calendar & Daily History */}
      <div className={cn("space-y-6", !compact ? "lg:col-span-7" : "w-full")}>
        <Card className="border-none shadow-premium overflow-hidden bg-white">
          <CardContent className="p-4 flex flex-col md:flex-row gap-8 items-start">
            <style>{`
                        .rdp {
                            --rdp-cell-size: 50px;
                            --rdp-accent-color: #3b82f6;
                            --rdp-background-color: #eff6ff;
                            margin: 0;
                        }
                        .rdp-day_selected {
                            background-color: var(--rdp-accent-color) !important;
                            color: white !important;
                            border-radius: 12px;
                        }
                        .rdp-button:focus-visible {
                            border-radius: 12px;
                        }
                        .day-marker-container {
                            display: flex;
                            gap: 2px;
                            position: absolute;
                            bottom: 4px;
                            left: 50%;
                            transform: translateX(-50%);
                        }
                        .marker-dot {
                            width: 6px;
                            height: 6px;
                            border-radius: 50%;
                        }
                        .marker-dot-pm { background-color: #3b82f6; }
                        .marker-dot-cm { background-color: #f43f5e; }
                        .marker-dot-service { background-color: #10b981; }
                        .marker-dot-success { 
                            background-color: #fbbf24; 
                            box-shadow: 0 0 4px #fbbf24;
                        }
                        @media (max-width: 640px) {
                            .rdp { --rdp-cell-size: 42px; }
                        }
                    `}</style>

            <div className="mx-auto md:mx-0">
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                month={month}
                onMonthChange={setMonth}
                locale={th}
                className="border-none"
                components={{
                  DayButton: (props: DayButtonProps) => {
                    const {
                      day,
                      modifiers,
                      className,
                      style,
                      children,
                      ...rest
                    } = props;
                    const date = day.date;
                    const dateKey = format(date, "yyyy-MM-dd");
                    const dayServices = servicesByDate[dateKey] || [];

                    const hasPM = dayServices.some((s) => s.type === "PM");
                    const hasCM = dayServices.some((s) => s.type === "CM");
                    const hasService = dayServices.some(
                      (s) => s.type !== "PM" && s.type !== "CM",
                    );
                    const hasSuccess = dayServices.some((s) =>
                      isCompleted(s.status),
                    );

                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <button
                          {...rest}
                          className={cn(
                            "rdp-button rdp-day",
                            modifiers.selected && "rdp-day_selected",
                            modifiers.outside && "opacity-20",
                            className,
                          )}
                          style={style}
                        >
                          {children}
                        </button>
                        {date.getMonth() === month.getMonth() &&
                          dayServices.length > 0 && (
                            <div className="day-marker-container pointer-events-none">
                              {hasSuccess ? (
                                <div className="marker-dot marker-dot-success" />
                              ) : (
                                <>
                                  {hasPM && (
                                    <div className="marker-dot marker-dot-pm" />
                                  )}
                                  {hasCM && (
                                    <div className="marker-dot marker-dot-cm" />
                                  )}
                                  {hasService && (
                                    <div className="marker-dot marker-dot-service" />
                                  )}
                                </>
                              )}
                            </div>
                          )}
                      </div>
                    );
                  },
                }}
              />
            </div>

            <div className="flex-1 space-y-6 w-full">
              {/* Selection History - Collapsed here */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {selectedDay
                      ? format(selectedDay, "d MMM yyyy", { locale: th })
                      : "รายการงานรายวัน"}
                  </h4>
                  <Badge variant="secondary" className="text-[10px]">
                    {selectedServices.length} งาน
                  </Badge>
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {selectedServices.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 italic text-xs border border-dashed rounded-lg bg-slate-50/50">
                      ไม่มีรายการงานในวันที่เลือก
                    </div>
                  ) : (
                    selectedServices.map((service) => (
                      <Link key={service.id} href={`/service/${service.id}`}>
                        <div className="p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group flex flex-col gap-1">
                          <div className="flex justify-between items-start">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] h-4",
                                isCompleted(service.status)
                                  ? "border-amber-200 text-amber-600 bg-amber-50"
                                  : service.type === "PM"
                                    ? "border-blue-200 text-blue-600 bg-blue-50"
                                    : service.type === "CM"
                                      ? "border-rose-200 text-rose-600 bg-rose-50"
                                      : "border-emerald-200 text-emerald-600 bg-emerald-50",
                              )}
                            >
                              {isCompleted(service.status)
                                ? "DONE"
                                : service.type}
                            </Badge>
                            <span className="text-[9px] font-mono text-slate-400">
                              {service.orderCase}
                            </span>
                          </div>
                          <h6 className="font-bold text-xs truncate text-slate-800">
                            {service.productName}
                          </h6>
                          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                            <Building2 className="w-2.5 h-2.5" />{" "}
                            {service.companyName}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Monthly Stats & Chart */}
      <div className={cn("space-y-6", !compact ? "lg:col-span-5" : "w-full")}>
        <Card className="border-none shadow-premium bg-white h-full overflow-hidden">
          <CardHeader className="bg-slate-100 border-b border-slate-100 p-4 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                สรุปทั้งเดือน
              </CardTitle>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                {format(month, "MMMM yyyy", { locale: th })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center">
            {monthlyStats.total === 0 ? (
              <div className="h-[245px] flex flex-col items-center justify-center text-slate-400 italic text-sm text-center">
                <TrendingUp className="w-10 h-10 mb-2 opacity-10" />
                ไม่มีข้อมูลงานบริการ
                <br />
                ในเดือนนี้
              </div>
            ) : (
              <>
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-[9px] text-slate-500 uppercase font-bold text-center">
                        Total Jobs
                      </p>
                      <p className="text-lg font-bold text-center text-slate-800">
                        {monthlyStats.total}
                      </p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                      <p className="text-[9px] text-amber-600 uppercase font-bold text-center">
                        Completed
                      </p>
                      <p className="text-lg font-bold text-center text-amber-700">
                        {monthlyStats.counts.COMPLETED}
                      </p>
                    </div>
                  </div>

                  {/* Daily Workload Chart */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h6 className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                        Daily Workload
                      </h6>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-normal text-slate-400"
                      >
                        Monthly View
                      </Badge>
                    </div>
                    <div className="w-full h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyStats.dailyData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 8, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            interval={compact ? 4 : 2}
                          />
                          <RechartsTooltip
                            labelClassName="text-xs font-bold"
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                            cursor={{ fill: "#f1f5f9", opacity: 0.5 }}
                          />
                          <Bar
                            dataKey="PM"
                            stackId="a"
                            fill="#3b82f6"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar dataKey="CM" stackId="a" fill="#f43f5e" />
                          <Bar dataKey="SERVICE" stackId="a" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
