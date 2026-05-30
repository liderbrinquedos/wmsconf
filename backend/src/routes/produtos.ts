import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query, queryOne, run, save } from '../db/index.js';
import { authMiddleware } from './auth.js';
import XLSX from 'xlsx';

const router = Router();
router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
   const search = (req.query.search as string) || '';
   const page = parseInt(req.query.page as string, 10) || 1;
   const rawLimit = parseInt(req.query.limit as string, 10);
   const limit = rawLimit && rawLimit > 0 ? rawLimit : (rawLimit === 0 ? 0 : 50);
   const hasLimit = limit !== 0;
   const offset = hasLimit ? (page - 1) * (limit > 200 ? 200 : limit) : 0;

   let where = '';
   const params: any[] = [];
   if (search) {
     where = 'WHERE descprod LIKE ? OR codprod LIKE ? OR ean14 LIKE ?';
     params.push(`%${search}%`, `%${search}%`, `%${search}%`);
   }

   const countRow = queryOne(`SELECT COUNT(*) as total FROM produtos ${where}`, params);
   const total = (countRow?.[0] as number) || 0;

   let sql = `SELECT p.id, p.codprod, p.referencia, p.descprod, p.qtdemb, p.ean13, p.ean14, p.updated_at FROM produtos p ${where} ORDER BY p.descprod`;
   if (hasLimit) {
     sql += ' LIMIT ? OFFSET ?';
   }
   const queryParams = hasLimit ? [...params, Math.min(limit, 200), offset] : params;

   const result = query(sql, queryParams);

   const produtos = result.values.map(row =>
     Object.fromEntries(result.columns.map((c, i) => [c, row[i]]))
   );

   res.json({ data: produtos, total, page, limit: hasLimit ? Math.min(limit, 200) : total ? total : 0 });
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

    for (const row of rows) {
      const codprod = String(row.codprod || row.CodProd || '').trim();
      if (!codprod) {
        errors.push(`Linha ${imported + 2}: codprod vazio`);
        continue;
      }

      const referencia = String(row.referencia || row.Referencia || '');
      const descprod = String(row.descprod || row.DescProd || row.descricao || '');
      const qtdemb = parseInt(row.qtdemb || row.QtdEmb || 1, 10);
      const ean13 = String(row.ean13 || row.Ean13 || row.EAN13 || '');
      const ean14 = String(row.ean14 || row.Ean14 || row.EAN14 || '');

      const exists = queryOne('SELECT id FROM produtos WHERE codprod = ?', [codprod]);
      if (exists) {
        run(
          `UPDATE produtos SET referencia=?, descprod=?, qtdemb=?, ean13=?, ean14=?, updated_at=datetime('now') WHERE codprod=?`,
          [referencia, descprod, qtdemb, ean13, ean14, codprod]
        );
      } else {
        run(
          `INSERT INTO produtos (codprod, referencia, descprod, qtdemb, ean13, ean14) VALUES (?, ?, ?, ?, ?, ?)`,
          [codprod, referencia, descprod, qtdemb, ean13, ean14]
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

export { router as produtoRoutes };
