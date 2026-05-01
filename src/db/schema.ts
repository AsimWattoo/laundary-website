import { pgTable, uuid, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const sessionStatusEnum = pgEnum('session_status', ['active', 'completed']);

export const clothes = pgTable('clothes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const laundrySessions = pgTable('laundry_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  expectedReturnDate: timestamp('expected_return_date'),
  status: sessionStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const laundryItems = pgTable('laundry_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => laundrySessions.id).notNull(),
  clothId: uuid('cloth_id').references(() => clothes.id).notNull(),
  isReturned: boolean('is_returned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
