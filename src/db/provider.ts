import { db as mssqlDb } from "./index";
import { companies, products, warranties, services, users } from "./schema";
import { eq, sql, desc, like, or, inArray, exists } from "drizzle-orm";
import { airtableBase, TABLES } from "./airtable";
import { 
    User, NewUser, 
    Company, NewCompany, 
    Product, NewProduct, 
    Warranty, NewWarranty, 
    Service, NewService,
    ProductWithLatestWarranty,
    ServiceWithWarranty,
    CompanyInput, ProductInput, WarrantyInput, ServiceInput
} from "@/types/database";
import { FieldSet } from "airtable";

const isAirtable = process.env.DB_TYPE === 'airtable';

function cleanDataForAirtable(data: Record<string, unknown>): FieldSet {
    const cleaned: Record<string, string | number | boolean | readonly string[] | undefined> = {};
    for (const key in data) {
        const val = data[key];
        if (val !== null && val !== undefined) {
            // Convert specific linked fields to arrays if needed by Airtable
            if (['companyId', 'productId', 'warrantyId', 'createdBy'].includes(key)) {
                cleaned[key] = [val.toString()];
            } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || Array.isArray(val)) {
                // We use a broader cast here for FieldSet compatibility
                (cleaned as Record<string, unknown>)[key] = val;
            }
        }
    }
    return cleaned as unknown as FieldSet;
}

