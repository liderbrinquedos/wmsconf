import { Router, Request, Response } from 'express';
import { query, queryOne, run, lastInsertRowId, save } from '../db/index.js';
import { authMiddleware } from './auth.js';
import XLSX from 'xlsx';

const router = Router();
router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const status = (req.query.status as string) || '';
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 200);
  const offset = (page - 1) * limit;

  let where = ['1=1'];
  const params: any[] = [];

  if (search) {
    where.push('(n.numnota LIKE ? OR n.razaosocial LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    where.push('n.status = ?');
    params.push(status);
  }

  const whereClause = where.join(' AND ');

  const countRow = queryOne(
    `SELECT COUNT(*) FROM notas n WHERE ${whereClause}`,
    params
  );
  const total = (countRow?.[0] as number) || 0;

  const result = query(
    `SELECT n.id, n.nunota, n.numnota, n.codparc, n.razaosocial, n.status, n.conferida_em, n.conferida_por, n.created_at FROM notas n WHERE ${whereClause} ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const notas = result.values.map(row => {
    const nota = Object.fromEntries(result.columns.map((c, i) => [c, row[i]])) as any;
    nota.itens = [];
    return nota;
  });

  if (notas.length > 0) {
    const notaIds = notas.map((n: any) => n.id);
    const placeholders = notaIds.map(() => '?').join(',');
    const itensResult = query(
      `SELECT * FROM itens_nota WHERE nota_id IN (${placeholders})`,
      notaIds
    );

    const itensByNota = new Map<number, any[]>();
    for (const row of itensResult.values) {
      const item = Object.fromEntries(itensResult.columns.map((col, i) => [col, row[i]]));
      const notaId = item.nota_id as number;
      if (!itensByNota.has(notaId)) {
        itensByNota.set(notaId, []);
      }
      itensByNota.get(notaId)!.push(item);
    }

    for (const nota of notas) {
      nota.itens = itensByNota.get(nota.id) || [];
    }
  }

  res.json({ data: notas, total, page, limit });
});

router.get('/:nunota', (req: Request, res: Response) => {
  const nunota = parseInt(req.params.nunota, 10);

  const notaRow = queryOne(
    'SELECT id, nunota, numnota, codparc, razaosocial, status, conferida_em, conferida_por, created_at FROM notas WHERE nunota = ?',
    [nunota]
  );
  if (!notaRow) {
    return res.status(404).json({ error: 'Nota nao encontrada' });
  }

  const notaColumns = ['id', 'nunota', 'numnota', 'codparc', 'razaosocial', 'status', 'conferida_em', 'conferida_por', 'created_at'];
  const nota: any = Object.fromEntries(notaColumns.map((c, i) => [c, notaRow[i]]));

  const itensResult = query('SELECT id, nota_id, codprod, referencia, qtd FROM itens_nota WHERE nota_id = ?', [nota.id]);
  nota.itens = itensResult.values.map(row =>
    Object.fromEntries(itensResult.columns.map((c, i) => [c, row[i]]))
  );

  res.json({ data: nota });
});

router.post('/import', (req: Request, res: Response) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Arquivo nao enviado' });
    }

    const file = req.files.file as any;
    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    let imported = 0;
    let errors: string[] = [];

    const notasMap = new Map<number, any[]>();

    for (const row of rows) {
      const nunota = parseInt(row.nunota || row.Nunota || 0, 10);
      if (!nunota) {
        errors.push(`Linha ${imported + 2}: nunota invalido`);
        continue;
      }

      if (!notasMap.has(nunota)) {
        notasMap.set(nunota, []);
      }

      notasMap.get(nunota)!.push({
        numnota: String(row.numnota || row.NumNota || row.numnota || ''),
        codparc: String(row.codparc || row.CodParc || ''),
        razaosocial: String(row.razaosocial || row.RazaoSocial || ''),
        referencia: String(row.referencia || row.Referencia || ''),
        qtd: parseInt(row.qtd || row.Qtd || 0, 10),
        codprod: String(row.codprod || row.CodProd || ''),
      });
    }

    for (const [nunota, itens] of notasMap) {
      const firstItem = itens[0];
      const exists = queryOne('SELECT id FROM notas WHERE nunota = ?', [nunota]);

      let notaId: number;
      if (exists) {
        notaId = exists[0] as number;
        run('DELETE FROM itens_nota WHERE nota_id = ?', [notaId]);
      } else {
        run(
          `INSERT INTO notas (nunota, numnota, codparc, razaosocial) VALUES (?, ?, ?, ?)`,
          [nunota, firstItem.numnota, firstItem.codparc, firstItem.razaosocial]
        );
        notaId = lastInsertRowId();
      }

      for (const item of itens) {
        run(
          `INSERT INTO itens_nota (nota_id, codprod, referencia, qtd) VALUES (?, ?, ?, ?)`,
          [notaId, item.codprod, item.referencia, item.qtd]
        );
      }
      imported++;
    }

    save();
    res.json({ imported, errors: errors.slice(0, 50) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao importar' });
  }
});

export { router as notaRoutes };
