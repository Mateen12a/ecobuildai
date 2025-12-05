import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Building2, BarChart3, Menu, Scan, Leaf, LogOut, Settings, User, CreditCard, LayoutDashboard, FolderOpen, FileText, Search, Box, Layers, Cuboid, Upload, Loader2, AlertTriangle, Clock, Cpu, Info, Eye, X, Camera, Image as ImageIcon, RotateCcw, CheckCircle2, TrendingDown, ChevronRight, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import type { ScanResult } from "@/lib/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface MaterialWithImage {
  key: string;
  name: string;
  description: string;
  category: string;
  embodiedEnergy: number;
  embodiedCarbon: number;
  density: number;
  impactLevel: string;
  imageId: string;
  imageCount: number;
  hasImage: boolean;
}

export default function Home() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ totalScans: 0, carbonSaved: 0, activeProjects: 0 });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelStatus, setModelStatus] = useState<{ available: boolean; message?: string } | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'wireframe' | '3d'>('preview');
  const [materialsWithImages, setMaterialsWithImages] = useState<MaterialWithImage[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
    checkModelStatus();
    loadMaterialsWithImages();
  }, []);

  const checkModelStatus = async () => {
    try {
      const status = await api.getModelStatus();
      setModelStatus(status);
    } catch (error) {
      setModelStatus({ available: false, message: 'Unable to connect to ML service' });
    }
  };

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

  const loadMaterialsWithImages = async () => {
    try {
      setLoadingMaterials(true);
      const materials = await api.getMaterialsWithImages(10);
      setMaterialsWithImages(materials);
    } catch (error) {
      console.error("Failed to load materials with images:", error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file (JPG, PNG, WebP)',
        variant: 'destructive'
      });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const performScan = async () => {
    if (!selectedFile) {
      toast({
        title: 'No Image Selected',
        description: 'Please select or drop an image to scan.',
        variant: 'destructive'
      });
      return;
    }

    setScanning(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
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

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setActiveView('preview');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  const dashboardStats = [
    { label: "Total Scans", value: stats.totalScans.toString(), icon: Scan, color: "text-blue-500", bg: "bg-blue-500/10", link: "/history" },
    { label: "Carbon Saved", value: `${stats.carbonSaved.toFixed(1)}kg`, icon: Leaf, color: "text-green-500", bg: "bg-green-500/10", link: null },
    { label: "Active Projects", value: stats.activeProjects.toString(), icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10", link: "/projects" },
  ];

  const renderWireframe = () => {
    if (!scanResult) return null;

    return (
      <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/30" />
            </pattern>
            <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#grid)" />
          
          <g className="animate-pulse">
            <rect x="80" y="60" width="240" height="180" fill="none" stroke="url(#wireGradient)" strokeWidth="2" />
            <line x1="80" y1="60" x2="40" y2="30" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="320" y1="60" x2="360" y2="30" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="40" y1="30" x2="360" y2="30" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="360" y1="30" x2="360" y2="210" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="320" y1="240" x2="360" y2="210" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" />
            
            <circle cx="200" cy="150" r="50" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 3" />
            <circle cx="200" cy="150" r="35" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />
            
            <text x="200" y="145" textAnchor="middle" className="fill-white text-sm font-bold">
              {scanResult.material.name}
            </text>
            <text x="200" y="160" textAnchor="middle" className="fill-green-400 text-xs font-mono">
              {(scanResult.prediction.confidence * 100).toFixed(1)}% match
            </text>
          </g>
          
          <g className="text-xs font-mono">
            <rect x="10" y="260" width="180" height="30" fill="rgba(0,0,0,0.5)" rx="4" />
            <text x="20" y="278" className="fill-gray-300">
              Density: {scanResult.material.density} kg/m³
            </text>
            <rect x="200" y="260" width="190" height="30" fill="rgba(0,0,0,0.5)" rx="4" />
            <text x="210" y="278" className="fill-gray-300">
              Carbon: {scanResult.material.embodiedCarbon} kgCO2/kg
            </text>
          </g>
          
          <g>
            <rect x="10" y="10" width="80" height="24" fill="rgba(34,197,94,0.2)" rx="4" stroke="#22c55e" strokeWidth="1" />
            <text x="50" y="26" textAnchor="middle" className="fill-green-400 text-xs font-bold">WIREFRAME</text>
          </g>
        </svg>
        
        {scanResult.analysis?.isSimulation && (
          <div className="absolute top-2 right-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="gap-1 bg-white/10 text-white">
                  <Info className="w-3 h-3" /> Simulation
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Using simulated analysis. AI model is being trained.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  const render3DView = () => {
    if (!scanResult) return null;

    return (
      <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
        
        <div className="text-center space-y-6 p-8 relative z-10">
          <motion.div 
            className="w-40 h-40 mx-auto relative"
            style={{ perspective: '800px' }}
          >
            <motion.div
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-green-600/40 border-2 border-primary/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Cuboid className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-green-600/20 border border-primary/40 rounded-xl" style={{ transform: 'translateZ(20px)' }} />
            </motion.div>
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{scanResult.material.name}</h3>
            <p className="text-sm text-gray-400">3D Volumetric Analysis</p>
          </div>
          
          <div className="flex gap-4 justify-center text-sm">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-gray-400">Density</span>
              <p className="font-bold text-white">{scanResult.material.density} kg/m³</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-gray-400">Carbon</span>
              <p className="font-bold text-orange-400">{scanResult.material.embodiedCarbon} kgCO2/kg</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-gray-400">Energy</span>
              <p className="font-bold text-blue-400">{scanResult.material.embodiedEnergy} MJ/kg</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button size="sm" variant="outline" className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20">
            <RotateCcw className="w-3 h-3 mr-1" /> Auto Rotating
          </Button>
        </div>
      </div>
    );
  };

  const getCarbonChartData = () => {
    if (!scanResult) return [];
    
    const scanned = {
      name: scanResult.material.name,
      carbon: scanResult.material.embodiedCarbon,
      color: scanResult.material.embodiedCarbon > 0.5 ? '#ef4444' : '#eab308'
    };

    const alts = (scanResult.material.alternatives || []).map((a: any) => ({
      name: a.name,
      carbon: a.embodiedCarbon || 0,
      color: a.embodiedCarbon <= scanned.carbon * 0.5 ? '#16a34a' : '#22c55e'
    }));

    return [scanned, ...alts].slice(0, 5);
  };

  const calculatePotentialSavings = () => {
    if (!scanResult || !scanResult.material.alternatives?.length) return null;
    
    const currentCarbon = scanResult.material.embodiedCarbon;
    const lowestAlt = scanResult.material.alternatives.reduce((min, alt) => 
      alt.embodiedCarbon < min.embodiedCarbon ? alt : min
    );
    
    const savings = ((currentCarbon - lowestAlt.embodiedCarbon) / currentCarbon) * 100;
    return { savings: Math.round(savings), alternative: lowestAlt.name };
  };

  const getImpactLevel = () => {
    if (!scanResult) return null;
    const carbon = scanResult.material.embodiedCarbon;
    if (carbon > 1) return { level: 'High', color: 'bg-red-500', textColor: 'text-red-500' };
    if (carbon > 0.3) return { level: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    return { level: 'Low', color: 'bg-green-500', textColor: 'text-green-500' };
  };

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
            <Link href="/history" className="hover:text-primary transition-colors flex items-center gap-2">
              <Clock className="w-4 h-4" /> History
            </Link>
            <Link href="/ml-admin" className="hover:text-primary transition-colors flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Models
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
                  <Link href="/history"><Button variant="ghost" className="w-full justify-start text-lg font-medium"><Clock className="mr-3 w-5 h-5" /> Scan History</Button></Link>
                  <Link href="/ml-admin"><Button variant="ghost" className="w-full justify-start text-lg font-medium"><Cpu className="mr-3 w-5 h-5" /> Models</Button></Link>
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
              {stat.link ? (
                <Link href={stat.link}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer hover-elevate">
                    <CardContent className="p-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold">{stat.value}</h3>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-2 border-dashed border-muted-foreground/20 bg-secondary/30 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Scan className="w-5 h-5 text-primary" />
                    Material Scanner
                  </div>
                  {modelStatus && !modelStatus.available && (
                    <Badge variant="secondary" className="text-xs gap-1 font-normal">
                      <Info className="w-3 h-3" /> Simulation Mode
                    </Badge>
                  )}
                </CardTitle>
                {modelStatus && !modelStatus.available && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {modelStatus.message || 'AI model is being trained. Results are simulated.'}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {scanning ? (
                    <motion.div 
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="min-h-[300px] flex flex-col items-center justify-center p-8"
                    >
                      <div className="relative w-24 h-24 mb-6">
                        <motion.div 
                          className="absolute inset-0 border-4 border-primary/30 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div 
                          className="absolute inset-2 border-4 border-primary border-t-transparent rounded-full"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Scan className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                      </div>
                      <p className="font-medium text-lg mb-2">Analyzing Material...</p>
                      <p className="text-sm text-muted-foreground mb-4">Identifying composition and properties</p>
                      <div className="w-full max-w-xs">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground mt-2">{Math.round(progress)}%</p>
                      </div>
                    </motion.div>
                  ) : !selectedFile ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`min-h-[300px] flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${isDragging ? 'bg-primary scale-110' : 'bg-white shadow-xl'}`}>
                        <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-primary'}`} />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-lg mb-1">Drop image here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </div>
                    </motion.div>
                  ) : !scanResult ? (
                    <motion.div
                      key="preview-ready"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Image Selected</h4>
                        <Button size="icon" variant="ghost" onClick={resetScanner}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                        {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex gap-3">
                        <Button className="flex-1" onClick={performScan}>
                          <Scan className="w-4 h-4 mr-2" /> Analyze Material
                        </Button>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <ImageIcon className="w-4 h-4 mr-2" /> Change Image
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <h4 className="font-bold">{scanResult.material.name}</h4>
                            <p className="text-xs text-muted-foreground">{(scanResult.prediction.confidence * 100).toFixed(1)}% confidence</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={resetScanner}>
                          <Scan className="w-3 h-3 mr-1" /> New Scan
                        </Button>
                      </div>

                      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="preview" className="gap-1 text-xs">
                            <Eye className="w-3 h-3" /> Preview
                          </TabsTrigger>
                          <TabsTrigger value="wireframe" className="gap-1 text-xs">
                            <Layers className="w-3 h-3" /> Wireframe
                          </TabsTrigger>
                          <TabsTrigger value="3d" className="gap-1 text-xs">
                            <Box className="w-3 h-3" /> 3D View
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="preview" className="mt-4">
                          <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                            {previewUrl && <img src={previewUrl} alt="Scanned" className="w-full h-full object-cover" />}
                          </div>
                        </TabsContent>

                        <TabsContent value="wireframe" className="mt-4">
                          {renderWireframe()}
                        </TabsContent>

                        <TabsContent value="3d" className="mt-4">
                          {render3DView()}
                        </TabsContent>
                      </Tabs>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-muted-foreground text-xs">Embodied Carbon</p>
                          <p className="font-bold text-orange-500">{scanResult.material.embodiedCarbon} kgCO2/kg</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-muted-foreground text-xs">Embodied Energy</p>
                          <p className="font-bold text-blue-500">{scanResult.material.embodiedEnergy} MJ/kg</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-muted-foreground text-xs">Density</p>
                          <p className="font-bold">{scanResult.material.density} kg/m³</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-muted-foreground text-xs">Impact Level</p>
                          <p className={`font-bold flex items-center gap-1 ${getImpactLevel()?.textColor}`}>
                            {getImpactLevel()?.level === 'High' ? <AlertTriangle className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
                            {getImpactLevel()?.level}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            {scanResult ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Carbon Comparison
                      </CardTitle>
                      <CardDescription>kgCO2 per kg of material</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getCarbonChartData()} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            tick={{ fill: '#4b5563', fontSize: 11 }} 
                            width={90}
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="carbon" radius={[0, 4, 4, 0]} barSize={24}>
                            {getCarbonChartData().map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    {getImpactLevel()?.level === 'High' && (
                      <Card className="bg-red-500 text-white border-none shadow-lg">
                        <CardContent className="pt-6 flex items-start justify-between">
                          <div>
                            <p className="text-white/80 font-medium mb-1">Impact Alert</p>
                            <h3 className="text-2xl font-bold font-display mb-2">High Carbon</h3>
                            <p className="text-sm text-white/90">
                              This material has significant environmental impact.
                            </p>
                          </div>
                          <div className="bg-white/20 p-3 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-white" />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {calculatePotentialSavings() && (
                      <Card className="bg-primary text-white border-none shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <CardContent className="pt-6 flex items-start justify-between relative z-10">
                          <div>
                            <p className="text-white/80 font-medium mb-1">Potential Savings</p>
                            <h3 className="text-2xl font-bold font-display mb-2">-{calculatePotentialSavings()?.savings}% CO2</h3>
                            <p className="text-sm text-white/90">
                              By switching to {calculatePotentialSavings()?.alternative}
                            </p>
                          </div>
                          <div className="bg-white/20 p-3 rounded-full">
                            <TrendingDown className="w-6 h-6 text-white" />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {scanResult.material.alternatives?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-green-500" />
                        Sustainable Alternatives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scanResult.material.alternatives.map((alt, i) => (
                          <div key={i} className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all">
                            <h4 className="font-bold">{alt.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Carbon: {alt.embodiedCarbon} kgCO2/kg
                            </p>
                            {alt.embodiedCarbon < scanResult.material.embodiedCarbon && (
                              <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                                {Math.round((1 - alt.embodiedCarbon / scanResult.material.embodiedCarbon) * 100)}% less carbon
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Prediction Confidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scanResult.allPredictions?.slice(0, 5).map((pred, i) => (
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
              </motion.div>
            ) : (
              <div className="bg-secondary/5 rounded-xl border-2 border-dashed border-border h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                  <Scan className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground max-w-md">
                  Use the scanner on the left to identify materials and generate real-time sustainability reports with detailed carbon analysis.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <Library className="w-6 h-6 text-primary" />
                Materials Library
              </h2>
              <p className="text-muted-foreground">Training materials from database with real images</p>
            </div>
            <Link href="/materials">
              <Button variant="outline" className="gap-2">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loadingMaterials ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : materialsWithImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {materialsWithImages.map((material, i) => (
                <motion.div
                  key={material.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                    <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                      {material.hasImage && material.imageId ? (
                        <img 
                          src={api.getMaterialImageUrl(material.imageId)} 
                          alt={material.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-white/20">{material.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-2 right-2 text-xs bg-white/20 backdrop-blur-sm text-white border-none">
                        {material.imageCount} images
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{material.name}</h4>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <span>{material.embodiedCarbon} kgCO2/kg</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0">{material.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-secondary/20 border-dashed">
              <CardContent className="py-12 text-center">
                <Library className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Training Materials Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Materials with images will appear here once you start training your ML model with real construction material data.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
