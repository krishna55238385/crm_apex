export type Permission =
    | 'users.read'
    | 'users.write'
    | 'users.delete'
    | 'settings.read'
    | 'settings.write'
    | 'leads.read'
    | 'leads.write'
    | 'leads.delete'
    | 'roles.read'
    | 'roles.write'
    | 'reports.read';

export interface RolePermissions {
    [key: string]: boolean;
}
