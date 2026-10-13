"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Search, Check } from "lucide-react";
import {
  getProducts,
  createSale,
  getImageUrl,
} from "@/lib/api";
import { fmt, FILAMENT_COLORS } from "@/lib/utils";
import { toast } from "@/lib/useToast";
import type { Product } from "@/lib/types";

export default function AddSalePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const r = await getProducts();
      setProducts(r.data || []);
    } catch {
      toast.error("Hata", "Ürünler yüklenemedi");
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.filament.toLowerCase().includes(q)
    );
  }, [products, search]);

  const selectProduct = (p: Product) => {
    setSelected(p);
    setSalePrice(String(p.defaultPrice || ""));
    setQuantity("1");
    setPickerOpen(false);
    setSearch("");
  };

  const qty = parseInt(quantity) || 1;
  const price = parseFloat(salePrice) || 0;
  const unitProfit = selected ? price - (selected.cost || 0) : 0;
  const totalProfit = unitProfit * qty;
  const totalRevenue = price * qty;
  const profitColor = unitProfit >= 0 ? "#10b981" : "#ef4444";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.warning("Eksik", "Ürün seçin");
    if (!salePrice || parseFloat(salePrice) <= 0)
      return toast.warning("Eksik", "Satış fiyatı girin");

    setLoading(true);
    try {
      await createSale({
        productId: selected._id,
        quantity: qty,
        salePrice: parseFloat(salePrice),
        note: note.trim(),
      });
      toast.success("Kaydedildi", `"${selected.name}" satışı eklendi`);
      router.push("/sales");
    } catch (e: any) {
      toast.error("Hata", e?.response?.data?.message || "Kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto flex flex-col gap-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-70 self-start"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={16} />
        Geri
      </button>

      <div>
        <h1
          className="text-[26px] font-extrabold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Yeni Satış Ekle
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
          Sattığın ürünü seç, adet ve fiyat gir
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Ürün seçici */}
        <div className="card">
          <label
            className="block text-[12px] font-semibold mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Ürün Seç *
          </label>

          {selected ? (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[var(--bg-subtle)] text-left"
              style={{ border: "1.5px solid var(--primary)" }}
            >
              <ProductThumb product={selected} size={48} />
              <div className="flex-1 min-w-0">
                <div
                  className="text-[14px] font-bold truncate"
                  style={{ color: "var(--text)" }}
                >
                  {selected.name}
                </div>
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selected.filament} · Maliyet: {fmt(selected.cost, 2)} ₺
                </div>
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
              >
                Değiştir
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl transition-all hover:bg-[var(--bg-subtle)]"
              style={{ border: "1.5px dashed var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "var(--bg-subtle)" }}
              >
                <Search size={16} style={{ color: "var(--text-muted)" }} />
              </div>
              <span className="text-[14px]" style={{ color: "var(--text-muted)" }}>
                Ürün seçmek için tıkla
              </span>
            </button>
          )}
        </div>

        {/* Adet */}
        <div className="card">
          <label
            className="block text-[12px] font-semibold mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Adet *
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(String(Math.max(1, qty - 1)))}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px] font-bold transition-all hover:bg-[var(--bg-subtle)]"
              style={{
                background: "var(--bg-subtle)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input text-center text-[18px] font-bold"
              style={{ maxWidth: 100 }}
              min="1"
            />
            <button
              type="button"
              onClick={() => setQuantity(String(qty + 1))}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px] font-bold transition-all hover:bg-[var(--bg-subtle)]"
              style={{
                background: "var(--bg-subtle)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Fiyat */}
        <div className="card">
          <label
            className="block text-[12px] font-semibold mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Satış Fiyatı (₺/adet)
          </label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder={String(selected?.defaultPrice || "0")}
            className="input"
            step="0.01"
          />
        </div>

        {/* Özet */}
        {selected && price > 0 && (
          <div
            className="card"
            style={{ borderColor: "var(--primary)" + "66" }}
          >
            <h3
              className="text-[14px] font-bold mb-3"
              style={{ color: "var(--text)" }}
            >
              💰 Satış Özeti
            </h3>

            <SummaryRow label="Birim Fiyat" value={`${fmt(price, 2)} ₺`} />
            <SummaryRow
              label="Birim Maliyet"
              value={`${fmt(selected.cost, 2)} ₺`}
            />
            <SummaryRow
              label="Birim Kâr"
              value={`${unitProfit >= 0 ? "+" : ""}${fmt(unitProfit, 2)} ₺`}
              color={profitColor}
            />

            <div
              className="border-t my-3"
              style={{ borderColor: "var(--border)" }}
            />

            <SummaryRow label="Toplam Gelir" value={`${fmt(totalRevenue, 2)} ₺`} />
            <SummaryRow
              label="Toplam Kâr"
              value={`${totalProfit >= 0 ? "+" : ""}${fmt(totalProfit, 2)} ₺`}
              color={profitColor}
              bold
            />
          </div>
        )}

        {/* Not */}
        <div className="card">
          <label
            className="block text-[12px] font-semibold mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Not (opsiyonel)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Müşteri notu, kargo vs."
            className="input"
            rows={3}
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selected}
          className="btn btn-primary justify-center py-3.5 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {loading ? "Kaydediliyor..." : "Satışı Kaydet"}
        </button>
      </form>

      {/* Ürün seçici modal */}
      {pickerOpen && (
        <ProductPickerModal
          products={filtered}
          selected={selected}
          search={search}
          onSearch={setSearch}
          onSelect={selectProduct}
          onClose={() => {
            setPickerOpen(false);
            setSearch("");
          }}
        />
      )}
    </div>
  );
}

// ── Ürün görsel küçük ──
function ProductThumb({ product, size = 56 }: { product: Product; size?: number }) {
  const url = getImageUrl(product.image);
  return (
    <div
      className="rounded-xl overflow-hidden flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--bg-subtle)",
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>🖨️</span>
      )}
    </div>
  );
}

// ── Ürün seçici modal ──
function ProductPickerModal({
  products,
  selected,
  search,
  onSearch,
  onSelect,
  onClose,
}: {
  products: Product[];
  selected: Product | null;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (p: Product) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9997] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[80vh] rounded-t-2xl sm:rounded-2xl flex flex-col animate-fade-in"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Başlık */}
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <h3
            className="text-[16px] font-extrabold mb-3"
            style={{ color: "var(--text)" }}
          >
            Ürün Seç
          </h3>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-faint)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Ürün ara..."
              className="input pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-2">
          {products.length === 0 ? (
            <div
              className="text-center py-8 text-[13px]"
              style={{ color: "var(--text-faint)" }}
            >
              Ürün bulunamadı
            </div>
          ) : (
            products.map((p) => {
              const fColor = FILAMENT_COLORS[p.filament] || "#64748b";
              const isSelected = selected?._id === p._id;
              return (
                <button
                  key={p._id}
                  onClick={() => onSelect(p)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[var(--bg-subtle)] text-left"
                  style={{
                    background: isSelected ? "var(--primary-soft)" : "transparent",
                  }}
                >
                  <ProductThumb product={p} size={48} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[14px] font-bold truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {p.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
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
                        className="text-[12px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {fmt(p.defaultPrice)} ₺
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={18} style={{ color: "var(--primary)" }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Özet satırı ──
function SummaryRow({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span
        className="text-[13px]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-[13px]"
        style={{
          color: color || "var(--text)",
          fontWeight: bold ? 800 : 600,
          fontSize: bold ? 15 : 13,
        }}
      >
        {value}
      </span>
    </div>
  );
}