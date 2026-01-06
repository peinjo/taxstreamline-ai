import React, { useState } from 'react';
import { Search, X, ChevronRight, BookOpen, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useHelp } from '@/contexts/HelpContext';
import { faqs, faqCategories, searchFAQs, getFAQsByCategory, FAQItem } from '@/lib/help/content';
import { trackHelpAction } from '@/lib/analytics/events';

export const HelpCenter: React.FC = () => {
  const { isHelpOpen, closeHelp } = useHelp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const displayedFAQs = searchQuery
    ? searchFAQs(searchQuery)
    : selectedCategory
    ? getFAQsByCategory(selectedCategory)
    : faqs;

  const handleFAQClick = (faqId: string) => {
    trackHelpAction('faq_view', faqId);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setSearchQuery('');
  };

  return (
    <Dialog open={isHelpOpen} onOpenChange={(open) => !open && closeHelp()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Help Center
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedCategory(null);
            }}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-2">
            {faqCategories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        )}

        {/* FAQ List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {displayedFAQs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No results found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Try adjusting your search or browse categories
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {displayedFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger
                    onClick={() => handleFAQClick(faq.id)}
                    className="text-left hover:no-underline"
                  >
                    <div className="flex items-start gap-3">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-7 pr-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {faq.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t pt-4 mt-auto">
          <p className="text-sm text-muted-foreground text-center">
            Can't find what you're looking for?{' '}
            <a href="mailto:support@taxpro.ng" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
