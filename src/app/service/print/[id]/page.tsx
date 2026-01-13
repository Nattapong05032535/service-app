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
        <div className="min-h-screen bg-white md:p-8 print:p-0">
            <style dangerouslySetInnerHTML={{ __html: `
                nav { display: none !important; }
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                    nav { display: none !important; }
                }
            `}} />
            
            {/* Print Header/Actions */}
            <div className="flex justify-between items-center mb-6 print:hidden max-w-4xl mx-auto px-4">
                <h1 className="text-xl font-bold text-slate-800">เอกสารใบงานบริการ</h1>
                <PrintServiceButton />
            </div>

            {/* Document Content */}
            <div className="max-w-4xl mx-auto border-2 border-slate-100 p-6 rounded-3xl print:border-none print:p-0">
                {/* Logo & Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-2 mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                <Hammer className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Service Order</h2>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">ใบสั่งงาน / บันทึกการปฏิบัติงาน</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block bg-slate-100 px-3 py-1 rounded-lg mb-1">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-0.5">Order No.</p>
                            <p className="text-base font-mono font-bold text-slate-800 leading-none">#{service.orderCase || "-"}</p>
                        </div>
                        <p className="text-[10px] text-slate-500">วันที่: {new Date(service.entryTime).toLocaleDateString('th-TH')}</p>
                    </div>
                </div>

                {/* Section: Customer & Product Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-2">ข้อมูลลูกค้า</h3>
                        <div className="bg-slate-50 p-2 rounded-xl space-y-0.5">
                            <div className="flex items-start gap-2">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <div className="leading-tight">
                                    <p className="font-bold text-xs text-slate-800">{company?.name || "-"}</p>
                                    <p className="text-[10px] text-slate-500">{company?.nameSecondary || ""}</p>
                                </div>
                            </div>
                            {company?.taxId && (
                                <p className="text-[10px] text-slate-600 pl-5">Tax ID: {company.taxId}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-2">ข้อมูลสินค้า</h3>
                        <div className="bg-slate-50 p-2 rounded-xl space-y-0.5">
                            <div className="flex items-start gap-2">
                                <Package className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <div className="leading-tight">
                                    <p className="font-bold text-xs text-slate-800">{product?.name || "-"}</p>
                                    <p className="text-[10px] font-mono text-slate-600">S/N: {product?.serialNumber || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pl-5">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <p className="text-[10px] text-slate-600 truncate">ซื้อเมื่อ: {product?.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString('th-TH') : "-"}</p>
                            </div>
                            <div className="flex items-center gap-2 pl-5">
                                <ShieldCheck className="w-3 h-3 text-slate-400" />
                                <p className="text-[10px] text-slate-600 truncate">ความคุ้มครอง: {warranty?.type || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Service Details */}
                <div className="space-y-2 mb-4">
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest border-l-4 border-primary pl-2">รายละเอียดงาน ({service.type})</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-slate-700">
                        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 px-3 py-1 font-bold text-[10px]">
                            <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> เวลาเข้าปฏิบัติงาน</div>
                            <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> เวลาออกปฏิบัติงาน</div>
                            <div className="flex items-center gap-2"><User className="w-3 h-3" /> ชื่อช่างผู้ดูแล</div>
                        </div>
                        <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] border-b border-slate-100">
                            <div>{new Date(service.entryTime).toLocaleString('th-TH')}</div>
                            <div>{service.exitTime ? new Date(service.exitTime).toLocaleString('th-TH') : "ยังไม่ระบุ"}</div>
                            <div className="font-bold">{service.technician || "-"}</div>
                        </div>
                        <div className="px-3 py-2 border-b border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">อาการเสีย:</p>
                            <div className="relative min-h-[96px]">
                                <div className="absolute inset-0 z-0">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="border-b border-slate-200 w-full h-6 border-dashed"></div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-800 whitespace-pre-line leading-6 relative z-10 break-all">{service.description || ""}</p>
                            </div>
                        </div>
                        <div className="px-3 py-2 border-b border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">รายละเอียดการเข้าซ่อม:</p>
                            <div className="relative min-h-[96px]">
                                <div className="absolute inset-0 z-0">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="border-b border-slate-200 w-full h-6 border-dashed"></div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-800 whitespace-pre-line leading-6 relative z-10 break-all">{service.techService || ""}</p>
                            </div>
                        </div>
                        <div className="px-3 py-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">รายการอะไหล่ที่เปลี่ยน:</p>
                            <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider w-1/3">PART NUMBER</th>
                                <th className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-l border-slate-200">รายละเอียด</th>
                                <th className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-l border-slate-200 w-20 text-center">จำนวน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(() => {
                                const totalRows = 8;
                                const dataRows = parts.map((part, i) => (
                                    <tr key={`part-${i}`} className="h-7">
                                        <td className="px-3 py-1 text-xs text-slate-700 break-all">{part.partNo}</td>
                                        <td className="px-3 py-1 text-xs text-slate-700 border-l border-slate-200 break-all">{part.details}</td>
                                        <td className="px-3 py-1 text-xs text-slate-700 border-l border-slate-200 text-center">{part.qty}</td>
                                    </tr>
                                ));

                                const emptyRows = [];
                                for (let i = parts.length; i < totalRows; i++) {
                                    emptyRows.push(
                                        <tr key={`empty-${i}`} className="h-7">
                                            <td className="px-3 py-1 text-xs text-slate-700"></td>
                                            <td className="px-3 py-1 text-xs text-slate-700 border-l border-slate-200"></td>
                                            <td className="px-3 py-1 text-xs text-slate-700 border-l border-slate-200 text-center"></td>
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
                        <div className="border-b border-slate-300 w-full h-12"></div>
                        <div className="leading-tight">
                            <p className="text-xs font-bold text-slate-800">ลงชื่อช่างผู้ปฏิบัติงาน</p>
                            <p className="text-[9px] text-slate-400 mt-1">(........................................................)</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">วันที่: ......../......../........</p>
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="border-b border-slate-300 w-full h-12"></div>
                        <div className="leading-tight">
                            <p className="text-xs font-bold text-slate-800">ลงชื่อลูกค้า / ผู้รับงาน</p>
                            <p className="text-[9px] text-slate-400 mt-1">(........................................................)</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">วันที่: ......../......../........</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
