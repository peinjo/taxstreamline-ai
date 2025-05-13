
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/types";
import { toast } from "sonner";

/**
 * Ensures a user profile exists for the given user ID
 */
export const ensureUserProfile = async (userId: string, email?: string | null) => {
  try {
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking user profile:", checkError);
      return;
    }
    
    if (!existingProfile) {
      // Extract name from email or use default
      const emailName = email ? email.split('@')[0] : 'User';
      const defaultName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      
      // Create a default profile
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          full_name: defaultName,
          address: "Please update your address",
          date_of_birth: new Date().toISOString().split('T')[0]
        });
      
      if (insertError) {
        console.error("Error creating default profile:", insertError);
      }
    }
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
  }
};

/**
 * Fetches the user role for the given user ID
 */
export const fetchUserRole = async (userId: string): Promise<AppRole> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return 'user';
    }
    
    if (data) {
      return data.role;
    } else {
      try {
        // Create default role if it doesn't exist
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: 'user' });
          
        if (insertError) {
          console.error("Error creating default user role:", insertError);
        }
      } catch (err) {
        console.error("Error creating default user role:", err);
      }
      
      return 'user';
    }
  } catch (error) {
    console.error("Error in fetchUserRole:", error);
    return 'user';
  }
};

/**
 * Signs in a user with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data?.user || !data?.session) {
    throw new Error("Authentication failed - no user data");
  }

  toast.success("Successfully logged in");
  return data;
};

/**
 * Signs up a user with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  // Clean up before signing up to prevent auth conflicts
  cleanupAuthState();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/login`,
      data: {
        email: email
      }
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.user) {
    throw new Error("Signup failed - no user data");
  }

  // Create user profile during signup
  if (data.user.id) {
    await ensureUserProfile(data.user.id, email);
  }
  
  toast.success("Signup successful! Please check your email to confirm your account.");
  return data;
};

/**
 * Signs out the current user
 */
export const signOutUser = async () => {
  cleanupAuthState();
  
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  
  if (error) {
    throw error;
  }
  
  toast.success("Signed out successfully");
};

/**
 * Cleans up all Supabase auth state from browser storage
 * This helps prevent auth state conflicts
 */
export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Also check sessionStorage if in use
  try {
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Ignore sessionStorage errors
  }
};
