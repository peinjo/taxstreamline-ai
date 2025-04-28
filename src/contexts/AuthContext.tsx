
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

  // Initialize auth and listen for changes - simplified and improved
  useEffect(() => {
    console.log("AuthProvider initializing...");
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Only fetch user role if we have a valid session
        if (currentSession.user) {
          await fetchUserRole(currentSession.user.id);
        }
      } else {
        setSession(null);
        setUser(null);
        setUserRole(null);
      }
      
      // Complete loading regardless of result
      setLoading(false);
    });
    
    // Get initial session AFTER setting up listener
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          console.log("Initial session found:", initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          
          if (initialSession.user) {
            await fetchUserRole(initialSession.user.id);
            await ensureUserProfile(initialSession.user.id, initialSession.user.email);
          }
        }
      } catch (error) {
        console.error("Error in auth initialization:", error);
      } finally {
        // Always complete loading even if there's an error
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Ensure a user profile exists - simplified
  const ensureUserProfile = async (userId: string, email?: string | null) => {
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

  // Simplified user role fetching
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        setUserRole('user');
        return;
      }
      
      if (data) {
        setUserRole(data.role);
      } else {
        setUserRole('user');
        
        // Create default role if it doesn't exist
        await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: 'user' })
          .catch(err => console.error("Error creating default user role:", err));
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole('user');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        throw error;
      }

      if (!data?.user || !data?.session) {
        setLoading(false);
        throw new Error("Authentication failed - no user data");
      }

      // Session will be handled by onAuthStateChange
      toast.success("Successfully logged in");
      
      return;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
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
        setLoading(false);
        throw error;
      }

      if (!data?.user) {
        setLoading(false);
        throw new Error("Signup failed - no user data");
      }

      // Create user profile during signup
      if (data.user.id) {
        await ensureUserProfile(data.user.id, email);
      }
      
      toast.success("Signup successful! Please check your email to confirm your account.");
      setLoading(false);
      
      return;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Session will be cleared by onAuthStateChange
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
      throw error;
    } finally {
      setLoading(false);
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
