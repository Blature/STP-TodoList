"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

interface Log {
  id: string;
  durationMinutes: number;
  startTime: string;
  mainTask: { name: string };
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Employee</label>
          <select
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Date</label>
          <input
            type="date"
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Date</label>
          <input
            type="date"
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="ml-auto">
          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Hours</span>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {totalHours.toFixed(1)} h
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading Analytics...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Task Distribution */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-96">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Task Distribution (Minutes)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Timeline */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-96">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Daily Work Hours</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#8884d8" name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
