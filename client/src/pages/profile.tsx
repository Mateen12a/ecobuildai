import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, User, CreditCard, Settings as SettingsIcon, Loader2, Camera } from "lucide-react";
import { Link, useLocation } from "wouter";
import avatarImage from "@assets/generated_images/professional_architect_portrait.png";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 pt-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-display font-bold">Account Settings</h1>
            <p className="text-muted-foreground">Manage your profile and preferences.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="h-fit border-none shadow-md lg:col-span-1 overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4 group">
                  <Avatar className="h-24 w-24 border-2 border-primary/20 transition-transform group-hover:scale-105">
                    <AvatarImage src={avatarImage} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 shadow-md hover:bg-primary hover:text-white transition-colors">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="font-display font-bold text-xl">Jane Doe</h2>
                <p className="text-sm text-muted-foreground">Senior Architect</p>
                <div className="mt-3 inline-flex items-center rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  Pro Plan
                </div>
              </div>
              
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start font-medium bg-secondary/50 text-primary">
                  <User className="w-4 h-4 mr-2" /> Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start font-medium hover:bg-secondary/20" onClick={() => setLocation("/subscription")}>
                  <CreditCard className="w-4 h-4 mr-2" /> Subscription
                </Button>
                <Button variant="ghost" className="w-full justify-start font-medium hover:bg-secondary/20" onClick={() => setLocation("/settings")}>
                  <SettingsIcon className="w-4 h-4 mr-2" /> Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Jane" className="bg-secondary/20" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="bg-secondary/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="jane.doe@archstudio.com" className="bg-secondary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Organization</Label>
                    <Input id="company" defaultValue="ArchStudio Design Group" className="bg-secondary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-secondary/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" 
                      defaultValue="Passionate about sustainable architecture and biophilic design. Always looking for new ways to integrate nature into urban environments." 
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}