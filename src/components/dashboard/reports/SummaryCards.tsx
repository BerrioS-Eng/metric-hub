import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

interface SummaryCardsProps {
    header: string;
    summary: number;
    footer: string;
    icon: React.ReactNode;
    valueColorClass: string;
}

export default function SummaryCards({ header, summary, footer, icon, valueColorClass }: SummaryCardsProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {header}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div
                    className={`text-2xl font-bold ${valueColorClass}`}
                >
                    {formatCurrency(summary)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {footer}
                </p>
            </CardContent>
        </Card>
    );
}