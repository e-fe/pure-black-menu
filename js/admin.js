import { createStore, isToday, normalizeSizes, SIZE_KEYS, categoryList, normalizeDiscount, discounted, discountLabel } from "./store.js";
import { ADMIN_PIN } from "./config.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tl = (n) => "₺" + Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 2 });

const EMOJIS = ["🍰","🎂","🧁","🍮","🍫","🍪","🍩","🥧","🧇","🍬","🍭","🍨","🍦","🍓","🍒","🍌","🍋","🫐","🥭","🍯","🍥","🥮","🧀","🌰","🥛","☕","🥐","🥕","🟫","🟡"];
const TAGS = ["yeni", "imza", "çok satan", "yöresel", "sıcak", "soğuk", "glutensiz", "vegan", "şekersiz"];
const DISC = "__disc__"; // "İndirimde" filtresi

let store, data = { items: [], settings: {} };
let tabsUI = null; // açık Sekmeler modalı
let filter = { q: "", status: "all", cat: "all" };

/* ----------------------------- başlat ----------------------------- */
store = await createStore();
$("#today").textContent = new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const live = store.mode === "live";
$("#mode").textContent = live ? "Canlı · tüm cihazlar" : "Demo modu";
$("#mode").classList.toggle("live", live);
if (live) {
  $("#emailField").classList.remove("hidden");
  $("#emailField input").required = true;
  $("#passLabel").textContent = "Şifre";
  $("#loginForm [name=pass]").removeAttribute("inputmode");
} else {
  $("#loginHint").textContent = `Demo şifresi: ${ADMIN_PIN}  (js/config.js içinden değiştirilebilir)`;
}

store.onAuth((ok) => {
  $("#loginView").classList.toggle("hidden", ok);
  $("#appView").classList.toggle("hidden", !ok);
});

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  $("#loginErr").textContent = "";
  try {
    await store.login(f.get("email"), f.get("pass"));
    if (!live) store.onAuth((ok) => { $("#loginView").classList.toggle("hidden", ok); $("#appView").classList.toggle("hidden", !ok); });
  } catch (err) {
    $("#loginErr").textContent = live ? "E-posta veya şifre hatalı" : err.message;
  }
});
$("#logoutBtn").onclick = async () => { await store.logout(); if (!live) location.reload(); };

/* ----------------------------- çizim ------------------------------ */
const catInfo = () => categoryList(data.settings, data.items);
const cats = () => catInfo().map((c) => c.name);

function render() {
  const { items, settings } = data;
  $("#brand").textContent = settings.cafeName || "Kafe";

  const act = items.filter((i) => i.active);
  $("#sActive").textContent = act.length;
  $("#sPassive").textContent = items.length - act.length;
  $("#sToday").textContent = act.filter((i) => isToday(i.activatedAt)).length;
  $("#sTotal").textContent = items.length;

  const info = catInfo();
  const allCats = info.map((c) => c.name);
  const chip = (c) => `<button class="chip ${filter.cat === c.name ? "on" : ""} ${c.hidden ? "is-hidden" : ""}" data-c="${esc(c.name)}"${c.hidden ? ' title="Menüde gizli"' : ""}>${esc(c.name)}<span class="n">${c.count}</span></button>`;
  const nDisc = items.filter((i) => i.discount).length;
  $("#catFilter").innerHTML =
    `<button class="chip ${filter.cat === "all" ? "on" : ""}" data-c="all">Tüm kategoriler<span class="n">${items.length}</span></button>` +
    (nDisc ? `<button class="chip disc-chip ${filter.cat === DISC ? "on" : ""}" data-c="${DISC}">İndirimde<span class="n">${nDisc}</span></button>` : "") +
    `<span class="chip-group"></span>` + info.filter((c) => c.count).map(chip).join("");
  if (filter.cat === DISC && !nDisc) filter.cat = "all";
  if (tabsUI?.el.isConnected) tabsUI.render();

  const q = filter.q.toLocaleLowerCase("tr");
  const list = items.filter((i) =>
    (filter.status === "all" || (filter.status === "on") === i.active) &&
    (filter.cat === "all" || (filter.cat === DISC ? !!i.discount : i.category === filter.cat)) &&
    (!q || (i.name + " " + i.desc + " " + i.category).toLocaleLowerCase("tr").includes(q)));

  if (!items.length) {
    $("#list").innerHTML = `<div class="empty"><div class="big">🍰</div><p>Henüz ürün yok.</p>
      <button class="btn primary" id="emptyAdd">＋ İlk ürünü ekle</button>
      <button class="btn" id="loadSamples">Örnek menüyü yükle</button></div>`;
    $("#emptyAdd").onclick = () => openEditor();
    $("#loadSamples").onclick = () => store.loadSamples().then(() => toast("Örnek menü yüklendi"));
    return;
  }
  if (!list.length) { $("#list").innerHTML = `<div class="empty"><p>Bu filtreye uyan ürün yok.</p></div>`; return; }

  $("#list").innerHTML = allCats.map((c) => {
    const rows = list.filter((i) => i.category === c).sort((a, b) => (!!b.discount - !!a.discount) || a.name.localeCompare(b.name, "tr"));
    if (!rows.length) return "";
    const allOn = rows.every((r) => r.active);
    const hidden = (settings.hiddenCategories || []).includes(c);
    return `<div class="group-h"><span class="gh-name">${esc(c)}${hidden ? ` <span class="badge">gizli</span>` : ""} <span class="gh-count">· ${rows.filter((r) => r.active).length}/${rows.length} aktif</span></span>
        <span class="sp"></span>
        <button class="btn sm ghost" data-bulk="${esc(c)}" data-to="${allOn ? 0 : 1}">${allOn ? "Hepsini kapat" : "Hepsini aç"}</button></div>` +
      rows.map(row).join("");
  }).join("");
}

