"use client";

import { Download } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useLoading } from "@/context/LoadingContext";

export function ExportButton() {
    const [isExporting, setIsExporting] = useState(false);
    const { setIsLoading } = useLoading();

    const handleExport = async () => {
        setIsExporting(true);
        setIsLoading(true);
        try {
            window.location.href = "/api/export";
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            // We use a timeout because window.location.href doesn't block
            setTimeout(() => {
                setIsExporting(false);
                setIsLoading(false);
            }, 2000);
        }
    };

    return (
        <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={handleExport}
            disabled={isExporting}
        >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Export"}
        </Button>
    );
}
