import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasPermission, Role } from "@/lib/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as Role, "/api/users")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const { name, role } = body;
    if (!name || !role || !["ADMIN", "USER"].includes(role)) {
        return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: {
                name,
                role,
            },
            select: { id: true, name: true, email: true, phone: true, role: true },
        });
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}