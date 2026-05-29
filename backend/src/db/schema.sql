CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operador',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codprod TEXT UNIQUE NOT NULL,
    referencia TEXT DEFAULT '',
    descprod TEXT NOT NULL,
    qtdemb INTEGER NOT NULL DEFAULT 1,
    ean13 TEXT DEFAULT '',
    ean14 TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nunota INTEGER UNIQUE NOT NULL,
    numnota TEXT NOT NULL,
    codparc TEXT NOT NULL,
    razaosocial TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    conferida_em TEXT,
    conferida_por INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (conferida_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS itens_nota (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nota_id INTEGER NOT NULL,
    codprod TEXT NOT NULL,
    referencia TEXT DEFAULT '',
    qtd INTEGER NOT NULL,
    FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conferencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nota_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    iniciada_em TEXT DEFAULT (datetime('now')),
    finalizada_em TEXT,
    FOREIGN KEY (nota_id) REFERENCES notas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS leituras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conferencia_id INTEGER NOT NULL,
    codprod TEXT NOT NULL,
    ean_lido TEXT NOT NULL,
    qtd_emb INTEGER NOT NULL,
    criada_em TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (conferencia_id) REFERENCES conferencias(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS locks (
    nota_id INTEGER PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    iniciado_em TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (nota_id) REFERENCES notas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_notas_status ON notas(status);
CREATE INDEX IF NOT EXISTS idx_notas_nunota ON notas(nunota);
CREATE INDEX IF NOT EXISTS idx_produtos_ean14 ON produtos(ean14);
CREATE INDEX IF NOT EXISTS idx_conferencias_nota ON conferencias(nota_id);