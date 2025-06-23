
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, Clock, ArrowUp, ArrowDown, Send, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Sector, Product } from '@/types/inventory';
import { inventoryService } from '@/services/inventoryService';

interface ProductManagerProps {
  sectors: Sector[];
  selectedSector: string | null;
  onSectorSelect: (sectorId: string) => void;
}

const ProductManager = ({ sectors, selectedSector, onSectorSelect }: ProductManagerProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityAction, setQuantityAction] = useState<'add' | 'subtract' | 'lend' | 'return'>('add');
  
  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: 0,
    expirationDate: '',
    sectorId: selectedSector || ''
  });
  const [quantityChange, setQuantityChange] = useState(0);

  useEffect(() => {
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSector]);

  useEffect(() => {
    if (selectedSector && !newProduct.sectorId) {
      setNewProduct(prev => ({ ...prev, sectorId: selectedSector }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSector]);

  const loadProducts = () => {
    if (selectedSector) {
      const loadedProducts = inventoryService.getProducts(selectedSector);
      setProducts(loadedProducts);
    } else {
      setProducts([]);
    }
  };

  const handleCreateProduct = () => {
    if (newProduct.name.trim() && newProduct.quantity >= 0 && newProduct.sectorId) {
      inventoryService.createProduct(
        newProduct.sectorId,
        newProduct.name.trim(),
        newProduct.quantity,
        newProduct.expirationDate || undefined
      );
      
      resetForm();
      setIsCreateDialogOpen(false);
      loadProducts();
      
      toast({
        title: "Produto criado",
        description: `Produto "${newProduct.name}" foi adicionado com sucesso.`,
      });
    }
  };

  const handleQuantityAction = () => {
    if (!selectedProduct || quantityChange <= 0) return;

    let success = false;
    let message = '';

    switch (quantityAction) {
      case 'add':
        success = inventoryService.updateProductQuantity(
          selectedProduct.id,
          selectedProduct.quantity + quantityChange,
          'add'
        );
        message = `Adicionadas ${quantityChange} unidades a ${selectedProduct.name}`;
        break;
      
      case 'subtract':
        if (selectedProduct.quantity >= quantityChange) {
          success = inventoryService.updateProductQuantity(
            selectedProduct.id,
            selectedProduct.quantity - quantityChange,
            'subtract'
          );
          message = ` ${quantityChange} subtraídas de ${selectedProduct.name}`;
        } else {
          toast({
            title: "Operação inválida",
            description: "Não é possível subtrair mais do que há disponível no estoque.",
            variant: "destructive",
          });
          return;
        }
        break;
      
      case 'lend':
        success = inventoryService.lendProduct(selectedProduct.id, quantityChange);
        message = `${quantityChange} unidades emprestadas de ${selectedProduct.name}`;
        break;
      
      case 'return':
        success = inventoryService.returnProduct(selectedProduct.id, quantityChange);
        message = `${quantityChange} unidades devolvidas de ${selectedProduct.name}`;
        break;
    }

    if (success) {
      setIsQuantityDialogOpen(false);
      setQuantityChange(0);
      setSelectedProduct(null);
      loadProducts();
      toast({
        title: "Sucesso",
        description: message,
      });
    }
  };

  const handleDeleteProduct = (product: Product) => {
    inventoryService.deleteProduct(product.id);
    loadProducts();
    toast({
      title: "Produto removido",
      description: `"${product.name}" foi deletado.`,
      variant: "destructive",
    });
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      quantity: 0,
      expirationDate: '',
      sectorId: selectedSector || ''
    });
  };

  const openQuantityDialog = (product: Product, action: 'add' | 'subtract' | 'lend' | 'return') => {
    setSelectedProduct(product);
    setQuantityAction(action);
    setIsQuantityDialogOpen(true);
  };

  const getProductBadges = (product: Product) => {
    const badges = [];
    
    if (product.status === 'lent') {
      badges.push(<Badge key="lent" variant="secondary">Emprestados</Badge>);
    }
    
    if (product.expirationDate && inventoryService.isNearExpiration(product.expirationDate)) {
      badges.push(<Badge key="expiring" variant="destructive">Próximo do vencimento</Badge>);
    }
    
    if (inventoryService.isLowStock(product.quantity)) {
      badges.push(<Badge key="lowstock" variant="outline" className="border-orange-500 text-orange-600">Estoque baixo</Badge>);
    }
    
    return badges;
  };

  if (!selectedSector) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um setor</h3>
          <p className="text-gray-500 mb-4">Escolha um setor para gerenciar</p>
          <Select onValueChange={onSectorSelect}>
            <SelectTrigger className="w-64 mx-auto">
              <SelectValue placeholder="Selecione um setor" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  const currentSector = sectors.find(s => s.id === selectedSector);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de produtos</h2>
          <p className="text-gray-600">
            Gerenciando os produtos de: <span className="font-medium">{currentSector?.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSector} onValueChange={onSectorSelect}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar novo produto</DialogTitle>
                <DialogDescription>
                  Adicionar novo produto ao setor {currentSector?.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">Nome do produto *</Label>
                  <Input
                    id="productName"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome do produto"
                  />
                </div>
                <div>
                  <Label htmlFor="productQuantity">Quantidade *</Label>
                  <Input
                    id="productQuantity"
                    type="number"
                    min="0"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Data de validade (Opcional)</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={newProduct.expirationDate}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, expirationDate: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateProduct}>Criar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {products.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Produtos em {currentSector?.name}</CardTitle>
            <CardDescription>
              {products.length} produto {products.length !== 1 ? 's' : ''} registrado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data de validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      {product.expirationDate 
                        ? new Date(product.expirationDate).toLocaleDateString()
                        : 'Sem validade'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {getProductBadges(product)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openQuantityDialog(product, 'add')}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openQuantityDialog(product, 'subtract')}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openQuantityDialog(product, 'lend')}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openQuantityDialog(product, 'return')}
                        >
                          <Undo className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar Produto</AlertDialogTitle>
                              <AlertDialogDescription>
                                Você tem certeza de que deseja deletar "{product.name}"? Essa ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProduct(product)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Adicione produtos a esse setor</p>
          </CardContent>
        </Card>
      )}

      {/* Quantity Action Dialog */}
      <Dialog open={isQuantityDialogOpen} onOpenChange={setIsQuantityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {quantityAction === 'add' && 'Adicionar unidades'}
              {quantityAction === 'subtract' && 'Subtrair unidades'}
              {quantityAction === 'lend' && 'Emprestar unidades'}
              {quantityAction === 'return' && 'Devolver'}
            </DialogTitle>
            <DialogDescription>
              {quantityAction === 'add' && 'Adicionar unidades do produto'}
              {quantityAction === 'subtract' && 'Remover unidades do produto'}
              {quantityAction === 'lend' && 'Emprestar unidades do produto'}
              {quantityAction === 'return' && 'Devolver unidades previamente emprestadas'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Produto: {selectedProduct?.name}</Label>
              <p className="text-sm text-gray-500">Quantidade atual: {selectedProduct?.quantity}</p>
            </div>
            <div>
              <Label htmlFor="quantityChange">Quantidade</Label>
              <Input
                id="quantityChange"
                type="number"
                min="1"
                value={quantityChange}
                onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsQuantityDialogOpen(false);
                setQuantityChange(0);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleQuantityAction}>
                {quantityAction === 'add' && 'Adicionar'}
                {quantityAction === 'subtract' && 'Subtrair'}
                {quantityAction === 'lend' && 'Emprestar'}
                {quantityAction === 'return' && 'Devolver'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
