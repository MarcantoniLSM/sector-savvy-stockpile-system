
import { useState, useEffect } from 'react';
import { Plus, Package, AlertTriangle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectorManager from '@/components/SectorManager';
import ProductManager from '@/components/ProductManager';
import ActionHistory from '@/components/ActionHistory';
import { Sector, Product } from '@/types/inventory';
import { inventoryService } from '@/services/inventoryService';

const Index = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadedSectors = inventoryService.getSectors();
    setSectors(loadedSectors);
  }, []);

  const handleSectorUpdate = () => {
    const updatedSectors = inventoryService.getSectors();
    setSectors(updatedSectors);
  };

  const calculateSectorStats = (sector: Sector) => {
    const products = inventoryService.getProducts(sector.id);
    const now = new Date();
    const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    
    const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);
    const nearExpiration = products.filter(product => 
      product.expirationDate && new Date(product.expirationDate) <= fifteenDaysFromNow
    ).length;
    const lowStock = products.filter(product => product.quantity < 5).length;
    const lentItems = products.filter(product => product.status === 'lent').length;

    return { totalItems, nearExpiration, lowStock, lentItems };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistema de gerenciamento setorial</h1>
          <p className="text-gray-600">Gerencie seu inventário por setores</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sectors">Setores</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectors.map((sector) => {
                const stats = calculateSectorStats(sector);
                return (
                  <Card key={sector.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {sector.name}
                      </CardTitle>
                      <CardDescription>Visão geral</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
                          <div className="text-sm text-gray-500">Total de itens</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{stats.nearExpiration}</div>
                          <div className="text-sm text-gray-500">Próximos da validade</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
                          <div className="text-sm text-gray-500">Estoque baixo</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{stats.lentItems}</div>
                          <div className="text-sm text-gray-500">Itens emprestados</div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSelectedSector(sector.id);
                          setActiveTab('products');
                        }}
                      >
                        Gerenciar produtos
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              
              {sectors.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum setor criado</h3>
                    <p className="text-gray-500 mb-4">comece criando setores</p>
                    <Button onClick={() => setActiveTab('sectors')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar setor
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sectors">
            <SectorManager onSectorUpdate={handleSectorUpdate} />
          </TabsContent>

          <TabsContent value="products">
            <ProductManager 
              sectors={sectors} 
              selectedSector={selectedSector}
              onSectorSelect={setSelectedSector}
            />
          </TabsContent>

          <TabsContent value="history">
            <ActionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