function priceLabel(it) {
  const sz = normalizeSizes(it.sizes);
  const d = normalizeDiscount(it.discount);
  const v = sz ? Object.values(sz) : [it.price];
  const range = (arr) => (arr.length > 1 ? `${tl(Math.min(...arr))}–${Math.max(...arr)}` : tl(arr[0]));
  if (!d) return range(v);
  return `<s>${range(v)}</s> <b>${range(v.map((p) => discounted(p, d)))}</b>`;
}

function row(it) {
  const thumb = it.image ? `<img src="${esc(it.image)}" alt="" />` : esc(it.emoji);
  const meta = [it.desc, ...(it.tags || [])].filter(Boolean).join(" · ");
  const fresh = it.active && isToday(it.activatedAt) ? ` <span class="tag fresh">bugün</span>` : "";
  const d = normalizeDiscount(it.discount);
  const disc = d ? ` <span class="tag disc" title="${esc(discountLabel(d))}">${d.type === "pct" ? `%${d.value}` : `−₺${d.value}`}</span>` : "";
  return `<div class="row ${it.active ? "" : "off"}" data-id="${it.id}">
    <div class="thumb">${thumb}</div>
    <div class="info"><div class="name">${esc(it.name)}${disc}${fresh}</div><div class="meta">${esc(meta) || "&nbsp;"}</div></div>
    <div class="rp">${priceLabel(it)}</div>
    <label class="switch" title="${it.active ? "Menüden kaldır" : "Menüye ekle"}">
      <input type="checkbox" data-toggle ${it.active ? "checked" : ""} aria-label="${esc(it.name)} aktif" /><span></span>
    </label>
    <div class="acts">
      <button class="btn sm ghost" data-edit title="Düzenle">✎</button>
      <button class="btn sm ghost" data-dup title="Kopyala">⧉</button>
      <button class="btn sm ghost danger" data-del title="Sil">🗑</button>
    </div>
  </div>`;
}

/* ---------------------------- olaylar ----------------------------- */
$("#q").addEventListener("input", (e) => { filter.q = e.target.value; render(); });
$("#statusSeg").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  filter.status = b.dataset.s;
  [...$("#statusSeg").children].forEach((x) => x.classList.toggle("on", x === b));
  render();
});
$("#catFilter").addEventListener("click", (e) => {
  const b = e.target.closest(".chip"); if (!b) return;
  filter.cat = b.dataset.c; render();
});

$("#list").addEventListener("change", async (e) => {
  if (!e.target.matches("[data-toggle]")) return;
  const id = e.target.closest(".row").dataset.id;
  const it = data.items.find((x) => x.id === id);
  const on = e.target.checked;
  await store.updateItem(id, { active: on });
  toast(on ? `✅ ${it.name} menüye eklendi` : `⛔ ${it.name} tükendi olarak işaretlendi`);
});

