import { Router } from "express";
import { db, type Task } from "../db.js";

export const tasksRouter = Router();

// GET /api/tasks?status=open&search=foo&assignee_id=1
tasksRouter.get("/", (req, res) => {
  const { status, search, assignee_id } = req.query;

  let sql = "SELECT id, title, status, created_at, assignee_id FROM tasks WHERE 1 = 1";
  const params: unknown[] = [];

  if (typeof status === "string" && status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (typeof search === "string" && search) {
    sql += " AND lower(title) LIKE ?";
    params.push(`%${search.toLowerCase()}%`);
  }

  if (typeof assignee_id === "string" && assignee_id) {
    sql += " AND assignee_id = ?";
    params.push(Number(assignee_id));
  }

  sql += " ORDER BY created_at DESC, id DESC";

  const rows = db.prepare(sql).all(...params) as Task[];
  res.json(rows);
});

// POST /api/tasks  { title, assignee_id }
tasksRouter.post("/", (req, res) => {
  const title = (req.body?.title ?? "").trim();
  const assignee_id = req.body?.assignee_id ? Number(req.body.assignee_id) : null;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const result = db
    .prepare("INSERT INTO tasks (title, status, assignee_id) VALUES (?, 'open', ?)")
    .run(title, assignee_id);

  const created = db
    .prepare("SELECT id, title, status, created_at, assignee_id FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid) as Task;

  res.status(201).json(created);
});

// PATCH /api/tasks/:id  { status, assignee_id }
tasksRouter.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};

  const updates: string[] = [];
  const params: unknown[] = [];

  if (body.status !== undefined) {
    if (body.status !== "open" && body.status !== "done") {
      return res.status(400).json({ error: "status must be 'open' or 'done'" });
    }
    updates.push("status = ?");
    params.push(body.status);
  }

  if (body.assignee_id !== undefined) {
    updates.push("assignee_id = ?");
    params.push(body.assignee_id === null ? null : Number(body.assignee_id));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "no fields to update" });
  }

  params.push(id);
  const sql = `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`;
  const result = db.prepare(sql).run(...params);

  if (result.changes === 0) {
    return res.status(404).json({ error: "task not found" });
  }

  const updated = db
    .prepare("SELECT id, title, status, created_at, assignee_id FROM tasks WHERE id = ?")
    .get(id) as Task;

  res.json(updated);
});
