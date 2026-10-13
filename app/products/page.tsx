"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Plus,
  Trash2,
  Edit3,
  Filter,
} from "lucide-react";
import { getProducts, deleteProduct, getImageUrl } from "@/lib/api";
import { fmt, FILAMENT_COLORS, FILAMENTS } from "@/lib/utils";
import { toast } from "@/lib/useToast";
import ConfirmModal from "@/components/ConfirmModal";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFilament, setFilterFilament] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const r = await getProducts();
      setProducts(r.data || []);
    } catch {
      toast.error("Hata", "Ürünler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchFilament =
        filterFilament === "all" || p.filament === filterFilament;
      return matchSearch && matchFilament;
    });
  }, [products, search, filterFilament]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget._id);
      toast.success("Silindi", `"${deleteTarget.name}" kaldırıldı`);
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error("Hata", e?.response?.data?.message || "Silinemedi");
    } finally {
      setDeleting(false);
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
            Katalog
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
            {filtered.length} ürün · Toplam değer:{" "}
            {fmt(filtered.reduce((s, p) => s + (p.defaultPrice || 0), 0))} ₺
          </p>
        </div>
        <Link href="/add/product" className="btn btn-primary self-start sm:self-auto">
          <Plus size={16} />
          Yeni Ürün
        </Link>
      </div>

      {/* Filtre */}
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

        <div className="relative">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-faint)" }}
          />
          <select
            value={filterFilament}
            onChange={(e) => setFilterFilament(e.target.value)}
            className="input pl-10 pr-8 cursor-pointer appearance-none"
            style={{ minWidth: 160 }}
          >
            <option value="all">Tüm Filamentler</option>
            {FILAMENTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Yükleniyor */}
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
          <Package size={56} style={{ color: "var(--text-faint)" }} />
          <div className="text-[18px] font-bold" style={{ color: "var(--text)" }}>
            {search || filterFilament !== "all" ? "Sonuç bulunamadı" : "Henüz ürün yok"}
          </div>
          <div className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            {search || filterFilament !== "all"
              ? "Farklı bir arama/filtre dene"
              : "Yukarıdaki + butonundan ilk ürününü ekle"}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductGridCard
              key={p._id}
              product={p}
              onDelete={() => setDeleteTarget(p)}
            />
          ))}
        </div>
      )}

      {/* Silme modalı */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Ürünü Sil"
        message={`"${deleteTarget?.name}" kalıcı olarak silinsin mi?`}
        confirmText="Sil"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Ürün Kartı ──
function ProductGridCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: () => void;
}) {
  const imageUrl = getImageUrl(product.image);
  const profit = (product.defaultPrice || 0) - (product.cost || 0);
  const profitColor = profit >= 0 ? "#10b981" : "#ef4444";
  const fColor = FILAMENT_COLORS[product.filament] || "#64748b";

  return (
    <div className="card p-0 overflow-hidden group hover:-translate-y-1 transition-transform">
      {/* Görsel */}
      <Link href={`/products/${product._id}`} className="block relative">
        <div
          className="w-full aspect-square flex items-center justify-center overflow-hidden"
          style={{ background: "var(--bg-subtle)" }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Package size={56} style={{ color: "var(--text-faint)" }} />
          )}
        </div>

        {/* Filament etiketi */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ background: fColor }}
        >
          {product.filament}
        </div>
      </Link>

      {/* Bilgi */}
      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3
            className="text-[14px] font-bold truncate hover:opacity-80 transition-opacity"
            style={{ color: "var(--text)" }}
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <div>
            <div
              className="text-[11px] font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Satış
            </div>
            <div
              className="text-[16px] font-extrabold"
              style={{ color: "var(--text)" }}
            >
              {fmt(product.defaultPrice)} ₺
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-[11px] font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Kâr
            </div>
            <div
              className="text-[16px] font-extrabold"
              style={{ color: profitColor }}
            >
              {profit >= 0 ? "+" : ""}
              {fmt(profit)} ₺
            </div>
          </div>
        </div>
      </div>

      {/* Aksiyonlar */}
      <div
        className="flex border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <Link
          href={`/add/product?edit=${product._id}`}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[12px] font-bold transition-colors hover:bg-[var(--bg-subtle)]"
          style={{ color: "var(--info)" }}
        >
          <Edit3 size={14} />
          Düzenle
        </Link>
        <div style={{ width: 1, background: "var(--border)" }} />
        <button
          onClick={onDelete}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[12px] font-bold transition-colors hover:bg-[var(--danger-soft)]"
          style={{ color: "var(--danger)" }}
        >
          <Trash2 size={14} />
          Sil
        </button>
      </div>
    </div>
  );
}