$("#list").addEventListener("click", async (e) => {
  const bulk = e.target.closest("[data-bulk]");
  if (bulk) {
    const ids = data.items.filter((i) => i.category === bulk.dataset.bulk).map((i) => i.id);
    await store.setManyActive(ids, bulk.dataset.to === "1");
    return toast(`${bulk.dataset.bulk}: ${bulk.dataset.to === "1" ? "hepsi açıldı" : "hepsi kapatıldı"}`);
  }
  const r = e.target.closest(".row"); if (!r) return;
  const it = data.items.find((x) => x.id === r.dataset.id);
  if (e.target.closest("[data-edit]")) openEditor(it);
  if (e.target.closest("[data-dup]")) openEditor({ ...it, id: null, name: it.name + " (kopya)", active: false });
  if (e.target.closest("[data-del]")) {
    if (!confirm(`"${it.name}" kalıcı olarak silinsin mi?`)) return;
    await store.deleteItem(it.id);
    toast(`${it.name} silindi`, "Geri al", () => store.addItem(it));
  }
});

$("#addBtn").onclick = () => openEditor();

$("#dayEnd").onclick = async () => {
  const on = data.items.filter((i) => i.active);
  if (!on.length) return toast("Zaten aktif ürün yok");
  if (!confirm(`${on.length} ürünün hepsi pasife alınacak. Ertesi gün gelenleri tek tek açabilirsiniz. Devam?`)) return;
  const ids = on.map((i) => i.id);
  await store.setManyActive(ids, false);
  toast(`${ids.length} ürün pasife alındı`, "Geri al", () => store.setManyActive(ids, true));
};

$("#exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `pureblack-menu-yedek-${new Date().toISOString().slice(0, 10)}.json`,
  });
  a.click(); URL.revokeObjectURL(a.href);
  toast("Yedek indirildi");
};
$("#importFile").onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!Array.isArray(d.items)) throw 0;
    if (!confirm(`${d.items.length} ürün yüklenecek ve mevcut liste değiştirilecek. Devam?`)) return;
    await store.replaceAll(d);
    toast("Yedek yüklendi");
  } catch { toast("Geçersiz yedek dosyası"); }
  e.target.value = "";
};

