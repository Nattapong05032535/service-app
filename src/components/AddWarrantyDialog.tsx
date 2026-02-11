"use client";

import { useState } from "react";
import { Plus, X, ShieldCheck, Calendar, Clock, ClipboardList, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWarranty } from "@/app/actions/business";
import { useLoading } from "@/context/LoadingContext";

export function AddWarrantyDialog({ productId }: { productId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { withLoading } = useLoading();

    async function handleSubmit(formData: FormData) {
        await withLoading(async () => {
            try {
                await createWarranty(formData);
                setIsOpen(false);
            } catch (error) {
                console.error("Failed to create warranty:", error);
            }
        });
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2 px-4"
            >
                <Plus className="w-5 h-5" />
                <span className="font-bold">เพิ่มความคุ้มครอง / MA</span>
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
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">บันทึกข้อมูลความคุ้มครอง</h3>
                                    <p className="text-sm text-muted-foreground">บันทึกการรับประกันหรือสัญญา MA ใหม่</p>
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
                            <input type="hidden" name="productId" value={productId} />

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-primary/60" /> ประเภทความคุ้มครอง
                                </label>
                                <select
                                    name="type"
                                    className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    required
                                >
                                    <option value="ประกันรวมอะไหล่">ประกันรวมอะไหล่</option>
                                    <option value="ประกันไม่รวมอะไหล่">ประกันไม่รวมอะไหล่</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary/60" /> วันที่เริ่ม
                                    </label>
                                    <Input
                                        name="startDate"
                                        type="date"
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary/60" /> วันที่สิ้นสุด
                                    </label>
                                    <Input
                                        name="endDate"
                                        type="date"
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Repeat className="w-4 h-4 text-primary/60" /> จำนวนครั้ง PM
                                    </label>
                                    <Input
                                        name="pmCount"
                                        type="number"
                                        min="0"
                                        defaultValue="0"
                                        className="h-11 rounded-xl"
                                        placeholder="จำนวนครั้ง"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary/60" /> ทุกกี่เดือน
                                    </label>
                                    <select
                                        name="pmInterval"
                                        className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                                            <option key={month} value={month}>
                                                {month} เดือนครั้ง{month === 12 ? " (รายปี)" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-primary/60" /> หมายเหตุ
                                </label>
                                <textarea
                                    name="notes"
                                    className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                    placeholder="บันทึกหมายเหตุเพิ่มเติม (ถ้ามี)"
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
                                    บันทึกข้อมูล
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
