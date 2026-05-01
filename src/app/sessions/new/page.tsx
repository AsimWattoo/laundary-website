import { db } from '@/db'
import { clothes } from '@/db/schema'
import { SelectionClient } from './SelectionClient'
import { AddClothDialog } from '@/components/AddClothDialog'
import { desc } from 'drizzle-orm'

/**
 * Accessibility Strategy:
 * - Semantic Landmarks: Uses <main> via layout, here using <div> for grouping.
 * - Heading Hierarchy: <h1> for the page title.
 * - Interaction: The core selection logic is offloaded to SelectionClient which uses semantic ARIA roles.
 */
export default async function NewSessionPage() {
  // Fetch all clothes from the wardrobe, newest first.
  const allClothes = await db.select({
    id: clothes.id,
    name: clothes.name,
    imageUrl: clothes.imageUrl,
  }).from(clothes).orderBy(desc(clothes.createdAt))

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Laundry Session</h1>
          <p className="text-muted-foreground">
            Select the items you are sending to laundry.
          </p>
        </div>
        <AddClothDialog />
      </header>

      <SelectionClient initialClothes={allClothes} />
    </div>
  )
}
