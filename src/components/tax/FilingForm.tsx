import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubmitFiling } from "@/hooks/useTaxFiling";
import { toast } from "sonner";
import { sendTaxNotification } from "@/utils/notifications";

export function FilingForm() {
  const { user } = useAuth();
  const { mutate: submitFiling, isPending } = useSubmitFiling();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const filingData = {
        type: formData.get("filingType") as string,
        data: {
          year: formData.get("taxYear"),
          description: formData.get("description"),
        }
      };

      await submitFiling(filingData);
      
      // Send email notification
      await sendTaxNotification({
        type: 'filing_confirmation',
        userEmail: user?.email || '',
        userName: user?.user_metadata?.full_name || 'Valued Customer',
        data: {
          filingType: filingData.type,
          filingDate: new Date().toLocaleDateString(),
          reference: `FILING-${Date.now()}`
        }
      });

      toast.success("Filing submitted successfully");
    } catch (error) {
      toast.error("Failed to submit filing");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="filingType" className="block text-sm font-medium mb-1">
            Filing Type
          </label>
          <select name="filingType" required className="block w-full">
            <option value="corporate">Corporate Tax</option>
            <option value="personal">Personal Income Tax</option>
            <option value="vat">VAT</option>
          </select>
        </div>

        <div>
          <label htmlFor="taxYear" className="block text-sm font-medium mb-1">
            Tax Year
          </label>
          <input
            type="number"
            name="taxYear"
            min={2000}
            max={new Date().getFullYear()}
            defaultValue={new Date().getFullYear()}
            required
            className="block w-full"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            placeholder="Additional details about this filing"
            className="block w-full"
          />
        </div>

        <div>
          <label htmlFor="documents" className="block text-sm font-medium mb-1">
            Supporting Documents
          </label>
          <input
            type="file"
            name="documents"
            accept=".pdf,.doc,.docx"
            multiple
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Filing"}
      </Button>
    </form>
  );
}
