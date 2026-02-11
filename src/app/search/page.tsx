import { dataProvider } from "@/db/provider";
import Link from "next/link";
import { ServiceDetail } from "@/types/database";
import { formatDateTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  FileText,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Pencil,
  Printer,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EditServiceDialog } from "@/components/EditServiceDialog";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";

  // Clean query string to avoid SQL injection risks if not handled by ORM (drizzle handles it)
  // But also trim whitespace
  const cleanQuery = query.trim();

  let results: ServiceDetail[] = [];
  let searched = false;

  if (cleanQuery) {
    searched = true;
    results = await dataProvider.findServiceByOrderCase(cleanQuery);
  }

  const allTechnicians = await dataProvider.getTechnicians();

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">
        ค้นหาใบงาน
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 mb-10">
        <form action="/search" method="get" className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              name="q"
              placeholder="ระบุเลขที่ใบงาน (เช่น PM_000001)"
              className="pl-10 h-12 text-lg"
              defaultValue={cleanQuery}
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-8">
            ค้นหา
          </Button>
        </form>
      </div>

      {searched && results.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-600">
            ไม่พบข้อมูลใบงาน
          </h3>
          <p className="text-slate-500 mt-2">
            กรุณาตรวจสอบเลขที่ใบงานและลองใหม่อีกครั้ง
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-700">
            พบข้อมูลจำนวน {results.length} รายการ
          </h2>
          {results.map((result, index) => {
            const technicianNames = result.service.technicians && result.service.technicians.length > 0
                ? allTechnicians
                    .filter(t => result.service.technicians?.includes(t.id))
                    .map(t => t.name)
                    .join(", ")
                : result.service.technician || "-";

            return (
            <Card
              key={result.service.id || index}
              className="overflow-hidden border-t-4 border-t-blue-500 shadow-xl mb-8"
            >
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-2 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {result.service.type} Service
                    </Badge>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      {result.service.orderCase}
                      {results.length > 1 && (
                        <span className="text-sm font-normal text-slate-500 ml-2">
                          (รายการที่ {index + 1})
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        result.service.status === "เสร็จสิ้น"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {result.service.status === "เสร็จสิ้น" ? (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-1" />
                      )}
                      {result.service.status || "รอดำเนินการ"}
                    </div>
                    <Link
                      href={`/service/print/${result.service.id}`}
                      target="_blank"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
                        type="button"
                      >
                        <Printer className="w-4 h-4" />
                        พิมพ์ใบงาน
                      </Button>
                    </Link>
                    <EditServiceDialog
                      service={result.service}
                      warrantyId={result.warranty?.id?.toString()}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                          type="button"
                        >
                          <Pencil className="w-4 h-4" />
                          แก้ไข
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        ข้อมูลลูกค้า & สินค้า
                      </h3>
                      <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">
                            บริษัท:
                          </span>
                          <span className="font-medium">
                            {result.company?.name || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">
                            สินค้า:
                          </span>
                          <span className="font-medium">
                            {result.product?.name || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">
                            Serial No:
                          </span>
                          <span className="font-medium font-mono bg-white px-2 py-0.5 rounded border">
                            {result.product?.serialNumber || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        รายละเอียดการเข้างาน
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-slate-500">
                              ผู้ปฏิบัติงาน
                            </p>
                            <p className="font-medium">
                              {technicianNames}
                            </p>
                          </div>

                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-slate-500">
                              เวลาเข้า - ออก
                            </p>
                            <p className="font-medium">
                              {result.service.entryTime
                                ? formatDateTime(result.service.entryTime)
                                : "-"}
                              <span className="mx-2 text-slate-400">ถึง</span>
                              {result.service.exitTime
                                ? formatDateTime(result.service.exitTime)
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        รายละเอียดงานบริการ
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">
                            รายละเอียดปัญหา / การแก้ไข
                          </p>
                          <div className="bg-slate-50 p-3 rounded border text-slate-700 min-h-[80px]">
                            {result.service.description || "ไม่มีรายละเอียด"}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">
                            หมายเหตุ
                          </p>
                          <div className="bg-slate-50 p-3 rounded border text-slate-700">
                            {result.service.notes || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
