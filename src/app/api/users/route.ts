import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasPermission, Role } from "@/lib/rbac";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, "/api/users")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, phone: true, role: true },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
};