const http = require("http");
const https = require("https");
const url = require("url");
const zlib = require("zlib");

const PORT = 3000;
const TARGET_DOMAIN = "dubaework.amocrm.ru";

const server = http.createServer((req, res) => {
  // Установка CORS-заголовков
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Version");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url);
  let path = parsedUrl.pathname;

  // Если запрос на авторизацию, перенаправляем на /oauth2/access_token
  if (path === "/proxy/auth") {
    path = "/oauth2/access_token";
  } else {
    // Убираем префикс /proxy для остальных запросов
    path = path.replace(/^\/proxy/, "");
  }
  const query = parsedUrl.search || "";

  const options = {
    hostname: TARGET_DOMAIN,
    path: path + query,
    method: req.method,
    headers: {
      ...req.headers,
      host: TARGET_DOMAIN,
      "Accept-Encoding": "gzip",
      Connection: "close"
    },
  };

  // Удаляем лишние заголовки
  delete options.headers.origin;
  delete options.headers.referer;

  const proxy = https.request(options, (targetRes) => {
    let chunks = [];
    targetRes.on("data", chunk => chunks.push(chunk));
    targetRes.on("end", () => {
      const body = Buffer.concat(chunks);
      // Добавляем CORS для ответа
      const headers = {
        ...targetRes.headers,
        "Access-Control-Allow-Origin": "*",
      };
      delete headers["content-encoding"];
      delete headers["content-length"];
      res.writeHead(targetRes.statusCode, headers);
      if (targetRes.headers["content-encoding"] === "gzip") {
        zlib.gunzip(body, (err, decoded) => res.end(err ? body : decoded));
      } else {
        res.end(body);
      }
    });
  });

  proxy.on("error", (err) => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  });

  req.pipe(proxy, { end: true });
});

server.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
