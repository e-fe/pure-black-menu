// Veri katmanı: aynı arayüz, iki arka uç.
//  - LocalStore    : tarayıcı içi (demo / sunum)
//  - FirebaseStore : Firestore (gerçek kafe kullanımı, tüm cihazlar canlı)
import { FIREBASE_CONFIG, ADMIN_PIN } from "./config.js";
import { SEED_ITEMS, DEFAULT_SETTINGS } from "./seed.js";

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function isToday(ts) {
  if (!ts) return false;
  const d = new Date(ts), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

// Boyut fiyatları: { s, m, l } (Küçük / Orta / Büyük). Hiçbiri dolu değilse null.
export const SIZE_KEYS = [["s", "S", "Küçük"], ["m", "M", "Orta"], ["l", "L", "Büyük"]];
export function normalizeSizes(sz) {
  if (!sz || typeof sz !== "object") return null;
  const out = {};
  SIZE_KEYS.forEach(([k]) => { const n = Number(sz[k]); if (n > 0) out[k] = n; });
  return Object.keys(out).length ? out : null;
}

// İndirim: { type: "tl" | "pct", value } ya da null.
//  - pct: 1–99 arası yüzde
//  - tl : fiyattan düşülecek tutar (fiyatın altında kalmalı)
export function normalizeDiscount(d) {
  if (!d || typeof d !== "object") return null;
  const type = d.type === "tl" ? "tl" : "pct";
  const value = Math.round(Number(d.value) * 100) / 100;
  if (!(value > 0)) return null;
  if (type === "pct" && value >= 100) return null;
  return { type, value };
}
// İndirimli fiyat (tam liraya yuvarlanır, 0'ın altına inmez)
export function discounted(price, d) {
  if (!d) return price;
  const p = d.type === "tl" ? price - d.value : price * (1 - d.value / 100);
  return Math.max(0, Math.round(p));
}
export const discountLabel = (d) => (d.type === "tl" ? `₺${d.value.toLocaleString("tr-TR")} indirim` : `%${d.value.toLocaleString("tr-TR")} indirim`);

export function normalizeItem(it) {
  const sizes = normalizeSizes(it.sizes);
  return {
    id: it.id || uid(),
    name: String(it.name || "").trim(),
    category: it.category || "Tatlılar",
    price: sizes ? (sizes.m ?? sizes.s ?? sizes.l) : Number(it.price) || 0,
    sizes,
    discount: normalizeDiscount(it.discount),
    desc: String(it.desc || "").trim(),
    emoji: it.emoji || "🍰",
    image: it.image || "",
    active: !!it.active,
    tags: Array.isArray(it.tags) ? it.tags : [],
    createdAt: it.createdAt || Date.now(),
    updatedAt: Date.now(),
    activatedAt: it.activatedAt ?? (it.active ? Date.now() : null),
  };
}

/* ------------------------------------------------------------------ */
/*  Sekmeler (kategoriler)                                             */
/* ------------------------------------------------------------------ */
// Sıralı sekme listesi: ayardaki sıra; ayarda olmayan ama ürünlerde geçen kategoriler sona eklenir.
export function categoryList(settings, items) {
  const order = settings.categories || [];
  const present = [...new Set(items.map((i) => i.category))];
  const hidden = settings.hiddenCategories || [];
  const all = [...order, ...present.filter((c) => !order.includes(c))];
  return all.map((name) => ({
    name,
    hidden: hidden.includes(name),
    count: items.filter((i) => i.category === name).length,
  }));
}

// Sekme ayarlarını bir sekmeden diğerine taşır / siler (saf fonksiyonlar)
function settingsRename(s, from, to) {
  const uniq = (arr) => [...new Set(arr)];
  return {
    categories: uniq((s.categories || []).map((c) => (c === from ? to : c))),
    hiddenCategories: uniq((s.hiddenCategories || []).map((c) => (c === from ? to : c))),
  };
}
function settingsRemove(s, name) {
  return {
    categories: (s.categories || []).filter((c) => c !== name),
    hiddenCategories: (s.hiddenCategories || []).filter((c) => c !== name),
  };
}

/* ------------------------------------------------------------------ */
/*  LocalStore                                                         */
/* ------------------------------------------------------------------ */
const KEY = "pureblack-menu-v4"; // v4: örnek fotoğraflı tatlı menüsü
const AUTH_KEY = "pureblack-menu-auth";

class LocalStore {
  mode = "demo";
  #subs = new Set();
  #chan = "BroadcastChannel" in window ? new BroadcastChannel(KEY) : null;

  async init() {
    if (!this.#read()) this.#write({ items: SEED_ITEMS, settings: DEFAULT_SETTINGS }, false);
    // Diğer sekmeler / iframe'ler değiştirince güncelle
    window.addEventListener("storage", (e) => { if (e.key === KEY) this.#emit(); });
    this.#chan?.addEventListener("message", () => this.#emit());
  }
  #read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  }
  #write(data, broadcast = true) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      // Tarayıcı hafızası doldu (çoğunlukla çok sayıda fotoğraf): hiçbir şey kaydedilmez
      if (e?.name === "QuotaExceededError" || e?.code === 22) throw Object.assign(new Error("QUOTA"), { quota: true });
      throw e;
    }
    this.#emit();
    if (broadcast) this.#chan?.postMessage("changed");
  }
  #emit() {
    const d = this.#read() || { items: [], settings: DEFAULT_SETTINGS };
    d.settings = { ...DEFAULT_SETTINGS, ...d.settings };
    this.#subs.forEach((cb) => cb(d));
  }
  subscribe(cb) { this.#subs.add(cb); this.#emit(); return () => this.#subs.delete(cb); }

  #mutate(fn) { const d = this.#read(); fn(d); this.#write(d); }
  async addItem(item) { this.#mutate((d) => d.items.push(normalizeItem(item))); }
  async updateItem(id, patch) {
    this.#mutate((d) => {
      const it = d.items.find((x) => x.id === id);
      if (!it) return;
      if ("active" in patch && patch.active && !it.active) patch.activatedAt = Date.now();
      if ("sizes" in patch) patch.sizes = normalizeSizes(patch.sizes);
      if ("discount" in patch) patch.discount = normalizeDiscount(patch.discount);
      Object.assign(it, patch, { updatedAt: Date.now() });
    });
  }
  async deleteItem(id) { this.#mutate((d) => (d.items = d.items.filter((x) => x.id !== id))); }
  async setManyActive(ids, active) {
    this.#mutate((d) => d.items.forEach((it) => {
      if (!ids.includes(it.id)) return;
      if (active && !it.active) it.activatedAt = Date.now();
      it.active = active; it.updatedAt = Date.now();
    }));
  }
  async saveSettings(s) { this.#mutate((d) => (d.settings = { ...d.settings, ...s })); }
  async replaceAll(data) {
    this.#write({ items: (data.items || []).map(normalizeItem), settings: { ...DEFAULT_SETTINGS, ...data.settings } });
  }
  async loadSamples() { this.#mutate((d) => d.items.push(...SEED_ITEMS.map((x) => normalizeItem({ ...x, id: uid() })))); }

  #settings(d) { return { ...DEFAULT_SETTINGS, ...d.settings }; }
  async renameCategory(from, to) {
    this.#mutate((d) => {
      const now = Date.now();
      d.items.forEach((it) => { if (it.category === from) { it.category = to; it.updatedAt = now; } });
      d.settings = { ...this.#settings(d), ...settingsRename(this.#settings(d), from, to) };
    });
  }
  async moveCategory(from, to) {
    this.#mutate((d) => {
      const now = Date.now();
      d.items.forEach((it) => { if (it.category === from) { it.category = to; it.updatedAt = now; } });
      d.settings = { ...this.#settings(d), ...settingsRemove(this.#settings(d), from) };
    });
  }
  async deleteCategory(name, { withItems = false } = {}) {
    this.#mutate((d) => {
      if (withItems) d.items = d.items.filter((it) => it.category !== name);
      d.settings = { ...this.#settings(d), ...settingsRemove(this.#settings(d), name) };
    });
  }
  // Geri alma: verilen ürünleri (id ile) geri yazar, ayarları değiştirir
  async restore({ items = [], settings }) {
    this.#mutate((d) => {
      items.forEach((it) => {
        const i = d.items.findIndex((x) => x.id === it.id);
        if (i >= 0) d.items[i] = it; else d.items.push(it);
      });
      if (settings) d.settings = { ...this.#settings(d), ...settings };
    });
  }

  // Basit PIN girişi (demo amaçlı)
  isLoggedIn() { return sessionStorage.getItem(AUTH_KEY) === "1"; }
  async login(_email, pin) {
    if (pin !== ADMIN_PIN) throw new Error("Şifre hatalı");
    sessionStorage.setItem(AUTH_KEY, "1");
  }
  async logout() { sessionStorage.removeItem(AUTH_KEY); }
  onAuth(cb) { cb(this.isLoggedIn()); }
}

