// api/upload.js

export const config = {
  api: { bodyParser: false }, // disable default body parsing
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // allow all origins (or replace * with your site URL for stricter security)
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, corsHeaders);
    res.end(JSON.stringify({ error: "Method not allowed. Use POST." }));
    return;
  }

  try {
    // Collect the raw request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Forward the request to Catbox
    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: {
        "Content-Type": req.headers["content-type"] || "application/octet-stream",
      },
      body: buffer,
    });

    const text = await response.text();

    // Return Catbox response
    if (!response.ok || !text.startsWith("http")) {
      res.writeHead(502, corsHeaders);
      res.end(JSON.stringify({ error: "Catbox upload failed", details: text }));
      return;
    }

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ url: text }));
  } catch (err) {
    console.error("Proxy error:", err);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: "Proxy failed", details: err.message }));
  }
}
