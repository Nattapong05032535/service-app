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
  Package,
  ChevronRight,
  Calendar,
  Building2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ProductWithLatestWarranty } from "@/types/database";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { q = "", status = "all" } = await searchParams;
  const pageSize = 10;

  const { data: allProducts } = await dataProvider.getAllProducts({
    query: q,
    status: status,
    page: 1,
    pageSize: pageSize,
  });

  // Process products with status - Use Airtable's pre-calculated fields to avoid Invalid Date issues
  const processedProducts = allProducts.map((p: ProductWithLatestWarranty) => {
    let warrantyStatus = "none";
    let statusLabel = "ไม่มีข้อมูลการประกัน";
    let statusColor = "bg-slate-100 text-slate-700";
    let Icon = ShieldX;

    // Use Airtable's pre-calculated warranty status to avoid Invalid Date issues
    const airtableStatus = p.airtableWarrantyStatus || "⚠️ No Warranty";

    if (p.isNearExpiry) {
      // Near expiry takes priority
      warrantyStatus = "near_expiry";
      statusLabel = "ใกล้หมดประกัน";
      statusColor = "bg-amber-100 text-amber-700 border-amber-200";
      Icon = ShieldAlert;
    } else if (airtableStatus === "✅ Active") {
      warrantyStatus = "active";
      statusLabel = "อยู่ในประกัน";
      statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
      Icon = ShieldCheck;
    } else if (airtableStatus === "❌ Expired") {
      warrantyStatus = "expired";
      statusLabel = "หมดประกันแล้ว";
      statusColor = "bg-red-100 text-red-700 border-red-200";
      Icon = ShieldX;
    } else {
      // '⚠️ No Warranty' or unknown status
      warrantyStatus = "none";
      statusLabel = "ไม่มีข้อมูลการประกัน";
      statusColor = "bg-slate-100 text-slate-700";
      Icon = ShieldX;
    }

    return {
      ...p,
      warrantyStatus,
      statusLabel,
      statusColor,
      Icon,
    };
  });

  const sortedProducts = processedProducts; // Already sorted by expiry date from server

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            รายการสินค้า
          </h1>
          <p className="text-muted-foreground mt-1">
            จัดการและติดตามสถานะการรับประกันของสินค้าทั้งหมด
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <form action="/products" method="GET" className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-[500px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="ค้นหาชื่อสินค้า หรือ Serial No..."
                  className="pl-10"
                />
              </div>
              <Button type="submit" size="sm" className="rounded-full h-full">
                <Search className="w-4 h-4" />
              </Button>
              <input type="hidden" name="status" value="all" />
            </form>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/products?status=all&q=">
                <Button
                  variant={status === "all" ? "primary" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  ทั้งหมด
                </Button>
              </Link>
              <Link href={`/products?status=active&q=${q}`}>
                <Button
                  variant={status === "active" ? "primary" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  อยู่ในประกัน
                </Button>
              </Link>
              <Link href={`/products?status=near_expiry&q=${q}`}>
                <Button
                  variant={status === "near_expiry" ? "primary" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  ใกล้หมดประกัน
                </Button>
              </Link>
              <Link href={`/products?status=expired&q=${q}`}>
                <Button
                  variant={status === "expired" ? "primary" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  <ShieldX className="w-4 h-4" />
                  หมดประกัน
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {sortedProducts.length === 0 ? (
          <Card className="border-dashed py-20 bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-semibold">ไม่พบรายการสินค้า</h3>
              <p className="text-muted-foreground max-w-xs mt-2">
                ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="hover:border-primary transition-all group cursor-pointer overflow-hidden border-l-4 border-l-primary/10 hover:border-l-primary">
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0",
                          product.statusColor,
                        )}
                      >
                        <product.Icon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                            {product.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] uppercase font-bold",
                              product.statusColor,
                            )}
                          >
                            {product.statusLabel}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {product.companyName}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            S/N: {product.serialNumber}
                          </span>
                          {product.latestWarranty && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              หมดเขต:{" "}
                              {formatDate(product.latestWarranty.endDate)}
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
