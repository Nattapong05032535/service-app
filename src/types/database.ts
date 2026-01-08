import { users, companies, products, warranties, services } from "@/db/schema";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Warranty = typeof warranties.$inferSelect;
export type NewWarranty = typeof warranties.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export interface ProductWithLatestWarranty extends Product {
    companyName: string;
    latestWarranty: Warranty | null;
}

export interface ServiceWithWarranty {
    service: Service;
    warranty: Warranty;
}

// Input types that allow strings for dates and numbers/strings for IDs
export type CompanyInput = Omit<NewCompany, 'createdBy'> & { createdBy?: string | number | null };
export type ProductInput = Omit<NewProduct, 'companyId' | 'purchaseDate'> & { companyId?: string | number | null, purchaseDate?: string | Date | null };
export type WarrantyInput = Omit<NewWarranty, 'productId' | 'startDate' | 'endDate'> & { productId?: string | number | null, startDate: string | Date, endDate: string | Date };
export type ServiceInput = Omit<NewService, 'warrantyId' | 'entryTime' | 'exitTime'> & { warrantyId: string | number | null, entryTime: string | Date, exitTime: string | Date };
