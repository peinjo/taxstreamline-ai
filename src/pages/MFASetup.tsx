import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldOff, Smartphone, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MFASetup = () => {
  const { user } = useAuth();
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [showUnenroll, setShowUnenroll] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFactors(data?.totp || []);
    } catch {
      toast.error("Failed to load MFA factors");
    } finally {
      setLoading(false);
    }
  };

  const startEnrollment = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });
      if (error) throw error;
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (e: any) {
      toast.error(e.message || "Failed to start MFA enrollment");
      setEnrolling(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!factorId || verifyCode.length !== 6) return;
    setVerifying(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });
      if (verify.error) throw verify.error;

      toast.success("MFA enabled successfully! Your account is now more secure.");
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerifyCode("");
      setEnrolling(false);
      loadFactors();
    } catch (e: any) {
      toast.error(e.message || "Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const unenrollFactor = async (id: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) throw error;
      toast.success("MFA factor removed");
      setShowUnenroll(null);
      loadFactors();
    } catch (e: any) {
      toast.error(e.message || "Failed to remove factor");
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const verifiedFactors = factors.filter(f => f.status === "verified");
  const isProtected = verifiedFactors.length > 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Multi-Factor Authentication</h1>
          <p className="text-muted-foreground">Add an extra layer of security to your account</p>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isProtected ? (
                  <ShieldCheck className="h-8 w-8 text-green-500" />
                ) : (
                  <ShieldOff className="h-8 w-8 text-destructive" />
                )}
                <div>
                  <CardTitle>{isProtected ? "MFA Enabled" : "MFA Not Enabled"}</CardTitle>
                  <CardDescription>
                    {isProtected
                      ? `${verifiedFactors.length} authenticator(s) configured`
                      : "Your account is protected by password only"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={isProtected ? "default" : "destructive"}>
                {isProtected ? "Protected" : "Vulnerable"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Enrollment Flow */}
        {!enrolling && !qrCode && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Authenticator App</CardTitle>
              </div>
              <CardDescription>
                Use an authenticator app like Google Authenticator, Authy, or 1Password to generate verification codes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={startEnrollment}>
                <Shield className="mr-2 h-4 w-4" />
                {isProtected ? "Add Another Authenticator" : "Set Up Authenticator"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* QR Code / Setup */}
        {qrCode && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>Open your authenticator app and scan this QR code to add your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="rounded-lg border bg-white p-4">
                  <img src={qrCode} alt="MFA QR Code" className="h-48 w-48" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Can't scan? Enter this key manually:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded border bg-muted px-3 py-2 text-sm font-mono break-all">
                    {secret}
                  </code>
                  <Button size="icon" variant="outline" onClick={copySecret}>
                    {copiedSecret ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Enter the 6-digit code from your authenticator app</Label>
                <div className="flex gap-2">
                  <Input
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="font-mono text-center text-lg tracking-widest max-w-[200px]"
                    maxLength={6}
                  />
                  <Button
                    onClick={verifyEnrollment}
                    disabled={verifyCode.length !== 6 || verifying}
                  >
                    {verifying ? "Verifying..." : "Verify & Enable"}
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Save this secret key in a safe place. You'll need it to restore access if you lose your device.
                </p>
              </div>

              <Button variant="ghost" onClick={() => { setQrCode(null); setSecret(null); setFactorId(null); setEnrolling(false); setVerifyCode(""); }}>
                Cancel Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Existing Factors */}
        {verifiedFactors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registered Authenticators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {verifiedFactors.map(factor => (
                <div key={factor.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{factor.friendly_name || "Authenticator App"}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(factor.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setShowUnenroll(factor.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Unenroll Confirmation */}
        <Dialog open={!!showUnenroll} onOpenChange={() => setShowUnenroll(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Authenticator?</DialogTitle>
              <DialogDescription>
                This will disable MFA for this authenticator. Your account will be less secure.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUnenroll(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => showUnenroll && unenrollFactor(showUnenroll)}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MFASetup;
