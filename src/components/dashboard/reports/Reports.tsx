"use client"
import useSWR from "swr";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FaRegCalendarCheck } from "react-icons/fa";
import { GrDocumentCsv } from "react-icons/gr";
import SummaryCards from "./SummaryCards";
import { LuBadgeDollarSign, LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import IncomeExpenseBar from "./IncomeExpenseBar";
import TransactionTrends from "./TransactionTrends";
import { TopConceptsChart } from "./TopConceptsChart";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Root reports view. Fetches aggregated financial data for a configurable
 * time window and composes the summary cards, charts, and CSV export.
 */
export default function Reports() {
    const [daysBack, setDaysBack] = useState<number>(30);
    const [isDownloading, setIsDownloading] = useState(false);

    // Re-fetches automatically when daysBack changes; refreshes every 60s in background
    const { data, isLoading, error } = useSWR(`/api/reports?days=${daysBack}`, fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 60000,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading report data</div>;

    /**
     * Fetches raw transactions for the current period, builds a CSV string
     * client-side, and triggers a browser download — no server-side file needed.
     * Fields: Date, Concept, Type, Amount, User.
     */
    const downloadCSV = async () => {
        setIsDownloading(true);
        try {
            const res = await fetch(`/api/transactions?days=${daysBack}`);
            const transactions: { date: string; concept: string; type: string; amount: number; user: { name: string } }[] = await res.json();

            // Wrap strings in quotes and escape internal quotes (RFC 4180)
            const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;

            const rows = [
                ["Date", "Concept", "Type", "Amount", "User"],
                ...transactions.map(t => [
                    new Date(t.date).toLocaleDateString("es-ES"),
                    escape(t.concept),
                    t.type,
                    Math.abs(t.amount).toFixed(2),
                    escape(t.user?.name ?? ""),
                ]),
            ];

            const csv = rows.map(r => r.join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `report-last-${daysBack}-days.csv`;
            a.click();
            URL.revokeObjectURL(url); // free memory after download is triggered
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Financial Reports</CardTitle>
                            <CardDescription>
                                View financial statistics and download reports (Administrators Only)
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Period selector — drives both the charts and the CSV export */}
                            <div className="flex items-center gap-2">
                                <FaRegCalendarCheck className="h-4 w-4 text-muted-foreground" />
                                <Select
                                    value={daysBack.toString()}
                                    onValueChange={(value) => setDaysBack(Number(value))}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">Last 7 days</SelectItem>
                                        <SelectItem value="14">Last 14 days</SelectItem>
                                        <SelectItem value="30">Last 30 days</SelectItem>
                                        <SelectItem value="60">Last 60 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={downloadCSV} disabled={isDownloading}>
                                <GrDocumentCsv className="h-4 w-4 mr-2" />
                                {isDownloading ? "Generating..." : "Download CSV Report"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* KPI cards: balance, income, expense for the selected period */}
                    <div className="grid gap-4 md:grid-cols-3 mb-8">
                        <SummaryCards header="Current Balance" summary={data.summary.currentBalance} footer={`${data.summary.transactionCount} transactions`} icon={<LuBadgeDollarSign className="h-6 w-6 text-green-600" />} valueColorClass="text-green-600" />
                        <SummaryCards header="Total Income" summary={data.summary.totalIncome} footer={`${data.summary.incomeCount} transactions`} icon={<LuTrendingUp className="h-6 w-6 text-green-600" />} valueColorClass="text-green-600" />
                        <SummaryCards header="Total Expense" summary={data.summary.totalExpense} footer={`${data.summary.expenseCount} transactions`} icon={<LuTrendingDown className="h-6 w-6 text-red-600" />} valueColorClass="text-red-600" />
                    </div>
                    {/* Charts: monthly bar, daily line, top expense concepts donut */}
                    <div>
                        <IncomeExpenseBar data={data.trends} />
                        <TransactionTrends data={data?.dailyTrends ?? []} />
                        <TopConceptsChart topConcepts={data.topConcepts} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}