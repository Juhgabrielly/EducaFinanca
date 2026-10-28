
import "dotenv/config";
import { defineConfig } from "prisma/config";

const host = process.env.DB_HOST;
const port = process.env.DB_PORT || "3306";
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

let url = process.env.PRISMA_DATABASE_URL;

if (!url && host && user && password && database) {
  url =
    `mysql://${encodeURIComponent(user)}:` +
    `${encodeURIComponent(password)}@${host}:${port}/` +
    `${database}?sslaccept=strict`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: url || ""
  }
});
