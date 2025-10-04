// api/upload.js

export const config = {
  api: { bodyParser: false },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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

    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", new Blob([buffer]), "upload.png");

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    const text = (await response.text()).trim();

    // ✅ Treat any http(s) URL as success
    if (text.startsWith("http")) {
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({ url: text }));
      return;
    }

    // Otherwise, return error
    res.writeHead(502, corsHeaders);
    res.end(JSON.stringify({ error: "Catbox upload failed", details: text }));
  } catch (err) {
    console.error("Proxy error:", err);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: "Proxy failed", details: err.message }));
  }
}
