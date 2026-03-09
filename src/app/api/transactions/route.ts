import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";

    const dateFilter = daysParam
        ? { gte: new Date(Date.now() - Number(daysParam) * 86400_000) }
        : undefined;

    const where = isAdmin
        ? (dateFilter ? { date: dateFilter } : {})
        : { userId: session.user.id, ...(dateFilter ? { date: dateFilter } : {}) };
    
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
                amount: Number(t.amount),
                date: t.date.toISOString(),
            }))
        );
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { concept, amount, date, type } = await request.json();

        if (!concept || !amount || !date || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!["income", "expense"].includes(type)) {
            return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
        }

        if (Number(amount) <= 0) {
            return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
        }

        const transactionDate = new Date(date);
        if (isNaN(transactionDate.getTime())) {
            return NextResponse.json({ error: "Invalid date" }, { status: 400 });
        }

        if (transactionDate > new Date()) {
            return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
        }

        const newTransaction = await prisma.transaction.create({
            data: { concept, amount, date: transactionDate, type, userId: session.user.id },
        });

        return NextResponse.json(newTransaction, { status: 201 });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}