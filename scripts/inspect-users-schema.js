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
  const table = await tables.getTable("roleready", "users");
  // print columns / attributes if present
  console.log("keys", Object.keys(table));
  const cols = table.columns || table.attributes || [];
  console.log(
    JSON.stringify(
      cols.map((c) => ({
        key: c.key,
        type: c.type,
        required: c.required,
        default: c.default,
      })),
      null,
      2
    )
  );

  const sample = await tables.listRows("roleready", "users", []);
  if (sample.rows?.[0]) {
    console.log("sampleKeys", Object.keys(sample.rows[0]));
  }
}

main().catch((e) => console.error(e.message));
