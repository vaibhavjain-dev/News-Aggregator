import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userTable } from "./auth";
import { commentTable } from "./comments";
import { postUpvoteTable } from "./upvotes";

export const postTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content").notNull(),
  points: integer("points").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const postRelations = relations(postTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [postTable.userId],
    references: [userTable.id],
    relationName: "Author",
  }),
  postUpvotes: many(postUpvoteTable, { relationName: "PostUpvotes" }),
  comments: many(commentTable),
}));
