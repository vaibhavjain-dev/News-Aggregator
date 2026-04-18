import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userTable } from "./auth";
import { postTable } from "./posts";
import { commentTable } from "./comments";

export const postUpvoteTable = pgTable("post_upvotes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: integer("post_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const postUpvoteRelations = relations(postUpvoteTable, ({ one }) => ({
  post: one(postTable, {
    fields: [postUpvoteTable.postId],
    references: [postTable.id],
    relationName: "PostUpvotes",
  }),
  user: one(userTable, {
    fields: [postUpvoteTable.userId],
    references: [userTable.id],
    relationName: "User",
  }),
}));

export const commentUpvoteTable = pgTable("comment_upvotes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  commentId: integer("comment_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const commentUpvoteRelations = relations(
  commentUpvoteTable,
  ({ one }) => ({
    comment: one(commentTable, {
      fields: [commentUpvoteTable.commentId],
      references: [commentTable.id],
      relationName: "CommentUpvotes",
    }),
    user: one(userTable, {
      fields: [commentUpvoteTable.userId],
      references: [userTable.id],
      relationName: "User",
    }),
  }),
);
