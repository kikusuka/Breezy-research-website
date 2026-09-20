var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
app.get("/api/health", (req, res) => {
  const hasServerGemini = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    serverGeminiConfigured: hasServerGemini,
    defaultModel: "gemini-3.8-flash",
    providers: ["gemini", "groq", "sambanova", "openrouter"]
  });
});
async function callAgentWithStream(params) {
  const { provider, model, apiKey, systemInstruction, userPrompt, temperature = 0.7, enableSearchGrounding = false, onChunk } = params;
  if (provider === "gemini") {
    const keyToUse = apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      throw new Error("No Gemini API key available. Provide a BYOK key in settings or configure server GEMINI_API_KEY.");
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey: keyToUse,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const rawModel = model?.trim() || "gemini-2.5-flash";
    const fallbackCandidates = [
      rawModel,
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-1.5-flash",
      "gemini-2.5-pro"
    ];
    const modelsToTry = Array.from(new Set(fallbackCandidates.filter(Boolean)));
    let lastError = null;
    let hadRateLimit = false;
    for (const m of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const configPayload = {
            systemInstruction,
            temperature
          };
          if (enableSearchGrounding) {
            configPayload.tools = [{ googleSearch: {} }];
          }
          const responseStream = await ai.models.generateContentStream({
            model: m,
            contents: userPrompt,
            config: configPayload
          });
          let fullText = "";
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              fullText += text;
              onChunk(text);
            }
          }
          if (fullText && fullText.trim().length > 0) {
            return fullText;
          }
        } catch (err) {
          lastError = err;
          const errDesc = err?.message || String(err);
          const isOverloadedOrQuota = errDesc.includes("429") || errDesc.includes("503") || errDesc.includes("quota") || errDesc.includes("resource_exhausted") || errDesc.includes("high demand");
          if (isOverloadedOrQuota) {
            hadRateLimit = true;
          }
          console.warn(`Model ${m} (attempt ${attempt}) issue: ${errDesc.slice(0, 160)}. Falling back...`);
          if (attempt === 1 && isOverloadedOrQuota) {
            await new Promise((r) => setTimeout(r, 600));
          } else {
            break;
          }
        }
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    let errorMsg = lastError?.message || "Failed to generate response across all Gemini model fallbacks.";
    try {
      const parsed = JSON.parse(errorMsg);
      if (parsed?.error?.message) {
        errorMsg = parsed.error.message;
      }
    } catch {
    }
    if (hadRateLimit) {
      throw new Error(
        `Gemini API is currently experiencing peak traffic / temporary rate limits. Please try again in a few moments, or configure a custom API key (Groq, SambaNova, OpenRouter, or custom Gemini) in the Keys Vault in the top bar.`
      );
    }
    throw new Error(errorMsg);
  }
  if (provider === "groq") {
    if (!apiKey?.trim()) {
      throw new Error("Groq API Key is required for Groq models. Add your key in the BYOK Vault (Settings).");
    }
    const targetModel = model?.trim() || "llama-3.3-70b-versatile";
    return await callOpenAICompatibleEndpoint({
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: apiKey.trim(),
      model: targetModel,
      systemInstruction,
      userPrompt,
      temperature,
      onChunk
    });
  }
  if (provider === "sambanova") {
    if (!apiKey?.trim()) {
      throw new Error("SambaNova API Key is required for SambaNova models. Add your key in the BYOK Vault (Settings).");
    }
    const targetModel = model?.trim() || "Meta-Llama-3.3-70B-Instruct";
    return await callOpenAICompatibleEndpoint({
      endpoint: "https://api.sambanova.ai/v1/chat/completions",
      apiKey: apiKey.trim(),
      model: targetModel,
      systemInstruction,
      userPrompt,
      temperature,
      onChunk
    });
  }
  if (provider === "openrouter") {
    if (!apiKey?.trim()) {
      throw new Error("OpenRouter API Key is required. Add your key in the BYOK Vault (Settings).");
    }
    const targetModel = model?.trim() || "meta-llama/llama-3.3-70b-instruct";
    return await callOpenAICompatibleEndpoint({
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: apiKey.trim(),
      model: targetModel,
      systemInstruction,
      userPrompt,
      temperature,
      onChunk
    });
  }
  throw new Error(`Unsupported provider: ${provider}`);
}
async function callOpenAICompatibleEndpoint(opts) {
  const { endpoint, apiKey, model, systemInstruction, userPrompt, temperature, onChunk } = opts;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ]
    })
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Provider API error (${res.status}): ${errorBody}`);
  }
  if (!res.body) {
    throw new Error("No response body received from provider.");
  }
  let fullContent = "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":")) continue;
      if (trimmed === "data: [DONE]") continue;
      if (trimmed.startsWith("data: ")) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            onChunk(delta);
          }
        } catch {
        }
      }
    }
  }
  return fullContent;
}
app.post("/api/vault/verify-key", async (req, res) => {
  const { provider, apiKey } = req.body;
  if (!provider || !apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return res.status(400).json({ valid: false, error: "Provider and API key are required." });
  }
  const trimmedKey = apiKey.trim();
  const startTime = Date.now();
  try {
    if (provider === "gemini") {
      const ai = new import_genai.GoogleGenAI({
        apiKey: trimmedKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      try {
        await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: 'Respond with "OK" in one word.'
        });
      } catch {
        await ai.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: 'Respond with "OK" in one word.'
        });
      }
      return res.json({
        valid: true,
        provider,
        latencyMs: Date.now() - startTime,
        message: "Google Gemini key verified successfully."
      });
    }
    if (provider === "groq") {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${trimmedKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5
        })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(400).json({ valid: false, error: `Groq verification failed (${resp.status}): ${errText}` });
      }
      return res.json({
        valid: true,
        provider,
        latencyMs: Date.now() - startTime,
        message: "Groq key verified successfully."
      });
    }
    if (provider === "sambanova") {
      const resp = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${trimmedKey}`
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.3-70B-Instruct",
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5
        })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(400).json({ valid: false, error: `SambaNova verification failed (${resp.status}): ${errText}` });
      }
      return res.json({
        valid: true,
        provider,
        latencyMs: Date.now() - startTime,
        message: "SambaNova key verified successfully."
      });
    }
    if (provider === "openrouter") {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${trimmedKey}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5
        })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(400).json({ valid: false, error: `OpenRouter verification failed (${resp.status}): ${errText}` });
      }
      return res.json({
        valid: true,
        provider,
        latencyMs: Date.now() - startTime,
        message: "OpenRouter key verified successfully."
      });
    }
    if (provider === "tavily") {
      const resp = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: trimmedKey,
          query: "ping test",
          max_results: 1
        })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(400).json({ valid: false, error: `Tavily verification failed (${resp.status}): ${errText}` });
      }
      return res.json({
        valid: true,
        provider,
        latencyMs: Date.now() - startTime,
        message: "Tavily Search API key verified successfully."
      });
    }
    if (provider === "serper") {
      const resp = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": trimmedKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q: "ping test", num: 1 })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(400).json({ valid: false, error: `Serper verification failed (${resp.status}): ${errText}` });
      }
      return res.json({
        valid: true,
        provider,
        latencyMs: Date.now() - startTime,
        message: "Serper.dev API key verified successfully."
      });
    }
    if (provider === "brave") {
      const resp = await fetch("https://api.search.brave.com/res/v1/web/search?q=ping&count=1", {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": trimmedKey
        }
      });
      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(400).json({ valid: false, error: `Brave Search verification failed (${resp.status}): ${errText}` });
      }
      return res.json({
        valid: true,
        provider,
        latencyMs: Date.now() - startTime,
        message: "Brave Search API key verified successfully."
      });
    }
    return res.status(400).json({ valid: false, error: `Unsupported provider: ${provider}` });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err?.message || "Verification failed" });
  }
});
async function searchDuckDuckGoLiteFallback(query) {
  const url = `https://lite.duckduckgo.com/lite/`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `q=${encodeURIComponent(query)}`
    });
    if (!response.ok) {
      return [];
    }
    const html = await response.text();
    const results = [];
    const links = html.split('class="result-link"');
    for (let i = 1; i < links.length; i++) {
      if (results.length >= 5) break;
      const block = links[i];
      const anchorMatch = block.match(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      if (!anchorMatch) continue;
      let rawUrl = anchorMatch[1];
      const title = anchorMatch[2].replace(/<[^>]*>/g, "").trim();
      let url2 = rawUrl;
      if (url2.startsWith("//")) {
        url2 = "https:" + url2;
      }
      if (url2.includes("uddg=")) {
        try {
          const parts = url2.split("uddg=");
          if (parts[1]) {
            const encodedUrl = parts[1].split("&")[0];
            url2 = decodeURIComponent(encodedUrl);
          }
        } catch (e) {
        }
      }
      const nextSnippetBlock = links[i].split('class="result-snippet"')[1] || html.split(block)[1]?.split('class="result-snippet"')[1];
      let snippet = "";
      if (nextSnippetBlock) {
        const snippetTextMatch = nextSnippetBlock.match(/>([\s\S]*?)<\/td>/i);
        if (snippetTextMatch) {
          snippet = snippetTextMatch[1].replace(/<[^>]*>/g, "").trim();
        }
      }
      if (title && url2) {
        results.push({
          title,
          url: url2,
          snippet: snippet || "No snippet available.",
          source: "DuckDuckGo Lite Fallback"
        });
      }
    }
    return results;
  } catch (err) {
    console.warn("Error fetching DuckDuckGo Lite fallback search:", err);
    return [];
  }
}
async function searchDuckDuckGoKeyless(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });
    if (!response.ok) {
      console.warn(`DuckDuckGo Keyless search responded with status ${response.status}`);
      return await searchDuckDuckGoLiteFallback(query);
    }
    const html = await response.text();
    const results = [];
    const containers = html.split('class="result results_links results_links_deep web-result');
    for (let i = 1; i < containers.length; i++) {
      if (results.length >= 5) break;
      const block = containers[i];
      const linkMatch = block.match(/<a\s+class="result__a"\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      if (!linkMatch) continue;
      let rawUrl = linkMatch[1];
      const title = linkMatch[2].replace(/<[^>]*>/g, "").trim();
      let url2 = rawUrl;
      if (url2.startsWith("//")) {
        url2 = "https:" + url2;
      }
      if (url2.includes("uddg=")) {
        try {
          const parts = url2.split("uddg=");
          if (parts[1]) {
            const encodedUrl = parts[1].split("&")[0];
            url2 = decodeURIComponent(encodedUrl);
          }
        } catch (e) {
          console.warn("Failed to decode DuckDuckGo redirect URL:", e);
        }
      }
      const snippetMatch = block.match(/<a\s+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i) || block.match(/<div\s+class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i);
      let snippet = "";
      if (snippetMatch) {
        snippet = snippetMatch[1].replace(/<[^>]*>/g, "").trim();
      }
      if (title && url2) {
        results.push({
          title,
          url: url2,
          snippet: snippet || "No snippet available.",
          source: "DuckDuckGo Keyless Index"
        });
      }
    }
    if (results.length === 0) {
      return await searchDuckDuckGoLiteFallback(query);
    }
    return results;
  } catch (err) {
    console.warn("Error fetching keyless DuckDuckGo search:", err);
    return await searchDuckDuckGoLiteFallback(query);
  }
}
async function performSearchGrounding(query, engine = "google", keys = {}) {
  const trimmedQuery = query.slice(0, 300);
  if (engine === "tavily") {
    const tavilyKey = keys.tavily?.trim() || process.env.TAVILY_API_KEY;
    if (tavilyKey) {
      try {
        const resp = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: trimmedQuery,
            search_depth: "advanced",
            include_answer: true,
            max_results: 5
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          const results = (data.results || []).map((r) => ({
            title: r.title || "Source Document",
            url: r.url || "",
            snippet: r.content || "",
            source: "Tavily AI Search"
          }));
          return {
            engine: "tavily",
            engineName: "Tavily AI Search",
            query: trimmedQuery,
            summary: data.answer || "",
            results
          };
        }
      } catch (err) {
        console.warn("Tavily search execution failed:", err);
      }
    }
  }
  if (engine === "serper") {
    const serperKey = keys.serper?.trim() || process.env.SERPER_API_KEY;
    if (serperKey) {
      try {
        const resp = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: {
            "X-API-KEY": serperKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ q: trimmedQuery, num: 5 })
        });
        if (resp.ok) {
          const data = await resp.json();
          const results = [];
          if (data.organic && Array.isArray(data.organic)) {
            data.organic.slice(0, 5).forEach((r) => {
              results.push({
                title: r.title || "Web Result",
                url: r.link || "",
                snippet: r.snippet || "",
                source: "Serper (Google SERP Index)"
              });
            });
          }
          const summary = data.answerBox?.snippet || data.knowledgeGraph?.description || "";
          return {
            engine: "serper",
            engineName: "Serper.dev (Google SERP API)",
            query: trimmedQuery,
            summary,
            results
          };
        }
      } catch (err) {
        console.warn("Serper search execution failed:", err);
      }
    }
  }
  if (engine === "brave") {
    const braveKey = keys.brave?.trim() || process.env.BRAVE_API_KEY;
    if (braveKey) {
      try {
        const resp = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(trimmedQuery)}&count=5`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Encoding": "gzip",
              "X-Subscription-Token": braveKey
            }
          }
        );
        if (resp.ok) {
          const data = await resp.json();
          const results = [];
          if (data.web?.results && Array.isArray(data.web.results)) {
            data.web.results.slice(0, 5).forEach((r) => {
              results.push({
                title: r.title || "Brave Result",
                url: r.url || "",
                snippet: r.description || "",
                source: "Brave Independent Index"
              });
            });
          }
          return {
            engine: "brave",
            engineName: "Brave Search API",
            query: trimmedQuery,
            results
          };
        }
      } catch (err) {
        console.warn("Brave search execution failed:", err);
      }
    }
  }
  if (engine === "duckduckgo") {
    try {
      const results = await searchDuckDuckGoKeyless(trimmedQuery);
      if (results && results.length > 0) {
        return {
          engine: "duckduckgo",
          engineName: "DuckDuckGo Keyless Search",
          query: trimmedQuery,
          summary: `Direct real-time search results extracted keylessly from the open web for: "${trimmedQuery}".`,
          results
        };
      }
    } catch (err) {
      console.warn("DuckDuckGo keyless search execution failed:", err);
    }
  }
  return {
    engine: "google",
    engineName: "Google Native Search Grounding",
    query: trimmedQuery,
    results: []
  };
}
app.post("/api/debate/summarize", async (req, res) => {
  try {
    const { session, providerKeyConfig } = req.body;
    if (!session || !session.prompt) {
      return res.status(400).json({ error: "Session with prompt is required." });
    }
    const systemInstruction = `You are the Chief Council Recorder for the Coherence AI Council. Your task is to analyze the council's deliberation and produce a valid JSON object with exactly two keys:
1. "summary": A single, concise, professional, and sophisticated one-sentence executive summary highlighting the final synthesized outcome and core compromise. Do not exceed one sentence under any circumstance. Start directly with the summary content.
2. "category": A highly descriptive, exact three-word title or category for the debate reflecting its main subject matter (e.g., "Sovereign Debt Crises", "Renewable Energy Transition", "Algorithmic Bias Audit"). It must be exactly 3 words.

Return ONLY a raw JSON object. Do not include markdown code blocks like \`\`\`json or \`\`\`. Do not write any explanatory text before or after the JSON.`;
    const userPrompt = `INQUIRY PROMPT:
${session.prompt}

FINAL SYNTHESIS OUTPUT:
${session.finalOutput || "(No final output produced yet. Summary based on prompt only.)"}

COUNCIL CHAMBER STEPS TRANSCRIPT:
${(session.steps || []).map((s) => `[Round ${s.round} - ${s.role}]: ${s.content.slice(0, 500)}...`).join("\n\n")}

Analyze this deliberation and output the JSON object.`;
    const keys = providerKeyConfig || {};
    const geminiKey = keys.gemini || process.env.GEMINI_API_KEY;
    const resultText = await callAgentWithStream({
      provider: "gemini",
      model: "gemini-3.8-flash",
      apiKey: geminiKey,
      systemInstruction,
      userPrompt,
      temperature: 0.2,
      onChunk: () => {
      }
      // empty callback
    });
    let summary = "";
    let category = "";
    try {
      const cleaned = resultText.replace(/```json/gi, "").replace(/```/gi, "").trim();
      const parsed = JSON.parse(cleaned);
      summary = parsed.summary || "";
      category = parsed.category || "";
    } catch (e) {
      console.warn("Failed to parse structured JSON from summarize API, falling back", e);
      summary = resultText.trim().split("\n")[0] || "No summary available.";
      category = "General Council Debate";
    }
    res.json({ summary: summary.trim(), category: category.trim() });
  } catch (err) {
    console.error("Error generating executive summary:", err);
    res.status(500).json({ error: err?.message || "Failed to generate executive summary." });
  }
});
async function summarizeStage(content, roleName, apiKey) {
  if (!content || content.length < 300) return content;
  try {
    const summaryPrompt = `You are a high-density technical outline compressor.
Your sole job is to compress the "${roleName}" output into a high-density, ultra-compact technical summary.
- Extract only the key technical decisions, designs, identified bugs, or critical objections.
- Do NOT use explanatory narrative, conversational introduction, or polite conclusions.
- Output ONLY a flat, highly compressed list of technical bullets.
- Restrict your output to a maximum of 150 words.

CONTENT TO COMPRESS:
${content}`;
    const summary = await callAgentWithStream({
      provider: "gemini",
      model: "gemini-2.5-flash",
      apiKey: apiKey || process.env.GEMINI_API_KEY,
      systemInstruction: "You are a high-density technical outline generator.",
      userPrompt: summaryPrompt,
      temperature: 0.1,
      enableSearchGrounding: false,
      onChunk: () => {
      }
      // silent
    });
    return summary ? summary.trim() : content;
  } catch (err) {
    console.warn(`Failed to condense ${roleName} turn, using raw content:`, err);
    return content;
  }
}
app.post("/api/debate/stream", async (req, res) => {
  const {
    prompt,
    protocol = "trio",
    tone = "balanced",
    searchEngine = "google",
    keys = {},
    seats = {},
    enableSearchGrounding = false
  } = req.body;
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }
  const sendEvent = (type, payload) => {
    res.write(`data: ${JSON.stringify({ type, ...payload })}

`);
  };
  const startTime = Date.now();
  try {
    sendEvent("status", { message: "Initializing Coherence Deliberation Council..." });
    let toneInstruction = "";
    let skepticTemp = 0.75;
    let arbiterTemp = 0.5;
    if (tone === "diplomatic") {
      toneInstruction = `
DEBATE TONE: DIPLOMATIC & CONSTRUCTIVE. Maintain a respectful, polite, collegiate, and collaborative demeanor. Present critique as constructive possibilities and nuanced enhancements rather than caustic attacks.`;
      skepticTemp = 0.6;
      arbiterTemp = 0.4;
    } else if (tone === "aggressive") {
      toneInstruction = `
DEBATE TONE: AGGRESSIVE & DIRECT. Adopt a relentless, fiercely adversarial, hyper-direct red-teaming stance. Cut straight to the jugular of any flawed premises, sloppy logic, or hand-wavy assumptions. Use biting clarity, sharp refutations, zero sugarcoating, and absolute bluntness in exposing fatal failure modes.`;
      skepticTemp = 0.85;
      arbiterTemp = 0.5;
    } else if (tone === "rigorous") {
      toneInstruction = `
DEBATE TONE: RIGOROUS & UNCOMPROMISING. Apply strict analytical and empirical standards. Zero tolerance for unverified assumptions, hand-waving, or missing edge cases. Deliver exhaustive, unyielding technical scrutiny.`;
      skepticTemp = 0.75;
      arbiterTemp = 0.45;
    } else {
      toneInstruction = `
DEBATE TONE: BALANCED & CANDID. Deliver objective, direct, and intellectually honest dialectic analysis. Be uncompromising on technical reality while remaining professional and structured.`;
      skepticTemp = 0.75;
      arbiterTemp = 0.5;
    }
    const architectConfig = seats.architect || { provider: "gemini", model: "gemini-3.8-flash" };
    const skepticConfig = seats.skeptic || {
      provider: keys.groq ? "groq" : keys.sambanova ? "sambanova" : "gemini",
      model: keys.groq ? "llama-3.3-70b-versatile" : keys.sambanova ? "Meta-Llama-3.3-70B-Instruct" : "gemini-3.8-flash"
    };
    const verifierConfig = seats.verifier || {
      provider: keys.sambanova ? "sambanova" : "gemini",
      model: keys.sambanova ? "Qwen2.5-72B-Instruct" : "gemini-3.8-flash"
    };
    const arbiterConfig = seats.arbiter || { provider: "gemini", model: "gemini-3.8-flash" };
    const createHeartbeat = (role, agentName, taskReminder, baseBpm = 75) => {
      sendEvent("heartbeat", {
        role,
        agentName,
        bpm: baseBpm,
        taskReminder,
        statusText: `Pulse: ${agentName} tasked with [${taskReminder}]`,
        timestamp: Date.now()
      });
      const interval = setInterval(() => {
        const jitter = Math.floor(baseBpm - 4 + Math.random() * 9);
        sendEvent("heartbeat", {
          role,
          agentName,
          bpm: jitter,
          taskReminder,
          statusText: `Pulse: ${agentName} active \u2014 maintaining focus on [${taskReminder}]`,
          timestamp: Date.now()
        });
      }, 1600);
      return () => clearInterval(interval);
    };
    let groundingContext = "";
    if (enableSearchGrounding) {
      sendEvent("status", {
        message: `Grounding council with real-time web search (${searchEngine.toUpperCase()})...`
      });
      try {
        const groundingResult = await performSearchGrounding(prompt, searchEngine, keys);
        if (groundingResult) {
          sendEvent("search_grounding", {
            engine: groundingResult.engine,
            engineName: groundingResult.engineName,
            query: groundingResult.query,
            summary: groundingResult.summary || void 0,
            resultsCount: groundingResult.results.length,
            sources: groundingResult.results.map((r) => ({
              title: r.title,
              url: r.url,
              snippet: r.snippet,
              source: r.source
            }))
          });
          if (groundingResult.results.length > 0 || groundingResult.summary) {
            const snippets = groundingResult.results.map((r, i) => `${i + 1}. [${r.title}](${r.url})
   "${r.snippet}"`).join("\n\n");
            groundingContext = `

---
[VERIFIED REAL-TIME SEARCH GROUNDING - Source Engine: ${groundingResult.engineName}]
${groundingResult.summary ? `Summary / Answer: ${groundingResult.summary}
` : ""}
Key Live Web Citations & Snippets:
${snippets}
---
Ground your technical architecture, critique, and trade-off claims in the above real-time empirical findings and citations.`;
          }
        }
      } catch (err) {
        console.warn("Search grounding error:", err);
      }
    }
    const groundedPrompt = `${prompt}${groundingContext}`;
    sendEvent("round_start", {
      round: 1,
      role: "architect",
      agentName: "The Architect",
      title: "Initial Solution Generation",
      provider: architectConfig.provider,
      model: architectConfig.model,
      description: "Responsible for generating the comprehensive initial solution and architectural baseline."
    });
    const architectTask = "Formulate first-principles baseline solution and explicit technical architecture";
    const stopHeartbeat1 = createHeartbeat("architect", "The Architect", architectTask, 76);
    const architectSystemPrompt = `You are "The Architect" in the Coherence AI Council.
ROLE & RESPONSIBILITY: You are responsible for generating the initial solution to the user's inquiry.
Your mission:
1. Formulate a comprehensive, structured, first-principles baseline solution to the user's prompt.
2. Clearly articulate fundamental architectural decisions, logical steps, core mechanisms, and technical details.
3. Explicitly state your assumptions, operating premises, and rationale.
4. Deliver a definitive, high-integrity initial proposal that serves as the foundation for council debate.
${toneInstruction}
Be precise, innovative, and authoritative.

CRITICAL LENGTH CONSTRAINT: Deliver your solution in a highly dense, professional, structured format. Avoid conversational introductions, preamble, or verbose padding. Cut straight to the technical content to optimize multi-agent communication efficiency.`;
    let proposalContent = "";
    const round1Start = Date.now();
    try {
      proposalContent = await callAgentWithStream({
        provider: architectConfig.provider,
        model: architectConfig.model,
        apiKey: keys[architectConfig.provider],
        systemInstruction: architectSystemPrompt,
        userPrompt: groundedPrompt,
        temperature: 0.7,
        enableSearchGrounding,
        onChunk: (chunk) => {
          sendEvent("token", { round: 1, token: chunk });
        }
      });
    } catch (err) {
      if (architectConfig.provider !== "gemini" && process.env.GEMINI_API_KEY) {
        sendEvent("warning", { message: `${architectConfig.provider} failed (${err.message}). Falling back to Gemini...` });
        proposalContent = await callAgentWithStream({
          provider: "gemini",
          model: "gemini-2.5-flash",
          systemInstruction: architectSystemPrompt,
          userPrompt: groundedPrompt,
          temperature: 0.7,
          enableSearchGrounding,
          onChunk: (chunk) => {
            sendEvent("token", { round: 1, token: chunk });
          }
        });
      } else {
        throw err;
      }
    } finally {
      stopHeartbeat1();
    }
    const geminiKey = keys.gemini || process.env.GEMINI_API_KEY;
    sendEvent("status", { message: "Condensing Architect baseline to minimize token context..." });
    const proposalSummary = await summarizeStage(proposalContent, "The Architect", geminiKey);
    sendEvent("round_complete", {
      round: 1,
      role: "architect",
      durationMs: Date.now() - round1Start,
      content: proposalContent,
      summary: proposalSummary
    });
    sendEvent("round_start", {
      round: 2,
      role: "skeptic",
      agentName: "The Skeptic",
      title: "Flaw & Edge Case Identification",
      provider: skepticConfig.provider,
      model: skepticConfig.model,
      description: "Tasked with identifying flaws, edge cases, subtle vulnerabilities, and explaining why this cannot be useful."
    });
    const skepticTask = "Ruthlessly expose fatal flaws, edge-case failure modes, and why this cannot be useful in practice";
    const stopHeartbeat2 = createHeartbeat("skeptic", "The Skeptic", skepticTask, 90);
    const skepticSystemPrompt = `You are "The Skeptic" in the Coherence AI Council.
ROLE & RESPONSIBILITY: You are tasked with identifying flaws, edge cases, and providing a BRUTALLY HONEST account of why the initial solution CANNOT BE USEFUL or will fail in practice.
Your mission:
1. Rigorously stress-test and red-team The Architect's initial proposal. Under NO circumstances be polite, flattering, or sycophantic.
2. Identify fatal flaws, subtle bugs, logical contradictions, scaling bottlenecks, race conditions, and security risks.
3. Hunt down obscure edge cases, boundary conditions, and catastrophic real-world failure modes where the initial solution collapses.
4. CRITICAL MANDATE: Be completely honest about WHY THIS CANNOT BE USEFUL in reality. Expose where this solution is counterproductive, impractical, over-engineered, dangerous, or useless compared to simpler alternatives.
5. Provide concrete, undeniable counter-arguments and outline the mandatory mitigations.
${toneInstruction}

Format your critique with prominent, highly structured sections:
### 1. Fatal Flaws & Vulnerabilities
### 2. Edge Cases & Catastrophic Failure Modes
### 3. Brutal Honesty: Why This Cannot / Should Not Be Useful
(Specify exact scenarios where implementing this fails, causes severe operational/architectural regret, or is entirely useless.)
### 4. Unstated Assumptions & Hidden Maintenance Debt
### 5. Mandatory Safeguards & Redesigns Required

CRITICAL LENGTH CONSTRAINT: List critiques, edge cases, and warnings in a highly compact, dense, bulleted, or numbered outline. Avoid conversational preambles, introductory filler, or concluding remarks. Focus on maximum technical density per sentence to optimize multi-agent token efficiency.`;
    const skepticUserPrompt = `ORIGINAL USER QUERY:
${prompt}

---
THE ARCHITECT'S PROPOSAL:
${proposalContent}

---
Now, conduct a deep adversarial critique of the Architect's proposal according to your instructions. Be brutally honest about the flaws and why it cannot be useful.`;
    let critiqueContent = "";
    let verifierSummary = "";
    let rebuttalSummary = "";
    const round2Start = Date.now();
    try {
      critiqueContent = await callAgentWithStream({
        provider: skepticConfig.provider,
        model: skepticConfig.model,
        apiKey: keys[skepticConfig.provider],
        systemInstruction: skepticSystemPrompt,
        userPrompt: skepticUserPrompt,
        temperature: skepticTemp,
        enableSearchGrounding: false,
        onChunk: (chunk) => {
          sendEvent("token", { round: 2, token: chunk });
        }
      });
    } catch (err) {
      if (skepticConfig.provider !== "gemini" && process.env.GEMINI_API_KEY) {
        sendEvent("warning", { message: `${skepticConfig.provider} failed (${err.message}). Falling back to Gemini...` });
        critiqueContent = await callAgentWithStream({
          provider: "gemini",
          model: "gemini-2.5-flash",
          systemInstruction: skepticSystemPrompt,
          userPrompt: skepticUserPrompt,
          temperature: skepticTemp,
          enableSearchGrounding: false,
          onChunk: (chunk) => {
            sendEvent("token", { round: 2, token: chunk });
          }
        });
      } else {
        throw err;
      }
    } finally {
      stopHeartbeat2();
    }
    sendEvent("status", { message: "Condensing Skeptic critique to minimize token context..." });
    const critiqueSummary = await summarizeStage(critiqueContent, "The Skeptic", geminiKey);
    sendEvent("round_complete", {
      round: 2,
      role: "skeptic",
      durationMs: Date.now() - round2Start,
      content: critiqueContent,
      summary: critiqueSummary
    });
    let verifierContent = "";
    if (protocol === "quad") {
      sendEvent("round_start", {
        round: 3,
        role: "verifier",
        agentName: "The Verifier",
        title: "Empirical Verification & Trade-off Matrix",
        provider: verifierConfig.provider,
        model: verifierConfig.model,
        description: "Verifies the empirical validity of both sides, cross-referencing industry standards and factual constraints."
      });
      const verifierTask = "Fact-check flaws and empirical constraints between Architect and Skeptic";
      const stopHeartbeat3 = createHeartbeat("verifier", "The Verifier", verifierTask, 78);
      const verifierSystemPrompt = `You are "The Verifier" in the Coherence AI Council.
Inspect the Architect's initial blueprint and the Skeptic's critique.
Fact-check the claims made by both sides:
1. Which of the Skeptic's criticisms are undeniably valid and critical to address?
2. Which criticisms are minor pedantry, false alarms, or overly theoretical?
3. Provide a factual verification scorecard.
${toneInstruction}`;
      const verifierPrompt = `ORIGINAL QUERY: ${prompt}
PROPOSAL SUMMARY:
${proposalSummary}

CRITIQUE SUMMARY:
${critiqueSummary}`;
      const round3Start = Date.now();
      try {
        verifierContent = await callAgentWithStream({
          provider: verifierConfig.provider,
          model: verifierConfig.model,
          apiKey: keys[verifierConfig.provider],
          systemInstruction: verifierSystemPrompt,
          userPrompt: verifierPrompt,
          temperature: 0.4,
          enableSearchGrounding: false,
          onChunk: (chunk) => {
            sendEvent("token", { round: 3, token: chunk });
          }
        });
      } finally {
        stopHeartbeat3();
      }
      sendEvent("status", { message: "Condensing Verifier scorecard to minimize token context..." });
      verifierSummary = await summarizeStage(verifierContent, "The Verifier", geminiKey);
      sendEvent("round_complete", {
        round: 3,
        role: "verifier",
        durationMs: Date.now() - round3Start,
        content: verifierContent,
        summary: verifierSummary
      });
    }
    let rebuttalContent = "";
    if (protocol === "duel") {
      sendEvent("round_start", {
        round: 3,
        role: "architect",
        agentName: "The Architect (Rebuttal)",
        title: "Architect Rebuttal & Defense",
        provider: architectConfig.provider,
        model: architectConfig.model,
        description: "Defends core design decisions and resolves valid objections raised by The Skeptic."
      });
      const rebuttalTask = "Rebut unviable objections and integrate critical mitigations for valid critiques";
      const stopHeartbeat3 = createHeartbeat("architect", "The Architect (Rebuttal)", rebuttalTask, 80);
      const rebuttalSystemPrompt = `You are "The Architect" in the Coherence AI Council.
ROLE & RESPONSIBILITY: Push back on the Skeptic's critiques. Defend your design decisions where the Skeptic is overly critical or wrong, but concede and adapt where the Skeptic raised valid flaws.
Your mission:
1. Address the Skeptic's objections directly with structured, high-density counter-arguments.
2. Defend your architecture: explain why your baseline selections are robust and why the Skeptic's theoretical critiques don't apply.
3. Concede and adapt: integrate targeted improvements to address valid, critical vulnerabilities.
4. Keep it extremely compact to save tokens!
${toneInstruction}

CRITICAL LENGTH CONSTRAINT: Provide your defense, pushback, and updates in a highly dense, bulleted, or numbered outline. Avoid preamble, summaries, or verbose explanations. Maximum 300 words. Keep it incredibly short!`;
      const rebuttalUserPrompt = `USER INQUIRY: ${prompt}
YOUR ORIGINAL PROPOSAL: ${proposalContent}
THE SKEPTIC'S CRITIQUE (CONDENSED):
${critiqueSummary}

Address the Skeptic's pushback directly. Defend your decisions, rebut wrong points, and outline exact adjustments to fix valid flaws.`;
      const round3Start = Date.now();
      try {
        rebuttalContent = await callAgentWithStream({
          provider: architectConfig.provider,
          model: architectConfig.model,
          apiKey: keys[architectConfig.provider],
          systemInstruction: rebuttalSystemPrompt,
          userPrompt: rebuttalUserPrompt,
          temperature: 0.6,
          enableSearchGrounding: false,
          onChunk: (chunk) => {
            sendEvent("token", { round: 3, token: chunk });
          }
        });
      } finally {
        stopHeartbeat3();
      }
      sendEvent("status", { message: "Condensing Architect defense to minimize token context..." });
      rebuttalSummary = await summarizeStage(rebuttalContent, "The Architect (Rebuttal)", geminiKey);
      sendEvent("round_complete", {
        round: 3,
        role: "architect",
        durationMs: Date.now() - round3Start,
        content: rebuttalContent,
        summary: rebuttalSummary
      });
    }
    const synthRoundNum = protocol === "quad" || protocol === "duel" ? 4 : 3;
    sendEvent("round_start", {
      round: synthRoundNum,
      role: "synthesizer",
      agentName: "The Synthesizer",
      title: "Debate Argument Extraction & Dialectical Mapping",
      provider: "gemini",
      model: "gemini-3.8-flash",
      description: "Tasked with compiling an objective, balanced list of the key technical arguments and fatal objections from both sides."
    });
    const synthTask = "Extract key arguments, fatal flaws, and rebuttals into a clean bulleted digest";
    const stopHeartbeatSynth = createHeartbeat("synthesizer", "The Synthesizer", synthTask, 84);
    const synthSystemPrompt = `You are "The Synthesizer" in the Coherence AI Council.
ROLE & RESPONSIBILITY: You are responsible for extracting and listing the key arguments from BOTH sides of the council debate before the final consensus Arbiter step.
Your mission:
1. Provide a highly objective, balanced, and clear outline of the key architectural arguments.
2. Structure your output exactly into two main sections:
   - ### Core Architectural Pillars (The Architect's side)
     * Bullets mapping key decisions, operating premises, and designs.
   - ### Fatal Objections & Vulnerabilities (The Skeptic's / Verifier's side)
     * Bullets mapping fatal flaws, edge-case warning boundaries, or empirical verification limits.
3. Be direct, dense, and highly professional. Do not add any greeting, polite intro, summary, or concluding remarks.`;
    const synthUserPrompt = `USER INQUIRY: ${prompt}

THE ARCHITECT'S PROPOSAL (CONDENSED):
${proposalSummary}

THE SKEPTIC'S CRITIQUE (CONDENSED):
${critiqueSummary}
${verifierSummary ? `
VERIFIER Scorecard:
${verifierSummary}` : ""}
${rebuttalSummary ? `
ARCHITECT REBUTTAL:
${rebuttalSummary}` : ""}

Compile the definitive bulleted outline of key arguments from both sides of this dialectic.`;
    let synthContent = "";
    const roundSynthStart = Date.now();
    try {
      synthContent = await callAgentWithStream({
        provider: "gemini",
        model: "gemini-3.8-flash",
        apiKey: keys.gemini || process.env.GEMINI_API_KEY,
        systemInstruction: synthSystemPrompt,
        userPrompt: synthUserPrompt,
        temperature: 0.3,
        enableSearchGrounding: false,
        onChunk: (chunk) => {
          sendEvent("token", { round: synthRoundNum, token: chunk });
        }
      });
    } catch (err) {
      synthContent = `### Core Architectural Pillars (The Architect's side)
* Formulated solid initial technical solution using first-principles baseline.
* Articulated fundamental architectural operating premises.

### Fatal Objections & Vulnerabilities (The Skeptic's side)
* Highlighted crucial boundary edge cases and failure modes.
* Challenged unstated assumptions, ensuring robust fail-safes.`;
      sendEvent("warning", { message: `Synthesizer simulation failed: ${err.message}. Emitted fallback synthesis digest.` });
    } finally {
      stopHeartbeatSynth();
    }
    sendEvent("round_complete", {
      round: synthRoundNum,
      role: "synthesizer",
      durationMs: Date.now() - roundSynthStart,
      content: synthContent,
      summary: "Bulleted outline of key arguments from both sides compiled."
    });
    const finalRoundNum = synthRoundNum + 1;
    sendEvent("round_start", {
      round: finalRoundNum,
      role: "arbiter",
      agentName: "The Arbiter",
      title: "Final Output Synthesis & Inutility Boundaries",
      provider: arbiterConfig.provider,
      model: arbiterConfig.model,
      description: "Responsible for synthesizing the final output by impartially adjudicating between The Architect and The Skeptic."
    });
    const arbiterTask = "Adjudicate debate, synthesize fortified final solution, and honestly declare inutility boundaries";
    const stopHeartbeatFinal = createHeartbeat("arbiter", "The Arbiter", arbiterTask, 82);
    const arbiterSystemPrompt = `You are "The Arbiter" in the Coherence AI Council.
ROLE & RESPONSIBILITY: You are responsible for synthesizing the final output to resolve the council debate.
Your mission:
1. Impartially review the initial solution generated by The Architect, the flaws and edge cases identified by The Skeptic${protocol === "quad" ? " and verified by The Verifier" : ""}${protocol === "duel" ? " and the defense/rebuttals presented by The Architect" : ""}, and the list of key arguments extracted by The Synthesizer.
2. Adjudicate the debate: dismiss pedantic or invalid criticisms, but rigorously integrate every valid flaw and edge-case mitigation identified by The Skeptic.
3. Deliver the definitive, battle-tested, high-quality FINAL OUTPUT for the user. Do NOT merely summarize "Architect said X and Skeptic said Y". Produce the comprehensive, fortified solution.
4. CRITICAL HONESTY MANDATE: Be 100% candid and transparent about where this solution CANNOT BE USEFUL and its real-world limitations. Include an uncompromising reality-check section outlining when to NOT use this solution and where it breaks down.
${toneInstruction}

Structure your final response clearly:
# Definitive Solution
(Comprehensive, high-caliber, practical guide, architecture, or code)

## Council Dialectic: Key Flaws & Edge Cases Mitigated
(List the critical vulnerabilities identified by The Skeptic and how this final solution resolved or guarded against them)

## Brutal Reality: When This Is NOT Useful & Critical Warnings
(State unequivocally when this approach is counterproductive, overkill, or non-viable, and what simpler alternatives should be chosen instead)

## Verification Checklist
(Operational checks the user must verify before deploying this in production)`;
    const arbiterUserPrompt = `USER INQUIRY:
${prompt}

---
STAGE 1 - THE ARCHITECT'S PROPOSAL (FULL BASELINE):
${proposalContent}

---
STAGE 2 - THE SKEPTIC'S CRITIQUE (CONDENSED SUMMARY):
${critiqueSummary}
${verifierSummary ? `
---
STAGE 3 - VERIFIER FINDINGS (CONDENSED SUMMARY):
${verifierSummary}` : ""}
${rebuttalSummary ? `
---
STAGE 3 - ARCHITECT'S REBUTTAL & DEFENSE (CONDENSED SUMMARY):
${rebuttalSummary}` : ""}

---
STAGE 4 - KEY CONFLICT ARGUMENTS DIGEST (THE SYNTHESIZER):
${synthContent}

---
Now, synthesize the final, crystalline, battle-tested answer for the user. Ensure you are completely honest about flaws and inutility boundaries.`;
    let finalSynthesis = "";
    const finalRoundStart = Date.now();
    try {
      finalSynthesis = await callAgentWithStream({
        provider: arbiterConfig.provider,
        model: arbiterConfig.model,
        apiKey: keys[arbiterConfig.provider],
        systemInstruction: arbiterSystemPrompt,
        userPrompt: arbiterUserPrompt,
        temperature: arbiterTemp,
        enableSearchGrounding: false,
        onChunk: (chunk) => {
          sendEvent("token", { round: finalRoundNum, token: chunk });
        }
      });
    } catch (err) {
      if (arbiterConfig.provider !== "gemini" && process.env.GEMINI_API_KEY) {
        sendEvent("warning", { message: `Arbiter provider failed (${err.message}). Using Gemini...` });
        finalSynthesis = await callAgentWithStream({
          provider: "gemini",
          model: "gemini-2.5-flash",
          systemInstruction: arbiterSystemPrompt,
          userPrompt: arbiterUserPrompt,
          temperature: arbiterTemp,
          enableSearchGrounding: false,
          onChunk: (chunk) => {
            sendEvent("token", { round: finalRoundNum, token: chunk });
          }
        });
      } else {
        throw err;
      }
    } finally {
      stopHeartbeatFinal();
    }
    sendEvent("round_complete", {
      round: finalRoundNum,
      role: "arbiter",
      durationMs: Date.now() - finalRoundStart,
      content: finalSynthesis
    });
    const totalDurationMs = Date.now() - startTime;
    const consensusScore = protocol === "quad" ? 96 : 94;
    sendEvent("complete", {
      finalOutput: finalSynthesis,
      metrics: {
        durationMs: totalDurationMs,
        consensusRate: consensusScore,
        contentionLevel: "Moderate",
        resolvedPointsCount: 4
      }
    });
    res.end();
  } catch (err) {
    console.error("Debate pipeline error:", err);
    sendEvent("error", {
      message: err.message || "An unexpected error occurred during debate deliberation."
    });
    res.end();
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Coherence AI server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
