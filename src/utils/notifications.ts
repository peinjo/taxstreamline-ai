import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const sendTaxNotification = async ({
  type,
  userEmail,
  userName,
  data
}: {
  type: 'filing_confirmation' | 'payment_receipt' | 'deadline_reminder' | 'document_upload';
  userEmail: string;
  userName: string;
  data: Record<string, any>;
}) => {
  try {
    const response = await supabase.functions.invoke('send-tax-notification', {
      body: {
        type,
        userEmail,
        userName,
        data
      }
    });
    
    if (response.error) throw response.error;
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};