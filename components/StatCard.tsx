import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  trend?: { value: string; positive: boolean };
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "var(--primary)",
  trend,
}: StatCardProps) {
  return (
    <div className="card hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <div
            className="text-[11px] font-bold px-2 py-1 rounded-full"
            style={{
              background: trend.positive
                ? "var(--success-soft)"
                : "var(--danger-soft)",
              color: trend.positive ? "var(--success)" : "var(--danger)",
            }}
          >
            {trend.value}
          </div>
        )}
      </div>

      <div
        className="text-[28px] font-extrabold leading-tight tracking-tight"
        style={{ color: "var(--text)" }}
      >
        {value}
      </div>
      <div className="text-[12px] font-medium mt-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      {sub && (
        <div className="text-[11px] mt-0.5" style={{ color: "var(--text-faint)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}