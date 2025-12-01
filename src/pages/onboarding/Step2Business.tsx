import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Step2Business = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    country: "Sweden",
    timezone: "Europe/Stockholm",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("onboarding_business", JSON.stringify(formData));
    navigate("/onboarding/services");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Step 2 of 5</div>
        <h1 className="text-3xl font-bold text-foreground">Tell us about your business</h1>
        <p className="text-muted-foreground">This information will appear on your booking page</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              placeholder="My Salon"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
              <SelectTrigger id="businessType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salon">Hair Salon</SelectItem>
                <SelectItem value="barber">Barber Shop</SelectItem>
                <SelectItem value="spa">Spa & Wellness</SelectItem>
                <SelectItem value="beauty">Beauty Clinic</SelectItem>
                <SelectItem value="fitness">Personal Training</SelectItem>
                <SelectItem value="therapy">Therapy & Coaching</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sweden">Sweden</SelectItem>
                  <SelectItem value="Norway">Norway</SelectItem>
                  <SelectItem value="Denmark">Denmark</SelectItem>
                  <SelectItem value="Finland">Finland</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Stockholm">Stockholm (CET)</SelectItem>
                  <SelectItem value="Europe/Oslo">Oslo (CET)</SelectItem>
                  <SelectItem value="Europe/Copenhagen">Copenhagen (CET)</SelectItem>
                  <SelectItem value="Europe/Helsinki">Helsinki (EET)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/onboarding")}>
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step2Business;
