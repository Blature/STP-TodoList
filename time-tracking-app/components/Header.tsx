"use client";

import { User } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900 shadow-md border-b border-slate-800">
      <Link href="/">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-2 rounded-lg">
            <span className="text-white font-bold text-lg">STP</span>
          </div>
          <h1 className="text-xl font-bold text-white hidden sm:block">
            Daily Report
          </h1>
        </div>
      </Link>
      
      <div className="flex items-center">
        <Link href="/admin">
          <button
            className="p-2 rounded-full hover:bg-slate-800 transition-colors duration-300"
            aria-label="Admin Login"
          >
            <User className="w-5 h-5 text-slate-300" />
          </button>
        </Link>
      </div>
    </header>
  );
}
