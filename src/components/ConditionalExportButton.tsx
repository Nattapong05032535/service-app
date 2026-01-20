"use client";

import { usePathname } from "next/navigation";
import { ExportButton } from "./ExportButton";

export function ConditionalExportButton() {
  const pathname = usePathname();

  // Only show on the dashboard page
  if (pathname !== "/customers") return null;

  return <ExportButton />;
}
