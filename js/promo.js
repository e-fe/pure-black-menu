// İndirim vitrini: PURE BLACK başlığının altında kendiliğinden kayan, elle de kaydırılabilen banner.
//  - Telefonda parmakla kaydırılır (yerleşik kaydırma + yapışma), masaüstünde ‹ › okları
//  - Alttaki noktalar kaçıncı bannerda olunduğunu gösterir, tıklanınca o bannera gider
//  - Kullanıcı dokununca otomatik geçiş bir süre durur, sonra devam eder
import { normalizeDiscount, discounted, normalizeSizes } from "./store.js";

const INTERVAL = 4500; // otomatik geçiş aralığı (ms)
const RESUME = 7000;   // elle kaydırdıktan sonra otomatik geçişin yeniden başlaması (ms)

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tl = (n) => "₺" + Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 2 });

function priceLine(it, d) {
  const sz = normalizeSizes(it.sizes);
  const prices = sz ? Object.values(sz) : [it.price];
  const range = (arr) => (arr.length > 1 && Math.min(...arr) !== Math.max(...arr) ? `${tl(Math.min(...arr))} – ${tl(Math.max(...arr))}` : tl(arr[0]));
  return `<s>${range(prices)}</s><b>${range(prices.map((p) => discounted(p, d)))}</b>`;
}

function slide(it, i, n) {
  const d = normalizeDiscount(it.discount);
  const amount = d.type === "pct" ? `%${d.value.toLocaleString("tr-TR")}` : `₺${d.value.toLocaleString("tr-TR")}`;
  return `
    <article class="promo-slide ${it.image ? "has-photo" : ""}" data-id="${it.id}" role="group" aria-roledescription="banner" aria-label="${i + 1} / ${n}: ${esc(it.name)}">
      ${it.image ? `<img class="promo-img" src="${esc(it.image)}" alt="" draggable="false" />` : `<span class="promo-emoji" aria-hidden="true">${esc(it.emoji)}</span>`}
      <div class="promo-text">
        <span class="promo-badge">İndirim</span>
        <div class="promo-amount">${amount}</div>
        <h3 class="promo-name">${esc(it.name)}</h3>
        <div class="promo-price">${priceLine(it, d)}</div>
      </div>
    </article>`;
}

export function createPromo(root, { onSelect } = {}) {
  root.innerHTML = `
    <div class="promo-track" tabindex="0" aria-label="İndirimdeki tatlılar"></div>
    <button type="button" class="promo-nav prev" aria-label="Önceki banner">‹</button>
    <button type="button" class="promo-nav next" aria-label="Sonraki banner">›</button>
    <div class="promo-dots"></div>`;
  const track = root.querySelector(".promo-track");
  const dots = root.querySelector(".promo-dots");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let key = "", count = 0, index = 0, pausedUntil = 0, hovering = false;
  let target = null, settleT = 0; // programla geçiş sürerken hedef banner

  const pause = () => { pausedUntil = Date.now() + RESUME; };
  const markDots = () => {
    [...dots.children].forEach((b, i) => { b.classList.toggle("on", i === index); b.setAttribute("aria-current", i === index ? "true" : "false"); });
  };
  function go(i, smooth = true) {
    if (!count) return;
    index = (i + count) % count;
    target = index;
    const animate = smooth && !reduce;
    track.scrollTo({ left: index * track.clientWidth, behavior: animate ? "smooth" : "auto" });
    markDots();
    clearTimeout(settleT);
    settleT = setTimeout(settle, animate ? 900 : 60);
  }
  // Hızlı art arda geçişlerde tarayıcı önceki kaydırmayı yarıda kesip yanlış bannera yapışabilir:
  // kaydırma bitince hedefte değilse düzelt
  function settle() {
    if (target === null) return;
    const w = Math.max(1, track.clientWidth);
    if (Math.round(track.scrollLeft / w) !== target) track.scrollTo({ left: target * w, behavior: "auto" });
    target = null;
  }
  track.addEventListener("scrollend", () => { if (target !== null) { clearTimeout(settleT); settleT = setTimeout(settle, 30); } });

  // Kaydırma konumundan aktif banner (elle kaydırınca noktalar da güncellensin)
  let raf = 0;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (target !== null) return; // programla geçiş sürerken noktalar ara bannerlarda gezinmesin
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i !== index && i >= 0 && i < count) { index = i; markDots(); }
    });
  }, { passive: true });

  // Kullanıcı etkileşimi otomatik geçişi bir süre durdurur
  ["pointerdown", "touchstart", "wheel", "keydown"].forEach((ev) => track.addEventListener(ev, pause, { passive: true }));
  // Parmakla/tekerle kaydırma başlarsa programlı hedefi bırak, kontrol kullanıcıda
  ["pointerdown", "touchstart", "wheel"].forEach((ev) => track.addEventListener(ev, () => { target = null; clearTimeout(settleT); }, { passive: true }));
  root.addEventListener("mouseenter", () => { hovering = true; });
  root.addEventListener("mouseleave", () => { hovering = false; });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
  });
  root.querySelector(".prev").onclick = () => { pause(); go(index - 1); };
  root.querySelector(".next").onclick = () => { pause(); go(index + 1); };
  dots.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    pause(); go(Number(b.dataset.i));
  });

  // Bannera dokununca (kaydırma değil, gerçek dokunuş) ürüne git
  let down = null;
  track.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY }; });
  track.addEventListener("click", (e) => {
    const s = e.target.closest(".promo-slide");
    const moved = down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8;
    down = null;
    if (s && !moved) onSelect?.(s.dataset.id);
  });

  setInterval(() => {
    if (count > 1 && !document.hidden && !hovering && Date.now() >= pausedUntil) go(index + 1);
  }, INTERVAL);
  addEventListener("resize", () => go(index, false));

  return {
    // items: aktif, indirimli ürünler (sıralı)
    update(items) {
      const k = JSON.stringify(items.map((it) => [it.id, it.name, it.price, it.sizes, it.discount, it.image, it.emoji]));
      if (k === key) return; // içerik aynıysa konumu sıfırlama
      key = k;
      count = items.length;
      root.hidden = !count;
      root.classList.toggle("single", count < 2);
      track.innerHTML = items.map((it, i) => slide(it, i, count)).join("");
      dots.innerHTML = count > 1 ? items.map((it, i) => `<button type="button" data-i="${i}" aria-label="${i + 1}. banner: ${esc(it.name)}"></button>`).join("") : "";
      index = Math.min(index, Math.max(0, count - 1));
      go(index, false);
    },
    get index() { return index; },
  };
}
