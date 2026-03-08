"use client";
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/generated/prisma";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LuPencilLine } from "react-icons/lu";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";


export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "ADMIN" as "ADMIN" | "USER",
        //Añadir campo phone en caso de que no tenga valor registrado
    });
    const { data: session, refetch } = useSession(); 

    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            })
            .finally(() => setLoading(false));

    }, []);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            role: user.role,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            handleUpdateUser(editingUser.id, formData);
            setEditingUser(null);
        }
    };

    const handleUpdateUser = async (id: string, data: { name: string; role: "ADMIN" | "USER" }) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUsers((prevUsers) =>
                    prevUsers.map((user) => (user.id === id ? updatedUser : user))
                );
                if (id === session?.user.id) {
                    await refetch();
                }
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                    Manage user information and roles (Administrators Only)
                </CardDescription>
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
                                            <Badge
                                                variant={
                                                    user.role === "ADMIN" ? "default" : "secondary"
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog
                                                open={editingUser?.id === user.id}
                                                onOpenChange={(open) => {
                                                    if (!open) setEditingUser(null);
                                                }}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <LuPencilLine className="h-4 w-4 mr-2" />
                                                    Edit User
                                                </Button>
                                                <DialogContent>
                                                    <form onSubmit={handleSubmit}>
                                                        <DialogHeader>
                                                            <DialogTitle>Edit User</DialogTitle>
                                                            <DialogDescription>
                                                                Update user information and role
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="edit-name">Name</Label>
                                                                <Input
                                                                    id="edit-name"
                                                                    value={formData.name}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            name: e.target.value,
                                                                        })
                                                                    }
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="edit-role">Role</Label>
                                                                <Select
                                                                    value={formData.role}
                                                                    onValueChange={(value: "ADMIN" | "USER") =>
                                                                        setFormData({ ...formData, role: value })
                                                                    }
                                                                >
                                                                    <SelectTrigger id="edit-role">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="USER">USER</SelectItem>
                                                                        <SelectItem value="ADMIN">
                                                                            ADMIN
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="rounded-lg bg-gray-50 p-3 text-sm">
                                                                <p className="text-gray-600">
                                                                    <strong>Email:</strong> {user.email}
                                                                </p>
                                                                <p className="text-gray-600">
                                                                    <strong>Phone:</strong> {user.phone || "Not Provided"}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    Email and phone cannot be changed in this form
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button
                                                                type="submit"
                                                            >Save Changes</Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
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
};