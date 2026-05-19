import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { initDb } from './db/index.js';
import { authRoutes } from './routes/auth.js';
import { produtoRoutes } from './routes/produtos.js';
import { notaRoutes } from './routes/notas.js';
import { conferenciaRoutes } from './routes/conferencias.js';
import { lockRoutes } from './routes/locks.js';
import { syncRoutes } from './routes/sync.js';
import { reportRoutes } from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(fileUpload({ limits: { fileSize: 20 * 1024 * 1024 } }));

app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/conferencias', conferenciaRoutes);
app.use('/api/locks', lockRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
  });
}

start().catch(console.error);