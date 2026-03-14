import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasPermission, Role } from "@/lib/rbac";
import { UpdateUserSchema } from "@/lib/schemas";

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user
 *     description: Updates a user's name and role. Requires ADMIN role.
 *     operationId: updateUser
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CUID of the user to update.
 *         schema:
 *           type: string
 *           example: clxyz5678efgh
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Smith Jr.
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Updated user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing or invalid fields.
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

    if (!hasPermission(session.user.role as Role, "/api/users")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Validate and parse the request body with Zod.
    const result = UpdateUserSchema.safeParse(await req.json());
    if (!result.success) {
        const message = result.error.issues[0]?.message ?? "Invalid fields";
        return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, phone, role } = result.data;

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, phone, role },
            // Only return safe fields — never expose internal auth fields.
            select: { id: true, name: true, email: true, phone: true, role: true },
        });
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
