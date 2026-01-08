import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createOrUpdateCompany } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CompanyFormPage({ params }: { params: Promise<{ id?: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const resolvedParams = await params;
    const id = resolvedParams.id;
    let companyData: any = null;

    if (id) {
        companyData = await dataProvider.getCompanyById(id);
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl px-4">
            <div className="mb-6">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    กลับไปหน้าหลัก
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        {id ? "แก้ไขข้อมูลบริษัท" : "เพิ่มบริษัทใหม่"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createOrUpdateCompany} className="space-y-6">
                        {id && <input type="hidden" name="id" value={id} />}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">ชื่อบริษัท (ภาษาอังกฤษ/หลัก)</label>
                            <Input name="name" defaultValue={companyData?.name || ""} placeholder="Ex. Acme Corp" required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">ชื่อบริษัท (ภาษาไทย/รอง)</label>
                            <Input name="nameSecondary" defaultValue={companyData?.nameSecondary || ""} placeholder="ตัวอย่าง: บริษัท แอคเม่ จำกัด" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">เลขประจำตัวผู้เสียภาษี</label>
                            <Input name="taxId" defaultValue={companyData?.taxId || ""} placeholder="0123456789012" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">ข้อมูลการติดต่อ (ที่อยู่/เบอร์โทร)</label>
                            <textarea
                                name="contactInfo"
                                defaultValue={companyData?.contactInfo || ""}
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                placeholder="ที่อยู่, เบอร์โทร, อีเมล..."
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="gap-2">
                                <Save className="w-4 h-4" />
                                {id ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
