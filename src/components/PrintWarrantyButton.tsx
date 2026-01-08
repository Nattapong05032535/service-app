"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintWarrantyButtonProps {
    warranty: any;
    product: any;
    company: any;
}

export function PrintWarrantyButton({ warranty, product, company }: PrintWarrantyButtonProps) {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const formatThaiDate = (dateStr: string) => {
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear() + 543; // Convert to Buddhist year
            return `${day}/${month}/${year}`;
        };

        const wStart = formatThaiDate(warranty.startDate);
        const wEnd = formatThaiDate(warranty.endDate);

        printWindow.document.write(`
            <html>
                <head>
                    <title> </title>
                    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 0;
                        }
                        body { 
                            font-family: 'Sarabun', sans-serif; 
                            padding: 0; 
                            color: #000; 
                            margin: 0; 
                            font-size: 14px;
                        }
                        .page { 
                            width: 100%;
                            box-sizing: border-box; 
                            padding: 45mm 15mm 15mm 15mm;
                        }
                        
                        .log-header-row { 
                            display: flex; 
                            border-bottom: 1px solid #000; 
                            padding: 5px 0; 
                            font-size: 14px;
                        }
                        .log-header-row .label { 
                            font-weight: bold; 
                            white-space: nowrap;
                        }
                        .log-header-row .value { 
                            margin-left: 5px; 
                            flex-grow: 1; 
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        
                        .log-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 15px; 
                        }
                        .log-table th, .log-table td { 
                            border: 1px solid #000; 
                            padding: 8px 4px; 
                            font-size: 14px; 
                            text-align: center;
                        }
                        .log-table th { background: #f5f5f5; }
                        .log-table td.text-left { text-align: left; }
                        
                        .col-date { width: 85px; }
                        .col-time { width: 45px; }
                        .col-item { width: auto; }
                        .col-sig { width: 90px; }
                        .col-note { width: 90px; }

                        @media print {
                            .page { border: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page service-log">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                           <div style="font-size: 14px;"><b>ผู้ขาย:</b> .......................................................................</div>
                           <div style="font-size: 14px;"><b>ลำดับที่:</b> ....................... / ........................</div>
                        </div>
                        
                        <div class="log-header-row" style="margin-top: 15px;">
                            <div style="width: 35%; display: flex;">
                                <span class="label">ชื่อบริษัท:</span> <span class="value">${company.name}</span>
                            </div>
                            <div style="width: 30%; display: flex;">
                            </div>
                            <div style="flex-grow: 1; display: flex;">
                                <span class="label">ตามเลขที่บิล:</span> <span class="value"></span>
                            </div>
                        </div>
                        <div class="log-header-row">
                            <div style="width: 35%; display: flex;">
                                <span class="label">ผู้ติดต่อ:</span> <span class="value">${product.contactPerson || ""}</span>
                            </div>
                            <div style="width: 30%; display: flex;">
                            </div>
                            <div style="flex-grow: 1; display: flex;">
                                <span class="label">โทรศัพท์:</span> <span class="value">${company.contactInfo || ""}</span>
                            </div>
                        </div>
                        <div class="log-header-row">
                            <span class="label">ที่อยู่/ที่ตั้ง:</span> <span class="value">${product.branch || ""}</span>
                        </div>
                        <div class="log-header-row">
                            <div style="width: 35%; display: flex;">
                                <span class="label">ยี่ห้อ:</span> <span class="value">${product.brand || ""}</span>
                            </div>
                            <div style="width: 30%; display: flex;">
                                <span class="label">รุ่น:</span> <span class="value">${product.name || ""}</span>
                            </div>
                            <div style="flex-grow: 1; display: flex;">
                                <span class="label">หมายเลขเครื่อง:</span> <span class="value"><b>${product.serialNumber}</b></span>
                            </div>
                        </div>
                        <div class="log-header-row">
                            <div style="width: 35%; display: flex;">
                                <span class="label">วันเริ่ม:</span> <span class="value">${wStart}</span>
                            </div>
                            <div style="width: 30%; display: flex;">
                                <span class="label">วันสิ้นสุด:</span> <span class="value">${wEnd}</span>
                            </div>
                            <div style="flex-grow: 1; display: flex;">
                            </div>
                        </div>

                        <div class="log-header-row">
                            <span class="label">หมายเหตุ:</span> <span class="value">${warranty.notes || ""}</span>
                        </div>

                        <table class="log-table">
                            <thead>
                                <tr>
                                    <th rowspan="2" class="col-date">วัน เดือน ปี</th>
                                    <th colspan="2">เวลา</th>
                                    <th rowspan="2" class="col-item">รายการ</th>
                                    <th rowspan="2" class="col-sig">ลายเซ็นลูกค้า</th>
                                    <th rowspan="2" class="col-sig">ลายเซ็นช่าง</th>
                                    <th rowspan="2" class="col-note">หมายเหตุ</th>
                                </tr>
                                <tr>
                                    <th class="col-time">เข้า</th>
                                    <th class="col-time">ออก</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Array(11).fill(0).map((_, i) => `
                                    <tr>
                                        <td style="height: 38px;"></td>
                                        <td></td>
                                        <td></td>
                                        <td class="text-left" style="color: #444; font-size: 12px;">
                                            ${i < (warranty.pmCount || 0) ? "ตรวจเช็คและทำความสะอาดเครื่อง" : ""}
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <script>
                        window.onload = () => {
                            window.print();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-slate-400"
            title="ปริ้นตารางงานบริการ (A5)"
        >
            <Printer className="w-4 h-4" />
        </Button>
    );
}
