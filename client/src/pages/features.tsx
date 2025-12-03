import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Sprout, Scan, BarChart3, Leaf, Smartphone, Cloud, Lock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Features() {
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

      <main>
        {/* Hero */}
        <section className="py-20 bg-secondary/10">
            <div className="container mx-auto px-4 text-center max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Powerful Tools for Sustainable Design</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Everything you need to measure, analyze, and reduce the carbon footprint of your construction projects.
                </p>
                <Link href="/auth">
                    <Button size="lg" className="px-8">Try for Free</Button>
                </Link>
            </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Scan className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Visual Material Recognition</h3>
                        <p className="text-muted-foreground">
                            Upload photos from site visits and let our AI identify materials instantly. Works on raw materials, surfaces, and construction elements.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Lifecycle Assessment (LCA)</h3>
                        <p className="text-muted-foreground">
                            Get instant calculations for Global Warming Potential (GWP), embodied energy, and acidification potential based on volume.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Leaf className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Alternative Recommendations</h3>
                        <p className="text-muted-foreground">
                            Don't just identify the problem, solve it. Our engine suggests structurally viable, low-carbon alternatives for every material scanned.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Mobile Optimized</h3>
                        <p className="text-muted-foreground">
                            Designed for the job site. Use EcoBuild.AI on your tablet or phone to scan materials right where they are installed.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Cloud className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Cloud Sync</h3>
                        <p className="text-muted-foreground">
                            All your projects, scans, and reports are synced across devices in real-time. Collaborate with your team from anywhere.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Enterprise Security</h3>
                        <p className="text-muted-foreground">
                            Bank-grade encryption and SOC2 compliant infrastructure ensure your proprietary project data stays safe.
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}