/* ---------------------------- modallar ---------------------------- */
function modal(html) {
  const bd = document.createElement("div");
  bd.className = "backdrop";
  bd.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => { bd.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => e.key === "Escape" && close();
  bd.addEventListener("mousedown", (e) => e.target === bd && close());
  document.addEventListener("keydown", onKey);
  document.body.append(bd);
  bd.querySelectorAll("[data-close]").forEach((b) => (b.onclick = close));
  return { el: bd, close };
}

const NEW_CAT = "__new__";
// Kategori seçimi: Sekmeler sırasındaki liste + en altta "Yeni kategori"
function categoryOptions(selected) {
  return catInfo().map((c) =>
    `<option value="${esc(c.name)}" ${c.name === selected ? "selected" : ""}>${esc(c.name)}${c.hidden ? " (gizli)" : ""}</option>`).join("") +
    `<option value="${NEW_CAT}">＋ Yeni kategori…</option>`;
}

function openEditor(it = null) {
  const editing = !!it?.id;
  const startCat = filter.cat !== "all" && filter.cat !== DISC ? filter.cat : cats()[0];
  const v = it || { name: "", category: startCat, price: "", sizes: null, discount: null, desc: "", emoji: "🍰", image: "", active: true, tags: [] };
  const dv = normalizeDiscount(v.discount);
  const sz = normalizeSizes(v.sizes) || {};
  const useSizes = !!normalizeSizes(v.sizes);
  const m = modal(`
    <h3>${editing ? "Ürünü düzenle" : "Yeni ürün ekle"}</h3>
    <form id="ed">
      <label class="field"><span>Ürün adı *</span><input name="name" required maxlength="60" value="${esc(v.name)}" placeholder="örn. Fıstıklı Sarma" /></label>
      <div class="grid2">
        <label class="field"><span>Kategori</span>
          <select name="category" required>${categoryOptions(v.category)}</select>
        </label>
        <label class="field" id="singlePrice"><span>Fiyat (₺) *</span><input name="price" type="number" min="0" step="0.5" value="${esc(v.price)}" inputmode="decimal" /></label>
      </div>
      <div class="new-cat hidden" id="newCat">
        <label class="field"><span>Yeni kategori adı *</span><input name="newCat" maxlength="40" placeholder="örn. Pastalar" autocomplete="off" /></label>
      </div>
      <label class="inline"><span class="switch"><input type="checkbox" name="useSizes" ${useSizes ? "checked" : ""}/><span></span></span> Boyut fiyatları kullan</label>
      <div class="grid3" id="sizeFields">${SIZE_KEYS.map(([k, l, name]) => `<label class="field"><span>${name} (${l}) ₺</span><input name="size_${k}" type="number" min="0" step="0.5" value="${sz[k] ?? ""}" inputmode="decimal" /></label>`).join("")}</div>
      <div class="field disc-field"><span>İndirim (isteğe bağlı)</span>
        <div class="disc-row">
          <input name="discValue" type="number" min="0" step="0.5" inputmode="decimal" placeholder="Miktar" value="${dv ? dv.value : ""}" aria-label="İndirim miktarı" />
          <select name="discType" aria-label="İndirim türü">
            <option value="pct" ${dv?.type !== "tl" ? "selected" : ""}>% Yüzde</option>
            <option value="tl" ${dv?.type === "tl" ? "selected" : ""}>₺ TL</option>
          </select>
          <button type="button" class="btn sm ghost" id="discClear" ${dv ? "" : "hidden"}>Kaldır</button>
        </div>
        <div class="disc-preview" id="discPrev"></div>
      </div>
      <label class="field"><span>Açıklama</span><textarea name="desc" maxlength="160" placeholder="İçerik, servis şekli…">${esc(v.desc)}</textarea></label>
      <div class="field"><span>Simge</span><div class="emojis" id="emo">${EMOJIS.map((e) => `<button type="button" class="${e === v.emoji ? "on" : ""}">${e}</button>`).join("")}</div></div>
      <label class="field"><span>Fotoğraf bağlantısı (isteğe bağlı — simgenin yerine geçer)</span><input name="image" type="url" value="${esc(v.image)}" placeholder="https://…" /></label>
      <div class="field"><span>Etiketler</span><div class="checks">${TAGS.map((t) => `<label><input type="checkbox" name="tags" value="${t}" ${v.tags?.includes(t) ? "checked" : ""}/>${t}</label>`).join("")}</div></div>
      <label class="inline"><span class="switch"><input type="checkbox" name="active" ${v.active ? "checked" : ""}/><span></span></span> Hemen menüde göster</label>
      <div class="actions">
        <button type="button" class="btn" data-close>Vazgeç</button>
        <button class="btn primary" type="submit">${editing ? "Kaydet" : "Ekle"}</button>
      </div>
    </form>`);
  let emoji = v.emoji;
  $("#emo", m.el).addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    emoji = b.textContent;
    $("#emo", m.el).querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
  });
  const sizeToggle = $("[name=useSizes]", m.el);
  const syncSizes = () => {
    const on = sizeToggle.checked;
    $("#sizeFields", m.el).classList.toggle("hidden", !on);
    $("#singlePrice", m.el).classList.toggle("disabled", on);
    $("[name=price]", m.el).required = !on;
    $("[name=price]", m.el).disabled = on;
  };
  sizeToggle.addEventListener("change", syncSizes);
  syncSizes();
  // İndirim önizlemesi: eski → yeni fiyat
  const form = $("#ed", m.el);
  const currentPrices = () => {
    if (sizeToggle.checked) {
      return SIZE_KEYS.map(([k, l]) => [l, Number(form.elements[`size_${k}`].value)]).filter(([, p]) => p > 0);
    }
    const p = Number(form.elements.price.value);
    return p > 0 ? [["", p]] : [];
  };
  const readDiscount = () => normalizeDiscount({ type: form.elements.discType.value, value: form.elements.discValue.value });
  const discError = () => {
    const raw = Number(form.elements.discValue.value);
    if (!form.elements.discValue.value || raw === 0) return "";
    if (raw < 0) return "İndirim eksi olamaz";
    if (form.elements.discType.value === "pct" && raw >= 100) return "Yüzde 1–99 arasında olmalı";
    const prices = currentPrices().map(([, p]) => p);
    if (form.elements.discType.value === "tl" && prices.length && raw >= Math.min(...prices)) return "TL indirim fiyattan küçük olmalı";
    return "";
  };
  const syncDisc = () => {
    const d = readDiscount(), err = discError(), prev = $("#discPrev", m.el);
    $("#discClear", m.el).hidden = !form.elements.discValue.value;
    prev.classList.toggle("err", !!err);
    if (err) { prev.textContent = err; return; }
    if (!d) { prev.textContent = ""; return; }
    const prices = currentPrices();
    prev.innerHTML = prices.length
      ? prices.map(([l, p]) => `${l ? `<b>${l}</b> ` : ""}<s>${tl(p)}</s> → <strong>${tl(discounted(p, d))}</strong>`).join(" · ") + ` <em>(${esc(discountLabel(d))})</em>`
      : `${esc(discountLabel(d))} — fiyat girince yeni fiyat burada görünür`;
  };
  form.addEventListener("input", syncDisc);
  form.addEventListener("change", syncDisc);
  $("#discClear", m.el).onclick = () => { form.elements.discValue.value = ""; syncDisc(); };
  syncDisc();
  // "＋ Yeni kategori…" seçilince ad ve grup alanlarını aç
  const catSel = $("[name=category]", m.el), newCatInput = $("[name=newCat]", m.el);
  catSel.addEventListener("change", () => {
    const isNew = catSel.value === NEW_CAT;
    $("#newCat", m.el).classList.toggle("hidden", !isNew);
    newCatInput.required = isNew;
    if (isNew) newCatInput.focus();
  });
  if (catSel.value === NEW_CAT) catSel.dispatchEvent(new Event("change")); // hiç kategori yoksa
  $("[name=name]", m.el).focus();
  $("#ed", m.el).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const sizes = sizeToggle.checked ? normalizeSizes({ s: f.get("size_s"), m: f.get("size_m"), l: f.get("size_l") }) : null;
    if (sizeToggle.checked && !sizes) { toast("En az bir boyut fiyatı girin"); return; }
    const dErr = discError();
    if (dErr) { toast(dErr); form.elements.discValue.focus(); return; }
    const discount = readDiscount();
    let category = f.get("category");
    if (category === NEW_CAT) {
      const name = f.get("newCat").trim();
      const existing = cats().find((c) => trLower(c) === trLower(name));
      if (existing) {
        // Aynı ad (büyük/küçük harf farkıyla) zaten var: yeni sekme açma, mevcut olanı seç
        catSel.value = existing; catSel.dispatchEvent(new Event("change"));
        toast(`"${existing}" zaten var, listeden seçildi. Tekrar kaydedin.`);
        return;
      }
      await store.saveSettings({ categories: [...cats(), name] });
      category = name;
    }
    const out = {
      name: f.get("name").trim(), category,
      price: sizes ? (sizes.m ?? sizes.s ?? sizes.l) : Number(f.get("price")), sizes, discount,
      desc: f.get("desc").trim(), image: f.get("image").trim(), emoji,
      tags: f.getAll("tags"), active: f.get("active") === "on",
    };
    if (editing) await store.updateItem(it.id, out);
    else await store.addItem(out);
    m.close();
    toast(editing ? `${out.name} güncellendi` : `${out.name} eklendi${out.active ? " ve menüde" : ""}`);
  });
}

