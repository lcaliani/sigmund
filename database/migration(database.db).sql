BEGIN TRANSACTION;
DROP TABLE IF EXISTS "sessao";
CREATE TABLE IF NOT EXISTS "sessao" (
	"id"	INTEGER NOT NULL UNIQUE,
	"descricao"	TEXT,
	"data_hora"	TEXT NOT NULL,
	"id_paciente"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "roteiro_de_anamnese";
CREATE TABLE IF NOT EXISTS "roteiro_de_anamnese" (
	"id"	INTEGER NOT NULL UNIQUE,
	"pergunta"	TEXT NOT NULL,
	"status"	INTEGER NOT NULL DEFAULT 1,
	"data_cadastro"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "respostas_do_roteiro_de_anamnese";
CREATE TABLE IF NOT EXISTS "respostas_do_roteiro_de_anamnese" (
	"id"	INTEGER NOT NULL UNIQUE,
	"id_roteiro"	INTEGER NOT NULL,
	"id_paciente"	INTEGER NOT NULL,
	"resposta"	BLOB,
	"data_cadastro"	NUMERIC DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY("id_paciente") REFERENCES "paciente"("id"),
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("id_roteiro") REFERENCES "roteiro_de_anamnese"("id")
);
DROP TABLE IF EXISTS "paciente";
CREATE TABLE IF NOT EXISTS "paciente" (
	"id"	INTEGER NOT NULL UNIQUE,
	"nome"	TEXT NOT NULL,
	"nome_pai"	TEXT,
	"nome_mae"	TEXT,
	"data_nascimento"	TEXT NOT NULL,
	"cidade"	TEXT NOT NULL,
	"endereco"	TEXT NOT NULL,
	"data_cadastro"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"status"	INTEGER NOT NULL DEFAULT 1,
	PRIMARY KEY("id" AUTOINCREMENT)
);

COMMIT;
