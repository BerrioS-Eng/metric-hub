import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";

/** Mocks for Prisma, auth, and Nextjs headers */

// Mock/headers
vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock Prisma client
vi.mock("@/lib/prisma", () => ({
    default: {
        transaction: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** Helper: builds a minimal object for testing route handlers */
function buildRequest(url: string, options?: RequestInit): Request {
    return new Request(`http://localhost${url}`, options);
}

// GET /api/transactions
describe("GET /api/transactions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /** Returns 401 when no active session exists */
    it("Returns 401 when unauthenticated", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(null);

        const res = await GET(buildRequest("/api/transactions"));
        expect(res.status).toBe(401);

        const body = await res.json();
        expect(body.message).toBe("Unauthorized");
    });

    /** Returns the transaction list for an authenticated user */
    it("returns transactions for authenticated user", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "USER" },
        } as any);

        vi.mocked(prisma.transaction.findMany).mockResolvedValue([
            {
                id: "t1",
                concept: "Salary",
                amount: 3000,
                date: new Date("2026-03-01"),
                type: "income",
                user: { name: "Jane" },
            },
        ] as any);

        const res = await GET(buildRequest("/api/transactions"));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body).toHaveLength(1);
        expect(body[0].concept).toBe("Salary");
        expect(body[0].amount).toBe(3000);
    });

    /** Verifies the where clause always includes deletedAt: null */
    it("filters out soft-deleted transactions", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "USER" },
        } as any);
        vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

        await GET(buildRequest("/api/transactions"));

        expect(prisma.transaction.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ deletedAt: null }),
            })
        );
    });
});

// POST /api/transactions 
describe("POST /api/transactions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /** Returns 401 when the body fails Zod validations (example: missing concept) */
    it("returns 401 when unauthenticated", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(null);

        const res = await POST(
            buildRequest("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ concept: "", amount: 0, date: "bad", type: "other" }),
            })
        );
        expect(res.status).toBe(401);
    });

    /** Returns 201 and creates a transaction with valid input */
    it("creates transaction with valid data", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: "u1", role: "USER" },
        } as any);
        vi.mocked(prisma.transaction.create).mockResolvedValue({ id: "t1" } as any);

        const res = await POST(
            buildRequest("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ concept: "Lunch", amount: 15, date: "2026-03-01", type: "expense" }),
            })
        );
        expect(res.status).toBe(201);
    });
});