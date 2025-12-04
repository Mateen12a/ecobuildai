import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./lib/auth-context";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import MaterialsLibrary from "@/pages/materials-library";
import MaterialDetail from "@/pages/material-detail";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import Reports from "@/pages/reports";
import AuthPage from "@/pages/auth";
import Profile from "@/pages/profile";
import Subscription from "@/pages/subscription";
import Settings from "@/pages/settings";
import About from "@/pages/about";
import Privacy from "@/pages/legal/privacy";
import Terms from "@/pages/legal/terms";
import Cookies from "@/pages/legal/cookies";
import Contact from "@/pages/contact";
import CaseStudies from "@/pages/case-studies";
import ApiDocs from "@/pages/api-docs";
import Pricing from "@/pages/pricing";
import Features from "@/pages/features";
import ScanHistory from "@/pages/scan-history";
import MLAdmin from "@/pages/ml-admin";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/auth" component={AuthPage} />
      <Route path="/materials" component={MaterialsLibrary} />
      <Route path="/materials/:id" component={MaterialDetail} />
      <Route path="/projects">
        <ProtectedRoute component={Projects} />
      </Route>
      <Route path="/projects/:id">
        <ProtectedRoute component={ProjectDetail} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={Reports} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/subscription">
        <ProtectedRoute component={Subscription} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route path="/history">
        <ProtectedRoute component={ScanHistory} />
      </Route>
      <Route path="/ml-admin">
        <ProtectedRoute component={MLAdmin} />
      </Route>
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/contact" component={Contact} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/api" component={ApiDocs} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/features" component={Features} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
