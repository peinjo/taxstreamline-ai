import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { EmailPreferences } from "@/components/profile/EmailPreferences";
import { NotificationChannelPreferences } from "@/components/profile/NotificationChannelPreferences";
import { User, Mail, MessageSquare } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";

  return (
    <>
      <SEOHead 
        title="Settings - TaxEase"
        description="Manage your account settings, profile information, and notification preferences"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="channels" className="space-y-6">
              <NotificationChannelPreferences />
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
