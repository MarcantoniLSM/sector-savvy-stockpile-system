import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Sector } from "@/types/inventory";
import { inventoryService } from "@/services/inventoryService";

interface SectorManagerProps {
  onSectorUpdate: () => void;
}

const SectorManager = ({ onSectorUpdate }: SectorManagerProps) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [newSectorName, setNewSectorName] = useState("");
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = () => {
    const loadedSectors = inventoryService.getSectors();
    setSectors(loadedSectors);
  };

  const handleCreateSector = () => {
    if (newSectorName.trim()) {
      inventoryService.createSector(newSectorName.trim());
      setNewSectorName("");
      setIsCreateDialogOpen(false);
      loadSectors();
      onSectorUpdate();
      toast({
        title: "Setor criado",
        description: `O setor "${newSectorName}" foi criado com sucesso.`,
      });
    }
  };

  const handleEditSector = () => {
    if (editingSector && newSectorName.trim()) {
      inventoryService.updateSector(editingSector.id, newSectorName.trim());
      setEditingSector(null);
      setNewSectorName("");
      setIsEditDialogOpen(false);
      loadSectors();
      onSectorUpdate();
      toast({
        title: "Atualização do setor",
        description: `O setor foi renomeado para "${newSectorName}".`,
      });
    }
  };

  const handleDeleteSector = (sector: Sector) => {
    inventoryService.deleteSector(sector.id);
    loadSectors();
    onSectorUpdate();
    toast({
      title: "Setor deletado",
      description: `O sector "${sector.name}" e seus produtos foram deletados.`,
      variant: "destructive",
    });
  };

  const startEdit = (sector: Sector) => {
    setEditingSector(sector);
    setNewSectorName(sector.name);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gerenciamento de setores
          </h2>
          <p className="text-gray-600">Crie e gerencie os setores</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar setor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar novo setor</DialogTitle>
              <DialogDescription>
                Digite um nome para o setor{" "}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sectorName">Nome do setor</Label>
                <Input
                  id="sectorName"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  placeholder="Enter sector name..."
                  onKeyPress={(e) => e.key === "Enter" && handleCreateSector()}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateSector}>Criar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((sector) => (
          <Card key={sector.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {sector.name}
              </CardTitle>
              <CardDescription>
                Criado: {new Date(sector.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(sector)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar setor</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você tem certeza de que deseja deletar o setor "
                        {sector.name}"? Isso também vai deletar todos os
                        produtor nele. Essa ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSector(sector)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sectors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum setor encontrado
            </h3>
            <p className="text-gray-500">
              Crie setores para gerenciar
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar setor</DialogTitle>
            <DialogDescription>Atualizar o nome do setor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editSectorName">Nome do setor</Label>
              <Input
                id="editSectorName"
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
                placeholder="Digite um nome para o setor..."
                onKeyPress={(e) => e.key === "Enter" && handleEditSector()}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditSector}>Atualizar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectorManager;
