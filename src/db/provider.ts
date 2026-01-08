import { db as mssqlDb } from "./index";
import { companies, products, warranties, services, users } from "./schema";
import { eq, sql, desc, like, or, inArray, exists } from "drizzle-orm";
import { airtableBase, TABLES } from "./airtable";

const isAirtable = process.env.DB_TYPE === 'airtable';

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

    async createUser(data: any) {
        if (isAirtable) {
            // Airtable create returns a single record when passing an object, but SDK types can be tricky
            const record = await airtableBase(TABLES.USERS).create(data) as any;
            return { id: record.id, ...record.fields };
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

    async getCompanyById(id: any) {
        if (isAirtable) {
            try {
                const record = await airtableBase(TABLES.COMPANIES).find(id);
                return {
                    id: record.id,
                    ...record.fields,
                    createdBy: Array.isArray(record.fields.createdBy) ? record.fields.createdBy[0] : record.fields.createdBy
                };
            } catch { return null; }
        } else {
            const [company] = await mssqlDb.select().from(companies).where(eq(companies.id, Number(id)));
            return company || null;
        }
    },

    // === PRODUCTS ===
    async getProductsByCompany(companyId: any) {
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

    async getProductById(id: any) {
        if (isAirtable) {
            try {
                const record = await airtableBase(TABLES.PRODUCTS).find(id);
                return {
                    id: record.id,
                    ...record.fields,
                    companyId: Array.isArray(record.fields.companyId) ? record.fields.companyId[0] : record.fields.companyId
                };
            } catch { return null; }
        } else {
            const [product] = await mssqlDb.select().from(products).where(eq(products.id, Number(id)));
            return product || null;
        }
    },

    // === WARRANTIES ===
    async getAllWarrantiesForProducts(productIds: any[]) {
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

    async getWarrantiesByProduct(productId: any) {
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
    async getServicesByProduct(productId: any) {
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
                    const wId = Array.isArray(r.fields.warrantyId) ? r.fields.warrantyId[0] : r.fields.warrantyId;
                    const warranty = productWarranties.find(w => w.id === wId);
                    return {
                        service: {
                            id: r.id,
                            ...r.fields,
                            warrantyId: wId
                        },
                        warranty: warranty || {}
                    };
                })
                .filter(item => item.service.warrantyId && warrantyIds.includes(item.service.warrantyId));
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
    async createCompany(data: any) {
        if (isAirtable) {
            const formattedData = {
                ...data,
                createdBy: (data.createdBy && data.createdBy.toString().startsWith('rec')) ? [data.createdBy] : undefined
            };
            const record = await airtableBase(TABLES.COMPANIES).create(formattedData) as any;
            return { id: record.id, ...record.fields };
        } else {
            await mssqlDb.insert(companies).values(data);
            return { success: true };
        }
    },

    async updateCompany(id: any, data: any) {
        if (isAirtable) {
            const record = await airtableBase(TABLES.COMPANIES).update(id, data) as any;
            return { id: record.id, ...record.fields };
        } else {
            await mssqlDb.update(companies).set(data).where(eq(companies.id, Number(id)));
            return { success: true };
        }
    },

    async createProduct(data: any) {
        if (isAirtable) {
            const formattedData = {
                ...data,
                companyId: (data.companyId && data.companyId.toString().startsWith('rec')) ? [data.companyId] : undefined
            };
            const record = await airtableBase(TABLES.PRODUCTS).create(formattedData) as any;
            return { id: record.id, ...record.fields };
        } else {
            await mssqlDb.insert(products).values({
                ...data,
                companyId: Number(data.companyId)
            });
            return { success: true };
        }
    },

    async createWarranty(data: any) {
        if (isAirtable) {
            const formattedData = {
                ...data,
                productId: (data.productId && data.productId.toString().startsWith('rec')) ? [data.productId] : undefined
            };
            const record = await airtableBase(TABLES.WARRANTIES).create(formattedData) as any;
            return { id: record.id, ...record.fields };
        } else {
            await mssqlDb.insert(warranties).values({
                ...data,
                productId: Number(data.productId),
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate)
            });
            return { success: true };
        }
    },

    async createService(data: any) {
        if (isAirtable) {
            const formattedData = {
                ...data,
                warrantyId: (data.warrantyId && data.warrantyId.toString().startsWith('rec')) ? [data.warrantyId] : undefined
            };
            const record = await airtableBase(TABLES.SERVICES).create(formattedData) as any;
            return { id: record.id, ...record.fields };
        } else {
            await mssqlDb.insert(services).values({
                ...data,
                warrantyId: Number(data.warrantyId),
                entryTime: new Date(data.entryTime),
                exitTime: new Date(data.exitTime)
            });
            return { success: true };
        }
    },

    async updateService(id: any, data: any) {
        if (isAirtable) {
            const formattedData = {
                ...data,
                warrantyId: (data.warrantyId && data.warrantyId.toString().startsWith('rec')) ? [data.warrantyId] : undefined
            };
            const record = await airtableBase(TABLES.SERVICES).update(id, formattedData) as any;
            return { id: record.id, ...record.fields };
        } else {
            await mssqlDb.update(services).set({
                ...data,
                warrantyId: data.warrantyId ? Number(data.warrantyId) : undefined,
                entryTime: data.entryTime ? new Date(data.entryTime) : undefined,
                exitTime: data.exitTime ? new Date(data.exitTime) : undefined
            }).where(eq(services.id, Number(id)));
            return { success: true };
        }
    },

    async getWarrantyById(id: any) {
        if (isAirtable) {
            try {
                const record = await airtableBase(TABLES.WARRANTIES).find(id);
                return {
                    id: record.id,
                    ...record.fields,
                    productId: Array.isArray(record.fields.productId) ? record.fields.productId[0] : record.fields.productId
                };
            } catch { return null; }
        } else {
            const [w] = await mssqlDb.select().from(warranties).where(eq(warranties.id, Number(id)));
            return w || null;
        }
    }
};
