import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UpdateTransactionSchema } from "@/lib/schemas";


/**
 * Retrieves a transaction by ID, returning `null` if it doesn't exist or has been soft-deleted.
*/
async function findActiveTransaction(id: string) {
    const transaction = await prisma.transaction.findUnique({ where: { id }});
    if (!transaction || transaction.deletedAt) return null;
    return transaction;
}

/**
 * @openapi
 * /api/transactions/{id}:
 *   patch:
 *     tags: [Transactions]
 *     summary: Update a transaction
 *     description: Updates a transaction's details. Requires ADMIN role.
 *     operationId: updateTransaction
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CUID of the transaction to update.
 *         schema:
 *           type: string
 *           example: clxyz5678efgh
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransaction'
 *     responses:
 *       200:
 *         description: Updated transaction.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FieldError'
 *       401:
 *         description: Not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Authenticated but not an ADMIN.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Transaction not found.
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
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await findActiveTransaction(id);
    
    if (!existing) {
        return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    const result = UpdateTransactionSchema.safeParse(await req.json());
    if (!result.success) {
        const message = result.error.issues[0]?.message ?? "Invalid input";
        return NextResponse.json({ error: message }, { status: 400 });
    }

    const { concept, amount, date, type } = result.data;

    try {
        const updated = await prisma.transaction.update({
            where: { id },
            data: { concept, amount, date: new Date(date), type },
            select: {
                id: true,
                concept: true,
                amount: true,
                date: true,
                type: true,
                user: { select: { name: true } },
            },
        });

        return NextResponse.json({
            ...updated,
            amount: Number(updated.amount),
            date: updated.date.toISOString(),
        });
    } catch (error) {
        console.error("Error updating transaction:", error);
        return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
    }
}

/**
 * @openapi
 * /api/transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Soft-delete a transaction
 *     description: Marks a transaction as deleted (sets deletedAt timestamp). Requires ADMIN role.
 *     operationId: deleteTransaction
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CUID of the transaction to delete.
 *         schema:
 *           type: string
 *           example: clxyz5678efgh
 *     responses:
 *       200:
 *         description: Transaction deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transaction deleted
 *       401:
 *         description: Not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Authenticated but not an ADMIN.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Transaction not found.
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
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await findActiveTransaction(id);
    
    if (!existing) {
        return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    try {
        await prisma.transaction.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ message: "Transaction deleted" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
    }
}
