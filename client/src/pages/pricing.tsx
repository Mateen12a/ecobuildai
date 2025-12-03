import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Sprout, CheckCircle2, Crown, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: 0,
      description: "For individuals exploring sustainable materials.",
      features: ["3 Material Scans / Month", "Basic Carbon Stats", "Community Support"],
    },
    {
      name: "Professional",
      price: 29,
      description: "For architects needing advanced analysis.",
      features: ["Unlimited Material Scans", "Advanced Lifecycle Analysis", "Export PDF Reports", "Project Management Dashboard", "Priority Support"],
      popular: true,
      icon: Zap,
    },
    {
      name: "Enterprise",
      price: 99,
      description: "For large firms and organizations.",
      features: ["Everything in Pro", "API Access", "Custom Integrations", "Dedicated Success Manager", "Team Collaboration (10+ Users)"],
      icon: Crown,
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans pb-20">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">EcoBuild<span className="text-primary">.AI</span></span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">
                Start for free, upgrade when you need more power. No hidden fees.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
                <Card key={index} className={`h-full flex flex-col relative overflow-hidden transition-all duration-300 ${plan.popular ? 'border-2 border-primary shadow-xl scale-105 z-10' : 'border-none shadow-md hover:shadow-xl'}`}>
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
                </CardHeader>
                <CardContent className="space-y-4 pt-4 flex-grow">
                    <ul className="space-y-3 text-sm">
                    {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                        <CheckCircle2 className={`w-4 h-4 mr-2 shrink-0 mt-0.5 ${plan.popular ? 'text-primary' : 'text-green-600'}`} />
                        <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Link href="/auth" className="w-full">
                        <Button 
                        variant={plan.popular ? "default" : "outline"} 
                        className={`w-full ${plan.popular ? 'font-bold shadow-lg shadow-primary/20' : ''}`}
                        >
                        Get Started
                        </Button>
                    </Link>
                </CardFooter>
                </Card>
            ))}
        </div>

        <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left mt-8">
                <div>
                    <h4 className="font-bold mb-2">Can I cancel anytime?</h4>
                    <p className="text-sm text-muted-foreground">Yes, you can cancel your subscription at any time. Your access will remain active until the end of your billing period.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-2">Do you offer student discounts?</h4>
                    <p className="text-sm text-muted-foreground">Yes! Students with a valid .edu email address get 50% off the Professional plan.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-2">Is the carbon data certified?</h4>
                    <p className="text-sm text-muted-foreground">Our data is sourced from verified Environmental Product Declarations (EPDs) compliant with ISO 14025.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-2">What payment methods do you accept?</h4>
                    <p className="text-sm text-muted-foreground">We accept all major credit cards, PayPal, and wire transfers for Enterprise accounts.</p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}