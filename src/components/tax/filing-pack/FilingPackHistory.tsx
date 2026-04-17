import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Upload, CheckCircle2, ExternalLink } from "lucide-react";
import { FIRSSubmissionDialog } from "./FIRSSubmissionDialog";

interface FilingPack {
  id: string;
  tax_type: string;
  period_start: string;
  period_end: string;
  pdf_url: string;
  status: string;
  summary_data: any;
  generated_at: string;
  submitted_at?: string | null;
  proof_uploaded_at?: string | null;
  firs_reference?: string | null;
  submission_notes?: string | null;
  payment_amount?: number | null;
  payment_date?: string | null;
}

export function FilingPackHistory() {
  const [submissionPack, setSubmissionPack] = useState<FilingPack | null>(null);

  const { data: filingPacks, isLoading } = useQuery({
    queryKey: ["filing-packs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filing_packs")
        .select("*")
        .order("generated_at", { ascending: false });

      if (error) throw error;
      return data as FilingPack[];
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading filing packs...</div>;
  }

  if (!filingPacks || filingPacks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No filing packs generated yet. Create your first pack to get started.
        </CardContent>
      </Card>
    );
  }

  const statusVariant = (s: string): "default" | "secondary" | "outline" =>
    s === "submitted" ? "default" : s === "completed" ? "secondary" : "outline";

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">Filing Pack History</h2>
        <span className="text-xs text-muted-foreground">
          Self-filing log · TaxEase does not file on your behalf
        </span>
      </div>

      <div className="grid gap-4">
        {filingPacks.map((pack) => (
          <Card key={pack.id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-3">
                <div>
                  <CardTitle className="text-lg">
                    {pack.tax_type.toUpperCase()} Filing Pack
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Period: {new Date(pack.period_start).toLocaleDateString()} –{" "}
                    {new Date(pack.period_end).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={statusVariant(pack.status)}>{pack.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Generated</div>
                  <div className="font-medium">
                    {new Date(pack.generated_at).toLocaleDateString()}
                  </div>
                </div>
                {pack.submitted_at && (
                  <div>
                    <div className="text-muted-foreground">Filed on FIRS</div>
                    <div className="font-medium">
                      {new Date(pack.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {pack.firs_reference && (
                  <div>
                    <div className="text-muted-foreground">FIRS Ref</div>
                    <div className="font-medium font-mono text-xs">
                      {pack.firs_reference}
                    </div>
                  </div>
                )}
                {pack.payment_amount != null && (
                  <div>
                    <div className="text-muted-foreground">Paid</div>
                    <div className="font-medium">
                      ₦{Number(pack.payment_amount).toLocaleString()}
                    </div>
                  </div>
                )}
                {pack.summary_data?.netVatPayable !== undefined && !pack.payment_amount && (
                  <div>
                    <div className="text-muted-foreground">Net VAT</div>
                    <div className="font-medium">
                      ₦{Number(pack.summary_data.netVatPayable).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {pack.pdf_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(pack.pdf_url, "_blank")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Pack
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href="https://taxpromax.firs.gov.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open FIRS Portal
                  </a>
                </Button>
                <Button
                  variant={pack.submitted_at ? "outline" : "default"}
                  size="sm"
                  onClick={() => setSubmissionPack(pack)}
                >
                  {pack.submitted_at ? (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Update Submission
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Filed
                    </>
                  )}
                </Button>
                {pack.proof_uploaded_at && (
                  <Badge variant="secondary" className="self-center">
                    <Upload className="w-3 h-3 mr-1" />
                    Proof uploaded
                  </Badge>
                )}
              </div>

              {pack.submission_notes && (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  <strong>Notes:</strong> {pack.submission_notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {submissionPack && (
        <FIRSSubmissionDialog
          open={!!submissionPack}
          onOpenChange={(o) => !o && setSubmissionPack(null)}
          pack={submissionPack}
        />
      )}
    </div>
  );
}
