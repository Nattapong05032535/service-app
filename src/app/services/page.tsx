import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Search,
  Wrench,
  ChevronRight,
  Calendar,
  Building2,
  Package,
  History,
  CheckCircle2,
  Clock,
} from "lucide-react";
import ServiceCalendarContainer from "@/app/calendar/ServiceCalendarContainer";
import { cn } from "@/lib/utils";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { q = "", type = "all" } = await searchParams;

  // 1. Fetch ALL services for the calendar overview
  const { data: calendarServices } = await dataProvider.getAllServices({
    pageSize: 1000,
  });

  // 2. Fetch FILTERED services for the list below
  const { data: services } = await dataProvider.getAllServices({
    query: q,
    type: type,
    pageSize: 50,
  });

  const isCompleted = (status: string) => {
    const s = (status || "").toLowerCase();
    return (
      s.includes("success") ||
      s.includes("เสร็จสิ้น") ||
      s.includes("เรียบร้อย")
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-100 to-white">
      {/* Header Section */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 text-white py-8 px-6 md:px-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
                <History className="w-9 h-9" />
                ประวัติงานบริการ
              </h1>
              <p className="text-slate-300 mt-2 text-base">
                ดูแผนงานปฏิทินและตรวจสอบประวัติงานบริการทั้งหมด
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span>
                อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-6 md:px-10 space-y-8">
        {/* Calendar Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              ปฏิทินแผนงานและประวัติ
            </h2>
          </div>
          <ServiceCalendarContainer initialServices={calendarServices} />
        </section>

        {/* Divider */}
        <div className="border-t-2 border-slate-200 my-6" />

        {/* Service List Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                รายการงานบริการทั้งหมด
              </h2>
              <Badge
                variant="secondary"
                className="text-xs font-bold bg-slate-200 text-slate-600"
              >
                {services.length} รายการ
              </Badge>
            </div>
          </div>

          {/* Search & Filter Card */}
          <Card className="p-5 shadow-md border-none bg-white">
            <div className="flex flex-col lg:flex-row gap-4">
              <form
                action="/services"
                method="GET"
                className="flex-1 flex gap-3"
              >
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <Input
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหาเลขที่บิล, ชื่อสินค้า, หรือชื่อลูกค้า..."
                    className="pl-12 h-12 text-base bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-xl px-8 h-12 font-semibold"
                >
                  ค้นหา
                </Button>
                <input type="hidden" name="type" value={type} />
              </form>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500 font-medium mr-2">
                  ตัวกรอง:
                </span>
                <Link href={`/services?type=all&q=${q}`}>
                  <Button
                    variant={type === "all" ? "primary" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-full font-semibold transition-all",
                      type === "all" && "bg-slate-800 hover:bg-slate-700",
                    )}
                  >
                    ทั้งหมด
                  </Button>
                </Link>
                <Link href={`/services?type=PM&q=${q}`}>
                  <Button
                    variant={type === "PM" ? "primary" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-full font-semibold transition-all",
                      type === "PM" && "bg-blue-600 hover:bg-blue-700",
                    )}
                  >
                    งาน PM
                  </Button>
                </Link>
                <Link href={`/services?type=CM&q=${q}`}>
                  <Button
                    variant={type === "CM" ? "primary" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-full font-semibold transition-all",
                      type === "CM" && "bg-rose-600 hover:bg-rose-700",
                    )}
                  >
                    งาน CM
                  </Button>
                </Link>
                <Link href={`/services?type=SERVICE&q=${q}`}>
                  <Button
                    variant={type === "SERVICE" ? "primary" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-full font-semibold transition-all",
                      type === "SERVICE" &&
                        "bg-emerald-600 hover:bg-emerald-700",
                    )}
                  >
                    บริการทั่วไป
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Service List */}
          {services.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-200 py-16 bg-white">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-slate-100 rounded-full mb-4">
                  <Wrench className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">
                  ไม่พบรายการงานบริการ
                </h3>
                <p className="text-slate-500 max-w-sm mt-2">
                  ลองเปลี่ยนคำค้นหาหรือตัวกรองประเภทงาน
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {services.map((service) => (
                <Link key={service.id} href={`/service/${service.id}`}>
                  <Card
                    className={cn(
                      "hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden border-l-4 bg-white",
                      isCompleted(service.status)
                        ? "border-l-emerald-500 hover:border-l-emerald-600"
                        : service.type === "PM"
                          ? "border-l-blue-500 hover:border-l-blue-600"
                          : service.type === "CM"
                            ? "border-l-rose-500 hover:border-l-rose-600"
                            : "border-l-orange-500 hover:border-l-orange-600",
                    )}
                  >
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-5 flex-1">
                        <div
                          className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                            isCompleted(service.status)
                              ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                              : service.type === "PM"
                                ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                                : service.type === "CM"
                                  ? "bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
                                  : "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
                          )}
                        >
                          {isCompleted(service.status) ? (
                            <CheckCircle2 className="w-7 h-7" />
                          ) : (
                            <Wrench className="w-7 h-7" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {service.orderCase}
                            </h3>
                            <Badge
                              className={cn(
                                "text-[11px] uppercase font-bold px-2.5 py-0.5",
                                isCompleted(service.status)
                                  ? "bg-emerald-100 text-emerald-700"
                                  : service.type === "PM"
                                    ? "bg-blue-100 text-blue-700"
                                    : service.type === "CM"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-orange-100 text-orange-700",
                              )}
                            >
                              {service.type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] font-semibold truncate max-w-[180px]",
                                isCompleted(service.status)
                                  ? "border-emerald-300 text-emerald-600 bg-emerald-50"
                                  : "border-slate-300 text-slate-600",
                              )}
                            >
                              {isCompleted(service.status)
                                ? "✓ สำเร็จ"
                                : service.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              <span className="truncate max-w-[180px]">
                                {service.companyName}
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-slate-400" />
                              <span className="truncate max-w-[180px]">
                                {service.productName}
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <Calendar className="w-4 h-4" />
                              {service.entryTime
                                ? new Date(
                                    service.entryTime,
                                  ).toLocaleDateString("th-TH", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
