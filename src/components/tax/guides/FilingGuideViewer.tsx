import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, BookOpen, AlertCircle, List, BookText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import ReactMarkdown from "react-markdown";
import { GuideChecklist } from "./GuideChecklist";

interface TaxGuide {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export function FilingGuideViewer() {
  const [selectedCategory, setSelectedCategory] = useState<string>("vat_filing");
  const [viewMode, setViewMode] = useState<"read" | "checklist">("checklist");

  const { data: guides, isLoading } = useQuery({
    queryKey: ["tax-guides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_guides")
        .select("*")
        .in("category", ["vat_filing", "cit_filing", "pit_filing", "wht_filing"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TaxGuide[];
    },
  });

  const categorizedGuides = guides?.reduce((acc, guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = [];
    }
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<string, TaxGuide[]>);

  const categoryLabels: Record<string, string> = {
    vat_filing: "VAT Filing",
    cit_filing: "Corporate Income Tax",
    pit_filing: "Personal Income Tax",
    wht_filing: "Withholding Tax",
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading filing guides...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle>Tax Filing Guides</CardTitle>
        </div>
        <CardDescription>
          Step-by-step instructions for filing your tax returns in Nigeria
        </CardDescription>
      </CardHeader>
      <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Alert className="flex-1 mr-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                TaxEase prepares your filing pack — you file directly with FIRS or relevant tax authority.
                These guides help you complete the filing process.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Toggle
                pressed={viewMode === "read"}
                onPressedChange={() => setViewMode("read")}
                size="sm"
                aria-label="Read mode"
              >
                <BookText className="h-4 w-4 mr-1" />
                Read
              </Toggle>
              <Toggle
                pressed={viewMode === "checklist"}
                onPressedChange={() => setViewMode("checklist")}
                size="sm"
                aria-label="Checklist mode"
              >
                <List className="h-4 w-4 mr-1" />
                Checklist
              </Toggle>
            </div>
          </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            {Object.keys(categoryLabels).map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs md:text-sm">
                <FileText className="h-3 w-3 mr-1" />
                {categoryLabels[category]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(categoryLabels).map(([category, label]) => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[600px] w-full rounded-md border p-6">
                {categorizedGuides?.[category]?.map((guide) => (
                  <div key={guide.id}>
                    {viewMode === "checklist" ? (
                      <GuideChecklist guide={guide} />
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{guide.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
                {!categorizedGuides?.[category]?.length && (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    No guides available for {label} yet.
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
