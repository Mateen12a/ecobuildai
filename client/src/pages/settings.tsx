import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Bell, Lock, Eye, Globe, Shield, Smartphone, Mail, Loader2, Key, Info, ExternalLink, Heart } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Logo, LogoText } from "@/components/logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Settings() {
  const { user, updatePreferences, updateAppearance, updatePrivacy, updatePassword } = useAuth();
  const { toast } = useToast();
  const [savingField, setSavingField] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePreferenceToggle = async (field: keyof typeof user.preferences, value: boolean) => {
    if (!user) return;
    setSavingField(field);
    try {
      await updatePreferences({ [field]: value });
      toast({
        description: `${formatFieldName(field)} updated.`,
        duration: 1500,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSavingField(null);
    }
  };

  const handleAppearanceToggle = async (field: keyof typeof user.appearance, value: boolean) => {
    if (!user) return;
    setSavingField(field);
    try {
      await updateAppearance({ [field]: value });
      toast({
        description: `${formatFieldName(field)} updated.`,
        duration: 1500,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSavingField(null);
    }
  };

  const handlePrivacyToggle = async (field: keyof typeof user.privacy, value: boolean) => {
    if (!user) return;
    setSavingField(field);
    try {
      await updatePrivacy({ [field]: value });
      toast({
        description: `${formatFieldName(field)} updated.`,
        duration: 1500,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSavingField(null);
    }
  };

  const handleMeasurementChange = async (system: 'metric' | 'imperial') => {
    if (!user) return;
    setSavingField('measurementSystem');
    try {
      await updatePreferences({ measurementSystem: system });
      toast({
        description: `Measurement system changed to ${system}.`,
        duration: 1500,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSavingField(null);
    }
  };

  const handleCurrencyChange = async (currency: 'USD' | 'EUR' | 'GBP') => {
    if (!user) return;
    setSavingField('currency');
    try {
      await updatePreferences({ currency });
      toast({
        description: `Currency changed to ${currency}.`,
        duration: 1500,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSavingField(null);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.new.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters.",
        variant: "destructive"
      });
      return;
    }

    setChangingPassword(true);
    try {
      await updatePassword(passwordData.current, passwordData.new);
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setShowPasswordDialog(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all text-muted-foreground" data-testid="button-back-profile">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
              </Button>
            </Link>
            <h1 className="text-3xl font-display font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your application preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Bell className="w-5 h-5 text-primary" /> Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Updates about your projects.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={user.preferences?.emailAlerts ?? true}
                    onCheckedChange={(checked) => handlePreferenceToggle('emailAlerts', checked)}
                    disabled={savingField === 'emailAlerts'}
                    data-testid="switch-email-alerts"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">News about new features.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={user.preferences?.marketingEmails ?? false}
                    onCheckedChange={(checked) => handlePreferenceToggle('marketingEmails', checked)}
                    disabled={savingField === 'marketingEmails'}
                    data-testid="switch-marketing-emails"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Alerts on your device.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={user.preferences?.pushNotifications ?? true}
                    onCheckedChange={(checked) => handlePreferenceToggle('pushNotifications', checked)}
                    disabled={savingField === 'pushNotifications'}
                    data-testid="switch-push-notifications"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Eye className="w-5 h-5 text-primary" /> Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle dark theme.</p>
                  </div>
                  <Switch 
                    checked={user.appearance?.darkMode ?? false}
                    onCheckedChange={(checked) => handleAppearanceToggle('darkMode', checked)}
                    disabled={savingField === 'darkMode'}
                    data-testid="switch-dark-mode"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Denser interface layout.</p>
                  </div>
                  <Switch 
                    checked={user.appearance?.compactView ?? false}
                    onCheckedChange={(checked) => handleAppearanceToggle('compactView', checked)}
                    disabled={savingField === 'compactView'}
                    data-testid="switch-compact-view"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                   <div className="space-y-0.5">
                    <Label className="text-base">Reduce Motion</Label>
                    <p className="text-sm text-muted-foreground">Minimize animations.</p>
                  </div>
                  <Switch 
                    checked={user.appearance?.reduceMotion ?? false}
                    onCheckedChange={(checked) => handleAppearanceToggle('reduceMotion', checked)}
                    disabled={savingField === 'reduceMotion'}
                    data-testid="switch-reduce-motion"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Lock className="w-5 h-5 text-primary" /> Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your profile.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={user.privacy?.publicProfile ?? true}
                    onCheckedChange={(checked) => handlePrivacyToggle('publicProfile', checked)}
                    disabled={savingField === 'publicProfile'}
                    data-testid="switch-public-profile"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <Eye className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Show Activity</Label>
                      <p className="text-sm text-muted-foreground">Display your scan activity.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={user.privacy?.showActivity ?? true}
                    onCheckedChange={(checked) => handlePrivacyToggle('showActivity', checked)}
                    disabled={savingField === 'showActivity'}
                    data-testid="switch-show-activity"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <Key className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label className="text-base">Change Password</Label>
                      <p className="text-sm text-muted-foreground">Update your password.</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowPasswordDialog(true)}
                    data-testid="button-change-password"
                  >
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-none shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Globe className="w-5 h-5 text-primary" /> Regional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Measurement System</Label>
                    <p className="text-sm text-muted-foreground">Metric vs Imperial.</p>
                  </div>
                  <div className="flex items-center gap-1 border rounded-md p-1">
                    <Button 
                      variant={user.preferences?.measurementSystem === 'metric' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className="h-7 px-3"
                      onClick={() => handleMeasurementChange('metric')}
                      disabled={savingField === 'measurementSystem'}
                      data-testid="button-metric"
                    >
                      Metric
                    </Button>
                    <Button 
                      variant={user.preferences?.measurementSystem === 'imperial' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className="h-7 px-3"
                      onClick={() => handleMeasurementChange('imperial')}
                      disabled={savingField === 'measurementSystem'}
                      data-testid="button-imperial"
                    >
                      Imperial
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Currency</Label>
                    <p className="text-sm text-muted-foreground">Billing currency.</p>
                  </div>
                  <div className="flex items-center gap-1 border rounded-md p-1">
                    <Button 
                      variant={user.preferences?.currency === 'USD' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className="h-7 px-3"
                      onClick={() => handleCurrencyChange('USD')}
                      disabled={savingField === 'currency'}
                      data-testid="button-usd"
                    >
                      USD
                    </Button>
                    <Button 
                      variant={user.preferences?.currency === 'EUR' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className="h-7 px-3"
                      onClick={() => handleCurrencyChange('EUR')}
                      disabled={savingField === 'currency'}
                      data-testid="button-eur"
                    >
                      EUR
                    </Button>
                    <Button 
                      variant={user.preferences?.currency === 'GBP' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className="h-7 px-3"
                      onClick={() => handleCurrencyChange('GBP')}
                      disabled={savingField === 'currency'}
                      data-testid="button-gbp"
                    >
                      GBP
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Info className="w-5 h-5 text-primary" /> About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Logo size="lg" linkTo={undefined} />
                  <div>
                    <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                    <p className="text-sm text-muted-foreground">AI-powered material scanner for sustainable construction</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <Link href="/privacy"><Button variant="link" className="p-0 h-auto gap-1" data-testid="link-privacy"><ExternalLink className="w-3 h-3" /> Privacy Policy</Button></Link>
                  <Link href="/terms"><Button variant="link" className="p-0 h-auto gap-1" data-testid="link-terms"><ExternalLink className="w-3 h-3" /> Terms of Service</Button></Link>
                  <Link href="/contact"><Button variant="link" className="p-0 h-auto gap-1" data-testid="link-contact"><ExternalLink className="w-3 h-3" /> Contact Us</Button></Link>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">Made with <Heart className="w-3 h-3 text-red-500" /> for a sustainable future</p>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </motion.div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={changingPassword} data-testid="button-confirm-password-change">
              {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {changingPassword ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
