import { db } from "@/db";
import { laundrySessions, laundryItems, clothes } from "@/db/schema";
import { eq, desc, count, sql, and } from "drizzle-orm";
import type { Metadata } from 'next';
import { SessionsClient } from "@/components/SessionsClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: 'All Sessions',
};

export const dynamic = 'force-dynamic';

interface SessionsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SessionsPage({ searchParams }: SessionsPageProps) {
  const { q } = await searchParams;

  // Build the where clause for searching
  const where = q ? and(
    // Search by item name or session date
    sql`EXISTS (
      SELECT 1 FROM ${laundryItems} 
      INNER JOIN ${clothes} ON ${laundryItems.clothId} = ${clothes.id}
      WHERE ${laundryItems.sessionId} = ${laundrySessions.id} 
      AND ${clothes.name} ILIKE ${`%${q}%`}
    ) OR CAST(${laundrySessions.startDate} AS TEXT) ILIKE ${`%${q}%`}`
  ) : undefined;

  // Fetch sessions with item counts
  const sessionsRaw = await db
    .select({
      id: laundrySessions.id,
      createdAt: laundrySessions.createdAt,
      expectedReturnDate: laundrySessions.expectedReturnDate,
      status: laundrySessions.status,
      totalItemsCount: count(laundryItems.id),
      returnedItemsCount: sql<number>`cast(count(${laundryItems.id}) filter (where ${laundryItems.isReturned} = true) as integer)`,
    })
    .from(laundrySessions)
    .leftJoin(laundryItems, eq(laundrySessions.id, laundryItems.sessionId))
    .where(where)
    .groupBy(laundrySessions.id)
    .orderBy(desc(laundrySessions.createdAt));

  const initialSessions = sessionsRaw.map(s => ({
    ...s,
    status: s.status as "active" | "completed"
  }));

  return (
    <div className="py-6">
      <ClientOnly>
        <SessionsClient initialSessions={initialSessions} q={q} />
      </ClientOnly>
    </div>
  );
}
