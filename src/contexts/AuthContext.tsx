import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { AppRole } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userRole: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  // Initialize auth and listen for changes
  useEffect(() => {
    console.log("AuthProvider initialized");

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting initial session:", sessionError);
          setLoading(false);
          return;
        }

        if (initialSession) {
          console.log("Initial session found:", initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);

          if (initialSession.user) {
            await fetchUserRole(initialSession.user.id);
            await ensureUserProfile(initialSession.user.id, initialSession.user.email);
          }
        } else {
          console.log("No initial session found");
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, currentSession?.user?.email);

      // Important: Don't set loading to true on SIGNED_OUT events
      // as this can cause infinite loading screens
      if (event !== 'SIGNED_OUT') {
        setLoading(true);
      }

      try {
        // For SIGNED_OUT events, immediately clear state
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setUserRole(null);
          console.log("User signed out, state cleared");
        } else {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            await fetchUserRole(currentSession.user.id);

            // Ensure user profile exists after login
            if (event === 'SIGNED_IN') {
              await ensureUserProfile(currentSession.user.id, currentSession.user.email);
            }
          } else {
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
      } finally {
        setLoading(false);
      }
    });

    // Clean up subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  // Ensure a user profile exists - create a default one if missing
  const ensureUserProfile = async (userId: string, email?: string | null) => {
    try {
      console.log("Checking if user profile exists for:", userId);

      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError && !checkError.message.includes('No rows found')) {
        console.error("Error checking user profile:", checkError);
        return false; // Return false instead of throwing error
      }

      if (!existingProfile) {
        console.log("No profile found, creating default profile");

        // Extract name from email or use default
        const emailName = email ? email.split('@')[0] : 'User';
        const defaultName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

        // Current date formatted as YYYY-MM-DD for date_of_birth
        const today = new Date().toISOString().split('T')[0];

        // Create a default profile
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: userId,
            full_name: defaultName,
            address: "Please update your address",
            date_of_birth: today // Today's date as default
          });

        if (insertError) {
          console.error("Error creating default profile:", insertError);
          console.error("Insert error details:", JSON.stringify(insertError));

          // The trigger should handle this, so we can safely ignore permission errors
          if (insertError.code === "42501" || insertError.message.includes("permission denied")) {
            console.log("Permission error, but profile may be created by trigger");
            return true;
          }

          return false; // Return false instead of throwing error
        } else {
          console.log("Default profile created successfully");
          return true;
        }
      } else {
        console.log("Profile already exists:", existingProfile);
        return true;
      }
    } catch (error) {
      console.error("Error in ensureUserProfile:", error);
      return false; // Return false instead of throwing error
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching role for user:", userId);

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole('user');
      } else if (data) {
        console.log("User role found:", data.role);
        setUserRole(data.role);
      } else {
        console.log("No role found, defaulting to 'user'");
        setUserRole('user');

        // Create default role if it doesn't exist
        try {
          const { error: insertError } = await supabase
            .from("user_roles")
            .insert({ user_id: userId, role: 'user' });

          if (insertError) {
            console.error("Error creating default user role:", insertError);
          }
        } catch (insertError) {
          console.error("Exception creating default role:", insertError);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole('user');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email);
      setLoading(true);

      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Authentication failed:", {
          errorMessage: error.message,
          errorCode: error.status,
          errorName: error.name,
          details: error
        });
        setLoading(false);
        throw error;
      }

      if (!data?.user || !data?.session) {
        console.error("No user or session data returned from Supabase");
        setLoading(false);
        throw new Error("Authentication failed - no user data");
      }

      console.log("Authentication successful:", data.user.email);

      // Immediately update state without waiting for onAuthStateChange
      // This helps prevent loading issues
      setUser(data.user);
      setSession(data.session);
      await fetchUserRole(data.user.id);
      await ensureUserProfile(data.user.id, data.user.email);

      toast.success("Successfully logged in");
      setLoading(false);
      return;
    } catch (error: any) {
      console.error("Sign in error:", {
        message: error.message,
        status: error.status,
        details: error
      });
      toast.error(error.message || "Failed to sign in");
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Starting signup process for email:", email);
      setLoading(true);

      // Simplified signup process - this will rely on the database trigger
      // we created to handle profile and role creation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });

      if (error) {
        console.log("Signup error:", error);
        let errorMessage = error.message;

        // More user-friendly error messages
        if (error.status === 500) {
          errorMessage = "Server error during signup. Please try again later.";
        } else if (error.message.includes("duplicate")) {
          errorMessage = "An account with this email already exists.";
        }

        toast.error(`Signup failed: ${errorMessage}`);
        throw error;
      }

      console.log("Signup successful:", data);

      // No need to manually create profiles - our trigger will handle this

      setLoading(false);
      toast.success("Account created! Please check your email to confirm your account.");
      return data;

    } catch (error: any) {
      setLoading(false);
      console.log("Signup process error:", error);
      toast.error(`Signup failed: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out");
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }

      // Immediately clear state instead of waiting for the onAuthStateChange
      setUser(null);
      setSession(null);
      setUserRole(null);

      console.log("Signed out successfully");
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error("Sign out failed:", error);
      toast.error(error.message || "Failed to sign out");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      userRole, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};