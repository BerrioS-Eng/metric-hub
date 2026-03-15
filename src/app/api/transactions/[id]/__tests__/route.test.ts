import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH, DELETE } from "../route";

vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/prisma", () => ({
    default: {
        transaction: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth", () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

function buildRequest(url: string, options?: RequestInit): Request {
    return new Request(`http://localhost${url}`, options);
}

const paramsPromise = (id: string) => Promise.resolve({ id });

// PATCH /api/transactions/:id 
describe("PATCH /api/transactions/:id", () => {
    beforeEach(() => vi.clearAllMocks());

    /** Returns 401 when unauthenticated. */
    it("returns 401 when unauthenticated", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(null);

        const res = await PATCH(
            buildRequest("/api/transactions/t1", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
            { params: paramsPromise("t1") }
        );
        expect(res.status).toBe(401);
    });

    /** Returns 403 when the user is not an ADMIN. */
    it("returns 403 for non-admin user", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "USER" },
        } as any);

        const res = await PATCH(
            buildRequest("/api/transactions/t1", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
            { params: paramsPromise("t1") }
        );
        expect(res.status).toBe(403);
    });

    /** Returns 404 when the transaction does not exist. */
    it("returns 404 when transaction not found", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "ADMIN" },
        } as any);
        vi.mocked(prisma.transaction.findUnique).mockResolvedValue(null);

        const res = await PATCH(
            buildRequest("/api/transactions/t1", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ concept: "X", amount: 10, date: "2026-03-01", type: "income" }),
            }),
            { params: paramsPromise("t1") }
        );
        expect(res.status).toBe(404);
    });

    /** Returns 404 when the transaction is soft-deleted (deletedAt is set). */
    it("returns 404 for soft-deleted transaction", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "ADMIN" },
        } as any);
        vi.mocked(prisma.transaction.findUnique).mockResolvedValue({
            id: "t1",
            deletedAt: new Date(),
        } as any);

        const res = await PATCH(
            buildRequest("/api/transactions/t1", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ concept: "X", amount: 10, date: "2026-03-01", type: "income" }),
            }),
            { params: paramsPromise("t1") }
        );
        expect(res.status).toBe(404);
    });

    /** Returns 400 when the body fails Zod validation. */
    it("returns 400 on invalid body", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "ADMIN" },
        } as any);
        vi.mocked(prisma.transaction.findUnique).mockResolvedValue({
            id: "t1",
            deletedAt: null,
        } as any);

        const res = await PATCH(
            buildRequest("/api/transactions/t1", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ concept: "", amount: -1, date: "bad", type: "x" }),
            }),
            { params: paramsPromise("t1") }
        );
        expect(res.status).toBe(400);
    });

    /** Returns 200 and the updated transaction on success. */
    it("returns 200 on successful update", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "ADMIN" },
        } as any);
        vi.mocked(prisma.transaction.findUnique).mockResolvedValue({
            id: "t1",
            deletedAt: null,
        } as any);
        vi.mocked(prisma.transaction.update).mockResolvedValue({
            id: "t1",
            concept: "Updated",
            amount: 50,
            date: new Date("2026-03-01"),
            type: "expense",
            user: { name: "Jane" },
        } as any);

        const res = await PATCH(
            buildRequest("/api/transactions/t1", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ concept: "Updated", amount: 50, date: "2026-03-01", type: "expense" }),
            }),
            { params: paramsPromise("t1") }
        );
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.concept).toBe("Updated");
    });
});

// DELETE /api/transactions/:id
describe("DELETE /api/transactions/:id", () => {
    beforeEach(() => vi.clearAllMocks());

    /** Returns 401 when unauthenticated. */
    it("returns 401 when unauthenticated", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(null);

        const res = await DELETE(buildRequest("/api/transactions/t1", { method: "DELETE" }), {
            params: paramsPromise("t1"),
        });
        expect(res.status).toBe(401);
    });

    /** Returns 403 for non-admin user. */
    it("returns 403 for non-admin user", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "USER" },
        } as any);

        const res = await DELETE(buildRequest("/api/transactions/t1", { method: "DELETE" }), {
            params: paramsPromise("t1"),
        });
        expect(res.status).toBe(403);
    });

    /** Returns 404 when transaction not found. */
    it("returns 404 when transaction not found", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "ADMIN" },
        } as any);
        vi.mocked(prisma.transaction.findUnique).mockResolvedValue(null);

        const res = await DELETE(buildRequest("/api/transactions/t1", { method: "DELETE" }), {
            params: paramsPromise("t1"),
        });
        expect(res.status).toBe(404);
    });

    /** Returns 200 and sets deletedAt on successful soft-delete. */
    it("returns 200 on successful delete", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "ADMIN" },
        } as any);
        vi.mocked(prisma.transaction.findUnique).mockResolvedValue({
            id: "t1",
            deletedAt: null,
        } as any);
        vi.mocked(prisma.transaction.update).mockResolvedValue({} as any);

        const res = await DELETE(buildRequest("/api/transactions/t1", { method: "DELETE" }), {
            params: paramsPromise("t1"),
        });
        expect(res.status).toBe(200);

        /** Verifies that deletedAt is set to a Date (not null). */
        expect(prisma.transaction.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    deletedAt: expect.any(Date),
                }),
            })
        );
    });
});
