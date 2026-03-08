import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { FaPlusCircle } from "react-icons/fa";
import NewTransaction from "./NewTransaction";

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

export default function IncomeExpenseManagement() {
    const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        fetchTransactions();
    }, []);

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
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(Math.abs(amount));
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
                    {session?.user.role === "ADMIN" && (
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-gray-500">
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
                                                <TableCell>{transaction.date}</TableCell>
                                                <TableCell>{transaction.user.name}</TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <NewTransaction open={open} setOpen={setOpen} onTransactionAdded={fetchTransactions} />
            </CardContent>
        </Card>
    )
}