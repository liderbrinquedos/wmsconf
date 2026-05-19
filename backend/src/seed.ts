import { initDb, query, run, save } from './db/index.js';
import bcrypt from 'bcryptjs';

async function seed() {
  process.env.DB_PATH = process.env.DB_PATH || './data/conferencia.db';
  await initDb();

  const existing = query('SELECT id FROM usuarios WHERE username = ?', ['admin']);
  if (existing.values.length > 0) {
    console.log('Usuario admin ja existe. Pulando seed.');
    return;
  }

  const hash = bcrypt.hashSync('admin123', 10);
  run('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)', ['admin', hash, 'admin']);
  save();
  console.log('Seed concluido: usuario admin/admin123 criado.');
}

seed().catch(console.error);
