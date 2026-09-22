import { Client, Account, TablesDB, Users, ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import {
  APPWRITE_API_KEY,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_SESSION_COOKIE,
  isAppwriteApiKeyConfigured,
  isAppwriteConfigured,
} from "./config";

export { ID, Query };

/**
 * Adapter: TablesDB (rows) → document-style API used by `@/lib/appwrite/db`.
 * RoleReady's `roleready` database is type "legacy" / TablesDB — DocumentsDB cannot see it.
 * Required API key scopes: rows.read, rows.write (and tables.read as needed).
 */
function asDocumentClient(tables: TablesDB) {
  return {
    getDocument: (databaseId: string, collectionId: string, documentId: string) =>
      tables.getRow(databaseId, collectionId, documentId),

    listDocuments: async (
      databaseId: string,
      collectionId: string,
      queries?: string[]
    ) => {
      const res = await tables.listRows(databaseId, collectionId, queries);
      return {
        total: res.total,
        documents: res.rows,
      };
    },

    createDocument: (
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: Record<string, unknown>,
      permissions?: string[]
    ) => tables.createRow(databaseId, collectionId, documentId, data, permissions),

    updateDocument: (
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: Record<string, unknown>
    ) => tables.updateRow(databaseId, collectionId, documentId, data),

    deleteDocument: (databaseId: string, collectionId: string, documentId: string) =>
      tables.deleteRow(databaseId, collectionId, documentId),
  };
}

export type AppwriteDbClient = ReturnType<typeof asDocumentClient>;

/** Admin / server client — requires APPWRITE_API_KEY. */
export function createAdminClient() {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured");
  }
  if (!isAppwriteApiKeyConfigured()) {
    throw new Error("APPWRITE_API_KEY is not set");
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const tables = new TablesDB(client);

  return {
    client,
    account: new Account(client),
    databases: asDocumentClient(tables),
    users: new Users(client),
  };
}

/** Session client for the signed-in user (cookie-based SSR). */
export async function createSessionClient() {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured");
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  const jar = await cookies();
  const session = jar.get(APPWRITE_SESSION_COOKIE);

  if (!session?.value) {
    return null;
  }

  client.setSession(session.value);

  const tables = new TablesDB(client);

  return {
    client,
    account: new Account(client),
    databases: asDocumentClient(tables),
  };
}

/** Prefer admin TablesDB when API key exists; otherwise session client. */
export async function createDatabasesClient(): Promise<AppwriteDbClient | null> {
  if (isAppwriteApiKeyConfigured()) {
    return createAdminClient().databases;
  }
  const session = await createSessionClient();
  if (!session) return null;
  return session.databases;
}
