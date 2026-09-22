const { Client, TablesDB, Query } = require("node-appwrite");
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

  for (const id of ["app_settings", "resumes", "resume_sections", "shared_links"]) {
    const res = await tables.listRows("roleready", id, [Query.limit(2)]);
    console.log("\n", id, "total", res.total);
    if (res.rows[0]) console.log(JSON.stringify(res.rows[0], null, 2));
  }
}

main().catch((e) => console.error(e.message));
