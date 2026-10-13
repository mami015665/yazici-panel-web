"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Receipt,
  Archive,
  Plus,
  Printer,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/products", label: "Katalog", icon: Package },
  { href: "/sales", label: "Satışlar", icon: Receipt },
  { href: "/archived", label: "Arşiv", icon: Archive },
];

const QUICK_ACTIONS = [
  { href: "/add/product", label: "Ürün Ekle", icon: Plus },
  { href: "/add/sale", label: "Satış Ekle", icon: Plus },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Ekran boyutunu izle
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // LocalStorage'dan daraltma durumunu oku
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  // Rota değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  // ── MOBİL GÖRÜNÜM ──
  if (isMobile) {
    return (
      <>
        {/* Hamburger buton (toolbar'a yerleştirilecek - App layout'ta) */}
        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Slide-in menü */}
        <aside
          className={cn(
            "fixed top-0 left-0 h-screen z-50 flex flex-col border-r transition-transform duration-250",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{
            width: 260,
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
          }}
        >
          {/* Kapat butonu */}
          <div className="flex items-center justify-between px-4 h-[60px] border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--primary)" }}
              >
                <Printer size={18} color="white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[13px]" style={{ color: "var(--text)" }}>
                  Yazıcı Paneli
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  3D Baskı Takip
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-subtle)]"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={18} />
            </button>
          </div>

          <NavItems pathname={pathname} collapsed={false} />

          <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="text-[10px] text-center" style={{ color: "var(--text-faint)" }}>
              v1.0.0
            </div>
          </div>
        </aside>

        {/* Mobile toggle button'u (sadece DOM'da, App.tsx'te gösterilecek) */}
        <button
          id="mobile-menu-trigger"
          onClick={() => setMobileOpen(true)}
          style={{ display: "none" }}
        />
      </>
    );
  }

  // ── MASAÜSTÜ GÖRÜNÜM ──
  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r transition-all duration-200 shrink-0",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[60px] border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--primary)" }}
        >
          <Printer size={18} color="white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[13px] truncate" style={{ color: "var(--text)" }}>
              Yazıcı Paneli
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              3D Baskı Takip
            </span>
          </div>
        )}
      </div>

      <NavItems pathname={pathname} collapsed={collapsed} />

      <button
        onClick={toggle}
        className="m-3 p-2 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-subtle)]"
        style={{ color: "var(--text-muted)" }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}

// ── Nav items (her iki görünümde ortak) ──
function NavItems({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  return (
    <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-[var(--bg-subtle)]"
            style={{
              background: isActive ? "var(--primary-soft)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            {!collapsed && (
              <span className="text-[13px]" style={{ fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
            )}
          </Link>
        );
      })}

      <div className="my-2 border-t" style={{ borderColor: "var(--border)" }} />

      {!collapsed && (
        <div
          className="text-[10px] font-bold uppercase tracking-wider px-3 py-2"
          style={{ color: "var(--text-faint)" }}
        >
          Hızlı İşlem
        </div>
      )}
      {QUICK_ACTIONS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-[var(--bg-subtle)]"
            style={{
              background: isActive ? "var(--primary-soft)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            <Icon size={18} />
            {!collapsed && (
              <span className="text-[13px] font-medium">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}