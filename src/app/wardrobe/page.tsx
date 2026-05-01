import { db } from '@/db'
import { clothes } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { AddClothDialog } from '@/components/AddClothDialog'

export const dynamic = 'force-dynamic'

/**
 * WardrobePage displays the user's inventory of clothes.
 * Fetches clothes from the database and displays them in a responsive grid.
 */
export default async function WardrobePage() {
  // Fetch all clothes from the database, ordered by creation date (newest first)
  const allClothes = await db.query.clothes.findMany({
    orderBy: [desc(clothes.createdAt)],
  })

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Wardrobe</h1>
        {/* AddClothDialog handles the modal for adding new clothing items */}
        <AddClothDialog />
      </div>

      {allClothes.length === 0 ? (
        // Accessible empty state with visual styling
        <div 
          className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border-2 border-dashed"
          role="status"
          aria-label="Empty wardrobe"
        >
          <p className="text-muted-foreground text-lg">Your wardrobe is empty.</p>
          <p className="text-muted-foreground">Add your first piece of clothing to get started!</p>
        </div>
      ) : (
        // Responsive grid for displaying clothing items
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {allClothes.map((cloth) => (
            <div 
              key={cloth.id} 
              className="group relative bg-card rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                {/* Standard img tag used for vercel blob compatibility without extra next.config.js changes */}
                <img
                  src={cloth.imageUrl}
                  alt={`Photo of ${cloth.name}`}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate" title={cloth.name}>{cloth.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
