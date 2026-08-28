require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pdf_download_limit integer NOT NULL DEFAULT 3`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pdf_download_used integer NOT NULL DEFAULT 0`;
  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'users' AND column_name LIKE 'pdf_%'
    ORDER BY column_name
  `;
  console.log("PDF download columns ready", cols);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
