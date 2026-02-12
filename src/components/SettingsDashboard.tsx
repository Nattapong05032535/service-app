"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  Users,
  Shield,
  Bell,
  CheckCircle2,
  Trash2,
  Plus,
  Mail,
  Phone,
  X,
  Loader2,
  Pencil,
} from "lucide-react";
import { TTechnician } from "@/types/database";
import {
  updateUserProfileAction,
  addTechnicianAction,
  updateTechnicianAction,
  deleteTechnicianAction,
} from "@/app/actions/settings";

/**
 * Interface for SettingsDashboard Props
 */
interface ISettingsDashboardProps {
  currentUser: {
    id: string | number;
    name: string;
    role: string;
    email: string;
  };
  technicians: TTechnician[];
}

/**
 * Simple Modal Component
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md border animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-muted/30">
          <h3 className="font-bold text-xl tracking-tight">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 rounded-full hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/**
 * SettingsDashboard Component
 */
export function SettingsDashboard({
  currentUser,
  technicians,
}: ISettingsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"general" | "team">("general");

  const tabs = [
    { id: "general" as const, label: "ทั่วไป", icon: User },
    { id: "team" as const, label: "ทีมช่าง/พนักงาน", icon: Users },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 space-y-2 lg:sticky lg:top-8">
        <div className="p-2 bg-muted/30 rounded-2xl border backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 translate-x-2"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon
                className={`w-5 h-5 ${activeTab === tab.id ? "scale-110" : "opacity-70"}`}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full pb-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {activeTab === "general" && <GeneralSettings user={currentUser} />}
          {activeTab === "team" && <TeamSettings technicians={technicians} />}
        </div>
      </main>
    </div>
  );
}

/**
 * General Settings Section
 */
