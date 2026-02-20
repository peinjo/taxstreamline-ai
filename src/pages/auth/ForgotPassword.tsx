import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset link sent to your email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 left-4">
        <Link to="/auth/login">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md p-8">
        {sent ? (
          <div className="text-center space-y-4">
            <Mail className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <p className="text-muted-foreground">
              We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
            </p>
            <Button variant="outline" onClick={() => setSent(false)} className="mt-4">
              Send again
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
            <p className="text-center text-muted-foreground mb-6">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
