import { setTaskAssignee, type Task, type User } from "../api.js";

export function TaskList({
  tasks,
  onToggle,
  users,
  onTaskUpdated,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
  users: User[];
  onTaskUpdated: () => void;
}) {
  if (tasks.length === 0) {
    return <p style={{ color: "#888" }}>No tasks.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <input
            type="checkbox"
            checked={task.status === "done"}
            onChange={() => onToggle(task)}
          />
          <span
            style={{
              textDecoration: task.status === "done" ? "line-through" : "none",
              color: task.status === "done" ? "#999" : "#222",
              flex: 1,
            }}
          >
            {task.title}
          </span>
          <select
            value={task.assignee_id || ""}
            onChange={async (e) => {
              const newAssigneeId = e.target.value ? Number(e.target.value) : null;
              await setTaskAssignee(task.id, newAssigneeId);
              onTaskUpdated();
            }}
            style={{ padding: 4 }}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}
