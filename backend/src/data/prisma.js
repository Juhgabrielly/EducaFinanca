const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

let configuracao;
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  configuracao = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\/+/, ''),
    connectionLimit: 5,
    connectTimeout: 10000,
    ssl: url.hostname !== 'localhost' && url.hostname !== '127.0.0.1'
  };
} else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
  configuracao = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    connectionLimit: 5,
    connectTimeout: 10000,
    ssl: process.env.DB_SSL === 'false' ? false : (process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1' ? false : true)
  };
} else {
  throw new Error('Configure DATABASE_URL ou DB_HOST, DB_USER e DB_NAME no .env');
}
const adapter = new PrismaMariaDb(configuracao);
const prisma = new PrismaClient({ adapter });
module.exports = prisma;
