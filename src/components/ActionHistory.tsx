
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
          Action History
        </h2>
        <p className="text-gray-600">Complete log of all inventory operations</p>
      </div>

      {history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              {history.length} action{history.length !== 1 ? 's' : ''} recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Responsible</TableHead>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No actions recorded</h3>
            <p className="text-gray-500">Start managing your inventory to see activity history here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActionHistory;
