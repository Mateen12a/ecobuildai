import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Building2, BarChart3, Menu, Scan, Leaf, LogOut, Settings, User, CreditCard, LayoutDashboard, FolderOpen, FileText, Search, Box, Layers, Cuboid, Upload, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ScanResult {
  prediction: { class: string; className: string; confidence: number };
  material: {
    name: string;
    embodiedEnergy: number;
    embodiedCarbon: number;
    density: number;
    alternatives: { key: string; name: string; embodiedCarbon: number }[];
  };
  allPredictions: { class: string; className: string; confidence: number }[];
}

export default function Home() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ totalScans: 0, carbonSaved: 0, activeProjects: 0 });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats({
        totalScans: data.totalScans || 0,
        carbonSaved: user?.carbonSaved || 0,
        activeProjects: data.totalProjects || 0
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPreviewUrl(URL.createObjectURL(file));
    await performScan(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
      await performScan(file);
    }
  };

  const performScan = async (file: File) => {
    setScanning(true);
    setProgress(0);
    setScanResult(null);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const result = await api.scanMaterial(formData);
      setProgress(100);
      setScanResult(result);
      await loadStats();
      toast({ title: "Scan Complete", description: `Detected: ${result.prediction.className}` });
    } catch (error: any) {
      toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setScanning(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  const dashboardStats = [
    { label: "Total Scans", value: stats.totalScans.toString(), icon: Scan, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Carbon Saved", value: `${stats.carbonSaved.toFixed(1)}kg`, icon: Leaf, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Active Projects", value: stats.activeProjects.toString(), icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 border border-primary/20 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarImage src={user?.avatar} alt={user?.firstName} />
                  <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation("/profile")}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation("/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                  <Link href="/dashboard"><Button variant="ghost" className="w-full justify-start text-lg font-medium"><LayoutDashboard className="mr-3 w-5 h-5" /> Dashboard</Button></Link>
                  <Link href="/materials"><Button variant="ghost" className="w-full justify-start text-lg font-medium"><Search className="mr-3 w-5 h-5" /> Materials Library</Button></Link>
                  <Link href="/projects"><Button variant="ghost" className="w-full justify-start text-lg font-medium"><FolderOpen className="mr-3 w-5 h-5" /> Projects</Button></Link>
                  <Link href="/reports"><Button variant="ghost" className="w-full justify-start text-lg font-medium"><FileText className="mr-3 w-5 h-5" /> Reports</Button></Link>
                  <div className="border-t pt-4 mt-4">
                    <Button variant="ghost" className="w-full justify-start text-lg font-medium text-destructive hover:text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-3 w-5 h-5" /> Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName}. Here's your sustainability overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardStats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 border-dashed border-muted-foreground/20 bg-secondary/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-primary" />
                  Material Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="min-h-[300px] flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {scanning ? (
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                      <p className="text-muted-foreground">Analyzing material...</p>
                      <Progress value={progress} className="w-48" />
                    </div>
                  ) : previewUrl ? (
                    <div className="text-center space-y-4">
                      <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to scan another</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Drop image here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {scanResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Detected Material</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{scanResult.material.name}</span>
                      <Badge variant="secondary">{Math.round(scanResult.prediction.confidence * 100)}% confidence</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-muted-foreground">Embodied Carbon</p>
                        <p className="font-bold text-lg">{scanResult.material.embodiedCarbon} kgCO2/kg</p>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-muted-foreground">Embodied Energy</p>
                        <p className="font-bold text-lg">{scanResult.material.embodiedEnergy} MJ/kg</p>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-muted-foreground">Density</p>
                        <p className="font-bold text-lg">{scanResult.material.density} kg/m³</p>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-muted-foreground">Impact Level</p>
                        <p className="font-bold text-lg flex items-center gap-1">
                          {scanResult.material.embodiedCarbon > 1 ? (
                            <><AlertTriangle className="w-4 h-4 text-red-500" /> High</>
                          ) : scanResult.material.embodiedCarbon > 0.3 ? (
                            <><AlertTriangle className="w-4 h-4 text-yellow-500" /> Medium</>
                          ) : (
                            <><Leaf className="w-4 h-4 text-green-500" /> Low</>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-8">
            {scanResult ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Prediction Confidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scanResult.allPredictions.slice(0, 5).map((pred, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{pred.className}</span>
                          <span className="font-mono">{Math.round(pred.confidence * 100)}%</span>
                        </div>
                        <Progress value={pred.confidence * 100} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {scanResult.material.alternatives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-green-500" />
                        Sustainable Alternatives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scanResult.material.alternatives.map((alt, i) => (
                          <div key={i} className="p-4 border rounded-lg hover:border-primary transition-colors">
                            <h4 className="font-bold">{alt.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Carbon: {alt.embodiedCarbon} kgCO2/kg
                            </p>
                            {alt.embodiedCarbon < scanResult.material.embodiedCarbon && (
                              <Badge className="mt-2 bg-green-100 text-green-700">
                                {Math.round((1 - alt.embodiedCarbon / scanResult.material.embodiedCarbon) * 100)}% less carbon
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ) : (
              <div className="bg-secondary/5 rounded-xl border-2 border-dashed border-border h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                  <Scan className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground max-w-md">
                  Use the scanner on the left to identify materials and generate real-time sustainability reports.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
