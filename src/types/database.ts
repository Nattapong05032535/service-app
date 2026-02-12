import { users, companies, products, warranties, services, serviceParts, technicians } from "@/db/schema";

export type TUser = typeof users.$inferSelect;
export type TNewUser = typeof users.$inferInsert;
export type TUserUpdate = Partial<TNewUser>;

export type TCompany = typeof companies.$inferSelect;
export type TNewCompany = typeof companies.$inferInsert;

export type TProduct = typeof products.$inferSelect;
export type TNewProduct = typeof products.$inferInsert;

export type TWarranty = typeof warranties.$inferSelect;
export type TNewWarranty = typeof warranties.$inferInsert;

export type TTechnician = typeof technicians.$inferSelect;
export type TNewTechnician = typeof technicians.$inferInsert;

export type TService = typeof services.$inferSelect & {
    technicians?: string[]; // Array of Technician IDs
};
export type TNewService = typeof services.$inferInsert & {
    technicians?: string[];
};

export type TServicePart = typeof serviceParts.$inferSelect;
export type TNewServicePart = typeof serviceParts.$inferInsert;

export interface IProductWithLatestWarranty extends TProduct {
    companyName: string;
    latestWarranty: TWarranty | null;
    airtableWarrantyStatus?: string; // '✅ Active', '❌ Expired', '⚠️ No Warranty'
    isNearExpiry?: boolean;
}

export interface IServiceWithWarranty {
    service: TService;
    warranty: TWarranty;
}

export interface IServiceDetail {
    service: TService;
    warranty: TWarranty | null;
    product: TProduct | null;
    company: TCompany | null;
}

// Input types that allow strings for dates and numbers/strings for IDs
export type TCompanyInput = Omit<TNewCompany, 'createdBy'> & { createdBy?: string | number | null };
export type TProductInput = Omit<TNewProduct, 'companyId' | 'purchaseDate'> & { companyId?: string | number | null, purchaseDate?: string | Date | null };
export type TWarrantyInput = Omit<TNewWarranty, 'productId' | 'startDate' | 'endDate'> & { productId?: string | number | null, startDate: string | Date, endDate: string | Date };
export type TServiceInput = Omit<TNewService, 'productId' | 'warrantyId' | 'entryTime' | 'exitTime'> & { productId?: string | number | null, warrantyId: string | number | null, entryTime: string | Date, exitTime: string | Date };
