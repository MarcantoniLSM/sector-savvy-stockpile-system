
import { useState, useEffect } from 'react';
import { History, Calendar, User, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ActionHistory as ActionHistoryType } from '@/types/inventory';
import { inventoryService } from '@/services/inventoryService';

const ActionHistory = () => {
  const [history, setHistory] = useState<ActionHistoryType[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const loadedHistory = inventoryService.getHistory();
    setHistory(loadedHistory);
  };

  const getActionBadge = (action: ActionHistoryType['type']) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants: Record<ActionHistoryType['type'], { variant: any; label: string }> = {
      add: { variant: 'default', label: 'Added' },
      subtract: { variant: 'secondary', label: 'Subtracted' },
      lend: { variant: 'outline', label: 'Lent' },
      return: { variant: 'default', label: 'Returned' },
      delete: { variant: 'destructive', label: 'Deleted' }
    };

    const config = variants[action];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="h-6 w-6" />
          Histórico
        </h2>
        <p className="text-gray-600">Log completo de todas as operações dos inventários</p>
      </div>

      {history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Atividades recentes</CardTitle>
            <CardDescription>
              {history.length} Ações registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ação</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data e hora</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((action) => {
                  const { date, time } = formatTimestamp(action.timestamp);
                  return (
                    <TableRow key={action.id}>
                      <TableCell>
                        {getActionBadge(action.type)}
                      </TableCell>
                      <TableCell className="font-medium">{action.productName}</TableCell>
                      <TableCell>{action.sectorName}</TableCell>
                      <TableCell>
                        <span className="font-mono">{action.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{date}</span>
                          <span className="text-xs text-gray-500">{time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-sm">{action.responsible}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ação encontrada</h3>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActionHistory;
