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
            // Use cache
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            
            let results = cached.companies.map(r => ({
                id: r.id,
                ...r.fields,
                createdBy: Array.isArray(r.fields.createdBy) ? r.fields.createdBy[0] : r.fields.createdBy
            }));

            if (query) {
                const q = query.toLowerCase();
                
                // Find company IDs from products matching serial number
                const companyIdsFromProducts = cached.products
                    .filter(p => {
                        const serial = (p.fields.serialNumber as string || '').toLowerCase();
                        return serial.includes(q);
                    })
                    .map(p => Array.isArray(p.fields.companyId) ? p.fields.companyId[0] : p.fields.companyId)
                    .filter(Boolean);

                // Filter companies
                results = results.filter(c => {
                    const name = ((c as Record<string, unknown>).name as string || '').toLowerCase();
                    const nameSecondary = ((c as Record<string, unknown>).nameSecondary as string || '').toLowerCase();
                    const taxId = ((c as Record<string, unknown>).taxId as string || '').toLowerCase();
                    
                    return name.includes(q) || 
                           nameSecondary.includes(q) || 
                           taxId.includes(q) ||
                           companyIdsFromProducts.includes(c.id);
                });
            }

            return results;
        } else {
            return await mssqlDb.select().from(companies)
                .where(query ? or(
                    like(companies.name, `%${query}%`),
                    like(companies.nameSecondary, `%${query}%`),
                    like(companies.taxId, `%${query}%`),
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
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            const record = cached.companies.find(c => c.id === id.toString());
            if (!record) return null;
            return {
                id: record.id,
                ...record.fields,
                createdBy: Array.isArray(record.fields.createdBy) ? record.fields.createdBy[0] : record.fields.createdBy
            } as unknown as Company;
        } else {
            const [company] = await mssqlDb.select().from(companies).where(eq(companies.id, Number(id)));
            return company || null;
        }
    },

    async findCompanyByName(name: string) {
        if (isAirtable) {
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            const record = cached.companies.find(c => c.fields.name === name);
            if (!record) return null;
            return { id: record.id, ...record.fields } as unknown as Company;
        } else {
            const [company] = await mssqlDb.select().from(companies).where(eq(companies.name, name));
            return company || null;
        }
    },

    // === PRODUCTS ===
    async getProductsByCompany(companyId: string | number) {
        if (isAirtable) {
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            return cached.products
                .filter(r => {
                    const cId = Array.isArray(r.fields.companyId) ? r.fields.companyId[0] : r.fields.companyId;
                    return cId === companyId.toString();
                })
                .map(r => ({
                    id: r.id,
                    ...r.fields,
                    companyId: Array.isArray(r.fields.companyId) ? r.fields.companyId[0] : r.fields.companyId
                }));
        } else {
            return await mssqlDb.select().from(products).where(eq(products.companyId, Number(companyId)));
        }
    },

    async getProductById(id: string | number) {
        if (isAirtable) {
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            const record = cached.products.find(p => p.id === id.toString());
            if (!record) return null;
            return {
                id: record.id,
                ...record.fields,
                companyId: Array.isArray(record.fields.companyId) ? record.fields.companyId[0] : record.fields.companyId
            } as unknown as Product;
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
            // Use cache
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            
            let filteredProducts = [...cached.products];
            
            // 1. Search Filter (in memory)
            if (query) {
                const q = query.toLowerCase();
                filteredProducts = filteredProducts.filter(r => {
                    const name = (r.fields.name as string || '').toLowerCase();
                    const serial = (r.fields.serialNumber as string || '').toLowerCase();
                    return name.includes(q) || serial.includes(q);
                });
            }
            
            // 2. Status Filter (in memory)
            if (status && status !== 'all') {
                filteredProducts = filteredProducts.filter(r => {
                    const warrantyStatus = r.fields.warrantyStatus as string || '';
                    const isNearExpiry = Boolean(r.fields.isNearExpiry);
                    
                    if (status === 'active') {
                        return warrantyStatus === '✅ Active' && !isNearExpiry;
                    } else if (status === 'near_expiry') {
                        return isNearExpiry;
                    } else if (status === 'expired') {
                        return warrantyStatus === '❌ Expired' || warrantyStatus === '⚠️ No Warranty';
                    }
                    return true;
                });
            }
            
            // 3. Sort by warranty end date
            filteredProducts.sort((a, b) => {
                const dateA = String(a.fields.latestWarrantyEndDate || '');
                const dateB = String(b.fields.latestWarrantyEndDate || '');
                return dateA.localeCompare(dateB);
            });
            
            const totalCount = filteredProducts.length;
            
            // 4. Pagination
            const pageData = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
            
            // 5. Map to result format
            const data = pageData.map(r => {
                const fields = r.fields as FieldSet;
                const companyId = Array.isArray(fields.companyId) ? fields.companyId[0] : (fields.companyId as string);
                
                // Find company from cache
                const company = cached.companies.find(c => c.id === companyId);
                
                return {
                    ...fields,
                    id: r.id,
                    companyId,
                    companyName: company ? (company.fields as FieldSet).name as string : 'Unknown',
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
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            
            return cached.warranties
                .map(r => ({
                    id: r.id,
                    ...r.fields,
                    productId: Array.isArray(r.fields.productId) ? r.fields.productId[0] : (r.fields.productId as string)
                }))
                .filter(w => productIds.map(String).includes(String(w.productId)));
        } else {
            if (productIds.length === 0) return [];
            return await mssqlDb.select().from(warranties).where(sql`${warranties.productId} IN (${sql.join(productIds, sql`, `)})`);
        }
    },

    async getWarrantiesByProduct(productId: string | number) {
        if (isAirtable) {
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            
            return cached.warranties
                .filter(r => {
                    const pId = Array.isArray(r.fields.productId) ? r.fields.productId[0] : r.fields.productId;
                    return pId === productId.toString();
                })
                .map(r => ({
                    id: r.id,
                    ...r.fields,
                    productId: Array.isArray(r.fields.productId) ? r.fields.productId[0] : (r.fields.productId as string)
                }))
                .sort((a, b) => {
                    const dateA = String((a as Record<string, unknown>).endDate || '');
                    const dateB = String((b as Record<string, unknown>).endDate || '');
                    return dateB.localeCompare(dateA); // desc
                });
        } else {
            return await mssqlDb.select().from(warranties)
                .where(eq(warranties.productId, Number(productId)))
                .orderBy(desc(warranties.endDate));
        }
    },

    // === SERVICES ===
    async getServicesByProduct(productId: string | number): Promise<ServiceWithWarranty[]> {
        if (isAirtable) {
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            
            // 1. Get warranties for this product from cache
            const productWarranties = cached.warranties
                .filter(r => {
                    const pId = Array.isArray(r.fields.productId) ? r.fields.productId[0] : r.fields.productId;
                    return pId === productId.toString();
                })
                .map(r => ({
                    id: r.id,
                    ...r.fields,
                    productId: Array.isArray(r.fields.productId) ? r.fields.productId[0] : r.fields.productId
                }));

            // 2. Filter services by productId from cache
            const records = cached.services.filter(r => {
                const fields = r.fields as FieldSet;
                const pId = Array.isArray(fields.productId) ? fields.productId[0] : (fields.productId as string);
                return pId === productId.toString();
            });

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

    async getAllServices(options: { query?: string; type?: string; page?: number; pageSize?: number } = {}) {
        const { query = "", type = "all", page = 1, pageSize = 20 } = options;
        
        if (isAirtable) {
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            
            let filtered = cached.services.map(r => {
                const fields = r.fields as FieldSet;
                const pId = Array.isArray(fields.productId) ? fields.productId[0] : (fields.productId as string);
                const product = cached.products.find(p => p.id === pId);
                const pFields = product?.fields as FieldSet;
                const cId = pFields ? (Array.isArray(pFields.companyId) ? pFields.companyId[0] : (pFields.companyId as string)) : null;
                const company = cached.companies.find(c => c.id === cId);

                return {
                    id: r.id,
                    orderCase: (fields.orderCase || fields.order_case || "") as string,
                    type: fields.type as string,
                    status: fields.status as string,
                    entryTime: (fields.entryTime || fields.entry_time) as string,
                    exitTime: (fields.exitTime || fields.exit_time) as string,
                    productName: (pFields?.name as string) || "Unknown Product",
                    companyName: (company?.fields.name as string) || "Unknown Company",
                    techService: (fields.techservice || fields.tech_service || fields.techService || "") as string,
                };
            });

            // Filtering
            if (type !== "all") {
                filtered = filtered.filter(s => s.type === type);
            }

            if (query) {
                const q = query.toLowerCase();
                filtered = filtered.filter(s => 
                    String(s.orderCase).toLowerCase().includes(q) ||
                    String(s.productName).toLowerCase().includes(q) ||
                    String(s.companyName).toLowerCase().includes(q) ||
                    String(s.techService).toLowerCase().includes(q)
                );
            }

            // Sorting (newest first)
            filtered.sort((a, b) => {
                const dateA = a.entryTime ? new Date(a.entryTime).getTime() : 0;
                const dateB = b.entryTime ? new Date(b.entryTime).getTime() : 0;
                return dateB - dateA;
            });

            // Pagination
            const total = filtered.length;
            const start = (page - 1) * pageSize;
            const data = filtered.slice(start, start + pageSize);

            return { data, total };
        } else {
            // MSSQL implementation (simplified for now)
            return { data: [], total: 0 };
        }
    },

    async getServiceDetail(id: string | number) {
        console.log(`Fetching service detail for ID: ${id}`);
        if (isAirtable) {
            try {
                const { getCachedData } = await import('./cache');
                const cached = await getCachedData();
                
                const serviceRecord = cached.services.find(s => s.id === id.toString());
                if (!serviceRecord) return null;
                
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

    // === CREATIONS ===
    async createCompany(data: CompanyInput) {
        if (isAirtable) {
            const cleaned = cleanDataForAirtable(data as unknown as Record<string, unknown>);
            const record = await airtableBase(TABLES.COMPANIES).create(cleaned) as unknown as { id: string, fields: FieldSet };
            const { addToCache } = await import('./cache');
            addToCache('companies', { id: record.id, fields: record.fields });
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
            const { updateInCache } = await import('./cache');
            updateInCache('companies', record.id, record.fields);
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
            const { addToCache } = await import('./cache');
            addToCache('products', { id: record.id, fields: record.fields });
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
            const { addToCache, invalidateCache } = await import('./cache');
            addToCache('warranties', { id: record.id, fields: record.fields });
            
            // Note: Since warranty affects latestWarrantyEndDate in Product (Airtable calculation), 
            // we should technically invalidade the product cache or wait for background refresh.
            // For now, let's just invalidate to be safe since this is a heavy calculation.
            invalidateCache(); 
            
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

    async getNextOrderNumber(prefix: 'PM' | 'CM' | 'S') {
        if (isAirtable) {
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            
            const relevantServices = cached.services
                .filter(r => (r.fields.order_case as string || '').includes(prefix + '_'))
                .sort((a, b) => ((b.fields.order_case as string) || '').localeCompare((a.fields.order_case as string) || ''))
                .slice(0, 1);

            if (relevantServices.length === 0) return `${prefix}_000001`;
            
            const lastCode = relevantServices[0].fields.order_case as string;
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
        
        if (!order_case && (data.type === 'PM' || data.type === 'CM' || data.type === 'SERVICE')) {
            const prefix = data.type === 'SERVICE' ? 'S' : data.type as 'PM' | 'CM';
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
                const { addToCache } = await import('./cache');
                addToCache('services', { id: record.id, fields: record.fields });
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
                
                const { updateInCache } = await import('./cache');
                updateInCache('services', record.id, record.fields);

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
                const { getCachedData } = await import('./cache');
                const cached = await getCachedData();
                const record = cached.warranties.find(w => w.id === id.toString());
                if (!record) return null;
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
            const { getCachedData } = await import('./cache');
            const cached = await getCachedData();
            
            const productRecords = cached.products;
            const companyRecords = cached.companies;
            const warrantyRecords = cached.warranties;
            const serviceRecords = cached.services.filter(s => (s.fields as FieldSet).type === 'PM');

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
    },

    // === DASHBOARD STATS ===
    async getDashboardStats() {
        if (isAirtable) {
            const { getCachedData } = await import('./cache');
            const cachedData = await getCachedData();
            
            const productRecords = cachedData.products;
            const companyRecords = cachedData.companies;
            const warrantyRecords = cachedData.warranties;
            const serviceRecords = cachedData.services;

            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

            // Calculate warranty statistics
            let activeCount = 0;
            let nearExpiryCount = 0;
            let expiredCount = 0;
            let noWarrantyCount = 0;

            interface ExpiringProduct {
                id: string;
                name: string;
                serialNumber: string;
                companyName: string;
                endDate: Date;
                daysRemaining: number;
            }

            const expiringWithin30Days: ExpiringProduct[] = [];
            const expiringWithin60Days: ExpiringProduct[] = [];

            productRecords.forEach(r => {
                const fields = r.fields as FieldSet;
                const status = fields.warrantyStatus as string;
                const isNearExpiry = Boolean(fields.isNearExpiry);
                const endDateStr = fields.latestWarrantyEndDate as string;

                if (!endDateStr || status === '⚠️ No Warranty') {
                    noWarrantyCount++;
                } else if (status === '❌ Expired') {
                    expiredCount++;
                } else if (isNearExpiry) {
                    nearExpiryCount++;
                } else {
                    activeCount++;
                }

                // Check for upcoming expirations
                if (endDateStr) {
                    const endDate = new Date(endDateStr);
                    if (endDate > now && endDate <= sixtyDaysFromNow) {
                        const companyId = Array.isArray(fields.companyId) ? fields.companyId[0] : (fields.companyId as string);
                        const company = companyRecords.find(c => c.id === companyId);
                        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                        
                        const item: ExpiringProduct = {
                            id: r.id,
                            name: fields.name as string,
                            serialNumber: fields.serialNumber as string,
                            companyName: company ? (company.fields.name as string) : 'Unknown',
                            endDate,
                            daysRemaining
                        };

                        if (endDate <= thirtyDaysFromNow) {
                            expiringWithin30Days.push(item);
                        } else {
                            expiringWithin60Days.push(item);
                        }
                    }
                }
            });

            // Sort by days remaining
            expiringWithin30Days.sort((a, b) => a.daysRemaining - b.daysRemaining);
            expiringWithin60Days.sort((a, b) => a.daysRemaining - b.daysRemaining);

            // Monthly service data for chart (last 6 months)
            const monthlyServiceData: { month: string; PM: number; CM: number; SERVICE: number }[] = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
                monthlyServiceData.push({ month: monthName, PM: 0, CM: 0, SERVICE: 0 });
            }

            serviceRecords.forEach(r => {
                const fields = r.fields as FieldSet;
                const entryTime = fields.entryTime as string;
                const serviceType = fields.type as string;
                
                if (entryTime) {
                    const serviceDate = new Date(entryTime);
                    const monthDiff = (now.getFullYear() - serviceDate.getFullYear()) * 12 + (now.getMonth() - serviceDate.getMonth());
                    
                    if (monthDiff >= 0 && monthDiff < 6) {
                        const index = 5 - monthDiff;
                        if (monthlyServiceData[index]) {
                            if (serviceType === 'PM') monthlyServiceData[index].PM++;
                            else if (serviceType === 'CM') monthlyServiceData[index].CM++;
                            else if (serviceType === 'SERVICE') monthlyServiceData[index].SERVICE++;
                        }
                    }
                }
            });

            // Recent services
            const recentServices = serviceRecords
                .map(r => ({
                    id: r.id,
                    orderCase: (r.fields.order_case || r.fields.orderCase) as string,
                    type: r.fields.type as string,
                    status: r.fields.status as string,
                    entryTime: r.fields.entryTime as string
                }))
                .filter(s => s.entryTime)
                .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
                .slice(0, 10);

            return {
                totalProducts: productRecords.length,
                totalCompanies: companyRecords.length,
                totalWarranties: warrantyRecords.length,
                totalServices: serviceRecords.length,
                warrantyStats: {
                    active: activeCount,
                    nearExpiry: nearExpiryCount,
                    expired: expiredCount,
                    noWarranty: noWarrantyCount
                },
                expiringWithin30Days: expiringWithin30Days.slice(0, 10),
                expiringWithin60Days: expiringWithin60Days.slice(0, 10),
                monthlyServiceData,
                recentServices
            };
        } else {
            // MSSQL implementation
            const [productCount] = await mssqlDb.select({ count: sql<number>`COUNT(*)` }).from(products);
            const [companyCount] = await mssqlDb.select({ count: sql<number>`COUNT(*)` }).from(companies);
            const [warrantyCount] = await mssqlDb.select({ count: sql<number>`COUNT(*)` }).from(warranties);
            const [serviceCount] = await mssqlDb.select({ count: sql<number>`COUNT(*)` }).from(services);

            const now = new Date();
            const allWarranties = await mssqlDb.select().from(warranties);
            
            let activeCount = 0, nearExpiryCount = 0, expiredCount = 0;
            allWarranties.forEach(w => {
                if (w.endDate < now) expiredCount++;
                else {
                    const daysRemaining = Math.ceil((w.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                    if (daysRemaining <= 30) nearExpiryCount++;
                    else activeCount++;
                }
            });

            return {
                totalProducts: productCount?.count || 0,
                totalCompanies: companyCount?.count || 0,
                totalWarranties: warrantyCount?.count || 0,
                totalServices: serviceCount?.count || 0,
                warrantyStats: {
                    active: activeCount,
                    nearExpiry: nearExpiryCount,
                    expired: expiredCount,
                    noWarranty: 0
                },
                expiringWithin30Days: [],
                expiringWithin60Days: [],
                monthlyServiceData: [],
                recentServices: []
            };
        }
    }
};
