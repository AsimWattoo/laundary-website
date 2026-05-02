import { db } from '@/db'
import { clothes, laundryItems, clothingGroups, clothingGroupItems } from '@/db/schema'
import { SelectionClient } from './SelectionClient'
import { AddClothDialog } from '@/components/AddClothDialog'
import { ClientOnly } from '@/components/ClientOnly'
import { desc, eq, notInArray } from 'drizzle-orm'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Laundry Session',
};

export const dynamic = 'force-dynamic'

export default async function NewSessionPage() {
  // Fetch IDs of clothes that are currently in an active session (not returned)
  const activeItems = await db.select({ 
    clothId: laundryItems.clothId 
  }).from(laundryItems).where(eq(laundryItems.isReturned, false))
  
  const busyClothIds = activeItems.map(i => i.clothId)

  // Fetch all available clothes
  const allAvailableClothes = await db.select({
    id: clothes.id,
    name: clothes.name,
    imageUrl: clothes.imageUrl,
    type: clothes.type,
  })
  .from(clothes)
  .where(busyClothIds.length > 0 ? notInArray(clothes.id, busyClothIds) : undefined)
  .orderBy(desc(clothes.createdAt))

  // Fetch all groups and their items
  const groupsRaw = await db
    .select({
      id: clothingGroups.id,
      name: clothingGroups.name,
      clothId: clothingGroupItems.clothId,
    })
    .from(clothingGroups)
    .leftJoin(clothingGroupItems, eq(clothingGroups.id, clothingGroupItems.groupId))

  // Group items by group ID
  const groupsMap = groupsRaw.reduce((acc, curr) => {
    if (!acc[curr.id]) {
      acc[curr.id] = { id: curr.id, name: curr.name, itemIds: [] }
    }
    if (curr.clothId) {
      acc[curr.id].itemIds.push(curr.clothId)
    }
    return acc
  }, {} as Record<string, { id: string, name: string, itemIds: string[] }>)

  const allGroups = Object.values(groupsMap)

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Laundry Session</h1>
          <p className="text-muted-foreground">
            Select items or groups to send to laundry.
          </p>
        </div>
        <ClientOnly>
          <AddClothDialog />
        </ClientOnly>
      </header>

      <ClientOnly>
        <SelectionClient 
          initialClothes={allAvailableClothes} 
          initialGroups={allGroups}
        />
      </ClientOnly>
    </div>
  )
}
