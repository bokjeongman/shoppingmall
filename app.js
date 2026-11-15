const U = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

const PRODUCTS = [
  { id: 1, name: "베이직 화이트 티셔츠", cat: "top", price: 29000, img: U("1521572163474-6864f9cf17ab") },
  { id: 2, name: "릴렉스핏 코튼 티", cat: "top", price: 33000, img: U("1576566588028-4147f3842f27") },
  { id: 3, name: "블랙 오버핏 티셔츠", cat: "top", price: 35000, img: U("1583743814966-8936f5b7be1a") },
  { id: 4, name: "그래픽 데일리 티", cat: "top", price: 31000, img: U("1503342217505-b0a15ec3261c") },
  { id: 5, name: "스트레이트 데님 팬츠", cat: "bottom", price: 59000, img: U("1542272604-787c3835535d") },
  { id: 6, name: "데일리 캐주얼 팬츠", cat: "bottom", price: 49000, img: U("1515886657613-9f3515b0c78f") },
  { id: 7, name: "클래식 데님 재킷", cat: "outer", price: 89000, img: U("1551028719-00167b16eac5") },
  { id: 8, name: "라이트 윈드 재킷", cat: "outer", price: 99000, img: U("1591047139829-d91aecb6caea") },
  { id: 9, name: "테일러드 블레이저", cat: "outer", price: 119000, img: U("1594938298603-c8148c4dae35") },
];

const won = (n) => n.toLocaleString("ko-KR") + "원";
const $ = (s) => document.querySelector(s);
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let filter = "all";

function save() { localStorage.setItem("cart", JSON.stringify(cart)); }

function renderGrid() {
  $("#grid").innerHTML = PRODUCTS.filter((p) => filter === "all" || p.cat === filter)
    .map((p) => `
      <article class="card">
        <div class="thumb"><img src="${p.img}" alt="${p.name}" loading="lazy" /></div>
        <h3>${p.name}</h3>
        <p class="price">${won(p.price)}</p>
        <button class="btn small" data-add="${p.id}">장바구니 담기</button>
      </article>`).join("");
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * PRODUCTS.find((p) => p.id === i.id).price, 0);
  $("#cart-count").textContent = count;
  $("#cart-total").textContent = won(total);
  $("#checkout-btn").disabled = count === 0;
  $("#cart-items").innerHTML = count === 0 ? '<p class="empty">장바구니가 비어 있어요.</p>' :
    cart.map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return `<div class="row">
        <img src="${p.img}" alt="" />
        <div class="info"><strong>${p.name}</strong><span>${won(p.price)}</span>
          <div class="qty"><button data-dec="${p.id}">−</button><b>${i.qty}</b><button data-inc="${p.id}">+</button></div>
        </div>
        <button class="rm" data-rm="${p.id}" aria-label="삭제">✕</button>
      </div>`;
    }).join("");
  save();
}

function toggleDrawer(open) {
  $("#drawer").classList.toggle("open", open);
  $("#overlay").classList.toggle("show", open);
  $("#drawer").setAttribute("aria-hidden", String(!open));
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.add) {
    const id = +t.dataset.add;
    const it = cart.find((i) => i.id === id);
    it ? it.qty++ : cart.push({ id, qty: 1 });
    renderCart(); toggleDrawer(true);
  }
  if (t.dataset.inc) cart.find((i) => i.id === +t.dataset.inc).qty++;
  if (t.dataset.dec) { const it = cart.find((i) => i.id === +t.dataset.dec); it.qty--; if (it.qty <= 0) cart = cart.filter((i) => i !== it); }
  if (t.dataset.rm) cart = cart.filter((i) => i.id !== +t.dataset.rm);
  if (t.dataset.inc || t.dataset.dec || t.dataset.rm) renderCart();
  if (t.dataset.filter) { filter = t.dataset.filter; renderGrid(); }
});
$("#open-cart").onclick = () => toggleDrawer(true);
$("#close-cart").onclick = () => toggleDrawer(false);
$("#overlay").onclick = () => toggleDrawer(false);

