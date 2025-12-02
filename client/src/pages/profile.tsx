import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, User, CreditCard, Bell, Shield } from "lucide-react";
import { Link } from "wouter";
import avatarImage from "@assets/generated_images/professional_architect_portrait.png";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-8">
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
          <Button>
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="h-fit border-none shadow-md lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 border-2 border-primary/20">
                    <AvatarImage src={avatarImage} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button size="sm" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 shadow-md">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="font-display font-bold text-xl">Jane Doe</h2>
                <p className="text-sm text-muted-foreground">Senior Architect</p>
                <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full mt-2 font-medium">Pro Plan</p>
              </div>
              
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start font-medium bg-secondary/50">
                  <User className="w-4 h-4 mr-2" /> Profile
                </Button>
                <Link href="/subscription">
                  <Button variant="ghost" className="w-full justify-start font-medium">
                    <CreditCard className="w-4 h-4 mr-2" /> Subscription
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" className="w-full justify-start font-medium">
                    <SettingsIcon className="w-4 h-4 mr-2" /> Preferences
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="Jane" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue="jane.doe@archstudio.com" />
                </div>
                <div className="space-y-2">
                  <Label>Company / Organization</Label>
                  <Input defaultValue="ArchStudio Design Group" />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue="Passionate about sustainable architecture and biophilic design." />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
        </svg>
    )
}