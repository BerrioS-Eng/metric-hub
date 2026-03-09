import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const days = Math.min(Number(searchParams.get("days") ?? 30), 365);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const dateFilter = { gte: since };
    const where = isAdmin ? { date: dateFilter } : { userId: session.user.id, date: dateFilter };

    try {
        const transactions = await prisma.transaction.findMany({
            where,
            select: { amount: true, type: true, date: true, concept: true },
            orderBy: { date: "asc" },
        });

        const incomes = transactions.filter(t => t.type === "income");
        const expenses = transactions.filter(t => t.type === "expense");

        const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

        // Grouped by month for trends
        const byMonth = transactions.reduce((acc, t) => {
            const month = t.date.toISOString().slice(0, 7);
            if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
            if (t.type === "income") acc[month].income += Number(t.amount);
            else acc[month].expense += Math.abs(Number(t.amount));
            return acc;
        }, {} as Record<string, { month: string; income: number; expense: number }>);

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
            trends: Object.values(byMonth),
            dailyTrends: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
            topConcepts,
        });
    } catch (error) {
        console.error("Error fetching report data:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}