// Türkçe sayı formatı
export const fmt = (n: number | undefined | null, digits = 0) =>
  Number(n || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

// Tarih formatı
export const formatDate = (d: string | Date, withTime = false) => {
  const date = new Date(d);
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  };
  return date.toLocaleDateString("tr-TR", opts);
};

// Saat formatı
export const formatHours = (h?: number) => {
  if (!h) return "0dk";
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  if (hours === 0) return `${mins}dk`;
  if (mins === 0) return `${hours}s`;
  return `${hours}s ${mins}dk`;
};

// Filament renkleri
export const FILAMENT_COLORS: Record<string, string> = {
  PLA: "#3b82f6",
  PETG: "#8b5cf6",
  ABS: "#f59e0b",
  TPU: "#10b981",
  ASA: "#ef4444",
  Resin: "#ec4899",
  Diğer: "#64748b",
  Diger: "#64748b",
};

export const FILAMENTS = ["PLA", "PETG", "ABS", "TPU", "ASA", "Resin", "Diğer"];

// clsx + tailwind sınıf birleştirici (basit versiyon)
export const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");