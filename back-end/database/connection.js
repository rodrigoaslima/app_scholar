const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const dbFile = process.env.DB_FILE || './data/app_scholar.sqlite';
const dbPath = path.resolve(__dirname, '..', dbFile);

let dbPromise;

async function getDb() {
  if (!dbPromise) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    dbPromise = open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    const db = await dbPromise;
    await db.exec('PRAGMA foreign_keys = ON;');
  }

  return dbPromise;
}

async function runSchema() {
  const db = await getDb();
  const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');
  await db.exec(schema);
}

module.exports = { getDb, runSchema };
