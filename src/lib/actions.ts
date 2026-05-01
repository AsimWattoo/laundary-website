'use server'

import { put } from '@vercel/blob';
import { db } from '@/db';
import { clothes, laundryItems, laundrySessions } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCloth(formData: FormData) {
  const file = formData.get('image') as File;
  const name = formData.get('name') as string;

  if (!file || !name) {
    throw new Error('Missing name or image');
  }

  const blob = await put(file.name, file, { access: 'public' });

  await db.insert(clothes).values({
    name,
    imageUrl: blob.url,
  });

  revalidatePath('/wardrobe');
  revalidatePath('/sessions/new');
}

export async function createLaundrySession(clothIds: string[]) {
  if (clothIds.length === 0) {
    throw new Error('No clothes selected');
  }

  const [session] = await db.insert(laundrySessions).values({}).returning();

  await db.insert(laundryItems).values(
    clothIds.map((clothId) => ({
      sessionId: session.id,
      clothId,
    }))
  );

  revalidatePath('/');
  redirect(`/sessions/${session.id}`);
}
