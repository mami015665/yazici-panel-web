"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Receipt,
  Filter,
  TrendingDown,
  Wrench,
  Package,
  Layers,
  Zap,
  Truck,
  MoreHorizontal,
} from "lucide-react";
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseStats,
} from "@/lib/api";
import { fmt, formatDate } from "@/lib/utils";
import { toast } from "@/lib/useToast";
import ConfirmModal from "@/components/ConfirmModal";
import type { Expense, ExpenseStats } from "@/lib/types";

const CATEGORIES = [
  { key: "Alet", label: "Alet", icon: Wrench, color: "#3b82f6" },
  { key: "Sarf Malzeme", label: "Sarf Malzeme", icon: Package, color: "#8b5cf6" },
  { key: "Filament", label: "Filament", icon: Layers, color: "#ec4899" },
  { key: "Elektrik", label: "Elektrik", icon: Zap, color: "#f59e0b" },
  { key: "Kargo", label: "Kargo", icon: Truck, color: "#10b981" },
  { key: "Diğer", label: "Diğer", icon: MoreHorizontal, color: "#64748b" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      const [expRes, statsRes] = await Promise.all([
        getExpenses(),
        getExpenseStats(),
      ]);
      setExpenses(expRes.data || []);
      setStats(statsRes.data);
    } catch {
      toast.error("Hata", "Giderler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "all" || e.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [expenses, search, filterCategory]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteExpense(deleteTarget._id);
      toast.success("Silindi", `"${deleteTarget.name}" silindi`);
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Hata", "Silinemedi");
    } finally {
      setActionLoading(false);
    }
  };

  const totals = stats?.totals || { amount: 0, count: 0 };
  const byCategory = stats?.byCategory || [];
  const maxCatAmount = Math.max(...byCategory.map((c) => c.amount), 1);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-[26px] font-extrabold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Giderler
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
            {totals.count} kayıt · Toplam: {fmt(totals.amount)} ₺
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary self-start sm:self-auto"
        >
          <Plus size={16} />
          Yeni Gider
        </button>
      </div>

      {/* Kategori özeti */}
      {byCategory.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const data = byCategory.find((c) => c.name === cat.key);
            const amount = data?.amount || 0;
            const Icon = cat.icon;
            const active = filterCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() =>
                  setFilterCategory(active ? "all" : cat.key)
                }
                className="card hover:-translate-y-0.5 transition-transform text-left"
                style={{
                  borderColor: active ? cat.color : undefined,
                  padding: 12,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: cat.color + "22" }}
                >
                  <Icon size={16} style={{ color: cat.color }} />
                </div>
                <div
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cat.label}
                </div>
                <div
                  className="text-[15px] font-extrabold mt-0.5"
                  style={{ color: cat.color }}
                >
                  {fmt(amount)} ₺
                </div>
              </button>
            );
          })}
        </div>
      )}

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
            placeholder="Gider ara..."
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input pl-10 pr-8 cursor-pointer appearance-none"
            style={{ minWidth: 180 }}
          >
            <option value="all">Tüm Kategoriler</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
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
            {search || filterCategory !== "all"
              ? "Sonuç bulunamadı"
              : "Henüz gider yok"}
          </div>
          <div className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            {search || filterCategory !== "all"
              ? "Farklı bir arama/filtre dene"
              : "Yukarıdaki + butonundan ilk giderini ekle"}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((e) => {
            const cat = CATEGORIES.find((c) => c.key === e.category) || CATEGORIES[5];
            const Icon = cat.icon;
            return (
              <div
                key={e._id}
                className="card flex items-center gap-4 p-4"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cat.color + "22" }}
                >
                  <Icon size={20} style={{ color: cat.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-[14px] font-bold truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {e.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: cat.color + "22",
                        color: cat.color,
                        border: `1px solid ${cat.color}55`,
                      }}
                    >
                      {cat.label}
                    </span>
                    {e.quantity > 1 && (
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {e.quantity} adet
                      </span>
                    )}
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {formatDate(e.date)}
                    </span>
                  </div>
                  {e.note && (
                    <div
                      className="text-[11px] mt-1 italic truncate"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {e.note}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div
                    className="text-[18px] font-extrabold"
                    style={{ color: "var(--danger)" }}
                  >
                    −{fmt(e.amount)} ₺
                  </div>
                </div>

                <button
                  onClick={() => setDeleteTarget(e)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
                  style={{
                    background: "#ef444420",
                    color: "#ef4444",
                    border: "1px solid #ef444440",
                  }}
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Yeni gider modal */}
      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}

      {/* Silme onayı */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Gideri Sil"
        message={`"${deleteTarget?.name}" gideri silinsin mi?`}
        confirmText="Sil"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Yeni Gider Modalı ──
function AddExpenseModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Diğer");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning("Eksik", "Gider adı zorunlu");
    if (!amount || parseFloat(amount) <= 0)
      return toast.warning("Eksik", "Tutar girin");

    setLoading(true);
    try {
      await createExpense({
        name: name.trim(),
        category,
        amount: parseFloat(amount),
        quantity: parseInt(quantity) || 1,
        date,
        note: note.trim(),
      });
      toast.success("Eklendi", `"${name}" gideri kaydedildi`);
      onSuccess();
    } catch (err: any) {
      toast.error("Hata", err?.response?.data?.message || "Kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4 animate-fade-in max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
        }}
      >
        <h3
          className="text-[18px] font-extrabold"
          style={{ color: "var(--text)" }}
        >
          Yeni Gider Ekle
        </h3>

        {/* Ad */}
        <div>
          <label
            className="block text-[12px] font-semibold mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Gider Adı *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Silikon Tabancası"
            className="input"
            autoFocus
            required
          />
        </div>

        {/* Kategori */}
        <div>
          <label
            className="block text-[12px] font-semibold mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Kategori *
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = category === cat.key;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5"
                  style={{
                    background: active ? cat.color + "22" : "var(--bg-subtle)",
                    color: active ? cat.color : "var(--text-muted)",
                    border: `1.5px solid ${active ? cat.color : "var(--border)"}`,
                  }}
                >
                  <Icon size={12} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tutar & Adet */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-[12px] font-semibold mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Tutar (₺) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="input"
              step="0.01"
              required
            />
          </div>
          <div>
            <label
              className="block text-[12px] font-semibold mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Adet
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="input"
              min="1"
            />
          </div>
        </div>

        {/* Tarih */}
        <div>
          <label
            className="block text-[12px] font-semibold mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Tarih
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Not */}
        <div>
          <label
            className="block text-[12px] font-semibold mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Not (opsiyonel)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Örn: Bauhaus'tan alındı"
            className="input"
            rows={2}
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-[14px] transition-all"
            style={{
              background: "var(--bg-subtle)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white transition-all"
            style={{ background: "var(--primary)" }}
          >
            {loading ? "..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}