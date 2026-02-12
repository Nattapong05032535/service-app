"use client";

import { useState } from "react";
import { X, Package, Hash, Calendar, User, MapPin, Phone, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProduct } from "@/app/actions/business";
import { Product } from "@/types/database";
import { useLoading } from "@/context/LoadingContext";

export function EditProductDialog({ product }: { product: Product }) {
    const [isOpen, setIsOpen] = useState(false);
    const { withLoading } = useLoading();

    async function handleSubmit(formData: FormData) {
        await withLoading(async () => {
            try {
                await updateProduct(formData);
                setIsOpen(false);
            } catch (error) {
                console.error("Failed to update product:", error);
                alert("Failed to update product");
            }
        });
    }

    // Helper to safely format date
    const getFormattedDate = (date: any) => {
        if (!date) return "";
        // If it's already a date object
        if (date instanceof Date) return date.toISOString().split('T')[0];
        // If string
        return String(date).split('T')[0];
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="gap-2"
            >
                <Edit className="w-4 h-4" />
                แก้ไขข้อมูล
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dialog Content */}
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                    <Edit className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">แก้ไขข้อมูลสินค้า</h3>
                                    <p className="text-sm text-muted-foreground">ปรับปรุงรายละเอียดสินค้า</p>
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
                            <input type="hidden" name="id" value={product.id} />
                            <input type="hidden" name="companyId" value={product.companyId || ""} />

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Package className="w-4 h-4 text-primary/60" /> ชื่อสินค้า
                                </label>
                                <Input
                                    name="name"
                                    defaultValue={product.name}
                                    placeholder="เช่น เครื่องสแกนลายนิ้วมือ ZKTeco"
                                    required
                                    className="h-11 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-primary/60" /> Serial No.
                                    </label>
                                    <Input
                                        name="serialNumber"
                                        defaultValue={product.serialNumber}
                                        placeholder="ระบุรหัสซีเรียล"
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary/60" /> สาขา
                                    </label>
                                    <Input
                                        name="branch"
                                        defaultValue={product.branch || ""}
                                        placeholder="เช่น สาขาพระราม 9"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary/60" /> วันที่ซื้อ
                                    </label>
                                    <Input
                                        name="purchaseDate"
                                        type="date"
                                        defaultValue={getFormattedDate(product.purchaseDate)}
                                        required
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary/60" /> ผู้ติดต่อ
                                    </label>
                                    <Input
                                        name="contactPerson"
                                        defaultValue={product.contactPerson || ""}
                                        placeholder="ระบุชื่อผู้ดูแล"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary/60" /> เบอร์โทรศัพท์
                                </label>
                                <Input
                                    name="phoneNumber"
                                    defaultValue={product.phoneNumber || ""}
                                    placeholder="ระบุเบอร์โทรศัพท์"
                                    className="h-11 rounded-xl"
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
                                    <Edit className="w-5 h-5" />
                                    บันทึกการแก้ไข
                                </Button>
                            </div>
                        </form>

                        {/* Subtle Gradient Shadow */}
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    </div>
                </div>
            )}
        </>
    );
}
