import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Collection from "@/pages/collection";
import { AuthProvider } from "./hooks/useAuth";
import Login from "./components/Login";
import { useState } from "react";
import FloatingHearts from "./components/FloatingHearts";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/collection/:id" component={Collection} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <Login onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider value={{ authenticated, setAuthenticated }}>
          <FloatingHearts />
          <div className="min-h-screen flex flex-col">
            <Toaster />
            <Router />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
