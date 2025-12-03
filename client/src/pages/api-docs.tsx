import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Sprout, Code, Terminal, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function ApiDocs() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('curl -X POST https://api.ecobuild.ai/v1/analyze \\ \n  -H "Authorization: Bearer YOUR_API_KEY" \\ \n  -F "image=@material.jpg"');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3 space-y-6">
                <div>
                    <h1 className="text-4xl font-display font-bold mb-4">API Reference</h1>
                    <p className="text-muted-foreground">
                        Integrate EcoBuild's powerful material analysis engine directly into your own applications.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Endpoints</h3>
                    <nav className="flex flex-col space-y-1">
                        <a href="#analyze" className="px-3 py-2 bg-primary/10 text-primary rounded-md font-medium text-sm">POST /v1/analyze</a>
                        <a href="#" className="px-3 py-2 text-muted-foreground hover:bg-secondary/50 rounded-md font-medium text-sm">GET /v1/materials</a>
                        <a href="#" className="px-3 py-2 text-muted-foreground hover:bg-secondary/50 rounded-md font-medium text-sm">GET /v1/materials/{'{id}'}</a>
                        <a href="#" className="px-3 py-2 text-muted-foreground hover:bg-secondary/50 rounded-md font-medium text-sm">POST /v1/projects</a>
                    </nav>
                </div>
            </div>

            <div className="md:w-2/3 space-y-12">
                <section id="analyze" className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded font-mono text-sm font-bold border border-blue-500/20">POST</span>
                        <h2 className="text-2xl font-bold font-mono">/v1/analyze</h2>
                    </div>
                    <p className="text-muted-foreground">
                        Upload an image of a construction material to receive instantaneous identification, carbon footprint analysis, and recommended sustainable alternatives.
                    </p>

                    <Card className="bg-slate-950 border-slate-800 text-slate-300 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
                            <div className="flex items-center gap-2 text-xs font-mono">
                                <Terminal className="w-4 h-4" />
                                <span>cURL Request</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={handleCopy}>
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                        </div>
                        <CardContent className="p-4 font-mono text-sm overflow-x-auto">
                            <pre>
{`curl -X POST https://api.ecobuild.ai/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@material.jpg"`}
                            </pre>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="font-bold">Response</h3>
                        <Card className="bg-slate-950 border-slate-800 text-green-400 overflow-hidden">
                             <CardContent className="p-4 font-mono text-sm overflow-x-auto">
                                <pre>
{`{
  "status": "success",
  "data": {
    "material": "Concrete (C25/30)",
    "confidence": 0.98,
    "properties": {
      "density": 2400,
      "carbon_footprint": 410
    },
    "alternatives": [
      {
        "name": "Hempcrete",
        "savings_percentage": 92
      }
    ]
  }
}`}
                                </pre>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
      </main>
    </div>
  );
}