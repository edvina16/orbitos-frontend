import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });

  // Fetch tasks from backend
  const fetchTasks = () => {
    fetch("http://localhost:5000/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Failed to fetch tasks:", err);
        setTasks([]);
      });
  };

  useEffect(fetchTasks, []);

  // Handle form changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = e => {
    e.preventDefault();
    fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (res.ok) {
          setForm({ title: "", content: "" });
          fetchTasks();
        }
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">My Tasks</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow p-4 max-w-md mx-auto mb-8"
      >
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Content"
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Task
        </button>
      </form>
      <div className="max-w-md mx-auto">
        {tasks.length === 0 && (
          <div className="bg-white rounded shadow p-4 mb-3 text-lg text-black">
            No tasks found.
          </div>
        )}
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded shadow p-4 mb-3 text-black">
            <div className="font-bold text-lg">{task.title}</div>
            <div>{task.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
