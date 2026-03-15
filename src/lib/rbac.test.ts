import { describe, it, expect } from "vitest";
import { hasPermission } from "./rbac";

/** Unit tests for RBAC utility functions. */

describe("hasPermission", () => {
    /** ADMIN can access any defined route */
    it("grants ADMIN access to /api/reports/", () => {
        expect(hasPermission("ADMIN", "/api/reports/")).toBe(true);
    });

    /** USER cannot access admin-only routes */
    it("denies USER access to /api/reports", () => {
        expect(hasPermission("USER", "/api/reports/")).toBe(false);
    });

    /** Both role can access to /api/transactions/ */
    it("grants USER access to /api/transactions", () => {
        expect(hasPermission("USER", "/api/transactions")).toBe(true);
    });

    it("grants ADMIN access to /api/transactions/", () => {
        expect(hasPermission("ADMIN", "/api/transactions/")).toBe(true);
    });

    /** Only ADMIN can access to /api/users/ */
    it("Only USER can access to /api/users/", () => {
        expect(hasPermission("USER", "/api/users/")).toBe(false);
    });

    it("Only ADMIN can access to /api/users/", () => {
        expect(hasPermission("ADMIN", "/api/users/")).toBe(true);
    });

    /** Both roles can access /dashboard */
    it("grants USER access to /dashboard", () => {
        expect(hasPermission("USER", "/dashboard")).toBe(true);
    });

    /** Routes not defined in ROUTES_PERMISSIONS default to allowed */
    it("grants access to an undefined route", () => {
        expect(hasPermission("USER", "/unknown-path")).toBe(true);
    });

    /**  */
    it("matches longest prefix for subpaths", () => {
        expect(hasPermission("USER", "/api/users/123")).toBe(false);
        expect(hasPermission("ADMIN", "/api/users/123")).toBe(true);
    });

});