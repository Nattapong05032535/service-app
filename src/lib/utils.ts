import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | number | null | undefined): string {
    if (!date) return "-";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString('en-GB');
    } catch (e) {
        return "-";
    }
}

export function formatDateTime(date: string | Date | number | null | undefined): string {
    if (!date) return "-";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (e) {
        return "-";
    }
}