function GeneralSettings({
  user,
}: {
  user: ISettingsDashboardProps["currentUser"];
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateUserProfileAction(user.id, { name });
      if (result.success) {
        console.log("Profile updated");
      } else {
        alert("Failed to update profile: " + result.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="h-2 bg-linear-to-r from-blue-500 to-indigo-600" />
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">โปรไฟล์ผู้ใช้งาน</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            จัดการข้อมูลส่วนตัวและความปลอดภัยหลักของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl bg-muted/20 border-2 border-dashed border-muted">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl group-hover:scale-105 transition-transform duration-300">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-background p-1.5 rounded-full border shadow-sm">
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <p className="font-black text-2xl tracking-tight leading-none">
                {name}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border-none"
                >
                  {user.role}
                </Badge>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-sm font-bold ml-1">
                ชื่อ-นามสกุล / Username
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full flex h-12 rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:opacity-50 font-medium"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-bold ml-1 opacity-50">
                อีเมล (ไม่สามารถเปลี่ยนได้)
              </label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full flex h-12 rounded-xl border border-input bg-muted/30 px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed opacity-70 font-medium"
                disabled
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isPending || name === user.name}
              className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" /> การแจ้งเตือน
          </CardTitle>
          <CardDescription>
            เลือกวิธีที่คุณต้องการรับความเคลื่อนไหวจากระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationToggle
            title="อีเมลแจ้งเตือนงานใหม่"
            desc="รับอีเมลทันทีเมื่อมี Service Ticket ถูกเปิดขึ้นในระบบ"
            defaultChecked
            icon={<Mail className="w-5 h-5" />}
            color="bg-blue-100 text-blue-600"
          />
          <NotificationToggle
            title="สรุปผลงานประจำเดือน"
            desc="รับไฟล์ PDF สรุปภาพรวมงานซ่อมและประสิทธิภาพทีมช่างรายเดือน"
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="bg-purple-100 text-purple-600"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationToggle({
  title,
  desc,
  defaultChecked,
  icon,
  color,
}: {
  title: string;
  desc: string;
  defaultChecked?: boolean;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl border border-muted bg-background/30 hover:bg-muted/30 transition-colors group">
      <div className="flex items-start gap-4">
        <div
          className={`mt-1 p-3 rounded-xl ${color} transition-transform group-hover:scale-110 duration-300`}
        >
          {icon}
        </div>
        <div>
          <p className="font-bold text-base leading-tight">{title}</p>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {desc}
          </p>
        </div>
      </div>
      <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer h-6 w-11 opacity-0 cursor-pointer z-10"
        />
        <span className="absolute inset-0 rounded-full bg-input transition-colors peer-checked:bg-primary" />
        <span className="absolute left-1 h-4 w-4 rounded-full bg-background transition-transform peer-checked:translate-x-5" />
      </div>
    </div>
  );
}

/**
 * Team Management Section
 */
function TeamSettings({ technicians }: { technicians: TTechnician[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<TTechnician | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    setEditingTech(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tech: TTechnician) => {
    setEditingTech(tech);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    if (
      !confirm(
        "คุณรแน่ใจหรือไม่ที่จะลบรายชื่อช่างคนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้",
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteTechnicianAction(id);
      if (!result.success) alert(result.error);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      position: (formData.get("position") as string) || null,
      email: (formData.get("email") as string) || null,
      contactNumber: (formData.get("contactNumber") as string) || null,
      status: (formData.get("status") as "Active" | "Inactive") || "Active",
      notes: (formData.get("notes") as string) || null,
    };

    startTransition(async () => {
      let result;
      if (editingTech) {
        result = await updateTechnicianAction(editingTech.id, data);
      } else {
        result = await addTechnicianAction(data);
      }

      if (result.success) {
        setIsModalOpen(false);
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" /> รายชื่อทีมช่าง
            </h2>
            <p className="text-muted-foreground text-lg font-medium ml-1">
              จัดการพนักงานและช่างผู้ชำนาญการที่มีสิทธิ์ออกปฏิบัติงาน
            </p>
          </div>
          <Button
            className="h-12 px-6 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={handleAdd}
          >
            <Plus className="w-5 h-5" /> เพิ่มช่างใหม่
          </Button>
        </div>

        {technicians.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed rounded-3xl bg-muted/10 opacity-60">
            <Users className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
            <p className="mt-4 text-xl font-bold">ยังไม่มีรายชื่อทีมช่าง</p>
            <p className="text-muted-foreground">
              เริ่มเพิ่มช่างคนแรกเพื่อจัดการงานบริการได้ทันที
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {technicians.map((tech) => (
              <Card
                key={tech.id}
                className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group relative bg-card/70 backdrop-blur-sm"
              >
                <CardContent className="p-0">
                  <div className="p-6 flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-100 text-primary flex items-center justify-center text-2xl font-black shadow-inner transition-transform group-hover:rotate-3 duration-300">
                      {tech.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-xl truncate leading-tight">
                          {tech.name}
                        </p>
                        <Badge
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            tech.status === "Active"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none"
                              : "bg-muted text-muted-foreground hover:bg-muted/80 border-none"
                          }`}
                        >
                          {tech.status || "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm text-indigo-500 font-bold mt-1">
                        {tech.position || "Staff / Technician"}
                      </p>

                      <div className="mt-5 space-y-2">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium group/item cursor-pointer hover:text-foreground transition-colors">
                          <div className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground group-hover/item:text-primary group-hover/item:bg-primary/10 transition-colors">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{tech.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium group/item cursor-pointer hover:text-foreground transition-colors">
                          <div className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground group-hover/item:text-emerald-500 group-hover/item:bg-emerald-50 transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold">
                            {tech.contactNumber || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 px-4 py-3 flex justify-end gap-2 border-t border-muted/50 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-4 rounded-xl font-bold bg-background/50 hover:bg-background shadow-sm text-foreground/80 hover:text-foreground gap-2 transition-all active:scale-95"
                      onClick={() => handleEdit(tech)}
                    >
                      <Pencil className="w-4 h-4 text-primary" /> แก้ไขข้อมูล
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-4 rounded-xl font-bold text-destructive hover:bg-destructive/10 bg-destructive/5 gap-2 transition-all active:scale-95"
                      onClick={() => handleDelete(tech.id)}
                    >
                      <Trash2 className="w-4 h-4" /> ลบ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTech ? "⚙️ แก้ไขข้อมูลช่าง" : "✨ เพิ่มข้อมูลช่างใหม่"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">
              ชื่อ-นามสกุล <span className="text-destructive">*</span>
            </label>
            <input
              name="name"
              type="text"
              defaultValue={editingTech?.name}
              required
              placeholder="เช่น นายสมชาย สายลวด"
              className="w-full flex h-12 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">ตำแหน่ง</label>
            <input
              name="position"
              type="text"
              defaultValue={editingTech?.position ?? ""}
              placeholder="เช่น Lead Technician, Support"
              className="w-full flex h-12 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">อีเมล</label>
              <input
                name="email"
                type="email"
                defaultValue={editingTech?.email ?? ""}
                placeholder="ชื่อ@ตัวอย่าง.com"
                className="w-full flex h-12 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">เบอร์โทรศัพท์</label>
              <input
                name="contactNumber"
                type="text"
                defaultValue={editingTech?.contactNumber ?? ""}
                placeholder="0XX-XXXXXXX"
                className="w-full flex h-12 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">สถานะพนักงาน</label>
            <select
              name="status"
              defaultValue={editingTech?.status ?? "Active"}
              className="w-full flex h-12 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold appearance-none cursor-pointer"
            >
              <option value="Active">Active (พร้อมปฏิบัติงาน)</option>
              <option value="Inactive">Inactive (พักงาน / ลาออก)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-12 px-6 rounded-xl font-bold bg-muted/20 border-none hover:bg-muted"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 min-w-[120px]"
            >
              {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {editingTech ? "บันทึกการแก้ไข" : "สร้างรายชื่อช่าง"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
