import { Router, Request, Response } from 'express';
import { query, queryOne, run, save } from '../db/index.js';
import { authMiddleware } from './auth.js';

const router = Router();
router.use(authMiddleware as any);

router.get('/', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = (page - 1) * limit;
  const userId = parseInt(req.query.user_id as string) || 0;

  let where = '1=1';
  const params: any[] = [];
  if (userId) {
    where = 'c.usuario_id = ?';
    params.push(userId);
  }

  const countRow = queryOne(`SELECT COUNT(*) FROM conferencias c WHERE ${where}`, params);
  const total = (countRow?.[0] as number) || 0;

  const result = query(
    `SELECT c.*, n.numnota, n.razaosocial, u.username
     FROM conferencias c
     LEFT JOIN notas n ON c.nota_id = n.id
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     WHERE ${where}
     ORDER BY c.iniciada_em DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const columns = ['id', 'nota_id', 'usuario_id', 'status', 'iniciada_em', 'finalizada_em', 'numnota', 'cliente', 'operador'];
  const conferencias = result.values.map(row => {
    const conf = Object.fromEntries(columns.map((c, i) => [c, row[i]])) as any;
    conf.leituras = [];
    return conf;
  });

  if (conferencias.length > 0) {
    const confIds = conferencias.map((c: any) => c.id);
    const placeholders = confIds.map(() => '?').join(',');
    const leiturasResult = query(
      `SELECT * FROM leituras WHERE conferencia_id IN (${placeholders})`,
      confIds
    );

    const leiturasByConf = new Map<number, any[]>();
    for (const row of leiturasResult.values) {
      const leitura = Object.fromEntries(leiturasResult.columns.map((col, i) => [col, row[i]]));
      const confId = leitura.conferencia_id as number;
      if (!leiturasByConf.has(confId)) {
        leiturasByConf.set(confId, []);
      }
      leiturasByConf.get(confId)!.push(leitura);
    }

    for (const c of conferencias) {
      c.leituras = leiturasByConf.get(c.id) || [];
    }
  }

  res.json({ data: conferencias, total, page, limit });
});

export { router as conferenciaRoutes };
