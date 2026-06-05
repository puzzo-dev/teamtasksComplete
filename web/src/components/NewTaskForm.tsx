import { useState } from "react";
import { createTask, type User } from "../api.js";

export function NewTaskForm({ onCreated, users }: { onCreated: () => void; users: User[] }) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const aId = assigneeId ? Number(assigneeId) : undefined;
    await createTask(title.trim(), aId);
    setTitle("");
    setAssigneeId("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
        style={{ flex: 1, padding: 8 }}
      />
      <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={{ padding: 8 }}>
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
      <button type="submit" style={{ padding: "8px 16px" }}>
        Add
      </button>
    </form>
  );
}
