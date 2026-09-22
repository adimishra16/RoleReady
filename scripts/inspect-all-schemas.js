const { Client, TablesDB } = require("node-appwrite");
const fs = require("fs");

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

async function main() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  const tables = new TablesDB(client);
  const ids = [
    "users",
    "resumes",
    "resume_sections",
    "shared_links",
    "billing_events",
    "app_settings",
    "job_matches",
  ];
  for (const id of ids) {
    const table = await tables.getTable("roleready", id);
    console.log(
      "\n##",
      id,
      "\n",
      table.columns.map((c) => `${c.key}:${c.type}${c.required ? "*" : ""}`).join(", ")
    );
  }
}

main().catch((e) => console.error(e.message));