$("#settingsBtn").onclick = () => {
  const s = data.settings;
  const m = modal(`
    <h3>Ayarlar</h3>
    <form id="st">
      <label class="field"><span>Kafe adı</span><input name="cafeName" required value="${esc(s.cafeName)}" /></label>
      <label class="field"><span>Alt başlık</span><input name="tagline" value="${esc(s.tagline)}" /></label>
      <label class="inline"><span class="switch"><input type="checkbox" name="showSoldOut" ${s.showSoldOut ? "checked" : ""}/><span></span></span> Pasif ürünleri menüde "Tükendi" olarak göster</label>
      <div class="actions">
        <button type="button" class="btn" data-close>Vazgeç</button>
        <button class="btn primary" type="submit">Kaydet</button>
      </div>
    </form>`);
  $("#st", m.el).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    await store.saveSettings({
      cafeName: f.get("cafeName").trim(), tagline: f.get("tagline").trim(),
      showSoldOut: f.get("showSoldOut") === "on",
    });
    m.close(); toast("Ayarlar kaydedildi");
  });
};

/* ---------------------------- sekmeler ---------------------------- */
$("#tabsBtn").onclick = openTabs;

const trLower = (s) => s.toLocaleLowerCase("tr");
const catSnapshot = () => {
  const s = data.settings;
  return { categories: [...(s.categories || [])], hiddenCategories: [...(s.hiddenCategories || [])] };
};
const nameTaken = (name, except) => cats().some((c) => c !== except && trLower(c) === trLower(name));

