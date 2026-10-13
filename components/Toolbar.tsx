"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Search, Bell, Menu } from "lucide-react";

export default function Toolbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial = saved || "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");

    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const openMobileMenu = () => {
    // Sidebar'ın mobil menüsünü aç
    const btn = document.getElementById("mobile-menu-trigger") as HTMLButtonElement;
    if (btn) btn.click();
  };

  if (!mounted) {
    return (
      <div
        className="h-[60px] border-b"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border)",
        }}
      />
    );
  }

  return (
    <header
      className="h-[60px] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 border-b backdrop-blur-md gap-3"
      style={{
        background: "color-mix(in srgb, var(--bg-elevated) 85%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      {/* Sol taraf: hamburger (mobil) + arama */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isMobile && (
          <button
            onClick={openMobileMenu}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-subtle)] shrink-0"
            style={{ color: "var(--text)" }}
          >
            <Menu size={20} />
          </button>
        )}

        {/* Arama */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-faint)" }}
          />
          <input
            type="text"
            placeholder="Ürün, satış ara..."
            className="input pl-10 h-9 text-[13px]"
          />
        </div>
      </div>

      {/* Sağdaki butonlar */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-subtle)]"
          style={{ color: "var(--text-muted)" }}
        >
          <Bell size={17} />
        </button>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-subtle)]"
          style={{ color: "var(--text-muted)" }}
          title={theme === "light" ? "Koyu temaya geç" : "Açık temaya geç"}
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[12px]"
          style={{ background: "var(--primary)", color: "white" }}
        >
          YP
        </div>
      </div>
    </header>
  );
}