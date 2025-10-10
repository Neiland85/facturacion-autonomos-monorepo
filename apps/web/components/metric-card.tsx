import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

export function MetricCard({ title, value, trend, trendUp }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
