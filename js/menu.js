import { createStore, isToday, normalizeSizes, SIZE_KEYS, categoryList, GROUPS } from "./store.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tl = (n) => "₺" + Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 2 });
const cap = (s) => s.charAt(0).toLocaleUpperCase("tr") + s.slice(1);
const slug = (s) => "c-" + s.toLocaleLowerCase("tr").replace(/[^a-z0-9ğüşıöç]+/gi, "-");

$("#date").textContent = new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });

let group = null;      // "drinks" | "food"
let activeCat = null;  // görünen bölüm
let prev = new Map();  // id -> active (değişenleri parlatmak için)
let last = null;
let observer = null;
let lockUntil = 0;     // çipe tıklayınca kaydırma bitene kadar gözlemciyi sustur

const store = await createStore();

function render(data) {
  last = data;
  const { items, settings } = data;
  document.title = `${settings.cafeName} · Menü`;
  $("#cafeName").textContent = settings.cafeName;
  $("#tagline").textContent = settings.tagline;

  // Görünür ürünler ve sekmeler: gizli sekmeler ve gösterilecek ürünü kalmayan sekmeler düşer
  const visible = items.filter((it) => it.active || settings.showSoldOut);
  const cats = categoryList(settings, items)
    .filter((c) => !c.hidden && visible.some((i) => i.category === c.name));
  const groups = GROUPS.filter(([g]) => cats.some((c) => c.group === g));

  $("#menuNav").classList.toggle("hidden", !groups.length);
  if (!groups.length) {
    $("#menu").innerHTML = `<div class="empty"><div class="big">☕</div><p>Menü birazdan burada olacak.</p></div>`;
    return;
  }
  if (!groups.some(([g]) => g === group)) group = groups[0][0];
  const shown = cats.filter((c) => c.group === group);
  if (!shown.some((c) => c.name === activeCat)) activeCat = shown[0].name;

  $("#groups").innerHTML = groups.map(([g, label]) =>
    `<button class="grp ${g === group ? "on" : ""}" data-g="${g}" role="tab" aria-selected="${g === group}">${label}</button>`).join("");

  $("#chips").innerHTML = shown.map((c) => {
    const n = items.filter((i) => i.category === c.name && i.active).length;
    return `<button class="chip ${c.name === activeCat ? "on" : ""}" data-c="${esc(c.name)}">${esc(c.name)}<span class="n">${n}</span></button>`;
  }).join("");

  $("#menu").innerHTML = shown.map((c) => {
    const list = visible
      .filter((i) => i.category === c.name)
      .sort((a, b) => (b.active - a.active) || (sig(b) - sig(a)) || a.name.localeCompare(b.name, "tr"));
    return `<section class="section" id="${slug(c.name)}" data-c="${esc(c.name)}"><h2>${esc(c.name)}</h2>${list.map(card).join("")}</section>`;
  }).join("");

  // Yeni açılan/kapanan ürünü vurgula
  items.forEach((it) => {
    if (prev.has(it.id) && prev.get(it.id) !== it.active) {
      document.querySelector(`[data-id="${it.id}"]`)?.classList.add("flash");
    }
  });
  prev = new Map(items.map((i) => [i.id, i.active]));

  observe();
}

function card(it) {
  const thumb = it.image ? `<img src="${esc(it.image)}" alt="" loading="lazy" />` : esc(it.emoji);
  const tags = [];
  if (it.active && isToday(it.activatedAt)) tags.push(`<span class="tag fresh">Bugün geldi</span>`);
  (it.tags || []).forEach((t) => tags.push(`<span class="tag ${t === "yeni" || t === "imza" ? "new" : ""}">${esc(cap(t))}</span>`));
  const sz = normalizeSizes(it.sizes);
  const sizes = sz ? `<div class="sizes">${SIZE_KEYS.filter(([k]) => sz[k]).map(([k, l]) => `<span><b>${l}</b>${tl(sz[k])}</span>`).join(`<i>·</i>`)}</div>` : "";
  return `
    <article class="card ${it.active ? "" : "out"} ${sz ? "has-sizes" : ""}" data-id="${it.id}">
      <div class="thumb">${thumb}</div>
      <div>
        <h3>${esc(it.name)}</h3>
        ${it.desc ? `<p>${esc(it.desc)}</p>` : ""}
        ${sizes}
        ${tags.length && it.active ? `<div class="tags">${tags.join("")}</div>` : ""}
        ${it.active ? "" : `<div class="soldout">Tükendi</div>`}
      </div>
      ${sz ? "" : `<div class="price">${tl(it.price)}</div>`}
    </article>`;
}

function sig(it) { return (it.tags || []).includes("imza") ? 1 : 0; }

/* ------------------------- aktif çip takibi ------------------------- */
const navH = () => $("#menuNav").offsetHeight;
const sections = () => [...document.querySelectorAll("#menu .section")];

function observe() {
  observer?.disconnect();
  const seen = new Map();
  // Ekranın üst kısmındaki şeritte (sabit menünün hemen altı) olan ilk bölüm aktif sayılır
  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
    if (Date.now() < lockUntil) return;
    const first = sections().find((s) => seen.get(s.id));
    if (first) setActive(first.dataset.c);
  }, { rootMargin: `-${navH() + 8}px 0px -55% 0px` });
  sections().forEach((s) => observer.observe(s));
}

// Sayfanın en altına inildiğinde son (kısa) bölüm şeride hiç giremeyebilir
window.addEventListener("scroll", () => {
  if (Date.now() < lockUntil) return;
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) {
    const s = sections().at(-1);
    if (s) setActive(s.dataset.c);
  }
}, { passive: true });

function setActive(name) {
  if (name === activeCat) return;
  activeCat = name;
  const box = $("#chips");
  let chip = null;
  [...box.children].forEach((b) => { const on = b.dataset.c === name; b.classList.toggle("on", on); if (on) chip = b; });
  if (chip) box.scrollTo({ left: chip.offsetLeft - box.clientWidth / 2 + chip.offsetWidth / 2, behavior: "smooth" });
}

function scrollToSection(name) {
  const s = sections().find((x) => x.dataset.c === name);
  if (!s) return;
  lockUntil = Date.now() + 900;
  setActive(name);
  window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - navH() - 8, behavior: "smooth" });
}

$("#chips").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (b) scrollToSection(b.dataset.c);
});

$("#groups").addEventListener("click", (e) => {
  const b = e.target.closest(".grp");
  if (!b || b.dataset.g === group) return;
  group = b.dataset.g;
  activeCat = null;
  lockUntil = Date.now() + 900;
  $("#chips").scrollLeft = 0;
  render(last);
  // Menü başlığı geçildiyse yeni grubun en üstüne dön
  const top = $(".hero").offsetTop + $(".hero").offsetHeight;
  if (scrollY > top) window.scrollTo({ top, behavior: "smooth" });
});

// En sonda abone ol: render() yukarıdaki tüm tanımları kullanır
store.subscribe(render);
