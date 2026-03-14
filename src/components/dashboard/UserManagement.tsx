"use client";
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/generated/prisma";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LuPencilLine } from "react-icons/lu";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import { EditUserDialog } from "./EditUserDialog";

/**
 * Displays the full list of registered users and allows admins to edit
 * their name and role via the EditUserDialog.
 *
 * Only accessible to users with the ADMIN role (enforced by /api/users).
 */
export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    // Tracks which user row has the edit dialog open; null means no dialog is open.
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { data: session, refetch } = useSession();

    // Fetch all users once on mount.
    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error("Error fetching users:", error))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Sends a PATCH request to update the user's name and role.
     * Updates the local list optimistically after a successful response.
     * If the edited user is the currently logged-in admin, the session
     * is refreshed so the UI reflects any role change immediately.
     */
    const handleUpdateUser = async (id: string, data: { name: string; phone: string | null; role: "ADMIN" | "USER" }) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUsers((prevUsers) =>
                    prevUsers.map((user) => (user.id === id ? updatedUser : user))
                );
                // Refresh session if the admin edited their own account.
                if (id === session?.user.id) {
                    await refetch();
                }
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user information and roles</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Spinner className="size-6 mx-auto" />
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone || "Not Provided"}</TableCell>
                                        <TableCell>
                                            {/* Badge color reflects the user's role */}
                                            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingUser(user)}
                                            >
                                                <LuPencilLine className="h-4 w-4 mr-2" />
                                                Edit User
                                            </Button>
                                            {/* Render the dialog only for the row being edited to avoid
                                                mounting unnecessary instances for every user in the table. */}
                                            {editingUser?.id === user.id && (
                                                <EditUserDialog
                                                    user={editingUser}
                                                    open
                                                    onOpenChange={(open) => { if (!open) setEditingUser(null); }}
                                                    onSave={handleUpdateUser}
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
