"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { 
    Upload, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    Table as TableIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { importDataAction } from "@/app/actions/business";

export default function ImportPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{ success: boolean; count: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const wb = XLSX.read(bstr, { type: "binary" });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws);

                    if (data.length === 0) {
                        setError("ไม่พบข้อมูลในไฟล์");
                        setIsProcessing(true);
                        return;
                    }
                    
                    // Sanitize data to plain objects to avoid Next.js Server Action serialization errors
                    const plainData = JSON.parse(JSON.stringify(data));
                    const res = await importDataAction(plainData);
                    setResult(res);
                } catch (err) {
                    console.error(err);
                    setError("เกิดข้อผิดพลาดในการประมวลผลไฟล์");
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            console.error(err);
            setError("ไม่สามารถอ่านไฟล์ได้");
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight">นำเข้าข้อมูล</h1>
                <p className="text-muted-foreground mt-1">อัปโหลดไฟล์ (.xlsx) เพื่อนำเข้าข้อมูลสินค้าและการรับประกัน</p>
            </div>

            <div className="grid gap-6">
                <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                    <CardContent className="pt-10 pb-10">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">อัปโหลดไฟล์ Excel</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                เลือกไฟล์ .xlsx ที่มีรูปแบบข้อมูลตามที่กำหนด
                            </p>
                            
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isProcessing}
                                />
                                <Button className="gap-2 pointer-events-none" disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            กำลังประมวลผล...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4" />
                                            เลือกไฟล์
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-4 flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="font-medium">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {result && (
                    <Card className="border-emerald-200 bg-emerald-50">
                        <CardContent className="py-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-900">นำเข้าข้อมูลสำเร็จ!</h3>
                            <p className="text-emerald-700 mt-1">
                                ระบบได้นำเข้าข้อมูลทั้งหมด <strong>{result.count}</strong> รายการ เรียบร้อยแล้ว
                            </p>
                            <div className="mt-6 flex justify-center gap-3">
                                <Button variant="outline" onClick={() => setResult(null)}>
                                    นำเข้าเพิ่ม
                                </Button>
                                <Button onClick={() => window.location.href = "/dashboard"}>
                                    ไปที่ Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TableIcon className="w-5 h-5 text-primary" />
                            รูปแบบข้อมูลที่รองรับ
                        </CardTitle>
                        <p className="text-sm text-slate-500">
                            กรุณาตรวจสอบให้แน่ใจว่าไฟล์ Excel ของคุณมีคอลัมน์ดังนี้
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50">
                                        <th className="px-4 py-2 text-left font-semibold">คอลัมน์</th>
                                        <th className="px-4 py-2 text-left font-semibold">คำอธิบาย</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="px-4 py-2 font-medium">ชื่อลูกค้า</td>
                                        <td className="px-4 py-2 text-muted-foreground">ชื่อบริษัทลูกค้า</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">สินค้า</td>
                                        <td className="px-4 py-2 text-muted-foreground">ชื่อรุ่น/ยี่ห้อสินค้า</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">เลขที่ซีเรียลสินค้า</td>
                                        <td className="px-4 py-2 text-muted-foreground">Serial Number</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">วันที่ซื้อ</td>
                                        <td className="px-4 py-2 text-muted-foreground">รูปแบบ MM/DD/YYYY (ปี พ.ศ.)</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">สถานะการรับประกัน</td>
                                        <td className="px-4 py-2 text-muted-foreground">ระบุเพื่อบันทึกการรับประกัน</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">วันที่สิ้นสุดการรับประกัน</td>
                                        <td className="px-4 py-2 text-muted-foreground">รูปแบบ MM/DD/YYYY (ปี พ.ศ.)</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">สถานะ PM</td>
                                        <td className="px-4 py-2 text-muted-foreground">บันทึกเพิ่มเติมในส่วนหมายเหตุ</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
