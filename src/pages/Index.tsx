
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Welcome to TaxPal
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
          Streamline your tax management with our comprehensive suite of tools
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/auth/login">
            <Button variant="default" size="lg">
              Sign In
            </Button>
          </Link>
          <Link to="/auth/signup">
            <Button variant="outline" size="lg">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
