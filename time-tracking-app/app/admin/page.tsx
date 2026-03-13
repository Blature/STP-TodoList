"use client";

import { useState } from "react";
import ManageEntities from "@/components/admin/ManageEntities";
import LiveDashboard from "@/components/admin/LiveDashboard";
import Analytics from "@/components/admin/Analytics";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("live");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Admin" && password === "Admin") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid Credentials");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <form onSubmit={handleLogin} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-lg shadow-md w-full max-w-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Username</label>
              <input
                type="text"
                className="w-full p-2 border rounded border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("live")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === "live"
              ? "bg-red-600 text-white"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Live Dashboard
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === "manage"
              ? "bg-red-600 text-white"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Manage Entities
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === "analytics"
              ? "bg-red-600 text-white"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="ml-auto text-red-600 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </div>

      <div className="min-h-[50vh]">
        {activeTab === "live" && <LiveDashboard />}
        {activeTab === "manage" && <ManageEntities />}
        {activeTab === "analytics" && <Analytics />}
      </div>
    </div>
  );
}
