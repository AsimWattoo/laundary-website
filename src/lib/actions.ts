'use server'

import { put } from '@vercel/blob';
import { db } from '@/db';
import { clothes, laundryItems, laundrySessions, clothingGroups, clothingGroupItems } from '@/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCloth(formData: FormData) {
  try {
    console.log('Starting createCloth action...');
    const file = formData.get('image') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as 'shalwar' | 'qameez' | 'tshirt' | 'pant' | 'underwear' | 'trouser' | 'other';

    if (!file || !name) {
      console.error('Missing name or image');
      throw new Error('Missing name or image');
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size}`);
    const blob = await put(file.name, file, { 
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    console.log('File uploaded successfully:', blob.url);

    await db.insert(clothes).values({
      name,
      imageUrl: blob.url,
      type: type || 'other',
    });
    console.log('Database entry created');

    revalidatePath('/wardrobe');
    revalidatePath('/sessions/new');
  } catch (error) {
    console.error('Error in createCloth:', error);
    throw error;
  }
}

export async function createClothingGroup(name: string, clothIds: string[]) {
  try {
    const [group] = await db.insert(clothingGroups).values({
      name,
    }).returning();

    if (clothIds.length > 0) {
      await db.insert(clothingGroupItems).values(
        clothIds.map(clothId => ({
          groupId: group.id,
          clothId,
        }))
      );
    }

    revalidatePath('/wardrobe');
    revalidatePath('/sessions/new');
    return group;
  } catch (error) {
    console.error('Error in createClothingGroup:', error);
    throw error;
  }
}

export async function deleteClothingGroup(groupId: string) {
  try {
    await db.delete(clothingGroupItems).where(eq(clothingGroupItems.groupId, groupId));
    await db.delete(clothingGroups).where(eq(clothingGroups.id, groupId));
    revalidatePath('/wardrobe');
    revalidatePath('/sessions/new');
  } catch (error) {
    console.error('Error in deleteClothingGroup:', error);
    throw error;
  }
}

export async function deleteCloth(clothId: string) {
  try {
    // Delete associated group items first
    await db.delete(clothingGroupItems).where(eq(clothingGroupItems.clothId, clothId));
    // Delete associated laundry items first to avoid FK constraint errors
    await db.delete(laundryItems).where(eq(laundryItems.clothId, clothId));
    await db.delete(clothes).where(eq(clothes.id, clothId));
    revalidatePath('/wardrobe');
    revalidatePath('/sessions/new');
    revalidatePath('/');
  } catch (error) {
    console.error('Error in deleteCloth:', error);
    throw error;
  }
}

export async function deleteClothesBulk(clothIds: string[]) {
  try {
    if (clothIds.length === 0) return;
    await db.delete(laundryItems).where(inArray(laundryItems.clothId, clothIds));
    await db.delete(clothes).where(inArray(clothes.id, clothIds));
    revalidatePath('/wardrobe');
    revalidatePath('/sessions/new');
    revalidatePath('/');
  } catch (error) {
    console.error('Error in deleteClothesBulk:', error);
    throw error;
  }
}

export async function deleteLaundrySessionsBulk(sessionIds: string[]) {
  try {
    if (sessionIds.length === 0) return;
    // Delete all laundry items associated with these sessions first
    await db.delete(laundryItems).where(inArray(laundryItems.sessionId, sessionIds));
    await db.delete(laundrySessions).where(inArray(laundrySessions.id, sessionIds));
    revalidatePath('/sessions');
    revalidatePath('/');
  } catch (error) {
    console.error('Error in deleteLaundrySessionsBulk:', error);
    throw error;
  }
}

export async function createLaundrySession(clothIds: string[]) {
  if (clothIds.length === 0) {
    throw new Error('No clothes selected');
  }

  // Set default return date to 3 days from now
  const expectedReturnDate = new Date();
  expectedReturnDate.setDate(expectedReturnDate.getDate() + 3);

  const [session] = await db.insert(laundrySessions).values({
    status: 'active',
    startDate: new Date(),
    expectedReturnDate: expectedReturnDate,
  }).returning();

  await db.insert(laundryItems).values(
    clothIds.map((clothId) => ({
      sessionId: session.id,
      clothId,
      isReturned: false,
    }))
  );

  revalidatePath('/');
  redirect(`/sessions/${session.id}`);
}

export async function toggleItemReturn(itemId: string, isReturned: boolean) {
  const [item] = await db
    .update(laundryItems)
    .set({ isReturned })
    .where(eq(laundryItems.id, itemId))
    .returning({ sessionId: laundryItems.sessionId });

  if (!item) throw new Error('Item not found');

  // Check if all items are returned to update session status
  const allItems = await db
    .select()
    .from(laundryItems)
    .where(eq(laundryItems.sessionId, item.sessionId));

  const allReturned = allItems.every((i) => i.isReturned);

  await db
    .update(laundrySessions)
    .set({ status: allReturned ? 'completed' : 'active' })
    .where(eq(laundrySessions.id, item.sessionId));

  revalidatePath(`/sessions/${item.sessionId}`);
  revalidatePath('/'); // Dashboard also shows sessions
}

export async function updateSessionItems(sessionId: string, returnedItemIds: string[]) {
  try {
    // 1. Reset all items for this session to not returned
    await db
      .update(laundryItems)
      .set({ isReturned: false })
      .where(eq(laundryItems.sessionId, sessionId));

    // 2. Set specified items to returned
    if (returnedItemIds.length > 0) {
      await db
        .update(laundryItems)
        .set({ isReturned: true })
        .where(
          and(
            eq(laundryItems.sessionId, sessionId),
            inArray(laundryItems.id, returnedItemIds)
          )
        );
    }

    // 3. Update session status based on whether all items are returned
    const allItems = await db
      .select()
      .from(laundryItems)
      .where(eq(laundryItems.sessionId, sessionId));

    const allReturned = allItems.length > 0 && allItems.every((i) => i.isReturned);

    await db
      .update(laundrySessions)
      .set({ status: allReturned ? 'completed' : 'active' })
      .where(eq(laundrySessions.id, sessionId));

    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath('/sessions');
    revalidatePath('/');
  } catch (error) {
    console.error('Error in updateSessionItems:', error);
    throw error;
  }
}

export async function deleteLaundrySession(sessionId: string) {
  try {
    // Check if session has items
    const items = await db
      .select()
      .from(laundryItems)
      .where(eq(laundryItems.sessionId, sessionId));

    if (items.length > 0) {
      return { error: 'Cannot delete session that contains items. Please remove all items first.' };
    }

    await db.delete(laundrySessions).where(eq(laundrySessions.id, sessionId));
    
    revalidatePath('/');
    revalidatePath('/sessions');
  } catch (error) {
    console.error('Error in deleteLaundrySession:', error);
    return { error: 'Failed to delete session. Please try again.' };
  }
  redirect('/sessions');
}

export async function updateSessionReturnDate(sessionId: string, date: Date | null) {
  try {
    await db
      .update(laundrySessions)
      .set({ expectedReturnDate: date })
      .where(eq(laundrySessions.id, sessionId));

    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath('/sessions');
    revalidatePath('/');
  } catch (error) {
    console.error('Error in updateSessionReturnDate:', error);
    throw error;
  }
}
