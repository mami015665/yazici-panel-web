"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Archive,
  Package,
  Clock,
  Zap,
  Palette,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  getProduct,
  deleteProduct,
  archiveProduct,
  getImageUrl,
} from "@/lib/api";
import { fmt, formatDate, formatHours, FILAMENT_COLORS } from "@/lib/utils";
import { toast } from "@/lib/useToast";
import ConfirmModal from "@/components/ConfirmModal";
import type { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const r = await getProduct(id);
      setProduct(r.data);
    } catch {
      toast.error("Hata", "Ürün bulunamadı");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!product) return;
    setActionLoading(true);
    try {
      await archiveProduct(product._id, true);
      toast.success("Arşivlendi", `"${product.name}" arşive taşındı`);
      router.push("/products");
    } catch {
      toast.error("Hata", "Arşivlenemedi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setActionLoading(true);
    try {
      await deleteProduct(product._id, true);
      toast.success("Silindi", `"${product.name}" kalıcı olarak silindi`);
      router.push("/products");
    } catch (e: any) {
      toast.error("Hata", e?.response?.data?.message || "Silinemedi");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
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

  if (!product) return null;

  const imageUrl = getImageUrl(product.image);
  const profit = (product.defaultPrice || 0) - (product.cost || 0);
  const profitColor = profit >= 0 ? "#10b981" : "#ef4444";
  const margin =
    product.defaultPrice > 0 ? (profit / product.defaultPrice) * 100 : 0;
  const fColor = FILAMENT_COLORS[product.filament] || "#64748b";

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Üst bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={16} />
          Geri
        </button>

        <div className="flex items-center gap-2">
          <Link
            href={`/add/product?edit=${product._id}`}
            className="btn btn-ghost"
          >
            <Edit3 size={14} />
            Düzenle
          </Link>
        </div>
      </div>

      {/* Ana grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Sol: Görsel */}
        <div className="card p-0 overflow-hidden">
          <div
            className="w-full aspect-square flex items-center justify-center"
            style={{ background: "var(--bg-subtle)" }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package size={96} style={{ color: "var(--text-faint)" }} />
            )}
          </div>
        </div>

        {/* Sağ: Bilgi */}
        <div className="flex flex-col gap-5">
          {/* Başlık */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                style={{ background: fColor }}
              >
                {product.filament}
              </span>
              {product.filamentBrand && (
                <span
                  className="text-[12px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {product.filamentBrand}
                </span>
              )}
            </div>

            <h1
              className="text-[32px] font-extrabold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              {product.name}
            </h1>
            <p
              className="text-[13px] mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Eklenme: {formatDate(product.createdAt)}
            </p>
          </div>

          {/* Fiyat kartları */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className="p-4 rounded-xl"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-[11px] font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                Maliyet
              </div>
              <div
                className="text-[20px] font-extrabold mt-1"
                style={{ color: "#f59e0b" }}
              >
                {fmt(product.cost, 2)} ₺
              </div>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-[11px] font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                Satış Fiyatı
              </div>
              <div
                className="text-[20px] font-extrabold mt-1"
                style={{ color: "var(--text)" }}
              >
                {fmt(product.defaultPrice)} ₺
              </div>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-[11px] font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                Kâr
              </div>
              <div
                className="text-[20px] font-extrabold mt-1"
                style={{ color: profitColor }}
              >
                {profit >= 0 ? "+" : ""}
                {fmt(profit, 2)} ₺
              </div>
              <div
                className="text-[11px] mt-0.5"
                style={{ color: "var(--text-faint)" }}
              >
                %{fmt(margin, 1)} marj
              </div>
            </div>
          </div>

          {/* Detaylar */}
          <div className="card">
            <h3
              className="text-[15px] font-bold mb-4 flex items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              <Sparkles size={16} />
              Detaylar
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <InfoRow
                icon={Palette}
                label="Filament Kullanımı"
                value={product.filamentUsed ? `${product.filamentUsed} g` : null}
              />
              <InfoRow
                icon={Sparkles}
                label="Filament Fiyatı"
                value={
                  product.filamentPrice ? `${product.filamentPrice} ₺/kg` : null
                }
              />
              <InfoRow
                icon={Clock}
                label="Baskı Süresi"
                value={
                  product.printTime ? formatHours(product.printTime) : null
                }
              />
              <InfoRow
                icon={Zap}
                label="Yazıcı Gücü"
                value={product.electricityKw ? `${product.electricityKw} kW` : null}
              />
              <InfoRow
                icon={Zap}
                label="Elektrik Fiyatı"
                value={
                  product.electricityPrice
                    ? `${product.electricityPrice} ₺/kWh`
                    : null
                }
              />
            </div>

            {product.notes && (
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="text-[11px] font-semibold mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Notlar
                </div>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "var(--text)" }}
                >
                  {product.notes}
                </p>
              </div>
            )}
          </div>

          {/* Yönetim */}
          <div className="card">
            <h3
              className="text-[15px] font-bold mb-4 flex items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              ⚙️ Yönetim
            </h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowArchive(true)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[var(--bg-subtle)] text-left"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#f59e0b20", color: "#f59e0b" }}
                >
                  <Archive size={18} />
                </div>
                <div className="flex-1">
                  <div
                    className="text-[13px] font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Arşivle
                  </div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Katalogdan kaldır, geçmiş korunur
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[var(--danger-soft)] text-left"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#ef444420", color: "#ef4444" }}
                >
                  <Trash2 size={18} />
                </div>
                <div className="flex-1">
                  <div
                    className="text-[13px] font-bold"
                    style={{ color: "var(--danger)" }}
                  >
                    Kalıcı Olarak Sil
                  </div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Bu işlem geri alınamaz
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modallar */}
      <ConfirmModal
        open={showArchive}
        title="Ürünü Arşivle"
        message={`"${product.name}" katalogdan kaldırılacak.\n\nSatış geçmişi korunur, istediğinde geri alabilirsin.`}
        confirmText="Arşivle"
        variant="warning"
        loading={actionLoading}
        onConfirm={handleArchive}
        onCancel={() => setShowArchive(false)}
      />

      <ConfirmModal
        open={showDelete}
        title="Kalıcı Olarak Sil"
        message={`"${product.name}" ve buna ait tüm satış kayıtları silinecek.\n\nBu işlem geri alınamaz!`}
        confirmText="Kalıcı Sil"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div
      className="flex items-center justify-between py-2.5 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color: "var(--text-faint)" }} />
        <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <span
        className="text-[13px] font-semibold"
        style={{ color: "var(--text)" }}
      >
        {value}
      </span>
    </div>
  );
}