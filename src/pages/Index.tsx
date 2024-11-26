import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to TaxStreamline AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your intelligent tax compliance and management solution. Streamline your tax processes, 
            manage transfer pricing, and stay compliant with global regulations.
          </p>
        </div>

        {/* Authentication Buttons */}
        <div className="flex justify-center gap-4 mb-16">
          <Link to="/auth/login">
            <Button variant="default" size="lg">
              Log In
            </Button>
          </Link>
          <Link to="/auth/signup">
            <Button variant="outline" size="lg">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Transfer Pricing</h3>
            <p className="text-gray-600">
              Manage and document your transfer pricing strategies with AI-powered assistance.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">Global Reporting</h3>
            <p className="text-gray-600">
              Stay compliant with international tax regulations and reporting requirements.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-3">AI Assistant</h3>
            <p className="text-gray-600">
              Get intelligent insights and recommendations for your tax planning needs.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;