import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db/index.js';
import { authMiddleware } from './auth.js';
import XLSX from 'xlsx';

const router = Router();
router.use(authMiddleware as any);

router.get('/conferencias', (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = (page - 1) * limit;
  const user = (req as any).user;

  let where = '1=1';
  const params: any[] = [];
  if (user.role !== 'admin') {
    where = 'c.usuario_id = ?';
    params.push(user.id);
  }
  if (search) {
    where += ' AND (n.numnota LIKE ? OR n.razaosocial LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const countRow = queryOne(
    `SELECT COUNT(*) FROM conferencias c
     LEFT JOIN notas n ON c.nota_id = n.id
     WHERE ${where}`,
    params
  );
  const total = (countRow?.[0] as number) || 0;

  const result = query(
    `SELECT c.id, c.status, c.iniciada_em, c.finalizada_em,
            n.numnota, n.razaosocial, u.username,
            (SELECT COUNT(*) FROM leituras l WHERE l.conferencia_id = c.id) as total_leituras
     FROM conferencias c
     LEFT JOIN notas n ON c.nota_id = n.id
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     WHERE ${where}
     ORDER BY c.iniciada_em DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const columns = ['id', 'status', 'iniciada_em', 'finalizada_em', 'numnota', 'cliente', 'operador', 'total_leituras'];
  const conferencias = result.values.map(row =>
    Object.fromEntries(columns.map((c, i) => [c, row[i]]))
  );

  res.json({ data: conferencias, total, page, limit });
});

router.get('/export', (req: Request, res: Response) => {
  const user = (req as any).user;

  let where = '1=1';
  const params: any[] = [];
  if (user.role !== 'admin') {
    where = 'c.usuario_id = ?';
    params.push(user.id);
  }

  const result = query(
    `SELECT c.id as conferencia_id, c.status, c.iniciada_em, c.finalizada_em,
            n.nunota, n.numnota, n.razaosocial, u.username as operador
     FROM conferencias c
     LEFT JOIN notas n ON c.nota_id = n.id
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     WHERE ${where}
     ORDER BY c.iniciada_em DESC`,
    params
  );

  const columns = ['conferencia_id', 'status', 'iniciada_em', 'finalizada_em', 'nunota', 'numnota', 'cliente', 'operador'];
  const data = result.values.map(row =>
    Object.fromEntries(columns.map((c, i) => [c, row[i]]))
  );

  res.json({ data });
});

router.get('/export-xlsx', (req: Request, res: Response) => {
  const user = (req as any).user;

  let where = '1=1';
  const params: any[] = [];
  if (user.role !== 'admin') {
    where = 'c.usuario_id = ?';
    params.push(user.id);
  }

  const result = query(
    `SELECT c.id as conferencia_id, c.status, c.iniciada_em, c.finalizada_em,
            n.nunota, n.numnota, n.razaosocial, u.username as operador
     FROM conferencias c
     LEFT JOIN notas n ON c.nota_id = n.id
     LEFT JOIN usuarios u ON c.usuario_id = u.id
     WHERE ${where}
     ORDER BY c.iniciada_em DESC`,
    params
  );

  const columns = ['conferencia_id', 'status', 'iniciada_em', 'finalizada_em', 'nunota', 'numnota', 'cliente', 'operador'];
  const rows = result.values.map(row =>
    Object.fromEntries(columns.map((c, i) => [c, row[i]]))
  );

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Conferencias');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="conferencias.xlsx"');
  res.send(buffer);
});

export { router as reportRoutes };
