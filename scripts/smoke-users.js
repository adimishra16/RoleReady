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
  const res = await tables.listRows("roleready", "users", [Query.limit(3)]);
  console.log("total", res.total);
  console.log(
    JSON.stringify(
      (res.rows || []).map((r) => ({
        id: r.$id,
        email: r.email,
        role: r.role,
      })),
      null,
      2
    )
  );
}

main().catch((e) => console.error("ERR", e.message));