export const dataProvider = {
    // === USERS ===
    async findUserByUsername(username: string) {
        if (isAirtable) {
            const records = await airtableBase(TABLES.USERS).select({
                filterByFormula: `{username} = '${username}'`,
                maxRecords: 1
            }).firstPage();
            if (records.length === 0) return null;
            const r = records[0];
            return { id: r.id, ...r.fields };
        } else {
            const [user] = await mssqlDb.select().from(users).where(eq(users.username, username));
            return user || null;
        }
    },

    async createUser(data: NewUser) {
        if (isAirtable) {
            const cleaned = cleanDataForAirtable(data as unknown as Record<string, unknown>);
            const record = await airtableBase(TABLES.USERS).create(cleaned) as unknown as { id: string, fields: FieldSet };
            return { id: record.id, ...record.fields } as unknown as User;
        } else {
            await mssqlDb.insert(users).values(data);
            const [user] = await mssqlDb.select().from(users).where(eq(users.username, data.username));
            return user;
        }
    },

    // === COMPANIES ===
    async getCompanies(query?: string) {
        if (isAirtable) {
            let companyIdsFromProducts: string[] = [];
            if (query) {
                // 1. Search products by serial number to get company IDs
                const productRecords = await airtableBase(TABLES.PRODUCTS).select({
                    filterByFormula: `SEARCH('${query.toLowerCase()}', LOWER({serialNumber}))`
                }).all();
                companyIdsFromProducts = productRecords
                    .map(r => Array.isArray(r.fields.companyId) ? r.fields.companyId[0] : (r.fields.companyId as string))
                    .filter(Boolean);
            }

            // 2. Build final company filter
            let filter = '';
            if (query) {
                const searchTerms = [
                    `SEARCH('${query.toLowerCase()}', LOWER({name}))`,
                    `SEARCH('${query.toLowerCase()}', LOWER({nameSecondary}))`,
                    `SEARCH('${query.toLowerCase()}', LOWER({taxId}))`
                ];

                // Add company IDs found via product serial search
                if (companyIdsFromProducts.length > 0) {
                    const idFilters = companyIdsFromProducts.map(id => `RECORD_ID() = '${id}'`);
                    searchTerms.push(...idFilters);
                }

                filter = `OR(${searchTerms.join(',')})`;
            }

            const records = await airtableBase(TABLES.COMPANIES).select({
                filterByFormula: filter
            }).all();

            return records.map(r => ({
                id: r.id,
                ...r.fields,
                createdBy: Array.isArray(r.fields.createdBy) ? r.fields.createdBy[0] : r.fields.createdBy
            }));
        } else {
            return await mssqlDb.select().from(companies)
                .where(query ? or(
                    like(companies.name, `%${query}%`),
                    like(companies.nameSecondary, `%${query}%`),
                    like(companies.taxId, `%${query}%`),
                    // Subquery to find companies by product serial number
                    exists(
                        mssqlDb.select()
                            .from(products)
                            .where(sql`${products.companyId} = ${companies.id} AND ${products.serialNumber} LIKE ${`%${query}%`}`)
                    )
                ) : undefined);
        }
    },

    async getCompanyById(id: string | number) {
        if (isAirtable) {
            try {
                const record = await airtableBase(TABLES.COMPANIES).find(id.toString());
                const fields = record.fields as FieldSet;
                return {
                    id: record.id,
                    ...fields,
                    createdBy: Array.isArray(fields.createdBy) ? fields.createdBy[0] : (fields.createdBy as string)
                } as unknown as Company;
            } catch { return null; }
        } else {
            const [company] = await mssqlDb.select().from(companies).where(eq(companies.id, Number(id)));
            return company || null;
        }
    },

    async findCompanyByName(name: string) {
        if (isAirtable) {
            const records = await airtableBase(TABLES.COMPANIES).select({
                filterByFormula: `{name} = '${name.replace(/'/g, "\\'")}'`,
                maxRecords: 1
            }).firstPage();
            if (records.length === 0) return null;
            return { id: records[0].id, ...records[0].fields } as unknown as Company;
        } else {
            const [company] = await mssqlDb.select().from(companies).where(eq(companies.name, name));
            return company || null;
        }
    },

    // === PRODUCTS ===
    async getProductsByCompany(companyId: string | number) {
        if (isAirtable) {
            const records = await airtableBase(TABLES.PRODUCTS).select().all();
            return records
                .map(r => ({
                    id: r.id,
                    ...r.fields,
                    companyId: Array.isArray(r.fields.companyId) ? r.fields.companyId[0] : r.fields.companyId
                }))
                .filter(p => p.companyId === companyId);
        } else {
            return await mssqlDb.select().from(products).where(eq(products.companyId, Number(companyId)));
        }
    },

    async getProductById(id: string | number) {
        if (isAirtable) {
            try {
                const record = await airtableBase(TABLES.PRODUCTS).find(id.toString());
                const fields = record.fields as FieldSet;
                return {
                    id: record.id,
                    ...fields,
                    companyId: Array.isArray(fields.companyId) ? fields.companyId[0] : (fields.companyId as string)
                } as unknown as Product;
            } catch { return null; }
        } else {
            const [product] = await mssqlDb.select().from(products).where(eq(products.id, Number(id)));
            return product || null;
        }
    },

    async getAllProducts(query?: string): Promise<ProductWithLatestWarranty[]> {
        if (isAirtable) {
            let filter = '';
            if (query) {
                filter = `OR(SEARCH('${query.toLowerCase()}', LOWER({name})), SEARCH('${query.toLowerCase()}', LOWER({serialNumber})))`;
            }
            const productRecords = await airtableBase(TABLES.PRODUCTS).select({
                filterByFormula: filter
            }).all();
            
            const companyRecords = await airtableBase(TABLES.COMPANIES).select().all();
            const warrantyRecords = await airtableBase(TABLES.WARRANTIES).select().all();

            return productRecords.map(r => {
                const fields = r.fields as FieldSet;
                const companyId = Array.isArray(fields.companyId) ? fields.companyId[0] : (fields.companyId as string);
                const company = companyRecords.find(c => c.id === companyId);
                const productWarranties = warrantyRecords
                    .map(w => {
                        const wFields = w.fields as FieldSet;
                        return {
                            id: w.id,
                            ...wFields,
                            productId: Array.isArray(wFields.productId) ? wFields.productId[0] : (wFields.productId as string)
                        };
                    })
                    .filter(w => w.productId === r.id);
                
                const latestWarranty = productWarranties.sort((a, b) => {
                    const dateA = new Date((a as { endDate?: string }).endDate || 0).getTime();
                    const dateB = new Date((b as { endDate?: string }).endDate || 0).getTime();
                    return dateB - dateA;
                })[0];

                return {
                    ...fields,
                    id: r.id,
                    companyId,
                    companyName: company ? (company.fields as FieldSet).name as string : 'Unknown',
                    latestWarranty: latestWarranty ? {
                        ...latestWarranty,
                        startDate: new Date((latestWarranty as { startDate?: string }).startDate || 0),
                        endDate: new Date((latestWarranty as { endDate?: string }).endDate || 0)
                    } : null
                } as unknown as ProductWithLatestWarranty;
            });
        } else {
            const productsWithCompany = await mssqlDb.select({
                product: products,
                company: companies
            })
            .from(products)
            .innerJoin(companies, eq(products.companyId, companies.id))
            .where(query ? or(
                like(products.name, `%${query}%`),
                like(products.serialNumber, `%${query}%`)
            ) : undefined);
            
            const productIds = productsWithCompany.map(p => p.product.id);
            if (productIds.length === 0) return [];
            
            const allWarranties = await mssqlDb.select().from(warranties).where(inArray(warranties.productId, productIds));
            
            return productsWithCompany.map(p => {
                const productWarranties = allWarranties.filter(w => w.productId === p.product.id);
                const latestWarranty = productWarranties.sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];
                return {
                    ...p.product,
                    companyName: p.company.name,
                    latestWarranty
                };
            });
        }
    },

    // === WARRANTIES ===
    async getAllWarrantiesForProducts(productIds: (string | number)[]) {
        if (isAirtable) {
            if (productIds.length === 0) return [];
            const records = await airtableBase(TABLES.WARRANTIES).select().all();
            return records
                .map(r => ({
                    id: r.id,
                    ...r.fields,
                    productId: Array.isArray(r.fields.productId) ? r.fields.productId[0] : r.fields.productId
                }))
                .filter(w => productIds.includes(w.productId));
        } else {
            if (productIds.length === 0) return [];
            return await mssqlDb.select().from(warranties).where(sql`${warranties.productId} IN (${sql.join(productIds, sql`, `)})`);
        }
    },

    async getWarrantiesByProduct(productId: string | number) {
        if (isAirtable) {
            const records = await airtableBase(TABLES.WARRANTIES).select({
                sort: [{ field: 'endDate', direction: 'desc' }]
            }).all();
            return records
                .map(r => ({
                    id: r.id,
                    ...r.fields,
                    productId: Array.isArray(r.fields.productId) ? r.fields.productId[0] : r.fields.productId
                }))
                .filter(w => w.productId === productId);
        } else {
            return await mssqlDb.select().from(warranties)
                .where(eq(warranties.productId, Number(productId)))
                .orderBy(desc(warranties.endDate));
        }
    },

    // === SERVICES ===
    async getServicesByProduct(productId: string | number): Promise<ServiceWithWarranty[]> {
        if (isAirtable) {
            // 1. Get all warranties for this product
            const productWarranties = await this.getWarrantiesByProduct(productId);
            const warrantyIds = productWarranties.map(w => w.id);

            if (warrantyIds.length === 0) return [];

            // 2. Fetch all services
            const records = await airtableBase(TABLES.SERVICES).select({
                sort: [{ field: 'entryTime', direction: 'desc' }]
            }).all();

            // 3. Filter services by warrantyId and return with warranty info
            return records
                .map(r => {
                    const fields = r.fields as FieldSet;
                    const wId = Array.isArray(fields.warrantyId) ? fields.warrantyId[0] : (fields.warrantyId as string);
                    const warranty = productWarranties.find(w => w.id === wId);
                    return {
                        service: {
                            id: r.id,
                            ...fields,
                            warrantyId: wId
                        } as unknown as Service,
                        warranty: (warranty || {}) as Warranty
                    };
                })
                .filter(item => item.service.warrantyId && warrantyIds.includes(item.service.warrantyId as unknown as string));
        } else {
            return await mssqlDb.select({
                service: services,
                warranty: warranties
            })
                .from(services)
                .innerJoin(warranties, eq(services.warrantyId, warranties.id))
                .where(eq(warranties.productId, Number(productId)))
                .orderBy(desc(services.entryTime));
        }
    },

    // === CREATIONS ===
    async createCompany(data: CompanyInput) {
        if (isAirtable) {
            const cleaned = cleanDataForAirtable(data as unknown as Record<string, unknown>);
            const record = await airtableBase(TABLES.COMPANIES).create(cleaned) as unknown as { id: string, fields: FieldSet };
            return { id: record.id, ...record.fields } as unknown as Company;
        } else {
            const values = {
                ...data,
                createdBy: data.createdBy ? Number(data.createdBy) : null,
            } as NewCompany;
            await mssqlDb.insert(companies).values(values);
            const [company] = await mssqlDb.select().from(companies).where(eq(companies.name, values.name)).orderBy(desc(companies.id));
            return company;
        }
    },

    async updateCompany(id: string | number, data: Partial<CompanyInput>) {
        if (isAirtable) {
            const cleaned = cleanDataForAirtable(data as unknown as Record<string, unknown>);
            delete (cleaned as Record<string, unknown>).id; 
            const record = await airtableBase(TABLES.COMPANIES).update(id.toString(), cleaned) as unknown as { id: string, fields: FieldSet };
            return { id: record.id, ...record.fields } as unknown as Company;
        } else {
            await mssqlDb.update(companies).set({
                ...data,
                createdBy: data.createdBy ? Number(data.createdBy) : undefined,
            } as Partial<NewCompany>).where(eq(companies.id, Number(id)));
            return { success: true };
        }
    },

    async createProduct(data: ProductInput) {
        if (isAirtable) {
            const cleaned = cleanDataForAirtable(data as unknown as Record<string, unknown>);
            const record = await airtableBase(TABLES.PRODUCTS).create(cleaned) as unknown as { id: string, fields: FieldSet };
            return { id: record.id, ...record.fields } as unknown as Product;
        } else {
            const values = {
                ...data,
                companyId: data.companyId ? Number(data.companyId) : null,
                purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
            } as NewProduct;
            await mssqlDb.insert(products).values(values);
            const [product] = await mssqlDb.select().from(products)
                .where(eq(products.serialNumber, values.serialNumber))
                .orderBy(desc(products.id));
            return product;
        }
    },

    async createWarranty(data: WarrantyInput) {
        if (isAirtable) {
            const cleaned = cleanDataForAirtable(data as unknown as Record<string, unknown>);
            const record = await airtableBase(TABLES.WARRANTIES).create(cleaned) as unknown as { id: string, fields: FieldSet };
            return { id: record.id, ...record.fields } as unknown as Warranty;
        } else {
            const values = {
                ...data,
                productId: data.productId ? Number(data.productId) : null,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate)
            } as NewWarranty;
            await mssqlDb.insert(warranties).values(values);
            const [w] = await mssqlDb.select().from(warranties)
                .where(eq(warranties.productId, Number(values.productId)))
                .orderBy(desc(warranties.id));
            return w;
        }
    },

    async createService(data: ServiceInput) {
        if (isAirtable) {
            const cleaned = cleanDataForAirtable(data as unknown as Record<string, unknown>);
            const record = await airtableBase(TABLES.SERVICES).create(cleaned) as unknown as { id: string, fields: FieldSet };
            return { id: record.id, ...record.fields } as unknown as Service;
        } else {
            await mssqlDb.insert(services).values({
                ...data,
                warrantyId: data.warrantyId ? Number(data.warrantyId) : null,
                entryTime: new Date(data.entryTime),
                exitTime: new Date(data.exitTime)
            } as NewService);
            return { success: true };
        }
    },

    async updateService(id: string | number, data: Partial<ServiceInput>) {
        if (isAirtable) {
            const cleaned = cleanDataForAirtable(data as unknown as Record<string, unknown>);
            delete (cleaned as Record<string, unknown>).id;
            const record = await airtableBase(TABLES.SERVICES).update(id.toString(), cleaned) as unknown as { id: string, fields: FieldSet };
            return { id: record.id, ...record.fields } as unknown as Service;
        } else {
            await mssqlDb.update(services).set({
                ...data,
                warrantyId: data.warrantyId ? Number(data.warrantyId) : undefined,
                entryTime: data.entryTime ? new Date(data.entryTime) : undefined,
                exitTime: data.exitTime ? new Date(data.exitTime) : undefined
            } as Partial<NewService>).where(eq(services.id, Number(id)));
            return { success: true };
        }
    },

    async getWarrantyById(id: string | number) {
        if (isAirtable) {
            try {
                const record = await airtableBase(TABLES.WARRANTIES).find(id.toString());
                const fields = record.fields as FieldSet;
                return {
                    id: record.id,
                    ...fields,
                    productId: Array.isArray(fields.productId) ? fields.productId[0] : (fields.productId as string)
                } as unknown as Warranty;
            } catch { return null; }
        } else {
            const [w] = await mssqlDb.select().from(warranties).where(eq(warranties.id, Number(id)));
            return w || null;
        }
    },

    async getExportData() {
        if (isAirtable) {
            const productRecords = await airtableBase(TABLES.PRODUCTS).select().all();
            const companyRecords = await airtableBase(TABLES.COMPANIES).select().all();
            const warrantyRecords = await airtableBase(TABLES.WARRANTIES).select().all();
            const serviceRecords = await airtableBase(TABLES.SERVICES).select({
                filterByFormula: "{type} = 'PM'"
            }).all();
            // const userRecords = await airtableBase(TABLES.USERS).select().all();

            return productRecords.map(r => {
                const fields = r.fields as FieldSet;
                const companyId = Array.isArray(fields.companyId) ? fields.companyId[0] : (fields.companyId as string);
                const company = companyRecords.find(c => c.id === companyId);
                const companyFields = company?.fields as FieldSet;
                
                // const creatorId = companyFields && Array.isArray(companyFields.createdBy) ? companyFields.createdBy[0] : companyFields?.createdBy;
                // const creator = userRecords.find(u => u.id === creatorId);

                const productWarranties = warrantyRecords
                    .map(w => {
                        const wFields = w.fields as FieldSet;
                        return {
                            id: w.id,
                            ...wFields,
                            productId: Array.isArray(wFields.productId) ? wFields.productId[0] : (wFields.productId as string)
                        };
                    })
                    .filter(w => w.productId === r.id);
                
                const latestWarranty = productWarranties.sort((a, b) => {
                    const dateA = new Date((a as { endDate?: string }).endDate || 0).getTime();
                    const dateB = new Date((b as { endDate?: string }).endDate || 0).getTime();
                    return dateB - dateA;
                })[0];

                let warrantyStatus = "N/A";
                let warrantyStartDate = "-";
                let warrantyEndDate = "-";
                let pmStatus = "N/A";

                if (latestWarranty) {
                    const now = new Date();
                    const endDate = new Date((latestWarranty as { endDate?: string }).endDate || 0);
                    const startDate = new Date((latestWarranty as { startDate?: string }).startDate || 0);
                    
                    warrantyStatus = endDate > now ? "Active" : "Expired";
                    warrantyStartDate = startDate.toLocaleDateString('th-TH');
                    warrantyEndDate = endDate.toLocaleDateString('th-TH');

                    const pmServices = serviceRecords.filter(s => {
                        const sFields = s.fields as FieldSet;
                        const wId = Array.isArray(sFields.warrantyId) ? sFields.warrantyId[0] : sFields.warrantyId;
                        return wId === latestWarranty.id;
                    });

                    if (pmServices.length > 0) {
                        const allDone = pmServices.every(s => (s.fields as FieldSet).status === "เสร็จสิ้น");
                        pmStatus = allDone ? "Expired" : "Active";
                    } else {
                        pmStatus = "Expired";
                    }
                }

                return {
                    productName: fields.name as string,
                    purchaseDate: fields.purchaseDate ? new Date(fields.purchaseDate as string).toLocaleDateString('th-TH') : "-",
                    serialNumber: fields.serialNumber as string,
                    salesName: fields.contactPerson as string || "-",
                    warrantyStatus,
                    warrantyStartDate,
                    warrantyEndDate,
                    pmStatus,
                    companyName: companyFields?.name as string || "-"
                };
            });
        } else {
            const results = await mssqlDb.select({
                product: products,
                company: companies,
                user: users
            })
            .from(products)
            .innerJoin(companies, eq(products.companyId, companies.id))
            .leftJoin(users, eq(companies.createdBy, users.id));

            const allWarranties = await mssqlDb.select().from(warranties);
            const allServices = await mssqlDb.select().from(services).where(eq(services.type, 'PM'));

            return results.map(r => {
                const productWarranties = allWarranties.filter(w => w.productId === r.product.id);
                const latestWarranty = productWarranties.sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];
                
                let warrantyStatus = "N/A";
                let warrantyStartDate = "-";
                let warrantyEndDate = "-";
                let pmStatus = "N/A";

                if (latestWarranty) {
                    const now = new Date();
                    warrantyStatus = latestWarranty.endDate > now ? "Active" : "Expired";
                    warrantyStartDate = latestWarranty.startDate.toLocaleDateString('th-TH');
                    warrantyEndDate = latestWarranty.endDate.toLocaleDateString('th-TH');

                    const pmServices = allServices.filter(s => s.warrantyId === latestWarranty.id);
                    if (pmServices.length > 0) {
                        const allDone = pmServices.every(s => s.status === "เสร็จสิ้น");
                        pmStatus = allDone ? "Expired" : "Active";
                    } else {
                        pmStatus = "Expired";
                    }
                }

                return {
                    productName: r.product.name,
                    purchaseDate: r.product.purchaseDate ? r.product.purchaseDate.toLocaleDateString('th-TH') : "-",
                    serialNumber: r.product.serialNumber,
                    salesName: r.user?.username || "System",
                    warrantyStatus,
                    warrantyStartDate,
                    warrantyEndDate,
                    pmStatus,
                    companyName: r.company.name
                };
            });
        }
    }
};
