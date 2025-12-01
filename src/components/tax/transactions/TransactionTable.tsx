import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, FileText } from "lucide-react";
import { Transaction } from "./TransactionList";
import { Badge } from "@/components/ui/badge";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, isLoading, onDelete }: TransactionTableProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>;
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet. Add your first transaction to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell className="max-w-xs truncate">
                {transaction.description || "—"}
              </TableCell>
              <TableCell className={`text-right font-medium ${
                transaction.type === "income" ? "text-green-600" : "text-red-600"
              }`}>
                {transaction.type === "income" ? "+" : "-"}₦{transaction.amount.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {transaction.source.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {transaction.receipt_file_id && (
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}