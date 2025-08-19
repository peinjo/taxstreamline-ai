
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { cleanupAuthState } from "@/lib/auth/authUtils";
import { logError } from "@/lib/errorHandler";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, loading: authLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Component lifecycle tracking for debugging
  useEffect(() => {
    // Login component mounted - session check handled by AuthProvider
  }, []);
  
  // Handle authentication state changes
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submission attempts
    if (loading || authLoading) return;
    
    // Clean up auth state before signing in
    cleanupAuthState();
    
    setLoading(true);
    setAuthError(null);
    
    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      // Login attempt - handled by AuthProvider
      await signIn(email, password);
      // Navigation will happen automatically via auth state change
      
    } catch (error: unknown) {
      const loginError = error as Error;
      logError(loginError, "Login form submission");
      
      // Provide more user-friendly error messages
      let errorMessage = "Failed to log in";
      if (loginError.message?.toLowerCase().includes("invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (loginError.message?.toLowerCase().includes("email not confirmed")) {
        errorMessage = "Please confirm your email address before logging in";
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            ← Back to Home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {authError}
          </div>
        )}
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
              placeholder="Enter your password"
              required
              className="w-full"
              disabled={loading || authLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || authLoading}>
            {loading || authLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/auth/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
