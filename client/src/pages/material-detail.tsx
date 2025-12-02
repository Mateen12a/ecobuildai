import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Leaf, BarChart3, Share2, Download, Info, AlertTriangle } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

// Mock data for specific material
const materialData = {
  id: 1,
  name: "Hempcrete Block",
  category: "Bio-Composite",
  description: "Hempcrete is a bio-composite material, a mixture of hemp hurds (shives) and lime, sand, or pozzolans, which is used as a material for construction and insulation. It is marketed under names like Hempcrete, Canobiote, Canosmose, and Isochanvre.",
  properties: [
    { name: "Thermal Conductivity", value: "0.06 W/mK" },
    { name: "Density", value: "330 kg/m³" },
    { name: "Fire Resistance", value: "Class B-s1, d0" },
    { name: "Sound Absorption", value: "0.85 NRC" },
    { name: "Compressive Strength", value: "1.0 MPa" }
  ],
  carbonFootprint: {
    production: -120, // Negative because it sequesters carbon
    transport: 12,
    installation: 5,
    endOfLife: -5
  },
  lifecycleData: [
    { subject: 'Global Warming', A: 120, B: 110, fullMark: 150 },
    { subject: 'Ozone Depletion', A: 98, B: 130, fullMark: 150 },
    { subject: 'Acidification', A: 86, B: 130, fullMark: 150 },
    { subject: 'Eutrophication', A: 99, B: 100, fullMark: 150 },
    { subject: 'Energy Demand', A: 85, B: 90, fullMark: 150 },
    { subject: 'Water Use', A: 65, B: 85, fullMark: 150 },
  ],
  certifications: ["LEED v4", "BREEAM Excellent", "Living Building Challenge"]
};

const carbonChartData = [
  { name: 'Production', value: -120 },
  { name: 'Transport', value: 12 },
  { name: 'Installation', value: 5 },
  { name: 'End of Life', value: -5 },
];

export default function MaterialDetail() {
  const [match, params] = useRoute("/materials/:id");
  const id = params?.id;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-8">
        <Link href="/materials">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image & Quick Stats */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="aspect-square relative">
                <img 
                  src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800" 
                  alt={materialData.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-500 text-white border-none text-lg px-3 py-1">
                    <Leaf className="w-4 h-4 mr-1" /> Carbon Negative
                  </Badge>
                </div>
              </div>
              <CardContent className="pt-6">
                <h1 className="text-3xl font-display font-bold mb-2">{materialData.name}</h1>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-4">{materialData.category}</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                    <span className="text-sm font-medium">Net Carbon Impact</span>
                    <span className="text-green-600 font-bold text-lg">-108 kg CO2e</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                    <span className="text-sm font-medium">Recyclability</span>
                    <span className="font-bold">100%</span>
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

            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {materialData.certifications.map((cert, i) => (
                    <Badge key={i} variant="secondary">{cert}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Detailed Data */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview & Specs</TabsTrigger>
                <TabsTrigger value="lifecycle">Lifecycle Analysis</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Material Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {materialData.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Technical Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {materialData.properties.map((prop, i) => (
                        <div key={i} className="flex justify-between p-3 border border-border rounded-lg hover:bg-secondary/10 transition-colors">
                          <span className="text-muted-foreground">{prop.name}</span>
                          <span className="font-medium">{prop.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lifecycle" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Embodied Carbon Breakdown</CardTitle>
                      <CardDescription>kg CO2e per cubic meter</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={carbonChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Environmental Impact</CardTitle>
                      <CardDescription>Comparative Analysis vs Standard Concrete</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={materialData.lifecycleData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} />
                          <Radar name="Hempcrete" dataKey="A" stroke="#16a34a" fill="#16a34a" fillOpacity={0.6} />
                          <Radar name="Standard Concrete" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="applications">
                <Card className="bg-secondary/10 border-dashed">
                  <CardContent className="pt-6 text-center py-12">
                    <Info className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Application Guidelines</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Suitable for non-load bearing walls, insulation layers, and moisture regulation in heritage buildings. Not recommended for foundations or below-grade applications without specialized waterproofing.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}