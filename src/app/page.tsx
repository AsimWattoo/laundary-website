import { db } from "@/db";
import { clothes, laundryItems, laundrySessions } from "@/db/schema";
import { count, eq, desc, gte, sql } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/DashboardCharts";
import { subDays, format } from "date-fns";
import { Shirt, Waves, History, ListChecks, Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [totalClothes] = await db.select({ count: count() }).from(clothes);

  // Fetch active sessions with item counts in a single query
  const activeSessions = await db
    .select({
      id: laundrySessions.id,
      createdAt: laundrySessions.createdAt,
      totalItemsCount: count(laundryItems.id),
      returnedItemsCount: sql<number>`cast(count(${laundryItems.id}) filter (where ${laundryItems.isReturned} = true) as integer)`,
    })
    .from(laundrySessions)
    .leftJoin(laundryItems, eq(laundrySessions.id, laundryItems.sessionId))
    .where(eq(laundrySessions.status, "active"))
    .groupBy(laundrySessions.id)
    .orderBy(desc(laundrySessions.createdAt));

  // Aggregations for Charts
  const thirtyDaysAgo = subDays(new Date(), 30);

  // 1. Volume Trend (Last 30 days)
  const trendDataRaw = await db
    .select({
      date: sql<string | Date>`DATE(${laundrySessions.createdAt})`,
      count: count(),
    })
    .from(laundrySessions)
    .where(gte(laundrySessions.createdAt, thirtyDaysAgo))
    .groupBy(sql`DATE(${laundrySessions.createdAt})`)
    .orderBy(sql`DATE(${laundrySessions.createdAt})`);

  const trendData = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), 29 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const label = format(d, "MMM dd");
    const dayData = trendDataRaw.find(entry => {
      const entryDate = entry.date instanceof Date ? format(entry.date, "yyyy-MM-dd") : String(entry.date);
      return entryDate === dateStr;
    });
    return {
      date: label,
      count: dayData ? Number(dayData.count) : 0,
    };
  });

  // 2. Status Distribution
  const statusCounts = await db
    .select({
      isReturned: laundryItems.isReturned,
      count: count(),
    })
    .from(laundryItems)
    .groupBy(laundryItems.isReturned);

  const statusData = [
    { 
      name: "Returned", 
      value: Number(statusCounts.find(s => s.isReturned)?.count ?? 0)
    },
    { 
      name: "Pending", 
      value: Number(statusCounts.find(s => !s.isReturned)?.count ?? 0)
    },
  ];

  // 3. Most Laundered Items
  const itemDataRaw = await db
    .select({
      name: clothes.name,
      count: count(),
    })
    .from(laundryItems)
    .innerJoin(clothes, eq(laundryItems.clothId, clothes.id))
    .groupBy(clothes.name)
    .orderBy(desc(count()))
    .limit(10);

  const itemData = itemDataRaw.map(item => ({
    name: item.name,
    count: Number(item.count),
  }));

  // Fetch recent completed sessions
  const recentCompletedSessions = await db
    .select({
      id: laundrySessions.id,
      createdAt: laundrySessions.createdAt,
      totalItemsCount: count(laundryItems.id),
    })
    .from(laundrySessions)
    .leftJoin(laundryItems, eq(laundrySessions.id, laundryItems.sessionId))
    .where(eq(laundrySessions.status, "completed"))
    .groupBy(laundrySessions.id)
    .orderBy(desc(laundrySessions.createdAt))
    .limit(5);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your laundry activity and wardrobe stats.</p>
        </div>
        <Link href="/sessions/new">
          <Button size="lg" className="shadow-md hover:shadow-lg transition-all">
            <Plus className="mr-2 h-5 w-5" />
            New Session
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden border-muted/40 shadow-sm hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Waves size={80} className="text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Sessions</CardTitle>
            <Waves className="h-4 w-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-muted/40 shadow-sm hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shirt size={80} className="text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total Wardrobe</CardTitle>
            <Shirt className="h-4 w-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight">{totalClothes.count}</div>
            <p className="text-xs text-muted-foreground mt-1">Items registered</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts 
        trendData={trendData} 
        statusData={statusData} 
        itemData={itemData} 
      />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Active Sessions List */}
        <Card className="border-muted/40 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-xl">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-muted-foreground">No active laundry sessions.</p>
                <Link href="/sessions/new" className="mt-4">
                  <Button variant="outline" size="sm">Start one now</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View session created on ${format(session.createdAt, "PPP")}`}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">
                        {format(session.createdAt, "PPP")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.returnedItemsCount} of {session.totalItemsCount} items returned
                      </p>
                    </div>
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${(session.returnedItemsCount / (session.totalItemsCount || 1)) * 100}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent History List */}
        <Card className="border-muted/40 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <History className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-xl">Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompletedSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCompletedSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View completed session from ${format(session.createdAt, "PPP")}`}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">
                        {format(session.createdAt, "PPP")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.totalItemsCount} items cleaned
                      </p>
                    </div>
                    <History className="h-4 w-4 text-muted-foreground/50" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}