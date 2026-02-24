"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Calendar, Clock, ClipboardList, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWarranty, deleteWarranty } from "@/app/actions/business";
import { useLoading } from "@/context/LoadingContext";
import { TWarranty } from "@/types/database";

interface EditWarrantyDialogProps {
    warranty: TWarranty;
    productId: string;
    trigger?: React.ReactNode;
}

export function EditWarrantyDialog({ warranty, productId, trigger }: EditWarrantyDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { withLoading } = useLoading();

    // Format dates for input type="date"
    const formatDateForInput = (dateStr: string | Date) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    async function handleSubmit(formData: FormData) {
        await withLoading(async () => {
            try {
                await updateWarranty(formData);
                setIsOpen(false);
            } catch (error) {
                console.error("Failed to update warranty:", error);
            }
        });
    }

    async function handleDelete() {
        if (!confirm("คุณต้องการลบข้อมูลความคุ้มครองนี้ใช่หรือไม่? แผนงานบริการ (PM) ที่เกี่ยวข้องจะถูกลบออกด้วย")) return;

        await withLoading(async () => {
            try {
                await deleteWarranty(String(warranty.id), productId);
                setIsOpen(false);
            } catch (error) {
                console.error("Failed to delete warranty:", error);
            }
        });
    }

    const triggerElement = React.isValidElement(trigger)
        ? React.cloneElement(trigger as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
            onClick: (e: React.MouseEvent) => {
                const triggerProps = trigger.props as { onClick?: React.MouseEventHandler };
                if (triggerProps.onClick) triggerProps.onClick(e);
                setIsOpen(true);
            }
        })
        : <div onClick={() => setIsOpen(true)}>{trigger}</div>;

    return (
        <>
            {triggerElement}

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
                                    <h3 className="text-xl font-bold">แก้ไขข้อมูลความคุ้มครอง</h3>
                                    <p className="text-sm text-muted-foreground">ปรับปรุงรายละเอียดการรับประกันหรือสัญญา MA</p>
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
                            <input type="hidden" name="id" value={warranty.id} />
                            <input type="hidden" name="productId" value={productId} />

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-primary/60" /> ประเภทความคุ้มครอง
                                </label>
                                <select
                                    name="type"
                                    defaultValue={warranty.type || "ประกันรวมอะไหล่"}
                                    className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    required
                                >
                                    <option value="ประกันรวมอะไหล่">ประกันรวมอะไหล่</option>
                                    <option value="ประกันไม่รวมอะไหล่">ประกันไม่รวมอะไหล่</option>
                                    <option value="บริการรายปี (MA)">บริการรายปี (MA)</option>
                                    <option value="บริการรายครั้ง">บริการรายครั้ง</option>
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
                                        defaultValue={formatDateForInput(warranty.startDate)}
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
                                        defaultValue={formatDateForInput(warranty.endDate)}
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-primary/60" /> หมายเหตุ
                                </label>
                                <textarea
                                    name="notes"
                                    defaultValue={warranty.notes || ""}
                                    className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                    placeholder="บันทึกหมายเหตุเพิ่มเติม (ถ้ามี)"
                                />
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <div className="flex gap-3">
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
                                        className="flex-[2] h-12 rounded-xl gap-2 font-bold px-8 shadow-lg shadow-primary/25"
                                    >
                                        <Save className="w-5 h-5" />
                                        บันทึกการแก้ไข
                                    </Button>
                                </div>
                                
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-11 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    ลบข้อมูลความคุ้มครอง
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
