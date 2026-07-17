import http from "http";
import fs from "fs";
import path from "path";

const root = process.argv[2];
const port = Number(process.argv[3] || 8765);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".css": "text/css",
  ".js": "text/javascript",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let file =
    urlPath === "/"
      ? path.join(root, "VIEW-OPENING-STORYBOARD.html")
      : path.join(root, path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, ""));
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found: " + urlPath);
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log("READY http://127.0.0.1:" + port + "/VIEW-OPENING-STORYBOARD.html");
});
