import { useState, useRef, useCallback } from 'react';
import { Upload, Scan, CheckCircle2, AlertCircle, X, Camera, Image as ImageIcon, Box, Layers, Eye, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import api, { ScanResult } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'wouter';

interface MaterialScannerProps {
  onScanComplete?: (result: ScanResult) => void;
  showGuestPrompt?: boolean;
}

export function MaterialScanner({ onScanComplete, showGuestPrompt = true }: MaterialScannerProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'uploading' | 'scanning' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [guestScansRemaining, setGuestScansRemaining] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'wireframe' | '3d'>('preview');
  const [modelStatus, setModelStatus] = useState<{ available: boolean; message?: string } | null>(null);

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
      handleFileSelect(file);
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
    setScanState('idle');
    setErrorMessage(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const checkModelStatus = async () => {
    try {
      const status = await api.getModelStatus();
      setModelStatus(status);
      return status;
    } catch (error) {
      return { available: false, message: 'Unable to check model status' };
    }
  };

  const startScan = async () => {
    if (!selectedFile) {
      toast({
        title: 'No Image Selected',
        description: 'Please select or drop an image to scan.',
        variant: 'destructive'
      });
      return;
    }

    setScanState('uploading');
    setProgress(0);
    setErrorMessage(null);

    const status = await checkModelStatus();
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      setScanState('scanning');
      
      const formData = new FormData();
      formData.append('image', selectedFile);

      const result = await api.scanMaterial(formData);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setScanResult(result);
      setScanState('complete');
      
      if (result.isGuest && result.scansRemaining !== null) {
        setGuestScansRemaining(result.scansRemaining);
      }

      onScanComplete?.(result);
      
      toast({
        title: 'Scan Complete',
        description: `Detected: ${result.material.name}`,
      });
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setScanState('error');
      setErrorMessage(error.message || 'Scan failed. Please try again.');
      
      toast({
        title: 'Scan Failed',
        description: error.message || 'Unable to analyze the material. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const resetScanner = () => {
    setScanState('idle');
    setProgress(0);
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setErrorMessage(null);
    setActiveView('preview');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderMaterialWireframe = () => {
    if (!scanResult) return null;

    return (
      <div className="relative aspect-video bg-secondary/50 rounded-lg overflow-hidden">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/20" />
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#grid)" />
          
          <g className="animate-pulse">
            <rect x="100" y="80" width="200" height="140" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="100" y1="80" x2="150" y2="50" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="300" y1="80" x2="350" y2="50" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="150" y1="50" x2="350" y2="50" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="350" y1="50" x2="350" y2="190" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="300" y1="220" x2="350" y2="190" stroke="currentColor" strokeWidth="2" className="text-primary" />
            
            <circle cx="200" cy="150" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" className="text-green-500" />
            <text x="200" y="155" textAnchor="middle" className="fill-green-500 text-xs font-mono">
              {scanResult.material.name}
            </text>
          </g>
          
          <g className="text-xs font-mono">
            <text x="10" y="290" className="fill-muted-foreground">
              Density: {scanResult.material.density} kg/m3
            </text>
            <text x="220" y="290" className="fill-muted-foreground">
              Confidence: {(scanResult.prediction.confidence * 100).toFixed(1)}%
            </text>
          </g>
        </svg>
        
        {scanResult.analysis.isSimulation && (
          <div className="absolute top-2 right-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="gap-1">
                  <Info className="w-3 h-3" /> Simulation Mode
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Using simulated analysis. AI model is being trained for more accurate results.</p>
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
      <div className="relative aspect-video bg-secondary/50 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <motion.div 
            className="w-32 h-32 mx-auto perspective-[500px]"
            animate={{ rotateY: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full bg-primary/20 border-2 border-primary rounded-lg transform-style-preserve-3d flex items-center justify-center">
              <Box className="w-12 h-12 text-primary" />
            </div>
          </motion.div>
          <div className="space-y-1">
            <p className="font-semibold">{scanResult.material.name}</p>
            <p className="text-sm text-muted-foreground">3D Volumetric View</p>
          </div>
          <div className="flex gap-2 justify-center text-xs text-muted-foreground">
            <span>Density: {scanResult.material.density} kg/m3</span>
            <span>|</span>
            <span>Carbon: {scanResult.material.embodiedCarbon} kgCO2e/kg</span>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            <RotateCcw className="w-3 h-3 mr-1" /> Reset View
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-secondary/30 backdrop-blur-sm min-h-[400px] flex flex-col">
      <AnimatePresence mode="wait">
        {(scanState === 'idle' || scanState === 'error') && !selectedFile && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex-1 flex flex-col items-center justify-center p-8 transition-colors ${isDragging ? 'bg-primary/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              data-testid="input-scan-file"
            />
            
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${isDragging ? 'bg-primary scale-110' : 'bg-white shadow-xl'}`}>
              <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-primary'}`} />
            </div>
            
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-2xl font-display font-bold">Scan Construction Material</h3>
              <p className="text-muted-foreground max-w-md">
                Upload an image of any building material to analyze its environmental impact and discover sustainable alternatives.
              </p>
            </div>

            {!isAuthenticated && showGuestPrompt && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-center max-w-md">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Try it free!</span> Guest users get 3 free scans. 
                  <Link href="/auth" className="text-primary ml-1 underline">Sign up</Link> to unlock unlimited scanning.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="lg" onClick={() => fileInputRef.current?.click()} className="shadow-lg" data-testid="button-upload-image">
                <ImageIcon className="mr-2 w-4 h-4" /> Upload Image
              </Button>
              <Button size="lg" variant="outline" onClick={() => fileInputRef.current?.click()} data-testid="button-open-camera">
                <Camera className="mr-2 w-4 h-4" /> Use Camera
              </Button>
            </div>

            {scanState === 'error' && errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-destructive/10 rounded-lg flex items-center gap-3 max-w-md"
              >
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {(scanState === 'idle' || scanState === 'error') && selectedFile && previewUrl && (
          <motion.div 
            key="preview-ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Image Selected</h3>
              <Button size="icon" variant="ghost" onClick={resetScanner} data-testid="button-clear-image">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden mb-6">
              <img src={previewUrl} alt="Material preview" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button size="lg" onClick={startScan} className="shadow-lg" data-testid="button-start-scan">
                <Scan className="mr-2 w-4 h-4" /> Analyze Material
              </Button>
              <Button size="lg" variant="outline" onClick={() => fileInputRef.current?.click()} data-testid="button-change-image">
                <ImageIcon className="mr-2 w-4 h-4" /> Change Image
              </Button>
            </div>

            {scanState === 'error' && errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-destructive/10 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {(scanState === 'uploading' || scanState === 'scanning') && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <div className="relative w-32 h-32 mb-8">
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
                <Scan className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
            
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-xl font-bold font-display animate-pulse">
                {scanState === 'uploading' ? 'Uploading Image...' : 'Analyzing Material Structure...'}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {scanState === 'uploading' ? 'Preparing for analysis' : 'Identifying composition and properties'}
              </p>
            </div>

            <div className="w-full max-w-md space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>{scanState === 'uploading' ? 'UPLOADING' : 'ANALYZING'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {scanState === 'complete' && scanResult && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg" data-testid="text-scan-result-title">{scanResult.material.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {(scanResult.prediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={resetScanner} data-testid="button-new-scan">
                <Scan className="w-4 h-4 mr-2" /> New Scan
              </Button>
            </div>

            {/* Compact Detected Properties (matches landing) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg p-4 shadow-sm border border-border mb-4"
            >
              <h4 className="font-semibold mb-3">Detected Properties</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between text-muted-foreground">
                  <span>Material Type</span>
                  <span className="font-medium">{scanResult.material.name}</span>
                </li>
                <li className="flex justify-between text-muted-foreground">
                  <span>Density</span>
                  <span className="font-medium">{scanResult.material.density} kg/m³</span>
                </li>
                <li className="flex justify-between text-muted-foreground">
                  <span>Thermal Conductivity</span>
                  <span className="font-medium">{scanResult.material.thermalConductivity ?? '—'}</span>
                </li>
                <li className="flex justify-between text-muted-foreground">
                  <span>Embodied Carbon</span>
                  <span className={`font-medium ${scanResult.material.embodiedCarbon > 200 ? 'text-destructive' : scanResult.material.embodiedCarbon > 100 ? 'text-amber-600' : 'text-green-600'}`}>
                    {scanResult.material.embodiedCarbon} kgCO2e/kg
                  </span>
                </li>
              </ul>
            </motion.div>

            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto mb-4">
                <TabsTrigger value="preview" className="gap-2" data-testid="tab-preview">
                  <Eye className="w-4 h-4" /> Preview
                </TabsTrigger>
                <TabsTrigger value="wireframe" className="gap-2" data-testid="tab-wireframe">
                  <Layers className="w-4 h-4" /> Wireframe
                </TabsTrigger>
                <TabsTrigger value="3d" className="gap-2" data-testid="tab-3d">
                  <Box className="w-4 h-4" /> 3D View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="flex-1">
                <div className="aspect-video bg-secondary rounded-lg overflow-hidden mb-4">
                  {previewUrl && <img src={previewUrl} alt="Scanned material" className="w-full h-full object-cover" />}
                </div>
                {/* Model name / source */}
                {scanResult && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div>Model: <span className="font-medium text-foreground">{scanResult.analysis?.modelName || 'ML Model'}</span></div>
                    {scanResult.analysis?.isSimulation && (
                      <div className="text-xs bg-secondary/20 px-2 py-1 rounded">Simulation</div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wireframe" className="flex-1">
                {renderMaterialWireframe()}
              </TabsContent>

              <TabsContent value="3d" className="flex-1">
                {render3DView()}
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-orange-500" data-testid="text-embodied-carbon">
                  {scanResult.material.embodiedCarbon}
                </p>
                <p className="text-xs text-muted-foreground">kgCO2e/kg</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-500" data-testid="text-embodied-energy">
                  {scanResult.material.embodiedEnergy}
                </p>
                <p className="text-xs text-muted-foreground">MJ/kg</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold" data-testid="text-density">
                  {scanResult.material.density}
                </p>
                <p className="text-xs text-muted-foreground">kg/m3</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <Badge variant="outline" className="font-medium" data-testid="text-recyclability">
                  {scanResult.material.recyclability || 'Recyclable'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Recyclability</p>
              </div>
            </div>

            {scanResult.material.alternatives && scanResult.material.alternatives.length > 0 && (
              <div className="mt-4 p-4 bg-green-500/10 rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Sustainable Alternatives</h4>
                <div className="flex gap-2 flex-wrap">
                  {scanResult.material.alternatives.slice(0, 3).map((alt, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1" data-testid={`badge-alternative-${idx}`}>
                      {alt.name} ({alt.embodiedCarbon} kgCO2e)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!isAuthenticated && guestScansRemaining !== null && guestScansRemaining <= 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-primary/10 rounded-lg text-center"
              >
                <p className="font-semibold mb-2">You've used all your free scans!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create an account to continue scanning materials and access your scan history.
                </p>
                <Link href="/auth">
                  <Button data-testid="button-signup-prompt">Sign Up for Free</Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] industrial-grid" />
    </Card>
  );
}
