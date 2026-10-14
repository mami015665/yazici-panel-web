"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Percent,
  Boxes,
  BarChart3,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
import { getProducts, getSaleStats } from "@/lib/api";
import { fmt } from "@/lib/utils";
import { COLORS } from "@/lib/theme";
import type { Product, SaleStats } from "@/lib/types";


export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SaleStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [prodRes, statsRes] = await Promise.all([
        getProducts(),
        getSaleStats(),
      ]);
      setProducts(prodRes.data || []);
      setStats(statsRes.data);
    } catch (e) {
      console.error("Veri yükleme hatası:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-[3px] rounded-full animate-spin"
            style={{
              borderColor: "var(--border)",
              borderTopColor: "var(--primary)",
            }}
          />
          <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            Yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  const totals = stats?.totals || {
    revenue: 0,
    profit: 0,
    cost: 0,
    quantity: 0,
    count: 0,
  };

  const profitMargin =
    totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : "0";

  const avgProfit =
    totals.quantity > 0 ? totals.profit / totals.quantity : 0;

  const topProducts = (stats?.byQuantity || []).slice(0, 5);
  const maxQ = Math.max(...topProducts.map((p) => p.totalQuantity), 1);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Başlık */}
      <div>
        <h1
          className="text-[26px] font-extrabold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Panel
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
          {totals.quantity} adet satış · {products.length} ürün katalogda
        </p>
      </div>

      {/* Stat kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          label="Toplam Satış"
          value={`${fmt(totals.quantity)} adet`}
          color={COLORS.info}
        />
        <StatCard
          icon={DollarSign}
          label="Toplam Gelir"
          value={`${fmt(totals.revenue)} ₺`}
          color={COLORS.success}
        />
        <StatCard
          icon={TrendingUp}
          label="Toplam Kâr"
          value={`${fmt(totals.profit)} ₺`}
          color={COLORS.profit}
        />
        <StatCard
          icon={Package}
          label="Katalog"
          value={`${products.length} ürün`}
          color={COLORS.warning}
        />
      </div>

      {/* Finansal özet */}
      <div className="card">
        <h3 className="text-[15px] font-bold mb-4" style={{ color: "var(--text)" }}>
          💡 Finansal Özet
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <div className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
              Toplam Maliyet
            </div>
            <div
              className="text-[20px] font-extrabold mt-1"
              style={{ color: COLORS.danger }}
            >
              {fmt(totals.cost)} ₺
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
              Ort. Kâr/Satış
            </div>
            <div
              className="text-[20px] font-extrabold mt-1"
              style={{ color: "var(--text)" }}
            >
              {fmt(avgProfit, 1)} ₺
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
              Kâr Marjı
            </div>
            <div
              className="text-[20px] font-extrabold mt-1"
              style={{ color: COLORS.success }}
            >
              %{profitMargin}
            </div>
          </div>
        </div>

        {/* Progress barlar */}
        <div className="flex flex-col gap-3">
          <ProgressRow
            label="Gelir"
            value={totals.revenue}
            max={totals.revenue}
            color={COLORS.success}
          />
          <ProgressRow
            label="Maliyet"
            value={totals.cost}
            max={totals.revenue}
            color={COLORS.danger}
          />
          <ProgressRow
            label="Kâr"
            value={totals.profit}
            max={totals.revenue}
            color={COLORS.profit}
          />
        </div>
      </div>

      {/* Grafik */}
      <ChartCard daily={stats?.daily || []} monthly={stats?.monthly || []} />

      {/* En çok satanlar */}
      {topProducts.length > 0 && (
        <div className="card">
          <h3 className="text-[15px] font-bold mb-4" style={{ color: "var(--text)" }}>
            🔥 En Çok Satanlar
          </h3>

          <div className="flex flex-col gap-4">
            {topProducts.map((item, i) => {
              const pct = (item.totalQuantity / maxQ) * 100;
              const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
              return (
                <div key={item.productId} className="flex items-center gap-3">
                  <span className="text-[20px] w-7 text-center">{medals[i]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {item.name}
                      </span>
                      <span
                        className="text-[12px] font-bold ml-2 shrink-0"
                        style={{ color: COLORS.info }}
                      >
                        {item.totalQuantity} adet
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--border)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: COLORS.info,
                        }}
                      />
                    </div>
                    <div
                      className="text-[11px] mt-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Gelir: {fmt(item.totalRevenue)} ₺ · Kâr: {fmt(item.totalProfit)} ₺
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* İptal edilenler bilgisi */}
      {stats?.cancelled && stats.cancelled.count > 0 && (
        <div
          className="card flex items-center gap-4"
          style={{ borderColor: "var(--danger)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--danger-soft)" }}
          >
            <span className="text-[18px]">🚫</span>
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold" style={{ color: "var(--text)" }}>
              {stats.cancelled.count} iptal edilmiş satış
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {fmt(stats.cancelled.revenue)} ₺ gelir istatistiklerden hariç
            </div>
          </div>
        </div>
      )}

      {/* Boş durum */}
      {totals.count === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 gap-3">
          <div style={{ fontSize: 56 }}>🖨️</div>
          <div className="text-[18px] font-bold" style={{ color: "var(--text)" }}>
            Henüz satış yok
          </div>
          <div className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            Sol menüden ilk satışını ekle
          </div>
        </div>
      )}
    </div>
  );
}

// ── Progress Row ──
function ProgressRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <span className="text-[12px] font-bold" style={{ color }}>
          {fmt(value)} ₺
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>


    </div>
  );
}