import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageSquare, Phone, Mail, Send, Loader2 } from "lucide-react";
import { logger } from "@/lib/logging/logger";
import { testNotificationChannel } from "@/services/multiChannelNotification";

interface ChannelPreferences {
  email_notifications_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  phone_number: string | null;
  whatsapp_number: string | null;
}

export function NotificationChannelPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ChannelPreferences>({
    email_notifications_enabled: true,
    sms_enabled: false,
    whatsapp_enabled: false,
    phone_number: null,
    whatsapp_number: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("email_notifications_enabled, sms_enabled, whatsapp_enabled, phone_number, whatsapp_number")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPreferences({
          email_notifications_enabled: data.email_notifications_enabled ?? true,
          sms_enabled: data.sms_enabled ?? false,
          whatsapp_enabled: data.whatsapp_enabled ?? false,
          phone_number: data.phone_number,
          whatsapp_number: data.whatsapp_number,
        });
      }
    } catch (error) {
      logger.error("Error loading channel preferences", error as Error, { 
        component: 'NotificationChannelPreferences', 
        userId: user.id 
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updates: Partial<ChannelPreferences>) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, ...updates }));
      toast.success("Notification preferences updated");
    } catch (error) {
      logger.error("Error saving preferences", error as Error, { 
        component: 'NotificationChannelPreferences', 
        userId: user.id, 
        updates 
      });
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleTestChannel = async (channel: 'email' | 'sms' | 'whatsapp') => {
    if (!user) return;

    let destination: string | null = null;
    if (channel === 'email') {
      destination = user.email || null;
    } else if (channel === 'sms') {
      destination = preferences.phone_number;
    } else {
      destination = preferences.whatsapp_number || preferences.phone_number;
    }

    if (!destination) {
      toast.error(`Please enter a ${channel === 'email' ? 'email address' : 'phone number'} first`);
      return;
    }

    setTesting(channel);
    try {
      const result = await testNotificationChannel(channel, destination);
      if (result.success) {
        toast.success(`Test ${channel} sent successfully!`);
      } else {
        toast.error(`Failed to send test ${channel}: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Error testing ${channel}: ${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove non-numeric characters except +
    return value.replace(/[^\d+]/g, '');
  };

  if (loading) {
    return <div className="animate-pulse">Loading preferences...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notification Channels
        </CardTitle>
        <CardDescription>
          Choose how you want to receive notifications. Enable multiple channels for important updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Channel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="email-toggle" className="text-base">Email</Label>
              <p className="text-sm text-muted-foreground">
                {user?.email || "No email set"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestChannel('email')}
              disabled={!preferences.email_notifications_enabled || testing === 'email'}
            >
              {testing === 'email' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            <Switch
              id="email-toggle"
              checked={preferences.email_notifications_enabled}
              onCheckedChange={(checked) =>
                savePreferences({ email_notifications_enabled: checked })
              }
              disabled={saving}
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* SMS Channel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="sms-toggle" className="text-base">SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text message notifications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestChannel('sms')}
                disabled={!preferences.sms_enabled || !preferences.phone_number || testing === 'sms'}
              >
                {testing === 'sms' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              <Switch
                id="sms-toggle"
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) =>
                  savePreferences({ sms_enabled: checked })
                }
                disabled={saving}
              />
            </div>
          </div>
          {preferences.sms_enabled && (
            <div className="ml-13 pl-13">
              <Label htmlFor="phone-number" className="text-sm">Phone Number</Label>
              <Input
                id="phone-number"
                type="tel"
                placeholder="+234 800 000 0000"
                value={preferences.phone_number || ""}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setPreferences((prev) => ({ ...prev, phone_number: formatted }));
                }}
                onBlur={() => {
                  if (preferences.phone_number) {
                    savePreferences({ phone_number: preferences.phone_number });
                  }
                }}
                className="mt-1 max-w-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Include country code (e.g., +234 for Nigeria)
              </p>
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* WhatsApp Channel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="whatsapp-toggle" className="text-base">WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Receive WhatsApp message notifications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestChannel('whatsapp')}
                disabled={!preferences.whatsapp_enabled || !(preferences.whatsapp_number || preferences.phone_number) || testing === 'whatsapp'}
              >
                {testing === 'whatsapp' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              <Switch
                id="whatsapp-toggle"
                checked={preferences.whatsapp_enabled}
                onCheckedChange={(checked) =>
                  savePreferences({ whatsapp_enabled: checked })
                }
                disabled={saving}
              />
            </div>
          </div>
          {preferences.whatsapp_enabled && (
            <div className="ml-13 pl-13">
              <Label htmlFor="whatsapp-number" className="text-sm">WhatsApp Number</Label>
              <Input
                id="whatsapp-number"
                type="tel"
                placeholder="+234 800 000 0000 (or use SMS number)"
                value={preferences.whatsapp_number || preferences.phone_number || ""}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setPreferences((prev) => ({ ...prev, whatsapp_number: formatted }));
                }}
                onBlur={() => {
                  if (preferences.whatsapp_number) {
                    savePreferences({ whatsapp_number: preferences.whatsapp_number });
                  }
                }}
                className="mt-1 max-w-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to use SMS number. Must be a valid WhatsApp number.
              </p>
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Info box */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> For WhatsApp notifications, you may need to first message our WhatsApp number to activate the channel. 
            SMS and WhatsApp messages are sent via Twilio and standard rates may apply to your carrier.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
