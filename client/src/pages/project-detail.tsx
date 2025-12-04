import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRoute } from "wouter";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, AlertCircle, Clock, Plus, Trash2, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProjectMaterial {
  materialKey: string;
  materialName: string;
  quantity: number;
  unit: string;
  embodiedCarbon: number;
  embodiedEnergy: number;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  location: string;
  status: string;
  progress: number;
  sustainabilityScore: number;
  targetCompletionDate?: string;
  image?: string;
  totalCarbonFootprint: number;
  totalEmbodiedEnergy: number;
  materials: ProjectMaterial[];
  teamMembers: string[];
  budget?: number;
  createdAt: string;
}

interface Material {
  id: string;
  key: string;
  name: string;
  embodiedCarbon: number;
  embodiedEnergy: number;
}

export default function ProjectDetail() {
  const [match, params] = useRoute("/projects/:id");
  const [project, setProject] = useState<Project | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const [newMaterial, setNewMaterial] = useState({
    materialKey: "",
    quantity: 1,
    unit: "kg"
  });

  useEffect(() => {
    if (params?.id) {
      loadData(params.id);
    }
  }, [params?.id]);

  const loadData = async (id: string) => {
    try {
      const [projectData, materialsData] = await Promise.all([
        api.getProject(id),
        api.getMaterials()
      ]);
      setProject(projectData);
      setMaterials(materialsData);
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newMaterial.materialKey) return;
    
    setAdding(true);
    try {
      const selectedMaterial = materials.find(m => m.key === newMaterial.materialKey);
      if (!selectedMaterial) return;

      await api.addProjectMaterial(project.id, {
        materialKey: newMaterial.materialKey,
        materialName: selectedMaterial.name,
        quantity: newMaterial.quantity,
        unit: newMaterial.unit,
        embodiedCarbon: selectedMaterial.embodiedCarbon,
        embodiedEnergy: selectedMaterial.embodiedEnergy
      });

      toast({ title: "Success", description: "Material added to project" });
      setDialogOpen(false);
      setNewMaterial({ materialKey: "", quantity: 1, unit: "kg" });
      loadData(project.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-500";
      case "In Progress": return "bg-blue-500";
      case "Planning": return "bg-yellow-500";
      case "On Hold": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const timelineData = [
    { month: 'Week 1', actual: project.progress * 0.2, planned: 20 },
    { month: 'Week 2', actual: project.progress * 0.4, planned: 40 },
    { month: 'Week 3', actual: project.progress * 0.6, planned: 60 },
    { month: 'Week 4', actual: project.progress * 0.8, planned: 80 },
    { month: 'Current', actual: project.progress, planned: 100 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative h-64 bg-slate-900">
        {project.image ? (
          <img src={project.image} alt={project.name} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Link href="/projects">
              <Button variant="link" className="text-white/80 hover:text-white pl-0 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
              </Button>
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                <h1 className="text-4xl font-display font-bold text-white mb-2">{project.name}</h1>
                <div className="flex items-center text-white/80 gap-4">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {project.location}</span>
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Due: {formatDate(project.targetCompletionDate)}</span>
                </div>
              </div>
              <Badge className={`${getStatusColor(project.status)} text-white text-lg px-4 py-2 border-none shadow-lg`}>
                {project.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Sustainability Score</p>
                  <h3 className="text-3xl font-bold text-primary">{project.sustainabilityScore}/100</h3>
                  <Progress value={project.sustainabilityScore} className="h-2 mt-3" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Carbon Footprint</p>
                  <h3 className="text-3xl font-bold text-orange-600">{project.totalCarbonFootprint.toFixed(1)}kg</h3>
                  <p className="text-xs text-muted-foreground mt-1">Total CO2e</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Materials</p>
                  <h3 className="text-3xl font-bold text-blue-600">{project.materials.length}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Added to project</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Actual vs Planned Completion (%)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={3} name="Actual" />
                    <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeDasharray="5 5" name="Planned" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Materials</CardTitle>
                  <CardDescription>Materials added to this project</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" /> Add Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Material to Project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddMaterial} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Material</Label>
                        <Select
                          value={newMaterial.materialKey}
                          onValueChange={(value) => setNewMaterial({ ...newMaterial, materialKey: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((m) => (
                              <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={newMaterial.quantity}
                            onChange={(e) => setNewMaterial({ ...newMaterial, quantity: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Select
                            value={newMaterial.unit}
                            onValueChange={(value) => setNewMaterial({ ...newMaterial, unit: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="m³">m³</SelectItem>
                              <SelectItem value="m²">m²</SelectItem>
                              <SelectItem value="units">units</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={adding}>
                        {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Add Material"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {project.materials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No materials added yet. Click "Add Material" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.materials.map((mat, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{mat.materialName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {mat.quantity} {mat.unit} • {(mat.embodiedCarbon * mat.quantity).toFixed(2)} kgCO2
                          </p>
                        </div>
                        <Badge variant="secondary">{mat.embodiedCarbon} kgCO2/kg</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{project.description || "No description provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="flex-1 h-2" />
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Embodied Energy</p>
                  <p className="font-medium">{project.totalEmbodiedEnergy.toFixed(1)} MJ</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Carbon Footprint</p>
                    <p className="text-2xl font-bold">{project.totalCarbonFootprint.toFixed(1)} kgCO2</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sustainability Score</p>
                    <p className="text-2xl font-bold text-primary">{project.sustainabilityScore}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
