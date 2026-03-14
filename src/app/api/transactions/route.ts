import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NewTransactionSchema } from "@/lib/schemas";

/**
 * @openapi
 * /api/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: List transactions
 *     description: >
 *       Returns transactions ordered by date descending.
 *       ADMINs see all users' transactions; USERs see only their own.
 *     operationId: listTransactions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: days
 *         in: query
 *         required: false
 *         description: Filter to transactions in the last N days. Omit to return all.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 30
 *     responses:
 *       200:
 *         description: Array of transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FieldError'
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Build an optional date filter: transactions on or after N days ago.
    const dateFilter = daysParam
        ? { gte: new Date(Date.now() - Number(daysParam) * 86400_000) }
        : undefined;

    // Exclude soft-deleted transactions, optionally filtered by date.
    const where = {
        deletedAt: null,
        ...(dateFilter ? { date: dateFilter } : {})
    }

    try {
        const transactions = await prisma.transaction.findMany({
            where,
            select: {
                id: true,
                concept: true,
                amount: true,
                date: true,
                type: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(
            transactions.map(t => ({
                ...t,
                // Prisma returns Decimal objects; convert to number for JSON serialization.
                amount: Number(t.amount),
                date: t.date.toISOString(),
            }))
        );
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}

/**
 * @openapi
 * /api/transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a transaction
 *     description: Records a new income or expense transaction for the authenticated user.
 *     operationId: createTransaction
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTransaction'
 *           example:
 *             concept: Grocery shopping
 *             amount: 85.50
 *             date: "2026-03-05"
 *             type: expense
 *     responses:
 *       201:
 *         description: Transaction created successfully.
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FieldError'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value: { error: Missing required fields }
 *               invalidType:
 *                 summary: Invalid transaction type
 *                 value: { error: Invalid input }
 *               futureDate:
 *                 summary: Date in the future
 *                 value: { error: Date cannot be in the future }
 *       401:
 *         description: Not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FieldError'
 */
export async function POST(request: Request) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate and parse the request body with Zod.
        const result = NewTransactionSchema.safeParse(body);
        if (!result.success) {
            const message = result.error.issues[0]?.message ?? "Invalid input";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const { concept, amount, date, type } = result.data;
        const transactionDate = new Date(date);

        const newTransaction = await prisma.transaction.create({
            data: { concept, amount, date: transactionDate, type, userId: session.user.id },
        });

        return NextResponse.json(newTransaction, { status: 201 });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}
