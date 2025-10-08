import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { EmailPreferences } from "@/components/profile/EmailPreferences";
import { User, Mail } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

export default function Settings() {
  return (
    <>
      <SEOHead 
        title="Settings - Tax Compliance Platform"
        description="Manage your account settings, profile information, and email preferences"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <EmailPreferences />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
