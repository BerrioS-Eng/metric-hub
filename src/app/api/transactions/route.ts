import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const transactions = await prisma.transaction.findMany({
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
                date: t.date.toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
            })),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { concept, amount, date, type } = await request.json();

        const transactionDate = new Date(date);
        const today = new Date();
        if (transactionDate > today) {
            return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
        }

        const newTransaction = await prisma.transaction.create({
            data: {
                concept,
                amount,
                date: new Date(date),
                type,
                userId: session.user.id,
            },
        });
        return NextResponse.json(newTransaction, { status: 201 });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}