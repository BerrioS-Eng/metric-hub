import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { FaPlusCircle, FaTrash } from "react-icons/fa";
import { LuPencilLine } from "react-icons/lu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewTransaction from "./NewTransaction";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { formatCurrency } from "@/lib/format";

/** Shape of a transaction as returned by the GET /api/transactions endpoint. */
interface TransactionWithUser {
    id: string;
    concept: string;
    amount: number;
    date: string;
    type: string;
    user: {
        name: string;
    };
};

/** Displays the transactions table with CRUD actions. Admin users get an extra Actions column for editing and soft-deleting transactions. */
export default function IncomeExpenseManagement() {
    const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<TransactionWithUser | null>(null);
    const [deletingTransaction, setDeletingTransaction] = useState<TransactionWithUser | null>(null);
    const { data: session } = useSession();

    const isAdmin = session?.user.role === "ADMIN";

    useEffect(() => {
        fetchTransactions();
    }, []);

    /** Fetches all active transactions from the API and updates local state. */
    const fetchTransactions = async () => {
        fetch("/api/transactions")
            .then((res) => res.json())
            .then((data) => {
                setTransactions(data);
            })
            .catch((error) => {
                console.error("Error fetching transactions:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /** Sends a PATCH request to update a transaction and refreshes the list on success. */
    const handleUpdateTransaction = async (id: string, data: { concept: string; amount: number; date: string; type: string }) => {
        try {
            const response = await fetch(`/api/transactions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                fetchTransactions();
                setEditingTransaction(null);
            }
        } catch (error) {
            console.error("Error updating transaction:", error);
        }
    };

    /** Sends a DELETE request to soft-delete a transaction and refreshes the list on success. */
    const handleDeleteTransaction = async (id: string) => {
        try {
            const response = await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                fetchTransactions();
                setDeletingTransaction(null);
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Income and Expense Management</CardTitle>
                        <CardDescription>
                            View and manage all financial transactions
                        </CardDescription>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setOpen(true)}>
                            <FaPlusCircle className="h-4 w-4 mr-2" />
                            New Transaction
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Spinner className="size-6 mx-auto" />
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>User</TableHead>
                                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-gray-500">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions
                                        .map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    {transaction.concept}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={
                                                            transaction.type === "income"
                                                                ? "text-green-600 font-semibold"
                                                                : "text-red-600 font-semibold"
                                                        }
                                                    >
                                                        {transaction.type === "income" ? "+" : "-"}
                                                        {formatCurrency(transaction.amount)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{new Date(transaction.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</TableCell>
                                                <TableCell>{transaction.user.name}</TableCell>
                                                {isAdmin && (
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEditingTransaction(transaction)}
                                                        >
                                                            <LuPencilLine className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => setDeletingTransaction(transaction)}
                                                        >
                                                            <FaTrash className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <NewTransaction open={open} setOpen={setOpen} onTransactionAdded={fetchTransactions} />
                {editingTransaction && (
                    <EditTransactionDialog
                        transaction={editingTransaction}
                        open={!!editingTransaction}
                        onOpenChange={(open) => { if (!open) setEditingTransaction(null); }}
                        onSave={handleUpdateTransaction}
                    />
                )}
                <Dialog open={!!deletingTransaction} onOpenChange={(open) => { if (!open) setDeletingTransaction(null); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the transaction &quot;{deletingTransaction?.concept}&quot;?
                                This action can be undone by an administrator.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeletingTransaction(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => deletingTransaction && handleDeleteTransaction(deletingTransaction.id)}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
