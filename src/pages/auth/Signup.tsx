
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, loading: authLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null); // Fix type for error

  const logError = (error: any, source: string) => {
    console.error(`${source} error:`, error);
    // Add your logging logic here (e.g., send to an error tracking service)
  };

  const showUserFriendlyMessage = (error: any) => {
    let errorMessage = "Failed to create account. Please try again.";
    if (error.message?.includes("already registered")) {
      errorMessage = "This email is already registered. Please try logging in instead.";
    } else if (error.message?.includes("valid email")) {
      errorMessage = "Please enter a valid email address.";
    } else if (error.message?.includes("password")) {
      errorMessage = "Password must be at least 6 characters long.";
    }
    toast.error(errorMessage);
  };

  // Track auth state changes
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submission attempts
    if (loading || authLoading) return;
    
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Input validation
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      console.log("Starting signup process for email:", email);
      await signUp(email, password);

      console.log("Signup successful, redirecting to personal info page");
      toast.success("Account created successfully! Please check your email to confirm your account.");
      navigate("/auth/personal-info");
    } catch (err) {
      console.error("Signup error:", err);
      const error = err as Error;
      logError(error, "Signup process");
      showUserFriendlyMessage(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            ← Back to Home
          </Button>
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Create Your TaxStreamline AI Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full"
                disabled={loading || authLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full"
                disabled={loading || authLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || authLoading}>
              {loading || authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error.message || "Failed to create account. Please try again."}
              </div>
            )}
          </form>
          <div className="mt-4 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            {/* Placeholder for ReplitAuthButton -  Requires implementation */}
            <div>ReplitAuthButton Placeholder</div> 
          </div>

          <p className="text-center mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
