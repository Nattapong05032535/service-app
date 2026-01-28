import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Plus,
  Building2,
  Package,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  Calendar,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch dashboard stats (This uses the cache internally)
  const stats = await dataProvider.getDashboardStats();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header section with gradient */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white pt-12 pb-24 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                ภาพรวมระบบ (Dashboard)
              </h1>
              <p className="text-slate-400 mt-2 text-lg">
                ยินดีต้อนรับกลับมา, คุณ{" "}
                <span className="text-white font-medium">
                  {session.username}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/company/create">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 border-none shadow-lg gap-2 px-6 h-12">
                  <Plus className="w-5 h-5" />
                  เพิ่มบริษัทใหม่
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Pushed up by the header's negative margin equivalent if we use it, 
                but here we'll just use container padding and negative top margin on cards */}
      <div className="container mx-auto px-4 -mt-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="บริษัททั้งหมด"
            value={stats.totalCompanies}
            icon={Building2}
            color="blue"
            trend="จัดการรายชื่อลูกค้า"
          />
          <StatCard
            title="สินค้าในระบบ"
            value={stats.totalProducts}
            icon={Package}
            color="purple"
            trend="รายการอุปกรณ์"
          />
          <StatCard
            title="การรับประกัน"
            value={stats.totalWarranties}
            icon={ShieldCheck}
            color="green"
            trend="สัญญาบริการ"
          />
          <StatCard
            title="งานบริการ"
            value={stats.totalServices}
            icon={Wrench}
            color="orange"
            trend="ประวัติการซ่อม/PM"
          />
        </div>

        {/* Charts Section */}
        <DashboardCharts
          warrantyStats={stats.warrantyStats}
          monthlyServiceData={stats.monthlyServiceData}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts / Expiring Soon */}
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between py-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg font-bold">
                  สินค้าใกล้หมดประกัน (เร็วๆ นี้)
                </CardTitle>
              </div>
              <Link href="/products?status=near_expiry">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  ดูทั้งหมด
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {stats.expiringWithin30Days.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 italic">
                    ไม่มีรายการใกล้หมดประกันใน 30 วันนี้
                  </div>
                ) : (
                  stats.expiringWithin30Days.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                              SN: {item.serialNumber}
                            </span>
                            <span className="text-sm text-slate-500">
                              | {item.companyName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={
                            item.daysRemaining <= 7 ? "destructive" : "warning"
                          }
                          className="px-3 py-1"
                        >
                          เหลือ {item.daysRemaining} วัน
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium">
                          {item.endDate.toLocaleDateString("th-TH")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-white border-b border-slate-50 py-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-bold">
                  กิจกรรมล่าสุด
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-6">
                {stats.recentServices.map((service) => (
                  <div
                    key={service.id}
                    className="relative pl-6 border-l-2 border-slate-100 pb-2 last:pb-0"
                  >
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-sm" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">
                          {service.orderCase}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold tracking-wider"
                        >
                          {service.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        สถานะ: {service.status}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {new Date(service.entryTime).toLocaleDateString(
                          "th-TH",
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/services">
                <Button
                  variant="outline"
                  className="w-full mt-6 gap-2 border-slate-200 hover:bg-slate-50 font-semibold group"
                >
                  ดูประวัติบริการทั้งหมด
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  trend: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-800">
              {value.toLocaleString()}
            </h3>
          </div>
          <div
            className={`p-3 rounded-2xl ${colorMap[color]} group-hover:scale-110 transition-transform duration-300 shadow-sm border`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <TrendingUp
            className={`w-3.5 h-3.5 ${color === "blue" ? "text-blue-500" : color === "green" ? "text-green-500" : color === "purple" ? "text-purple-500" : "text-orange-500"}`}
          />
          <span className="text-xs text-slate-500 font-medium">{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}
