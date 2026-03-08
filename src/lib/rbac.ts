export const ROLES = {
    ADMIN: "ADMIN",
    USER: "USER"
}

export type Role = keyof typeof ROLES;

/*
Routes and which roles can access them
*/
export const ROUTES_PERMISSIONS: Record<string, Role[]> = {
    "/dashboard": ["ADMIN", "USER"],
    "/api/users/": ["ADMIN"],
    "api/transactions/": ["ADMIN", "USER"]
};

export function hasPermission(role: Role, path: string): boolean {
    const matchedRoute = Object.keys(ROUTES_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find(route => path.startsWith(route));

    if (!matchedRoute) return true;
    return ROUTES_PERMISSIONS[matchedRoute].includes(role);
}