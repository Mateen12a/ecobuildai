import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./db/mongoose";
import apiRoutes from "./routes/index";
import express from "express";
import path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await connectDB();
  
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  app.use('/api', apiRoutes);

  return httpServer;
}
