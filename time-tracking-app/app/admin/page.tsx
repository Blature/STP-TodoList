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
        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Username</label>
              <input
                type="text"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold transition-colors"
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
      <div className="flex flex-wrap gap-4 border-b dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab("live")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === "live"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Live Dashboard
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === "manage"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Manage Entities
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === "analytics"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="ml-auto text-red-500 hover:text-red-700 font-medium"
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
