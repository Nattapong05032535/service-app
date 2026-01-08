"use client";

import { useState } from "react";
import { X, Hammer, Clock, User, FileText, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateServiceAction } from "@/app/actions/business";
import { cn } from "@/lib/utils";

interface EditServiceDialogProps {
    service: any;
    warrantyId: string;
    trigger?: React.ReactNode;
}

export function EditServiceDialog({ service, warrantyId, trigger }: EditServiceDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            await updateServiceAction(formData);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update service:", error);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            <div onClick={() => setIsOpen(true)}>
                {trigger || (
                    <Button variant="outline" size="sm">แก้ไข</Button>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => !isPending && setIsOpen(false)}
                    />

                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Hammer className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">ปรับแต่งข้อมูลงานบริการ / PM</h3>
                                    <p className="text-sm text-muted-foreground">{service.type} - {new Date(service.entryTime).toLocaleDateString('th-TH')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                disabled={isPending}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form action={handleSubmit} className="space-y-4">
                            <input type="hidden" name="id" value={service.id} />
                            <input type="hidden" name="warrantyId" value={warrantyId} />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary/60" /> เวลาเข้าจริง
                                    </label>
                                    <Input
                                        name="entryTime"
                                        type="datetime-local"
                                        defaultValue={service.entryTime ? new Date(service.entryTime).toISOString().slice(0, 16) : ""}
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary/60" /> เวลาออกจริง
                                    </label>
                                    <Input
                                        name="exitTime"
                                        type="datetime-local"
                                        defaultValue={service.exitTime ? new Date(service.exitTime).toISOString().slice(0, 16) : ""}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary/60" /> ชื่อผู้เข้าทำ (ช่าง)
                                </label>
                                <Input
                                    name="technician"
                                    defaultValue={service.technician || ""}
                                    placeholder="ระบุชื่อช่างที่เข้าปฏิบัติงาน"
                                    className="h-11 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary/60" /> รายละเอียดงาน / หมายเหตุ
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    defaultValue={service.description || ""}
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="ระบุรายละเอียดงานที่ทำเพิ่มเติม..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary/60" /> สถานะการดำเนินงาน
                                </label>
                                <select
                                    name="status"
                                    defaultValue={service.status || "รอดำเนินการ"}
                                    className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="รอดำเนินการ">รอดำเนินการ (Draft/Scheduled)</option>
                                    <option value="เสร็จสิ้น">เสร็จสิ้น (Completed)</option>
                                    <option value="ยกเลิก">ยกเลิก (Cancelled)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isPending}
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-2 h-12 rounded-xl gap-2 font-bold px-8 shadow-lg shadow-primary/25"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5" />
                                    )}
                                    บันทึกผลการทำงาน
                                </Button>
                            </div>
                        </form>

                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    </div>
                </div>
            )}
        </>
    );
}
