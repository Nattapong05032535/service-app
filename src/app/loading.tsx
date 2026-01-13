"use client";

import { useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";

export default function Loading() {
    const { setIsLoading } = useLoading();

    useEffect(() => {
        setIsLoading(true);
        return () => setIsLoading(false);
    }, [setIsLoading]);

    return null; // The LoadingOverlay is already rendered in LoadingProvider
}
