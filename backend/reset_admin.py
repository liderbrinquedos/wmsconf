import sqlite3
import bcrypt
import sys

# Conecte-se ao banco de dados
try:
    conn = sqlite3.connect('/app/backend/data/conferencia.db')
    cursor = conn.cursor()

    # 1. Deletar o admin existente
    cursor.execute("DELETE FROM usuarios WHERE username = 'admin'")

    # 2. Recriar o admin com a senha 'admin123'
    password = 'admin123'
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    cursor.execute(
        "INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)",
        ('admin', hashed.decode('utf-8'), 'admin')
    )

    conn.commit()
    conn.close()
    print("Usuário 'admin' resetado com sucesso com a senha 'admin123'.")
except Exception as e:
    print(f"Erro: {e}")
    sys.exit(1)
