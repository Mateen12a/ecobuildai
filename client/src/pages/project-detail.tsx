import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useRoute } from "wouter";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const timelineData = [
  { month: 'Jan', actual: 12, planned: 15 },
  { month: 'Feb', actual: 28, planned: 30 },
  { month: 'Mar', actual: 45, planned: 45 },
  { month: 'Apr', actual: 58, planned: 60 },
  { month: 'May', actual: 65, planned: 75 },
];

export default function ProjectDetail() {
  const [match, params] = useRoute("/projects/:id");
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative h-64 bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=1200" 
          alt="Project Cover" 
          className="w-full h-full object-cover opacity-50" 
        />
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
                <h1 className="text-4xl font-display font-bold text-white mb-2">Skyline Eco-Tower</h1>
                <div className="flex items-center text-white/80 gap-4">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> Seattle, WA</span>
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Due: Dec 2025</span>
                </div>
              </div>
              <Badge className="bg-primary text-white text-lg px-4 py-2 border-none shadow-lg">
                On Track
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Stats & Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Sustainability Score</p>
                  <h3 className="text-3xl font-bold text-primary">92/100</h3>
                  <Progress value={92} className="h-2 mt-3" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Carbon Offset</p>
                  <h3 className="text-3xl font-bold text-green-600">450t</h3>
                  <p className="text-xs text-muted-foreground mt-1">+12% vs Target</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Material Reuse</p>
                  <h3 className="text-3xl font-bold text-blue-600">35%</h3>
                  <p className="text-xs text-muted-foreground mt-1">Recycled Content</p>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Construction Progress</CardTitle>
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { title: "Material Audit Completed", date: "2 days ago", icon: CheckCircle2, color: "text-green-500" },
                    { title: "Concrete Pour Delayed", date: "5 days ago", icon: AlertCircle, color: "text-orange-500" },
                    { title: "New Supplier Added", date: "1 week ago", icon: Clock, color: "text-blue-500" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className={`mt-1 ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Team & Tasks */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary" />
                      <div>
                        <p className="font-medium text-sm">Team Member {i}</p>
                        <p className="text-xs text-muted-foreground">Architect</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2">Manage Team</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Next Milestone</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-bold text-xl mb-1">Structural Frame</h3>
                <p className="text-sm text-muted-foreground mb-4">Due in 14 days</p>
                <Progress value={75} className="h-2 mb-2" />
                <p className="text-xs text-right text-muted-foreground">75% Complete</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}