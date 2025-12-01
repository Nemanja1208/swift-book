import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ArrowLeft,
  Loader2,
  Building2,
  User,
  Bell,
  Globe,
  Mail,
  MapPin,
  Save,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrentBusiness,
  updateBusiness,
  getCountries,
  getTimezones,
  getBusinessTypes,
} from "@/services";
import { Business, UpdateBusinessRequest, BusinessType, Country, Timezone } from "@/types";
import { isSuccessResult } from "@/types/api";
import { toast } from "sonner";

const BUSINESS_ID = "business-1"; // TODO: Get from context/store

const businessTypeLabels: Record<BusinessType, string> = {
  hair_salon: "Hair Salon",
  barber_shop: "Barber Shop",
  spa_wellness: "Spa & Wellness",
  beauty_clinic: "Beauty Clinic",
  personal_training: "Personal Training",
  therapy_coaching: "Therapy & Coaching",
  other: "Other",
};

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [timezones, setTimezones] = useState<Timezone[]>([]);

  // Business form state
  const [businessForm, setBusinessForm] = useState<UpdateBusinessRequest>({
    name: "",
    type: "other",
    description: "",
    email: "",
    phoneNumber: "",
    website: "",
    country: "",
    timezone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailBookingConfirmation: true,
    emailBookingReminder: true,
    emailBookingCancellation: true,
    smsBookingReminder: false,
    reminderHoursBefore: 24,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const [businessResult, countriesResult, timezonesResult] = await Promise.all([
      getCurrentBusiness(),
      getCountries(),
      getTimezones(),
    ]);

    if (isSuccessResult(businessResult) && businessResult.data) {
      setBusiness(businessResult.data);
      setBusinessForm({
        name: businessResult.data.name,
        type: businessResult.data.type,
        description: businessResult.data.description || "",
        email: businessResult.data.email || "",
        phoneNumber: businessResult.data.phoneNumber || "",
        website: businessResult.data.website || "",
        country: businessResult.data.country,
        timezone: businessResult.data.timezone,
        address: businessResult.data.address || {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: businessResult.data.country,
        },
      });
    }

    if (isSuccessResult(countriesResult)) {
      setCountries(countriesResult.data);
    }

    if (isSuccessResult(timezonesResult)) {
      setTimezones(timezonesResult.data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveBusiness = async () => {
    if (!businessForm.name) {
      toast.error("Business name is required");
      return;
    }

    setIsSaving(true);
    const result = await updateBusiness(BUSINESS_ID, businessForm);

    if (isSuccessResult(result)) {
      toast.success("Business settings saved successfully");
      setBusiness(result.data);
    } else {
      toast.error(result.error?.message || "Failed to save settings");
    }
    setIsSaving(false);
  };

  const handleSaveNotifications = async () => {
    // TODO: Implement when notification settings API is available
    toast.success("Notification settings saved successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Booklyfy</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.firstName}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your business and account settings
          </p>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Business Settings Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={businessForm.name}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={businessForm.type}
                      onValueChange={(value: BusinessType) =>
                        setBusinessForm({ ...businessForm, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(businessTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell customers about your business..."
                    value={businessForm.description}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <Separator />

                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@business.com"
                      value={businessForm.email}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+46 70 123 4567"
                      value={businessForm.phoneNumber}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, phoneNumber: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.yourbusiness.com"
                    value={businessForm.website}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, website: e.target.value })
                    }
                  />
                </div>

                <Separator />

                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      placeholder="123 Main Street"
                      value={businessForm.address?.street || ""}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          address: {
                            street: e.target.value,
                            city: businessForm.address?.city || "",
                            state: businessForm.address?.state || "",
                            postalCode: businessForm.address?.postalCode || "",
                            country: businessForm.address?.country || businessForm.country || "",
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Stockholm"
                        value={businessForm.address?.city || ""}
                        onChange={(e) =>
                          setBusinessForm({
                            ...businessForm,
                            address: {
                              street: businessForm.address?.street || "",
                              city: e.target.value,
                              state: businessForm.address?.state || "",
                              postalCode: businessForm.address?.postalCode || "",
                              country: businessForm.address?.country || businessForm.country || "",
                            },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Region</Label>
                      <Input
                        id="state"
                        placeholder="Stockholm"
                        value={businessForm.address?.state || ""}
                        onChange={(e) =>
                          setBusinessForm({
                            ...businessForm,
                            address: {
                              street: businessForm.address?.street || "",
                              city: businessForm.address?.city || "",
                              state: e.target.value,
                              postalCode: businessForm.address?.postalCode || "",
                              country: businessForm.address?.country || businessForm.country || "",
                            },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="12345"
                        value={businessForm.address?.postalCode || ""}
                        onChange={(e) =>
                          setBusinessForm({
                            ...businessForm,
                            address: {
                              street: businessForm.address?.street || "",
                              city: businessForm.address?.city || "",
                              state: businessForm.address?.state || "",
                              postalCode: e.target.value,
                              country: businessForm.address?.country || businessForm.country || "",
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Regional Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={businessForm.country}
                      onValueChange={(value) =>
                        setBusinessForm({ ...businessForm, country: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={businessForm.timezone}
                      onValueChange={(value) =>
                        setBusinessForm({ ...businessForm, timezone: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.id} value={tz.id}>
                            {tz.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveBusiness} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure which email notifications to send to customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Confirmation</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email when a booking is created
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailBookingConfirmation}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailBookingConfirmation: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminder before appointment
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailBookingReminder}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailBookingReminder: checked })
                    }
                  />
                </div>

                {notifications.emailBookingReminder && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="reminderHours">Reminder Time</Label>
                    <Select
                      value={notifications.reminderHoursBefore.toString()}
                      onValueChange={(value) =>
                        setNotifications({ ...notifications, reminderHoursBefore: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour before</SelectItem>
                        <SelectItem value="2">2 hours before</SelectItem>
                        <SelectItem value="4">4 hours before</SelectItem>
                        <SelectItem value="12">12 hours before</SelectItem>
                        <SelectItem value="24">24 hours before</SelectItem>
                        <SelectItem value="48">48 hours before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Cancellation</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email when a booking is cancelled
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailBookingCancellation}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailBookingCancellation: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>
                  Configure SMS notifications (additional charges may apply)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Booking Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS reminder before appointment
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsBookingReminder}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, smsBookingReminder: checked })
                    }
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveNotifications}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-medium text-primary">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userFirstName">First Name</Label>
                    <Input id="userFirstName" value={user?.firstName} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userLastName">Last Name</Label>
                    <Input id="userLastName" value={user?.lastName} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input id="userEmail" value={user?.email} disabled />
                </div>

                <p className="text-sm text-muted-foreground">
                  To update your account information, please contact support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">Change Password</Button>
                <p className="text-sm text-muted-foreground">
                  Last password change: Never
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">Delete Account</Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This will permanently delete your account and all associated data.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
