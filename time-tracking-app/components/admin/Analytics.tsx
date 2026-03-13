"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

const COLORS = ["#ef4444", "#f87171", "#fca5a5", "#fecaca", "#dc2626", "#b91c1c"];

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

function formatSecondsToTime(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function Analytics() {
  const { resolvedTheme } = useTheme();
  const [logs, setLogs] = useState<Log[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const tooltipBackground = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#1e293b" : "#e2e8f0";
  const tooltipText = isDark ? "#e2e8f0" : "#0f172a";
  const renderPieLabel = ({ x, y, name, percent }: { x: number; y: number; name: string; percent: number }) => (
    <text x={x} y={y} fill={axisColor} textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );

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
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-end transition-colors duration-300">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Employee</label>
          <select
            className="p-2 border rounded border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
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
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Start Date</label>
          <input
            type="date"
            className="p-2 border rounded border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">End Date</label>
          <input
            type="date"
            className="p-2 border rounded border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm uppercase">Total Hours</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-800 transition-colors duration-300">
           <h3 className="text-slate-500 dark:text-slate-400 text-sm uppercase">Total Tasks</h3>
           <p className="text-3xl font-bold text-slate-900 dark:text-white">{logs.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Hours per Day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBackground, borderColor: tooltipBorder, color: tooltipText }} labelStyle={{ color: tooltipText }} itemStyle={{ color: tooltipText }} />
                <Bar dataKey="hours" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Task Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={renderPieLabel}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: tooltipBackground, borderColor: tooltipBorder, color: tooltipText }} labelStyle={{ color: tooltipText }} itemStyle={{ color: tooltipText }} />
                <Legend wrapperStyle={{ color: axisColor }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Logs Table */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg shadow border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detailed Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-200">Date</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-200">Main Task</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-200">Start Time</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-200">End Time</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-200">Duration</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-200">Useful Duration</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-200">Secondary Tasks</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-200">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/60">
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {format(parseISO(log.startTime), "yyyy-MM-dd")}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {log.mainTask?.name}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {format(parseISO(log.startTime), "HH:mm")}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {format(parseISO(log.endTime), "HH:mm")}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {log.durationMinutes} min
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-mono">
                    {(() => {
                      const totalSeconds = Math.max(
                        Math.floor((parseISO(log.endTime).getTime() - parseISO(log.startTime).getTime()) / 1000),
                        0
                      );
                      const secondarySeconds = (log.secondaryTasks ?? []).reduce(
                        (sum, st) => sum + ((Number(st.minutes) || 0) * 60),
                        0
                      );
                      return formatSecondsToTime(Math.max(totalSeconds - secondarySeconds, 0));
                    })()}
                  </td>
                  <td className="p-4">
                    {log.secondaryTasks && log.secondaryTasks.length > 0 ? (
                      <div className="space-y-1">
                        {log.secondaryTasks.map((st, i) => (
                          <div key={i} className="text-xs bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 p-1 rounded border border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-red-600">{st.type}</span>: {st.minutes}m
                            {st.description && <span className="italic text-slate-500 ml-1">({st.description})</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 text-sm max-w-xs truncate" title={log.description || ""}>
                    {log.description || "-"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
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
