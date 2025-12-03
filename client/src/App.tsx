import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

// New Pages
import Privacy from "@/pages/legal/privacy";
import Terms from "@/pages/legal/terms";
import Cookies from "@/pages/legal/cookies";
import Contact from "@/pages/contact";
import CaseStudies from "@/pages/case-studies";
import ApiDocs from "@/pages/api-docs";
import Pricing from "@/pages/pricing";
import Features from "@/pages/features";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/materials" component={MaterialsLibrary} />
      <Route path="/materials/:id" component={MaterialDetail} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/reports" component={Reports} />
      <Route path="/profile" component={Profile} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/settings" component={Settings} />
      <Route path="/about" component={About} />
      
      {/* New Routes */}
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;