/* ------------------------------------------------------------------ */
/*  FirebaseStore                                                      */
/* ------------------------------------------------------------------ */
const FB = "https://www.gstatic.com/firebasejs/10.12.2/";

class FirebaseStore {
  mode = "live";
  #items = []; #settings = DEFAULT_SETTINGS; #subs = new Set(); #user = null;

  async init() {
    const { initializeApp } = await import(FB + "firebase-app.js");
    this.fs = await import(FB + "firebase-firestore.js");
    this.au = await import(FB + "firebase-auth.js");
    const app = initializeApp(FIREBASE_CONFIG);
    this.db = this.fs.getFirestore(app);
    this.auth = this.au.getAuth(app);
    const { collection, doc, onSnapshot } = this.fs;
    this.col = collection(this.db, "items");
    this.setDoc = doc(this.db, "config", "settings");
    onSnapshot(this.col, (snap) => { this.#items = snap.docs.map((d) => ({ ...d.data(), id: d.id })); this.#emit(); });
    onSnapshot(this.setDoc, (snap) => { this.#settings = { ...DEFAULT_SETTINGS, ...(snap.data() || {}) }; this.#emit(); });
  }
  #emit() { const d = { items: this.#items, settings: this.#settings }; this.#subs.forEach((cb) => cb(d)); }
  subscribe(cb) { this.#subs.add(cb); this.#emit(); return () => this.#subs.delete(cb); }

  async addItem(item) {
    const it = normalizeItem(item);
    await this.fs.setDoc(this.fs.doc(this.col, it.id), it);
  }
  async updateItem(id, patch) {
    const cur = this.#items.find((x) => x.id === id);
    if ("active" in patch && patch.active && cur && !cur.active) patch.activatedAt = Date.now();
    if ("sizes" in patch) patch.sizes = normalizeSizes(patch.sizes);
    if ("discount" in patch) patch.discount = normalizeDiscount(patch.discount);
    await this.fs.updateDoc(this.fs.doc(this.col, id), { ...patch, updatedAt: Date.now() });
  }
  async deleteItem(id) { await this.fs.deleteDoc(this.fs.doc(this.col, id)); }
  async setManyActive(ids, active) {
    const b = this.fs.writeBatch(this.db);
    ids.forEach((id) => {
      const cur = this.#items.find((x) => x.id === id);
      const patch = { active, updatedAt: Date.now() };
      if (active && cur && !cur.active) patch.activatedAt = Date.now();
      b.update(this.fs.doc(this.col, id), patch);
    });
    await b.commit();
  }
  async saveSettings(s) { await this.fs.setDoc(this.setDoc, s, { merge: true }); }
  async replaceAll(data) {
    const b = this.fs.writeBatch(this.db);
    this.#items.forEach((it) => b.delete(this.fs.doc(this.col, it.id)));
    (data.items || []).map(normalizeItem).forEach((it) => b.set(this.fs.doc(this.col, it.id), it));
    b.set(this.setDoc, { ...DEFAULT_SETTINGS, ...data.settings });
    await b.commit();
  }
  // Sekme işlemleri: ürünler ve ayarlar tek writeBatch ile yazılır.
  // Ayar dokümanı tamamen yazılır (merge yok), böylece silinen anahtarlar da kalkar.
  #catBatch(fn, settingsPatch) {
    const b = this.fs.writeBatch(this.db);
    fn(b);
    b.set(this.setDoc, { ...this.#settings, ...settingsPatch });
    return b.commit();
  }
  #moveItems(b, from, to) {
    const now = Date.now();
    this.#items.filter((it) => it.category === from)
      .forEach((it) => b.update(this.fs.doc(this.col, it.id), { category: to, updatedAt: now }));
  }
  async renameCategory(from, to) {
    await this.#catBatch((b) => this.#moveItems(b, from, to), settingsRename(this.#settings, from, to));
  }
  async moveCategory(from, to) {
    await this.#catBatch((b) => this.#moveItems(b, from, to), settingsRemove(this.#settings, from));
  }
  async deleteCategory(name, { withItems = false } = {}) {
    await this.#catBatch((b) => {
      if (withItems) this.#items.filter((it) => it.category === name).forEach((it) => b.delete(this.fs.doc(this.col, it.id)));
    }, settingsRemove(this.#settings, name));
  }
  async restore({ items = [], settings }) {
    await this.#catBatch((b) => items.forEach((it) => b.set(this.fs.doc(this.col, it.id), it)), settings || {});
  }

  async loadSamples() {
    const b = this.fs.writeBatch(this.db);
    SEED_ITEMS.forEach((x) => { const it = normalizeItem({ ...x, id: uid(), activatedAt: x.activatedAt }); b.set(this.fs.doc(this.col, it.id), it); });
    await b.commit();
  }

  isLoggedIn() { return !!this.#user; }
  async login(email, pass) { await this.au.signInWithEmailAndPassword(this.auth, email, pass); }
  async logout() { await this.au.signOut(this.auth); }
  onAuth(cb) { this.au.onAuthStateChanged(this.auth, (u) => { this.#user = u; cb(!!u); }); }
}

/* ------------------------------------------------------------------ */
export async function createStore() {
  const s = FIREBASE_CONFIG ? new FirebaseStore() : new LocalStore();
  await s.init();
  return s;
}
