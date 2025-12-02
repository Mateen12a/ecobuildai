import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, FileText, Share2, ArrowLeft, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const monthlyData = [
  { name: 'Jan', carbon: 4000, saved: 2400 },
  { name: 'Feb', carbon: 3000, saved: 1398 },
  { name: 'Mar', carbon: 2000, saved: 9800 },
  { name: 'Apr', carbon: 2780, saved: 3908 },
  { name: 'May', carbon: 1890, saved: 4800 },
  { name: 'Jun', carbon: 2390, saved: 3800 },
];

export default function Reports() {
  const { toast } = useToast();

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
            <Button variant="outline" onClick={handleShare} className="active:scale-95 transition-transform">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button onClick={handleExport} className="active:scale-95 transition-transform">
              <Download className="w-4 h-4 mr-2" /> Export PDF
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

        <h2 className="text-xl font-display font-bold mb-4">Recent Generated Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Dialog key={i}>
              <DialogTrigger asChild>
                <Card className="hover:bg-secondary/20 transition-all cursor-pointer border-none shadow-sm group active:scale-[0.98]">
                  <CardContent className="p-6 flex items-center gap-4 relative overflow-hidden">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Q{i} 2025 Sustainability Audit</h3>
                      <p className="text-sm text-muted-foreground">Generated on Dec {i + 10}, 2025</p>
                    </div>
                    <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Q{i} 2025 Sustainability Audit Report</DialogTitle>
                  <DialogDescription>Full breakdown of environmental impact metrics.</DialogDescription>
                </DialogHeader>
                <div className="h-[400px] w-full bg-secondary/10 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">Preview of Report Document Content</p>
                  <Button variant="outline" className="mt-4" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" /> Download Full PDF
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </div>
  );
}