import { useCallback, useEffect, useState } from "react";
import { fetchTasks, setTaskStatus, fetchUsers, type Task, type User } from "./api.js";
import { TaskList } from "./components/TaskList.js";
import { NewTaskForm } from "./components/NewTaskForm.js";

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const load = useCallback(() => {
    fetchTasks({ status, search, assignee_id: assigneeId }).then(setTasks);
  }, [status, search, assigneeId]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchTasks({ status, search, assignee_id: assigneeId }).then((data) => {
      if (!ignore) setTasks(data);
    });
    return () => {
      ignore = true;
    };
  }, [status, search, assigneeId]);

  async function handleToggle(task: Task) {
    await setTaskStatus(task.id, task.status === "done" ? "open" : "done");
    load();
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui, sans-serif", padding: "0 16px" }}>
      <h1>TeamTasks</h1>

      <NewTaskForm onCreated={load} users={users} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          style={{ flex: 1, padding: 8 }}
        />
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
      </div>

      <TaskList tasks={tasks} onToggle={handleToggle} users={users} onTaskUpdated={load} />
    </div>
  );
}
