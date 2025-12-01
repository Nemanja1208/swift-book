import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If logged in, go to dashboard; otherwise, go to landing page
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/landing" replace />;
};

export default Index;
