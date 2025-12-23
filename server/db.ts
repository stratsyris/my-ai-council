import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _dbInitialized = false;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_dbInitialized) {
    _dbInitialized = true;
    if (process.env.DATABASE_URL) {
      try {
        _db = drizzle(process.env.DATABASE_URL);
        console.log("[Database] Connected successfully");
      } catch (error) {
        console.error("[Database] Failed to connect:", error);
        _db = null;
      }
    } else {
      console.warn("[Database] DATABASE_URL not set");
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user's Chairman preference
 */
export async function getChairmanPreference(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get chairman preference: database not available");
    return "google/gemini-3-pro-preview";
  }

  try {
    const result = await db
      .select({ chairmanPreference: users.chairmanPreference })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result.length > 0
      ? result[0].chairmanPreference
      : "google/gemini-3-pro-preview";
  } catch (error) {
    console.error("[Database] Failed to get chairman preference:", error);
    return "google/gemini-3-pro-preview";
  }
}

/**
 * Update user's Chairman preference
 */
export async function updateChairmanPreference(
  userId: number,
  chairmanModel: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update chairman preference: database not available");
    return;
  }

  try {
    await db
      .update(users)
      .set({ chairmanPreference: chairmanModel })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update chairman preference:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.
