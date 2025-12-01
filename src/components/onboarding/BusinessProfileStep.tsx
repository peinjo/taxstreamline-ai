import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessProfileStepProps {
  onComplete: (data: BusinessProfileData) => void;
  onBack?: () => void;
}

export interface BusinessProfileData {
  businessName?: string;
  tin?: string;
  sector: string;
  stateOfOperation: string;
  accountingBasis: "cash" | "accrual";
  revenueBand: string;
  vatRegistered: boolean;
  whatsappNumber?: string;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
}

const SECTORS = [
  "Agriculture",
  "Construction",
  "Education",
  "Finance & Insurance",
  "Healthcare",
  "Hospitality",
  "Manufacturing",
  "Professional Services",
  "Retail & Wholesale",
  "Technology",
  "Transportation",
  "Other"
];

const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
];

const REVENUE_BANDS = [
  "Under ₦1M",
  "₦1M - ₦5M",
  "₦5M - ₦25M",
  "₦25M - ₦100M",
  "Over ₦100M"
];

export function BusinessProfileStep({ onComplete, onBack }: BusinessProfileStepProps) {
  const [formData, setFormData] = useState<BusinessProfileData>({
    sector: "",
    stateOfOperation: "",
    accountingBasis: "cash",
    revenueBand: "",
    vatRegistered: false,
    smsEnabled: true,
    whatsappEnabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const isValid = formData.sector && formData.stateOfOperation && formData.revenueBand;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Tell us about your business so we can provide accurate tax guidance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name (Optional)</Label>
            <Input
              id="businessName"
              value={formData.businessName || ""}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="Your Business Ltd"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tin">Tax Identification Number (Optional)</Label>
            <Input
              id="tin"
              value={formData.tin || ""}
              onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
              placeholder="Enter your TIN if registered"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Business Sector *</Label>
            <Select value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State of Operation *</Label>
            <Select value={formData.stateOfOperation} onValueChange={(value) => setFormData({ ...formData, stateOfOperation: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenueBand">Annual Revenue Band *</Label>
            <Select value={formData.revenueBand} onValueChange={(value) => setFormData({ ...formData, revenueBand: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select revenue band" />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_BANDS.map((band) => (
                  <SelectItem key={band} value={band}>
                    {band}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountingBasis">Accounting Basis</Label>
            <Select 
              value={formData.accountingBasis} 
              onValueChange={(value: "cash" | "accrual") => setFormData({ ...formData, accountingBasis: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash Basis</SelectItem>
                <SelectItem value="accrual">Accrual Basis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="vatRegistered">VAT Registered</Label>
            <Switch
              id="vatRegistered"
              checked={formData.vatRegistered}
              onCheckedChange={(checked) => setFormData({ ...formData, vatRegistered: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to receive tax reminders and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              value={formData.whatsappNumber || ""}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="+234 XXX XXX XXXX"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="smsEnabled">SMS Notifications</Label>
            <Switch
              id="smsEnabled"
              checked={formData.smsEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, smsEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="whatsappEnabled">WhatsApp Notifications</Label>
            <Switch
              id="whatsappEnabled"
              checked={formData.whatsappEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, whatsappEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="submit" disabled={!isValid} className="ml-auto">
          Continue
        </Button>
      </div>
    </form>
  );
}