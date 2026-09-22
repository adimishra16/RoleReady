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
  const res = await tables.listTables(process.env.APPWRITE_DATABASE_ID || "roleready");
  console.log(
    JSON.stringify(
      (res.tables || []).map((t) => ({ id: t.$id, name: t.name })),
      null,
      2
    )
  );
}

main().catch((e) => console.error(e.message));
