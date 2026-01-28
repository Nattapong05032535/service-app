"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useData } from "@/context/DataContext";
import { useLoading } from "@/context/LoadingContext";
import { cn } from "@/lib/utils";

export function SyncButton() {
  const { syncAllData, isSyncing, lastSynced } = useData();
  const { withLoading } = useLoading();

  const handleSync = async () => {
    await withLoading(async () => {
      await syncAllData();
    });
  };

  // Format last synced time
  const getLastSyncedText = () => {
    if (!lastSynced) return "Never synced";

    const syncDate = new Date(lastSynced);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return syncDate.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing}
        className={cn(
          "gap-2 border-slate-200 transition-all duration-200",
          "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
          isSyncing && "cursor-not-allowed opacity-70",
        )}
        title={`Last synced: ${lastSynced ? new Date(lastSynced).toLocaleString("th-TH") : "Never"}`}
      >
        <RefreshCw
          className={cn(
            "h-4 w-4 transition-transform",
            isSyncing && "animate-spin",
          )}
        />
        <span className="hidden sm:inline">
          {isSyncing ? "Syncing..." : "Sync"}
        </span>
      </Button>

      {/* Last synced indicator - only show on larger screens */}
      <span className="hidden lg:inline text-xs text-slate-400">
        {getLastSyncedText()}
      </span>
    </div>
  );
}
