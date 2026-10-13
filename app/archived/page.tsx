"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, RotateCcw, Trash2, Package } from "lucide-react";
import {
  getArchivedProducts,
  archiveProduct,
  deleteProduct,
  getImageUrl,
} from "@/lib/api";
import { fmt, formatDate, FILAMENT_COLORS } from "@/lib/utils";
import { toast } from "@/lib/useToast";
import ConfirmModal from "@/components/ConfirmModal";
import type { Product } from "@/lib/types";

export default function ArchivedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoreTarget, setRestoreTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      const r = await getArchivedProducts();
      setProducts(r.data || []);
    } catch {
      toast.error("Hata", "Arşiv yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setActionLoading(true);
    try {
      await archiveProduct(restoreTarget._id, false);
      toast.success("Geri Alındı", `"${restoreTarget.name}" kataloğa döndü`);
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
      await deleteProduct(deleteTarget._id, true);
      toast.success("Silindi", `"${deleteTarget.name}" tamamen silindi`);
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
      <div>
        <h1
          className="text-[26px] font-extrabold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Arşiv
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
          {products.length} arşivlenmiş ürün · Katalogdan kaldırılanlar
        </p>
      </div>

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
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3">
          <Archive size={56} style={{ color: "var(--text-faint)" }} />
          <div className="text-[18px] font-bold" style={{ color: "var(--text)" }}>
            Arşiv boş
          </div>
          <div className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            Arşivlenmiş ürün bulunmuyor
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const imageUrl = getImageUrl(p.image);
            const fColor = FILAMENT_COLORS[p.filament] || "#64748b";

            return (
              <div key={p._id} className="card p-0 overflow-hidden">
                <div
                  className="w-full h-[160px] flex items-center justify-center relative"
                  style={{ background: "var(--bg-subtle)" }}
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      style={{ opacity: 0.6 }}
                    />
                  ) : (
                    <Package size={48} style={{ color: "var(--text-faint)" }} />
                  )}
                  <div
                    className="absolute top-3 right-3 text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full tracking-wider"
                    style={{ background: "var(--warning)" }}
                  >
                    ARŞİV
                  </div>
                </div>

                <div className="p-4">
                  <h3
                    className="text-[14px] font-bold truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {p.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: fColor + "22",
                        color: fColor,
                        border: `1px solid ${fColor}55`,
                      }}
                    >
                      {p.filament}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {formatDate(p.archivedAt || p.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div
                      className="text-[12px] font-semibold"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {fmt(p.defaultPrice)} ₺
                    </div>
                  </div>
                </div>

                {/* Aksiyonlar */}
                <div className="flex gap-2 p-3 pt-0">
                  <button
                    onClick={() => setRestoreTarget(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-bold text-white transition-all hover:opacity-90"
                    style={{ background: "#10b981" }}
                  >
                    <RotateCcw size={13} />
                    Geri Al
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-bold text-white transition-all hover:opacity-90"
                    style={{ background: "#ef4444" }}
                  >
                    <Trash2 size={13} />
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!restoreTarget}
        title="Arşivden Çıkar"
        message={`"${restoreTarget?.name}" kataloğa geri dönsün mü?`}
        confirmText="Geri Al"
        variant="success"
        loading={actionLoading}
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Kalıcı Olarak Sil"
        message={`"${deleteTarget?.name}" ve buna ait tüm satış kayıtları silinecek.\n\nBu işlem geri alınamaz!`}
        confirmText="Kalıcı Sil"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}