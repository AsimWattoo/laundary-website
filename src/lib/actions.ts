'use server'

import { put } from '@vercel/blob';
import { db } from '@/db';
import { clothes, laundryItems, laundrySessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCloth(formData: FormData) {
  try {
    console.log('Starting createCloth action...');
    const file = formData.get('image') as File;
    const name = formData.get('name') as string;

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
    });
    console.log('Database entry created');

    revalidatePath('/wardrobe');
    revalidatePath('/sessions/new');
  } catch (error) {
    console.error('Error in createCloth:', error);
    throw error;
  }
}

export async function createLaundrySession(clothIds: string[]) {
  if (clothIds.length === 0) {
    throw new Error('No clothes selected');
  }

  const [session] = await db.insert(laundrySessions).values({
    status: 'active'
  }).returning();

  await db.insert(laundryItems).values(
    clothIds.map((clothId) => ({
      sessionId: session.id,
      clothId,
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
