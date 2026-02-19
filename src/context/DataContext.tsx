"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { TCompany, IProductWithLatestWarranty } from "@/types/database";

interface DataState {
  companies: TCompany[];
  products: IProductWithLatestWarranty[];
  lastSynced: string | null;
  isSyncing: boolean;
}

interface DataContextType extends DataState {
  syncAllData: () => Promise<void>;
  getCompany: (id: string | number) => TCompany | undefined;
  getProductsByCompany: (
    companyId: string | number,
  ) => IProductWithLatestWarranty[];
  isLoaded: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>({
    companies: [],
    products: [],
    lastSynced: null,
    isSyncing: false,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("global_app_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setState((prev) => ({
          ...prev,
          companies: parsed.companies || [],
          products: parsed.products || [],
          lastSynced: parsed.lastSynced || null,
        }));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const syncAllData = useCallback(async () => {
    setState((prev) => ({ ...prev, isSyncing: true }));
    try {
      // We'll need a new server action for this
      const { getAllDataAction } = await import("@/app/actions/business");
      const data = await getAllDataAction();

      const newState = {
        companies: data.companies as TCompany[],
        products: data.products as IProductWithLatestWarranty[],
        lastSynced: new Date().toISOString(),
        isSyncing: false,
      };

      setState(newState);
      localStorage.setItem("global_app_data", JSON.stringify(newState));
    } catch (error) {
      console.error("Sync failed", error);
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, []);

  const getCompany = useCallback(
    (id: string | number) => {
      return state.companies.find((c) => String(c.id) === String(id));
    },
    [state.companies],
  );

  const getProductsByCompany = useCallback(
    (companyId: string | number) => {
      return state.products.filter(
        (p) => String(p.companyId) === String(companyId),
      );
    },
    [state.products],
  );

  return (
    <DataContext.Provider
      value={{
        ...state,
        syncAllData,
        getCompany,
        getProductsByCompany,
        isLoaded,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
