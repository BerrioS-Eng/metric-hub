"use client";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditTransactionDialogProps {
    transaction: { id: string; concept: string; amount: number; date: string; type: string };
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, data: { concept: string; amount: number; date: string; type: string }) => void;
}

export function EditTransactionDialog({ transaction, open, onOpenChange, onSave }: EditTransactionDialogProps) {
    const [formData, setFormData] = useState({
        concept: transaction.concept,
        amount: String(transaction.amount),
        date: transaction.date.slice(0, 10),
        type: transaction.type as "income" | "expense",
    });

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (open) {
            setFormData({
                concept: transaction.concept,
                amount: String(transaction.amount),
                date: transaction.date.slice(0, 10),
                type: transaction.type as "income" | "expense",
            });
        }
    }, [open, transaction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(transaction.id, {
            concept: formData.concept,
            amount: Math.abs(parseFloat(formData.amount)),
            date: formData.date,
            type: formData.type,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>Update transaction details</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-amount">Amount</Label>
                            <Input
                                id="edit-amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-concept">Description</Label>
                            <Input
                                id="edit-concept"
                                value={formData.concept}
                                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-date">Date</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                max={today}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: "income" | "expense") =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger id="edit-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
