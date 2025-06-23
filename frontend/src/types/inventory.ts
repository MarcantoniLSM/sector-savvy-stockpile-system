
export interface Sector {
  id: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sectorId: string;
  name: string;
  quantity: number;
  expirationDate?: string;
  status: 'available' | 'lent';
  createdAt: string;
  updatedAt: string;
}

export interface ActionHistory {
  id: string;
  type: 'add' | 'subtract' | 'lend' | 'return' | 'delete';
  productName: string;
  sectorName: string;
  quantity: number;
  timestamp: string;
  responsible: string;
}

export interface InventoryData {
  sectors: Sector[];
  products: Product[];
  history: ActionHistory[];
}
