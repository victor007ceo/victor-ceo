import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function resolveRequestPath(urlPathname) {
  const cleanPath = decodeURIComponent(urlPathname.split("?")[0]);
  const requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
  const candidatePath = path.resolve(distDir, `.${requestedPath}`);

  if (!candidatePath.startsWith(distDir)) {
    return null;
  }

  return candidatePath;
}

async function serveFile(filePath, response) {
  const ext = path.extname(filePath);
  const file = await readFile(filePath);

  response.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  response.end(file);
}

const server = http.createServer(async (request, response) => {
  const filePath = resolveRequestPath(request.url || "/");

  if (!filePath) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    const fileInfo = await stat(filePath);
    if (fileInfo.isFile()) {
      await serveFile(filePath, response);
      return;
    }
  } catch {
    // Fall back to the SPA entrypoint below.
  }

  try {
    await serveFile(path.join(distDir, "index.html"), response);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Build output not found. Run `npm run build` first.");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving dist on http://0.0.0.0:${port}`);
});
