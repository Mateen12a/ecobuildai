import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { MapPin, Calendar, TrendingUp, ArrowLeft } from "lucide-react";

const projects = [
  {
    id: 1,
    name: "Skyline Eco-Tower",
    location: "Seattle, WA",
    status: "In Progress",
    progress: 65,
    sustainabilityScore: 92,
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=800",
    date: "Dec 2025"
  },
  {
    id: 2,
    name: "Green Valley Campus",
    location: "Austin, TX",
    status: "Planning",
    progress: 15,
    sustainabilityScore: 88,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    date: "Mar 2026"
  },
  {
    id: 3,
    name: "Nordic Community Center",
    location: "Oslo, Norway",
    status: "Completed",
    progress: 100,
    sustainabilityScore: 98,
    image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&q=80&w=800",
    date: "Oct 2024"
  }
];

export default function Projects() {
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
            <h1 className="text-3xl font-display font-bold">Active Projects</h1>
            <p className="text-muted-foreground">Track sustainability goals across your portfolio.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="overflow-hidden flex flex-col md:flex-row border-none shadow-md hover:shadow-lg transition-all cursor-pointer group active:scale-[0.99]">
                <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-black backdrop-blur hover:bg-white">
                      {project.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-2xl font-bold font-display group-hover:text-primary transition-colors">{project.name}</h3>
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1" /> {project.location}
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4 mr-1" /> Completion: {project.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Eco-Score</div>
                        <div className="text-2xl font-bold text-primary">{project.sustainabilityScore}/100</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Completion Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button className="flex-1 md:flex-none group-hover:bg-primary group-hover:text-white transition-colors">View Details</Button>
                    <Button variant="outline" className="flex-1 md:flex-none">
                      <TrendingUp className="w-4 h-4 mr-2" /> Analytics
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}