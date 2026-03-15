import { describe, it, expect } from "vitest";
import { NewTransactionSchema, UpdateTransactionSchema, UpdateUserSchema } from "./schemas";

/** Unit tests for Zod validation schemas used by API route handlers. */

describe('NewTransactionSchema', () => {
    /** Verifies that a well-formed payload passes all refinements. */
    it("accepts a valid transaction", () => {
        const result = NewTransactionSchema.safeParse({
            concept: "Grocery shopping",
            amount: 85.5,
            date: "2026-03-01",
            type: "expense",
        });
        expect(result.success).toBe(true);
    });

    /** concept requires at least 1 character (z.string().min(1)). */
    it("rejects empty concept", () => {
        const result = NewTransactionSchema.safeParse({
            concept: "",
            amount: 100,
            date: "2026-03-01",
            type: "income",
        });
        expect(result.success).toBe(false);
    });

    /** amount must be strictly positive (z.number().positive()). */
    it("rejects zero amount", () => {
        const result = NewTransactionSchema.safeParse({
            concept: "Test",
            amount: 0,
            date: "2026-03-01",
            type: "income",
        });
        expect(result.success).toBe(false);
    });

    /** Negative values also violate the positive() constraint. */
    it("rejects negative amount", () => {
        const result = NewTransactionSchema.safeParse({
            concept: "Test",
            amount: -50,
            date: "2026-03-01",
            type: "income",
        });
        expect(result.success).toBe(false);
    });

    /** The date string must be parseable by new Date(). */
    it("rejects invalid date", () => {
        const result = NewTransactionSchema.safeParse({
            concept: "Test",
            amount: 100,
            date: "not-a-date",
            type: "income"
        });
        expect(result.success).toBe(false);
    });

    /** The second refine() ensures the date is not in the future. */
    it("rejects future date", () => {
        const result = NewTransactionSchema.safeParse({
            concept: "Test",
            amount: 100,
            date: "2099-01-01",
            type: "income",
        });
        expect(result.success).toBe(false);
    });

    /** type is restricted to the enum ["income", "expense"]. */
    it("rejects invalid type", () => {
        const result = NewTransactionSchema.safeParse({
            concept: "Test",
            amount: 100,
            date: "2026-03-01",
            type: "transfer",
        });
        expect(result.success).toBe(false);
    });

    /** All four fields (concept, amount, date, type) are required. */
    it("rejects missing fields", () => {
        const result = NewTransactionSchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

describe("UpdateTransactionSchema", () => {
    /** UpdateTransactionSchema reuses NewTransactionSchema by reference. */
    it("is the same schema as NewTransactionSchema", () => {
        expect(UpdateTransactionSchema).toBe(NewTransactionSchema);
    });
});

describe("UpdateUserSchema", () => {
    /** name (min 1), phone (nullable string), and role (ADMIN | USER) are valid. */
    it("accepts valid user data", () => {
        const result = UpdateUserSchema.safeParse({
            name: "Jane Doe",
            phone: "+1-555-0100",
            role: "USER",
        });
        expect(result.success).toBe(true);
    });

    /** phone is z.string().nullable(), so null is a valid value. */
    it("accepts null phone", () => {
        const result = UpdateUserSchema.safeParse({
            name: "Jane Doe",
            phone: null,
            role: "ADMIN",
        });
        expect(result.success).toBe(true);
    });

    /** name requires at least 1 character. */
    it("rejects empty name", () => {
        const result = UpdateUserSchema.safeParse({
            name: "",
            phone: null,
            role: "USER",
        });
        expect(result.success).toBe(false);
    });

    /** role is restricted to the enum ["ADMIN", "USER"]. */
    it("rejects invalid role", () => {
        const result = UpdateUserSchema.safeParse({
            name: "Jane",
            phone: null,
            role: "SUPERADMIN",
        });
        expect(result.success).toBe(false);
    });
});

