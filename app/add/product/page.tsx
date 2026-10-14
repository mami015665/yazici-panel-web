"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, ArrowLeft, Sparkles } from "lucide-react";
import { createProduct, updateProduct, getProduct } from "@/lib/api";
import { fmt, FILAMENTS, FILAMENT_COLORS } from "@/lib/utils";
import { toast } from "@/lib/useToast";
import type { Product } from "@/lib/types";

// İçerik component'i
function AddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = !!editId;

  const [name, setName] = useState("");
  const [filament, setFilament] = useState("PLA");
  const [filamentBrand, setFilamentBrand] = useState("");
  const [filamentUsed, setFilamentUsed] = useState("");
  const [filamentPrice, setFilamentPrice] = useState("");
  const [printTime, setPrintTime] = useState("");
  const [electricityKw, setElectricityKw] = useState("");
  const [electricityPrice, setElectricityPrice] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const r = await getProduct(editId!);
        const p: Product = r.data;
        setName(p.name || "");
        setFilament(p.filament || "PLA");
        setFilamentBrand(p.filamentBrand || "");
        setFilamentUsed(str(p.filamentUsed));
        setFilamentPrice(str(p.filamentPrice));
        setPrintTime(str(p.printTime));
        setElectricityKw(str(p.electricityKw));
        setElectricityPrice(str(p.electricityPrice));
        setDefaultPrice(str(p.defaultPrice));
        setNotes(p.notes || "");
      } catch {
        toast.error("Hata", "Ürün yüklenemedi");
      } finally {
        setFetching(false);
      }
    })();
  }, [editId]);

  const str = (v: any) => (v === 0 || v ? String(v) : "");

  const used = parseFloat(filamentUsed) || 0;
  const fPrice = parseFloat(filamentPrice) || 0;
  const time = parseFloat(printTime) || 0;
  const kw = parseFloat(electricityKw) || 0;
  const ePrice = parseFloat(electricityPrice) || 0;

  const filamentCost = (used / 1000) * fPrice;
  const electricityCost = time * kw * ePrice;
  const cost = filamentCost + electricityCost;
  const price = parseFloat(defaultPrice) || 0;
  const profit = price - cost;
  const margin = price > 0 ? (profit / price) * 100 : 0;
  const profitColor = profit >= 0 ? "#10b981" : "#ef4444";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning("Eksik", "Ürün adı zorunlu");
    if (!defaultPrice || parseFloat(defaultPrice) <= 0)
      return toast.warning("Eksik", "Satış fiyatı girin");

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        filament,
        filamentBrand,
        filamentUsed: filamentUsed || "0",
        filamentPrice: filamentPrice || "0",
        printTime: printTime || "0",
        electricityKw: electricityKw || "0",
        electricityPrice: electricityPrice || "0",
        defaultPrice,
        notes,
      };

      if (isEdit) {
        await updateProduct(editId!, payload);
        toast.success("Güncellendi", `"${name}" güncellendi`);
      } else {
        await createProduct(payload);
        toast.success("Eklendi", `"${name}" eklendi`);
      }
      router.push("/products");
    } catch (e: any) {
      toast.error("Hata", e?.response?.data?.message || "Kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div
          className="w-10 h-10 border-[3px] rounded-full animate-spin"
          style={{
            borderColor: "var(--border)",
            borderTopColor: "var(--primary)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={16} />
          Geri
        </button>
      </div>

      <div>
        <h1
          className="text-[26px] font-extrabold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          {isEdit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
          {isEdit ? "Ürün bilgilerini güncelle" : "Kataloğa yeni bir ürün ekle"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="card flex flex-col gap-4">
          <h3 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
            📦 Temel Bilgiler
          </h3>

          <Field label="Ürün Adı *">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Mini Vazo"
              className="input"
              required
            />
          </Field>

          <Field label="Varsayılan Satış Fiyatı (₺) *">
            <input
              type="number"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              placeholder="0"
              className="input"
              step="0.01"
              required
            />
          </Field>

          <Field label="Filament Türü *">
            <div className="flex flex-wrap gap-2">
              {FILAMENTS.map((f) => {
                const active = filament === f;
                const color = FILAMENT_COLORS[f];
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilament(f)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-bold transition-all"
                    style={{
                      background: active ? color + "22" : "var(--bg-subtle)",
                      color: active ? color : "var(--text-muted)",
                      border: `1.5px solid ${active ? color : "var(--border)"}`,
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="card flex flex-col gap-4">
          <h3 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
            🧵 Filament Detayları
          </h3>

          <Field label="Marka">
            <input
              type="text"
              value={filamentBrand}
              onChange={(e) => setFilamentBrand(e.target.value)}
              placeholder="Örn: Bambu, eSUN"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Kullanım (gram)">
              <input
                type="number"
                value={filamentUsed}
                onChange={(e) => setFilamentUsed(e.target.value)}
                placeholder="85"
                className="input"
                step="0.1"
              />
            </Field>
            <Field label="Filament Fiyatı (₺/kg)">
              <input
                type="number"
                value={filamentPrice}
                onChange={(e) => setFilamentPrice(e.target.value)}
                placeholder="450"
                className="input"
                step="0.01"
              />
            </Field>
          </div>
        </div>

        <div className="card flex flex-col gap-4">
          <h3 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
            ⚡ Baskı & Elektrik
          </h3>

          <Field label="Baskı Süresi (saat)">
            <input
              type="number"
              value={printTime}
              onChange={(e) => setPrintTime(e.target.value)}
              placeholder="2.5 (2s 30dk)"
              className="input"
              step="0.1"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Yazıcı Gücü (kW)">
              <input
                type="number"
                value={electricityKw}
                onChange={(e) => setElectricityKw(e.target.value)}
                placeholder="0.3"
                className="input"
                step="0.01"
              />
            </Field>
            <Field label="Elektrik Fiyatı (₺/kWh)">
              <input
                type="number"
                value={electricityPrice}
                onChange={(e) => setElectricityPrice(e.target.value)}
                placeholder="4.5"
                className="input"
                step="0.01"
              />
            </Field>
          </div>
        </div>

        <div className="card" style={{ borderColor: "var(--primary)" + "66" }}>
          <h3
            className="text-[15px] font-bold mb-3 flex items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            <Sparkles size={16} style={{ color: "var(--primary)" }} />
            Otomatik Hesaplama
          </h3>

          <CalcRow label="Filament maliyeti" value={`${fmt(filamentCost, 2)} ₺`} />
          <CalcRow
            label="Elektrik maliyeti"
            value={`${fmt(electricityCost, 2)} ₺`}
          />

          <div className="border-t my-3" style={{ borderColor: "var(--border)" }} />

          <CalcRow label="Toplam Maliyet" value={`${fmt(cost, 2)} ₺`} bold />
          <CalcRow label="Satış Fiyatı" value={`${fmt(price, 2)} ₺`} />
          <CalcRow
            label="Kâr"
            value={`${profit >= 0 ? "+" : ""}${fmt(profit, 2)} ₺`}
            color={profitColor}
            bold
          />
          <CalcRow label="Marj" value={`%${fmt(margin, 1)}`} color={profitColor} />
        </div>

        <div className="card">
          <Field label="Notlar">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opsiyonel notlar..."
              className="input"
              rows={3}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary justify-center py-3.5 text-[15px]"
        >
          <Save size={16} />
          {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
        </button>
      </form>
    </div>
  );
}

// Dış component (Suspense)
export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div
            className="w-10 h-10 border-[3px] rounded-full animate-spin"
            style={{
              borderColor: "var(--border)",
              borderTopColor: "var(--primary)",
            }}
          />
        </div>
      }
    >
      <AddProductContent />
    </Suspense>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-[12px] font-semibold mb-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function CalcRow({
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
        style={{
          color: bold ? "var(--text)" : "var(--text-muted)",
          fontWeight: bold ? 700 : 400,
        }}
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