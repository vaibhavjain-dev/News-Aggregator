import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
