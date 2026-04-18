import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import { sessionTable, userTable } from "./db/schemas/auth";
import { postTable, postRelations } from "./db/schemas/posts";
import { commentTable, commentRelations } from "./db/schemas/comments";
import {
  postUpvoteTable,
  postUpvoteRelations,
  commentUpvoteTable,
  commentUpvoteRelations,
} from "./db/schemas/upvotes";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export const processEnv = EnvSchema.parse(process.env);

const queryClient = postgres(processEnv.DATABASE_URL);

export const db = drizzle(queryClient, {
  schema: {
    userTable,
    sessionTable,
    postTable,
    postRelations,
    commentTable,
    commentRelations,
    postUpvoteTable,
    postUpvoteRelations,
    commentUpvoteTable,
    commentUpvoteRelations,
  },
});

export const adapter = new DrizzlePostgreSQLAdapter(
  db,
  sessionTable,
  userTable,
);
