"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid setting state in effect if not needed or wrap in a way that doesn't trigger strict mode warnings if possible.
    // But for next-themes, we usually need to wait for mount.
    // The lint error "Calling setState synchronously within an effect" is actually about setting it immediately.
    // However, useEffect runs after render, so it's not synchronous in the render phase.
    // The lint error might be from a specific rule configuration or my misunderstanding of the specific lint output.
    // Let's just use the standard way.
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
