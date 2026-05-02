import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

// If we're in build mode or missing the URL, we might not have a valid connection string yet.
// We'll throw at runtime if it's still missing, but let's avoid crashing the build if it's just a placeholder.
const client = postgres(connectionString || 'postgres://localhost:5432/placeholder', { 
  prepare: false,
  // Standard timeout for stable connection
  connect_timeout: 10 
});

export const db = drizzle(client, { schema });
