import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Sprout, Mail, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
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

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-display font-bold mb-4">Get in touch</h1>
                    <p className="text-lg text-muted-foreground">
                        Have questions about our enterprise solutions or need technical support? We're here to help.
                    </p>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-md bg-secondary/10">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Email Us</h3>
                                <p className="text-sm text-muted-foreground mb-1">Our friendly team is here to help.</p>
                                <a href="mailto:hello@ecobuild.ai" className="text-primary hover:underline font-medium">hello@ecobuild.ai</a>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-secondary/10">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Visit Us</h3>
                                <p className="text-sm text-muted-foreground mb-1">Come say hello at our office.</p>
                                <p className="text-foreground font-medium">100 Sustainable Way, Green City, 12345</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-secondary/10">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Call Us</h3>
                                <p className="text-sm text-muted-foreground mb-1">Mon-Fri from 8am to 5pm.</p>
                                <p className="text-foreground font-medium">+1 (555) 000-0000</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first-name">First name</Label>
                            <Input id="first-name" placeholder="Jane" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name">Last name</Label>
                            <Input id="last-name" placeholder="Doe" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="jane@company.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <textarea 
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="How can we help you?"
                        />
                    </div>
                    <Button type="submit" className="w-full" size="lg">Send Message</Button>
                </form>
            </div>
        </div>
      </main>
    </div>
  );
}