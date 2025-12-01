import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  MapPin,
  CheckCircle,
  Loader2,
  Home,
  Plus,
  Mail,
  Phone,
} from "lucide-react";
import { getBookingById } from "@/services";
import { Booking } from "@/types";
import { isSuccessResult } from "@/types/api";
import { format } from "date-fns";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBooking = useCallback(async () => {
    if (!bookingId) return;

    setIsLoading(true);
    const result = await getBookingById("business-1", bookingId);

    if (isSuccessResult(result)) {
      setBooking(result.data);
    }
    setIsLoading(false);
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId, loadBooking]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Booking not found</h1>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-green-500/10 border-b border-green-500/20">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-green-600 dark:text-green-500">
            Your appointment has been successfully scheduled
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
              <p className="text-2xl font-mono font-bold tracking-wider">
                {booking.id.split("-")[1]?.toUpperCase() || booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="space-y-6">
              {/* Service */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Scissors className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium text-lg">{booking.service?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.service?.durationMinutes} minutes
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {booking.price} {booking.currency}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium text-lg">
                    {format(new Date(booking.startTime), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-muted-foreground">
                    {format(new Date(booking.startTime), "HH:mm")} -{" "}
                    {format(new Date(booking.endTime), "HH:mm")}
                  </p>
                </div>
              </div>

              {/* Staff */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Staff</p>
                  <p className="font-medium text-lg">
                    {booking.staff?.user?.firstName} {booking.staff?.user?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{booking.staff?.title}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-lg">Style Studio</p>
                  <p className="text-muted-foreground">
                    Drottninggatan 50, 111 21 Stockholm
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Customer Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  {booking.customer?.firstName} {booking.customer?.lastName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{booking.customer?.email}</span>
              </div>
              {booking.customer?.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.customer?.phoneNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes Card (if any) */}
        {booking.notes && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Booking Notes</h3>
              <p className="text-muted-foreground">{booking.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* What's Next Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              What's Next?
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  A confirmation email has been sent to{" "}
                  <strong>{booking.customer?.email}</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  You'll receive a reminder 24 hours before your appointment
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  Please arrive 5-10 minutes early for your appointment
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/dashboard", { state: { refresh: true } })}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button className="flex-1" onClick={() => navigate("/bookings/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Another Booking
          </Button>
        </div>

        {/* Add to Calendar (placeholder) */}
        <div className="mt-6 text-center">
          <Button variant="link" className="text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Add to Calendar
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BookingConfirmation;
