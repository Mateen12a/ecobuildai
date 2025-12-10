import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, FileText, Share2, ArrowLeft, Eye, Plus, Trash2, Loader2, BarChart3, Leaf } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  type: string;
  status: string;
  projectName?: string;
  data: {
    totalCarbonFootprint: number;
    totalEmbodiedEnergy: number;
    carbonReduction: number;
    materialsAnalyzed: number;
    sustainabilityScore: number;
    recommendations: string[];
  };
  generatedAt: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newReport, setNewReport] = useState({
    title: "",
    type: "sustainability",
    projectId: ""
  });

  const monthlyData = [
    { name: 'Jan', carbon: 4000, saved: 2400 },
    { name: 'Feb', carbon: 3000, saved: 1398 },
    { name: 'Mar', carbon: 2000, saved: 9800 },
    { name: 'Apr', carbon: 2780, saved: 3908 },
    { name: 'May', carbon: 1890, saved: 4800 },
    { name: 'Jun', carbon: 2390, saved: 3800 },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportsData, projectsData] = await Promise.all([
        api.getReports(),
        api.getProjects()
      ]);
      setReports(reportsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.generateReport(newReport);
      toast({ title: "Success", description: "Report generated successfully" });
      setDialogOpen(false);
      setNewReport({ title: "", type: "sustainability", projectId: "" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await api.deleteReport(id);
      toast({ title: "Deleted", description: "Report deleted successfully" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleShare = () => {
    toast({
      title: "Report Shared",
      description: "A secure link has been copied to your clipboard.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Exporting PDF",
      description: "Your report is being generated and will download shortly.",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project": return "bg-blue-100 text-blue-700";
      case "sustainability": return "bg-green-100 text-green-700";
      case "material": return "bg-purple-100 text-purple-700";
      case "comparison": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-display font-bold">Sustainability Reports</h1>
            <p className="text-muted-foreground">Analysis of carbon footprint reduction and material efficiency.</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate New Report</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter report title"
                      value={newReport.title}
                      onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Report Type</Label>
                    <Select
                      value={newReport.type}
                      onValueChange={(value) => setNewReport({ ...newReport, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sustainability">Sustainability Overview</SelectItem>
                        <SelectItem value="project">Project Analysis</SelectItem>
                        <SelectItem value="material">Material Breakdown</SelectItem>
                        <SelectItem value="comparison">Comparison Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {projects.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="project">Project (Optional)</Label>
                      <Select
                        value={newReport.projectId}
                        onValueChange={(value) => setNewReport({ ...newReport, projectId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Projects</SelectItem>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={generating}>
                    {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Generate Report"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Carbon Reduction Overview</CardTitle>
              <CardDescription>Monthly CO2e savings vs emissions (kg)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="saved" stroke="#16a34a" fillOpacity={1} fill="url(#colorSaved)" name="Carbon Saved" />
                  <Area type="monotone" dataKey="carbon" stroke="#ef4444" fillOpacity={1} fill="url(#colorCarbon)" name="Emissions" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Material Efficiency</CardTitle>
              <CardDescription>Waste reduction metrics per quarter</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="saved" fill="#eab308" radius={[4, 4, 0, 0]} name="Waste Diverted (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-display font-bold mb-4">Generated Reports</h2>
        
        {reports.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground mb-4">Generate your first sustainability report</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Generate Report
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <Badge className={`${getTypeColor(report.type)} mb-1`}>
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </Badge>
                        <h3 className="font-bold">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{formatDate(report.generatedAt)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <p className="text-xs text-muted-foreground">Carbon</p>
                      <p className="font-bold">{report.data.totalCarbonFootprint.toFixed(1)}kg</p>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className="font-bold">{report.data.sustainabilityScore}/100</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
