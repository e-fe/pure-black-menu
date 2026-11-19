import { createStore, isToday, normalizeSizes, SIZE_KEYS, categoryList, normalizeDiscount, discounted } from "./store.js";
import { createPromo } from "./promo.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tl = (n) => "₺" + Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 2 });
const cap = (s) => s.charAt(0).toLocaleUpperCase("tr") + s.slice(1);
const slug = (s) => "c-" + s.toLocaleLowerCase("tr").replace(/[^a-z0-9ğüşıöç]+/gi, "-");

$("#date").textContent = new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });

let activeCat = null;  // görünen bölüm
let prev = new Map();  // id -> active (değişenleri parlatmak için)
let observer = null;
let lockUntil = 0;     // çipe tıklayınca kaydırma bitene kadar gözlemciyi sustur

const store = await createStore();
// İndirim vitrini: bannera dokununca ürünün kendi sekmesindeki kartına git
const promo = createPromo($("#promo"), {
  onSelect: (id) => {
    const el = document.querySelector(`#menu .card[data-id="${id}"]`);
    if (!el) return;
    lockScrollSpy();
    setActive(el.closest(".section").dataset.c);
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - navH() - 12, behavior: "smooth" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  },
});

const onSale = (it) => it.active && !!normalizeDiscount(it.discount);
// Sıralama: aktif → indirimli → imza → ada göre
const sortItems = (a, b) => (b.active - a.active) || (onSale(b) - onSale(a)) || (sig(b) - sig(a)) || a.name.localeCompare(b.name, "tr");

function render(data) {
  const { items, settings } = data;
  document.title = `${settings.cafeName} · Menü`;
  $("#cafeName").textContent = settings.cafeName;
  $("#tagline").textContent = settings.tagline;

  // Görünür ürünler ve sekmeler: gizli sekmeler ve gösterilecek ürünü kalmayan sekmeler düşer
  const hidden = new Set(settings.hiddenCategories || []);
  const visible = items.filter((it) => (it.active || settings.showSoldOut) && !hidden.has(it.category));
  const cats = categoryList(settings, items).filter((c) => !c.hidden && visible.some((i) => i.category === c.name));
  // İndirimdekiler başlığın altındaki vitrinde; sekmelerin içinde de ilk sırada
  promo.update(visible.filter(onSale).sort((a, b) => a.name.localeCompare(b.name, "tr")));
  const sections = cats.map((c) => ({ name: c.name, list: visible.filter((i) => i.category === c.name).sort(sortItems) }));

  $("#menuNav").classList.toggle("hidden", !sections.length);
  if (!sections.length) {
    $("#menu").innerHTML = `<div class="empty"><div class="big">🍰</div><p>Menü birazdan burada olacak.</p></div>`;
    return;
  }
  if (!sections.some((s) => s.name === activeCat)) activeCat = sections[0].name;

  $("#chips").innerHTML = sections.map((s) => {
    const n = s.list.filter((i) => i.active).length;
    return `<button class="chip ${s.name === activeCat ? "on" : ""}" data-c="${esc(s.name)}">${esc(s.name)}<span class="n">${n}</span></button>`;
  }).join("");

  $("#menu").innerHTML = sections.map((s) =>
    `<section class="section" id="${slug(s.name)}" data-c="${esc(s.name)}"><h2>${esc(s.name)}</h2>${s.list.map(card).join("")}</section>`
  ).join("");

  // Yeni açılan/kapanan ürünü vurgula
  items.forEach((it) => {
    if (prev.has(it.id) && prev.get(it.id) !== it.active) {
      document.querySelectorAll(`#menu [data-id="${it.id}"]`).forEach((el) => el.classList.add("flash"));
    }
  });
  prev = new Map(items.map((i) => [i.id, i.active]));

  observe();
}

function priceHTML(p, d) {
  return d ? `<s>${tl(p)}</s><span class="now">${tl(discounted(p, d))}</span>` : tl(p);
}

