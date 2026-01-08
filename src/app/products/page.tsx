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
    ShieldX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductWithLatestWarranty } from "@/types/database";

export default async function ProductsPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ q?: string, status?: string }> 
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { q = "", status = "active" } = await searchParams;
    const allProducts = await dataProvider.getAllProducts(q);

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    // Process products with status and sort
    const processedProducts = allProducts.map((p: ProductWithLatestWarranty) => {
        let warrantyStatus = "none";
        let statusLabel = "ไม่มีข้อมูลการประกัน";
        let statusColor = "bg-slate-100 text-slate-700";
        let Icon = ShieldX;

        if (p.latestWarranty) {
            const endDate = new Date(p.latestWarranty.endDate);
            if (endDate < now) {
                warrantyStatus = "expired";
                statusLabel = "หมดประกันแล้ว";
                statusColor = "bg-red-100 text-red-700 border-red-200";
                Icon = ShieldX;
            } else if (endDate <= nextMonth) {
                warrantyStatus = "near_expiry";
                statusLabel = "ใกล้หมดประกัน";
                statusColor = "bg-amber-100 text-amber-700 border-amber-200";
                Icon = ShieldAlert;
            } else {
                warrantyStatus = "active";
                statusLabel = "อยู่ในประกัน";
                statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
                Icon = ShieldCheck;
            }
        }

        return {
            ...p,
            warrantyStatus,
            statusLabel,
            statusColor,
            Icon
        };
    });

    // Filtering
    const filteredProducts = processedProducts.filter((p) => {
        if (status === "all") return true;
        if (status === "active") return p.warrantyStatus === "active";
        if (status === "near_expiry") return p.warrantyStatus === "near_expiry";
        if (status === "expired") return p.warrantyStatus === "expired" || p.warrantyStatus === "none";
        return true;
    });

    // Sorting: Near Expiry (1) -> Active (2) -> Expired (3) -> None (4)
    // Within groups: Closest endDate first
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const rank = { "near_expiry": 1, "active": 2, "expired": 3, "none": 4 };
        const rankA = rank[a.warrantyStatus as keyof typeof rank];
        const rankB = rank[b.warrantyStatus as keyof typeof rank];

        if (rankA !== rankB) return rankA - rankB;

        if (a.latestWarranty && b.latestWarranty) {
            return new Date(a.latestWarranty.endDate).getTime() - new Date(b.latestWarranty.endDate).getTime();
        }
        return 0;
    });

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">รายการสินค้า</h1>
                    <p className="text-muted-foreground mt-1">จัดการและติดตามสถานะการรับประกันของสินค้าทั้งหมด</p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <form action="/products" method="GET" className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                                name="q"
                                defaultValue={q}
                                placeholder="ค้นหาชื่อสินค้า หรือ Serial No..."
                                className="pl-10"
                            />
                            {status !== "all" && <input type="hidden" name="status" value={status} />}
                        </form>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href="/products?status=all&q=">
                                <Button variant={status === "all" ? "primary" : "outline"} size="sm" className="gap-2">
                                    ทั้งหมด
                                </Button>
                            </Link>
                            <Link href={`/products?status=active&q=${q}`}>
                                <Button variant={status === "active" ? "primary" : "outline"} size="sm" className="gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    อยู่ในประกัน
                                </Button>
                            </Link>
                            <Link href={`/products?status=near_expiry&q=${q}`}>
                                <Button variant={status === "near_expiry" ? "primary" : "outline"} size="sm" className="gap-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    ใกล้หมดประกัน
                                </Button>
                            </Link>
                            <Link href={`/products?status=expired&q=${q}`}>
                                <Button variant={status === "expired" ? "primary" : "outline"} size="sm" className="gap-2">
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
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                                product.statusColor
                                            )}>
                                                <product.Icon className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                                                        {product.name}
                                                    </h3>
                                                    <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold", product.statusColor)}>
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
                                                            หมดเขต: {new Date(product.latestWarranty.endDate).toLocaleDateString('th-TH', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
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
