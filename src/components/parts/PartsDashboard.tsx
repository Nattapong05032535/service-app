"use client";

import { useState } from "react";
import { List, LayoutGrid } from "lucide-react";
import { PartsTable } from "./PartsTable";
import { PartsSummaryTable } from "./PartsSummaryTable";

interface PartRecord {
  id: string;
  partNo: string;
  details: string;
  qty: number;
  orderCase: string;
  createdAt: string;
}

export function PartsDashboard({ parts }: { parts: PartRecord[] }) {
  const [activeTab, setActiveTab] = useState<"list" | "summary">("list");

  return (
    <div className="space-y-6">
      {/* Tabs Selection */}
      <div className="flex p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "list"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <List className="w-4 h-4" />
          รายการทั้งหมด
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "summary"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          สรุปยอดตามรหัสอะไหล่
        </button>
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === "list" ? (
          <PartsTable parts={parts} />
        ) : (
          <PartsSummaryTable parts={parts} />
        )}
      </div>
    </div>
  );
}
