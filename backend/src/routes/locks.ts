import { Router, Request, Response } from 'express';
import { query, queryOne, run, save } from '../db/index.js';
import { authMiddleware } from './auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/check', (req: Request, res: Response) => {
  const nunota = parseInt(req.body.nunota as string, 10) || 0;

  const notaRow = queryOne('SELECT id FROM notas WHERE nunota = ?', [nunota]);
  if (!notaRow) {
    return res.json({ locked: false, error: 'nota_nao_encontrada' });
  }

  const notaId = notaRow[0];
  const lockRow = queryOne(
    `SELECT l.nota_id, l.usuario_id, l.iniciado_em, u.username FROM locks l LEFT JOIN usuarios u ON l.usuario_id = u.id WHERE l.nota_id = ?`,
    [notaId]
  );

  if (lockRow) {
    return res.json({
      locked: true,
      usuario_id: lockRow[1],
      username: lockRow[3],
      iniciado_em: lockRow[2],
    });
  }

  res.json({ locked: false });
});

router.post('/acquire', (req: Request, res: Response) => {
  const nunota = parseInt(req.body.nunota as string, 10) || 0;
  const userId = (req as any).user.id;

  const notaRow = queryOne('SELECT id, status FROM notas WHERE nunota = ?', [nunota]);
  if (!notaRow) {
    return res.status(404).json({ error: 'Nota nao encontrada' });
  }

  const notaId = notaRow[0] as number;
  const status = notaRow[1] as string;

  if (status === 'conferida') {
    return res.status(400).json({ error: 'Nota ja conferida' });
  }

  const existingLock = queryOne('SELECT usuario_id FROM locks WHERE nota_id = ?', [notaId]);
  if (existingLock) {
    const lockUserId = existingLock[0];
    if (lockUserId !== userId) {
      return res.status(409).json({ error: 'Nota em conferencia por outro operador' });
    }
    return res.json({ ok: true, message: 'Lock ja pertence a voce' });
  }

  run('INSERT INTO locks (nota_id, usuario_id) VALUES (?, ?)', [notaId, userId]);
  save();
  res.json({ ok: true });
});

router.post('/release', (req: Request, res: Response) => {
  const nunota = parseInt(req.body.nunota as string, 10) || 0;
  const userId = (req as any).user.id;

  const notaRow = queryOne('SELECT id FROM notas WHERE nunota = ?', [nunota]);
  if (notaRow) {
    const notaId = notaRow[0] as number;
    const lockRow = queryOne('SELECT usuario_id FROM locks WHERE nota_id = ?', [notaId]);
    if (lockRow && lockRow[0] !== userId) {
      return res.status(403).json({ error: 'Lock pertence a outro operador' });
    }
    run('DELETE FROM locks WHERE nota_id = ?', [notaId]);
    save();
  }

  res.json({ ok: true });
});

export { router as lockRoutes };
