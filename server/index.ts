import { Hono } from 'hono'
import { db } from './adapter'
import { HTTPException } from 'hono/http-exception'
import type { ErrorResponse } from '../Shared/types'

const app = new Hono()

app.get('/', (c) => {
  // throw new Error("Unexpected!",{cause:{form:true}});
  
  // throw new HTTPException(404,{message:"Post Not Found!", cause:{form:true}});
  return c.text('Hello Hono!')
})

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.res ?? c.json<ErrorResponse>({
      success: false,
      error: err.message,
      isFormError: err.cause && typeof err.cause === "object" && "form" in err.cause ? err.cause.form === true : false,
    }, err.status);
  }

  const status = (err as any).status || 500;
  
  return c.json<ErrorResponse>({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : (err.stack ?? err.message),
  }, status === 500 ? 500 : status as any);
});


export default app
