import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, BookOpen, FileText, HelpCircle, PlayCircle, Award, Star, Eye, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: 'guide' | 'regulation' | 'faq' | 'tutorial' | 'case_study';
  jurisdiction: string;
  tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  view_count: number;
  rating: number;
  created_at: string;
  last_updated_at: string;
}

export function KnowledgeBase() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, selectedJurisdiction]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data since the table doesn't exist yet
      const mockArticles: KnowledgeBaseArticle[] = [
        {
          id: '1',
          title: 'OECD Transfer Pricing Guidelines Overview',
          content: 'Comprehensive overview of the OECD Transfer Pricing Guidelines for Multinational Enterprises and Tax Administrations. This guide covers the fundamental principles of transfer pricing and provides practical guidance for implementation.',
          category: 'guide',
          jurisdiction: 'OECD',
          tags: ['OECD', 'guidelines', 'fundamentals'],
          difficulty_level: 'beginner',
          view_count: 150,
          rating: 4.8,
          created_at: '2024-01-15T10:00:00Z',
          last_updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Country-by-Country Reporting Requirements',
          content: 'Detailed explanation of CbC reporting requirements, deadlines, and filing procedures across different jurisdictions. Includes templates and compliance checklists.',
          category: 'regulation',
          jurisdiction: 'US',
          tags: ['CbC', 'reporting', 'compliance'],
          difficulty_level: 'intermediate',
          view_count: 89,
          rating: 4.5,
          created_at: '2024-01-10T14:30:00Z',
          last_updated_at: '2024-01-20T09:15:00Z'
        },
        {
          id: '3',
          title: 'Economic Analysis Best Practices',
          content: 'Step-by-step tutorial on conducting economic analysis for transfer pricing documentation, including selection of tested party and profit level indicators.',
          category: 'tutorial',
          jurisdiction: 'UK',
          tags: ['economic analysis', 'documentation', 'PLI'],
          difficulty_level: 'advanced',
          view_count: 67,
          rating: 4.9,
          created_at: '2024-01-05T16:45:00Z',
          last_updated_at: '2024-01-18T11:30:00Z'
        }
      ];

      setArticles(mockArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load knowledge base articles');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (articleId: string) => {
    try {
      // For now, just update the local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, view_count: article.view_count + 1 }
          : article
      ));
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleArticleView = (article: KnowledgeBaseArticle) => {
    setSelectedArticle(article);
    incrementViewCount(article.id);
  };

  const filteredArticles = articles.filter(article =>
    !searchTerm ||
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'guide': return <BookOpen className="h-4 w-4" />;
      case 'regulation': return <FileText className="h-4 w-4" />;
      case 'faq': return <HelpCircle className="h-4 w-4" />;
      case 'tutorial': return <PlayCircle className="h-4 w-4" />;
      case 'case_study': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPopularArticles = () => {
    return articles
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 5);
  };

  const getRecentArticles = () => {
    return articles
      .sort((a, b) => new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime())
      .slice(0, 5);
  };

  const renderArticleCard = (article: KnowledgeBaseArticle) => (
    <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(article.category)}
            <CardTitle className="text-lg">{article.title}</CardTitle>
          </div>
          <Badge className={getDifficultyColor(article.difficulty_level)}>
            {article.difficulty_level}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.view_count}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {article.rating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(article.last_updated_at).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3 line-clamp-3">
          {article.content.substring(0, 200)}...
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleArticleView(article)}
              >
                Read More
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedArticle?.category || 'guide')}
                  {selectedArticle?.title}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge className={getDifficultyColor(selectedArticle?.difficulty_level || 'beginner')}>
                      {selectedArticle?.difficulty_level}
                    </Badge>
                    <span>Jurisdiction: {selectedArticle?.jurisdiction}</span>
                  </div>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap">
                      {selectedArticle?.content || ''}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {selectedArticle?.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <BookOpen className="h-6 w-6" />
            Transfer Pricing Knowledge Base
          </h2>
          <p className="text-muted-foreground">
            Comprehensive guides, regulations, and best practices
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles, guides, and tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="regulation">Regulations</SelectItem>
                <SelectItem value="faq">FAQs</SelectItem>
                <SelectItem value="tutorial">Tutorials</SelectItem>
                <SelectItem value="case_study">Case Studies</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jurisdictions</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="OECD">OECD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Articles</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recently Updated</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No articles found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(renderArticleCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getPopularArticles().map(renderArticleCard)}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getRecentArticles().map(renderArticleCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}