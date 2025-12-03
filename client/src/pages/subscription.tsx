import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Check, Zap, Crown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function Subscription() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: 0,
      description: "For individuals exploring sustainable materials.",
      features: ["3 Material Scans / Month", "Basic Carbon Stats", "Community Support"],
      current: true,
    },
    {
      name: "Professional",
      price: isAnnual ? 24 : 29,
      description: "For architects needing advanced analysis.",
      features: ["Unlimited Material Scans", "Advanced Lifecycle Analysis", "Export PDF Reports", "Project Management Dashboard", "Priority Support"],
      popular: true,
      icon: Zap,
    },
    {
      name: "Enterprise",
      price: isAnnual ? 89 : 99,
      description: "For large firms and organizations.",
      features: ["Everything in Pro", "API Access", "Custom Integrations", "Dedicated Success Manager", "Team Collaboration (10+ Users)"],
      icon: Crown,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 pt-8"
      >
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

        <div className="flex justify-center items-center gap-4 mb-12">
          <Label htmlFor="billing-mode" className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly Billing</Label>
          <Switch id="billing-mode" checked={isAnnual} onCheckedChange={setIsAnnual} />
          <Label htmlFor="billing-mode" className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annual Billing <span className="text-green-500 text-xs ml-1 font-bold">(Save 20%)</span>
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full flex flex-col relative overflow-hidden transition-all duration-300 ${plan.popular ? 'border-2 border-primary shadow-xl scale-105 z-10' : 'border-none shadow-md hover:shadow-xl hover:-translate-y-1'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 w-full bg-primary py-1 text-center text-xs font-bold text-white uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <CardHeader className={`text-center pb-2 ${plan.popular ? 'pt-8' : ''}`}>
                  {plan.icon && <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${plan.popular ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-foreground'}`}><plan.icon className="w-6 h-6" /></div>}
                  <h3 className={`font-display font-bold text-xl ${plan.popular ? 'text-primary' : ''}`}>{plan.name}</h3>
                  <p className="text-xs text-muted-foreground h-8 px-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-1">/mo</span>
                  </div>
                  {isAnnual && plan.price > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-1">Billed ${plan.price * 12} yearly</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 pt-4 flex-grow">
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className={`w-4 h-4 mr-2 shrink-0 mt-0.5 ${plan.popular ? 'text-primary' : 'text-green-600'}`} />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"} 
                    className={`w-full ${plan.popular ? 'font-bold shadow-lg shadow-primary/20' : ''}`}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade Now"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 max-w-3xl mx-auto bg-secondary/20 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left"
        >
          <div className="bg-primary/10 p-4 rounded-full text-primary shrink-0">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Enterprise Custom Solutions</h4>
            <p className="text-sm text-muted-foreground mt-1">Need a custom solution for your large organization? We offer tailored plans with specific compliance requirements, SSO, and dedicated support.</p>
          </div>
          <Button variant="secondary" className="sm:ml-auto whitespace-nowrap">Contact Sales</Button>
        </motion.div>
      </motion.div>
    </div>
  );
}