function openTabs() {
  const m = modal(`
    <h3>Sekmeler</h3>
    <p class="modal-sub">Sırayı ↑ ↓ ile${matchMedia("(pointer: fine)").matches ? " ya da sürükleyerek" : ""} değiştirin. Gizli sekmeler müşteri menüsünde görünmez, ürünleri silinmez.</p>
    <div class="tab-list" id="tabList"></div>
    <form class="tab-new" id="newTab">
      <input name="name" maxlength="40" placeholder="＋ Yeni sekme adı yazıp Enter'a basın" autocomplete="off" />
    </form>
    <div class="actions"><button class="btn primary" data-close>Bitti</button></div>`);
  m.el.querySelector(".modal").classList.add("wide");
  const ui = { el: m.el, editing: null, deleting: null, render: () => renderTabs(ui) };
  tabsUI = ui;
  ui.render();

  const listEl = $("#tabList", m.el);

  // Satır butonları
  listEl.addEventListener("click", async (e) => {
    const rowEl = e.target.closest("[data-name]");
    if (!rowEl) return;
    const name = rowEl.dataset.name;
    const info = catInfo();
    const c = info.find((x) => x.name === name);
    if (e.target.closest("[data-up], [data-down]")) {
      const order = info.map((x) => x.name);
      const i = order.indexOf(name), j = i + (e.target.closest("[data-up]") ? -1 : 1);
      if (j < 0 || j >= order.length) return;
      [order[i], order[j]] = [order[j], order[i]];
      await store.saveSettings({ categories: order });
      toast(`${name} ${j < i ? "yukarı" : "aşağı"} taşındı`);
    } else if (e.target.closest("[data-ren]")) {
      ui.editing = name; ui.deleting = null; ui.render();
      const inp = $(".ren", listEl); inp.focus(); inp.select();
    } else if (e.target.closest("[data-hide]")) {
      const hidden = new Set(data.settings.hiddenCategories || []);
      const nowHidden = !hidden.has(name);
      nowHidden ? hidden.add(name) : hidden.delete(name);
      await store.saveSettings({ hiddenCategories: [...hidden] });
      toast(nowHidden ? `${name} menüde gizlendi` : `${name} menüde gösteriliyor`);
    } else if (e.target.closest("[data-del]")) {
      if (!c.count) return deleteTab(name, { withItems: false });
      ui.deleting = ui.deleting === name ? null : name; ui.editing = null; ui.render();
    } else if (e.target.closest("[data-del-cancel]")) {
      ui.deleting = null; ui.render();
    } else if (e.target.closest("[data-del-go]")) {
      const panel = e.target.closest(".del-panel");
      const mode = $("input[name=delmode]:checked", panel).value;
      if (mode === "move") await deleteTab(name, { moveTo: $("select[name=moveTo]", panel).value });
      else await deleteTab(name, { withItems: true });
    }
  });

  // Yeniden adlandırma: Enter kaydeder, Esc vazgeçer
  let committing = false;
  const commitRename = async (inp) => {
    if (committing || !ui.editing) return;
    const from = ui.editing, to = inp.value.trim();
    if (!to || to === from) { ui.editing = null; return ui.render(); }
    if (nameTaken(to, from)) { toast(`"${to}" adında bir sekme zaten var`); inp.focus(); return; }
    committing = true;
    const n = data.items.filter((i) => i.category === from).length;
    ui.editing = null;
    await store.renameCategory(from, to);
    committing = false;
    toast(`"${from}" → "${to}"${n ? ` · ${n} ürün güncellendi` : ""}`);
  };
  listEl.addEventListener("keydown", (e) => {
    if (!e.target.matches(".ren")) return;
    if (e.key === "Enter") { e.preventDefault(); commitRename(e.target); }
    if (e.key === "Escape") { e.stopPropagation(); ui.editing = null; ui.render(); }
  });
  listEl.addEventListener("focusout", (e) => { if (e.target.matches(".ren") && e.target.isConnected) commitRename(e.target); });

  // Sürükle-bırak (masaüstü)
  let dragName = null;
  listEl.addEventListener("dragstart", (e) => {
    const r = e.target.closest(".tab-row"); if (!r) return;
    dragName = r.dataset.name; r.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragName);
  });
  listEl.addEventListener("dragend", () => { dragName = null; listEl.querySelectorAll(".dragging, .drop-before, .drop-after").forEach((x) => x.classList.remove("dragging", "drop-before", "drop-after")); });
  const dropTarget = (e) => {
    const t = e.target.closest(".tab-row");
    if (!t || t.dataset.name === dragName) return null;
    const after = e.clientY > t.getBoundingClientRect().top + t.offsetHeight / 2;
    return { t, after };
  };
  listEl.addEventListener("dragover", (e) => {
    if (!dragName) return;
    const d = dropTarget(e); if (!d) return;
    e.preventDefault();
    listEl.querySelectorAll(".drop-before, .drop-after").forEach((x) => x.classList.remove("drop-before", "drop-after"));
    d.t.classList.add(d.after ? "drop-after" : "drop-before");
  });
  listEl.addEventListener("drop", async (e) => {
    if (!dragName) return;
    const d = dropTarget(e); if (!d) return;
    e.preventDefault();
    const order = cats().filter((n) => n !== dragName);
    order.splice(order.indexOf(d.t.dataset.name) + (d.after ? 1 : 0), 0, dragName);
    const name = dragName;
    await store.saveSettings({ categories: order });
    toast(`${name} taşındı`);
  });

  // Yeni sekme
  $("#newTab", m.el).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const name = f.get("name").trim();
    if (!name) return;
    if (nameTaken(name)) return toast(`"${name}" adında bir sekme zaten var`);
    await store.saveSettings({ categories: [...cats(), name] });
    e.target.elements.name.value = "";
    toast(`${name} sekmesi eklendi`);
  });
}

