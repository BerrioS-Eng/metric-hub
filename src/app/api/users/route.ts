import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
            },
        });
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
};