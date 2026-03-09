import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasPermission, Role } from "@/lib/rbac";

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     description: Returns all registered users. Requires ADMIN role.
 *     operationId: listUsers
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Array of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
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
 *               $ref: '#/components/schemas/FieldError'
 */
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
            // Only expose fields safe for the admin UI; never return password hashes.
            select: { id: true, name: true, email: true, phone: true, role: true },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
