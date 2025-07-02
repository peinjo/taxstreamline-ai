import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Info } from 'lucide-react';
import type { ControlledTransaction, ValidationResult } from '../../types/wizard-types';

const TRANSACTION_TYPES = [
  { value: 'tangible_goods', label: 'Sale/Purchase of Tangible Goods' },
  { value: 'intangible_property', label: 'Transfer of Intangible Property' },
  { value: 'services', label: 'Provision of Services' },
  { value: 'financial_transactions', label: 'Financial Transactions' },
  { value: 'other', label: 'Other Transactions' }
];

const PRICING_METHODS = [
  { value: 'CUP', label: 'Comparable Uncontrolled Price (CUP)' },
  { value: 'TNMM', label: 'Transactional Net Margin Method (TNMM)' },
  { value: 'CPM', label: 'Cost Plus Method (CPM)' },
  { value: 'PSM', label: 'Profit Split Method (PSM)' },
  { value: 'OTHER', label: 'Other Method' }
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'HKD'];

interface ControlledTransactionsStepProps {
  data: ControlledTransaction[];
  onChange: (data: ControlledTransaction[]) => void;
  validation: ValidationResult;
}

export function ControlledTransactionsStep({ data, onChange, validation }: ControlledTransactionsStepProps) {
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);

  const addTransaction = () => {
    const newTransaction: ControlledTransaction = {
      id: `tx_${Date.now()}`,
      type: 'tangible_goods',
      description: '',
      relatedParties: [''],
      amount: 0,
      currency: 'USD',
      pricingMethod: 'CUP',
      jurisdiction: '',
      taxYear: new Date().getFullYear().toString(),
      supportingDocuments: []
    };

    onChange([...data, newTransaction]);
    setEditingTransaction(newTransaction.id);
  };

  const updateTransaction = (id: string, updates: Partial<ControlledTransaction>) => {
    const updated = data.map(tx => 
      tx.id === id ? { ...tx, ...updates } : tx
    );
    onChange(updated);
  };

  const removeTransaction = (id: string) => {
    onChange(data.filter(tx => tx.id !== id));
    if (editingTransaction === id) {
      setEditingTransaction(null);
    }
  };

  const addRelatedParty = (transactionId: string) => {
    const transaction = data.find(tx => tx.id === transactionId);
    if (transaction) {
      updateTransaction(transactionId, {
        relatedParties: [...transaction.relatedParties, '']
      });
    }
  };

  const updateRelatedParty = (transactionId: string, index: number, value: string) => {
    const transaction = data.find(tx => tx.id === transactionId);
    if (transaction) {
      const updatedParties = [...transaction.relatedParties];
      updatedParties[index] = value;
      updateTransaction(transactionId, { relatedParties: updatedParties });
    }
  };

  const removeRelatedParty = (transactionId: string, index: number) => {
    const transaction = data.find(tx => tx.id === transactionId);
    if (transaction && transaction.relatedParties.length > 1) {
      const updatedParties = transaction.relatedParties.filter((_, i) => i !== index);
      updateTransaction(transactionId, { relatedParties: updatedParties });
    }
  };

  const getTotalTransactionValue = () => {
    return data.reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getTransactionTypeLabel = (type: string) => {
    return TRANSACTION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getPricingMethodLabel = (method: string) => {
    return PRICING_METHODS.find(m => m.value === method)?.label || method;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Document all material controlled transactions as required by OECD BEPS Action 13. 
          Include transactions with related entities that exceed local materiality thresholds.
        </AlertDescription>
      </Alert>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction Summary</span>
            <Badge variant="outline">
              {data.length} Transaction{data.length !== 1 ? 's' : ''} | 
              Total Value: ${getTotalTransactionValue().toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{data.filter(tx => tx.type === 'tangible_goods').length}</div>
              <div className="text-sm text-muted-foreground">Tangible Goods</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{data.filter(tx => tx.type === 'intangible_property').length}</div>
              <div className="text-sm text-muted-foreground">Intangibles</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{data.filter(tx => tx.type === 'services').length}</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <div className="space-y-4">
        {data.map((transaction, index) => (
          <Card key={transaction.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Transaction {index + 1}: {getTransactionTypeLabel(transaction.type)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {transaction.currency} {transaction.amount.toLocaleString()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTransaction(
                      editingTransaction === transaction.id ? null : transaction.id
                    )}
                  >
                    {editingTransaction === transaction.id ? 'Collapse' : 'Expand'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTransaction(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editingTransaction === transaction.id && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Transaction Type *</Label>
                    <Select
                      value={transaction.type}
                      onValueChange={(value: any) => updateTransaction(transaction.id, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSACTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tax Year *</Label>
                    <Input
                      value={transaction.taxYear}
                      onChange={(e) => updateTransaction(transaction.id, { taxYear: e.target.value })}
                      placeholder="e.g., 2023"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      value={transaction.amount}
                      onChange={(e) => updateTransaction(transaction.id, { amount: Number(e.target.value) })}
                      placeholder="Transaction amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Currency *</Label>
                    <Select
                      value={transaction.currency}
                      onValueChange={(value) => updateTransaction(transaction.id, { currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Pricing Method *</Label>
                    <Select
                      value={transaction.pricingMethod}
                      onValueChange={(value: any) => updateTransaction(transaction.id, { pricingMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICING_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Jurisdiction</Label>
                    <Input
                      value={transaction.jurisdiction}
                      onChange={(e) => updateTransaction(transaction.id, { jurisdiction: e.target.value })}
                      placeholder="Tax jurisdiction"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Transaction Description *</Label>
                  <Textarea
                    value={transaction.description}
                    onChange={(e) => updateTransaction(transaction.id, { description: e.target.value })}
                    placeholder="Detailed description of the transaction, including business rationale..."
                    rows={3}
                  />
                </div>

                {/* Related Parties */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Related Parties *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addRelatedParty(transaction.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Party
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {transaction.relatedParties.map((party, partyIndex) => (
                      <div key={partyIndex} className="flex items-center gap-2">
                        <Input
                          value={party}
                          onChange={(e) => updateRelatedParty(transaction.id, partyIndex, e.target.value)}
                          placeholder="Related party name"
                          className="flex-1"
                        />
                        {transaction.relatedParties.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRelatedParty(transaction.id, partyIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add Transaction Button */}
      <Card>
        <CardContent className="p-6 text-center">
          <Button onClick={addTransaction} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Controlled Transaction
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Add all material intercompany transactions for OECD compliance
          </p>
        </CardContent>
      </Card>

      {/* OECD Guidelines */}
      {data.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>OECD Guidelines:</strong> Ensure pricing methods align with OECD Transfer Pricing Guidelines. 
            For intangible property transactions, consider DEMPE (Development, Enhancement, Maintenance, 
            Protection, and Exploitation) analysis requirements.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}