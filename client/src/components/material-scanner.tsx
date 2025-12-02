import { useState, useEffect } from 'react';
import { Upload, Scan, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface MaterialScannerProps {
  onScanComplete: () => void;
}

export function MaterialScanner({ onScanComplete }: MaterialScannerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    startScan();
  };

  const startScan = () => {
    setScanState('scanning');
    setProgress(0);
  };

  useEffect(() => {
    if (scanState === 'scanning') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setScanState('complete');
              onScanComplete();
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [scanState, onScanComplete]);

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-secondary/30 backdrop-blur-sm min-h-[400px] flex flex-col items-center justify-center p-8 transition-all duration-300 hover:border-primary/50 group">
      <AnimatePresence mode="wait">
        {scanState === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6 max-w-md"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-foreground">Scan Material</h3>
              <p className="text-muted-foreground">
                Drag and drop a material image here, or click to open camera.
              </p>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" onClick={startScan} className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                <Scan className="mr-2 w-4 h-4" /> Start Analysis
              </Button>
            </div>
          </motion.div>
        )}

        {scanState === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md text-center space-y-8"
          >
            <div className="relative w-32 h-32 mx-auto">
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
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-foreground animate-pulse">Analyzing Surface Structure...</h3>
              <p className="text-sm text-muted-foreground font-mono">Identifying composition density...</p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>SCANNING</span>
                <span>{progress}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {scanState === 'complete' && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold font-display text-foreground">Scan Complete</h3>
            <p className="text-muted-foreground mb-6">Concrete Aggregate (Type C25/30) Detected</p>
            <Button variant="outline" onClick={() => {
              setScanState('idle');
              setProgress(0);
            }}>
              Scan New Material
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Grid Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] industrial-grid" />
    </Card>
  );
}