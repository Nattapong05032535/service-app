"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, Suspense } from "react";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingContextType {
    setIsLoading: (isLoading: boolean) => void;
    withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

function LoadingSearchParamsListener({ setIsLoadingState }: { setIsLoadingState: (value: boolean) => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Auto-hide loading when path or search params change
    useEffect(() => {
        setIsLoadingState(false);
    }, [pathname, searchParams, setIsLoadingState]);

    return null;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoadingState] = useState(false);
    const pathname = usePathname();

    const setIsLoading = useCallback((value: boolean) => {
        setIsLoadingState(value);
    }, []);

    const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
        console.log("LoadingContext: withLoading started");
        setIsLoadingState(true);
        const startTime = Date.now();
        try {
            const result = await fn();
            // Ensure at least 500ms of loading time for a smoother experience
            const elapsedTime = Date.now() - startTime;
            console.log("LoadingContext: elapsed time", elapsedTime);
            if (elapsedTime < 500) {
                console.log("LoadingContext: waiting for delay", 500 - elapsedTime);
                await new Promise(resolve => setTimeout(resolve, 500 - elapsedTime));
            }
            return result;
        } finally {
            console.log("LoadingContext: withLoading finished");
            setIsLoadingState(false);
        }
    }, []);

    // Global listener to catch pulls (navigations) and saves (form submissions)
    useEffect(() => {
        const handleInteraction = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            // 1. Catches Link clicks (Pulls from Airtable)
            const anchor = target.closest('a');
            if (anchor && anchor.href) {
                const href = anchor.href;
                const isInternal = href.startsWith(window.location.origin) || href.startsWith('/');
                const hasTarget = anchor.target && anchor.target !== '_self';
                const isPrintOrExport = href.includes('/print') || href.includes('/export');

                if (isInternal && !hasTarget && !isPrintOrExport && 
                    !href.includes('#') && href !== window.location.href) {
                    setIsLoadingState(true);
                }
            }
        };

        // 2. Catches Form Submissions (Saves or Search pulls)
        const handleFormSubmit = (e: SubmitEvent) => {
            const form = e.target as HTMLFormElement;
            const action = form.action || '';
            const isPrintOrExport = action.includes('/print') || action.includes('/export');

            // Only trigger for internal forms that actually submit/navigate and are NOT print/export
            if (!isPrintOrExport && action && 
                (action.startsWith(window.location.origin) || action.startsWith('/'))) {
                setIsLoadingState(true);
            }
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('submit', handleFormSubmit);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('submit', handleFormSubmit);
        };
    }, []);

    // Don't show overlay on print pages to avoid interfering with the print dialog
    const isPrintPage = pathname?.includes('/print');

    return (
        <LoadingContext.Provider value={{ setIsLoading, withLoading }}>
            <Suspense fallback={null}>
                <LoadingSearchParamsListener setIsLoadingState={setIsLoadingState} />
            </Suspense>
            {children}
            {isLoading && !isPrintPage && <LoadingOverlay />}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}
