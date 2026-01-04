import { supabase } from "@/integrations/supabase/client";

export interface NotificationChannels {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'deadline' | 'compliance' | 'report_status';
  data?: Record<string, any>;
}

export interface UserNotificationPreferences {
  email: string | null;
  phoneNumber: string | null;
  channels: NotificationChannels;
  whatsappOptedIn: boolean;
}

export const getUserNotificationPreferences = async (
  userId: string
): Promise<UserNotificationPreferences | null> => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("email, phone_number, sms_enabled, whatsapp_enabled, whatsapp_number, email_notifications_enabled")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user preferences:", error);
    return null;
  }

  return {
    email: data.email,
    phoneNumber: data.phone_number || data.whatsapp_number,
    channels: {
      email: data.email_notifications_enabled ?? true,
      sms: data.sms_enabled ?? false,
      whatsapp: data.whatsapp_enabled ?? false,
    },
    whatsappOptedIn: data.whatsapp_enabled ?? false,
  };
};

export const sendEmail = async (
  to: string,
  type: NotificationPayload['type'],
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: result, error } = await supabase.functions.invoke("send-email", {
      body: { to, type, data },
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

export const sendSMS = async (
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: result, error } = await supabase.functions.invoke("send-sms", {
      body: { to, message },
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("SMS send error:", error);
    return { success: false, error: error.message };
  }
};

export const sendWhatsApp = async (
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: result, error } = await supabase.functions.invoke("send-whatsapp", {
      body: { to, message },
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return { success: false, error: error.message };
  }
};

export const sendMultiChannelNotification = async (
  payload: NotificationPayload
): Promise<{ 
  results: { channel: string; success: boolean; error?: string }[];
  overallSuccess: boolean;
}> => {
  const preferences = await getUserNotificationPreferences(payload.userId);
  
  if (!preferences) {
    return {
      results: [{ channel: "all", success: false, error: "User preferences not found" }],
      overallSuccess: false,
    };
  }

  const results: { channel: string; success: boolean; error?: string }[] = [];
  const smsMessage = `${payload.title}: ${payload.message}`;

  // Send via enabled channels
  const promises: Promise<void>[] = [];

  if (preferences.channels.email && preferences.email) {
    promises.push(
      sendEmail(preferences.email, payload.type, {
        userName: payload.data?.userName || "User",
        ...payload.data,
      }).then((result) => {
        results.push({ channel: "email", ...result });
      })
    );
  }

  if (preferences.channels.sms && preferences.phoneNumber) {
    promises.push(
      sendSMS(preferences.phoneNumber, smsMessage).then((result) => {
        results.push({ channel: "sms", ...result });
      })
    );
  }

  if (preferences.channels.whatsapp && preferences.whatsappOptedIn && preferences.phoneNumber) {
    promises.push(
      sendWhatsApp(preferences.phoneNumber, smsMessage).then((result) => {
        results.push({ channel: "whatsapp", ...result });
      })
    );
  }

  await Promise.all(promises);

  // If no channels were attempted, still record in database
  if (results.length === 0) {
    results.push({ channel: "none", success: true, error: "No channels enabled" });
  }

  return {
    results,
    overallSuccess: results.some((r) => r.success),
  };
};

export const testNotificationChannel = async (
  channel: 'email' | 'sms' | 'whatsapp',
  destination: string
): Promise<{ success: boolean; error?: string }> => {
  const testMessage = "This is a test notification from TaxEase.";

  switch (channel) {
    case 'email':
      return sendEmail(destination, 'deadline', {
        userName: "Test User",
        deadlineTitle: "Test Notification",
        daysUntilDue: 7,
        deadlineDate: new Date().toISOString(),
        actionUrl: window.location.origin,
      });
    case 'sms':
      return sendSMS(destination, testMessage);
    case 'whatsapp':
      return sendWhatsApp(destination, testMessage);
    default:
      return { success: false, error: "Unknown channel" };
  }
};
