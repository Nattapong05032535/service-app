"use client";

import { Printer } from "lucide-react";

export function PrintServiceButton() {
    return (
        <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
            <Printer className="w-5 h-5" />
            พิมพ์เอกสาร
        </button>
    );
}
