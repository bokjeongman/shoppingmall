// Vercel 서버리스 함수: 토스페이먼츠 결제 승인 (POST /api/confirm)
// 시크릿 키는 Vercel 환경변수 TOSS_SECRET_KEY 로만 설정합니다.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) return res.status(500).json({ message: "서버 설정 오류" });

  const { paymentKey, orderId, amount } = req.body || {};
  if (typeof paymentKey !== "string" || typeof orderId !== "string" || !Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({ message: "잘못된 요청입니다." });
  }

  try {
    const r = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(secret + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch {
    return res.status(502).json({ message: "결제 승인 서버 연결 실패" });
  }
};
