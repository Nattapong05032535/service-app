/**
 * In-Memory Cache for Airtable Data
 * 
 * Strategy:
 * 1. Load all data at startup (warmup)
 * 2. All reads use cache
 * 3. On Create/Update: Update Airtable → Update cache locally (no full refresh)
 * 4. TTL-based refresh as fallback
 */

import { airtableBase, TABLES } from './airtable';
import { FieldSet } from 'airtable';

// Cache TTL: 30 minutes (longer since we update cache on CUD)
const CACHE_TTL = 30 * 60 * 1000;

// Types
export interface CacheRecord {
    id: string;
    fields: FieldSet;
}

interface CacheState {
    products: CacheRecord[];
    companies: CacheRecord[];
    warranties: CacheRecord[];
    services: CacheRecord[];
    lastUpdated: number;
    isLoading: boolean;
    isReady: boolean;
}

// Global cache state with HMR support
interface GlobalCache {
    state?: CacheState;
}

const g = globalThis as unknown as GlobalCache;

// Initial state
const initialState: CacheState = {
    products: [],
    companies: [],
    warranties: [],
    services: [],
    lastUpdated: 0,
    isLoading: false,
    isReady: false,
};

// Use global state in dev, or local in prod
const cache: CacheState = g.state || initialState;
if (process.env.NODE_ENV !== 'production') {
    g.state = cache;
}

let warmupPromise: Promise<void> | null = null;

// ============ HELPERS ============

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isCacheValid(): boolean {
    if (!cache.isReady || cache.lastUpdated === 0) return false;
    return (Date.now() - cache.lastUpdated) < CACHE_TTL;
}

// ============ FETCH WITH RETRY ============

async function fetchWithRetry<T>(
    fetcher: () => Promise<T>,
    retries = 3,
    delay = 3000
): Promise<T> {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fetcher();
        } catch (error) {
            console.error(`[Cache] Fetch attempt ${i + 1}/${retries + 1} failed:`, error);
            if (i < retries) {
                console.log(`[Cache] Retrying in ${delay / 1000}s...`);
                await sleep(delay);
            } else {
                throw error;
            }
        }
    }
    throw new Error('Fetch failed after retries');
}

// ============ INITIAL WARMUP ============

export async function warmupCache(): Promise<void> {
    if (cache.isReady && isCacheValid()) {
        console.log('[Cache] Already warmed up and valid');
        return;
    }

    if (warmupPromise) {
        console.log('[Cache] Waiting for existing warmup...');
        return warmupPromise;
    }

    warmupPromise = (async () => {
        console.log('[Cache] 🔥 Starting cache warmup...');
        cache.isLoading = true;
        const startTime = Date.now();

        try {
            // Fetch everything in parallel
            const [products, companies, warranties, services] = await Promise.all([
                fetchWithRetry(() => airtableBase(TABLES.PRODUCTS).select().all()),
                fetchWithRetry(() => airtableBase(TABLES.COMPANIES).select().all()),
                fetchWithRetry(() => airtableBase(TABLES.WARRANTIES).select().all()),
                fetchWithRetry(() => airtableBase(TABLES.SERVICES).select().all())
            ]);

            cache.products = products.map(r => ({ id: r.id, fields: r.fields }));
            cache.companies = companies.map(r => ({ id: r.id, fields: r.fields }));
            cache.warranties = warranties.map(r => ({ id: r.id, fields: r.fields }));
            cache.services = services.map(r => ({ id: r.id, fields: r.fields }));

            cache.lastUpdated = Date.now();
            cache.isReady = true;
            cache.isLoading = false;

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[Cache] ✅ Warmup complete in ${elapsed}s (P:${cache.products.length} C:${cache.companies.length} W:${cache.warranties.length} S:${cache.services.length})`);
        } catch (error) {
            console.error('[Cache] ❌ Warmup failed:', error);
            cache.isLoading = false;
            throw error;
        }
    })();

    try {
        await warmupPromise;
    } finally {
        warmupPromise = null;
    }
}

// ============ GET CACHED DATA ============

export async function getCachedData(): Promise<CacheState> {
    // Ensure cache is ready
    if (!cache.isReady) {
        await warmupCache();
    } else if (!isCacheValid()) {
        // Refresh in background if expired, but return current data
        console.log('[Cache] Cache expired, refreshing in background...');
        warmupCache().catch(err => console.error('[Cache] Background refresh failed:', err));
    }

    return cache;
}

// ============ CACHE UPDATE METHODS ============
// Instead of full refresh, update cache locally after CUD operations

export function addToCache(table: 'products' | 'companies' | 'warranties' | 'services', record: CacheRecord): void {
    cache[table].push(record);
    console.log(`[Cache] Added ${table} record: ${record.id}`);
}

export function updateInCache(table: 'products' | 'companies' | 'warranties' | 'services', id: string, fields: FieldSet): void {
    const index = cache[table].findIndex(r => r.id === id);
    if (index !== -1) {
        cache[table][index] = { id, fields };
        console.log(`[Cache] Updated ${table} record: ${id}`);
    }
}

export function removeFromCache(table: 'products' | 'companies' | 'warranties' | 'services', id: string): void {
    const index = cache[table].findIndex(r => r.id === id);
    if (index !== -1) {
        cache[table].splice(index, 1);
        console.log(`[Cache] Removed ${table} record: ${id}`);
    }
}

// Force full refresh (use sparingly)
export function invalidateCache(): void {
    console.log('[Cache] Cache invalidated');
    cache.isReady = false;
    cache.lastUpdated = 0;
}

// ============ STATS ============

export function getCacheStats() {
    return {
        products: cache.products.length,
        companies: cache.companies.length,
        warranties: cache.warranties.length,
        services: cache.services.length,
        isReady: cache.isReady,
        isLoading: cache.isLoading,
        lastUpdated: cache.lastUpdated ? new Date(cache.lastUpdated).toISOString() : 'Never',
        ageMinutes: cache.lastUpdated ? Math.round((Date.now() - cache.lastUpdated) / 60000) : -1,
    };
}
