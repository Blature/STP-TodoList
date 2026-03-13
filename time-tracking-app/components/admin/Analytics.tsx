"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

interface Log {
  id: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  mainTask: { name: string };
  secondaryTasks: { type: string; minutes: number; description?: string }[] | null;
  description: string | null;
}

interface Employee {
  id: string;
  name: string;
}

export default function Analytics() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Wrap async call
    const loadEmployees = async () => {
      try {
        const res = await fetch("/api/employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
        setLoading(true);
        try {
          const query = new URLSearchParams({
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString()
          });
          if (selectedEmployee) query.append("employeeId", selectedEmployee);
    
          const res = await fetch(`/api/analytics?${query.toString()}`);
          const data = await res.json();
          if (mounted) setLogs(data);
        } catch (error) {
          console.error("Failed to fetch analytics", error);
        } finally {
          if (mounted) setLoading(false);
        }
    };
    
    fetchAnalytics();
    return () => { mounted = false; };
  }, [selectedEmployee, startDate, endDate]);

  // Process Data for Charts
  const taskDistribution = logs.reduce((acc: Record<string, number>, log: Log) => {
    const taskName = log.mainTask?.name || "Unknown";
    acc[taskName] = (acc[taskName] || 0) + log.durationMinutes;
    return acc;
  }, {});

  const pieData = Object.keys(taskDistribution).map(name => ({
    name,
    value: taskDistribution[name]
  }));

  const dailyHours = logs.reduce((acc: Record<string, number>, log: Log) => {
    const day = format(parseISO(log.startTime), "yyyy-MM-dd");
    acc[day] = (acc[day] || 0) + (log.durationMinutes / 60);
    return acc;
  }, {});

  const barData = Object.keys(dailyHours).map(day => ({
    date: day,
    hours: parseFloat(dailyHours[day].toFixed(2))
  })).sort((a, b) => a.date.localeCompare(b.date));

  const totalHours = logs.reduce((sum, log) => sum + log.durationMinutes, 0) / 60;

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow border dark:border-navy-700 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-navy-light">Employee</label>
          <select
            className="p-2 border rounded dark:bg-navy-900 dark:border-navy-700 dark:text-white"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-navy-light">Start Date</label>
          <input
            type="date"
            className="p-2 border rounded dark:bg-navy-900 dark:border-navy-700 dark:text-white"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-navy-light">End Date</label>
          <input
            type="date"
            className="p-2 border rounded dark:bg-navy-900 dark:border-navy-700 dark:text-white"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow border dark:border-navy-700">
          <h3 className="text-gray-500 dark:text-muted text-sm uppercase">Total Hours</h3>
          <p className="text-3xl font-bold dark:text-navy-light">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow border dark:border-navy-700">
           <h3 className="text-gray-500 dark:text-muted text-sm uppercase">Total Tasks</h3>
           <p className="text-3xl font-bold dark:text-navy-light">{logs.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow border dark:border-navy-700">
          <h3 className="text-lg font-bold mb-4 dark:text-navy-light">Hours per Day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#e63946" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow border dark:border-navy-700">
          <h3 className="text-lg font-bold mb-4 dark:text-navy-light">Task Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Logs Table */}
      <div className="bg-white dark:bg-navy-800 rounded-lg shadow border dark:border-navy-700 overflow-hidden">
        <div className="p-6 border-b dark:border-navy-700">
          <h3 className="text-lg font-bold dark:text-navy-light">Detailed Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-navy-900">
              <tr>
                <th className="p-4 font-semibold text-gray-600 dark:text-navy-light">Date</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-navy-light">Main Task</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-navy-light">Start Time</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-navy-light">Duration</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-navy-light">Secondary Tasks</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-navy-light">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-navy-900/50">
                  <td className="p-4 dark:text-gray-300">
                    {format(parseISO(log.startTime), "yyyy-MM-dd")}
                  </td>
                  <td className="p-4 dark:text-gray-300">
                    <span className="font-medium text-navy-800 dark:text-white">
                      {log.mainTask?.name}
                    </span>
                  </td>
                  <td className="p-4 dark:text-gray-300">
                    {format(parseISO(log.startTime), "HH:mm")}
                  </td>
                  <td className="p-4 dark:text-gray-300">
                    {log.durationMinutes} min
                  </td>
                  <td className="p-4">
                    {log.secondaryTasks && log.secondaryTasks.length > 0 ? (
                      <div className="space-y-1">
                        {log.secondaryTasks.map((st, i) => (
                          <div key={i} className="text-xs bg-gray-100 dark:bg-navy-900 dark:text-gray-300 p-1 rounded border dark:border-navy-700">
                            <span className="font-bold text-red-500">{st.type}</span>: {st.minutes}m
                            {st.description && <span className="italic text-gray-500 ml-1">({st.description})</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4 dark:text-gray-300 text-sm max-w-xs truncate" title={log.description || ""}>
                    {log.description || "-"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-muted">
                    No logs found for selected criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
