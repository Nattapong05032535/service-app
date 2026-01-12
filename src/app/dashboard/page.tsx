import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Plus, Building2, ChevronRight, Hash, Search } from "lucide-react";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { q = "" } = await searchParams;
    let allCompanies = await dataProvider.getCompanies(q);

    // Limit to 10 items if no search query
    if (!q && allCompanies.length > 10) {
        allCompanies = allCompanies.slice(0, 10);
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">ภาพรวมระบบ</h1>
                    <p className="text-muted-foreground mt-1">จัดการข้อมูลบริษัทและรายการสินค้าของคุณ</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <form action="/dashboard" method="GET" className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            name="q"
                            defaultValue={q}
                            placeholder="ค้นหาชื่อบริษัท หรือ Serial No. สินค้า..."
                            className="pl-10 h-10"
                        />
                    </form>
                    <Link href="/company/create" className="w-full sm:w-auto">
                        <Button className="gap-2 w-full">
                            <Plus className="w-4 h-4" />
                            เพิ่มบริษัทใหม่
                        </Button>
                    </Link>
                </div>
            </div>

            {allCompanies.length === 0 ? (
                <Card className="border-dashed py-20 bg-slate-50/50">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <Building2 className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-semibold">ยังไม่มีข้อมูลบริษัท</h3>
                        <p className="text-muted-foreground max-w-xs mt-2">
                            เริ่มต้นใช้งานโดยการสร้างโปรไฟล์บริษัทแรกของคุณ
                        </p>
                        <Link href="/company/create" className="mt-6">
                            <Button variant="outline">เพิ่มบริษัทแรก</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {allCompanies.map((company: any) => (
                        <Link key={company.id} href={`/company/${company.id}`}>
                            <Card className="hover:border-primary transition-all group cursor-pointer overflow-hidden border-l-4 border-l-primary">
                                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{company.name}</h3>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                                {company.nameSecondary && (
                                                    <span className="flex items-center gap-1">
                                                        {company.nameSecondary}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Hash className="w-3.5 h-3.5" />
                                                    Tax ID: {company.taxId || "ไม่ระบุ"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                        <ChevronRight className="w-5 h-5 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
