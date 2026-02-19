import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { dataProvider } from "@/db/provider";
import { SettingsDashboard } from "@/components/SettingsDashboard";
import { Metadata } from "next";
import { TUser, TTechnician } from "@/types/database";
import { Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | PFO Service App",
  description: "Manage your profile, team, and system preferences.",
};

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let userData;
  let technicians: TTechnician[] = [];
  try {
    userData = await dataProvider.findUserByUsername(session.username);
    technicians = await dataProvider.getTechnicians();
  } catch (error) {
    console.error("Error loading settings page data:", error);
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-destructive">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </h2>
        <p className="text-muted-foreground mt-2">
          กรุณาลองใหม่อีกครั้งในภายหลัง
        </p>
      </div>
    );
  }

  const currentUser = userData as unknown as TUser & {
    Role?: string;
    role?: string;
  };
  const dbRole = currentUser?.role || currentUser?.Role;

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl animate-in fade-in duration-500">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
          <Settings className="w-10 h-10 text-primary inline-block mr-2" />
          ตั้งค่า
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          จัดการโปรไฟล์ของคุณและทีมงานพนักงานช่าง
        </p>
      </div>

      <SettingsDashboard
        currentUser={{
          id: currentUser.id,
          name: currentUser.username,
          role: session.role || dbRole || "User",
          email: currentUser.email || "No email",
        }}
        technicians={technicians}
      />
    </div>
  );
}
