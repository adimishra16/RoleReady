const { Client, DocumentsDB, TablesDB, Databases } = require("node-appwrite");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

async function main() {
  console.log("endpoint", process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  console.log("project", process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  console.log("dbEnv", process.env.APPWRITE_DATABASE_ID);
  console.log("keyPrefix", (process.env.APPWRITE_API_KEY || "").slice(0, 20));

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  for (const [label, Ctor] of [
    ["DocumentsDB", DocumentsDB],
    ["TablesDB", TablesDB],
    ["Databases", Databases],
  ]) {
    try {
      const svc = new Ctor(client);
      const res = await svc.list();
      console.log(label, JSON.stringify(res, null, 2).slice(0, 2000));
    } catch (e) {
      console.log(label, "ERR", e.message);
    }
  }
}

main();
