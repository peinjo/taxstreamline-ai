import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Target, Users, Shield, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About TaxEase | Nigeria's RegTech Pioneer</title>
        <meta name="description" content="TaxEase is building the future of tax compliance and regulatory technology for Nigerian businesses. Meet the team and learn our story." />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">TaxEase</Link>
            <Button variant="outline" asChild>
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/10">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Building Nigeria's Fiscal Infrastructure
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              TaxEase RegTech Solutions is on a mission to transform how Nigerian businesses interact with tax and regulatory compliance — replacing complexity with clarity, and manual effort with intelligent automation.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-10 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { icon: Target, title: "Precision", desc: "Every calculation, every deadline, every filing — accurate to the letter of Nigerian tax law." },
                { icon: Users, title: "Accessibility", desc: "Enterprise-grade compliance tools made accessible to businesses of every size." },
                { icon: Shield, title: "Trust", desc: "Bank-level security, SOC 2-aligned practices, and full data sovereignty." },
                { icon: Lightbulb, title: "Innovation", desc: "AI-powered insights that don't just track compliance — they predict and optimise it." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground mb-6">Our Founder</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <span className="font-semibold text-foreground">John Adeniyi</span> brings deep expertise in Nigerian taxation, regulatory compliance, and technology. After years of witnessing the compliance burden faced by Nigerian SMEs and enterprises, he founded TaxEase to build the regulatory infrastructure the country deserves.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              TaxEase is headquartered in Lagos, Nigeria, serving businesses across all 36 states and the FCT.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to simplify your compliance?</h2>
            <Button size="lg" asChild>
              <Link to="/auth/signup">Get Started Free</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Peinjo RegTech Solutions. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default About;
