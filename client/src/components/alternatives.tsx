import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Leaf } from "lucide-react";
import hempTexture from '@assets/generated_images/hempcrete_texture.png';
import steelTexture from '@assets/generated_images/recycled_steel_texture.png';

const alternatives = [
  {
    id: 1,
    name: "Hempcrete Block",
    category: "Bio-Composite",
    impact: "Very Low",
    impactColor: "bg-green-100 text-green-700 hover:bg-green-100",
    description: "Carbon-negative material made from hemp hurds and lime. Excellent insulation properties.",
    image: hempTexture,
    savings: "92%"
  },
  {
    id: 2,
    name: "Recycled Steel",
    category: "Metal",
    impact: "Medium",
    impactColor: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    description: "Reclaimed structural steel with significantly lower embodied energy than virgin steel.",
    image: steelTexture,
    savings: "45%"
  },
  {
    id: 3,
    name: "Mycelium Insulation",
    category: "Bio-Material",
    impact: "Very Low",
    impactColor: "bg-green-100 text-green-700 hover:bg-green-100",
    description: "Root structure of mushrooms grown into molds. Fully biodegradable and fire resistant.",
    image: "https://images.unsplash.com/photo-1611420379240-592943150407?auto=format&fit=crop&q=80&w=800",
    savings: "98%"
  }
];

export function AlternativesGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Recommended Alternatives</h2>
        <Button variant="ghost" className="text-primary">View All <ArrowRight className="ml-2 w-4 h-4" /></Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {alternatives.map((alt) => (
          <Card key={alt.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={alt.image} 
                alt={alt.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4">
                <Badge className={`${alt.impactColor} border-none shadow-sm`}>
                  <Leaf className="w-3 h-3 mr-1" /> {alt.impact}
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="text-white text-xs font-bold tracking-wider uppercase opacity-90">{alt.category}</span>
              </div>
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{alt.name}</CardTitle>
                <Badge variant="outline" className="border-primary text-primary font-bold">
                  -{alt.savings} CO2
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {alt.description}
              </p>
            </CardContent>
            
            <CardFooter>
              <Button className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                View Specs
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}