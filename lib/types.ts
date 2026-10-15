// Ürün
export interface Product {
  _id: string;
  name: string;
  filament: string;
  filamentBrand?: string;
  filamentUsed?: number;
  filamentPrice?: number;
  printTime?: number;
  electricityKw?: number;
  electricityPrice?: number;
  cost: number;
  defaultPrice: number;
  defaultProfit?: number;
  image?: string | null;
  notes?: string;
  archived?: boolean;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Satış
export interface Sale {
  _id: string;
  product: Product | { _id: string; name: string; image?: string; filament?: string };
  productName: string;
  filament?: string;
  quantity: number;
  salePrice: number;
  cost: number;
  profit: number;
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  note?: string;
  saleDate: string;
  cancelled: boolean;
  cancelledAt?: string | null;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

// İstatistik
export interface DailyStat {
  date: string;
  label: string;
  revenue: number;
  profit: number;
  cost: number;
  count: number;
}

export interface MonthlyStat {
  date: string;
  label: string;
  revenue: number;
  profit: number;
  cost: number;
  count: number;
}

export interface ProductStat {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
}

export interface FilamentStat {
  name: string;
  quantity: number;
  revenue: number;
  profit: number;
}

export interface SaleStats {
  daily: DailyStat[];
  monthly: MonthlyStat[];
  byProduct: ProductStat[];
  byQuantity: ProductStat[];
  byFilament: FilamentStat[];
  totals: {
    revenue: number;
    profit: number;
    cost: number;
    quantity: number;
    count: number;
  };
  cancelled: {
    count: number;
    quantity: number;
    revenue: number;
    profit: number;
  };

  
}

export interface Expense {
  _id: string;
  name: string;
  category: "Alet" | "Sarf Malzeme" | "Filament" | "Elektrik" | "Kargo" | "Diğer";
  amount: number;
  quantity: number;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStats {
  totals: {
    amount: number;
    count: number;
  };
  byCategory: { name: string; amount: number; count: number }[];
  monthly: { date: string; label: string; amount: number }[];
  daily: { date: string; label: string; amount: number }[];
}