import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AvatarUploadProps {
  avatarUrl: string;
  fullName: string;
  onAvatarChange: (url: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatarUrl,
  fullName,
  onAvatarChange,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      onAvatarChange(publicUrl);
      toast.success("Profile picture uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="relative group">
      <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-2xl">
          {fullName?.split(' ').map(n => n[0]).join('') || '?'}
        </AvatarFallback>
      </Avatar>
      <label 
        htmlFor="avatar-upload" 
        className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-lg
                 hover:bg-primary/90 transition-colors"
      >
        {uploadingImage ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Camera className="w-5 h-5" />
        )}
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};