function card(it) {
  const thumb = it.image ? `<img src="${esc(it.image)}" alt="" loading="lazy" />` : esc(it.emoji);
  const d = it.active ? normalizeDiscount(it.discount) : null; // tükenen üründe indirim gösterilmez
  const tags = [];
  if (d) tags.push(`<span class="tag sale">${d.type === "pct" ? `%${d.value} indirim` : `₺${d.value} indirim`}</span>`);
  if (it.active && isToday(it.activatedAt)) tags.push(`<span class="tag fresh">Bugün geldi</span>`);
  (it.tags || []).forEach((t) => tags.push(`<span class="tag ${t === "yeni" || t === "imza" ? "new" : ""}">${esc(cap(t))}</span>`));
  const sz = normalizeSizes(it.sizes);
  const sizes = sz ? `<div class="sizes ${d ? "on-sale" : ""}">${SIZE_KEYS.filter(([k]) => sz[k]).map(([k, l]) => `<span><b>${l}</b>${priceHTML(sz[k], d)}</span>`).join(`<i>·</i>`)}</div>` : "";
  return `
    <article class="card ${it.active ? "" : "out"} ${sz ? "has-sizes" : ""} ${d ? "on-sale" : ""}" data-id="${it.id}">
      <div class="thumb">${thumb}</div>
      <div>
        <h3>${esc(it.name)}</h3>
        ${it.desc ? `<p>${esc(it.desc)}</p>` : ""}
        ${sizes}
        ${tags.length && it.active ? `<div class="tags">${tags.join("")}</div>` : ""}
        ${it.active ? "" : `<div class="soldout">Tükendi</div>`}
      </div>
      ${sz ? "" : `<div class="price ${d ? "on-sale" : ""}">${priceHTML(it.price, d)}</div>`}
    </article>`;
}

function sig(it) { return (it.tags || []).includes("imza") ? 1 : 0; }

/* ------------------------- aktif çip takibi ------------------------- */
const navH = () => $("#menuNav").offsetHeight;
const sectionEls = () => [...document.querySelectorAll("#menu .section")];

function observe() {
  observer?.disconnect();
  const seen = new Map();
  // Ekranın üst kısmındaki şeritte (sabit menünün hemen altı) olan ilk bölüm aktif sayılır
  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
    if (Date.now() < lockUntil) return;
    const first = sectionEls().find((s) => seen.get(s.id));
    if (first) setActive(first.dataset.c);
  }, { rootMargin: `-${navH() + 8}px 0px -55% 0px` });
  sectionEls().forEach((s) => observer.observe(s));
}

// Konumdan aktif bölümü hesapla (gözlemcinin kaçırdığı uç durumlar ve kilit sonrası için)
// En üstte ilk bölüm henüz şeride girmemiştir; en altta son (kısa) bölüm hiç giremeyebilir
function syncActive() {
  const secs = sectionEls(); if (!secs.length) return;
  const bandBottom = innerHeight * 0.45;
  if (secs[0].getBoundingClientRect().top > bandBottom) return setActive(secs[0].dataset.c);
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) return setActive(secs.at(-1).dataset.c);
  const cur = [...secs].reverse().find((s) => s.getBoundingClientRect().top <= bandBottom);
  if (cur) setActive(cur.dataset.c);
}
// Programla kaydırırken çip takibini kısa süre kilitle, kilit bitince konumu yeniden oku
function lockScrollSpy(ms = 900) {
  lockUntil = Date.now() + ms;
  clearTimeout(lockScrollSpy.t);
  lockScrollSpy.t = setTimeout(syncActive, ms + 50);
}
window.addEventListener("scroll", () => {
  if (Date.now() < lockUntil) return;
  const secs = sectionEls();
  if (secs.length && (secs[0].getBoundingClientRect().top > innerHeight * 0.45 || innerHeight + scrollY >= document.documentElement.scrollHeight - 4)) syncActive();
}, { passive: true });

function setActive(name) {
  if (name === activeCat) return;
  activeCat = name;
  const box = $("#chips");
  let chip = null;
  [...box.children].forEach((b) => { const on = b.dataset.c === name; b.classList.toggle("on", on); if (on) chip = b; });
  if (chip) box.scrollTo({ left: chip.offsetLeft - box.clientWidth / 2 + chip.offsetWidth / 2, behavior: "smooth" });
}

$("#chips").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  const s = sectionEls().find((x) => x.dataset.c === b.dataset.c);
  if (!s) return;
  lockScrollSpy();
  setActive(b.dataset.c);
  window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - navH() - 8, behavior: "smooth" });
});

// En sonda abone ol: render() yukarıdaki tüm tanımları kullanır
store.subscribe(render);
