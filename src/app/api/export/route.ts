import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });
    if (!hasPermission(session.role, 'export', 'execute')) {
        return NextResponse.json({ error: "ไม่มีสิทธิ์ส่งออกข้อมูล" }, { status: 403 });
    }

    try {
        const data = await dataProvider.getExportData();

        const headers = [
            "สินค้า",
            "วันที่ซื้อ",
            "เลขที่ซีเรียลสินค้า",
            "ชื่อเซลล์",
            "สถานะการรับประกัน",
            "วันที่เริ่มการรับประกัน",
            "วันที่สิ้นสุดการรับประกัน",
            "สถานะ PM",
            "ชื่อบริษัทลูกค้า"
        ];

        const rows = data.map(item => [
            item.productName,
            item.purchaseDate,
            item.serialNumber,
            item.salesName,
            item.warrantyStatus,
            item.warrantyStartDate,
            item.warrantyEndDate,
            item.pmStatus,
            item.companyName
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        // Add BOM for Excel UTF-8 support
        const bom = Buffer.from('\uFEFF');
        const content = Buffer.concat([bom, Buffer.from(csvContent, 'utf-8')]);

        return new Response(content, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="dashboard_export_${new Date().toISOString().slice(0, 10)}.csv"`
            }
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
    }
}
