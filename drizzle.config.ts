import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

function getLocalSQLiteDB() {
  try {
    const basePath = path.resolve("database");
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }
    return path.join(basePath, "teracharacter.db");
  } catch (err) {
    console.log(`Error setting up local database: ${err}`);
    return "./database/teracharacter.db";
  }
}

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: getLocalSQLiteDB(),
  },
});