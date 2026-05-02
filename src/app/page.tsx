import { db } from "@/db";
import { clothes, laundryItems, laundrySessions } from "@/db/schema";
import { count, eq, desc, gte, sql } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/DashboardCharts";
import { subDays, format } from "date-fns";

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
      // Postgres DATE() might return a string in yyyy-MM-dd format or a Date object
      const entryDate = entry.date instanceof Date ? format(entry.date, "yyyy-MM-dd") : String(entry.date);
      return entryDate === dateStr;
    });
    return {
      date: label,
      count: dayData ? Number(dayData.count) : 0,
    };
  });

  // 2. Status Distribution - Consolidated into a single query
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

  // Fetch recent completed sessions with item counts in a single query (limit 5)
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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/sessions/new">
          <Button>Start New Laundry Session</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clothes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClothes.count}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts 
        trendData={trendData} 
        statusData={statusData} 
        itemData={itemData} 
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active laundry sessions.</p>
            ) : (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View details for session created on ${session.createdAt.toLocaleDateString()}`}
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">
                        Created on {session.createdAt.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.returnedItemsCount} of {session.totalItemsCount} items returned
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent History List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompletedSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
            ) : (
              <div className="space-y-4">
                {recentCompletedSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View details for completed session from ${session.createdAt.toLocaleDateString()}`}
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">
                        Completed on {session.createdAt.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.totalItemsCount} items
                      </p>
                    </div>
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