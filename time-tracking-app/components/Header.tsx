"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-navy-800 shadow-md border-b dark:border-navy-700 transition-colors">
      <Link href="/">
        <div className="flex items-center gap-2">
          <div className="bg-red-primary p-2 rounded-lg">
            <span className="text-white font-bold text-lg">STP</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-navy-light hidden sm:block">
            Daily Report
          </h1>
        </div>
      </Link>
      
      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-navy-800" />
            )}
          </button>
        )}
        
        <Link href="/admin">
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
            aria-label="Admin Login"
          >
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </Link>
      </div>
    </header>
  );
}
