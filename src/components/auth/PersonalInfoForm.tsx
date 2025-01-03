import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AvatarUpload } from "../profile/AvatarUpload";
import { ProfileFormFields } from "../profile/ProfileForm";
import { useProfileForm } from "@/hooks/useProfileForm";

const PersonalInfoForm = () => {
  const navigate = useNavigate();
  const { formData, loading, handleSubmit, handleChange, setFormData } = useProfileForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl"
      >
        <Card className="p-8">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold text-center mb-2">Personal Information</h2>
            <p className="text-gray-500 text-center mb-6">Complete your profile to get started</p>
            
            <AvatarUpload
              avatarUrl={formData.avatarUrl}
              fullName={formData.fullName}
              onAvatarChange={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ProfileFormFields
              formData={formData}
              onChange={handleChange}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-32"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-32" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default PersonalInfoForm;