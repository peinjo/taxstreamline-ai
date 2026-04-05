import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const blogPosts = [
  {
    title: "Understanding Nigeria's 2026 Finance Act: What SMEs Need to Know",
    excerpt: "The Finance Act 2026 introduces key changes to VAT thresholds, CIT incentives, and digital economy taxation. Here's a breakdown of what matters for your business.",
    date: "March 28, 2026",
    category: "Tax Updates",
    readTime: "5 min read",
  },
  {
    title: "Transfer Pricing Documentation: A Step-by-Step Guide for Nigerian Companies",
    excerpt: "FIRS transfer pricing regulations require specific documentation from companies with related-party transactions. Learn how to stay compliant with our comprehensive guide.",
    date: "March 15, 2026",
    category: "Compliance",
    readTime: "8 min read",
  },
  {
    title: "How AI Is Transforming Tax Compliance in Africa",
    excerpt: "From automated calculations to predictive analytics, artificial intelligence is reshaping how businesses handle regulatory compliance across the continent.",
    date: "March 3, 2026",
    category: "Industry Insights",
    readTime: "6 min read",
  },
  {
    title: "VAT Registration: When Your Business Must Register and How",
    excerpt: "Not sure if your business needs to register for VAT? We break down the thresholds, timelines, and step-by-step process for Nigerian VAT registration.",
    date: "February 20, 2026",
    category: "Tax Updates",
    readTime: "4 min read",
  },
  {
    title: "PAYE Withholding: Common Mistakes Employers Make",
    excerpt: "Incorrect PAYE calculations can lead to penalties and employee disputes. Here are the top five mistakes we see — and how TaxEase helps you avoid them.",
    date: "February 10, 2026",
    category: "Payroll",
    readTime: "5 min read",
  },
  {
    title: "Building a Compliance-First Culture in Your Organisation",
    excerpt: "Compliance shouldn't be an afterthought. Learn practical strategies to embed regulatory awareness into your company's DNA from day one.",
    date: "January 28, 2026",
    category: "Best Practices",
    readTime: "7 min read",
  },
];

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Blog | TaxEase — Tax & Compliance Insights for Nigerian Businesses</title>
        <meta name="description" content="Expert insights on Nigerian tax law, compliance best practices, payroll, transfer pricing, and RegTech innovation from the TaxEase team." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">TaxEase</Link>
            <Button variant="outline" asChild>
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
          </div>
        </header>

        <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/10">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-4xl font-bold text-foreground mb-4">TaxEase Blog</h1>
            <p className="text-lg text-muted-foreground">
              Expert insights on Nigerian tax law, compliance, and regulatory technology.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid gap-6">
              {blogPosts.map((post, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {post.date}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
                    <span className="text-sm font-medium text-primary inline-flex items-center gap-1">
                      Read more <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Peinjo RegTech Solutions. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default Blog;
