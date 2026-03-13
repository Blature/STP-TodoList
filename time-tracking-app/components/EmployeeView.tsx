"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

type Employee = { id: string; name: string };
type Task = { id: string; name: string; type: string };
type SecondaryTask = { type: string; minutes: number; description: string };

export default function EmployeeView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [description, setDescription] = useState("");
  
  // Active Session State
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Call Fields
  const [totalCalls, setTotalCalls] = useState("");
  const [answeredCalls, setAnsweredCalls] = useState("");

  // Secondary Tasks
  const [secondaryTasks, setSecondaryTasks] = useState<SecondaryTask[]>([]);
  const [isAddingSecondary, setIsAddingSecondary] = useState(false);
  const [secTaskType, setSecTaskType] = useState("");
  const [secTaskMinutes, setSecTaskMinutes] = useState("");
  const [secTaskDesc, setSecTaskDesc] = useState("");

  // Initial Data Fetch
  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, taskRes, activeRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/tasks"),
          fetch("/api/sessions/active")
        ]);
        const emps = await empRes.json();
        const tsks = await taskRes.json();
        const activeSessions = await activeRes.json();

        setEmployees(emps);
        setTasks(tsks);

        // Check for existing session in localStorage
        const storedEmpId = localStorage.getItem("employeeId");
        if (storedEmpId) {
          const mySession = activeSessions.find((s: any) => s.employeeId === storedEmpId);
          if (mySession) {
            setSelectedEmployee(mySession.employeeId);
            setSelectedTask(mySession.taskId);
            setDescription(mySession.description || "");
            setStartTime(new Date(mySession.startTime));
            setIsActive(true);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      const updateTimer = () => {
        const now = new Date();
        const diff = now.getTime() - new Date(startTime).getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setElapsedTime(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);

  const handleStartTask = async () => {
    if (!selectedEmployee || !selectedTask) {
      alert("Please select Employee and Main Task");
      return;
    }

    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          taskId: selectedTask,
          description
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }

      const session = await res.json();
      localStorage.setItem("employeeId", selectedEmployee);
      setStartTime(new Date(session.startTime));
      setIsActive(true);
    } catch (error) {
      console.error("Failed to start task", error);
      alert("Failed to start task");
    }
  };

  const handleFinishTask = async () => {
    if (!confirm("Are you sure you want to finish this task?")) return;

    // 1. Stop the timer immediately to ensure accuracy
    if (timerInterval) clearInterval(timerInterval);
    setIsActive(false); // Optimistic update to stop UI

    try {
      const res = await fetch("/api/sessions/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          description, // Send updated description
          totalCalls,
          answeredCalls,
          secondaryTasks
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }

      alert("Task finished and report sent!");
      // Reset State
      setIsActive(false);
      setStartTime(null);
      setElapsedTime("00:00:00");
      setSelectedEmployee("");
      setSelectedTask("");
      setDescription("");
      setTotalCalls("");
      setAnsweredCalls("");
      setSecondaryTasks([]);
      if (timerInterval) clearInterval(timerInterval);
      window.location.reload(); // Reload to clear everything cleanly
    } catch (error) {
      console.error("Failed to finish task", error);
      alert("Failed to finish task");
    }
  };

  const addSecondaryTask = () => {
    if (!secTaskType || !secTaskMinutes) {
      alert("Please fill in secondary task details");
      return;
    }
    setSecondaryTasks([
      ...secondaryTasks,
      { type: secTaskType, minutes: parseInt(secTaskMinutes), description: secTaskDesc }
    ]);
    setSecTaskType("");
    setSecTaskMinutes("");
    setSecTaskDesc("");
    setIsAddingSecondary(false);
  };

  const currentTaskType = tasks.find(t => t.id === selectedTask)?.type;
  const isCallTask = currentTaskType === "Call";

  // Calculate Duration Display
  const getMainDuration = () => {
    if (!startTime) return 0;
    const now = new Date();
    const totalMinutes = Math.floor((now.getTime() - new Date(startTime).getTime()) / 60000);
    const secTotal = secondaryTasks.reduce((acc, curr) => acc + curr.minutes, 0);
    return Math.max(totalMinutes - secTotal, 0);
  };

  if (loading) return <div className="p-8 text-center text-xl text-gray-600 dark:text-gray-300">Loading system data...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl mt-8 border border-gray-100 dark:border-gray-700 transition-all">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
        {isActive ? "⏱️ Active Session" : "🚀 Start New Task"}
      </h2>

      {!isActive ? (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Select Employee</label>
              <select
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Choose your name...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Select Task</label>
              <select
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                <option value="">What are you working on?</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>{task.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-center h-full space-y-4">
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">Ready to start?</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Please select your name and the task you are about to begin. The timer will start automatically.
                </p>
             </div>
            <button
              onClick={handleStartTask}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Start Timer
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center py-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 font-mono mb-4 tracking-wider">
              {elapsedTime}
            </div>
            <div className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              Started at: {startTime && format(startTime, "HH:mm:ss")}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
               <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Description / Notes</label>
               <textarea
                 className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[120px]"
                 placeholder="Optional: Add details about what you are doing..."
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
               />
            </div>

            <div className="space-y-4">
              {isCallTask && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">📞 Call Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Total Calls</label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={totalCalls}
                        onChange={(e) => setTotalCalls(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Answered</label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={answeredCalls}
                        onChange={(e) => setAnsweredCalls(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Tasks */}
          <div className="border-t-2 pt-6 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Secondary Tasks</h3>
              {!isAddingSecondary && (
                <button
                  onClick={() => setIsAddingSecondary(true)}
                  className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1 rounded transition-colors"
                >
                  + Add Secondary Task
                </button>
              )}
            </div>
            
            {secondaryTasks.length > 0 ? (
              <div className="grid gap-3 mb-4">
                {secondaryTasks.map((st, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-200">{st.type}</span>
                      <span className="text-gray-500 dark:text-gray-400 mx-2">|</span>
                      <span className="text-sm font-mono bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">{st.minutes} mins</span>
                      {st.description && <span className="text-sm text-gray-500 ml-2">- {st.description}</span>}
                    </div>
                    <button
                      onClick={() => setSecondaryTasks(secondaryTasks.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !isAddingSecondary && <p className="text-gray-400 italic text-sm">No secondary tasks added yet.</p>
            )}

            {isAddingSecondary && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 animate-in fade-in slide-in-from-top-2">
                <h4 className="font-semibold mb-3 dark:text-gray-200">Add New Activity</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <select
                    className="w-full p-3 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    value={secTaskType}
                    onChange={(e) => setSecTaskType(e.target.value)}
                  >
                    <option value="">Select Activity Type</option>
                    {tasks.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Duration (Minutes)"
                    className="w-full p-3 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    value={secTaskMinutes}
                    onChange={(e) => setSecTaskMinutes(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Description (Optional)"
                    className="w-full p-3 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    value={secTaskDesc}
                    onChange={(e) => setSecTaskDesc(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setIsAddingSecondary(false)} className="text-gray-600 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                  <button onClick={addSecondaryTask} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow transition-colors">Add Activity</button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleFinishTask}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 mt-8"
          >
            ✅ Finish Task & Submit Report
          </button>
        </div>
      )}
    </div>
  );
}
