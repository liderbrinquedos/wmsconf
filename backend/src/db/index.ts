import initSqlJs from 'sql.js';
import type { SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let db: SqlJsDatabase;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initDb(dbPath?: string): Promise<SqlJsDatabase> {
  const resolvedPath = dbPath || process.env.DB_PATH || './data/conferencia.db';
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(resolvedPath)) {
    const buffer = fs.readFileSync(resolvedPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA foreign_keys=ON');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.run(schema);

  save();
  return db;
}

export function save(): void {
  const resolvedPath = process.env.DB_PATH || './data/conferencia.db';
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(resolvedPath, buffer);
}

export interface QueryResult {
  columns: string[];
  values: any[][];
}

export function query(sql: string, params: any[] = []): QueryResult {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const columns = stmt.getColumnNames();
  const values: any[][] = [];
  while (stmt.step()) {
    values.push(stmt.get());
  }
  stmt.free();
  return { columns, values };
}

export function queryOne(sql: string, params: any[] = []): any[] | null {
  const result = query(sql, params);
  return result.values[0] || null;
}

export function run(sql: string, params: any[] = []): void {
  db.run(sql, params);
}

export function lastInsertRowId(): number {
  const result = query('SELECT last_insert_rowid()');
  return result.values[0]?.[0] as number;
}