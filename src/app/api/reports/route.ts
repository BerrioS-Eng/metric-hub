import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermission, Role } from "@/lib/rbac";

/**
 * @openapi
 * /api/reports:
 *   get:
 *     tags: [Reports]
 *     summary: Get financial report
 *     description: >
 *       Returns aggregated financial data for the given time window.
 *       Requires ADMIN role. The `days` parameter defaults to 30 and is capped at 365.
 *     operationId: getReport
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: days
 *         in: query
 *         required: false
 *         description: Number of days to look back from today. Capped at 365.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *           example: 90
 *     responses:
 *       200:
 *         description: Financial report.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    // Cap the window at 365 days to prevent unbounded queries.
    const days = Math.min(Number(searchParams.get("days") ?? 30), 365);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, "/api/reports")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const dateFilter = { gte: since };
    // ADMINs see all transactions; USERs are scoped to their own.
    const where = isAdmin
        ? { date: dateFilter, deletedAt: null }
        : { userId: session.user.id, date: dateFilter, deletedAt: null };

    try {
        const transactions = await prisma.transaction.findMany({
            where,
            select: { amount: true, type: true, date: true, concept: true },
            orderBy: { date: "asc" },
        });

        const incomes = transactions.filter(t => t.type === "income");
        const expenses = transactions.filter(t => t.type === "expense");

        const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
        // Use Math.abs because expense amounts are stored as positive values in the DB.
        const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

        // Aggregate income and expense by calendar month (key: "YYYY-MM").
        const byMonth = transactions.reduce((acc, t) => {
            const month = t.date.toISOString().slice(0, 7);
            if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
            if (t.type === "income") acc[month].income += Number(t.amount);
            else acc[month].expense += Math.abs(Number(t.amount));
            return acc;
        }, {} as Record<string, { month: string; income: number; expense: number }>);

        // Aggregate income and expense by calendar day (key: "YYYY-MM-DD").
        const byDay = transactions.reduce((acc, t) => {
            const date = t.date.toISOString().slice(0, 10); // "2026-03-01"
            if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
            if (t.type === "income") acc[date].income += Number(t.amount);
            else acc[date].expense += Math.abs(Number(t.amount));
            return acc;
        }, {} as Record<string, { date: string; income: number; expense: number }>);

        // Top 5 concepts by expense
        const expenseByConcept = expenses.reduce((acc, t) => {
            acc[t.concept] = (acc[t.concept] || 0) + Math.abs(Number(t.amount));
            return acc;
        }, {} as Record<string, number>);

        const topConcepts = Object.entries(expenseByConcept)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([concept, amount]) => ({ concept, amount }));

        return NextResponse.json({
            summary: {
                totalIncome,
                totalExpense,
                currentBalance: totalIncome - totalExpense,
                transactionCount: transactions.length,
                incomeCount: incomes.length,
                expenseCount: expenses.length,
            },
            // Monthly trends returned in insertion order (already sorted asc by the query).
            trends: Object.values(byMonth),
            // Daily trends explicitly sorted ascending so the chart renders left-to-right.
            dailyTrends: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
            topConcepts,
        });
    } catch (error) {
        console.error("Error fetching report data:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
