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
  User,
  Building2,
  Package,
} from "lucide-react";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { q = "", type = "all" } = await searchParams;
  const { data: services } = await dataProvider.getAllServices({
    query: q,
    type: type,
    pageSize: 50,
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            ประวัติงานบริการ
          </h1>
          <p className="text-muted-foreground mt-1">
            ติดตามและจัดการรายการงานบริการทั้งหมดในระบบ
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <form action="/services" method="GET" className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-[500px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="ค้นหาเลขที่บิล, ชื่อสินค้า, หรือชื่อลูกค้า..."
                  className="pl-10"
                />
              </div>
              <Button type="submit" size="sm" className="rounded-full h-full">
                <Search className="w-4 h-4" />
              </Button>
              <input type="hidden" name="type" value={type} />
            </form>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/services?type=all&q=${q}`}>
                <Button
                  variant={type === "all" ? "primary" : "outline"}
                  size="sm"
                >
                  ทั้งหมด
                </Button>
              </Link>
              <Link href={`/services?type=PM&q=${q}`}>
                <Button
                  variant={type === "PM" ? "primary" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  PM
                </Button>
              </Link>
              <Link href={`/services?type=CM&q=${q}`}>
                <Button
                  variant={type === "CM" ? "primary" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  CM
                </Button>
              </Link>
              <Link href={`/services?type=SERVICE&q=${q}`}>
                <Button
                  variant={type === "SERVICE" ? "primary" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  General
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {services.length === 0 ? (
          <Card className="border-dashed py-20 bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Wrench className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-semibold">ไม่พบรายการงานบริการ</h3>
              <p className="text-muted-foreground max-w-xs mt-2">
                ลองเปลี่ยนคำค้นหาหรือตัวกรองประเภทงาน
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <Link key={service.id} href={`/service/${service.id}`}>
                <Card className="hover:border-primary transition-all group cursor-pointer overflow-hidden border-l-4 border-l-blue-500">
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                            {service.orderCase}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700"
                          >
                            {service.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] truncate max-w-[150px]"
                          >
                            {service.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Building2 className="w-3.5 h-3.5" />
                            {service.companyName}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Package className="w-3.5 h-3.5" />
                            {service.productName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {service.entryTime
                              ? new Date(service.entryTime).toLocaleDateString(
                                  "th-TH",
                                )
                              : "-"}
                          </span>
                          {service.techService && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {service.techService}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                      <ChevronRight className="w-5 h-5 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
