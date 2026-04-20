import express from "express";
import path from "path";
import helmet from "helmet";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const projectRoot = process.cwd();

const app = express();
const PORT = 3000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "ws://localhost:*", "ws://127.0.0.1:*", "wss://localhost:*", "wss://127.0.0.1:*"],
        scriptSrc: [
          "'self'",
          ...(process.env.NODE_ENV !== "production" ? ["'unsafe-inline'"] : [])
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://picsum.photos"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        // when deploying for a public site, consider restricting this to known domain
        frameAncestors: ["*"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, 
    frameguard: false,
  })
);

app.use(express.json({ limit: '10mb' }));

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    environment: process.env.VERCEL ? "vercel" : "server",
    nodeVersion: process.version
  });
});

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
        // Enforce approximate payload limits to catch issues before sending to AI
        if (base64Data.length > 4 * 1024 * 1024) {
          return res.status(413).json({ error: "Selection too large. Please try a smaller area." });
        }
        parts.push({
          inlineData: { mimeType, data: base64Data },
        });
      }

      const result = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
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
      let retryAfter = "";
      try {
        // Try to parse the error message which is often a JSON string from Google
        const parsedError = JSON.parse(errorMsg);
        const retryInfo = parsedError.error?.details?.find((d: any) => d["@type"]?.includes("RetryInfo"));
        if (retryInfo?.retryDelay) {
          retryAfter = retryInfo.retryDelay.replace('s', ''); // Clean '17s' to '17'
        }
      } catch (e) {
        // Not JSON, ignore and use default
      }

      const msg = retryAfter 
        ? `Your API key has reached its rate limit. Please wait about ${retryAfter} seconds before trying again.`
        : "Your API key has reached its rate limit. Please wait a moment before trying again.";

      return res.status(429).json({ error: msg, retryAfter });
    }

    res.status(500).json({ error: `AI Assistant Error: ${errorMsg || 'Connection reset by peer. Please retry.'}` });
  }
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    // Only import vite when needed to avoid production dependency issues
    const { createServer: createViteServer } = await import("vite");
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
}

// Start server for local/Cloud Run
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  setupVite().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  });
}

// Export for Vercel
export default app;
