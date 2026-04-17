import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface FIRSSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pack: {
    id: string;
    tax_type: string;
    period_start: string;
    period_end: string;
    firs_reference?: string | null;
    submission_notes?: string | null;
    payment_amount?: number | null;
    payment_date?: string | null;
    submitted_at?: string | null;
  };
}

export function FIRSSubmissionDialog({ open, onOpenChange, pack }: FIRSSubmissionDialogProps) {
  const queryClient = useQueryClient();
  const [firsReference, setFirsReference] = useState(pack.firs_reference || "");
  const [paymentAmount, setPaymentAmount] = useState(
    pack.payment_amount?.toString() || ""
  );
  const [paymentDate, setPaymentDate] = useState(
    pack.payment_date || new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(pack.submission_notes || "");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let proofUploadedAt: string | null = pack.submitted_at ? null : null;

      // Upload proof file if provided
      if (proofFile) {
        const ext = proofFile.name.split(".").pop();
        const path = `${user.id}/${pack.id}-proof-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("filing-proofs")
          .upload(path, proofFile, { upsert: true });
        if (upErr) throw upErr;
        proofUploadedAt = new Date().toISOString();
      }

      const update: Record<string, unknown> = {
        firs_reference: firsReference || null,
        submission_notes: notes || null,
        payment_amount: paymentAmount ? Number(paymentAmount) : null,
        payment_date: paymentDate || null,
        submitted_at: new Date().toISOString(),
        status: "submitted",
      };
      if (proofUploadedAt) update.proof_uploaded_at = proofUploadedAt;

      const { error } = await supabase
        .from("filing_packs")
        .update(update)
        .eq("id", pack.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filing-packs"] });
      toast.success("FIRS submission logged");
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log FIRS Submission</DialogTitle>
          <DialogDescription>
            {pack.tax_type.toUpperCase()} pack ·{" "}
            {new Date(pack.period_start).toLocaleDateString()} –{" "}
            {new Date(pack.period_end).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Self-filed log:</strong> TaxEase prepares your filing pack — you
            file directly on the{" "}
            <a
              href="https://taxpromax.firs.gov.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              FIRS TaxPro-Max portal
            </a>
            . Use this form to record what you submitted.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="firs-ref">FIRS Reference / Receipt Number</Label>
            <Input
              id="firs-ref"
              value={firsReference}
              onChange={(e) => setFirsReference(e.target.value)}
              placeholder="e.g. FIRS/VAT/2025/00012345"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Paid (₦)</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-date">Payment Date</Label>
              <Input
                id="pay-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Upload Proof (FIRS receipt / Remita slip)</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            />
            {proofFile && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Upload className="h-3 w-3" /> {proofFile.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details about this submission…"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {submitMutation.isPending ? "Saving…" : "Mark as Filed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
