"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";

export default function ManageEntities() {
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [tasks, setTasks] = useState<{ id: string; name: string; type: string }[]>([]);
  const [newEmpName, setNewEmpName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskType, setNewTaskType] = useState("Normal");

  const fetchData = async () => {
    try {
      const [empRes, taskRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/tasks")
      ]);
      
      if (empRes.ok) setEmployees(await empRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    // fetchData() is async, but we don't await it here.
    // The lint error "Calling setState synchronously within an effect" might be because of how fetchData is implemented.
    // It calls setEmployees/setTasks.
    // But those are async fetch calls.
    // Let's wrap it.
    let mounted = true;
    const load = async () => {
      await fetchData();
    };
    load();
    return () => { mounted = false; };
  }, []);

  const addEmployee = async () => {
    if (!newEmpName) return;
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newEmpName })
      });
      if (res.ok) {
        setNewEmpName("");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add employee", error);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm("Delete employee?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete employee", error);
    }
  };

  const addTask = async () => {
    if (!newTaskName) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTaskName, type: newTaskType })
      });
      if (res.ok) {
        setNewTaskName("");
        setNewTaskType("Normal");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Employees */}
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Employees</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="New Employee Name"
            className="flex-1 p-2 border rounded border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
            value={newEmpName}
            onChange={(e) => setNewEmpName(e.target.value)}
          />
          <button
            onClick={addEmployee}
            className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {employees.map((emp) => (
            <li key={emp.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-slate-800 dark:text-slate-200">{emp.name}</span>
              <button
                onClick={() => deleteEmployee(emp.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tasks */}
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Tasks</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="New Task Name"
            className="flex-1 p-2 border rounded border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
          />
          <select
            className="p-2 border rounded border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
            value={newTaskType}
            onChange={(e) => setNewTaskType(e.target.value)}
          >
            <option value="Normal">Normal</option>
            <option value="Call">Call</option>
          </select>
          <button
            onClick={addTask}
            className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {tasks.map((task) => (
            <li key={task.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{task.name}</span>
                <span className="text-xs text-slate-500 ml-2">({task.type})</span>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
