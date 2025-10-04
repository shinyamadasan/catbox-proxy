export const config = {
  api: {
    bodyParser: false, // disable default body parsing
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    // Read the incoming request body as a stream
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Forward the raw body to Catbox
    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: {
        "Content-Type": req.headers["content-type"] || "application/octet-stream",
      },
      body: buffer,
    });

    const text = await response.text();

    if (!response.ok || !text.startsWith("http")) {
      res.status(502).json({ error: "Catbox upload failed", details: text });
      return;
    }

    res.status(200).json({ url: text });
  } catch (err) {
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
}
