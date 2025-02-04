import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubmitFiling } from "@/hooks/useTaxFiling";
import { toast } from "sonner";

export function FilingForm() {
  const { mutate: submitFiling, isPending } = useSubmitFiling();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    submitFiling({
      type: formData.get("filingType") as string,
      data: {
        year: formData.get("taxYear"),
        description: formData.get("description"),
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="filingType" className="block text-sm font-medium mb-1">
            Filing Type
          </label>
          <Select name="filingType" required>
            <SelectTrigger>
              <SelectValue placeholder="Select filing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corporate">Corporate Tax</SelectItem>
              <SelectItem value="personal">Personal Income Tax</SelectItem>
              <SelectItem value="vat">VAT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="taxYear" className="block text-sm font-medium mb-1">
            Tax Year
          </label>
          <Input
            type="number"
            name="taxYear"
            min={2000}
            max={new Date().getFullYear()}
            defaultValue={new Date().getFullYear()}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Input
            type="text"
            name="description"
            placeholder="Additional details about this filing"
          />
        </div>

        <div>
          <label htmlFor="documents" className="block text-sm font-medium mb-1">
            Supporting Documents
          </label>
          <Input
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