import { dataProvider } from "@/db/provider";
import { notFound } from "next/navigation";
import {
  Hammer,
  Clock,
  User,
  Calendar,
  Building2,
  Package,
  ShieldCheck,
  MapPin,
  Phone,
} from "lucide-react";
import { PrintServiceButton } from "@/components/PrintServiceButton";

import { formatDate, formatDateTime } from "@/lib/utils";

export default async function ServicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await dataProvider.getServiceDetail(id);

  if (!detail) {
    return notFound();
  }

  const { service, warranty, product, company } = detail;
  const parts = await dataProvider.getServiceParts(service.orderCase || "");
  const allTechnicians = await dataProvider.getTechnicians();

  const technicianNames =
    service.technicians && service.technicians.length > 0
      ? allTechnicians
          .filter((t) => service.technicians?.includes(String(t.id)))
          .map((t) => t.name)
          .join(", ")
      : service.technician || "-";

  return (
    <div className="min-h-screen bg-white md:p-8 print:p-0 font-sans text-black">
      <style
        dangerouslySetInnerHTML={{
          __html: `
                nav { display: none !important; }
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        color: black !important;
                    }
                    nav { display: none !important; }
                    /* Force borders to be black */
                    * { border-color: black !important; }
                }
            `,
        }}
      />

      {/* Print Header/Actions */}
      <div className="flex justify-between items-center mb-6 print:hidden max-w-4xl mx-auto px-4">
        <h1 className="text-xl font-bold text-black">เอกสารใบงานบริการ</h1>
        <PrintServiceButton />
      </div>

      {/* Document Content */}
      <div className="max-w-4xl mx-auto p-6 rounded-none print:border-none print:py-10 print:px-8">
        {/* Logo & Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <Hammer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-black uppercase tracking-tight leading-none">
                  Service Order
                </h2>
                <p className="text-sm text-black font-medium mt-1">
                  ใบสั่งงาน / บันทึกการปฏิบัติงาน
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block border border-black px-3 py-1 mb-1">
              <p className="text-sm font-bold text-black uppercase tracking-wider leading-none mb-0.5">
                Order No.
              </p>
              <p className="text-base font-mono font-bold text-black leading-none">
                #{service.orderCase || "-"}
              </p>
            </div>
            <p className="text-sm text-black">
              วันที่: {formatDate(service.entryTime)}
            </p>
          </div>
        </div>

        {/* Section: Customer & Product Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-black uppercase tracking-widest border-l-4 border-black pl-2">
              ข้อมูลลูกค้า
            </h3>
            <div className="border border-black p-2 space-y-0.5">
              <div className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <p className="font-bold text-sm text-black">
                    {company?.name || "-"}
                  </p>
                  <p className="text-sm text-black">
                    {company?.nameSecondary || ""}
                  </p>
                </div>
              </div>
              {company?.taxId && (
                <p className="text-sm text-black pl-5">
                  Tax ID: {company.taxId}
                </p>
              )}
              {product?.branch && (
                <div className="flex items-center gap-2 pl-5">
                  <MapPin className="w-3.5 h-3.5 text-black" />
                  <p className="text-sm text-black">
                    สาขา/ที่ตั้ง: {product?.branch}
                  </p>
                </div>
              )}
              {product?.contactPerson && (
                <div className="flex items-center gap-2 pl-5">
                  <User className="w-3.5 h-3.5 text-black" />
                  <p className="text-sm text-black">
                    ผู้ติดต่อ: {product?.contactPerson}
                  </p>
                </div>
              )}
              {product?.phoneNumber && (
                <div className="flex items-center gap-2 pl-5">
                  <Phone className="w-3.5 h-3.5 text-black" />
                  <p className="text-sm text-black">
                    เบอร์โทรศัพท์: {product?.phoneNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-black uppercase tracking-widest border-l-4 border-black pl-2">
              ข้อมูลสินค้า
            </h3>
            <div className="border border-black p-2 space-y-0.5">
              <div className="flex items-start gap-2">
                <Package className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <p className="font-bold text-sm text-black">
                    {product?.name || "-"}
                  </p>
                  <p className="text-sm font-mono text-black">
                    S/N: {product?.serialNumber || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-5">
                <Calendar className="w-3.5 h-3.5 text-black" />
                <p className="text-sm text-black truncate">
                  ซื้อเมื่อ: {formatDate(product?.purchaseDate)}
                </p>
              </div>
              <div className="flex items-center gap-2 pl-5">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                <p className="text-sm text-black truncate">
                  ความคุ้มครอง: {warranty?.type || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Service Details */}
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-bold text-black uppercase tracking-widest border-l-4 border-black pl-2">
            รายละเอียดงาน ({service.type})
          </h3>
          <div className="border border-black overflow-hidden text-black">
            <div className="grid grid-cols-3 border-b border-black px-3 py-1 font-bold text-sm bg-gray-100 print:bg-transparent">
              <div className="flex items-center gap-2 text-black">
                <Clock className="w-3 h-3" /> เวลาเข้าปฏิบัติงาน
              </div>
              <div className="flex items-center gap-2 text-black">
                <Clock className="w-3 h-3" /> เวลาออกปฏิบัติงาน
              </div>
              <div className="flex items-center gap-2 text-black">
                <User className="w-3 h-3" /> ชื่อช่างผู้ดูแล
              </div>
            </div>
            <div className="grid grid-cols-3 px-3 py-1.5 text-sm border-b border-black">
              <div>{formatDateTime(service.entryTime)}</div>
              <div>
                {service.exitTime
                  ? formatDateTime(service.exitTime)
                  : "ยังไม่ระบุ"}
              </div>
              <div className="font-bold">{technicianNames}</div>
            </div>
            <div className="px-3 py-1.5 border-b border-black flex items-center gap-2">
              <p className="text-sm font-bold text-black uppercase tracking-wider whitespace-nowrap shrink-0">
                อาการเสีย:
              </p>
              <div className="flex-1 flex items-end min-w-0 pb-0.5">
                <p className="text-sm text-black truncate">
                  {service.description || ""}
                </p>
              </div>
            </div>
            <div className="px-3 pt-2 pb-2 border-b border-black">
              <div className="flex items-end gap-2 h-7 pb-0.5">
                <p className="text-sm font-bold text-black uppercase tracking-wider whitespace-nowrap shrink-0">
                  รายละเอียดการเข้าซ่อม:
                </p>
                <div className="flex-1 border-b border-black border-dashed h-full flex items-end">
                  <p className="text-sm text-black truncate flex-1">
                    {service.techService || ""}
                  </p>
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-b border-black w-full h-7 border-dashed"
                ></div>
              ))}
            </div>
            <div className="px-3 py-2">
              <p className="text-sm font-bold text-black uppercase tracking-wider mb-1.5">
                รายการอะไหล่ที่เปลี่ยน:
              </p>
              <div className="border border-black rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 print:bg-transparent text-black">
                      <th className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider w-[20%] border-r border-black">
                        PART NUMBER
                      </th>
                      <th className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider w-[45%] border-r border-black">
                        รายละเอียด
                      </th>
                      <th className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider w-[20%] border-r border-black text-center">
                        ราคาต่อหน่วย
                      </th>
                      <th className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider w-[15%] text-center">
                        จำนวน
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {(() => {
                      const totalRows = 8;
                      const dataRows = parts.map((part, i) => (
                        <tr
                          key={`part-${i}`}
                          className="h-7 border-b border-black"
                        >
                          <td className="px-3 py-1 text-sm text-black break-all border-r border-black">
                            {part.partNo}
                          </td>
                          <td className="px-3 py-1 text-sm text-black border-r border-black break-all">
                            {part.details}
                          </td>
                          <td className="px-3 py-1 text-sm text-black border-r border-black text-center">
                            {/* @ts-expect-error: price fields might not exist on type */}
                            {part.unitPrice || part.price || ""}
                          </td>
                          <td className="px-3 py-1 text-sm text-black text-center">
                            {part.qty}
                          </td>
                        </tr>
                      ));

                      const emptyRows = [];
                      for (let i = parts.length; i < totalRows; i++) {
                        emptyRows.push(
                          <tr
                            key={`empty-${i}`}
                            className="h-7 border-b border-black last:border-b-0"
                          >
                            <td className="px-3 py-1 text-sm text-black border-r border-black"></td>
                            <td className="px-3 py-1 text-sm text-black border-r border-black"></td>
                            <td className="px-3 py-1 text-sm text-black border-r border-black"></td>
                            <td className="px-3 py-1 text-sm text-black text-center"></td>
                          </tr>,
                        );
                      }

                      return [...dataRows, ...emptyRows];
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Signatures (Separate Box) */}
        <div className="border border-black rounded-none overflow-hidden uppercase tracking-tighter text-black mt-4">
          <table className="w-full text-left border-collapse text-sm">
            <tbody className="divide-y divide-black">
              {(service.type === "IN_REPAIR"
                ? [
                    "ผู้รับเข้าซ่อม",
                    "ผู้ส่งมอบให้",
                    "ผู้ส่งมอบกลับ",
                    "ผู้รับสินค้ากลับ",
                  ]
                : ["ลงชื่อช่างผู้ปฏิบัติงาน", "ลงชื่อลูกค้า / ผู้รับงาน"]
              ).map((title, i) => (
                <tr key={i} className="divide-x divide-black h-10">
                  <td className="px-3 py-2 font-bold whitespace-nowrap w-[22%] align-middle">
                    {title}
                  </td>
                  <td className="px-3 py-2 w-[33%] align-middle">
                    <div className="flex items-center text-left w-full h-full">
                      <span className="text-sm mr-2">วันที่</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 w-[45%] align-middle">
                    <div className="flex items-center text-left w-full h-full">
                      <span className="text-sm mr-2">ลงชื่อ</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
