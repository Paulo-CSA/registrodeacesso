import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("cpd_access.db");

// Initialize database
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
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/logs", (req, res) => {
    try {
      const logs = db.prepare("SELECT * FROM access_logs ORDER BY created_at DESC").all();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.post("/api/logs", (req, res) => {
    const { visitor_name, date, entry_time, exit_time, activity, impact, next_steps } = req.body;
    
    if (!visitor_name || !date || !entry_time || !activity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO access_logs (visitor_name, date, entry_time, exit_time, activity, impact, next_steps, validated)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `);
      const result = stmt.run(visitor_name, date, entry_time, exit_time, activity, impact, next_steps);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to save log" });
    }
  });

  app.patch("/api/logs/:id/validate", (req, res) => {
    const { validated } = req.body;
    try {
      db.prepare("UPDATE access_logs SET validated = ? WHERE id = ?").run(validated ? 1 : 0, req.params.id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update validation status" });
    }
  });

  app.delete("/api/logs/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM access_logs WHERE id = ?").run(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete log" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
