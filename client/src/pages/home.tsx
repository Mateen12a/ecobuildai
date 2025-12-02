import { useState } from "react";
import { MaterialScanner } from "@/components/material-scanner";
import { CarbonStats } from "@/components/carbon-stats";
import { AlternativesGrid } from "@/components/alternatives";
import heroImage from "@assets/generated_images/hero_image_for_sustainable_construction_app.png";
import avatarImage from "@assets/generated_images/professional_architect_portrait.png";
import { motion } from "framer-motion";
import { Sprout, Building2, BarChart3, Menu, Scan, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  const [hasScanned, setHasScanned] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">EcoBuild<span className="text-primary">.AI</span></span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/materials" className="hover:text-primary transition-colors">Materials Library</Link>
            <Link href="/projects" className="hover:text-primary transition-colors">Projects</Link>
            <Link href="/reports" className="hover:text-primary transition-colors">Reports</Link>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8 border border-primary/20">
              <AvatarImage src={avatarImage} alt="Architect User" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="ghost" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero Section */}
        {!hasScanned && (
          <section className="relative h-[500px] flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src={heroImage} alt="Construction Site" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
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
                  AI-powered material analysis and carbon footprint calculation for the next generation of sustainable architecture.
                </p>
              </motion.div>
            </div>
          </section>
        )}

        <div className={`container mx-auto px-4 ${hasScanned ? 'pt-8' : ''} relative z-20 pb-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Scanner & Info */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div layout>
                <MaterialScanner onScanComplete={() => setHasScanned(true)} />
              </motion.div>
              
              {hasScanned && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg p-6 shadow-sm border border-border"
                >
                  <h3 className="font-bold font-display text-lg mb-4">Detected Properties</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Material Type</span>
                      <span className="font-medium">Concrete (C25/30)</span>
                    </li>
                    <li className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Density</span>
                      <span className="font-medium">2400 kg/m³</span>
                    </li>
                    <li className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Thermal Conductivity</span>
                      <span className="font-medium">1.7 W/mK</span>
                    </li>
                    <li className="flex justify-between pt-2">
                      <span className="text-muted-foreground">Embodied Carbon</span>
                      <span className="font-medium text-destructive">High (410 kgCO2e)</span>
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Right Column: Dashboard (Only visible after scan) */}
            <div className="lg:col-span-8">
              {hasScanned ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <CarbonStats />
                  <AlternativesGrid />
                </motion.div>
              ) : (
                /* Feature Highlights visible before scan */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-end pb-8">
                  {[
                    { icon: Scan, title: "Instant Recognition", desc: "Identify materials in seconds with 99% accuracy." },
                    { icon: BarChart3, title: "Carbon Analytics", desc: "Real-time footprint calculation and lifecycle analysis." },
                    { icon: Leaf, title: "Eco Alternatives", desc: "Get AI-recommended sustainable substitutes." }
                  ].map((feature, i) => (
                    <Card key={i} className="bg-white/80 backdrop-blur border-none shadow-lg">
                      <CardContent className="pt-6">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                          <feature.icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold font-display text-lg mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}