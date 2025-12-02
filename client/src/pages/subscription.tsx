import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Check, CreditCard, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Subscription() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/profile">
              <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
              </Button>
            </Link>
            <h1 className="text-3xl font-display font-bold">Subscription Plans</h1>
            <p className="text-muted-foreground">Choose the plan that fits your sustainable design needs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="border-none shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
            <CardHeader className="text-center pb-2">
              <h3 className="font-display font-bold text-xl">Starter</h3>
              <div className="flex items-baseline justify-center mt-2">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground ml-1">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> 3 Material Scans / Month</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Basic Carbon Stats</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Community Support</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Current Plan</Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-primary shadow-xl scale-105 relative overflow-hidden bg-primary/5">
            <div className="absolute top-0 left-0 w-full bg-primary py-1 text-center text-xs font-bold text-white uppercase tracking-wider">
              Most Popular
            </div>
            <CardHeader className="text-center pb-2 pt-8">
              <h3 className="font-display font-bold text-xl text-primary">Professional</h3>
              <div className="flex items-baseline justify-center mt-2">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground ml-1">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <ul className="space-y-3 text-sm font-medium">
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Unlimited Material Scans</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Advanced Lifecycle Analysis</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Export PDF Reports</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Project Management Dashboard</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Priority Support</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full font-bold shadow-lg shadow-primary/20">Upgrade Now</Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-none shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
            <CardHeader className="text-center pb-2">
              <h3 className="font-display font-bold text-xl">Enterprise</h3>
              <div className="flex items-baseline justify-center mt-2">
                <span className="text-3xl font-bold">$99</span>
                <span className="text-muted-foreground ml-1">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Everything in Pro</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> API Access</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Custom Integrations</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Dedicated Success Manager</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Team Collaboration (10+ Users)</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 max-w-3xl mx-auto bg-secondary/20 rounded-xl p-6 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold">Enterprise Custom Solutions</h4>
            <p className="text-sm text-muted-foreground">Need a custom solution for your large organization? We offer tailored plans with specific compliance requirements.</p>
          </div>
          <Button variant="ghost" className="ml-auto">Learn More</Button>
        </div>
      </div>
    </div>
  );
}