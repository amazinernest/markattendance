// Temporary Prisma 7 config for SQLite migration generation
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Use a local SQLite file for migration generation only
  datasource: {
    url: "file:./dev.db",
  },
  // Keep the migration directory path the same as the project expects
  migrations: {
    path: "prisma/migrations",
  },
});
