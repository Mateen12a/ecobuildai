import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Sprout, ArrowRight, Loader2, Mail, Lock } from "lucide-react";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Side - Visual */}
      <div className="hidden md:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" 
            alt="Architecture Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-md text-white space-y-6">
          <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30">
            <Sprout className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-display font-bold leading-tight">
            Building the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Future Green.</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Join thousands of architects and engineers using AI to design sustainable, carbon-negative structures.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/5 backdrop-blur p-4 rounded-lg border border-white/10">
              <h3 className="font-bold text-2xl">2.4M+</h3>
              <p className="text-sm text-white/60">Materials Analyzed</p>
            </div>
            <div className="bg-white/5 backdrop-blur p-4 rounded-lg border border-white/10">
              <h3 className="font-bold text-2xl text-green-400">-45%</h3>
              <p className="text-sm text-white/60">Avg Carbon Reduction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <div className="inline-flex md:hidden items-center gap-2 mb-6">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg">EcoBuild.AI</span>
            </div>
            <h2 className="text-3xl font-bold font-display">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your workspace.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" placeholder="name@company.com" className="pl-10" type="email" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" placeholder="••••••••" className="pl-10" type="password" required />
                  </div>
                </div>
                
                <div className="flex items-center justify-end">
                  <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" placeholder="name@company.com" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" placeholder="Create a password" type="password" required />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Create Account <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline">Google</Button>
            <Button variant="outline">GitHub</Button>
          </div>
        </div>
      </div>
    </div>
  );
}