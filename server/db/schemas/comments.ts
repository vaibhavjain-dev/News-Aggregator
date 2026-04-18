import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userTable } from "./auth";
import { postTable } from "./posts";
import { commentUpvoteTable } from "./upvotes";

export const commentTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: integer("post_id").notNull(),
  parentCommentId: integer("parent_comment_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  depth: integer("depth").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  points: integer("points").notNull().default(0),
});

export const commentRelations = relations(commentTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [commentTable.userId],
    references: [userTable.id],
    relationName: "Author",
  }),
  parentComment: one(commentTable, {
    fields: [commentTable.parentCommentId],
    references: [commentTable.id],
    relationName: "ParentChild",
  }),
  childComments: many(commentTable, {
    relationName: "ParentChild",
  }),
  post: one(postTable, {
    fields: [commentTable.postId],
    references: [postTable.id],
  }),
  commentUpvotes: many(commentUpvoteTable, {
    relationName: "CommentUpvotes",
  }),
}));
