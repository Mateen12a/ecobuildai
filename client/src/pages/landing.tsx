import { useState } from "react";
import { MaterialScanner } from "@/components/material-scanner";
import { CarbonStats } from "@/components/carbon-stats";
import { AlternativesGrid } from "@/components/alternatives";
import heroImage from "@assets/generated_images/hero_image_for_sustainable_construction_app.png";
import { motion } from "framer-motion";
import { Sprout, Building2, BarChart3, Menu, Scan, Leaf, LogIn, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function Landing() {
  const [hasScanned, setHasScanned] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [_, setLocation] = useLocation();

  const handleScanComplete = () => {
    if (scanCount >= 2) { // 0, 1, 2 = 3 tries
      setHasScanned(true);
      setScanCount(prev => prev + 1);
      setTimeout(() => {
        setShowLoginPrompt(true);
      }, 2000);
    } else {
      setHasScanned(true);
      setScanCount(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="bg-primary text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">EcoBuild<span className="text-primary">.AI</span></span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth">
                <Button variant="ghost" className="hidden md:flex">Sign In</Button>
            </Link>
            <Link href="/auth">
                <Button>Get Started <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </Link>
            <Button size="icon" variant="ghost" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative flex-grow">
        {/* Hero Section */}
        {!hasScanned && (
          <section className="relative h-[600px] flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src={heroImage} alt="Construction Site" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                  <Building2 className="w-3 h-3" /> Intelligent Construction
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight text-foreground">
                  Build Smarter.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Build Greener.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  Try our AI-powered material scanner for free. Identify materials and find eco-friendly alternatives instantly.
                </p>
                <div className="flex gap-4 pt-4">
                    <Button size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/20" onClick={() => document.getElementById('scanner-section')?.scrollIntoView({behavior: 'smooth'})}>
                        Try Demo Scanner
                    </Button>
                    <Link href="/about">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                            Learn More
                        </Button>
                    </Link>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        <div id="scanner-section" className={`container mx-auto px-4 ${hasScanned ? 'pt-8' : 'py-24'} relative z-20 pb-20`}>
            {!hasScanned && (
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-display font-bold mb-4">Experience the Power of AI</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">Upload or drag and drop a material image to see our analysis engine in action. <br/>You have <span className="font-bold text-primary">{3 - scanCount} free scans</span> remaining.</p>
                </div>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Scanner & Info */}
            <div className={`lg:col-span-4 space-y-6 ${!hasScanned ? 'lg:col-start-5' : ''}`}>
              <motion.div layout>
                <MaterialScanner onScanComplete={handleScanComplete} />
              </motion.div>
              
              {hasScanned && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg p-6 shadow-sm border border-border"
                >
                  <h3 className="font-bold font-display text-lg mb-4">Detected Properties</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between py-2 border-b border-border/50 hover:bg-secondary/10 px-2 rounded transition-colors cursor-default group">
                      <span className="text-muted-foreground">Material Type</span>
                      <span className="font-medium group-hover:text-primary transition-colors">Concrete (C25/30)</span>
                    </li>
                    <li className="flex justify-between py-2 border-b border-border/50 hover:bg-secondary/10 px-2 rounded transition-colors cursor-default group">
                      <span className="text-muted-foreground">Density</span>
                      <span className="font-medium group-hover:text-primary transition-colors">2400 kg/m³</span>
                    </li>
                    <li className="flex justify-between py-2 border-b border-border/50 hover:bg-secondary/10 px-2 rounded transition-colors cursor-default group">
                      <span className="text-muted-foreground">Thermal Conductivity</span>
                      <span className="font-medium group-hover:text-primary transition-colors">1.7 W/mK</span>
                    </li>
                    <li className="flex justify-between pt-2 hover:shadow-md p-2 rounded transition-all">
                      <span className="text-muted-foreground">Embodied Carbon</span>
                      <span className="font-medium text-destructive flex items-center gap-1">High <AlertTriangleIcon className="w-4 h-4" /></span>
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Right Column: Dashboard (Only visible after scan) */}
            {hasScanned && (
                <div className="lg:col-span-8">
                    <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                    >
                    <div className="hover:scale-[1.01] transition-transform duration-300">
                         <CarbonStats />
                    </div>
                    <AlternativesGrid />
                    </motion.div>
                </div>
            )}
          </div>
        </div>

         {/* Features Section (only if not scanned to keep clean) */}
         {!hasScanned && (
            <section id="features" className="bg-secondary/20 py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold mb-4">Why Choose EcoBuild.AI?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">Comprehensive tools for the modern sustainable architect.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Scan, title: "Instant Recognition", desc: "Identify materials in seconds with 99% accuracy using our proprietary computer vision models." },
                            { icon: BarChart3, title: "Carbon Analytics", desc: "Real-time footprint calculation and lifecycle analysis to ensure compliance with green building standards." },
                            { icon: Leaf, title: "Eco Alternatives", desc: "Get AI-recommended sustainable substitutes that match structural requirements but lower carbon impact." }
                        ].map((feature, i) => (
                            <Card key={i} className="bg-background border-none shadow-lg hover:-translate-y-2 transition-transform duration-300">
                                <CardContent className="pt-8 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary mx-auto">
                                        <feature.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold font-display text-xl mb-4">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
         )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-white p-1.5 rounded-lg">
                            <Sprout className="w-5 h-5" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight">EcoBuild<span className="text-primary">.AI</span></span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Empowering architects to build a sustainable future through intelligent material analysis.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-bold mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Case Studies</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Company</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
                &copy; 2025 EcoBuild AI Inc. All rights reserved.
            </div>
        </div>
      </footer>

      {/* Login Limit Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Free Scans Limit Reached</DialogTitle>
                <DialogDescription>
                    You've hit the limit of 3 free scans. Create a free account to continue analyzing materials and unlock full reports.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setShowLoginPrompt(false)}>Cancel</Button>
                <Link href="/auth">
                    <Button className="w-full sm:w-auto">Sign Up Free</Button>
                </Link>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertTriangleIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    )
  }