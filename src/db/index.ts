import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(
  connectionString &&
  !connectionString.includes("placeholder") &&
  connectionString.startsWith("postgres")
);

const sql = isDbConfigured ? neon(connectionString!) : null;

export const db = sql ? drizzle(sql, { schema }) : null;

export type DBType = typeof db;
