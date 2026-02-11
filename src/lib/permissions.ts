import { PERMISSIONS, type RoleName, type Resource, type Action } from '@/config/permissions';

/**
 * ตรวจสอบว่า role มีสิทธิ์ทำ action บน resource หรือไม่
 * @example hasPermission('Manager', 'company', 'delete') → false
 */
export function hasPermission(
    role: RoleName | string | undefined | null,
    resource: Resource,
    action: Action,
): boolean {
    if (!role) return false;
    const rolePerms = PERMISSIONS[role as RoleName];
    if (!rolePerms) return false;
    return rolePerms[resource]?.[action] ?? false;
}

/**
 * ตรวจสอบสิทธิ์ + throw error ถ้าไม่มีสิทธิ์
 * ใช้ใน Server Actions
 */
export function requirePermission(
    role: RoleName | string | undefined | null,
    resource: Resource,
    action: Action,
): void {
    if (!role) {
        throw new Error('กรุณาเข้าสู่ระบบ');
    }
    if (!hasPermission(role, resource, action)) {
        throw new Error(`คุณไม่มีสิทธิ์ ${action} ${resource} (Role: ${role})`);
    }
}
