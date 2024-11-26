import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to TaxStreamline AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your intelligent tax compliance and management solution. Streamline your tax processes, 
            manage transfer pricing, and stay compliant with global regulations.
          </p>
          
          {/* Authentication Buttons */}
          <div className="flex justify-center gap-4 mb-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/auth/login">
                <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90">
                  Log In
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/auth/signup">
                <Button variant="outline" size="lg">
                  Sign Up
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" 
                alt="Transfer Pricing" 
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold mb-3">Transfer Pricing</h3>
              <p className="text-gray-600">
                Manage and document your transfer pricing strategies with AI-powered assistance.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80" 
                alt="Global Reporting" 
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold mb-3">Global Reporting</h3>
              <p className="text-gray-600">
                Stay compliant with international tax regulations and reporting requirements.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80" 
                alt="AI Assistant" 
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold mb-3">AI Assistant</h3>
              <p className="text-gray-600">
                Get intelligent insights and recommendations for your tax planning needs.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;