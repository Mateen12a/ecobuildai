import { useState } from "react";
import { MaterialScanner } from "@/components/material-scanner";
import { CarbonStats } from "@/components/carbon-stats";
import { AlternativesGrid } from "@/components/alternatives";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Building2, BarChart3, Menu, Scan, Leaf, LogOut, Settings, User, CreditCard, LayoutDashboard, FolderOpen, FileText, Search, Box, Layers, Cuboid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import avatarImage from "@assets/generated_images/professional_architect_portrait.png";
import wireframeImage from "@assets/generated_images/wireframe_schematic_of_concrete_block.png";
import render3dImage from "@assets/generated_images/3d_structural_analysis_of_concrete.png";

export default function Home() {
  const [hasScanned, setHasScanned] = useState(false);
  const [_, setLocation] = useLocation();

  // Dashboard Welcome Stats
  const stats = [
    { label: "Total Scans", value: "124", icon: Scan, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Carbon Saved", value: "4.2t", icon: Leaf, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Active Projects", value: "8", icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
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
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/dashboard" className="text-foreground font-semibold hover:text-primary transition-colors flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/materials" className="hover:text-primary transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" /> Materials Library
            </Link>
            <Link href="/projects" className="hover:text-primary transition-colors flex items-center gap-2">
              <FolderOpen className="w-4 h-4" /> Projects
            </Link>
            <Link href="/reports" className="hover:text-primary transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" /> Reports
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Quick search..." className="pl-9 h-9 bg-secondary/50 border-none" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 border border-primary/20 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarImage src={avatarImage} alt="Architect User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Jane Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">jane.doe@archstudio.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation("/profile")}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation("/subscription")}>
                  <CreditCard className="mr-2 h-4 w-4" /> Subscription
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation("/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={() => setLocation("/auth")}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="bg-primary text-white p-1.5 rounded-lg">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <span className="font-display font-bold text-xl">EcoBuild.AI</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                   <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start text-lg font-medium">
                      <LayoutDashboard className="mr-3 w-5 h-5" /> Dashboard
                    </Button>
                  </Link>
                  <Link href="/materials">
                    <Button variant="ghost" className="w-full justify-start text-lg font-medium">
                      <Search className="mr-3 w-5 h-5" /> Materials Library
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button variant="ghost" className="w-full justify-start text-lg font-medium">
                      <FolderOpen className="mr-3 w-5 h-5" /> Projects
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="ghost" className="w-full justify-start text-lg font-medium">
                      <FileText className="mr-3 w-5 h-5" /> Reports
                    </Button>
                  </Link>
                  <div className="border-t pt-4 mt-4">
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start text-lg font-medium">
                        <User className="mr-3 w-5 h-5" /> Profile
                      </Button>
                    </Link>
                    <Link href="/subscription">
                      <Button variant="ghost" className="w-full justify-start text-lg font-medium">
                        <CreditCard className="mr-3 w-5 h-5" /> Subscription
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="ghost" className="w-full justify-start text-lg font-medium">
                        <Settings className="mr-3 w-5 h-5" /> Settings
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button variant="ghost" className="w-full justify-start text-lg font-medium text-destructive hover:text-destructive">
                        <LogOut className="mr-3 w-5 h-5" /> Log out
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 pb-20">
        
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Jane. Here's your sustainability overview.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Scanner & Info */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
                  <h3 className="font-bold font-display">Material Scanner</h3>
                  <Badge variant="outline" className="bg-background">Ready</Badge>
                </div>
                <div className="p-4">
                  <MaterialScanner onScanComplete={() => setHasScanned(true)} />
                </div>
              </div>
            </motion.div>
            
            {hasScanned && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <h3 className="font-bold font-display text-lg mb-4">Detected Properties</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between py-2 border-b border-border/50 hover:bg-secondary/10 px-2 rounded transition-colors cursor-default group">
                    <span className="text-muted-foreground">Material Type</span>
                    <span className="font-medium group-hover:text-primary transition-colors">Concrete (C25/30)</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-border/50 hover:bg-secondary/10 px-2 rounded transition-colors cursor-default group">
                    <span className="text-muted-foreground">Density</span>
                    <span className="font-medium group-hover:text-primary transition-colors">2400 kg/m³</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-border/50 hover:bg-secondary/10 px-2 rounded transition-colors cursor-default group">
                    <span className="text-muted-foreground">Thermal Conductivity</span>
                    <span className="font-medium group-hover:text-primary transition-colors">1.7 W/mK</span>
                  </li>
                  <li className="flex justify-between pt-2 hover:shadow-md p-2 rounded transition-all">
                    <span className="text-muted-foreground">Embodied Carbon</span>
                    <span className="font-medium text-destructive flex items-center gap-1">High <AlertTriangleIcon className="w-4 h-4" /></span>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>

          {/* Right Column: Dashboard Content */}
          <div className="lg:col-span-8">
            {hasScanned ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-secondary/5 border-b border-border/50 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" /> Analysis Visualization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="wireframe" className="w-full">
                      <div className="p-4 bg-secondary/5 border-b border-border/50">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                          <TabsTrigger value="wireframe" className="flex items-center gap-2">
                            <Box className="w-4 h-4" /> Wireframe
                          </TabsTrigger>
                          <TabsTrigger value="3d" className="flex items-center gap-2">
                            <Cuboid className="w-4 h-4" /> 3D Structure
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                        <TabsContent value="wireframe" className="mt-0 w-full h-full">
                          <motion.img 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={wireframeImage} 
                            alt="Wireframe View" 
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />
                          <div className="absolute bottom-4 left-4 text-cyan-400 font-mono text-xs">
                            <p>GRID_SIZE: 10mm</p>
                            <p>VECTOR_COUNT: 1402</p>
                          </div>
                        </TabsContent>
                        <TabsContent value="3d" className="mt-0 w-full h-full">
                          <motion.img 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={render3dImage} 
                            alt="3D View" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-4 left-4 text-orange-400 font-mono text-xs">
                            <p>DENSITY_MAP: ACTIVE</p>
                            <p>THERMAL_LAYER: VISIBLE</p>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>

                <div className="hover:scale-[1.005] transition-transform duration-300">
                   <CarbonStats />
                </div>
                <AlternativesGrid />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-secondary/5 rounded-xl border-2 border-dashed border-border h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                  <Scan className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground max-w-md">
                  Use the scanner on the left to identify materials and generate real-time sustainability reports.
                </p>
              </motion.div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

function AlertTriangleIcon(props: any) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function Badge({ className, variant, ...props }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props} />
  )
}