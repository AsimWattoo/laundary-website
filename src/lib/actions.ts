'use server'

import { put } from '@vercel/blob';
import { db } from '@/db';
import { clothes } from '@/db/schema';
import { revalidatePath } from 'next/cache';

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
}
