import React from "react";

interface TaxResultProps {
  amount: number | null;
  label?: string;
}

export const TaxResult = ({ amount, label = "Calculated Tax" }: TaxResultProps) => {
  if (amount === null) return null;

  return (
    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
      <h3 className="text-lg font-semibold">{label}:</h3>
      <p className="text-2xl font-bold text-primary">
        ₦{amount.toFixed(2)}
      </p>
    </div>
  );
};