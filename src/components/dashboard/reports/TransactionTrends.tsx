import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";


interface DailyTrend {
    date: string;
    income: number;
    expense: number;
}

interface TransactionTrendsProps {
    data: DailyTrend[];
}

const chartConfig = {
    income: { label: "Income", color: "#22c55e" },
    expense: { label: "Expenses", color: "#ef4444" },
};

export default function TransactionTrends({ data }: TransactionTrendsProps) {
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("income");

    const total = useMemo(
        () => ({
            income: (data ?? []).reduce((acc, curr) => acc + curr.income, 0),
            expense: (data ?? []).reduce((acc, curr) => acc + curr.expense, 0),
        }),
        [data]
    );
    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                    <CardTitle>Transaction Trends</CardTitle>
                    <CardDescription>Daily income and expenses</CardDescription>
                </div>

                {/* Botones de toggle con totales */}
                <div className="flex">
                    {(Object.keys(chartConfig) as (keyof typeof chartConfig)[]).map((key) => (
                        <button
                            key={key}
                            data-active={activeChart === key}
                            onClick={() => setActiveChart(key)}
                            className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left
                                       even:border-l data-[active=true]:bg-muted/50
                                       sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                        >
                            <span className="text-xs text-muted-foreground">
                                {chartConfig[key].label}
                            </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                {formatCurrency(total[key])}
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <LineChart
                        data={data ?? []}
                        margin={{ left: 12, right: 12 }}
                        accessibilityLayer
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[180px]"
                                    nameKey={activeChart}
                                    formatter={(value: ValueType) => formatCurrency(Number(value))}
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }
                                />
                            }
                        />
                        <Line
                            dataKey={activeChart}
                            type="monotone"
                            stroke={`var(--color-${activeChart})`}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}