import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query, queryOne, run, lastInsertRowId, save } from '../db/index.js';
import { authMiddleware } from './auth.js';

const router = Router();
router.use(authMiddleware as any);

const syncSchema = z.object({
  nunota: z.number(),
  leituras: z.array(z.object({
    codprod: z.string(),
    ean_lido: z.string(),
    qtd_emb: z.number(),
    criada_em: z.string().optional(),
  })),
  finalizada: z.boolean().optional(),
});

router.post('/', (req: Request, res: Response) => {
  try {
    const body = syncSchema.parse(req.body);
    const userId = (req as any).user.id;

    const notaRow = queryOne('SELECT id, status FROM notas WHERE nunota = ?', [body.nunota]);
    if (!notaRow) {
      return res.status(404).json({ error: 'Nota nao encontrada' });
    }

    const notaId = notaRow[0] as number;
    const notaStatus = notaRow[1] as string;

    if (notaStatus === 'conferida') {
      return res.status(400).json({ error: 'Nota ja conferida' });
    }

    const confRow = queryOne(
      'SELECT id FROM conferencias WHERE nota_id = ? AND usuario_id = ?',
      [notaId, userId]
    );

    let confId: number;
    if (confRow) {
      confId = confRow[0] as number;
    } else {
      run(
        'INSERT INTO conferencias (nota_id, usuario_id) VALUES (?, ?)',
        [notaId, userId]
      );
      confId = lastInsertRowId();
    }

    for (const leitura of body.leituras) {
      run(
        'INSERT INTO leituras (conferencia_id, codprod, ean_lido, qtd_emb) VALUES (?, ?, ?, ?)',
        [confId, leitura.codprod, leitura.ean_lido, leitura.qtd_emb]
      );
    }

    if (body.finalizada) {
      run(
        `UPDATE conferencias SET status='conferida', finalizada_em=datetime('now') WHERE id=?`,
        [confId]
      );
      run(
        `UPDATE notas SET status='conferida', conferida_em=datetime('now'), conferida_por=? WHERE id=?`,
        [userId, notaId]
      );
      run('DELETE FROM locks WHERE nota_id = ?', [notaId]);
    }

    save();
    res.json({ ok: true, conferencia_id: confId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados invalidos', details: (err as z.ZodError).issues });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro ao sincronizar' });
  }
});

router.get('/pendentes', (_req: Request, res: Response) => {
  const result = query(
    `SELECT n.nunota, n.numnota, n.razaosocial, n.status
     FROM notas n
     WHERE n.status = 'pendente'
     ORDER BY n.created_at DESC LIMIT 50`
  );

  const columns = ['nunota', 'numnota', 'razaosocial', 'status'];
  const notas = result.values.map(row =>
    Object.fromEntries(columns.map((c, i) => [c, row[i]]))
  );

  res.json({ data: notas });
});

export { router as syncRoutes };
