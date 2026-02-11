import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (process.env.DB_TYPE === 'airtable' && (!apiKey || !baseId)) {
    console.error('Airtable API Key or Base ID is missing in environment variables');
}

Airtable.configure({
    apiKey: apiKey,
});

export const airtableBase = Airtable.base(baseId || '');

// Table Names - Match these with your Airtable Base
export const TABLES = {
    COMPANIES: 'Companies',
    PRODUCTS: 'Products',
    WARRANTIES: 'Warranties',
    SERVICES: 'Services',
    USERS: 'Users',
    SERVICE_PARTS: 'ServiceParts',
    TECHNICIANS: 'Technicians',
};
