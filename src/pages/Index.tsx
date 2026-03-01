import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Brain,
  Calculator,
  FileText,
  PieChart,
  Shield,
  Camera,
  Receipt,
  Users,
  Clock,
  CheckCircle2,
  Star,
  ChevronRight,
  Zap,
  Globe,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const features = [
  {
    icon: Calculator,
    title: "Tax Calculations",
    description: "VAT, CIT, PAYE, WHT, Capital Gains — all Nigerian tax types computed instantly with up-to-date rates.",
    color: "bg-primary",
  },
  {
    icon: Camera,
    title: "Snap, Upload, Comply",
    description: "Photograph receipts and let AI extract amounts, VAT, and vendor details. Expense tracking on autopilot.",
    color: "bg-emerald-600",
  },
  {
    icon: Brain,
    title: "AI Tax Assistant",
    description: "Ask complex tax questions in plain English and get regulation-backed answers in seconds.",
    color: "bg-violet-600",
  },
  {
    icon: Globe,
    title: "Transfer Pricing",
    description: "Master & Local File templates, benchmarking analysis, and OECD-compliant documentation.",
    color: "bg-sky-600",
  },
  {
    icon: Shield,
    title: "Compliance Tracker",
    description: "Never miss a deadline. Automated alerts across all jurisdictions with calendar sync.",
    color: "bg-amber-600",
  },
  {
    icon: BarChart3,
    title: "Audit & Reporting",
    description: "Generate institutional-grade filing packs, audit trails, and regulatory reports.",
    color: "bg-rose-600",
  },
];

const stats = [
  { value: "15+", label: "Tax Types Supported" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 2min", label: "Average Filing Time" },
  { value: "256-bit", label: "Bank-Grade Encryption" },
];

const testimonials = [
  {
    quote: "TaxEase cut our tax preparation time by 80%. What took our team days now takes minutes.",
    name: "Adebayo Oluwaseun",
    role: "CFO, Lagos Manufacturing Ltd",
    stars: 5,
  },
  {
    quote: "The transfer pricing module alone saved us ₦2M in consulting fees. Institutional quality at SME prices.",
    name: "Chioma Nwankwo",
    role: "Tax Manager, Abuja Tech Group",
    stars: 5,
  },
  {
    quote: "Finally, a Nigerian tax platform that actually understands FIRS requirements. Game changer.",
    name: "Ibrahim Musa",
    role: "Partner, Kano Advisory Services",
    stars: 5,
  },
];

const pricingPreview = [
  {
    name: "Starter",
    price: "₦5,000",
    period: "/month",
    description: "For freelancers & micro businesses",
    features: ["Tax calculations", "Receipt capture", "Basic invoicing", "Email support"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "₦12,000",
    period: "/month",
    description: "For growing SMEs",
    features: ["Everything in Starter", "Transfer pricing", "AI assistant", "Compliance tracker", "Priority support"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: ["Everything in Pro", "White-labeling", "Dedicated account manager", "Custom integrations", "SLA guarantee"],
    highlight: false,
  },
];

const Index = () => {
  return (
    <>
      <Helmet>
        <title>TaxEase — Nigeria's Smartest Tax & Compliance Platform</title>
        <meta name="description" content="Automate tax calculations, compliance tracking, and filing for Nigerian businesses. AI-powered, FIRS-ready, bank-grade security." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold tracking-tight text-primary">
              TaxEase
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="sm" className="gap-1">
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="md:hidden flex gap-2">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="sm">Start Free</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container mx-auto px-4 pt-20 pb-24 relative">
            <motion.div
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto text-center space-y-8"
            >
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <Zap className="h-3.5 w-3.5" /> Nigeria's #1 RegTech Platform
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              >
                Tax compliance,{" "}
                <span className="text-primary">simplified.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Calculate, prepare, and file your Nigerian taxes in minutes — not days.
                AI-powered automation for VAT, CIT, PAYE, transfer pricing, and more.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base h-12 px-8">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                    See How It Works
                  </Button>
                </a>
              </motion.div>

              <motion.p variants={fadeUp} custom={4} className="text-xs text-muted-foreground">
                No credit card required · Free 14-day trial · Cancel anytime
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-border bg-muted/30">
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything you need for Nigerian tax compliance
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                From receipt capture to regulatory filing — one platform, zero headaches.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-muted-foreground text-lg">Start free. Upgrade when you're ready.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricingPreview.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 rounded-2xl border ${
                    plan.highlight
                      ? "border-primary bg-card shadow-xl shadow-primary/10 scale-[1.02]"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/pricing">
                    <Button
                      className="w-full"
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Nigerian businesses</h2>
              <p className="text-muted-foreground text-lg">See what our users say about TaxEase.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-border bg-card"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed mb-6">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-3xl p-10 md:p-16 text-center text-primary-foreground max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to automate your tax compliance?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto text-lg">
                Join hundreds of Nigerian businesses saving time and money with TaxEase.
              </p>
              <Link to="/auth/signup">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base">
                  Start Your Free Trial <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-lg font-bold text-primary mb-3">TaxEase</h4>
                <p className="text-muted-foreground text-sm">
                  Nigeria's smartest tax and compliance platform for businesses of every size.
                </p>
              </div>
              <div>
                <h5 className="font-semibold mb-3 text-sm">Product</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                  <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-3 text-sm">Company</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-3 text-sm">Legal</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Peinjo RegTech Solutions. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
