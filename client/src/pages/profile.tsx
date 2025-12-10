import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Camera, Save, Loader2, User, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user, updateUser, uploadAvatar } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        company: user.company || '',
        jobTitle: user.jobTitle || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        jobTitle: formData.jobTitle,
        bio: formData.bio
      });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been changed.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getPlanBadgeVariant = (): "default" | "secondary" | "outline" => {
    switch (user?.subscriptionPlan) {
      case 'pro': return 'default';
      case 'enterprise': return 'secondary';
      default: return 'outline';
    }
  };

  const getPlanLabel = () => {
    switch (user?.subscriptionPlan) {
      case 'pro': return 'Pro Plan';
      case 'enterprise': return 'Enterprise';
      default: return 'Free Plan';
    }
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
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 pt-8"
      >
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all text-muted-foreground" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-display font-bold">Account Settings</h1>
            <p className="text-muted-foreground">Manage your profile and preferences.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-profile">
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
                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="text-xl font-bold">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    data-testid="input-avatar-upload"
                  />
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    data-testid="button-change-avatar"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <h2 className="font-display font-bold text-xl" data-testid="text-user-name">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-muted-foreground" data-testid="text-user-title">
                  {user.jobTitle || 'No title set'}
                </p>
                <Badge variant={getPlanBadgeVariant()} className="mt-3" data-testid="badge-subscription-plan">
                  {getPlanLabel()}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start font-medium bg-secondary/50 text-primary"
                  data-testid="button-nav-profile"
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start font-medium" 
                  onClick={() => setLocation("/subscription")}
                  data-testid="button-nav-subscription"
                >
                  <CreditCard className="w-4 h-4 mr-2" /> Subscription
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start font-medium" 
                  onClick={() => setLocation("/settings")}
                  data-testid="button-nav-settings"
                >
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
                      <Input 
                        id="firstName" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="bg-secondary/20"
                        data-testid="input-first-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="bg-secondary/20"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email"
                      value={formData.email}
                      disabled
                      className="bg-secondary/20 opacity-60"
                      data-testid="input-email"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company / Organization</Label>
                      <Input 
                        id="company" 
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Enter your company name"
                        className="bg-secondary/20"
                        data-testid="input-company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input 
                        id="jobTitle" 
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        placeholder="Enter your job title"
                        className="bg-secondary/20"
                        data-testid="input-job-title"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us a bit about yourself..."
                      className="min-h-[100px] bg-secondary/20 resize-none"
                      data-testid="input-bio"
                    />
                    <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Account Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary" data-testid="stat-total-scans">
                        {user.totalScans}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Scans</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600" data-testid="stat-carbon-saved">
                        {user.carbonSaved.toFixed(1)}kg
                      </p>
                      <p className="text-sm text-muted-foreground">Carbon Saved</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <p className="text-2xl font-bold capitalize" data-testid="stat-subscription-status">
                        {user.subscriptionStatus}
                      </p>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <p className="text-2xl font-bold capitalize" data-testid="stat-plan">
                        {user.subscriptionPlan}
                      </p>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                    </div>
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
