import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CompanyForm } from "@/components/CompanyForm";

export default async function CompanyFormPage({ params }: { params: Promise<{ id?: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const resolvedParams = await params;
    const id = resolvedParams.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    <CompanyForm id={id} companyData={companyData} />
                </CardContent>
            </Card>
        </div>
    );
}
