import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'wouter';
import { ArrowLeft, Brain, Upload, RefreshCw, Play, CheckCircle, AlertCircle, Loader2, Terminal, ChevronDown, ChevronUp, Cpu, Database, Zap, Target, BarChart3, TestTube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface LocalModel {
  id: string;
  accuracy: number;
  classes: number;
  samples: number;
}

interface TrainingStatus {
  isTraining: boolean;
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  logs: string[];
}

interface TestResult {
  prediction: string;
  confidence: number;
  allPredictions: { class: string; confidence: number }[];
}

export default function MLAdmin() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [trainingConfig, setTrainingConfig] = useState({
    epochs: 30,
    batchSize: 16,
    learningRate: 0.001,
    validationSplit: 0.2,
    enableSegmentation: false,
  });
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
    isTraining: false,
    progress: 0,
    currentEpoch: 0,
    totalEpochs: 0,
    logs: [],
  });
  const [showLogs, setShowLogs] = useState(false);
  const [selectedModelForSync, setSelectedModelForSync] = useState<string>('');
  const [testImage, setTestImage] = useState<File | null>(null);
  const [testPreview, setTestPreview] = useState<string>('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const { data: models, isLoading: modelsLoading, error: modelsError, refetch: refetchModels } = useQuery<MLModel[]>({
    queryKey: ['/api/models'],
    enabled: isAuthenticated,
  });

  const { data: localModels, isLoading: localModelsLoading, refetch: refetchLocalModels } = useQuery<LocalModel[]>({
    queryKey: ['/api/models/local'],
    enabled: isAuthenticated,
  });

  const { data: modelStats } = useQuery({
    queryKey: ['/api/models/stats'],
    enabled: isAuthenticated,
  });

  const syncMutation = useMutation({
    mutationFn: async (modelId: string) => {
      return apiRequest('POST', `/api/models/sync/${modelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
      toast({
        title: 'Model Synced',
        description: 'The model has been synced to EcoBuild successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync model',
        variant: 'destructive',
      });
    },
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

  const startTraining = async () => {
    setTrainingStatus({
      isTraining: true,
      progress: 0,
      currentEpoch: 0,
      totalEpochs: trainingConfig.epochs,
      logs: ['Starting training...'],
    });

    try {
      const response = await apiRequest('POST', '/api/models/train', {
        epochs: trainingConfig.epochs,
        batchSize: trainingConfig.batchSize,
        learningRate: trainingConfig.learningRate,
        validationSplit: trainingConfig.validationSplit,
        enableSegmentation: trainingConfig.enableSegmentation,
      });

      setTrainingStatus(prev => ({
        ...prev,
        logs: [...prev.logs, 'Training started successfully. Check console for progress.'],
      }));

      toast({
        title: 'Training Started',
        description: 'Model training has been initiated. This may take several minutes.',
      });
    } catch (error: any) {
      setTrainingStatus(prev => ({
        ...prev,
        isTraining: false,
        logs: [...prev.logs, `Error: ${error.message}`],
      }));
      toast({
        title: 'Training Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleTestImage = async () => {
    if (!testImage) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const formData = new FormData();
      formData.append('image', testImage);

      const result = await api.testModel(formData);
      setTestResult(result);
      
      toast({
        title: 'Prediction Complete',
        description: `Detected: ${result.prediction} (${(result.confidence * 100).toFixed(1)}% confidence)`,
      });
    } catch (error: any) {
      toast({
        title: 'Test Failed',
        description: error.message || 'Failed to test model',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTestImage(file);
      setTestPreview(URL.createObjectURL(file));
      setTestResult(null);
    }
  };

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
            <h2 className="text-2xl font-display font-bold">Admin Access Required</h2>
            <p className="text-muted-foreground">
              Sign in to access the ML model administration panel.
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
              MLStudio Admin
            </h1>
            <p className="text-muted-foreground">Train, test, and sync ML models for material detection.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => { refetchModels(); refetchLocalModels(); }} data-testid="button-refresh">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Local Models</p>
                <p className="text-2xl font-bold">{localModels?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="models" className="gap-2" data-testid="tab-models">
              <Database className="w-4 h-4" /> Models
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2" data-testid="tab-training">
              <Play className="w-4 h-4" /> Training
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2" data-testid="tab-test">
              <TestTube className="w-4 h-4" /> Test
            </TabsTrigger>
            <TabsTrigger value="sync" className="gap-2" data-testid="tab-sync">
              <Upload className="w-4 h-4" /> Sync
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>EcoBuild Models</CardTitle>
                <CardDescription>Models currently available in EcoBuild for material detection.</CardDescription>
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
                    <p>No models found. Train and sync a model to get started.</p>
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
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Training Configuration
                  </CardTitle>
                  <CardDescription>Configure training parameters for optimal model performance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="epochs">Epochs</Label>
                      <Input
                        id="epochs"
                        type="number"
                        value={trainingConfig.epochs}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) || 30 }))}
                        min={10}
                        max={200}
                        data-testid="input-epochs"
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 30-100 for good accuracy</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batchSize">Batch Size</Label>
                      <Input
                        id="batchSize"
                        type="number"
                        value={trainingConfig.batchSize}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 16 }))}
                        min={4}
                        max={64}
                        data-testid="input-batch-size"
                      />
                      <p className="text-xs text-muted-foreground">Smaller = slower but better generalization</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="learningRate">Learning Rate</Label>
                      <Input
                        id="learningRate"
                        type="number"
                        step="0.0001"
                        value={trainingConfig.learningRate}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) || 0.001 }))}
                        data-testid="input-learning-rate"
                      />
                      <p className="text-xs text-muted-foreground">Default: 0.001</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validationSplit">Validation Split</Label>
                      <Input
                        id="validationSplit"
                        type="number"
                        step="0.05"
                        value={trainingConfig.validationSplit}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, validationSplit: parseFloat(e.target.value) || 0.2 }))}
                        min={0.1}
                        max={0.4}
                        data-testid="input-validation-split"
                      />
                      <p className="text-xs text-muted-foreground">Percentage of data for validation</p>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={startTraining}
                    disabled={trainingStatus.isTraining}
                    data-testid="button-start-training"
                  >
                    {trainingStatus.isTraining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Training in Progress...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Training
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary" />
                    Training Status
                  </CardTitle>
                  <CardDescription>Monitor training progress and logs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trainingStatus.isTraining && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{trainingStatus.currentEpoch}/{trainingStatus.totalEpochs} epochs</span>
                      </div>
                      <Progress value={(trainingStatus.currentEpoch / trainingStatus.totalEpochs) * 100} />
                    </div>
                  )}
                  <Collapsible open={showLogs} onOpenChange={setShowLogs}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between" data-testid="button-toggle-logs">
                        <span className="flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Training Logs ({trainingStatus.logs.length})
                        </span>
                        {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="bg-secondary/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-1">
                        {trainingStatus.logs.length === 0 ? (
                          <p className="text-muted-foreground">No logs yet. Start training to see progress.</p>
                        ) : (
                          trainingStatus.logs.map((log, i) => (
                            <p key={i} className="text-muted-foreground">{log}</p>
                          ))
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="p-4 bg-blue-500/10 rounded-lg text-sm">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Command Line Training</h4>
                    <p className="text-muted-foreground mb-2">For full control, run training from the command line:</p>
                    <code className="block bg-secondary p-2 rounded text-xs break-all">
                      cd MLStudio-main/worker && python3 train.py --model-id my_model --mongo-uri "$MONGODB_URI" --epochs {trainingConfig.epochs} --batch-size {trainingConfig.batchSize}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-primary" />
                    Test Model Prediction
                  </CardTitle>
                  <CardDescription>Upload an image to test the active model's prediction accuracy before syncing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                    {testPreview ? (
                      <div className="space-y-4">
                        <img src={testPreview} alt="Test image" className="max-h-48 mx-auto rounded-lg" />
                        <Button variant="outline" onClick={() => { setTestImage(null); setTestPreview(''); setTestResult(null); }}>
                          Clear Image
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          data-testid="input-test-image"
                        />
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                          <p className="text-muted-foreground">Click to upload test image</p>
                        </div>
                      </label>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleTestImage}
                    disabled={!testImage || isTesting}
                    data-testid="button-run-test"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Prediction Test
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Test Results
                  </CardTitle>
                  <CardDescription>View prediction results and confidence scores.</CardDescription>
                </CardHeader>
                <CardContent>
                  {testResult ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/10 rounded-lg">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="text-sm text-muted-foreground">Predicted Material</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{testResult.prediction}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Confidence</p>
                            <p className={`text-2xl font-bold ${getAccuracyColor(testResult.confidence)}`}>
                              {(testResult.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                      {testResult.allPredictions && testResult.allPredictions.length > 1 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">All Predictions</p>
                          {testResult.allPredictions.slice(0, 5).map((pred, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-sm flex-1">{pred.class}</span>
                              <Progress value={pred.confidence * 100} className="w-32 h-2" />
                              <span className="text-sm font-mono w-16 text-right">{(pred.confidence * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {testResult.confidence >= 0.9 ? (
                        <div className="p-3 bg-green-500/10 rounded text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Excellent prediction confidence! Model is ready for sync.
                        </div>
                      ) : testResult.confidence >= 0.7 ? (
                        <div className="p-3 bg-yellow-500/10 rounded text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Good prediction. Consider more training data for higher accuracy.
                        </div>
                      ) : (
                        <div className="p-3 bg-red-500/10 rounded text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Low confidence. More training data or epochs recommended.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Upload and test an image to see prediction results.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    Local Models (MLStudio)
                  </CardTitle>
                  <CardDescription>Models trained locally that can be synced to EcoBuild.</CardDescription>
                </CardHeader>
                <CardContent>
                  {localModelsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : localModels?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No local models found. Train a model first.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {localModels?.map((model) => (
                        <div
                          key={model.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedModelForSync === model.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'}`}
                          onClick={() => setSelectedModelForSync(model.id)}
                          data-testid={`card-local-model-${model.id}`}
                        >
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                              <p className="font-semibold">{model.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {model.classes} classes | {model.samples} samples
                              </p>
                            </div>
                            <Badge className={getAccuracyColor(model.accuracy)}>
                              {(model.accuracy * 100).toFixed(1)}% accuracy
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Sync to EcoBuild
                  </CardTitle>
                  <CardDescription>Deploy selected model to EcoBuild for material detection.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedModelForSync ? (
                    <>
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Selected Model</p>
                        <p className="font-semibold text-lg">{selectedModelForSync}</p>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => syncMutation.mutate(selectedModelForSync)}
                        disabled={syncMutation.isPending}
                        data-testid="button-sync-model"
                      >
                        {syncMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Sync Model to EcoBuild
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a local model to sync</p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-500/10 rounded-lg text-sm">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Command Line Sync</h4>
                    <p className="text-muted-foreground mb-2">Alternatively, sync from command line:</p>
                    <code className="block bg-secondary p-2 rounded text-xs break-all">
                      cd MLStudio-main/worker && python3 sync_model_to_ecobuild.py --mongo-uri "$MONGODB_URI" --action sync --model-id {selectedModelForSync || 'MODEL_ID'}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
