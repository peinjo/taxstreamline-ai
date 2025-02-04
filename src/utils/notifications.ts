import { supabase } from "@/lib/supabase";

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
    // For now, just log the notification details
    console.log('Email notification would be sent:', {
      type,
      userEmail,
      userName,
      data
    });

    // Store notification in database even if email sending is not configured
    const { error } = await supabase.from('notifications').insert([
      {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        title: `${type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
        message: `Notification for ${userName} (${userEmail})`,
        type: type,
        status: 'unread',
      }
    ]);

    if (error) throw error;

    return {
      success: true,
      message: 'Notification stored successfully (email sending is not configured)'
    };
  } catch (error) {
    console.error('Error in sendTaxNotification:', error);
    // Don't throw the error, just log it and return a message
    return {
      success: false,
      message: 'Failed to process notification'
    };
  }
};