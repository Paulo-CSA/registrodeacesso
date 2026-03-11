import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database("cpd_access.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_name TEXT NOT NULL,
    date TEXT NOT NULL,
    entry_time TEXT NOT NULL,
    exit_time TEXT,
    activity TEXT NOT NULL,
    impact TEXT,
    next_steps TEXT,
    validated INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get("/api/logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM access_logs ORDER BY date DESC, entry_time DESC").all();
    res.json(logs);
  });

  app.post("/api/logs", (req, res) => {
    const { visitor_name, date, entry_time, exit_time, activity, impact, next_steps } = req.body;
    const stmt = db.prepare("INSERT INTO access_logs (visitor_name, date, entry_time, exit_time, activity, impact, next_steps) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const result = stmt.run(visitor_name, date, entry_time, exit_time, activity, impact, next_steps);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  app.patch("/api/logs/:id/validate", (req, res) => {
    const { validated } = req.body;
    db.prepare("UPDATE access_logs SET validated = ? WHERE id = ?").run(validated ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/logs/:id", (req, res) => {
    try {
      const { id } = req.params;
      const result = db.prepare("DELETE FROM access_logs WHERE id = ?").run(id);
      if (result.changes > 0) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Registro não encontrado" });
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(3000, "0.0.0.0", () => console.log("Servidor rodando na porta 3000"));
}
startServer();