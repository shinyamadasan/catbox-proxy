const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // or your site URL for stricter security
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
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
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: { "Content-Type": req.headers["content-type"] || "application/octet-stream" },
      body: buffer,
    });

    const text = await response.text();

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ url: text }));
  } catch (err) {
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: "Proxy failed", details: err.message }));
  }
}
