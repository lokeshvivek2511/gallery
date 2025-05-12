import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import PasswordScreen from "@/components/PasswordScreen";
import Home from "@/pages/Home";
import Collection from "@/pages/Collection";
import Recent from "@/pages/Recent";
import Favorites from "@/pages/Favorites";
import HeartAnimation from './components/HeartAnimation';
import { AppProvider, useApp } from "./contexts/AppContext";

// Main app wrapper with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <div className="relative min-h-screen bg-[#FFF5F5]">
            <Toaster />
            <AppContent />
          </div>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// The actual content, using the context
function AppContent() {
  const { isAuthenticated } = useApp();
  
  if (!isAuthenticated) {
    return <PasswordScreen />;
  }
  
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/collections/:id" component={Collection} />
        <Route path="/recent" component={Recent} />
        <Route path="/favorites" component={Favorites} />
        <Route component={NotFound} />
      </Switch>
      <HeartAnimation />
    </>
  );
}

export default App;
