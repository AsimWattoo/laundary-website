import { db } from '@/db'
import { clothes } from '@/db/schema'
import { desc, ilike } from 'drizzle-orm'
import { WardrobeClient } from '@/components/WardrobeClient'
import { ClientOnly } from '@/components/ClientOnly'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wardrobe',
};

export const dynamic = 'force-dynamic'

interface WardrobePageProps {
  searchParams: Promise<{ q?: string }>;
}

/**
 * WardrobePage displays the user's inventory of clothes.
 * Fetches clothes from the database and passes them to WardrobeClient.
 */
export default async function WardrobePage({ searchParams }: WardrobePageProps) {
  const { q } = await searchParams;

  // Fetch all clothes from the database, filtered by search query if provided, 
  // ordered by creation date (newest first)
  const allClothes = await db.select().from(clothes)
    .where(q ? ilike(clothes.name, `%${q}%`) : undefined)
    .orderBy(desc(clothes.createdAt))

  return (
    <main className="container mx-auto py-10 px-4">
      <ClientOnly>
        <WardrobeClient initialClothes={allClothes} q={q} />
      </ClientOnly>
    </main>
  )
}
