"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

const A4_HEIGHT_PX = 1122; // A4 height in px at 96dpi (297mm)

function getAutoZoom(): number {
  const printContent = document.getElementById("print-content");
  if (!printContent) return 1;

  const contentHeight = printContent.scrollHeight;
  if (contentHeight <= A4_HEIGHT_PX) return 1; // fits on one page, no zoom needed

  // Calculate zoom factor to fit content into one page (min 0.65 to keep readable)
  const zoom = Math.max(A4_HEIGHT_PX / contentHeight, 0.65);
  return Math.floor(zoom * 100) / 100; // round down to 2 decimal places
}

export function PrintServiceButton() {
  useEffect(() => {
    const handleBeforePrint = () => {
      const zoom = getAutoZoom();
      if (zoom < 1) {
        (document.body.style as unknown as Record<string, string>).zoom = String(zoom);
      }
    };

    const handleAfterPrint = () => {
      (document.body.style as unknown as Record<string, string>).zoom = "1";
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

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
