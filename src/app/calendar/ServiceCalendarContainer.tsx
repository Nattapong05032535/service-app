"use client";

import React, { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import {
  Wrench,
  Building2,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

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
}: {
  initialServices: Service[];
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Calendar Card */}
      <Card className="lg:col-span-7 border-none shadow-premium overflow-hidden bg-white">
        <CardContent className="p-6 flex justify-center">
          <style>{`
                        .rdp {
                            --rdp-cell-size: 60px;
                            --rdp-accent-color: #3b82f6;
                            --rdp-background-color: #eff6ff;
                            margin: 0;
                        }
                        .rdp-day_selected {
                            background-color: var(--rdp-accent-color) !important;
                            color: white !important;
                            border-radius: 12px;
                        }
                        .rdp-day:hover:not(.rdp-day_selected) {
                            background-color: var(--rdp-background-color);
                            border-radius: 12px;
                        }
                        .rdp-button:focus-visible {
                            border-radius: 12px;
                        }
                        .has-service-dot::after {
                            content: '';
                            position: absolute;
                            bottom: 8px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 6px;
                            height: 6px;
                            background-color: #3b82f6;
                            border-radius: 50%;
                        }
                        @media (max-width: 640px) {
                            .rdp {
                                --rdp-cell-size: 45px;
                            }
                        }
                    `}</style>
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            month={month}
            onMonthChange={setMonth}
            locale={th}
            className="border-none"
            modifiers={{
              hasService: (date) =>
                !!servicesByDate[format(date, "yyyy-MM-dd")],
            }}
            modifiersClassNames={{
              hasService: "has-service-dot",
            }}
          />
        </CardContent>
      </Card>

      {/* List for selected day */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-bold">
                {selectedDay
                  ? format(selectedDay, "d MMMM yyyy", { locale: th })
                  : "เลือกวันที่"}
              </CardTitle>
            </div>
            <Badge variant="outline" className="bg-white">
              {selectedServices.length} งาน
            </Badge>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-y-auto">
            {selectedServices.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic flex flex-col items-center">
                <Clock className="w-12 h-12 mb-3 opacity-10" />
                <p>ไม่มีรายการงานบริการในวันนี้</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {selectedServices.map((service) => (
                  <Link key={service.id} href={`/service/${service.id}`}>
                    <div className="p-5 hover:bg-slate-50 transition-all group group-hover:pl-6 border-l-4 border-l-transparent hover:border-l-blue-500">
                      <div className="flex justify-between items-start mb-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5",
                            service.type === "PM"
                              ? "bg-blue-100 text-blue-700"
                              : service.type === "CM"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {service.type}
                        </Badge>
                        <span className="text-xs font-mono text-slate-400">
                          {service.orderCase}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                        {service.productName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate">{service.companyName}</span>
                      </div>
                      {service.techService && (
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-wider font-semibold">
                          <Wrench className="w-3 h-3" />
                          ช่าง: {service.techService}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend Card */}
        <Card className="border-none shadow-sm bg-blue-50/30">
          <CardContent className="p-4">
            <h5 className="text-sm font-bold text-slate-600 mb-3">
              คำอธิบายสี (Legend)
            </h5>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-500 italic">PM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-xs text-slate-500 italic">CM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500 italic">Service</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
