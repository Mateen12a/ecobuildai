import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Scan, Clock, Trash2, Eye, Loader2, Search, Box, Layers, Calendar, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

interface ScanItem {
  id: string;
  imagePath: string;
  prediction: {
    class: string;
    className: string;
    confidence: number;
  };
  allPredictions?: { class: string; className: string; confidence: number }[];
  material: {
    name: string;
    embodiedCarbon: number;
    embodiedEnergy: number;
    density: number;
    recyclability?: string;
    alternatives?: { key: string; name: string; embodiedCarbon: number; embodiedEnergy: number }[];
  };
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  modelName?: string;
  createdAt: string;
}

export default function ScanHistory() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanItem | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'wireframe'>('preview');

  const { data: scans, isLoading, error } = useQuery<ScanItem[]>({
    queryKey: ['/api/scans'],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteScan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scans'] });
      toast({
        title: 'Scan Deleted',
        description: 'The scan has been removed from your history.',
      });
      setSelectedScan(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredScans = scans?.filter(scan => {
    const materialName = scan.material?.name || scan.prediction?.className || '';
    const materialClass = scan.prediction?.class || '';
    return materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           materialClass.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-500';
    if (confidence >= 0.7) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getMaterialName = (scan: ScanItem) => {
    return scan.material?.name || scan.prediction?.className || 'Unknown Material';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold">Sign in to view history</h2>
            <p className="text-muted-foreground">
              Create an account to save and access your scan history across devices.
            </p>
            <Link href="/auth">
              <Button className="mt-4" data-testid="button-signin">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
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
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all text-muted-foreground" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-display font-bold">Scan History</h1>
            <p className="text-muted-foreground">View and manage your material analysis history.</p>
          </div>
          <Link href="/">
            <Button data-testid="button-new-scan">
              <Scan className="w-4 h-4 mr-2" /> New Scan
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-scans"
            />
          </div>
          <Button variant="outline" size="icon" data-testid="button-filter">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">Failed to load scan history. Please try again.</p>
              <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/scans'] })}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredScans.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <Scan className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">
                {searchQuery ? 'No matching scans found' : 'No scans yet'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search query.'
                  : 'Start scanning construction materials to build your analysis history.'}
              </p>
              {!searchQuery && (
                <Link href="/">
                  <Button className="mt-2" data-testid="button-start-scanning">Start Scanning</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredScans.map((scan, index) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="overflow-hidden hover-elevate cursor-pointer transition-all"
                    onClick={() => setSelectedScan(scan)}
                    data-testid={`card-scan-${scan.id}`}
                  >
                    <div className="aspect-video bg-secondary relative">
                      {scan.imagePath ? (
                        <img 
                          src={scan.imagePath} 
                          alt={getMaterialName(scan)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold truncate" data-testid={`text-material-name-${scan.id}`}>
                            {getMaterialName(scan)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(scan.createdAt)}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={getConfidenceColor(scan.confidence)}>
                          {(scan.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="bg-secondary/50 px-2 py-1 rounded">
                          {scan.material?.embodiedCarbon || 0} kgCO2e
                        </span>
                        <span className="bg-secondary/50 px-2 py-1 rounded">
                          {scan.material?.density || 0} kg/m3
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredScans.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {filteredScans.length} of {scans?.length || 0} scans
          </div>
        )}
      </motion.div>

      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedScan && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Scan className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span data-testid="text-detail-material-name">{getMaterialName(selectedScan)}</span>
                    <p className="text-sm font-normal text-muted-foreground">{formatDate(selectedScan.createdAt)}</p>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Detailed analysis results for this material scan.
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="mt-4">
                <TabsList className="grid grid-cols-2 w-full max-w-xs mx-auto">
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="w-4 h-4" /> Image
                  </TabsTrigger>
                  <TabsTrigger value="wireframe" className="gap-2">
                    <Layers className="w-4 h-4" /> Wireframe
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                    {selectedScan.imagePath ? (
                      <img 
                        src={selectedScan.imagePath} 
                        alt={getMaterialName(selectedScan)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Box className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="wireframe" className="mt-4">
                  <div className="aspect-video bg-secondary/50 rounded-lg overflow-hidden">
                    <svg viewBox="0 0 400 300" className="w-full h-full">
                      <defs>
                        <pattern id="detail-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/20" />
                        </pattern>
                      </defs>
                      <rect width="400" height="300" fill="url(#detail-grid)" />
                      <g>
                        <rect x="100" y="80" width="200" height="140" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
                        <line x1="100" y1="80" x2="150" y2="50" stroke="currentColor" strokeWidth="2" className="text-primary" />
                        <line x1="300" y1="80" x2="350" y2="50" stroke="currentColor" strokeWidth="2" className="text-primary" />
                        <line x1="150" y1="50" x2="350" y2="50" stroke="currentColor" strokeWidth="2" className="text-primary" />
                        <line x1="350" y1="50" x2="350" y2="190" stroke="currentColor" strokeWidth="2" className="text-primary" />
                        <line x1="300" y1="220" x2="350" y2="190" stroke="currentColor" strokeWidth="2" className="text-primary" />
                        <circle cx="200" cy="150" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" className="text-green-500" />
                        <text x="200" y="155" textAnchor="middle" className="fill-green-500 text-xs font-mono">
                          {getMaterialName(selectedScan)}
                        </text>
                      </g>
                    </svg>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-orange-500">
                    {selectedScan.material?.embodiedCarbon || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">kgCO2e/kg</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-blue-500">
                    {selectedScan.material?.embodiedEnergy || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">MJ/kg</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">
                    {selectedScan.material?.density || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">kg/m3</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <Badge variant="outline" className={getConfidenceColor(selectedScan.confidence)}>
                    {(selectedScan.confidence * 100).toFixed(1)}%
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Confidence</p>
                </div>
              </div>

              {selectedScan.material?.alternatives && selectedScan.material.alternatives.length > 0 && (
                <div className="mt-4 p-4 bg-green-500/10 rounded-lg">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Sustainable Alternatives</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedScan.material.alternatives.map((alt, idx) => (
                      <Badge key={idx} variant="secondary">
                        {alt.name} ({alt.embodiedCarbon} kgCO2e)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6 justify-end">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteMutation.mutate(selectedScan.id)}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-scan"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedScan(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
