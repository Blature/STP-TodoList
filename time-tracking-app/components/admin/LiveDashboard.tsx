"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

interface Session {
  id: string;
  employee: { name: string };
  task: { name: string };
  description?: string;
  startTime: string;
}

export default function LiveDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions/active");
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await fetchSessions();
    };
    load();
    const interval = setInterval(load, 30000); // Refresh every 30s
    return () => {
        clearInterval(interval);
        mounted = false;
    };
  }, []);

  if (loading) return <div>Loading live sessions...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4 dark:text-white">Active Sessions</h3>
      
      {sessions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No active sessions.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg dark:text-indigo-200">{session.employee.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Task: <span className="font-medium">{session.task.name}</span>
                  </p>
                  {session.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                      &quot;{session.description}&quot;
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                    Started at {format(new Date(session.startTime), "HH:mm")}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {/* Could add elapsed time here if needed */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
