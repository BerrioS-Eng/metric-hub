import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NewTransactionProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    onTransactionAdded: () => void;
}

export default function NewTransaction({ open, setOpen, onTransactionAdded }: NewTransactionProps) {
    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        date: "",
    });
    const today = new Date().toISOString().split("T")[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    concept: formData.description,
                    date: formData.date,
                    type: parseFloat(formData.amount) >= 0 ? "income" : "expense",
                }),
            });

            if (response.ok) {
                setOpen(false);
                setFormData({ amount: "", description: "", date: "" });
                onTransactionAdded();
            } else {
                console.error("Failed to save transaction");
            }
        } catch (error) {
            console.error("Error saving transaction:", error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <DialogTitle>New Income/Expense</DialogTitle>
                    <DialogDescription>
                        Add a new financial transaction. Use positive values for
                        income and negative values for expenses.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="Enter amount (e.g., 1000 or -500)"
                            value={formData.amount}
                            onChange={(e) =>
                                setFormData({ ...formData, amount: e.target.value })
                            }
                            required
                        />
                        <p className="text-xs text-gray-500">
                            Positive for income, negative for expense
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Enter description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            max={today}
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({ ...formData, date: e.target.value })
                            }
                            required
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save Transaction</Button>
                </DialogFooter>
            </form>
        </DialogContent>
            </Dialog >
    )
}