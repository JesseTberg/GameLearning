import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const projectRoot = process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", "ws://localhost:*", "ws://127.0.0.1:*", "wss://localhost:*", "wss://127.0.0.1:*"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "blob:", "https://picsum.photos"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          frameAncestors: ["*"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false, 
      frameguard: false,
    })
  );

  app.use(express.json({ limit: '10mb' }));

  app.post("/api/ai-proxy", async (req, res) => {
    try {
      const { provider = 'gemini', prompt, model, mimeType, base64Data, config } = req.body;
      const clientKey = (req.headers['x-api-key'] as string)?.trim();
      
      if (!clientKey) {
        return res.status(401).json({ error: `No ${provider.toUpperCase()} API key provided.` });
      }

      if (provider === 'gemini') {
        if (!clientKey.startsWith("AIza")) {
          return res.status(400).json({ error: "Invalid Gemini key format. Should start with 'AIza'." });
        }

        const ai = new GoogleGenAI({ apiKey: clientKey });
        const parts: any[] = [{ text: prompt }];

        if (base64Data && mimeType) {
          parts.push({
            inlineData: { mimeType, data: base64Data },
          });
        }

        const result = await ai.models.generateContent({
          model: model || "gemini-2.0-flash",
          contents: [{ role: 'user', parts }],
          config,
        });

        return res.json({ text: result.text });
      }
      
      if (provider === 'openai') {
        return res.status(501).json({ error: "OpenAI integration is architected but currently in standby. Switch back to Gemini." });
      }

      res.status(400).json({ error: `Unsupported provider: ${provider}` });
    } catch (error: any) {
      console.error("[Gemini Proxy Error Details]:", {
        message: error.message,
        stack: error.stack,
        status: error.status,
        details: error.details,
        response: error.response?.data
      });

      const errorMsg = error.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        console.error("Proxy Error: Invalid client-provided API key.");
        return res.status(400).json({ 
          error: "The API key you provided was rejected by Google. Please verify your key at Google AI Studio." 
        });
      }
      
      if (errorMsg.includes("429") || errorMsg.includes("Too Many Requests")) {
        return res.status(429).json({ 
          error: "Your API key has reached its rate limit. Please wait a moment before trying again." 
        });
      }

      res.status(500).json({ error: `AI Assistant Error: ${errorMsg || 'Connection reset by peer. Please retry.'}` });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();