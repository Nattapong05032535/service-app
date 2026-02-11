import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PartsDashboard } from "@/components/parts/PartsDashboard";
import { PartsFilter } from "@/components/parts/PartsFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Parts | PFO Service App",
  description: "Overview of all parts used in maintenance services.",
};

export default async function PartsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  const companyFilter =
    typeof searchParams.company === "string" ? searchParams.company : undefined;
  const fromDate =
    typeof searchParams.from === "string" ? searchParams.from : undefined;
  const toDate =
    typeof searchParams.to === "string" ? searchParams.to : undefined;

  const parts = await dataProvider.getPartsSummary({
    company: companyFilter,
    from: fromDate,
    to: toDate,
  });

  const totalQty = parts.reduce((sum, p) => sum + p.qty, 0);
  const uniquePartsCount = new Set(
    parts.map((p) => p.partNo.trim().toUpperCase()),
  ).size;

  return (
    <div className="container mx-auto py-4 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">
            อะไหล่ที่ใช้ (Service Parts)
          </h1>
          <p className="text-muted-foreground">
            รายการอะไหล่ทั้งหมดที่ถูกใช้งานในใบงาน Service
          </p>
        </div>

        <div className="flex gap-4">
          <Card className="min-w-[150px] bg-orange-50 border-orange-100 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
                จำนวนชิ้นทั้งหมด
              </span>
              <span className="text-3xl font-black text-orange-700">
                {totalQty.toLocaleString()}
              </span>
            </CardContent>
          </Card>
          <Card className="min-w-[150px] bg-indigo-50 border-indigo-100 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                รหัสอะไหล่ที่ใช้
              </span>
              <span className="text-3xl font-black text-indigo-700">
                {uniquePartsCount.toLocaleString()}
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      <PartsFilter />

      <PartsDashboard parts={parts} />
    </div>
  );
}
