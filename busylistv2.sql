BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "lists" (
	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	"listName"	TEXT NOT NULL,
	"favourite"	INTEGER NOT NULL DEFAULT 0 CHECK("favourite"=0 or "favourite"=1),
	"created"	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "tasks" (
	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	"listId"	INTEGER NOT NULL,
	"taskName"	TEXT NOT NULL,
	"done"	INTEGER NOT NULL DEFAULT 0 CHECK("done"=0 or "done"=1),
	"note"	TEXT,
	"tag"	TEXT,
	"created"	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY("listId") REFERENCES "lists"("id") ON DELETE CASCADE
);
INSERT INTO "lists" ("id","listName","favourite","created") VALUES (1,'Spotkanie z Andrzejem',0,'2020-06-25 11:06:47');
INSERT INTO "lists" ("id","listName","favourite","created") VALUES (2,'Lista zakupów',0,'2020-06-25 11:07:02');
INSERT INTO "lists" ("id","listName","favourite","created") VALUES (3,'Mobilki',0,'2020-06-25 11:07:21');
INSERT INTO "lists" ("id","listName","favourite","created") VALUES (4,'Prace w ogrodzie',0,'2020-06-25 11:07:28');

INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (1,1,'Przygotowanie sprawozdania końcowego',0,'Muszę koniecznie przygotować sprawozdanie, które przedstawia wyniki naszego departamentu finansów firmy','busywork','2020-06-25 11:08:41');
INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (2,1,'Organizacja miejsca spotkania',1,'Muszę znaleźć biuro odpowiednio wielkie na nasz zespół','busywork','2020-06-25 11:10:07');
INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (3,2,'Świeczki',1,NULL,NULL,'2020-06-25 11:11:12');
INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (4,2,'Tort urodzinowy',0,NULL,NULL,'2020-06-25 11:11:25');
INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (5,2,'Posypka na tort',1,'Owocowa',NULL,'2020-06-25 11:12:02');
INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (6,3,'Interfejs',1,'UI Użytkownika','busywork','2020-06-25 11:12:33');
INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (7,3,'Baza danych',1,'Połączenie z bazą SQLite','busywork','2020-06-25 11:13:15');
INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (8,3,'API Sieciowe',1,'Bored API świetnie będzie pasował do mojego projektu','busywork','2020-06-25 11:13:45');
INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (9,3,'Inne funkcjonalności',1,'Muszę dodać różne rzeczy jak dodawanie/edycja/przegląd opcji listy/zadania, automatyczne odświeżanie list też by się przydało','busywork','2020-06-25 11:14:39');
INSERT INTO "tasks" ("id","listId","taskName","done","note","tag","created") VALUES (10,3,'Sprawozdanie',0,'Sprawozdanie zawierające udokumentowanie zdjęciami i kodem zaimplementowane funkcjonalności','diy','2020-06-25 11:15:15');

COMMIT;
