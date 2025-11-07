import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Mail, Bell, FileText, Calendar } from "lucide-react";
import { logger } from "@/lib/logging/logger";

interface EmailPreferences {
  email_notifications_enabled: boolean;
  deadline_reminder_days: number[];
  compliance_alerts_enabled: boolean;
  report_status_updates_enabled: boolean;
}

export function EmailPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    email_notifications_enabled: true,
    deadline_reminder_days: [7, 3, 1],
    compliance_alerts_enabled: true,
    report_status_updates_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("email_notifications_enabled, deadline_reminder_days, compliance_alerts_enabled, report_status_updates_enabled")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPreferences({
          email_notifications_enabled: data.email_notifications_enabled ?? true,
          deadline_reminder_days: data.deadline_reminder_days ?? [7, 3, 1],
          compliance_alerts_enabled: data.compliance_alerts_enabled ?? true,
          report_status_updates_enabled: data.report_status_updates_enabled ?? true,
        });
      }
    } catch (error) {
      logger.error("Error loading email preferences", error as Error, { component: 'EmailPreferences', userId: user.id });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updates: Partial<EmailPreferences>) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, ...updates }));
      toast.success("Email preferences updated");
    } catch (error) {
      logger.error("Error saving preferences", error as Error, { component: 'EmailPreferences', userId: user.id, updates });
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggleReminderDay = (day: number) => {
    const newDays = preferences.deadline_reminder_days.includes(day)
      ? preferences.deadline_reminder_days.filter((d) => d !== day)
      : [...preferences.deadline_reminder_days, day].sort((a, b) => b - a);

    savePreferences({ deadline_reminder_days: newDays });
  };

  if (loading) {
    return <div className="animate-pulse">Loading preferences...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Manage how and when you receive email notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="master-toggle" className="text-base">
              Enable all email notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Master switch for all email notifications
            </p>
          </div>
          <Switch
            id="master-toggle"
            checked={preferences.email_notifications_enabled}
            onCheckedChange={(checked) =>
              savePreferences({ email_notifications_enabled: checked })
            }
            disabled={saving}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Deadline reminders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base">Deadline Reminders</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Get reminded before deadlines are due
          </p>
          <div className="flex gap-4">
            {[7, 3, 1].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={preferences.deadline_reminder_days.includes(day)}
                  onCheckedChange={() => toggleReminderDay(day)}
                  disabled={!preferences.email_notifications_enabled || saving}
                />
                <label
                  htmlFor={`day-${day}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {day} {day === 1 ? "day" : "days"} before
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Compliance alerts */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="compliance-alerts" className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Compliance Alerts
            </Label>
            <p className="text-sm text-muted-foreground">
              Notifications when compliance items become overdue
            </p>
          </div>
          <Switch
            id="compliance-alerts"
            checked={preferences.compliance_alerts_enabled}
            onCheckedChange={(checked) =>
              savePreferences({ compliance_alerts_enabled: checked })
            }
            disabled={!preferences.email_notifications_enabled || saving}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Report status updates */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="report-updates" className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Report Status Updates
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified when tax report statuses change
            </p>
          </div>
          <Switch
            id="report-updates"
            checked={preferences.report_status_updates_enabled}
            onCheckedChange={(checked) =>
              savePreferences({ report_status_updates_enabled: checked })
            }
            disabled={!preferences.email_notifications_enabled || saving}
          />
        </div>
      </CardContent>
    </Card>
  );
}
