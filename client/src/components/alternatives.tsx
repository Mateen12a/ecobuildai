import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import hempTexture from '@assets/generated_images/hempcrete_texture.png';
import steelTexture from '@assets/generated_images/recycled_steel_texture.png';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

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
  },
  {
    id: 4,
    name: "Bamboo Flooring",
    category: "Wood",
    impact: "Low",
    impactColor: "bg-green-100 text-green-700 hover:bg-green-100",
    description: "Rapidly renewable resource with tensile strength comparable to steel.",
    image: "https://images.unsplash.com/photo-1610504463627-7937732c9452?auto=format&fit=crop&q=80&w=800",
    savings: "35%"
  },
  {
    id: 5,
    name: "Rammed Earth",
    category: "Earth",
    impact: "Very Low",
    impactColor: "bg-green-100 text-green-700 hover:bg-green-100",
    description: "Sustainable building technique using compacted natural raw materials.",
    image: "https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&q=80&w=800",
    savings: "85%"
  }
];

export function AlternativesGrid({ scanResult }: { scanResult?: any } ) {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 3; // Show 3 items at a time in the carousel view

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % (alternatives.length - itemsPerPage + 1));
  };

  const prevSlide = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const sourceAlts = scanResult && scanResult.material && scanResult.material.alternatives && scanResult.material.alternatives.length > 0
    ? scanResult.material.alternatives
    : alternatives;

  const visibleAlternatives = sourceAlts.slice(startIndex, startIndex + itemsPerPage);
  const canScrollRight = startIndex < alternatives.length - itemsPerPage;
  const canScrollLeft = startIndex > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Recommended Alternatives</h2>
        <div className="flex gap-2">
           <Button 
            variant="outline" 
            size="icon" 
            onClick={prevSlide} 
            disabled={!canScrollLeft}
            className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextSlide} 
            disabled={!canScrollRight}
            className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Link href="/materials">
             <Button variant="ghost" className="text-primary ml-2">View All <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {visibleAlternatives.map((alt) => (
            <motion.div
              key={alt.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 flex flex-col">
                  <div className="relative h-48 overflow-hidden shrink-0">
                  {alt.image ? (
                    <img 
                      src={alt.image} 
                      alt={alt.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <div className="text-6xl font-bold text-white/10">{alt.name?.charAt(0) || ''}</div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className={`${alt.impactColor} border-none shadow-sm backdrop-blur-sm bg-opacity-90`}>
                      <Leaf className="w-3 h-3 mr-1" /> {alt.impact}
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="text-white text-xs font-bold tracking-wider uppercase opacity-90 drop-shadow-md">{alt.category}</span>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1" title={alt.name}>{alt.name}</CardTitle>
                    <Badge variant="outline" className="w-fit border-primary text-primary font-bold bg-primary/5">
                      -{alt.savings} CO2 Reduction
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {alt.description}
                  </p>
                </CardContent>
                
                <CardFooter className="mt-auto pt-4 border-t border-border/50 bg-secondary/10">
                  <Link href={`/materials/${alt.id}`} className="w-full">
                    <Button className="w-full group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                      View Specs
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}