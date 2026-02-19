"use client";

import { useLoading } from "@/context/LoadingContext";
import { createOrUpdateCompany } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { TCompany } from "@/types/database";

interface CompanyFormProps {
  id?: string;
  companyData?: TCompany | null;
}

export function CompanyForm({ id, companyData }: CompanyFormProps) {
  const { withLoading } = useLoading();

  async function handleSubmit(formData: FormData) {
    await withLoading(async () => {
      try {
        await createOrUpdateCompany(formData);
      } catch (error) {
        console.error("Failed to save company:", error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {id && <input type="hidden" name="id" value={id} />}

      <div className="space-y-2">
        <label className="text-sm font-semibold">
          ชื่อบริษัท (ภาษาอังกฤษ/หลัก)
        </label>
        <Input
          name="name"
          defaultValue={companyData?.name || ""}
          placeholder="Ex. Acme Corp"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">
          ชื่อบริษัท (ภาษาไทย/รอง)
        </label>
        <Input
          name="nameSecondary"
          defaultValue={companyData?.nameSecondary || ""}
          placeholder="ตัวอย่าง: บริษัท แอคเม่ จำกัด"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">เลขประจำตัวผู้เสียภาษี</label>
        <Input
          name="taxId"
          defaultValue={companyData?.taxId || ""}
          placeholder="0123456789012"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">
          ข้อมูลการติดต่อ (ที่อยู่/เบอร์โทร)
        </label>
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
  );
}
