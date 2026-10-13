"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Receipt,
  Plus,
  Trash2,
  Ban,
  RotateCcw,
  Eye,
  EyeOff,
  Calendar,
  Package,
} from "lucide-react";
import {
  getSales,
  deleteSale,
  cancelSale,
  getImageUrl,
} from "@/lib/api";
import { fmt, formatDate, FILAMENT_COLORS } from "@/lib/utils";
import { toast } from "@/lib/useToast";
import ConfirmModal from "@/components/ConfirmModal";
import type { Sale } from "@/lib/types";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCancelled, setShowCancelled] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "active" | "cancelled">(
    "all"
  );

  // Modal state
  const [cancelTarget, setCancelTarget] = useState<Sale | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      const r = await getSales(true); // iptaller dahil
      setSales(r.data || []);
    } catch {
      toast.error("Hata", "Satışlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const matchSearch = s.productName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchType =
        filterType === "all" ||
        (filterType === "active" && !s.cancelled) ||
        (filterType === "cancelled" && s.cancelled);
      return matchSearch && matchType;
    });
  }, [sales, search, filterType]);

  const activeCount = sales.filter((s) => !s.cancelled).length;
  const cancelledCount = sales.filter((s) => s.cancelled).length;

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      await cancelSale(cancelTarget._id, true, "Müşteri iptali");
      toast.success("İptal Edildi", "Satış iptal olarak işaretlendi");
      setCancelTarget(null);
      load();
    } catch {
      toast.error("Hata", "İptal edilemedi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setActionLoading(true);
    try {
      await cancelSale(restoreTarget._id, false);
      toast.success("Geri Alındı", "Satış tekrar aktif");
      setRestoreTarget(null);
      load();
    } catch {
      toast.error("Hata", "Geri alınamadı");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteSale(deleteTarget._id);
      toast.success("Silindi", "Satış kalıcı olarak silindi");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Hata", "Silinemedi");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-[26px] font-extrabold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Satışlar
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
            {activeCount} aktif · {cancelledCount} iptal
          </p>
        </div>
        <Link href="/add/sale" className="btn btn-primary self-start sm:self-auto">
          <Plus size={16} />
          Yeni Satış
        </Link>
      </div>

      {/* Filtre satırı */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-faint)" }}
          />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Segment */}
        <div
          className="flex gap-1 p-1 rounded-lg self-start"
          style={{ background: "var(--bg-subtle)" }}
        >
          {(
            [
              { key: "all", label: "Tümü" },
              { key: "active", label: "Aktif" },
              { key: "cancelled", label: "İptal" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className="px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all"
              style={{
                background: filterType === t.key ? "var(--primary)" : "transparent",
                color: filterType === t.key ? "white" : "var(--text-muted)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-10 h-10 border-[3px] rounded-full animate-spin"
            style={{
              borderColor: "var(--border)",
              borderTopColor: "var(--primary)",
            }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3">
          <Receipt size={56} style={{ color: "var(--text-faint)" }} />
          <div className="text-[18px] font-bold" style={{ color: "var(--text)" }}>
            {search ? "Sonuç bulunamadı" : "Henüz satış yok"}
          </div>
          <div className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            {search ? "Farklı bir arama dene" : "Yukarıdaki + butonundan ilk satışını ekle"}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((s) => (
            <SaleRow
              key={s._id}
              sale={s}
              onCancel={() => setCancelTarget(s)}
              onRestore={() => setRestoreTarget(s)}
              onDelete={() => setDeleteTarget(s)}
            />
          ))}
        </div>
      )}

      {/* Modallar */}
      <ConfirmModal
        open={!!cancelTarget}
        title="Satışı İptal Et"
        message={`"${cancelTarget?.productName}" satışı iptal edilsin mi?\n\n• İstatistiklerden düşer\n• Geçmişte "İPTAL EDİLDİ" olarak kalır\n• İstediğinde geri alabilirsin`}
        confirmText="İptal Et"
        variant="warning"
        loading={actionLoading}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <ConfirmModal
        open={!!restoreTarget}
        title="İptali Geri Al"
        message={`"${restoreTarget?.productName}" satışının iptali geri alınsın mı?\n\nİstatistiklere tekrar dahil olur.`}
        confirmText="Geri Al"
        variant="success"
        loading={actionLoading}
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Kalıcı Olarak Sil"
        message={`"${deleteTarget?.productName}" satışı kalıcı olarak silinsin mi?\n\nBu işlem geri alınamaz.`}
        confirmText="Kalıcı Sil"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function SaleRow({
  sale,
  onCancel,
  onRestore,
  onDelete,
}: {
  sale: Sale;
  onCancel: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const imageUrl = getImageUrl(
    typeof sale.product === "object" ? sale.product.image : null
  );
  const fColor = FILAMENT_COLORS[sale.filament || "Diğer"] || "#64748b";
  const isCancelled = sale.cancelled;
  const profitColor = isCancelled
    ? "var(--text-faint)"
    : sale.totalProfit >= 0
      ? "#10b981"
      : "#ef4444";

  return (
    <div
      className="card p-0 overflow-hidden"
      style={{
        opacity: isCancelled ? 0.65 : 1,
        borderColor: isCancelled ? "var(--danger)" + "55" : undefined,
      }}
    >
      {/* İptal şeridi */}
      {isCancelled && (
        <div
          className="text-[10px] font-extrabold text-white text-center tracking-widest py-1.5"
          style={{ background: "var(--danger)" }}
        >
          İPTAL EDİLDİ
        </div>
      )}

      <div className="flex items-center gap-4 p-4">
        {/* Görsel */}
        <div
          className="w-[60px] h-[60px] rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{ background: "var(--bg-subtle)" }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={sale.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package size={24} style={{ color: "var(--text-faint)" }} />
          )}
        </div>

        {/* Bilgi */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className="text-[14px] font-bold truncate"
                style={{
                  color: isCancelled ? "var(--text-faint)" : "var(--text)",
                  textDecoration: isCancelled ? "line-through" : "none",
                }}
              >
                {sale.productName}
              </h3>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: (isCancelled ? "#94a3b8" : fColor) + "22",
                    color: isCancelled ? "var(--text-faint)" : fColor,
                    border: `1px solid ${(isCancelled ? "#94a3b8" : fColor) + "55"}`,
                  }}
                >
                  {sale.filament || "Diğer"}
                </span>
                <span
                  className="text-[12px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {sale.quantity} adet × {fmt(sale.salePrice)} ₺
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1.5">
                <Calendar size={11} style={{ color: "var(--text-faint)" }} />
                <span
                  className="text-[11px]"
                  style={{ color: "var(--text-faint)" }}
                >
                  {formatDate(sale.saleDate, true)}
                </span>
              </div>

              {isCancelled && sale.cancelReason && (
                <div
                  className="text-[11px] mt-1 italic"
                  style={{ color: "var(--danger)" }}
                >
                  Sebep: {sale.cancelReason}
                </div>
              )}
            </div>

            {/* Fiyatlar */}
            <div className="text-right shrink-0">
              <div
                className="text-[11px] font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                Toplam
              </div>
              <div
                className="text-[16px] font-extrabold"
                style={{
                  color: isCancelled ? "var(--text-faint)" : "var(--text)",
                }}
              >
                {fmt(sale.totalRevenue)} ₺
              </div>
              <div
                className="text-[13px] font-bold mt-0.5"
                style={{ color: profitColor }}
              >
                {sale.totalProfit >= 0 ? "+" : ""}
                {fmt(sale.totalProfit)} ₺
              </div>
            </div>
          </div>
        </div>

        {/* ⚡ YENİ: Kompakt aksiyon butonları (sağ üstte, küçük) */}
        <div className="flex flex-col gap-1.5 ml-2 shrink-0">
          {isCancelled ? (
            <button
              onClick={onRestore}
              title="Geri Al"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: "#10b98120",
                color: "#10b981",
                border: "1px solid #10b98140",
              }}
            >
              <RotateCcw size={14} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={onCancel}
              title="İptal Et"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: "#f59e0b20",
                color: "#f59e0b",
                border: "1px solid #f59e0b40",
              }}
            >
              <Ban size={14} strokeWidth={2.5} />
            </button>
          )}

          <button
            onClick={onDelete}
            title="Sil"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: "#ef444420",
              color: "#ef4444",
              border: "1px solid #ef444440",
            }}
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}