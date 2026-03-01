import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AGI Feature Matrix State (In-memory for demo, could be DB)
  const agiState = {
    osBuilds: [] as any[],
    activeScans: 0,
    temporalShifts: 0,
    digitalTwin: {
      syncLevel: 0,
      lastSync: null as string | null,
      consciousnessMatrix: [] as string[]
    }
  };

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", features: 1000, agiLayers: 100 });
  });

  // AGI Feature Matrix Endpoints
  app.post("/api/agi/cyber-scan", (req, res) => {
    const { deepScan } = req.body;
    agiState.activeScans++;
    // Simulate complex backend processing
    setTimeout(() => {
      agiState.activeScans--;
    }, 5000);
    res.json({ 
      status: "SCAN_INITIATED", 
      threatLevel: "LOW", 
      layersChecked: deepScan ? 100 : 25,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/agi/construct-os", (req, res) => {
    const { component, name } = req.body;
    const build = { id: Date.now(), component, name, status: "BUILDING", progress: 0 };
    agiState.osBuilds.push(build);
    
    // Simulate background build process
    const interval = setInterval(() => {
      build.progress += 10;
      if (build.progress >= 100) {
        build.status = "STABLE";
        clearInterval(interval);
      }
    }, 1000);

    res.json({ status: "CONSTRUCTION_STARTED", buildId: build.id });
  });

  app.get("/api/agi/os-status/:id", (req, res) => {
    const build = agiState.osBuilds.find(b => b.id === parseInt(req.params.id));
    if (!build) return res.status(404).json({ error: "Build not found" });
    res.json(build);
  });

  app.post("/api/agi/sync-brain", (req, res) => {
    const { frequency, level } = req.body;
    res.json({ 
      status: "SYNC_ACTIVE", 
      resonance: Math.random() * 100,
      neuralPathways: 1024,
      frequencyMatch: true 
    });
  });

  app.post("/api/agi/time-travel", (req, res) => {
    const { era, year } = req.body;
    agiState.temporalShifts++;
    res.json({ 
      status: "TEMPORAL_SHIFT_SUCCESS", 
      era, 
      year, 
      paradoxRisk: "0.0001%",
      continuumStatus: "STABLE"
    });
  });

  app.get("/api/agi/space-telemetry", (req, res) => {
    res.json({
      planet: {
        name: "Alpha-Centauri Prime",
        type: "Super-Earth",
        distance: "4.37 Light Years",
        habitability: "92%"
      },
      mission: {
        name: "Voyager 3 (Simulated)",
        status: "INTERSTELLAR",
        location: "Oort Cloud",
        speed: "62,000 km/h"
      }
    });
  });

  app.post("/api/agi/digital-twin/sync", (req, res) => {
    const { syncLevel } = req.body;
    agiState.digitalTwin.syncLevel = syncLevel;
    agiState.digitalTwin.lastSync = new Date().toISOString();
    agiState.digitalTwin.consciousnessMatrix.push(`Sync_Event_${Date.now()}`);
    res.json({ 
      status: "TWIN_SYNCED", 
      syncLevel, 
      matrixSize: agiState.digitalTwin.consciousnessMatrix.length 
    });
  });

  app.get("/api/agi/performance-metrics", (req, res) => {
    res.json({
      cpuUsage: "12.4%",
      ramUsage: "1.2GB / 16GB",
      neuralLatency: "42ms",
      agiStability: "99.98%",
      activeLayers: 100,
      totalFeatures: 1000,
      uptime: "48h 12m",
      efficiencyScore: 98.5
    });
  });

  // API Key Validation Endpoint
  app.post("/api/validate-key", async (req, res) => {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ valid: false, message: "API Key is required" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      // Make a small test call to see if the key works
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "test",
      });
      
      if (response.text) {
        res.json({ valid: true, message: "API Key is valid" });
      } else {
        res.status(400).json({ valid: false, message: "Invalid response from API" });
      }
    } catch (error: any) {
      console.error("API Key Validation Error:", error.message);
      res.status(400).json({ valid: false, message: error.message || "Invalid API Key" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
