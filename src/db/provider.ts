import { db as mssqlDb } from "./index";
import { companies, products, warranties, services, users, serviceParts } from "./schema";
import { eq, sql, desc, like, or, inArray, exists } from "drizzle-orm";
import { airtableBase, TABLES } from "./airtable";
import { 
    User, UserInsert, 
    Company, NewCompany, 
    Product, NewProduct, 
    Warranty, NewWarranty, 
    Service, NewService,
    ServicePart, NewServicePart,
    ProductWithLatestWarranty,
    ServiceWithWarranty, ServiceDetail,
    CompanyInput, ProductInput, WarrantyInput, ServiceInput
} from "@/types/database";
import { FieldSet } from "airtable";
import { formatDate } from "@/lib/utils";

const isAirtable = process.env.DB_TYPE === 'airtable';

function cleanDataForAirtable(data: Record<string, unknown>): FieldSet {
    const cleaned: Record<string, string | number | boolean | readonly string[] | undefined> = {};
    for (const key in data) {
        const val = data[key];
        
        // Skip null, undefined, and problematic strings for IDs
        if (val === null || val === undefined || val === "" || val === "undefined" || val === "null") {
            continue;
        }

        if (['companyId', 'productId', 'warrantyId', 'createdBy'].includes(key)) {
            // Ensure linked fields are arrays of strings
            cleaned[key] = Array.isArray(val) ? (val as unknown[]).map(v => String(v)) : [String(val)];
        } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || Array.isArray(val)) {
            (cleaned as Record<string, unknown>)[key] = val;
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

    async createUser(data: UserInsert) {
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

    async getAllProducts(options: { 
        query?: string, 
        status?: string, 
        page?: number, 
        pageSize?: number 
    } = {}): Promise<{ data: ProductWithLatestWarranty[], totalCount: number }> {
        const { query, status, page = 1, pageSize = 50 } = options;

        if (isAirtable) {
            const filterParts = [];
            
            // 1. Search Filter
            if (query) {
                filterParts.push(`OR(SEARCH('${query.toLowerCase()}', LOWER({name})), SEARCH('${query.toLowerCase()}', LOWER({serialNumber})))`);
            }
            
            // 2. Status Filter (Using the new Airtable fields)
            if (status && status !== 'all') {
                if (status === 'active') {
                    // Active but NOT near expiry (exclude near_expiry from active)
                    // Airtable checkbox uses TRUE()/FALSE()
                    filterParts.push(`AND({warrantyStatus} = '✅ Active', NOT({isNearExpiry}))`);
                } else if (status === 'near_expiry') {
                    // Only near expiry products (which are also technically Active)
                    filterParts.push(`{isNearExpiry} = TRUE()`);
                } else if (status === 'expired') {
                    filterParts.push(`OR({warrantyStatus} = '❌ Expired', {warrantyStatus} = '⚠️ No Warranty')`);
                }
            }
            
            const filterFormula = filterParts.length > 1 ? `AND(${filterParts.join(',')})` : filterParts[0] || '';
            
            // 3. Counting (Airtable bit: fetching just IDs to count is faster, but still multiple requests)
            // To be fast, we'll fetch only what we need for the current page.
            // Note: Airtable SDK doesn't support offset easily, we'll fetch up to (page * pageSize)
            // and slice the last pageSize. For 6,000 records, this is acceptable compared to fetching ALL data.
            const maxRecords = page * pageSize;
            
            // Build select options, only include filterByFormula if it's not empty
            const selectOptions: {
                filterByFormula?: string;
                maxRecords: number;
                sort: { field: string; direction: 'asc' | 'desc' }[];
            } = {
                maxRecords: maxRecords,
                sort: [{ field: 'latestWarrantyEndDate', direction: 'asc' }] // Sort by expiry
            };
            if (filterFormula) {
                selectOptions.filterByFormula = filterFormula;
            }

            const records = await airtableBase(TABLES.PRODUCTS).select(selectOptions).all();

            // We also need a total count for pagination UI. 
            // Fetching ALL just to count is slow. Let's do a separate small request for total count logic if needed,
            // or just return 0 if we don't want to block.
            // Alternative: Fetch all IDs only (fields: [])
            const countOptions: { filterByFormula?: string; fields: string[] } = { fields: [] };
            if (filterFormula) {
                countOptions.filterByFormula = filterFormula;
            }
            const allIds = await airtableBase(TABLES.PRODUCTS).select(countOptions).all();
            const totalCount = allIds.length;

            const pageData = records.slice((page - 1) * pageSize, page * pageSize);
            
            // 4. Fetch only relevant companies to avoid loading thousands of companies
            const relevantCompanyIds = [...new Set(pageData.map(r => {
                const f = r.fields;
                return Array.isArray(f.companyId) ? f.companyId[0] : (f.companyId as string);
            }).filter(Boolean))];

            let companyRecords: readonly { id: string; fields: FieldSet }[] = [];
            if (relevantCompanyIds.length > 0) {
                const companyFilter = `OR(${relevantCompanyIds.map(id => `RECORD_ID()='${id}'`).join(',')})`;
                companyRecords = await airtableBase(TABLES.COMPANIES).select({
                    filterByFormula: companyFilter
                }).all();
            }

            const data = pageData.map(r => {

                const fields = r.fields as FieldSet;
                const companyId = Array.isArray(fields.companyId) ? fields.companyId[0] : (fields.companyId as string);
                const company = companyRecords.find(c => c.id === companyId);
                
                // Map the pre-calculated Airtable fields back to our UI structure
                return {
                    ...fields,
                    id: r.id,
                    companyId,
                    companyName: company ? (company.fields as FieldSet).name as string : 'Unknown',
                    // Pass Airtable's pre-calculated status fields to avoid client-side recalculation issues
                    airtableWarrantyStatus: fields.warrantyStatus as string || '⚠️ No Warranty',
                    isNearExpiry: Boolean(fields.isNearExpiry),
                    latestWarranty: fields.latestWarrantyEndDate ? {
                        endDate: new Date(fields.latestWarrantyEndDate as string)
                    } : null
                } as unknown as ProductWithLatestWarranty;
            });

            return { data, totalCount };
        } else {
            // MSSQL implementation (kept simple for now, but should also be paginated if needed)
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
            if (productIds.length === 0) return { data: [], totalCount: 0 };
            
            const allWarranties = await mssqlDb.select().from(warranties).where(inArray(warranties.productId, productIds));
            
            const data = productsWithCompany.map(p => {
                const productWarranties = allWarranties.filter(w => w.productId === p.product.id);
                const latestWarranty = productWarranties.sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];
                return {
                    ...p.product,
                    companyName: p.company.name,
                    latestWarranty
                } as ProductWithLatestWarranty;
            });
            
            return { data, totalCount: data.length };
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
            // 1. Get all warranties for this product (for linking warranty info)
            const productWarranties = await this.getWarrantiesByProduct(productId);

            // 2. Fetch all services and filter by productId
            const allRecords = await airtableBase(TABLES.SERVICES).select({
                sort: [{ field: 'entryTime', direction: 'desc' }]
            }).all();

            console.log("=== DEBUG: Fetching services for productId:", productId);
            console.log("Total records in Services table:", allRecords.length);

            // Filter records that have this productId
            const records = allRecords.filter(r => {
                const fields = r.fields as FieldSet;
                const pId = Array.isArray(fields.productId) ? fields.productId[0] : (fields.productId as string);
                return pId === productId;
            });

            console.log("Records matching productId:", records.length);

            // 3. Map services and link to warranty info if available
            const result = records
                .map(r => {
                    const fields = r.fields as FieldSet;
                    const wId = Array.isArray(fields.warrantyId) ? fields.warrantyId[0] : (fields.warrantyId as string);
                    const warranty = wId ? productWarranties.find(w => w.id === wId) : null;
                    return {
                        service: {
                            ...fields,
                            id: r.id, 
                            productId: Array.isArray(fields.productId) ? fields.productId[0] : (fields.productId as string),
                            orderCase: (fields.orderCase || fields.order_case) as string,
                            techService: (fields.techservice || fields.tech_service || fields.techService) as string,
                            entryTime: (fields.entryTime || fields.entry_time) as string,
                            exitTime: (fields.exitTime || fields.exit_time) as string,
                            warrantyId: wId
                        } as unknown as Service,
                        warranty: (warranty || {}) as Warranty
                    };
                });
            
            console.log("Mapped services:", result.length);
            return result;
        } else {
            return await mssqlDb.select({
                service: services,
                warranty: warranties
            })
                .from(services)
                .leftJoin(warranties, eq(services.warrantyId, warranties.id))
                .where(or(
                    eq(services.productId, Number(productId)),
                    eq(warranties.productId, Number(productId))
                ))
                .orderBy(desc(services.entryTime)) as unknown as ServiceWithWarranty[];
        }
    },

    async getServiceDetail(id: string | number) {
        console.log(`Fetching service detail for ID: ${id}`);
        if (isAirtable) {
            try {
                console.log(`Querying Airtable for service: ${id}`);
                const serviceRecord = await airtableBase(TABLES.SERVICES).find(id.toString());
                const sFields = serviceRecord.fields as FieldSet;
                const wId = Array.isArray(sFields.warrantyId) ? sFields.warrantyId[0] : (sFields.warrantyId as string);
                const pId = Array.isArray(sFields.productId) ? sFields.productId[0] : (sFields.productId as string);
                
                const service = { 
                    ...sFields, 
                    id: serviceRecord.id, 
                    productId: pId,
                    orderCase: (sFields.orderCase || sFields.order_case) as string,
                    techService: (sFields.techservice || sFields.tech_service || sFields.techService) as string,
                    entryTime: (sFields.entryTime || sFields.entry_time) as string,
                    exitTime: (sFields.exitTime || sFields.exit_time) as string,
                    warrantyId: wId
                } as unknown as Service;
                
                // Try to get warranty (might be null for CM/SERVICE)
                const warranty = wId ? await this.getWarrantyById(wId) : null;
                
                // Get product from warranty or directly from service
                let product = null;
                if (warranty) {
                    product = await this.getProductById(warranty.productId as unknown as string);
                } else if (pId) {
                    product = await this.getProductById(pId);
                }
                
                if (!product) return { service, warranty: null, product: null, company: null } as unknown as ServiceDetail;
                
                const company = await this.getCompanyById(product.companyId as unknown as string);
                return { service, warranty, product, company } as unknown as ServiceDetail;
            } catch { return null; }
        } else {
            console.log(`Querying MSSQL for service: ${id}`);
            const [result] = await mssqlDb.select({
                service: services,
                warranty: warranties,
                product: products,
                company: companies
            })
            .from(services)
            .leftJoin(warranties, eq(services.warrantyId, warranties.id))
            .leftJoin(products, eq(warranties.productId, products.id))
            .leftJoin(companies, eq(products.companyId, companies.id))
            .where(eq(services.id, Number(id)));
            
            console.log(`MSSQL Result:`, result ? 'Found' : 'Not Found');
            return result || null;
        }
    },

    async findServiceByOrderCase(orderCase: string) {
        console.log(`Searching service by Order Case: ${orderCase}`);
        if (isAirtable) {
            try {
                const records = await airtableBase(TABLES.SERVICES).select({
                    filterByFormula: `{order_case} = '${orderCase}'`
                }).all();

                if (records.length === 0) return [];

                const results: ServiceDetail[] = [];
                
                // Cache for efficient lookups
                const productCache = new Map<string, Product | null>();
                const companyCache = new Map<string, Company | null>();
                const warrantyCache = new Map<string, Warranty | null>();

                for (const serviceRecord of records) {
                    const sFields = serviceRecord.fields as FieldSet;
                    
                    const wId = Array.isArray(sFields.warrantyId) ? sFields.warrantyId[0] : (sFields.warrantyId as string);
                    const pId = Array.isArray(sFields.productId) ? sFields.productId[0] : (sFields.productId as string);

                    const service = { 
                        ...sFields, 
                        id: serviceRecord.id, 
                        productId: pId,
                        orderCase: (sFields.orderCase || sFields.order_case) as string,
                        techService: (sFields.techservice || sFields.tech_service || sFields.techService) as string,
                        entryTime: (sFields.entryTime || sFields.entry_time) as string,
                        exitTime: (sFields.exitTime || sFields.exit_time) as string,
                        warrantyId: wId
                    } as unknown as Service;
                    
                    let warranty = null;
                    if (wId) {
                        if (!warrantyCache.has(wId)) {
                             warrantyCache.set(wId, await this.getWarrantyById(wId));
                        }
                        warranty = warrantyCache.get(wId);
                    }
                    
                    let product = null;
                    if (pId) {
                        if (!productCache.has(pId)) {
                            productCache.set(pId, await this.getProductById(pId));
                        }
                        product = productCache.get(pId);
                    } else if (warranty) {
                        const wpId = warranty.productId as unknown as string;
                        if (!productCache.has(wpId)) {
                             productCache.set(wpId, await this.getProductById(wpId));
                        }
                        product = productCache.get(wpId);
                    }
                    
                    if (!product) {
                        results.push({ service, warranty: null, product: null, company: null } as unknown as ServiceDetail);
                        continue;
                    }

                    let company = null;
                    const cId = product.companyId as unknown as string;
                    if (cId) {
                         if (!companyCache.has(cId)) {
                             companyCache.set(cId, await this.getCompanyById(cId));
                         }
                         company = companyCache.get(cId);
                    }

                    results.push({ service, warranty, product, company } as unknown as ServiceDetail);
                }
                
                return results;

            } catch (error) {
                console.error("Error searching by order case:", error);
                return [];
            }
        } else {
            console.log(`Querying MSSQL for order case: ${orderCase}`);
            const results = await mssqlDb.select({
                service: services,
                warranty: warranties,
                product: products,
                company: companies
            })
            .from(services)
            .leftJoin(warranties, eq(services.warrantyId, warranties.id))
            .leftJoin(products, eq(services.productId, products.id))
            .leftJoin(companies, eq(products.companyId, companies.id))
            .where(eq(services.orderCase, orderCase));
            
            return results || [];
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

    async getNextOrderNumber(prefix: 'PM' | 'CM' | 'S' | 'IN' | 'OUT') {
        if (isAirtable) {
            const records = await airtableBase(TABLES.SERVICES).select({
                filterByFormula: `FIND('${prefix}_', {order_case})`,
                sort: [{ field: 'order_case', direction: 'desc' }],
                maxRecords: 1
            }).firstPage();

            if (records.length === 0) return `${prefix}_000001`;
            
            const lastCode = records[0].fields.order_case as string;
            if (!lastCode || !lastCode.startsWith(`${prefix}_`)) return `${prefix}_000001`;
            
            const numPart = lastCode.split("_")[1];
            const num = parseInt(numPart);
            if (isNaN(num)) return `${prefix}_000001`;
            
            return `${prefix}_${(num + 1).toString().padStart(6, '0')}`;
        } else {
            const [lastRecord] = await mssqlDb.select()
                .from(services)
                .where(sql`${services.orderCase} LIKE '${prefix}_%'`)
                .orderBy(desc(services.orderCase));
            
            if (!lastRecord || !lastRecord.orderCase) return `${prefix}_000001`;
            const numPart = lastRecord.orderCase.split("_")[1];
            const num = parseInt(numPart);
            if (isNaN(num)) return `${prefix}_000001`;
            
            return `${prefix}_${(num + 1).toString().padStart(6, '0')}`;
        }
    },

    async getServiceParts(orderCase: string) {
        if (isAirtable) {
            const records = await airtableBase(TABLES.SERVICE_PARTS).select({
                filterByFormula: `{order_case} = '${orderCase}'`
            }).all();
            return records.map(r => {
                const f = r.fields as FieldSet;
                return {
                    id: r.id,
                    orderCase: f.order_case,
                    partNo: f.part_no,
                    details: f.details,
                    qty: f.qty
                };
            }) as unknown as ServicePart[];
        } else {
            return await mssqlDb.select().from(serviceParts).where(eq(serviceParts.orderCase, orderCase));
        }
    },

    async saveServiceParts(orderCase: string, parts: Partial<NewServicePart>[]) {
        try {
            if (isAirtable) {
                console.log(`Syncing parts for Order Case: ${orderCase}`, parts);
                const existing = await airtableBase(TABLES.SERVICE_PARTS).select({
                    filterByFormula: `{order_case} = '${orderCase}'`
                }).all();
                
                if (existing.length > 0) {
                    const ids = existing.map(r => r.id);
                    console.log(`Deleting ${ids.length} existing parts...`);
                    for (let i = 0; i < ids.length; i += 10) {
                        await airtableBase(TABLES.SERVICE_PARTS).destroy(ids.slice(i, i + 10));
                    }
                }

                if (parts.length > 0) {
                    console.log(`Creating ${parts.length} new parts...`);
                    const recordsToCreate = parts.map(p => ({
                        fields: cleanDataForAirtable({ 
                            order_case: orderCase,
                            part_no: p.partNo,
                            details: p.details,
                            qty: p.qty ? Number(p.qty) : 0
                        })
                    }));
                    for (let i = 0; i < recordsToCreate.length; i += 10) {
                        await airtableBase(TABLES.SERVICE_PARTS).create(recordsToCreate.slice(i, i + 10));
                    }
                }
                console.log("Parts sync completed successfully.");
            } else {
                await mssqlDb.delete(serviceParts).where(eq(serviceParts.orderCase, orderCase));
                if (parts.length > 0) {
                    await mssqlDb.insert(serviceParts).values(parts.map(p => ({
                        ...p,
                        orderCase,
                        qty: p.qty ? Number(p.qty) : 0
                    }) as unknown as NewServicePart));
                }
            }
        } catch (error: unknown) {
            console.error("Error in saveServiceParts:", error);
            const err = error as Error;
            throw new Error(`Failed to save service parts: ${err.message || "Unknown error"}`);
        }
    },

    async createService(data: ServiceInput & { parts?: Partial<NewServicePart>[] }) {
        const { parts, ...serviceData } = data;
        const input = serviceData as Record<string, unknown>;
        let order_case = (input.orderCase || input.order_case) as string | undefined;
        
        if (!order_case && (data.type === 'PM' || data.type === 'CM' || data.type === 'SERVICE' || data.type === 'IN_REPAIR' || data.type === 'OUT_REPAIR')) {
            let prefix: 'PM' | 'CM' | 'S' | 'IN' | 'OUT' = 'PM'; // Default
            if (data.type === 'SERVICE') prefix = 'S';
            else if (data.type === 'IN_REPAIR') prefix = 'IN';
            else if (data.type === 'OUT_REPAIR') prefix = 'OUT';
            else prefix = data.type as 'PM' | 'CM';
            
            order_case = await this.getNextOrderNumber(prefix);
        }

        let result;
        if (isAirtable) {
            const inputMap = serviceData as Record<string, unknown>;
            const dataForAirtable: Record<string, unknown> = { ...inputMap };
            
            // Standardize field names for Airtable
            dataForAirtable.order_case = order_case;
            
            if (inputMap.entryTime) {
                const d = new Date(inputMap.entryTime as string);
                if (!isNaN(d.getTime())) dataForAirtable.entryTime = d.toISOString();
            }
            if (inputMap.exitTime) {
                const d = new Date(inputMap.exitTime as string);
                if (!isNaN(d.getTime())) dataForAirtable.exitTime = d.toISOString();
            }

            delete dataForAirtable.orderCase;
            delete dataForAirtable.entry_time;
            delete dataForAirtable.exit_time;
            delete dataForAirtable.tech_service;
            delete dataForAirtable.techservice;
            delete dataForAirtable.techService;
            delete dataForAirtable.partsjson;
            
            const cleaned = cleanDataForAirtable(dataForAirtable);
            console.log("=== DEBUG: Data being sent to Airtable ===");
            console.log("Original productId:", data.productId);
            console.log("Cleaned data:", JSON.stringify(cleaned, null, 2));
            try {
                const record = await airtableBase(TABLES.SERVICES).create(cleaned) as unknown as { id: string; fields: FieldSet };
                result = { id: record.id, ...record.fields } as unknown as Service;
            } catch (error: unknown) {
                console.error("Airtable Create Service Error:", error);
                const err = error as Error;
                throw new Error(err.message || "Failed to create service in Airtable");
            }
        } else {
            await mssqlDb.insert(services).values({
                ...serviceData,
                productId: data.productId ? Number(data.productId) : null,
                orderCase: order_case,
                warrantyId: data.warrantyId ? Number(data.warrantyId) : null,
                entryTime: new Date(data.entryTime),
                exitTime: new Date(data.exitTime)
            } as NewService);
            result = { id: order_case, success: true };
        }

        if (parts && order_case) {
            await this.saveServiceParts(order_case, parts);
        }

        return result;
    },

    async updateService(id: string | number, data: Partial<ServiceInput> & { parts?: Partial<NewServicePart>[] }) {
        const { parts, ...serviceData } = data;
        let orderCase = serviceData.orderCase;

        if (isAirtable) {
            try {
                const inputMap = serviceData as Record<string, unknown>;
                const mappedData: Record<string, unknown> = {};
                
                if (inputMap.description !== undefined) mappedData.description = inputMap.description;
                if (inputMap.technician !== undefined) mappedData.technician = inputMap.technician;
                if (inputMap.status !== undefined) mappedData.status = inputMap.status;
                if (inputMap.notes !== undefined) mappedData.notes = inputMap.notes;
                
                if (inputMap.entryTime) {
                    const d = new Date(inputMap.entryTime as string);
                    if (!isNaN(d.getTime())) mappedData.entryTime = d.toISOString();
                }
                if (inputMap.exitTime) {
                    const d = new Date(inputMap.exitTime as string);
                    if (!isNaN(d.getTime())) mappedData.exitTime = d.toISOString();
                }
                
                if (inputMap.orderCase !== undefined) {
                    mappedData.order_case = inputMap.orderCase;
                }

                const cleaned = cleanDataForAirtable(mappedData);
                
                console.log(`Updating Airtable Service ${id} with:`, cleaned);
                const record = await airtableBase(TABLES.SERVICES).update(id.toString(), cleaned) as unknown as { id: string; fields: FieldSet };
                
                if (!orderCase) {
                    orderCase = (record.fields.order_case || record.fields.orderCase) as string | undefined; // Fallbacks
                }
                console.log(`Updated Service Order Case: ${orderCase}`);
            } catch (error: unknown) {
                console.error("Detailed Airtable Update Error:", error);
                const err = error as Error;
                throw new Error(err.message || "Failed to update service in Airtable");
            }
        } else {
            await mssqlDb.update(services).set({
                ...serviceData,
                warrantyId: serviceData.warrantyId ? Number(serviceData.warrantyId) : undefined,
                entryTime: serviceData.entryTime ? new Date(serviceData.entryTime) : undefined,
                exitTime: serviceData.exitTime ? new Date(serviceData.exitTime) : undefined
            } as Partial<NewService>).where(eq(services.id, Number(id)));

            if (!orderCase) {
                const [s] = await mssqlDb.select().from(services).where(eq(services.id, Number(id)));
                orderCase = s?.orderCase || "";
            }
        }

        if (parts && orderCase) {
            await this.saveServiceParts(orderCase, parts);
        }

        return { success: true };
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
                    warrantyStartDate = formatDate(startDate);
                    warrantyEndDate = formatDate(endDate);

                    const pmServices = serviceRecords.filter(s => {
                        const sFields = s.fields as FieldSet;
                        // Handle array or string for warrantyId
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
                    purchaseDate: formatDate(fields.purchaseDate as string),
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
                    warrantyStartDate = formatDate(latestWarranty.startDate);
                    warrantyEndDate = formatDate(latestWarranty.endDate);

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
                    purchaseDate: formatDate(r.product.purchaseDate),
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
    },

    // === DASHBOARD ===
    async getDashboardStats() {
        if (isAirtable) {
            try {
                // Fetch all data in parallel
                const [companiesRecs, productsRecs, warrantiesRecs, servicesRecs] = await Promise.all([
                    airtableBase(TABLES.COMPANIES).select({ fields: ['name'] }).all(),
                    airtableBase(TABLES.PRODUCTS).select({ fields: ['name', 'serialNumber'] }).all(),
                    airtableBase(TABLES.WARRANTIES).select({ fields: ['startDate', 'endDate', 'type', 'productId'] }).all(),
                    airtableBase(TABLES.SERVICES).select({
                        fields: ['type', 'status', 'entryTime', 'exitTime', 'description', 'technician', 'order_case', 'productId'],
                        sort: [{ field: 'entryTime', direction: 'desc' }],
                    }).all(),
                ]);

                const now = new Date();
                const thirtyDaysLater = new Date();
                thirtyDaysLater.setDate(now.getDate() + 30);

                // Warranty stats
                let warrantyActive = 0;
                let warrantyExpired = 0;
                let warrantyNearExpiry = 0;

                for (const w of warrantiesRecs) {
                    const endDate = w.fields.endDate ? new Date(w.fields.endDate as string) : null;
                    if (!endDate) continue;

                    if (endDate < now) {
                        warrantyExpired++;
                    } else if (endDate <= thirtyDaysLater) {
                        warrantyNearExpiry++;
                    } else {
                        warrantyActive++;
                    }
                }

                // Service stats
                let servicePending = 0;
                let serviceCompleted = 0;
                let serviceCancelled = 0;
                let serviceCM = 0;
                let servicePM = 0;

                for (const s of servicesRecs) {
                    const status = (s.fields.status as string) || '';
                    const type = (s.fields.type as string) || '';

                    if (status === 'เสร็จสิ้น') serviceCompleted++;
                    else if (status === 'ยกเลิก') serviceCancelled++;
                    else servicePending++;

                    if (type === 'CM') serviceCM++;
                    else if (type === 'PM') servicePM++;
                }

                // Recent services (latest 10)
                const recentServices = servicesRecs.slice(0, 10).map(s => ({
                    id: s.id,
                    type: (s.fields.type as string) || '',
                    status: (s.fields.status as string) || 'รอดำเนินการ',
                    entryTime: (s.fields.entryTime as string) || '',
                    exitTime: (s.fields.exitTime as string) || '',
                    description: (s.fields.description as string) || '',
                    technician: (s.fields.technician as string) || '',
                    orderCase: (s.fields.order_case as string) || '',
                }));

                return {
                    totalCompanies: companiesRecs.length,
                    totalProducts: productsRecs.length,
                    totalWarranties: warrantiesRecs.length,
                    totalServices: servicesRecs.length,
                    warranty: { active: warrantyActive, expired: warrantyExpired, nearExpiry: warrantyNearExpiry },
                    service: {
                        pending: servicePending,
                        completed: serviceCompleted,
                        cancelled: serviceCancelled,
                        cm: serviceCM,
                        pm: servicePM,
                    },
                    recentServices,
                };
            } catch (error) {
                console.error('getDashboardStats error:', error);
                return null;
            }
        } else {
            // MSSQL fallback
            return null;
        }
    },
};
