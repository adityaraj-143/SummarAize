"use server"

import { neon,neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true
let cachedSql: ReturnType<typeof neon> | null = null;

export async function getDbConnection() {
  if (!cachedSql) {
    if (!process.env.NEON_DB) {
      
      throw new Error("Neon database URL is not defined");
    }
    cachedSql = neon(process.env.NEON_DB);
  }
  return cachedSql;
}


