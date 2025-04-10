"use server"

import { neon } from "@neondatabase/serverless";

let cachedSql: ReturnType<typeof neon> | null = null;

export async function getDbConnection() {
  if (!cachedSql) {
    if (!process.env.NEON_DB) {
    //   console.log("ABC: ", process.env.NEON_DB);
      throw new Error("Neon database URL is not defined");
    }
    cachedSql = neon(process.env.NEON_DB);
  }
  return cachedSql;
}


