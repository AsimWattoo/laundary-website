import { db } from '@/db'
import { clothes, clothingGroups } from '@/db/schema'
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
 * Fetches clothes and groups from the database and passes them to WardrobeClient.
 */
export default async function WardrobePage({ searchParams }: WardrobePageProps) {
  const { q } = await searchParams;

  // Fetch filtered clothes for display
  const filteredClothes = await db.select().from(clothes)
    .where(q ? ilike(clothes.name, `%${q}%`) : undefined)
    .orderBy(desc(clothes.createdAt))

  // Fetch all clothes for dialogs (groups need to see everything)
  const allClothes = await db.select().from(clothes)
    .orderBy(desc(clothes.createdAt))

  // Fetch groups along with their items (and the cloth details for each item)
  const groupsWithItems = await db.query.clothingGroups.findMany({
    where: q ? ilike(clothingGroups.name, `%${q}%`) : undefined,
    with: {
      items: {
        with: {
          cloth: true
        }
      }
    },
    orderBy: [desc(clothingGroups.createdAt)]
  });

  // Map the fetched data to a clean format: { id, name, items: Cloth[] }
  const mappedGroups = groupsWithItems.map(group => ({
    id: group.id,
    name: group.name,
    items: group.items.map(item => item.cloth).filter(Boolean)
  }));

  return (
    <div className="py-6">
      <ClientOnly>
        <WardrobeClient 
          initialClothes={filteredClothes} 
          allClothes={allClothes}
          initialGroups={mappedGroups}
          q={q} 
        />
      </ClientOnly>
    </div>
  )
}
