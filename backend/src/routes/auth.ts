import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query, queryOne, run, lastInsertRowId, save } from '../db/index.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'conferencia-secret-key';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const createUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(4),
  role: z.enum(['admin', 'operador']),
});

function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
}

router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const row = queryOne('SELECT id, username, password, role FROM usuarios WHERE username = ?', [username]);
    if (!row) {
      return res.status(401).json({ error: 'Usuario ou senha invalidos' });
    }

    const [id, uname, hash, role] = row as any[];
    const valid = bcrypt.compareSync(password, hash);
    if (!valid) {
      return res.status(401).json({ error: 'Usuario ou senha invalidos' });
    }

    const token = jwt.sign({ id, username: uname, role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id, username: uname, role } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados invalidos', details: (err as z.ZodError).issues });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.use(authMiddleware);

router.get('/users', adminOnly, (_req: Request, res: Response) => {
  const result = query('SELECT id, username, role, created_at FROM usuarios ORDER BY created_at DESC');
  const users = result.values.map(row =>
    Object.fromEntries(result.columns.map((c, i) => [c, row[i]]))
  );
  res.json({ data: users });
});

router.post('/users', adminOnly, (req: Request, res: Response) => {
  try {
    const { username, password, role } = createUserSchema.parse(req.body);

    const exists = queryOne('SELECT id FROM usuarios WHERE username = ?', [username]);
    if (exists) {
      return res.status(409).json({ error: 'Usuario ja existe' });
    }

    const hash = bcrypt.hashSync(password, 10);
    run('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)', [username, hash, role]);
    save();

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados invalidos', details: (err as z.ZodError).issues });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.delete('/users/:id', adminOnly, (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const currentUser = (req as any).user;

    if (userId === currentUser.id) {
      return res.status(400).json({ error: 'Nao e possivel deletar a si mesmo' });
    }

    const exists = queryOne('SELECT id FROM usuarios WHERE id = ?', [userId]);
    if (!exists) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }

    run('DELETE FROM usuarios WHERE id = ?', [userId]);
    save();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token nao fornecido' });
  }

  try {
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido' });
  }
}

export { router as authRoutes };
