
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { AppRole } from "@/types";
import { toast } from "sonner";
import { ensureUserProfile, fetchUserRole, signInWithEmail, signUpWithEmail, signOutUser } from "@/lib/auth/authUtils";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuthProvider(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  // Initialize auth and listen for changes
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
          const role = await fetchUserRole(currentSession.user.id);
          setUserRole(role);
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
            const role = await fetchUserRole(initialSession.user.id);
            setUserRole(role);
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

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      // Session will be handled by onAuthStateChange
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
      await signUpWithEmail(email, password);
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
      await signOutUser();
      // Session will be cleared by onAuthStateChange
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    userRole,
    signIn,
    signUp,
    signOut
  };
}
