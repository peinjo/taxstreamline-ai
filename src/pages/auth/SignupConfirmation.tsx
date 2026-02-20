import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";

const SignupConfirmation = () => {
  const location = useLocation();
  const email = (location.state as any)?.email || "your email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 text-center space-y-4">
        <Mail className="h-16 w-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Check Your Email</h2>
        <p className="text-muted-foreground">
          We've sent a confirmation link to <strong>{email}</strong>. Please click the link to verify your account before logging in.
        </p>
        <p className="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or try signing up again.
        </p>
        <Link to="/auth/login">
          <Button className="mt-4 w-full">Go to Login</Button>
        </Link>
      </Card>
    </div>
  );
};

export default SignupConfirmation;
