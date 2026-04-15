import { Hono } from "hono";
import type { Context } from "../context";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, type SuccessResponse } from "../../Shared/types";
import { userTable } from "@/db/schemas/auth";
import { lucia } from "@/lucia";
import { db } from "@/adapter";
import { HTTPException } from "hono/http-exception";
import { generateId } from "lucia";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { loggedIn } from "../Middleware/loggedIn";

export const authRouter = new Hono<Context>()
  .post("/signup", zValidator("form", loginSchema), async (c) => {
    const { username, password } = c.req.valid("form");
    const passwordHash = await Bun.password.hash(password);
    const userId = generateId(15);

    try {
      await db.insert(userTable).values({
        id: userId,
        username,
        passwordHash,
      });

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id).serialize();

      c.header("Set-Cookie", sessionCookie, { append: true });

      return c.json<SuccessResponse>(
        { success: true, message: "User created" },
        201,
      );
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "23505") {
        throw new HTTPException(409, { message: "Username already exists" });
      }
      throw new HTTPException(500, { message: "Failed to create user" });
    }
  })
  .post("/login", zValidator("form", loginSchema), async (c) => {
    const { username, password } = c.req.valid("form");
    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1);

    if (!existingUser) {
      throw new HTTPException(401, {
        message: "Invalid credentials",
      });
    }

    const validPassword = await Bun.password.verify(
      password,
      existingUser.passwordHash,
    );
    if (!validPassword) {
      throw new HTTPException(401, {
        message: "Invalid credentials",
      });
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id).serialize();

    c.header("Set-Cookie", sessionCookie, { append: true });

    return c.json<SuccessResponse>(
      { success: true, message: "User logged in" },
      200,
    );
  })
  .get("/logout", async (c) => {
    const session = c.get("session");
    if (!session) return c.redirect("/");

    await lucia.invalidateSession(session.id);
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize());
    return c.redirect("/");
  })
  .get("/user", loggedIn, async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    return c.json<SuccessResponse<{ username: string }>>(
      {
        success: true,
        message: "User fetched successfully",
        data: { username: user.username },
      },
      200,
    );
  });
