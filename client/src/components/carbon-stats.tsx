import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Leaf, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import type { ScanResult } from '@/lib/api';

export function CarbonStats({ scanResult }: { scanResult?: ScanResult | null }) {
  let data = [
    { name: 'Standard Concrete', carbon: 400, color: '#ef4444' }, // Red
    { name: 'Hempcrete', carbon: 120, color: '#16a34a' }, // Green
    { name: 'Recycled Steel', carbon: 250, color: '#eab308' }, // Yellow
    { name: 'Bamboo', carbon: 80, color: '#16a34a' }, // Green
  ];

  if (scanResult && scanResult.material) {
    const scanned = {
      name: scanResult.material.name,
      carbon: scanResult.material.embodiedCarbon || 0,
      color: '#ef4444',
    };

    const alts = (scanResult.material.alternatives || []).map((a: any) => ({
      name: a.name,
      carbon: a.embodiedCarbon || 0,
      color: a.embodiedCarbon <= scanned.carbon ? '#16a34a' : '#eab308'
    }));

    data = [scanned, ...alts].slice(0, 6);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="h-full border-none shadow-lg bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              Carbon Footprint Comparison
            </CardTitle>
            <CardDescription>kg CO2e per cubic meter</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }} 
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="carbon" radius={[0, 4, 4, 0]} barSize={30}>
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-accent text-white border-none shadow-lg">
            <CardContent className="pt-6 flex items-start justify-between">
              <div>
                <p className="text-white/80 font-medium mb-1">Impact Alert</p>
                <h3 className="text-3xl font-bold font-display mb-2">High Carbon</h3>
                <p className="text-sm text-white/90">
                  Selected material exceeds sustainable threshold by 230%.
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-primary text-white border-none shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <CardContent className="pt-6 flex items-start justify-between relative z-10">
              <div>
                <p className="text-white/80 font-medium mb-1">Potential Savings</p>
                <h3 className="text-3xl font-bold font-display mb-2">-68% CO2</h3>
                <p className="text-sm text-white/90">
                  By switching to Hempcrete or Bamboo.
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}