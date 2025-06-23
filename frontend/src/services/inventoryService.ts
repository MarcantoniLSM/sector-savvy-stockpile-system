
import { Sector, Product, ActionHistory, InventoryData } from '@/types/inventory';

const STORAGE_KEY = 'sectoral-inventory-data';

class InventoryService {
  private data: InventoryData;

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      this.data = {
        sectors: [],
        products: [],
        history: []
      };
    }
  }

  private saveData(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  // Sector operations
  getSectors(): Sector[] {
    return this.data.sectors;
  }

  createSector(name: string): Sector {
    const sector: Sector = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString()
    };
    this.data.sectors.push(sector);
    this.saveData();
    return sector;
  }

  updateSector(id: string, name: string): boolean {
    const sector = this.data.sectors.find(s => s.id === id);
    if (sector) {
      sector.name = name;
      this.saveData();
      return true;
    }
    return false;
  }

  deleteSector(id: string): boolean {
    const index = this.data.sectors.findIndex(s => s.id === id);
    if (index !== -1) {
      // Delete all products in this sector
      this.data.products = this.data.products.filter(p => p.sectorId !== id);
      this.data.sectors.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // Product operations
  getProducts(sectorId?: string): Product[] {
    if (sectorId) {
      return this.data.products.filter(p => p.sectorId === sectorId);
    }
    return this.data.products;
  }

  createProduct(sectorId: string, name: string, quantity: number, expirationDate?: string): Product {
    const product: Product = {
      id: crypto.randomUUID(),
      sectorId,
      name,
      quantity,
      expirationDate,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.push(product);
    this.saveData();

    // Add to history
    this.addHistory('add', product.name, this.getSectorName(sectorId), quantity);
    
    return product;
  }

  updateProductQuantity(productId: string, newQuantity: number, action: 'add' | 'subtract'): boolean {
    const product = this.data.products.find(p => p.id === productId);
    if (product && newQuantity >= 0) {
      const oldQuantity = product.quantity;
      product.quantity = newQuantity;
      product.updatedAt = new Date().toISOString();
      this.saveData();

      // Add to history
      const quantityChange = action === 'add' ? newQuantity - oldQuantity : oldQuantity - newQuantity;
      this.addHistory(action, product.name, this.getSectorName(product.sectorId), quantityChange);
      
      return true;
    }
    return false;
  }

  lendProduct(productId: string, quantity: number): boolean {
    const product = this.data.products.find(p => p.id === productId);
    if (product && product.quantity >= quantity) {
      product.quantity -= quantity;
      product.status = 'lent';
      product.updatedAt = new Date().toISOString();
      this.saveData();

      // Add to history
      this.addHistory('lend', product.name, this.getSectorName(product.sectorId), quantity);
      
      return true;
    }
    return false;
  }

  returnProduct(productId: string, quantity: number): boolean {
    const product = this.data.products.find(p => p.id === productId);
    if (product) {
      product.quantity += quantity;
      if (product.quantity > 0) {
        product.status = 'available';
      }
      product.updatedAt = new Date().toISOString();
      this.saveData();

      // Add to history
      this.addHistory('return', product.name, this.getSectorName(product.sectorId), quantity);
      
      return true;
    }
    return false;
  }

  deleteProduct(productId: string): boolean {
    const product = this.data.products.find(p => p.id === productId);
    if (product) {
      const index = this.data.products.findIndex(p => p.id === productId);
      this.data.products.splice(index, 1);
      this.saveData();

      // Add to history
      this.addHistory('delete', product.name, this.getSectorName(product.sectorId), product.quantity);
      
      return true;
    }
    return false;
  }

  // History operations
  getHistory(): ActionHistory[] {
    return this.data.history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private addHistory(type: ActionHistory['type'], productName: string, sectorName: string, quantity: number): void {
    const history: ActionHistory = {
      id: crypto.randomUUID(),
      type,
      productName,
      sectorName,
      quantity,
      timestamp: new Date().toISOString(),
      responsible: 'System User' // This could be made configurable
    };
    this.data.history.push(history);
    this.saveData();
  }

  private getSectorName(sectorId: string): string {
    const sector = this.data.sectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Unknown Sector';
  }

  // Utility methods
  isNearExpiration(expirationDate: string): boolean {
    const expDate = new Date(expirationDate);
    const now = new Date();
    const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    return expDate <= fifteenDaysFromNow;
  }

  isLowStock(quantity: number): boolean {
    return quantity < 5;
  }
}

export const inventoryService = new InventoryService();
