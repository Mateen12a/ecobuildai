import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Leaf, BarChart3, Share2, Download, Info, AlertTriangle, Loader2, X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from "@/lib/api";

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
  alternatives: { id: string; key: string; name: string; embodiedCarbon: number; impactLevel: string }[];
}

interface MaterialImageData {
  id: string;
  filename: string;
  materialOfficial: string;
  contentType: string;
}

export default function MaterialDetail() {
  const [match, params] = useRoute("/materials/:id");
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<MaterialImageData[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (params?.id) {
      loadMaterial(params.id);
    }
  }, [params?.id]);

  const loadMaterial = async (id: string) => {
    try {
      const data = await api.getMaterial(id);
      setMaterial(data);
      loadImages(id);
    } catch (error) {
      console.error("Failed to load material:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (materialKey: string) => {
    setLoadingImages(true);
    try {
      const imageData = await api.getMaterialImages(materialKey, 10);
      setImages(imageData);
    } catch (error) {
      console.error("Failed to load images:", error);
      setImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageViewer = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'Very Low':
      case 'Low': return 'bg-green-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'High':
      case 'Very High': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Material Not Found</h2>
          <Link href="/materials">
            <Button>Back to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const carbonChartData = [
    { name: 'Embodied Carbon', value: material.embodiedCarbon },
    { name: 'Embodied Energy', value: material.embodiedEnergy / 10 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-8">
        <Link href="/materials">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="aspect-square relative bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-9xl font-bold text-white/10">{material.name.charAt(0)}</div>
                <div className="absolute top-4 left-4">
                  <Badge className={`${getImpactColor(material.impactLevel)} border-none text-lg px-3 py-1`}>
                    {material.impactLevel === 'Very Low' || material.impactLevel === 'Low' ? (
                      <Leaf className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-1" />
                    )}
                    {material.impactLevel}
                  </Badge>
                </div>
              </div>
              <CardContent className="pt-6">
                <h1 className="text-3xl font-display font-bold mb-2">{material.name}</h1>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-4">{material.category}</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                    <span className="text-sm font-medium">Embodied Carbon</span>
                    <span className="font-bold text-lg">{material.embodiedCarbon} kgCO2/kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                    <span className="text-sm font-medium">Embodied Energy</span>
                    <span className="font-bold text-lg">{material.embodiedEnergy} MJ/kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                    <span className="text-sm font-medium">Density</span>
                    <span className="font-bold">{material.density} kg/m³</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" /> Spec Sheet
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="environmental">Environmental</TabsTrigger>
                <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Material Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {material.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Technical Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between p-3 border rounded-lg">
                        <span className="text-muted-foreground">Embodied Carbon</span>
                        <span className="font-medium">{material.embodiedCarbon} kgCO2/kg</span>
                      </div>
                      <div className="flex justify-between p-3 border rounded-lg">
                        <span className="text-muted-foreground">Embodied Energy</span>
                        <span className="font-medium">{material.embodiedEnergy} MJ/kg</span>
                      </div>
                      <div className="flex justify-between p-3 border rounded-lg">
                        <span className="text-muted-foreground">Density</span>
                        <span className="font-medium">{material.density} kg/m³</span>
                      </div>
                      <div className="flex justify-between p-3 border rounded-lg">
                        <span className="text-muted-foreground">Impact Level</span>
                        <span className="font-medium">{material.impactLevel}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Image gallery: show up to 10 images from database */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Image Gallery
                      {images.length > 0 && (
                        <Badge variant="secondary" className="ml-2">{images.length} images</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingImages ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading images...</span>
                      </div>
                    ) : images.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {images.map((img, i) => (
                          <div 
                            key={img.id} 
                            className="aspect-square bg-gray-100 overflow-hidden rounded-lg cursor-pointer group relative hover:ring-2 hover:ring-primary transition-all"
                            onClick={() => openImageViewer(i)}
                          >
                            <img 
                              src={api.getMaterialImageUrl(img.id)} 
                              alt={`${material.name} ${i+1}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                                Click to view
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No images available for this material</p>
                        <p className="text-sm">Images will appear here once added to the database</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="environmental" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Environmental Impact</CardTitle>
                    <CardDescription>Carbon and energy metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={carbonChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alternatives">
                {material.alternatives && material.alternatives.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {material.alternatives.map((alt, i) => (
                      <Link key={i} href={`/materials/${alt.key}`}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                          <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-2">{alt.name}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Embodied Carbon:</span>
                              <span className="font-mono">{alt.embodiedCarbon} kgCO2/kg</span>
                            </div>
                            {alt.embodiedCarbon < material.embodiedCarbon && (
                              <Badge className="mt-3 bg-green-100 text-green-700">
                                {Math.round((1 - alt.embodiedCarbon / material.embodiedCarbon) * 100)}% less carbon
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-secondary/10 border-dashed">
                    <CardContent className="pt-6 text-center py-12">
                      <Info className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Alternatives Available</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        This material doesn't have documented alternatives in the ICE database.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => closeImageViewer()}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <DialogDescription className="sr-only">
            Viewing image {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} of {images.length} for {material?.name}
          </DialogDescription>
          <div className="relative">
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeImageViewer}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
                  onClick={() => navigateImage('prev')}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
                  onClick={() => navigateImage('next')}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image */}
            {selectedImageIndex !== null && images[selectedImageIndex] && (
              <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <img 
                  src={api.getMaterialImageUrl(images[selectedImageIndex].id)} 
                  alt={`${material?.name} - Image ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
                <div className="mt-4 text-center text-white">
                  <p className="text-lg font-medium">{material?.name}</p>
                  <p className="text-sm text-white/60">Image {selectedImageIndex + 1} of {images.length}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
