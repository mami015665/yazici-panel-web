import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://yazici-panel-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// Ürün görseli URL'i
export const getImageUrl = (imageId?: string | null) => {
  if (!imageId) return null;
  return `${API_URL}/images/${imageId}`;
};

// ── ÜRÜNLER ──
export const getProducts = (includeArchived = false) =>
  api.get("/products", { params: { includeArchived } });

export const getProduct = (id: string) => api.get(`/products/${id}`);
export const createProduct = (data: any) => api.post("/products", data);
export const updateProduct = (id: string, data: any) =>
  api.put(`/products/${id}`, data);
export const deleteProduct = (id: string, cascade = false) =>
  api.delete(`/products/${id}`, { params: { cascade } });
export const archiveProduct = (id: string, archived = true) =>
  api.patch(`/products/${id}/archive`, { archived });
export const getArchivedProducts = () => api.get("/products/archived/list");


// ── GİDERLER ──
export const getExpenses = (category?: string, limit?: number) =>
  api.get("/expenses", {
    params: {
      ...(category && { category }),
      ...(limit && { limit }),
    },
  });

export const getExpenseStats = () => api.get("/expenses/stats");
export const createExpense = (data: any) => api.post("/expenses", data);
export const updateExpense = (id: string, data: any) =>
  api.put(`/expenses/${id}`, data);
export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`);


// ── SATIŞLAR ──
export const getSales = (includeCancelled = false, limit?: number) =>
  api.get("/sales", {
    params: {
      ...(includeCancelled && { includeCancelled: true }),
      ...(limit && { limit }),
    },
  });

export const getSaleStats = () => api.get("/sales/stats");
export const createSale = (data: any) => api.post("/sales", data);
export const deleteSale = (id: string) => api.delete(`/sales/${id}`);
export const cancelSale = (id: string, cancel = true, reason = "") =>
  api.patch(`/sales/${id}/cancel`, { cancel, reason });


export default api;