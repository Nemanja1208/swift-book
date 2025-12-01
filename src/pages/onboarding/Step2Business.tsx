import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { createBusiness, login } from "@/services";
import { isSuccessResult } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Step2Business = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userId: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    country: "Sweden",
    timezone: "Europe/Stockholm",
  });

  useEffect(() => {
    // Load account data from step 1
    const savedAccount = localStorage.getItem("onboarding_account");
    if (savedAccount) {
      setAccountData(JSON.parse(savedAccount));
    } else {
      // If no account data, redirect back to step 1
      navigate("/onboarding");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountData) return;

    setIsLoading(true);

    // First, log the user in
    const loginResult = await login({
      email: accountData.email,
      password: accountData.password,
    });

    if (!isSuccessResult(loginResult)) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Could not log in with your new account. Please try logging in manually.",
      });
      setIsLoading(false);
      navigate("/login");
      return;
    }

    // Then create the business
    const businessResult = await createBusiness({
      name: formData.businessName,
      type: formData.businessType,
      country: formData.country,
      timezone: formData.timezone,
    });

    if (isSuccessResult(businessResult)) {
      // Clear onboarding data
      localStorage.removeItem("onboarding_account");
      localStorage.removeItem("onboarding_business");

      // Refresh user context
      await refreshUser();

      toast({
        title: "Welcome to Booklyfy!",
        description: "Your business has been set up successfully.",
      });

      navigate("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: businessResult.error?.message || "Could not create business. Please try again.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Step 2 of 2</div>
        <h1 className="text-3xl font-bold text-foreground">Tell us about your business</h1>
        <p className="text-muted-foreground">This information will appear on your booking page</p>
      </div>

      {accountData && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-400">
              Account created for {accountData.email}
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              Now let's set up your business
            </p>
          </div>
        </div>
      )}

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
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => setFormData({ ...formData, businessType: value })}
              disabled={isLoading}
            >
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
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
                disabled={isLoading}
              >
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
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                disabled={isLoading}
              >
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
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/onboarding")}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !formData.businessType}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step2Business;
