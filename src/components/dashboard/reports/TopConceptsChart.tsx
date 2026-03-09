"use client";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TopConcept {
    concept: string;
    amount: number;
}

interface TopConceptsChartProps {
    topConcepts: TopConcept[];
}

// Fixed palette cycled across slices
const COLORS = [
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
];

/**
 * Renders the active (hovered) pie slice with an expanded outer ring
 * and the concept name + percentage centered in the donut hole.
 */
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    return (
        <g>
            {/* Concept name and percentage inside the donut */}
            <text x={cx} y={cy - 12} textAnchor="middle" fill="currentColor" className="text-sm font-semibold fill-foreground">
                {payload.concept}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" className="text-xs fill-muted-foreground">
                {`${(percent * 100).toFixed(1)}%`}
            </text>
            {/* Expanded slice + outer accent ring on hover */}
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
                startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 14}
                startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
    );
};

/** Tooltip shown when hovering a pie slice. */
const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const { concept, amount } = payload[0].payload;
    return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
            <p className="font-medium">{concept}</p>
            <p className="text-muted-foreground">
                ${Number(amount).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
            </p>
        </div>
    );
};

/**
 * Donut chart showing the top expense concepts side-by-side with
 * a legend that doubles as hover targets synced to the chart.
 */
export function TopConceptsChart({ topConcepts }: TopConceptsChartProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const total = topConcepts.reduce((sum, t) => sum + t.amount, 0);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Top Expense Concepts</CardTitle>
                <CardDescription>Top 5 categories by total spending</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-6">

                    {/* Donut chart */}
                    <div className="w-full sm:w-1/2 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={topConcepts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    dataKey="amount"
                                    nameKey="concept"
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                >
                                    {topConcepts.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend with inline progress bars */}
                    <div className="w-full sm:w-1/2 space-y-3">
                        {topConcepts.map((item, index) => {
                            const pct = total > 0 ? (item.amount / total) * 100 : 0;
                            return (
                                // Hovering a row also highlights the corresponding slice
                                <div
                                    key={item.concept}
                                    className="cursor-pointer group"
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="inline-block h-2 w-2 rounded-full shrink-0"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="text-sm font-medium truncate max-w-[120px] group-hover:text-foreground text-muted-foreground transition-colors">
                                                {item.concept}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold tabular-nums">
                                            ${item.amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {/* Progress bar proportional to total */}
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: COLORS[index % COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        <div className="pt-2 border-t flex justify-between text-xs text-muted-foreground">
                            <span>Total</span>
                            <span className="font-semibold text-foreground">
                                ${total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}