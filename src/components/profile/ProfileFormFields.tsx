
import React from "react";
import { Input } from "@/components/ui/input";

interface ProfileFormFieldsProps {
  formData: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    phoneNumber: string;
    company: string;
    jobTitle: string;
    bio: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={onChange}
            placeholder="Enter your full name"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={onChange}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={onChange}
            placeholder="Enter your phone number"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1">
            Company
          </label>
          <Input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={onChange}
            placeholder="Enter your company name"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium mb-1">
            Job Title
          </label>
          <Input
            id="jobTitle"
            name="jobTitle"
            type="text"
            value={formData.jobTitle}
            onChange={onChange}
            placeholder="Enter your job title"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <Input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={onChange}
            placeholder="Enter your address"
            required
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={onChange}
          placeholder="Tell us about yourself"
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    </div>
  );
};
