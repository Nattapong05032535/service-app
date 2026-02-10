"use client";

import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => { };

export function LoadingOverlay() {
    const isMounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    if (!isMounted) {
        console.log("LoadingOverlay: not mounted");
        return null;
    }
    
    console.log("LoadingOverlay: rendering");

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col items-center gap-6 scale-100 animate-in zoom-in-95 duration-300 border border-white/20">
                <div className="relative">
                    <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full animate-pulse"></div>
                    <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                </div>
                <div className="text-center relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">กำลังประมวลผล...</h3>
                    <div className="flex flex-col gap-1">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">กรุณารอสักครู่ ระบบกำลังสื่อสารกับฐานข้อมูล</p>
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
