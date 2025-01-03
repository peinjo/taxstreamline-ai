import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function TaxGuidesList() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: guides, isLoading } = useQuery({
    queryKey: ["tax-guides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_guides")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredGuides = guides?.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search guides..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />
      <Accordion type="single" collapsible className="w-full">
        {filteredGuides?.map((guide) => (
          <AccordionItem key={guide.id} value={guide.id.toString()}>
            <AccordionTrigger className="text-left">
              <div>
                <h3 className="text-lg font-semibold">{guide.title}</h3>
                <p className="text-sm text-muted-foreground">{guide.category}</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose max-w-none dark:prose-invert">
              <ReactMarkdown>{guide.content}</ReactMarkdown>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}