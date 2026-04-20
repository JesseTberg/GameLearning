import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { provider = 'gemini', prompt, model, mimeType, base64Data, config } = req.body;
    const clientKey = (req.headers['x-api-key'] || req.headers['X-API-KEY'])?.trim();
    
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
        // Enforce Vercel payload limits check (approximate)
        if (base64Data.length > 4 * 1024 * 1024) {
          return res.status(413).json({ error: "Selection too large. Please try a smaller area." });
        }
        parts.push({
          inlineData: { mimeType, data: base64Data },
        });
      }

      const result = await ai.models.generateContent({
        model: model || "gemini-2.0-flash",
        contents: [{ role: 'user', parts }],
        config,
      });

      return res.status(200).json({ text: result.text });
    }
    
    return res.status(400).json({ error: `Unsupported provider: ${provider}` });
  } catch (error: any) {
    console.error("[Vercel Proxy Error]:", error);
    
    const errorMsg = error.message || "";
    
    // Handle 429
    if (errorMsg.includes("429") || errorMsg.includes("Too Many Requests")) {
       let retryAfter = "";
       try {
         const parsedError = JSON.parse(errorMsg);
         const retryInfo = parsedError.error?.details?.find((d: any) => d["@type"]?.includes("RetryInfo"));
         if (retryInfo?.retryDelay) retryAfter = retryInfo.retryDelay.replace('s', '');
       } catch (e) {}

       return res.status(429).json({ 
         error: retryAfter ? `Rate limit reached. Retry in ${retryAfter}s.` : "Rate limit reached.",
         retryAfter 
       });
    }

    return res.status(500).json({ error: `AI Error: ${errorMsg || 'Internal Server Error'}` });
  }
}
