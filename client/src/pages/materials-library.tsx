import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Leaf, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

// Mock data for materials
const materials = [
  { id: 1, name: "Hempcrete Block", category: "Bio-Composite", impact: "Very Low", impactColor: "bg-green-100 text-green-700", carbon: "-108 kg", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "Recycled Steel Beam", category: "Metal", impact: "Medium", impactColor: "bg-yellow-100 text-yellow-700", carbon: "450 kg", image: "https://images.unsplash.com/photo-1535063406549-79632a25a8b3?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Cross Laminated Timber", category: "Wood", impact: "Low", impactColor: "bg-green-100 text-green-700", carbon: "-450 kg", image: "https://images.unsplash.com/photo-1605112917064-82438d2c9003?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Standard Concrete C25", category: "Concrete", impact: "High", impactColor: "bg-red-100 text-red-700", carbon: "2400 kg", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800" },
  { id: 5, name: "Mycelium Insulation", category: "Bio-Material", impact: "Very Low", impactColor: "bg-green-100 text-green-700", carbon: "-15 kg", image: "https://images.unsplash.com/photo-1611420379240-592943150407?auto=format&fit=crop&q=80&w=800" },
  { id: 6, name: "Bamboo Flooring", category: "Wood", impact: "Low", impactColor: "bg-green-100 text-green-700", carbon: "25 kg", image: "https://images.unsplash.com/photo-1610504463627-7937732c9452?auto=format&fit=crop&q=80&w=800" },
];

export default function MaterialsLibrary() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Materials Library</h1>
            <p className="text-muted-foreground">Database of 2,400+ construction materials and their environmental impact.</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search materials..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none shadow-md">
              <div className="h-48 overflow-hidden relative">
                <img src={material.image} alt={material.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <Badge className={`${material.impactColor} border-none`}>
                    {material.impact === 'High' ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Leaf className="w-3 h-3 mr-1" />}
                    {material.impact} Impact
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{material.category}</span>
                    <CardTitle className="text-xl">{material.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Embodied Carbon:</span>
                  <span className="font-mono font-medium">{material.carbon} CO2e/m³</span>
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/20 pt-4">
                <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}