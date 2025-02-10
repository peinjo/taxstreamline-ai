
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useTransferPricing } from '@/contexts/TransferPricingContext';
import type { EntityDetails, ControlledTransaction, PricingMethod } from '@/types/transfer-pricing';

const PRICING_METHODS: PricingMethod[] = ['CUP', 'TNMM', 'CPM', 'PSM', 'OTHER'];

export function DocumentWizard() {
  const [step, setStep] = useState(1);
  const [entityDetails, setEntityDetails] = useState<EntityDetails>({
    companyName: '',
    structure: '',
    ownership: '',
    functions: [],
    risks: [],
    assets: [],
  });
  const [transactions, setTransactions] = useState<ControlledTransaction[]>([]);
  const { createDocument } = useTransferPricing();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    await createDocument({
      type: 'local',
      content: {
        entityDetails,
        transactions,
      },
      status: 'draft',
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((number) => (
          <div
            key={number}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= number ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {number}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Entity Details</h3>
          <Input
            placeholder="Company Name"
            value={entityDetails.companyName}
            onChange={(e) =>
              setEntityDetails({ ...entityDetails, companyName: e.target.value })
            }
          />
          <Textarea
            placeholder="Company Structure"
            value={entityDetails.structure}
            onChange={(e) =>
              setEntityDetails({ ...entityDetails, structure: e.target.value })
            }
          />
          <Textarea
            placeholder="Ownership Details"
            value={entityDetails.ownership}
            onChange={(e) =>
              setEntityDetails({ ...entityDetails, ownership: e.target.value })
            }
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Controlled Transactions</h3>
          {transactions.map((transaction, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-2">
              <Input
                placeholder="Transaction Type"
                value={transaction.type}
                onChange={(e) => {
                  const newTransactions = [...transactions];
                  newTransactions[index].type = e.target.value;
                  setTransactions(newTransactions);
                }}
              />
              <Input
                type="number"
                placeholder="Amount"
                value={transaction.amount}
                onChange={(e) => {
                  const newTransactions = [...transactions];
                  newTransactions[index].amount = Number(e.target.value);
                  setTransactions(newTransactions);
                }}
              />
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setTransactions([
                ...transactions,
                {
                  type: '',
                  parties: [],
                  amount: 0,
                  currency: 'USD',
                  pricingMethod: 'CUP',
                  description: '',
                },
              ])
            }
          >
            Add Transaction
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select Pricing Methods</h3>
          {transactions.map((transaction, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-2">
              <p className="font-medium">{transaction.type}</p>
              <Select
                value={transaction.pricingMethod}
                onValueChange={(value: PricingMethod) => {
                  const newTransactions = [...transactions];
                  newTransactions[index].pricingMethod = value;
                  setTransactions(newTransactions);
                }}
              >
                {PRICING_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review & Generate</h3>
          <div className="p-4 border rounded-lg">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify({ entityDetails, transactions }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        {step > 1 && (
          <Button onClick={handleBack} variant="outline">
            Back
          </Button>
        )}
        {step < 4 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Generate Document</Button>
        )}
      </div>
    </div>
  );
}
