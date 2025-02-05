import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

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
        toast.error("Failed to fetch profile information");
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("No authenticated user found");
        return;
      }

      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let error;
      
      const profileData = {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        address: formData.address,
        phone_number: formData.phoneNumber,
        company: formData.company,
        job_title: formData.jobTitle,
        bio: formData.bio,
        avatar_url: formData.avatarUrl,
      };

      if (existingProfile) {
        ({ error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id));
      } else {
        ({ error } = await supabase
          .from('user_profiles')
          .insert([{ user_id: user.id, ...profileData }]));
      }

      if (error) throw error;

      toast.success("Profile information saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save profile information. Please try again.");
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