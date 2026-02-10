import { dataProvider } from "@/db/provider";
import { notFound } from "next/navigation";
import { Hammer, Clock, User, Calendar, Building2, Package, ShieldCheck } from "lucide-react";
import { PrintServiceButton } from "@/components/PrintServiceButton";

export default async function ServicePrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const detail = await dataProvider.getServiceDetail(id);

    if (!detail) {
        return notFound();
    }

    const { service, warranty, product, company } = detail;
    const parts = await dataProvider.getServiceParts(service.orderCase || "");

    return (
        <div className="min-h-screen bg-white md:p-8 print:p-0 font-sans text-black">
            <style dangerouslySetInnerHTML={{ __html: `
                nav { display: none !important; }
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
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
            `}} />
            
            {/* Print Header/Actions */}
            <div className="flex justify-between items-center mb-6 print:hidden max-w-4xl mx-auto px-4">
                <h1 className="text-xl font-bold text-black">เอกสารใบงานบริการ</h1>
                <PrintServiceButton />
            </div>

            {/* Document Content */}
            <div className="max-w-4xl mx-auto p-6 rounded-none print:border-none print:p-0">
                {/* Logo & Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-black flex items-center justify-center">
                                <Hammer className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-black uppercase tracking-tight leading-none">Service Order</h2>
                                <p className="text-[10px] text-black font-medium mt-1">ใบสั่งงาน / บันทึกการปฏิบัติงาน</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block border border-black px-3 py-1 mb-1">
                            <p className="text-[9px] font-bold text-black uppercase tracking-wider leading-none mb-0.5">Order No.</p>
                            <p className="text-base font-mono font-bold text-black leading-none">#{service.orderCase || "-"}</p>
                        </div>
                        <p className="text-[10px] text-black">วันที่: {new Date(service.entryTime).toLocaleDateString('th-TH')}</p>
                    </div>
                </div>

                {/* Section: Customer & Product Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-bold text-black uppercase tracking-widest border-l-4 border-black pl-2">ข้อมูลลูกค้า</h3>
                        <div className="border border-black p-2 space-y-0.5">
                            <div className="flex items-start gap-2">
                                <Building2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                                <div className="leading-tight">
                                    <p className="font-bold text-xs text-black">{company?.name || "-"}</p>
                                    <p className="text-[10px] text-black">{company?.nameSecondary || ""}</p>
                                </div>
                            </div>
                            {company?.taxId && (
                                <p className="text-[10px] text-black pl-5">Tax ID: {company.taxId}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-[10px] font-bold text-black uppercase tracking-widest border-l-4 border-black pl-2">ข้อมูลสินค้า</h3>
                        <div className="border border-black p-2 space-y-0.5">
                            <div className="flex items-start gap-2">
                                <Package className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                                <div className="leading-tight">
                                    <p className="font-bold text-xs text-black">{product?.name || "-"}</p>
                                    <p className="text-[10px] font-mono text-black">S/N: {product?.serialNumber || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pl-5">
                                <Calendar className="w-3 h-3 text-black" />
                                <p className="text-[10px] text-black truncate">ซื้อเมื่อ: {product?.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString('th-TH') : "-"}</p>
                            </div>
                            <div className="flex items-center gap-2 pl-5">
                                <ShieldCheck className="w-3 h-3 text-black" />
                                <p className="text-[10px] text-black truncate">ความคุ้มครอง: {warranty?.type || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Service Details */}
                <div className="space-y-2 mb-4">
                    <h3 className="text-[10px] font-bold text-black uppercase tracking-widest border-l-4 border-black pl-2">รายละเอียดงาน ({service.type})</h3>
                    <div className="border border-black overflow-hidden text-black">
                        <div className="grid grid-cols-3 border-b border-black px-3 py-1 font-bold text-[10px] bg-gray-100 print:bg-transparent">
                            <div className="flex items-center gap-2 text-black"><Clock className="w-3 h-3" /> เวลาเข้าปฏิบัติงาน</div>
                            <div className="flex items-center gap-2 text-black"><Clock className="w-3 h-3" /> เวลาออกปฏิบัติงาน</div>
                            <div className="flex items-center gap-2 text-black"><User className="w-3 h-3" /> ชื่อช่างผู้ดูแล</div>
                        </div>
                        <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] border-b border-black">
                            <div>{new Date(service.entryTime).toLocaleString('th-TH')}</div>
                            <div>{service.exitTime ? new Date(service.exitTime).toLocaleString('th-TH') : "ยังไม่ระบุ"}</div>
                            <div className="font-bold">{service.technician || "-"}</div>
                        </div>
                        <div className="px-3 py-2 border-b border-black">
                            <p className="text-[9px] font-bold text-black uppercase tracking-wider mb-0.5">อาการเสีย:</p>
                            <div className="relative min-h-[96px]">
                                <div className="absolute inset-0 z-0">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="border-b border-black w-full h-6 border-dashed opacity-30"></div>
                                    ))}
                                </div>
                                <p className="text-xs text-black whitespace-pre-line leading-6 relative z-10 break-all">{service.description || ""}</p>
                            </div>
                        </div>
                        <div className="px-3 py-2 border-b border-black">
                            <p className="text-[9px] font-bold text-black uppercase tracking-wider mb-0.5">รายละเอียดการเข้าซ่อม:</p>
                            <div className="relative min-h-[96px]">
                                <div className="absolute inset-0 z-0">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="border-b border-black w-full h-6 border-dashed opacity-30"></div>
                                    ))}
                                </div>
                                <p className="text-xs text-black whitespace-pre-line leading-6 relative z-10 break-all">{service.techService || ""}</p>
                            </div>
                        </div>
                        <div className="px-3 py-2">
                            <p className="text-[9px] font-bold text-black uppercase tracking-wider mb-1.5">รายการอะไหล่ที่เปลี่ยน:</p>
                            <div className="border border-black rounded-none overflow-hidden mb-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-black bg-gray-100 print:bg-transparent">
                                            <th className="px-3 py-1.5 text-[9px] font-bold text-black uppercase tracking-wider w-1/3 border-r border-black">PART NUMBER</th>
                                            <th className="px-3 py-1.5 text-[9px] font-bold text-black uppercase tracking-wider border-r border-black">รายละเอียด</th>
                                            <th className="px-3 py-1.5 text-[9px] font-bold text-black uppercase tracking-wider w-20 text-center">จำนวน</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black">
                                        {(() => {
                                            const totalRows = 8;
                                            const dataRows = parts.map((part, i) => (
                                                <tr key={`part-${i}`} className="h-7 border-b border-black">
                                                    <td className="px-3 py-1 text-xs text-black break-all border-r border-black">{part.partNo}</td>
                                                    <td className="px-3 py-1 text-xs text-black border-r border-black break-all">{part.details}</td>
                                                    <td className="px-3 py-1 text-xs text-black text-center">{part.qty}</td>
                                                </tr>
                                            ));

                                            const emptyRows = [];
                                            for (let i = parts.length; i < totalRows; i++) {
                                                emptyRows.push(
                                                    <tr key={`empty-${i}`} className="h-7 border-b border-black">
                                                        <td className="px-3 py-1 text-xs text-black border-r border-black"></td>
                                                        <td className="px-3 py-1 text-xs text-black border-r border-black"></td>
                                                        <td className="px-3 py-1 text-xs text-black text-center"></td>
                                                    </tr>
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

                {/* Section: Signatures */}
                <div className="grid grid-cols-2 gap-12 mt-6 uppercase tracking-tighter">
                    <div className="text-center space-y-2">
                        <div className="border-b border-black w-full h-12"></div>
                        <div className="leading-tight">
                            <p className="text-xs font-bold text-black">ลงชื่อช่างผู้ปฏิบัติงาน</p>
                            <p className="text-[9px] text-black mt-1">(........................................................)</p>
                            <p className="text-[9px] text-black mt-0.5">วันที่: ......../......../........</p>
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="border-b border-black w-full h-12"></div>
                        <div className="leading-tight">
                            <p className="text-xs font-bold text-black">ลงชื่อลูกค้า / ผู้รับงาน</p>
                            <p className="text-[9px] text-black mt-1">(........................................................)</p>
                            <p className="text-[9px] text-black mt-0.5">วันที่: ......../......../........</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
