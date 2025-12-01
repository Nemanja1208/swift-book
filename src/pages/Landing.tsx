import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Zap, CheckCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Booklyfy</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              Log In
            </Button>
            <Button size="sm" onClick={() => navigate("/onboarding")}>
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <Zap className="h-4 w-4" />
            Modern booking made simple
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
            Online Booking for
            <span className="block text-primary mt-2">Your Business</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The fastest way to accept online bookings. Set up in minutes, manage with ease, delight your customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-base h-12 px-8" onClick={() => navigate("/onboarding")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-base h-12 px-8">
              Watch Demo
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              14-day free trial
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to manage bookings
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for small businesses. No complexity, just results.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Smart Calendar",
                description: "Intelligent scheduling that prevents double bookings and respects your working hours.",
              },
              {
                icon: Clock,
                title: "Real-time Availability",
                description: "Customers see only available time slots. Automatic updates across all channels.",
              },
              {
                icon: Users,
                title: "Staff Management",
                description: "Manage multiple staff members with individual schedules and service assignments.",
              },
              {
                icon: Zap,
                title: "Instant Setup",
                description: "Get your booking page live in under 5 minutes. No technical skills required.",
              },
              {
                icon: Star,
                title: "Customer Experience",
                description: "Beautiful, mobile-first booking flow that customers love to use.",
              },
              {
                icon: CheckCircle,
                title: "Automatic Reminders",
                description: "Reduce no-shows with automated email and SMS reminders to customers.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get started in 3 simple steps</h2>
            <p className="text-lg text-muted-foreground">From signup to your first booking in minutes</p>
          </div>
          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "Create your account",
                description: "Sign up and tell us about your business. Takes less than a minute.",
              },
              {
                step: "2",
                title: "Add your services",
                description: "List the services you offer, set prices and durations. We'll guide you through it.",
              },
              {
                step: "3",
                title: "Share your booking page",
                description: "Get a unique booking link. Share it with customers and start accepting bookings immediately.",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to streamline your bookings?</h2>
          <p className="text-lg opacity-90">Join hundreds of businesses already using Booklyfy</p>
          <Button size="lg" variant="secondary" className="text-base h-12 px-8" onClick={() => navigate("/onboarding")}>
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Booklyfy</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 Booklyfy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