// ---------- 토스페이먼츠 결제 (결제창형, 비회원 결제) ----------
// ---------- 배송지 주소 (카카오 우편번호 서비스) ----------
function openPostcode() {
  if (!window.daum || !window.daum.Postcode) { showErr(Object.assign(new Error("주소 검색 서비스를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요."), { plain: true })); return; }
  new daum.Postcode({
    oncomplete: (d) => {
      // 도로명 주소 우선, 없으면 지번 주소 사용
      const base = d.userSelectedType === "R" ? d.roadAddress : d.jibunAddress;
      $("#ship-zip").value = d.zonecode;
      $("#ship-addr").value = base;
      $("#ship-zip").classList.remove("bad"); $("#ship-addr").classList.remove("bad");
      $("#ship-detail").focus();
    },
  }).open();
}
$("#addr-search").onclick = openPostcode;
$("#ship-zip").onclick = openPostcode;
$("#ship-addr").onclick = openPostcode;
$("#ship-phone").oninput = (e) => {
  const n = e.target.value.replace(/\D/g, "").slice(0, 11);
  e.target.value = n.length < 4 ? n : n.length < 8 ? n.replace(/(\d{3})(\d+)/, "$1-$2") : n.replace(/(\d{3})(\d{3,4})(\d+)/, "$1-$2-$3");
};

function getShipping() {
  const v = (id) => $(id).value.trim();
  const ship = { name: v("#ship-name"), phone: v("#ship-phone"), zip: v("#ship-zip"), addr: v("#ship-addr"), detail: v("#ship-detail") };
  const bad = [];
  if (ship.name.length < 2) bad.push("#ship-name");
  if (!/^01[016789]-\d{3,4}-\d{4}$/.test(ship.phone)) bad.push("#ship-phone");
  if (!ship.zip || !ship.addr) bad.push("#ship-zip", "#ship-addr");
  if (!ship.detail) bad.push("#ship-detail");
  document.querySelectorAll(".ship input").forEach((el) => el.classList.remove("bad"));
  bad.forEach((id) => $(id).classList.add("bad"));
  if (bad.length) { $(bad[0]).focus(); throw Object.assign(new Error("배송지 정보를 올바르게 입력해 주세요."), { plain: true }); }
  return ship;
}

$("#checkout-btn").onclick = async () => {
  const err = $("#pay-error");
  err.hidden = true;
  try {
    const shipping = getShipping();
    const items = cart.map((i) => ({ ...PRODUCTS.find((p) => p.id === i.id), qty: i.qty }));
    // 금액은 상품 목록에서 다시 계산합니다. (서버에서도 승인 시 금액을 검증해야 해요)
    const amount = items.reduce((s, i) => s + i.price * i.qty, 0);
    const orderName = items[0].name + (items.length > 1 ? ` 외 ${items.length - 1}건` : "");
    const orderId = "ORD_" + crypto.randomUUID().replace(/-/g, "");
    sessionStorage.setItem("pendingOrder", JSON.stringify({ orderId, amount, shipping }));

    const tossPayments = TossPayments(window.TOSS_CLIENT_KEY);
    const widgets = tossPayments.widgets({ customerKey: TossPayments.ANONYMOUS });
    await widgets.setAmount({ currency: "KRW", value: amount });
    const paymentWindow = await widgets.renderPaymentWindow({
      orderName,
      variantKey: { paymentMethod: "DEFAULT", agreement: "AGREEMENT" },
    });
    paymentWindow.on("paymentRequest", async () => {
      try {
        await widgets.requestPayment({
          orderId, orderName,
          successUrl: location.origin + location.pathname.replace(/[^/]*$/, "") + "success.html",
          failUrl: location.origin + location.pathname.replace(/[^/]*$/, "") + "fail.html",
        });
      } catch (e) { showErr(e); }
    });
  } catch (e) { showErr(e); }
};
function showErr(e) {
  const err = $("#pay-error");
  err.textContent = (e.plain ? "" : "결제 오류: ") + (e.message || e.code || e);
  err.hidden = false;
}

renderGrid();
renderCart();
