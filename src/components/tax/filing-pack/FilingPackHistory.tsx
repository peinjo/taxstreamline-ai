import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Upload } from "lucide-react";

interface FilingPack {
  id: string;
  tax_type: string;
  period_start: string;
  period_end: string;
  pdf_url: string;
  status: string;
  summary_data: any;
  generated_at: string;
  submitted_at?: string;
  proof_uploaded_at?: string;
}

export function FilingPackHistory() {
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Filing Pack History</h2>
      
      <div className="grid gap-4">
        {filingPacks.map((pack) => (
          <Card key={pack.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {pack.tax_type.toUpperCase()} Filing Pack
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Period: {new Date(pack.period_start).toLocaleDateString()} - {new Date(pack.period_end).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={
                  pack.status === "completed" ? "default" :
                  pack.status === "submitted" ? "secondary" :
                  "outline"
                }>
                  {pack.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Generated</div>
                  <div className="font-medium">{new Date(pack.generated_at).toLocaleDateString()}</div>
                </div>
                {pack.submitted_at && (
                  <div>
                    <div className="text-muted-foreground">Submitted</div>
                    <div className="font-medium">{new Date(pack.submitted_at).toLocaleDateString()}</div>
                  </div>
                )}
                {pack.summary_data?.netVatPayable !== undefined && (
                  <div>
                    <div className="text-muted-foreground">Net VAT</div>
                    <div className="font-medium">₦{pack.summary_data.netVatPayable.toLocaleString()}</div>
                  </div>
                )}
                {pack.proof_uploaded_at && (
                  <div>
                    <div className="text-muted-foreground">Proof Uploaded</div>
                    <div className="font-medium">{new Date(pack.proof_uploaded_at).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(pack.pdf_url, "_blank")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Pack
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Proof
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}