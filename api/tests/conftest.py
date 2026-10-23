import os

# Precisa existir antes de importar a aplicação. O engine é preguiçoso:
# nenhuma conexão real é aberta nos testes unitários.
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://teste:teste@localhost:5432/teste")
