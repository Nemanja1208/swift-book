import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Clock,
  User,
  Scissors,
  Loader2,
  Check,
} from "lucide-react";
import {
  getServiceList,
  getStaffList,
  getAvailability,
  searchCustomers,
  createBooking,
} from "@/services";
import { Service, Staff, Customer, TimeSlot, CreateBookingRequest } from "@/types";
import { isSuccessResult } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

type BookingStep = "service" | "staff" | "datetime" | "customer" | "confirm";

const NewBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step state
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);

  // Selection state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New customer form
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [bookingNotes, setBookingNotes] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    const [servicesResult, staffResult] = await Promise.all([
      getServiceList("business-1"),
      getStaffList("business-1"),
    ]);

    if (isSuccessResult(servicesResult)) {
      setServices(servicesResult.data);
    }
    if (isSuccessResult(staffResult)) {
      setStaff(staffResult.data);
    }
    setIsLoading(false);
  }, []);

  const loadAvailability = useCallback(async () => {
    if (!selectedService) return;

    const result = await getAvailability("business-1", {
      serviceId: selectedService.id,
      staffId: selectedStaff?.id,
      date: selectedDate,
    });

    if (isSuccessResult(result)) {
      setAvailableSlots(result.data.slots);
    }
  }, [selectedService, selectedStaff?.id, selectedDate]);

  const searchCustomersDebounced = useCallback(async (query: string) => {
    const result = await searchCustomers("business-1", query);
    if (isSuccessResult(result)) {
      setCustomerSearchResults(result.data);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (selectedService && selectedStaff && selectedDate) {
      loadAvailability();
    }
  }, [selectedService, selectedStaff, selectedDate, loadAvailability]);

  useEffect(() => {
    if (customerSearch.length >= 2) {
      searchCustomersDebounced(customerSearch);
    } else {
      setCustomerSearchResults([]);
    }
  }, [customerSearch, searchCustomersDebounced]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep("staff");
  };

  const handleStaffSelect = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setCurrentStep("datetime");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setCurrentStep("customer");
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsNewCustomer(false);
    setCurrentStep("confirm");
  };

  const handleNewCustomerSubmit = () => {
    if (!newCustomerData.firstName || !newCustomerData.email) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in at least first name and email",
      });
      return;
    }
    setSelectedCustomer(null);
    setIsNewCustomer(true);
    setCurrentStep("confirm");
  };

  const handleCreateBooking = async () => {
    if (!selectedService || !selectedStaff || !selectedSlot) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please complete all booking steps",
      });
      return;
    }

    setIsSubmitting(true);

    const bookingRequest: CreateBookingRequest = {
      serviceId: selectedService.id,
      staffId: selectedStaff.id,
      startTime: selectedSlot.startTime,
      notes: bookingNotes || undefined,
      ...(selectedCustomer
        ? { customerId: selectedCustomer.id }
        : {
            customerEmail: newCustomerData.email,
            customerFirstName: newCustomerData.firstName,
            customerLastName: newCustomerData.lastName,
            customerPhoneNumber: newCustomerData.phoneNumber || undefined,
          }),
    };

    const result = await createBooking("business-1", bookingRequest);

    if (isSuccessResult(result)) {
      toast({
        title: "Booking created!",
        description: "The appointment has been scheduled successfully.",
      });
      navigate(`/bookings/${result.data.id}/confirmation`);
    } else {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: result.error?.message || "Failed to create booking",
      });
    }

    setIsSubmitting(false);
  };

  const goBack = () => {
    const steps: BookingStep[] = ["service", "staff", "datetime", "customer", "confirm"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      navigate("/dashboard");
    }
  };

  const getStepNumber = () => {
    const steps: BookingStep[] = ["service", "staff", "datetime", "customer", "confirm"];
    return steps.indexOf(currentStep) + 1;
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">New Booking</h1>
              <p className="text-sm text-muted-foreground">
                Step {getStepNumber()} of 5
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step 1: Select Service */}
        {currentStep === "service" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Select Service
              </CardTitle>
              <CardDescription>Choose the service for this booking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    className="w-full p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors text-left"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.durationMinutes} min
                        </p>
                      </div>
                      <p className="font-semibold">
                        {service.price} {service.currency}
                      </p>
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {service.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Staff */}
        {currentStep === "staff" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Staff
              </CardTitle>
              <CardDescription>
                Choose who will perform {selectedService?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staff.map((member) => (
                  <button
                    key={member.id}
                    className="w-full p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors text-left"
                    onClick={() => handleStaffSelect(member)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {member.user?.firstName?.[0]}
                          {member.user?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.title}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Date & Time */}
        {currentStep === "datetime" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
              <CardDescription>
                Choose when to schedule the appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => {
                      const date = addDays(new Date(), i);
                      return (
                        <SelectItem
                          key={i}
                          value={format(date, "yyyy-MM-dd")}
                        >
                          {format(date, "EEEE, MMMM d")}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <Label>Available Times</Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      disabled={!slot.isAvailable}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        slot.isAvailable
                          ? selectedSlot?.startTime === slot.startTime
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary hover:bg-accent/50"
                          : "border-border bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                      onClick={() => slot.isAvailable && handleSlotSelect(slot)}
                    >
                      {format(new Date(slot.startTime), "HH:mm")}
                    </button>
                  ))}
                </div>
                {availableSlots.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No available slots for this date
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Customer Information */}
        {currentStep === "customer" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
              <CardDescription>
                Search for existing customer or add new
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Search */}
              <div className="space-y-2">
                <Label>Search Existing Customer</Label>
                <Input
                  placeholder="Search by name or email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                {customerSearchResults.length > 0 && (
                  <div className="border border-border rounded-lg divide-y divide-border">
                    {customerSearchResults.map((customer) => (
                      <button
                        key={customer.id}
                        className="w-full p-3 hover:bg-accent/50 transition-colors text-left"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <p className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.email}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or add new customer
                  </span>
                </div>
              </div>

              {/* New Customer Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={newCustomerData.firstName}
                      onChange={(e) =>
                        setNewCustomerData({
                          ...newCustomerData,
                          firstName: e.target.value,
                        })
                      }
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={newCustomerData.lastName}
                      onChange={(e) =>
                        setNewCustomerData({
                          ...newCustomerData,
                          lastName: e.target.value,
                        })
                      }
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) =>
                      setNewCustomerData({
                        ...newCustomerData,
                        email: e.target.value,
                      })
                    }
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={newCustomerData.phoneNumber}
                    onChange={(e) =>
                      setNewCustomerData({
                        ...newCustomerData,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+46 70 123 4567"
                  />
                </div>
                <Button className="w-full" onClick={handleNewCustomerSubmit}>
                  Continue with New Customer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === "confirm" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Confirm Booking
              </CardTitle>
              <CardDescription>Review and confirm the booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Summary */}
              <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Staff</span>
                  <span className="font-medium">
                    {selectedStaff?.user?.firstName} {selectedStaff?.user?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">
                    {selectedSlot &&
                      format(new Date(selectedSlot.startTime), "EEEE, MMM d 'at' HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {selectedService?.durationMinutes} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">
                    {selectedCustomer
                      ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                      : `${newCustomerData.firstName} ${newCustomerData.lastName}`}
                  </span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">
                    {selectedService?.price} {selectedService?.currency}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Booking Notes (Optional)</Label>
                <Textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              {/* Confirm Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleCreateBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default NewBooking;
