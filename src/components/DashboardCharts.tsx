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
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Volume Trend - AreaChart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Laundry Volume Trend</CardTitle>
          <CardDescription>Number of sessions over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
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
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)", 
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--chart-1)"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Item Status - PieChart */}
      <Card>
        <CardHeader>
          <CardTitle>Item Status</CardTitle>
          <CardDescription>Distribution of returned vs pending items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
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
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "var(--chart-1)" : "var(--chart-2)"} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)", 
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Most Laundered - BarChart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Most Laundered Items</CardTitle>
          <CardDescription>Frequency of specific clothes in laundry sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
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
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: "var(--card)", 
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
