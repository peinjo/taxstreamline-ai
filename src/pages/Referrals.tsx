import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Gift, Users, TrendingUp, Share2, Loader2 } from "lucide-react";
import { format } from "date-fns";

const Referrals = () => {
  const { user } = useAuth();

  // Get or create referral code
  const { data: referralCode, isLoading: codeLoading } = useQuery({
    queryKey: ["referral-code", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.rpc("generate_referral_code" as any, { p_user_id: user.id });
      if (error) throw error;
      return data as string;
    },
    enabled: !!user,
  });

  // Get referral stats
  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_tracking" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!user,
  });

  const { data: codeStats } = useQuery({
    queryKey: ["referral-stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_codes" as any)
        .select("total_referrals, credits_earned")
        .eq("user_id", user!.id)
        .single();
      if (error) return { total_referrals: 0, credits_earned: 0 };
      return data as any;
    },
    enabled: !!user,
  });

  const copyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied!");
    }
  };

  const copyLink = () => {
    if (referralCode) {
      const link = `${window.location.origin}/auth/signup?ref=${referralCode}`;
      navigator.clipboard.writeText(link);
      toast.success("Referral link copied!");
    }
  };

  const completedReferrals = referrals?.filter((r: any) => r.status === "completed").length || 0;

  return (
    <>
      <Helmet>
        <title>Referral Program | TaxEase</title>
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Referral Program</h1>
            <p className="text-muted-foreground">Invite accountants and businesses to TaxEase and earn credits.</p>
          </div>

          {/* Referral Code Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Your Referral Code
              </CardTitle>
              <CardDescription>Share this code with colleagues. They get 10% off their first month, you earn ₦1,000 credit per signup.</CardDescription>
            </CardHeader>
            <CardContent>
              {codeLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      readOnly
                      value={referralCode || ""}
                      className="font-mono text-lg text-center font-bold tracking-wider"
                    />
                  </div>
                  <Button variant="outline" className="gap-2" onClick={copyCode}>
                    <Copy className="h-4 w-4" /> Copy Code
                  </Button>
                  <Button className="gap-2" onClick={copyLink}>
                    <Share2 className="h-4 w-4" /> Copy Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{codeStats?.total_referrals || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Referrals</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedReferrals}</p>
                  <p className="text-xs text-muted-foreground">Converted</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₦{(Number(codeStats?.credits_earned) || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Credits Earned</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral History */}
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {referralsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !referrals?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No referrals yet. Share your code to get started!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((ref: any) => (
                      <TableRow key={ref.id}>
                        <TableCell>{ref.referred_email}</TableCell>
                        <TableCell>
                          <Badge variant={ref.status === "completed" ? "default" : "secondary"}>
                            {ref.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(ref.created_at), "dd MMM yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Referrals;
