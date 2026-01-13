"use client";

import { useState } from "react";
import { Plus, X, Hammer, ClipboardList, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createService } from "@/app/actions/business";
import { useLoading } from "@/context/LoadingContext";

export function AddServiceDialog({ warrantyId }: { warrantyId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { withLoading } = useLoading();

    async function handleSubmit(formData: FormData) {
        await withLoading(async () => {
            try {
                await createService(formData);
                setIsOpen(false);
            } catch (error) {
                console.error("Failed to create service:", error);
            }
        });
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2 px-6 font-bold"
            >
                <Plus className="w-5 h-5" />
                บันทึกการบริการ
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Hammer className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">เพิ่มประวัติการบริการ</h3>
                                    <p className="text-sm text-muted-foreground">บันทึกข้อมูล CM / งานบริการอื่นๆ</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form action={handleSubmit} className="space-y-5">
                            <input type="hidden" name="warrantyId" value={warrantyId} />

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-primary/60" /> ประเภทบริการ
                                </label>
                                <select
                                    name="type"
                                    className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    required
                                >
                                    <option value="PM">PM (การซ่อมบำรุงเชิงป้องกัน)</option>
                                    <option value="CM">CM (การซ่อมบำรุงเชิงแก้ไข)</option>
                                    <option value="SERVICE">SERVICE (บริการอื่นๆ)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary/60" /> วันที่/เวลา เข้า
                                    </label>
                                    <Input
                                        name="entryTime"
                                        type="datetime-local"
                                        defaultValue={new Date().toISOString().slice(0, 16)}
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary/60" /> วันที่/เวลา ออก
                                    </label>
                                    <Input
                                        name="exitTime"
                                        type="datetime-local"
                                        defaultValue={new Date().toISOString().slice(0, 16)}
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Info className="w-4 h-4 text-primary/60" /> รายละเอียด
                                </label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="ระบุรายละเอียดงานที่ทำ..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl"
                                    onClick={() => setIsOpen(false)}
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-2 h-12 rounded-xl gap-2 font-bold px-8 shadow-lg shadow-primary/25"
                                >
                                    <Plus className="w-5 h-5" />
                                    บันทึกข้อมูลบริการ
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
