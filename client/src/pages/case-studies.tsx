import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Sprout, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CaseStudies() {
  const studies = [
    {
        title: "The Nordic Green Center",
        location: "Oslo, Norway",
        description: "How EcoBuild.AI helped reduce embodied carbon by 40% using hempcrete alternatives for non-load bearing walls.",
        metric: "-40% Carbon",
        image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&q=80&w=800",
        tags: ["Commercial", "Insulation", "Retrofit"]
    },
    {
        title: "Bamboo Pavilion Project",
        location: "Bali, Indonesia",
        description: "Structural analysis ensuring safety while using locally sourced engineered bamboo for a 5000 sq ft community center.",
        metric: "Carbon Negative",
        image: "https://images.unsplash.com/photo-1610504463627-7937732c9452?auto=format&fit=crop&q=80&w=800",
        tags: ["Public", "Structural", "New Build"]
    },
    {
        title: "Seattle Skyline Retrofit",
        location: "Seattle, USA",
        description: "Identifying recyclable steel components in a demolition project to save 200 tons of material from landfill.",
        metric: "200t Saved",
        image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=800",
        tags: ["High-rise", "Circular Economy", "Steel"]
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans pb-20">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">EcoBuild<span className="text-primary">.AI</span></span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-display font-bold mb-4">Case Studies</h1>
            <p className="text-lg text-muted-foreground">
                See how leading architects are using EcoBuild.AI to design the next generation of sustainable buildings.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {studies.map((study, i) => (
                <Card key={i} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <div className="relative h-56 overflow-hidden">
                        <img 
                            src={study.image} 
                            alt={study.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4">
                            <Badge className="bg-white/90 text-black backdrop-blur font-bold">
                                {study.metric}
                            </Badge>
                        </div>
                    </div>
                    <CardHeader>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {study.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{study.title}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center">
                            {study.location}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            {study.description}
                        </p>
                        <Button variant="link" className="p-0 h-auto text-primary font-bold group-hover:underline">
                            Read Full Story <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}