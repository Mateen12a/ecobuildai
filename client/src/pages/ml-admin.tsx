import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ArrowLeft, Brain, RefreshCw, CheckCircle, Loader2, Database, Target, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface MLModel {
  _id: string;
  name: string;
  version: string;
  status: string;
  accuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  totalSamples: number;
  epochs: number;
  isActive: boolean;
  modelPath?: string;
  classes?: string[];
  architecture?: string;
  mlstudioModelId?: string;
  createdAt: string;
}

export default function MLAdmin() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: models, isLoading: modelsLoading, error: modelsError, refetch: refetchModels } = useQuery<MLModel[]>({
    queryKey: ['/api/models'],
    enabled: isAuthenticated,
  });

  const activateMutation = useMutation({
    mutationFn: async (modelId: string) => {
      return apiRequest('POST', `/api/models/${modelId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
      toast({
        title: 'Model Activated',
        description: 'The model is now active for predictions.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Activation Failed',
        description: error.message || 'Failed to activate model',
        variant: 'destructive',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-500 bg-green-500/10';
      case 'training': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-secondary';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'text-green-500';
    if (accuracy >= 0.7) return 'text-yellow-500';
    return 'text-orange-500';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold">Access Required</h2>
            <p className="text-muted-foreground">
              Sign in to view available ML models for material detection.
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
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all text-muted-foreground" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              ML Models
            </h1>
            <p className="text-muted-foreground">View and manage ML models for material detection.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => refetchModels()} data-testid="button-refresh">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold">{models?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Model</p>
                <p className="text-2xl font-bold">{models?.filter(m => m.isActive).length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Accuracy</p>
                <p className="text-2xl font-bold">
                  {models?.length ? `${(Math.max(...models.map(m => m.accuracy || 0)) * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>MLStudio Integration</AlertTitle>
          <AlertDescription>
            Training, testing, and syncing of ML models is managed through the MLStudio application. 
            This page shows models that have been synced to EcoBuild for use in material scanning.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
            <CardDescription>Models synced from MLStudio for material detection.</CardDescription>
          </CardHeader>
          <CardContent>
            {modelsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : modelsError ? (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load models. <Button variant="link" onClick={() => refetchModels()}>Retry</Button>
              </div>
            ) : models?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No models found.</p>
                <p className="text-sm mt-2">Use MLStudio to train and sync models to EcoBuild.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {models?.map((model) => (
                  <div key={model._id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{model.name}</h3>
                          <Badge variant="secondary">{model.version}</Badge>
                          {model.isActive && (
                            <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                          )}
                          <Badge className={getStatusColor(model.status)}>{model.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {model.architecture || 'Unknown architecture'} | {model.totalSamples} samples | {model.epochs} epochs
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!model.isActive && model.status === 'ready' && (
                          <Button
                            size="sm"
                            onClick={() => activateMutation.mutate(model._id)}
                            disabled={activateMutation.isPending}
                            data-testid={`button-activate-${model._id}`}
                          >
                            {activateMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Activate'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="p-2 bg-secondary/50 rounded">
                        <p className="text-muted-foreground">Accuracy</p>
                        <p className={`font-bold ${getAccuracyColor(model.accuracy)}`}>
                          {(model.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-2 bg-secondary/50 rounded">
                        <p className="text-muted-foreground">Precision</p>
                        <p className="font-bold">{((model.precision || 0) * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-2 bg-secondary/50 rounded">
                        <p className="text-muted-foreground">Recall</p>
                        <p className="font-bold">{((model.recall || 0) * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-2 bg-secondary/50 rounded">
                        <p className="text-muted-foreground">F1 Score</p>
                        <p className="font-bold">{((model.f1Score || 0) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    {model.classes && model.classes.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {model.classes.map((cls, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
