import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Sprout, Users, Globe, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@assets/generated_images/hero_image_for_sustainable_construction_app.png";

export default function About() {
  return (
    <div className="min-h-screen bg-background font-sans">
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
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
             <div className="absolute inset-0 z-0 opacity-10">
              <img src={heroImage} alt="Construction Site" className="w-full h-full object-cover" />
            </div>
            <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Our Mission is to <span className="text-primary">Decarbonize Construction</span></h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    We believe that every building starts with a choice. By empowering architects and engineers with intelligent data, we can reduce the built environment's carbon footprint, one material at a time.
                </p>
            </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-secondary/20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <h3 className="text-4xl font-bold text-primary mb-2">2.4M+</h3>
                        <p className="text-sm text-muted-foreground">Materials Analyzed</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold text-primary mb-2">450k</h3>
                        <p className="text-sm text-muted-foreground">Tons CO2 Offset</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold text-primary mb-2">12k+</h3>
                        <p className="text-sm text-muted-foreground">Active Architects</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold text-primary mb-2">98%</h3>
                        <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Story */}
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img 
                            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200" 
                            alt="Team working" 
                            className="rounded-2xl shadow-2xl"
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-display font-bold">Built by Architects, for Architects</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            EcoBuild.AI was founded in 2024 by a team of structural engineers and data scientists who were frustrated by the lack of transparent environmental data in the construction industry.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We realized that while sustainable alternatives existed, they were often hard to find or difficult to compare against standard materials. We set out to change that by building the world's most comprehensive material intelligence platform.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <div className="flex items-start gap-3">
                                <Globe className="w-6 h-6 text-primary shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm">Global Database</h4>
                                    <p className="text-xs text-muted-foreground">Sourced from certified EPDs worldwide.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm">Verified Data</h4>
                                    <p className="text-xs text-muted-foreground">ISO 14040 compliant lifecycle assessments.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-20 bg-slate-900 text-white text-center">
            <div className="container mx-auto px-4 max-w-2xl">
                <h2 className="text-3xl font-display font-bold mb-6">Ready to build the future?</h2>
                <p className="text-slate-300 mb-8 text-lg">Join the community of forward-thinking professionals using EcoBuild.AI today.</p>
                <Link href="/auth">
                    <Button size="lg" className="px-8">Get Started for Free</Button>
                </Link>
            </div>
        </section>

      </main>
      
       {/* Footer (Consistent with Landing) */}
       <footer className="bg-slate-950 text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
            &copy; 2025 EcoBuild AI Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}