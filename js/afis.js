// İndirim afişleri: afis.html?size=a4|a5|card&ids=id1,id2
import { createStore, normalizeSizes, SIZE_KEYS, normalizeDiscount, discounted } from "./store.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tl = (n) => "₺" + Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 2 });

const params = new URLSearchParams(location.search);
const PER_PAGE = { a4: 1, a5: 2, card: 4 };
let size = PER_PAGE[params.get("size")] ? params.get("size") : "a4";
const ids = (params.get("ids") || "").split(",").filter(Boolean); // boşsa tüm indirimli ürünler
const menuUrl = new URL("index.html", location.href).href;
const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(menuUrl)}`;
let last = null;

function banner(it, settings) {
  const d = normalizeDiscount(it.discount);
  const sz = normalizeSizes(it.sizes);
  const prices = sz ? SIZE_KEYS.filter(([k]) => sz[k]).map(([k, l]) => [l, sz[k]]) : [["", it.price]];
  const amount = d.type === "pct" ? `%${d.value.toLocaleString("tr-TR")}` : `₺${d.value.toLocaleString("tr-TR")}`;
  return `
    <article class="banner">
      <header class="b-head">
        <div class="b-brand">${esc(settings.cafeName.toLocaleUpperCase("tr"))}</div>
        <div class="b-loc">${esc((settings.tagline || "").toLocaleUpperCase("tr"))}</div>
      </header>
      <div class="b-body">
        <div class="b-deal"><span class="b-amount">${amount}</span><span class="b-word">İNDİRİM</span></div>
        <div class="b-info">
          <div class="b-name">${esc(it.name.toLocaleUpperCase("tr"))}</div>
          ${it.desc ? `<div class="b-desc">${esc(it.desc)}</div>` : ""}
          <div class="b-prices ${prices.length > 1 ? "multi" : ""}">${prices.map(([l, p]) =>
            `<span class="b-price">${l ? `<b>${l}</b>` : ""}<s>${tl(p)}</s><span class="now">${tl(discounted(p, d))}</span></span>`).join("")}</div>
        </div>
      </div>
      <footer class="b-foot"><img src="${qr}" alt="" /><span>Menünün tamamı<br />için okutun</span></footer>
    </article>`;
}

function render(data) {
  last = data;
  const { items, settings } = data;
  const list = items
    .filter((it) => normalizeDiscount(it.discount) && (!ids.length || ids.includes(it.id)))
    .sort((a, b) => (ids.length ? ids.indexOf(a.id) - ids.indexOf(b.id) : a.name.localeCompare(b.name, "tr")));

  [...$("#sizeSeg").children].forEach((b) => b.classList.toggle("on", b.dataset.s === size));
  const per = PER_PAGE[size];
  const pages = Math.ceil(list.length / per);
  $("#info").textContent = list.length ? `${list.length} afiş · ${pages} sayfa` : "";
  $("#printBtn").disabled = !list.length;

  if (!list.length) {
    $("#sheets").innerHTML = `<div class="empty">Afişe basılacak indirimli ürün yok.<br />Panelde ürünü düzenleyip İndirim alanını doldurun.</div>`;
    return;
  }
  let html = "";
  for (let p = 0; p < pages; p++) {
    const chunk = list.slice(p * per, p * per + per);
    html += `<section class="sheet ${size}">${chunk.map((it) => `<div class="cell">${banner(it, settings)}</div>`).join("")}</section>`;
  }
  $("#sheets").innerHTML = html;
}

$("#sizeSeg").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  size = b.dataset.s;
  params.set("size", size);
  history.replaceState(null, "", `?${params}`);
  if (last) render(last);
});

// Yazdırmadan önce yazı tipleri ve QR görselleri yüklensin
$("#printBtn").addEventListener("click", async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((img) => img.complete ? 0 : new Promise((r) => { img.onload = img.onerror = r; })));
  window.print();
});

const store = await createStore();
store.subscribe(render);
