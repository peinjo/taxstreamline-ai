
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logging/logger";

interface ProfileFormData {
  fullName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  company: string;
  jobTitle: string;
  bio: string;
  avatarUrl: string;
}

export const useProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
    company: "",
    jobTitle: "",
    bio: "",
    avatarUrl: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("No authenticated user found");
          navigate('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          logger.error('Error fetching profile', error);
          toast.error("Failed to fetch profile information");
          return;
        }

        if (data) {
          setFormData({
            fullName: data.full_name || "",
            dateOfBirth: data.date_of_birth || "",
            address: data.address || "",
            phoneNumber: data.phone_number || "",
            company: data.company || "",
            jobTitle: data.job_title || "",
            bio: data.bio || "",
            avatarUrl: data.avatar_url || "",
          });
        }
      } catch (error) {
        logger.error('Error in fetchUserProfile', error as Error);
        toast.error("Failed to fetch profile information");
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("No authenticated user found");
        navigate('/auth/login');
        return;
      }

      // Validate required fields
      if (!formData.fullName || !formData.dateOfBirth || !formData.address) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth,
          address: formData.address,
          phone_number: formData.phoneNumber,
          company: formData.company,
          job_title: formData.jobTitle,
          bio: formData.bio,
          avatar_url: formData.avatarUrl,
        })
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error updating profile', error);
        toast.error("Failed to save profile information");
        return;
      }

      toast.success("Profile information saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      logger.error('Error in handleSubmit', err);
      toast.error(err.message || "Failed to save profile information");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return {
    formData,
    loading,
    handleSubmit,
    handleChange,
    setFormData,
  };
};
