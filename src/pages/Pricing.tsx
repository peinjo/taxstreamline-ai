import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, ArrowRight, ArrowLeft, Zap } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 5000,
    annualPrice: 48000,
    description: "For freelancers & micro businesses",
    features: [
      "All Nigerian tax calculations",
      "Receipt capture & categorization",
      "Basic invoicing (10/month)",
      "Filing pack generator",
      "Email support",
      "1 user",
    ],
    highlight: false,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    monthlyPrice: 12000,
    annualPrice: 115200,
    description: "For growing SMEs",
    features: [
      "Everything in Starter",
      "Unlimited invoicing",
      "Transfer pricing toolkit",
      "AI tax assistant",
      "Compliance deadline tracker",
      "Payroll management",
      "Audit & reporting",
      "Priority support",
      "Up to 5 users",
    ],
    highlight: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    description: "For large organizations & firms",
    features: [
      "Everything in Pro",
      "White-labeling",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Unlimited users",
      "On-premise option",
      "API access",
    ],
    highlight: false,
    cta: "Contact Sales",
  },
];

const faqs = [
  {
    q: "Can I try TaxEase before paying?",
    a: "Yes! All plans include a free 14-day trial with full access. No credit card required.",
  },
  {
    q: "How does billing work?",
    a: "We bill monthly or annually via Paystack. Annual plans save you 20%. You can upgrade, downgrade, or cancel at any time.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use 256-bit AES encryption, role-based access controls, and are compliant with NDPR regulations. Your data never leaves secure Nigerian/global data centers.",
  },
  {
    q: "What tax types are supported?",
    a: "VAT, CIT, PIT/PAYE, WHT, Capital Gains, Stamp Duty, Education Tax, Petroleum Profit Tax, and more. We update rates as FIRS publishes changes.",
  },
  {
    q: "Can I add more users later?",
    a: "Yes. You can add users anytime. Starter supports 1 user, Pro up to 5, and Enterprise is unlimited.",
  },
];

const Pricing = () => {
  const [annual, setAnnual] = useState(false);

  const formatPrice = (price: number | null) => {
    if (price === null) return "Custom";
    return `₦${price.toLocaleString()}`;
  };

  return (
    <>
      <Helmet>
        <title>Pricing — TaxEase</title>
        <meta name="description" content="Simple, transparent pricing for Nigerian tax compliance. Start free, upgrade when ready." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <Link to="/" className="text-2xl font-bold tracking-tight text-primary">
              TaxEase
            </Link>
            <Link to="/auth/signup">
              <Button size="sm" className="gap-1">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </nav>

        {/* Header */}
        <section className="pt-16 pb-8 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose your plan</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Start free. Scale as you grow. No hidden fees.
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm ${!annual ? "text-foreground font-medium" : "text-muted-foreground"}`}>Monthly</span>
              <Switch checked={annual} onCheckedChange={setAnnual} />
              <span className={`text-sm ${annual ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Annual <span className="text-primary text-xs font-semibold ml-1">Save 20%</span>
              </span>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 rounded-2xl border flex flex-col ${
                    plan.highlight
                      ? "border-primary bg-card shadow-xl shadow-primary/10 scale-[1.02]"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-bold">
                      {formatPrice(annual ? plan.annualPrice : plan.monthlyPrice)}
                    </span>
                    {plan.monthlyPrice !== null && (
                      <span className="text-muted-foreground">/{annual ? "year" : "month"}</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.name === "Enterprise" ? "#" : "/auth/signup"}>
                    <Button
                      className="w-full"
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">Start your free 14-day trial today. No credit card required.</p>
            <Link to="/auth/signup">
              <Button size="lg" className="h-12 px-8">
                Start Free Trial <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
