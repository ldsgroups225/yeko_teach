// src/db/config.ts

import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'

const expoDb = openDatabaseSync('db.db')

export const drizzleDb = drizzle(expoDb)
