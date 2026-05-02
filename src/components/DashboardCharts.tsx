"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardChartsProps {
  trendData: { date: string; count: number }[];
  statusData: { name: string; value: number }[];
  itemData: { name: string; count: number }[];
}

export function DashboardCharts({
  trendData,
  statusData,
  itemData,
}: DashboardChartsProps) {
  // Accessibility: Prepare text summaries for screen readers
  const totalVolume = trendData.reduce((acc, curr) => acc + curr.count, 0);
  const topItem = itemData.length > 0 ? itemData[0] : null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Volume Trend - AreaChart */}
      <Card className="lg:col-span-2 shadow-sm border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Laundry Volume Trend</CardTitle>
          <CardDescription>Number of sessions over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Accessibility: Screen reader only description */}
          <div className="sr-only">
            Trend chart showing laundry volume. Total sessions in the last 30 days: {totalVolume}.
            {trendData.length > 0 && `Latest entry on ${trendData[trendData.length - 1].date}: ${trendData[trendData.length - 1].count} sessions.`}
          </div>
          <div 
            className="h-[300px] w-full" 
            role="img" 
            aria-label={`Laundry volume trend chart. Total sessions: ${totalVolume}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  tick={{ fill: 'var(--muted-foreground)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)", 
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Item Status - PieChart */}
      <Card className="shadow-sm border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Item Status</CardTitle>
          <CardDescription>Returned vs pending items</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Accessibility: Screen reader only description */}
          <div className="sr-only">
            Pie chart showing item status distribution. 
            {statusData.map(s => `${s.name}: ${s.value}`).join(", ")}
          </div>
          <div 
            className="h-[300px] w-full" 
            role="img" 
            aria-label={`Item status distribution. ${statusData.map(s => `${s.name}: ${s.value}`).join(", ")}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "var(--chart-1)" : "var(--chart-2)"}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)", 
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                  }} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Most Laundered - BarChart */}
      <Card className="lg:col-span-3 shadow-sm border-muted/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Most Laundered Items</CardTitle>
          <CardDescription>Frequency of clothes in sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Accessibility: Screen reader only description */}
          <div className="sr-only">
            Bar chart of most laundered items. 
            {topItem && `Top item is ${topItem.name} with ${topItem.count} appearances.`}
          </div>
          <div 
            className="h-[300px] w-full" 
            role="img" 
            aria-label={`Most laundered items chart. ${topItem ? `Top: ${topItem.name}` : ""}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={itemData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)' }}
                />
                <Tooltip 
                  cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                  contentStyle={{ 
                    backgroundColor: "var(--card)", 
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                  }} 
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--chart-1)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
