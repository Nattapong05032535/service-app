/**
 * Role-Based Permission System (Option A: Config in Code)
 * 
 * Roles: Super Admin, Manager, User
 * ใช้ field `role` ใน Users table บน Airtable โดยตรง
 */

export type RoleName = 'Super Admin' | 'Manager' | 'User';

export type Resource = 'company' | 'product' | 'warranty' | 'service' | 'user' | 'import' | 'export' | 'dashboard';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'execute';

type PermissionMatrix = Record<RoleName, Record<Resource, Partial<Record<Action, boolean>>>>;

export const PERMISSIONS: PermissionMatrix = {
    'Super Admin': {
        company:  { create: true, read: true, update: true, delete: true },
        product:  { create: true, read: true, update: true, delete: true },
        warranty: { create: true, read: true, update: true, delete: true },
        service:  { create: true, read: true, update: true, delete: true },
        user:     { create: true, read: true, update: true, delete: true },
        import:   { execute: false },
        export:   { execute: true },
        dashboard: { read: true },
    },
    'Manager': {
        company:  { create: true, read: true, update: true, delete: false },
        product:  { create: true, read: true, update: true, delete: false },
        warranty: { create: true, read: true, update: true, delete: false },
        service:  { create: true, read: true, update: true, delete: false },
        user:     { create: false, read: true, update: false, delete: false },
        import:   { execute: false },
        export:   { execute: false },
        dashboard: { read: true },
    },
    'User': {
        company:  { create: false, read: true, update: false, delete: false },
        product:  { create: false, read: true, update: false, delete: false },
        warranty: { create: false, read: true, update: false, delete: false },
        service:  { create: true, read: true, update: true, delete: false },
        user:     { create: false, read: false, update: false, delete: false },
        import:   { execute: false },
        export:   { execute: false },
        dashboard: { read: false },
    },
};

/** Default role สำหรับผู้ลงทะเบียนใหม่ */
export const DEFAULT_ROLE: RoleName = 'User';
