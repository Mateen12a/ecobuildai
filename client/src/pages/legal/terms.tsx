import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Sprout } from "lucide-react";

export default function Terms() {
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

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>Last updated: December 03, 2025</p>
          
          <h2 className="text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
          <p>By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with these terms, you are prohibited from using or accessing this site or using any other services provided by EcoBuild.AI.</p>

          <h2 className="text-2xl font-bold text-foreground">2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on EcoBuild.AI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on EcoBuild.AI's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground">3. AI Analysis Disclaimer</h2>
          <p>The material analysis provided by EcoBuild.AI is based on artificial intelligence and computer vision algorithms. While we strive for high accuracy, the results are estimates and should not be the sole basis for structural engineering decisions without professional verification. EcoBuild.AI is not responsible for any construction errors resulting from reliance on our data.</p>
        </div>
      </main>
    </div>
  );
}