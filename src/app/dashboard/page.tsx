import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Building2,
  Package,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Activity,
  PenTool,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RecentService {
  id: string;
  type: string;
  status: string;
  entryTime: string;
  exitTime: string;
  description: string;
  technician: string;
  orderCase: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  เสร็จสิ้น: {
    label: "เสร็จสิ้น",
    className: "bg-emerald-100 text-emerald-700",
  },
  ยกเลิก: { label: "ยกเลิก", className: "bg-red-100 text-red-700" },
  รอดำเนินการ: {
    label: "รอดำเนินการ",
    className: "bg-amber-100 text-amber-700",
  },
};

const SERVICE_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; keys: string[] }
> = {
  CM: { label: "Corrective Maintenance", color: "bg-orange-400", keys: ["CM"] },
  PM: { label: "Preventive Maintenance", color: "bg-blue-400", keys: ["PM"] },
  IN: {
    label: "Installation / Repair",
    color: "bg-green-400",
    keys: ["IN", "IN_REPAIR"],
  },
  OUT: { label: "Uninstallation", color: "bg-red-400", keys: ["OUT"] },
  S: {
    label: "Service / Survey",
    color: "bg-purple-400",
    keys: ["S", "SERVICE"],
  },
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) redirect("/login");

  if (!hasPermission(session.role, "dashboard", "read")) {
    redirect("/customers");
  }

  const stats = await dataProvider.getDashboardStats();

  if (!stats) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          ไม่สามารถโหลดข้อมูล Dashboard ได้
        </p>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "บริษัท",
      value: stats.totalCompanies,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/customers",
    },
    {
      title: "สินค้า",
      value: stats.totalProducts,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      href: "/products",
    },
    {
      title: "อะไหล่ทั้งหมดที่ใช้ไป",
      value: stats.totalPartsUsed || 0,
      icon: PenTool,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/analysis",
    },
    {
      title: "ใบงาน Service",
      value: stats.totalServices,
      icon: Wrench,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/services",
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          ภาพรวมระบบ — สรุปข้อมูลบริษัท สินค้า การรับประกัน และใบงาน
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Warranty & Service Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warranty Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              สถานะการรับประกัน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">
                ทั้งหมด
              </span>
              <span className="text-2xl font-bold">
                {stats.totalWarranties.toLocaleString()}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ใบ
                </span>
              </span>
            </div>
            <StatRow
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              label="ยังอยู่ในประกัน"
              value={stats.warranty.active}
              total={stats.totalWarranties}
              barColor="bg-emerald-500"
            />
            <StatRow
              icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
              label="ใกล้หมดอายุ (30 วัน)"
              value={stats.warranty.nearExpiry}
              total={stats.totalWarranties}
              barColor="bg-amber-500"
            />
            <StatRow
              icon={<XCircle className="w-4 h-4 text-red-500" />}
              label="หมดประกันแล้ว"
              value={stats.warranty.expired}
              total={stats.totalWarranties}
              barColor="bg-red-500"
            />
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              สถานะใบงาน Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">
                ทั้งหมด
              </span>
              <span className="text-2xl font-bold">
                {stats.totalServices.toLocaleString()}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ใบ
                </span>
              </span>
            </div>
            <StatRow
              icon={<Clock className="w-4 h-4 text-amber-500" />}
              label="รอดำเนินการ"
              value={stats.service.pending}
              total={stats.totalServices}
              barColor="bg-amber-500"
            />
            <StatRow
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              label="เสร็จสิ้น"
              value={stats.service.completed}
              total={stats.totalServices}
              barColor="bg-emerald-500"
            />
            <StatRow
              icon={<XCircle className="w-4 h-4 text-red-500" />}
              label="ยกเลิก"
              value={stats.service.cancelled}
              total={stats.totalServices}
              barColor="bg-red-500"
            />

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-3">แยกตามประเภทงาน</h4>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(SERVICE_TYPE_CONFIG).map(([key, config]) => {
                  let count = 0;
                  const typesData = stats.service.types || {};
                  config.keys.forEach((k) => {
                    count += typesData[k] || 0;
                  });

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 bg-muted/40 rounded-lg border-gray-300 border transition-colors "
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${config.color}`}
                        />
                        <span className="font-semibold text-sm">{key}</span>
                      </div>
                      <span className="font-bold text-sm">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Services Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5 text-purple-600" />
              ใบงาน Service ล่าสุด
            </CardTitle>
            <Link
              href="/search"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentServices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              ยังไม่มีใบงาน Service
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Order Case</th>
                    <th className="pb-3 font-medium">ประเภท</th>
                    <th className="pb-3 font-medium">สถานะ</th>
                    <th className="pb-3 font-medium hidden md:table-cell">
                      วันเข้างาน
                    </th>
                    <th className="pb-3 font-medium hidden lg:table-cell">
                      ช่างเทคนิค
                    </th>
                    <th className="pb-3 font-medium hidden lg:table-cell">
                      รายละเอียด
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentServices.map((svc: RecentService) => {
                    const statusConfig =
                      STATUS_CONFIG[svc.status] || STATUS_CONFIG["รอดำเนินการ"];
                    return (
                      <tr
                        key={svc.id}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 font-mono text-xs">
                          {svc.orderCase || "-"}
                        </td>
                        <td className="py-3">
                          <Badge
                            className={
                              svc.type === "CM" ||
                              svc.type === "Corrective Maintenance"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          >
                            {svc.type || "-"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="py-3 hidden md:table-cell text-muted-foreground">
                          {svc.entryTime ? formatDate(svc.entryTime) : "-"}
                        </td>
                        <td className="py-3 hidden lg:table-cell text-muted-foreground">
                          {svc.technician || "-"}
                        </td>
                        <td className="py-3 hidden lg:table-cell text-muted-foreground max-w-[200px] truncate">
                          {svc.description || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Progress bar row component */
function StatRow({
  icon,
  label,
  value,
  total,
  barColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  barColor: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-semibold">
          {value.toLocaleString()}
          <span className="text-muted-foreground font-normal ml-1">
            ({percentage.toFixed(0)}%)
          </span>
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
