"use client";

import { useState, useEffect } from "react";
import {
  X,
  Hammer,
  Clock,
  User,
  FileText,
  CheckCircle2,
  ClipboardList,
  Plus,
  Trash2,
  Package,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateServiceAction,
  getServicePartsAction,
  getTechniciansAction,
} from "@/app/actions/business";
import { TService, TTechnician } from "@/types/database";

import { useLoading } from "@/context/LoadingContext";
import { formatDate } from "@/lib/utils";

interface EditServiceDialogProps {
  service: TService;
  warrantyId?: string | number;
  trigger?: React.ReactNode;
}

interface PartItem {
  partNo: string;
  details: string;
  qty: string;
}

export function EditServiceDialog({
  service,
  warrantyId,
  trigger,
}: EditServiceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { withLoading } = useLoading();

  const [parts, setParts] = useState<PartItem[]>([]);
  const [hasParts, setHasParts] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);

  const [technicians, setTechnicians] = useState<TTechnician[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);

  // Initialize selected technicians from service prop
  useEffect(() => {
    if (service.technicians && Array.isArray(service.technicians)) {
      setSelectedTechnicians(service.technicians);
    }
  }, [service.technicians]);

  // Fetch parts and technicians when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchTechnicians = async () => {
        setIsLoadingTechnicians(true);
        try {
          const data = await getTechniciansAction("Active");
          setTechnicians(data);
        } catch (error) {
          console.error("Failed to fetch technicians:", error);
        } finally {
          setIsLoadingTechnicians(false);
        }
      };
      fetchTechnicians();

      if (service.orderCase) {
        const fetchParts = async () => {
          setIsLoadingParts(true);
          try {
            const data = await getServicePartsAction(service.orderCase || "");
            if (data && data.length > 0) {
              setParts(
                data.map((p) => ({
                  partNo: p.partNo || "",
                  details: p.details || "",
                  qty: String(p.qty || 0),
                })),
              );
              setHasParts(true);
            }
          } catch (error) {
            console.error("Failed to fetch parts:", error);
          } finally {
            setIsLoadingParts(false);
          }
        };
        fetchParts();
      }
    }
  }, [isOpen, service.orderCase]);

  const addPart = () => {
    setParts([...parts, { partNo: "", details: "", qty: "1" }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof PartItem, value: string) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  async function handleSubmit(formData: FormData) {
    console.log("EditServiceDialog: handleSubmit started");
    // If hasParts is false, we send an empty array
    const finalParts = hasParts ? parts : [];
    formData.set("partsjson", JSON.stringify(finalParts));
    formData.set("techniciansJson", JSON.stringify(selectedTechnicians));

    await withLoading(async () => {
      try {
        await updateServiceAction(formData);
        setIsOpen(false);
      } catch (error) {
        console.error("Failed to update service:", error);
      }
    });
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button variant="outline" size="sm">
            แก้ไข
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Hammer className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    ปรับแต่งข้อมูลงานบริการ / PM
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.type}{" "}
                    {service.orderCase ? `(${service.orderCase})` : ""} -{" "}
                    {formatDate(service.entryTime)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmit(formData);
              }}
              className="space-y-6 overflow-y-auto pr-2 custom-scrollbar"
            >
              <input type="hidden" name="id" value={service.id} />
              {service.productId && (
                <input
                  type="hidden"
                  name="productId"
                  value={service.productId}
                />
              )}
              {warrantyId && warrantyId !== "undefined" && (
                <input type="hidden" name="warrantyId" value={warrantyId} />
              )}
              <input
                type="hidden"
                name="partsjson"
                value={JSON.stringify(hasParts ? parts : [])}
              />
              <input
                type="hidden"
                name="techniciansJson"
                value={JSON.stringify(selectedTechnicians)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary/60" /> เวลาเข้าจริง
                  </label>
                  <Input
                    name="entryTime"
                    type="datetime-local"
                    defaultValue={
                      service.entryTime
                        ? new Date(service.entryTime).toISOString().slice(0, 16)
                        : ""
                    }
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
                    defaultValue={
                      service.exitTime
                        ? new Date(service.exitTime).toISOString().slice(0, 16)
                        : ""
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-primary/60" /> ชื่อผู้เข้าทำ
                  (ช่าง)
                </label>

                {/* Selected Technicians (Tags) */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {technicians
                    .filter((t) => selectedTechnicians.includes(String(t.id)))
                    .map((tech) => (
                      <Badge
                        key={tech.id}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 h-7 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        <span className="text-xs font-medium">{tech.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTechnicians(
                              selectedTechnicians.filter(
                                (id) => id !== String(tech.id),
                              ),
                            )
                          }
                          className="ml-1 rounded-full p-0.5 hover:bg-primary/20 text-primary/60 hover:text-primary transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                </div>

                {isLoadingTechnicians ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                    <Loader2 className="w-4 h-4 animate-spin" />{" "}
                    กำลังโหลดรายชื่อช่าง...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none"
                      value=""
                      onChange={(e) => {
                        const techId = e.target.value;
                        if (techId && !selectedTechnicians.includes(techId)) {
                          setSelectedTechnicians([
                            ...selectedTechnicians,
                            techId,
                          ]);
                        }
                        // Reset select
                        e.target.value = "";
                      }}
                    >
                      <option value="" disabled>
                        + เพิ่มรายชื่อช่าง...
                      </option>
                      {technicians
                        .filter(
                          (t) => !selectedTechnicians.includes(String(t.id)),
                        )
                        .map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name}{" "}
                            {tech.position ? `(${tech.position})` : ""}
                          </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none">
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary/60" /> อาการเสีย
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={service.description || ""}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="ระบุอาการเสีย หรือปัญหาที่พบ..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary/60" />{" "}
                    รายละเอียดการเข้าซ่อม
                  </label>
                  <textarea
                    name="techService"
                    rows={3}
                    defaultValue={service.techService || ""}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="ระบุรายละเอียดการปฏิบัติงาน หรืออะไหล่ที่ใช้..."
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={hasParts}
                        onChange={(e) => {
                          setHasParts(e.target.checked);
                          if (e.target.checked && parts.length === 0) addPart();
                        }}
                      />
                      <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary/60" />{" "}
                      มีการเปลี่ยนอะไหล่
                    </span>
                  </label>
                  {hasParts && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1 h-8"
                      onClick={addPart}
                    >
                      <Plus className="w-4 h-4" /> เพิ่มรายการ
                    </Button>
                  )}
                </div>

                {isLoadingParts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                  </div>
                ) : (
                  hasParts && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {parts.map((part, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100"
                        >
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Part Number"
                              value={part.partNo}
                              onChange={(e) =>
                                updatePart(index, "partNo", e.target.value)
                              }
                              className="h-9 text-xs"
                            />
                          </div>
                          <div className="flex-2 space-y-2">
                            <Input
                              placeholder="รายละเอียด"
                              value={part.details}
                              onChange={(e) =>
                                updatePart(index, "details", e.target.value)
                              }
                              className="h-9 text-xs"
                            />
                          </div>
                          <div className="w-20 space-y-2">
                            <Input
                              type="number"
                              placeholder="จำนวน"
                              value={part.qty}
                              onChange={(e) =>
                                updatePart(index, "qty", e.target.value)
                              }
                              className="h-9 text-xs"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                            onClick={() => removePart(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary/60" />{" "}
                  สถานะการดำเนินงาน
                </label>
                <select
                  name="status"
                  defaultValue={service.status || "รอดำเนินการ"}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="รอดำเนินการ">
                    รอดำเนินการ (Draft/Scheduled)
                  </option>
                  <option value="เสร็จสิ้น">เสร็จสิ้น (Completed)</option>
                  <option value="ยกเลิก">ยกเลิก (Cancelled)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
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
                  <CheckCircle2 className="w-5 h-5" />
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
