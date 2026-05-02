import { db } from '@/db';
import { laundrySessions, laundryItems, clothes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import ItemChecklist from './ItemChecklist';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import SessionActions from './SessionActions';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const session = await db.query.laundrySessions.findFirst({
    where: eq(laundrySessions.id, id),
  });

  if (!session) return { title: 'Session Not Found' };

  return {
    title: `Session ${format(session.createdAt, "PPP")}`,
  };
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await db.query.laundrySessions.findFirst({
    where: eq(laundrySessions.id, id),
  });

  if (!session) notFound();

  const items = await db
    .select({
      id: laundryItems.id,
      isReturned: laundryItems.isReturned,
      cloth: {
        name: clothes.name,
        imageUrl: clothes.imageUrl,
        type: clothes.type,
      },
    })
    .from(laundryItems)
    .innerJoin(clothes, eq(laundryItems.clothId, clothes.id))
    .where(eq(laundryItems.sessionId, id));

  const returnedCount = items.filter((i) => i.isReturned).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((returnedCount / totalCount) * 100) : 0;

  return (
    <div className="container max-w-2xl py-8">
      <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-6" })}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">
          Session: {format(session.startDate, 'PPP')}
        </h1>
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            session.status === 'completed' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {session.status === 'active' ? 'In Progress' : 'Completed'}
          </span>
          <span className="text-muted-foreground text-sm">
            {returnedCount} of {totalCount} items returned ({progress}%)
          </span>
        </div>
        
        <div 
          className="mt-4 w-full bg-yellow-100 dark:bg-yellow-900/20 rounded-full h-2 overflow-hidden border border-yellow-200/50 dark:border-yellow-800/50"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Laundry return progress"
        >
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ClientOnly>
        <SessionActions 
          sessionId={id} 
          initialReturnDate={session.expectedReturnDate} 
          itemCount={totalCount}
        />

        <ItemChecklist sessionId={id} items={items} />
      </ClientOnly>
    </div>
  );
}
