// 의존성 없는 정적 서버 + 토스페이먼츠 결제 승인 API
// 실행: $env:TOSS_SECRET_KEY="test_gsk_..."; node server.js  → http://localhost:3000
const http = require("http");
const fs = require("fs");
const path = require("path");

const SECRET = process.env.TOSS_SECRET_KEY || "";
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript" };

http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/confirm") {
    let body = "";
    for await (const c of req) body += c;
    const send = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
    if (!SECRET) return send(500, { message: "TOSS_SECRET_KEY 환경변수가 설정되지 않았어요." });
    try {
      const { paymentKey, orderId, amount } = JSON.parse(body);
      const r = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
        method: "POST",
        headers: { Authorization: "Basic " + Buffer.from(SECRET + ":").toString("base64"), "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });
      return send(r.status, await r.json());
    } catch (e) { return send(400, { message: e.message }); }
  }
  const name = req.url.split("?")[0];
  const file = path.join(__dirname, name === "/" ? "index.html" : name);
  if (!file.startsWith(__dirname) || path.basename(file) === "server.js" || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end("Not found");
  }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(3000, () => console.log("http://localhost:3000"));
