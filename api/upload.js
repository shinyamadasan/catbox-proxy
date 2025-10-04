 // api/upload.js (CommonJS for simplicity)
const formidable = require("formidable");
const fs = require("fs");
const FormData = require("form-data");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: "File parsing failed" });
      return;
    }

    try {
      const file = files.file;
      if (!file) {
        res.status(400).json({ error: "No file provided. Use 'file' field." });
        return;
      }

      const fd = new FormData();
      fd.append("reqtype", "fileupload");
      fd.append("fileToUpload", fs.createReadStream(file.filepath), file.originalFilename);

      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: fd,
        headers: fd.getHeaders()
      });

      if (!response.ok) {
        const text = await response.text();
        res.status(502).json({ error: "Catbox upload failed", details: text });
        return;
      }

      const url = await response.text();

      // Basic check: Catbox returns a URL string when successful
      if (!url.startsWith("http")) {
        res.status(502).json({ error: "Unexpected response from Catbox", details: url });
        return;
      }

      res.status(200).json({ url });
    } catch (error) {
      res.status(500).json({ error: "Upload failed", details: error.message });
    }
  });
};
