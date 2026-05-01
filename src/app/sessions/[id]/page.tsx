import { db } from '@/db';
import { laundrySessions, laundryItems, clothes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import ItemChecklist from './ItemChecklist';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

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

      <div className="mb-8">
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
          className="mt-4 w-full bg-secondary rounded-full h-2"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Laundry return progress"
        >
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ItemChecklist items={items} />
    </div>
  );
}
