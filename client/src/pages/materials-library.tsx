import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Leaf, AlertTriangle, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";
import api from "@/lib/api";

interface MaterialImage {
  id: string;
  filename: string;
  materialOfficial: string;
  contentType: string;
}

interface Material {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  embodiedEnergy: number;
  embodiedCarbon: number;
  density: number;
  impactLevel: string;
  impactColor: { bg: string; text: string };
}

interface MaterialWithImages extends Material {
  images: MaterialImage[];
  loadingImages: boolean;
}

export default function MaterialsLibrary() {
  const [materials, setMaterials] = useState<MaterialWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadMaterials();
    loadCategories();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await api.getMaterials();
      const materialsWithImages: MaterialWithImages[] = data.map((m: Material) => ({
        ...m,
        images: [],
        loadingImages: true
      }));
      setMaterials(materialsWithImages);
      setLoading(false);
      
      for (const material of materialsWithImages) {
        loadMaterialImages(material.key);
      }
    } catch (error) {
      console.error("Failed to load materials:", error);
      setLoading(false);
    }
  };

  const loadMaterialImages = async (materialKey: string) => {
    try {
      const images = await api.getMaterialImages(materialKey, 10);
      setMaterials(prev => prev.map(m => 
        m.key === materialKey 
          ? { ...m, images, loadingImages: false }
          : m
      ));
    } catch (error) {
      console.error(`Failed to load images for ${materialKey}:`, error);
      setMaterials(prev => prev.map(m => 
        m.key === materialKey 
          ? { ...m, loadingImages: false }
          : m
      ));
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getMaterialCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getImpactIcon = (level: string) => {
    return level === 'High' || level === 'Very High' ? AlertTriangle : Leaf;
  };

  const getImpactColorClass = (level: string) => {
    switch (level) {
      case 'Very Low':
      case 'Low':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Very High':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
            <h1 className="text-3xl font-display font-bold">Materials Library</h1>
            <p className="text-muted-foreground">ICE Database - {materials.length} construction materials with environmental impact data.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search materials..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={selectedCategory === "" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("")}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => {
            const ImpactIcon = getImpactIcon(material.impactLevel);
            const hasImages = material.images && material.images.length > 0;
            const firstImage = hasImages ? material.images[0] : null;
            
            return (
              <Link key={material.id} href={`/materials/${material.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-none shadow-md cursor-pointer group hover:-translate-y-1 h-full">
                  <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center">
                    {material.loadingImages ? (
                      <Loader2 className="w-8 h-8 animate-spin text-white/30" />
                    ) : hasImages && firstImage ? (
                      <img 
                        src={api.getMaterialImageUrl(firstImage.id)} 
                        alt={material.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl font-bold text-white/10">{material.name.charAt(0)}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge className={`${getImpactColorClass(material.impactLevel)} border-none`}>
                        <ImpactIcon className="w-3 h-3 mr-1" />
                        {material.impactLevel} Impact
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-sm">
                        {material.category}
                      </Badge>
                      {hasImages && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-sm">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {material.images.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{material.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block">Embodied Carbon</span>
                        <span className="font-mono font-medium">{material.embodiedCarbon} kgCO2/kg</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Embodied Energy</span>
                        <span className="font-mono font-medium">{material.embodiedEnergy} MJ/kg</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-secondary/20 pt-4 group-hover:bg-secondary/40 transition-colors">
                    <Button variant="ghost" className="w-full text-primary hover:text-primary/80">View Details</Button>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No materials found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
