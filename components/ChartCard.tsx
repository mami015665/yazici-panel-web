"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { COLORS } from "@/lib/theme";
import { fmt } from "@/lib/utils";

interface ChartCardProps {
  daily: any[];
  monthly: any[];
}

export default function ChartCard({ daily, monthly }: ChartCardProps) {
  const [range, setRange] = useState<"7" | "30">("7");
  const data = range === "7" ? daily : monthly;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
            📊 Üretim & Satış Trendi
          </h3>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {range === "7" ? "Son 7 gün" : "Son 30 gün"}
          </p>
        </div>

        {/* Segment */}
        <div
          className="flex gap-1 p-1 rounded-lg"
          style={{ background: "var(--bg-subtle)" }}
        >
          {(["7", "30"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all"
              style={{
                background: range === r ? "var(--primary)" : "transparent",
                color: range === r ? "white" : "var(--text-muted)",
              }}
            >
              {r === "7" ? "7 Gün" : "30 Gün"}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div
          className="flex items-center justify-center h-[240px] text-[13px]"
          style={{ color: "var(--text-faint)" }}
        >
          Bu aralıkta veri yok
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--text)",
              }}
              formatter={(value: any) => [fmt(value), ""]}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Gelir"
              stroke={COLORS.success}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Kâr"
              stroke={COLORS.profit}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="cost"
              name="Maliyet"
              stroke={COLORS.danger}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}