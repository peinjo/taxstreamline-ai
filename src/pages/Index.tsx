
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Calculator, FileText, PieChart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Welcome to TaxPal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your tax operations with AI-powered insights, comprehensive transfer pricing, and advanced audit reporting
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-blue-50 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">AI Tax Assistant</h3>
              <p className="text-gray-600">
                Get instant answers to your tax queries and smart recommendations powered by AI
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Transfer Pricing</h3>
              <p className="text-gray-600">
                Manage and document your transfer pricing with precision and compliance
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Audit & Reporting</h3>
              <p className="text-gray-600">
                Generate comprehensive reports and maintain audit-ready documentation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your tax management?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using TaxPal to streamline their tax operations
          </p>
          <Link to="/auth/signup">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
