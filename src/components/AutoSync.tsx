"use client";

import { useEffect, useRef } from "react";
import { useData } from "@/context/DataContext";
import { useLoading } from "@/context/LoadingContext";

export function AutoSync() {
    const { syncAllData, lastSynced, isSyncing } = useData();
    const { withLoading } = useLoading();
    const hasSynced = useRef(false);

    useEffect(() => {
        // Sync if not synced in this session or if it's been a while (e.g., more than 1 hour)
        const shouldSync = !lastSynced || (Date.now() - new Date(lastSynced).getTime() > 3600000);
        
        if (shouldSync && !isSyncing && !hasSynced.current) {
            hasSynced.current = true;
            withLoading(async () => {
                console.log("Auto-syncing data from Airtable...");
                await syncAllData();
            });
        }
    }, [lastSynced, isSyncing, syncAllData, withLoading]);

    return null;
}
