import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Bell, Lock, Eye, Globe, Shield, Smartphone, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleToggle = (setting: string) => {
    toast({
      description: `${setting} updated.`,
      duration: 1500,
    });
  };

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
            <h1 className="text-3xl font-display font-bold">App Settings</h1>
            <p className="text-muted-foreground">Customize your application preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Notifications */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Bell className="w-5 h-5 text-primary" /> Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-start">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Updates about your projects.</p>
                    </div>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleToggle("Email Alerts")} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-start">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">News about new features.</p>
                    </div>
                  </div>
                  <Switch onCheckedChange={() => handleToggle("Marketing Emails")} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-start">
                    <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Alerts on your device.</p>
                    </div>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleToggle("Push Notifications")} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appearance */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Eye className="w-5 h-5 text-primary" /> Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle dark theme.</p>
                  </div>
                  <Switch onCheckedChange={() => handleToggle("Dark Mode")} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Denser interface layout.</p>
                  </div>
                  <Switch onCheckedChange={() => handleToggle("Compact View")} />
                </div>
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                    <Label className="text-base">Reduce Motion</Label>
                    <p className="text-sm text-muted-foreground">Minimize animations.</p>
                  </div>
                  <Switch onCheckedChange={() => handleToggle("Reduce Motion")} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Lock className="w-5 h-5 text-primary" /> Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-start">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your profile.</p>
                    </div>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => handleToggle("Public Profile")} />
                </div>
                 <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-start">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Two-Factor Auth</Label>
                      <p className="text-sm text-muted-foreground">Add extra security.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleToggle("2FA Setup")}>Enable</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Regional */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Globe className="w-5 h-5 text-primary" /> Regional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Measurement System</Label>
                    <p className="text-sm text-muted-foreground">Metric vs Imperial.</p>
                  </div>
                  <div className="flex items-center gap-2 border rounded-md p-1">
                    <Button variant="secondary" size="sm" className="h-7 px-3 shadow-sm">Metric</Button>
                    <Button variant="ghost" size="sm" className="h-7 px-3">Imperial</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Currency</Label>
                    <p className="text-sm text-muted-foreground">Billing currency.</p>
                  </div>
                   <div className="flex items-center gap-2 border rounded-md p-1">
                    <Button variant="secondary" size="sm" className="h-7 px-3 shadow-sm">USD</Button>
                    <Button variant="ghost" size="sm" className="h-7 px-3">EUR</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}