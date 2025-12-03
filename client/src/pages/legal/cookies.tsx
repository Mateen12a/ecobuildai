import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Sprout } from "lucide-react";

export default function Cookies() {
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
        <h1 className="text-4xl font-display font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>Last updated: December 03, 2025</p>
          
          <h2 className="text-2xl font-bold text-foreground">1. What Are Cookies</h2>
          <p>As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.</p>

          <h2 className="text-2xl font-bold text-foreground">2. How We Use Cookies</h2>
          <p>We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration.</li>
            <li><strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.</li>
            <li><strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground">3. Disabling Cookies</h2>
          <p>You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.</p>
        </div>
      </main>
    </div>
  );
}