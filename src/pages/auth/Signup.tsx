import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { validateInput, signupSchema } from "@/lib/validation/schemas";
import { checkAuthRateLimit } from "@/lib/security/rateLimiter";
import { auditLogger } from "@/lib/security/auditLogger";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, loading: authLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      // Validate input data  
      const validation = validateInput(signupSchema, { email, password, confirmPassword });
      if (!validation.success) {
        throw new Error(validation.error);
      }

      // Check rate limiting
      const rateLimit = checkAuthRateLimit(email, 'signup');
      if (!rateLimit.allowed) {
        const minutes = Math.ceil(rateLimit.timeUntilReset / 1000 / 60);
        throw new Error(`Too many signup attempts. Please try again in ${minutes} minute(s).`);
      }

      // Begin signup process
      await signUp(email, password);

      // Signup successful, show confirmation page
      navigate("/auth/signup-confirmation", { state: { email } });
    } catch (err) {
      // Handle signup errors with proper logging
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
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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

          <p className="text-center mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary hover:underline">
              Log In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;