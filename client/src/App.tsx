import { useState, useEffect } from 'react';
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
import { AppProvider } from "./contexts/AppContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen bg-[#FFF5F5]">
          <Toaster />
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// AppRoutes is inside the AppProvider, so it can use useApp
function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  if (!isAuthenticated) {
    return <PasswordScreen onAuthenticate={() => setIsAuthenticated(true)} />;
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
