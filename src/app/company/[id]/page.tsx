import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Package,
  Calendar,
  User,
  Hash,
  ArrowLeft,
  Edit,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AddProductDialog } from "@/components/AddProductDialog";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CompanyDetailPage(props: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await props.params;
  const searchParams = await props.searchParams;

  const companyId = params.id;
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const company = (await dataProvider.getCompanyById(companyId)) as {
    name: string;
    nameSecondary?: string;
    taxId?: string;
    contactInfo?: string;
  } | null;

  if (!company) notFound();

  const companyProducts = await dataProvider.getProductsByCompany(companyId);

  // Apply filtering
  let filteredProducts = query
    ? companyProducts.filter(
        (p) =>
          (p as { name?: string }).name
            ?.toLowerCase()
            .includes(query.toLowerCase()) ||
          ((p as { serialNumber?: string }).serialNumber &&
            (p as { serialNumber?: string })
              .serialNumber!.toLowerCase()
              .includes(query.toLowerCase())) ||
          ((p as { branch?: string }).branch &&
            (p as { branch?: string })
              .branch!.toLowerCase()
              .includes(query.toLowerCase())),
      )
    : companyProducts;

  // Limit to 10 items if no search query
  if (!query && filteredProducts.length > 10) {
    filteredProducts = filteredProducts.slice(0, 10);
  }

  // Fetch all warranties for these products in one go (using filtered ones for display, but maybe all for logic)
  // Actually using filteredProducts is enough for display
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productIds = filteredProducts.map((p: any) => p.id);
  const allWarranties = (await dataProvider.getAllWarrantiesForProducts(
    productIds,
  )) as unknown as {
    productId: string | number;
    endDate: string | Date;
    startDate: string | Date;
    type: string;
  }[];

  const now = new Date();

  return (
    <div className="container mx-auto py-10 space-y-10 px-4">
      <div className="flex justify-between items-center">
        <Link
          href="/customers"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับไปหน้าภาพรวม
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold">
                {company.name}
              </CardTitle>
              <p className="text-muted-foreground">{company.nameSecondary}</p>
            </div>
            <Link href={`/company/edit/${companyId}`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-8 px-2 text-xs"
              >
                <Edit className="w-3 h-3" />
                แก้ไข
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                เลขประจำตัวผู้เสียภาษี
              </span>
              <p className="text-sm font-medium">
                {company.taxId || "ไม่ได้ระบุ"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                ข้อมูลการติดต่อ
              </span>
              <p className="text-sm border p-3 rounded-lg bg-slate-50 min-h-[100px] whitespace-pre-wrap">
                {company.contactInfo || "ไม่มีข้อมูลการติดต่อ"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6" />
              รายการสินค้า
            </h2>
            <AddProductDialog companyId={companyId} />
          </div>
          <div className="grid gap-4">
            <form className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="ค้นหาชื่อสินค้า, Serial No. หรือสาขา..."
                className="pl-10 h-11 bg-white shadow-sm rounded-xl border-slate-200"
              />
            </form>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-slate-50">
                <p className="text-muted-foreground">
                  {query
                    ? "ไม่พบสินค้าที่ตรงกับการค้นหา"
                    : "ไม่พบข้อมูลสินค้าสำหรับบริษัทนี้"}
                </p>
              </div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filteredProducts.map((product: any) => {
                const activeW = allWarranties
                  .filter((w) => w.productId === product.id)
                  .sort(
                    (a, b) =>
                      new Date(b.endDate).getTime() -
                      new Date(a.endDate).getTime(),
                  )[0];

                const oneMonthFromNow = new Date(now);
                oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

                const isActive =
                  activeW &&
                  new Date(activeW.startDate) <= now &&
                  new Date(activeW.endDate) >= now;
                const isExpired = activeW && new Date(activeW.endDate) < now;
                const isUpcoming = activeW && new Date(activeW.startDate) > now;
                const isExpiringSoon =
                  isActive && new Date(activeW.endDate) < oneMonthFromNow;

                const statusColor = isExpired
                  ? "#ef4444"
                  : isUpcoming
                    ? "#3b82f6"
                    : isExpiringSoon
                      ? "#f59e0b" // Orange
                      : isActive
                        ? "#22c55e"
                        : "#94a3b8";

                return (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <Card
                      className="hover:border-primary transition-all group cursor-pointer overflow-hidden border-l-4"
                      style={{ borderLeftColor: statusColor }}
                    >
                      <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                              isExpired
                                ? "bg-red-100 text-red-600"
                                : isUpcoming
                                  ? "bg-blue-100 text-blue-600"
                                  : isExpiringSoon
                                    ? "bg-amber-100 text-amber-600"
                                    : isActive
                                      ? "bg-green-100 text-green-600"
                                      : "bg-primary/10 text-primary",
                            )}
                          >
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold group-hover:text-primary transition-colors">
                                {product.name}
                              </p>
                              {activeW && (
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border",
                                    isExpired
                                      ? "bg-red-50 text-red-600 border-red-100"
                                      : isUpcoming
                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                        : isExpiringSoon
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-green-100 text-green-700 border-green-200",
                                  )}
                                >
                                  {isExpired
                                    ? `หมดประกัน: ${activeW.type}`
                                    : isUpcoming
                                      ? `รอเริ่ม: ${activeW.type}`
                                      : isExpiringSoon
                                        ? `ใกล้หมดประกัน: ${activeW.type}`
                                        : `ยังไม่หมดประกัน: ${activeW.type}`}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />{" "}
                                {product.serialNumber}
                              </span>
                              {activeW && (
                                <span className="flex items-center gap-2 text-slate-500 font-medium">
                                  <Clock className="w-3 h-3 text-primary/60" />
                                  <span className="flex items-center gap-1">
                                    {new Date(
                                      activeW.startDate,
                                    ).toLocaleDateString()}
                                    <span className="mx-1 opacity-50">ถึง</span>
                                    {new Date(
                                      activeW.endDate,
                                    ).toLocaleDateString()}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          {product.branch && (
                            <div
                              className="flex items-center gap-2"
                              title="สาขา"
                            >
                              <MapPin className="w-4 h-4 text-primary/40" />
                              {product.branch}
                            </div>
                          )}
                          <div
                            className="flex items-center gap-2"
                            title="วันที่ซื้อ"
                          >
                            <Calendar className="w-4 h-4 text-primary/40" />
                            {product.purchaseDate
                              ? new Date(
                                  product.purchaseDate,
                                ).toLocaleDateString()
                              : "ไม่ได้ระบุ"}
                          </div>
                          <div
                            className="flex items-center gap-2"
                            title="ผู้ติดต่อ"
                          >
                            <User className="w-4 h-4 text-primary/40" />
                            {product.contactPerson || "ไม่ได้ระบุ"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