async function deleteTab(name, { withItems = false, moveTo = null }) {
  const snap = catSnapshot();
  const affected = data.items.filter((i) => i.category === name).map((i) => ({ ...i }));
  if (tabsUI) tabsUI.deleting = null;
  if (moveTo) await store.moveCategory(name, moveTo);
  else await store.deleteCategory(name, { withItems });
  const msg = moveTo ? `${name} silindi · ${affected.length} ürün "${moveTo}" sekmesine taşındı`
    : withItems ? `${name} ve ${affected.length} ürünü silindi` : `${name} sekmesi silindi`;
  toast(msg, "Geri al", () => store.restore({ items: affected, settings: snap }).then(() => toast(`${name} geri getirildi`)));
}

function renderTabs(ui) {
  const info = catInfo();
  const listEl = $("#tabList", ui.el);
  const dnd = matchMedia("(pointer: fine)").matches;
  listEl.innerHTML = info.length
    ? info.map((c, i) => tabRow(c, i, info.length, ui, info, dnd)).join("")
    : `<div class="tab-empty">Henüz sekme yok — aşağıdan ekleyin.</div>`;
}

function tabRow(c, i, n, ui, info, dnd) {
  const editing = ui.editing === c.name;
  const others = info.filter((x) => x.name !== c.name);
  const sameFirst = others[0];
  const name = editing
    ? `<input class="ren" value="${esc(c.name)}" maxlength="40" aria-label="Yeni ad" />`
    : `<b>${esc(c.name)}</b><span class="cnt"> · ${c.count} ürün</span>${c.hidden ? `<span class="badge">gizli</span>` : ""}`;
  const del = ui.deleting === c.name ? `
    <div class="del-panel">
      <div class="del-q"><b>${esc(c.name)}</b> sekmesinde ${c.count} ürün var. Ne yapılsın?</div>
      <label class="radio ${others.length ? "" : "disabled"}"><input type="radio" name="delmode" value="move" ${others.length ? "checked" : "disabled"} />
        Ürünleri şu sekmeye taşı:
        <select name="moveTo" ${others.length ? "" : "disabled"}>${others.map((x) => `<option value="${esc(x.name)}" ${x === sameFirst ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select>
      </label>
      <label class="radio"><input type="radio" name="delmode" value="all" ${others.length ? "" : "checked"} /> Ürünleriyle birlikte sil</label>
      <div class="del-acts"><button type="button" class="btn sm" data-del-cancel>Vazgeç</button><button type="button" class="btn sm danger-solid" data-del-go>Sekmeyi sil</button></div>
    </div>` : "";
  return `<div class="tab-wrap" data-name="${esc(c.name)}">
    <div class="tab-row ${c.hidden ? "is-hidden" : ""}" data-name="${esc(c.name)}" ${dnd && !editing ? 'draggable="true"' : ""}>
      ${dnd ? `<span class="grip" aria-hidden="true">⋮⋮</span>` : ""}
      <div class="tab-name">${name}</div>
      <div class="tab-acts">
        <button type="button" class="ib" data-up title="Yukarı" ${i === 0 ? "disabled" : ""}>↑</button>
        <button type="button" class="ib" data-down title="Aşağı" ${i === n - 1 ? "disabled" : ""}>↓</button>
        <button type="button" class="ib" data-ren title="Yeniden adlandır">✎</button>
        <button type="button" class="ib emo ${c.hidden ? "off" : ""}" data-hide title="${c.hidden ? "Menüde göster" : "Menüde gizle"}">👁</button>
        <button type="button" class="ib emo" data-del title="Sil">🗑</button>
      </div>
    </div>${del}
  </div>`;
}

/* ------------------------- indirim afişleri ------------------------ */
$("#bannerBtn").onclick = () => {
  const list = data.items.filter((i) => i.discount).sort((a, b) => a.name.localeCompare(b.name, "tr"));
  if (!list.length) return toast("İndirimli ürün yok. Ürünü düzenleyip İndirim alanını doldurun.");
  const m = modal(`
    <h3>İndirim afişleri</h3>
    <p class="modal-sub">Afişe basılacak ürünleri ve kâğıt düzenini seçin. Açılan sayfada Yazdır'a basın (PDF olarak da kaydedebilirsiniz).</p>
    <form id="bn">
      <div class="banner-pick">${list.map((it) => {
        const d = normalizeDiscount(it.discount);
        return `<label class="pick"><input type="checkbox" name="ids" value="${it.id}" checked />
          <span class="pick-name">${esc(it.name)}${it.active ? "" : ` <span class="badge">pasif</span>`}</span>
          <span class="pick-price">${priceLabel(it)}</span>
          <span class="tag disc">${d.type === "pct" ? `%${d.value}` : `−₺${d.value}`}</span></label>`;
      }).join("")}</div>
      <div class="field" style="margin-top:14px"><span>Kâğıt düzeni (A4)</span>
        <div class="seg layout-seg">
          <label><input type="radio" name="size" value="a4" checked /><span>Büyük afiş<small>1 / sayfa</small></span></label>
          <label><input type="radio" name="size" value="a5" /><span>Yarım sayfa<small>2 / sayfa</small></span></label>
          <label><input type="radio" name="size" value="card" /><span>Masa kartı<small>4 / sayfa</small></span></label>
        </div>
      </div>
      <div class="actions">
        <button type="button" class="btn" data-close>Vazgeç</button>
        <button class="btn primary" type="submit">⎙ Afişleri hazırla</button>
      </div>
    </form>`);
  $("#bn", m.el).addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const ids = f.getAll("ids");
    if (!ids.length) return toast("En az bir ürün seçin");
    window.open(`afis.html?size=${f.get("size")}&ids=${ids.join(",")}`, "_blank");
    m.close();
  });
};

$("#qrBtn").onclick = () => {
  const url = new URL("index.html", location.href).href;
  modal(`
    <h3>Masa QR kodu</h3>
    <div class="qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=440x440&margin=0&data=${encodeURIComponent(url)}" alt="Menü QR kodu" />
      <code>${esc(url)}</code>
      <p style="color:var(--muted);font-size:13px">Yazdırıp masalara koyun — müşteri okutunca canlı menü açılır.</p>
    </div>
    <div class="actions"><button class="btn" onclick="window.print()">⎙ Yazdır</button><button class="btn primary" data-close>Kapat</button></div>`);
};

/* ----------------------------- toast ------------------------------ */
function toast(msg, actionLabel, action) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span>${esc(msg)}</span>`;
  if (actionLabel) {
    const b = document.createElement("button");
    b.textContent = actionLabel;
    b.onclick = () => { action(); t.remove(); };
    t.append(b);
  }
  $("#toasts").append(t);
  setTimeout(() => t.remove(), actionLabel ? 6000 : 2600);
}

// En sonda abone ol: render() yukarıdaki tüm tanımları kullanır
store.subscribe((d) => { data = d; render(); });
