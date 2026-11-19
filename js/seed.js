// İlk açılışta yüklenen örnek tatlı menüsü. Panelden hepsi düzenlenebilir / silinebilir.
// Fiyatlar örnektir (2026, sahil kafe seviyesi).
export const DEFAULT_CATEGORIES = [
  "Pastalar & Kekler",
  "Cheesecake",
  "Sütlü Tatlılar",
  "Şerbetli Tatlılar",
  "Dondurma & Waffle",
  "Kurabiye & Kurular",
];

// Örnekler "dün eklenmiş" sayılır; böylece "Bugün geldi" rozeti yalnızca
// personelin gün içinde aktife aldığı ürünlerde görünür.
const now = Date.now() - 24 * 60 * 60 * 1000;

// opts: { tags, sizes: [Küçük, Orta, Büyük], discount: { type: "pct" | "tl", value }, image }
// Örnek fotoğraflar img/ klasöründe (Unsplash lisanslı, kaynaklar README'de); kendi fotoğraflarınızla değiştirin.
const mk = (name, category, price, desc, emoji, active, { tags = [], sizes = null, discount = null, image = "" } = {}) => ({
  id: Math.random().toString(36).slice(2, 10),
  name, category,
  price: sizes ? sizes[1] : price,
  sizes: sizes ? { s: sizes[0], m: sizes[1], l: sizes[2] } : null,
  discount,
  desc, emoji, image,
  active, tags,
  createdAt: now, updatedAt: now,
  activatedAt: active ? now : null,
});

const PK = "Pastalar & Kekler", CC = "Cheesecake", ST = "Sütlü Tatlılar",
  SR = "Şerbetli Tatlılar", DW = "Dondurma & Waffle", KK = "Kurabiye & Kurular";

export const SEED_ITEMS = [
  // Pastalar & Kekler
  mk("Pure Black Kakao Pasta", PK, 190, "İmza pastamız: siyah kakaolu pandispanya, bitter ganaj, espresso şurubu.", "🍫", true, { tags: ["imza", "çok satan"] }),
  mk("Tiramisu", PK, 160, "Mascarpone, espresso ve kakao. Günlük hazırlanır.", "☕", true),
  mk("Ekler Pasta", PK, 150, "Bol kremalı, sıcak çikolata soslu.", "🍫", true, { discount: { type: "pct", value: 10 }, image: "img/ekler.jpg" }),
  mk("Profiterol", PK, 150, "Kremalı top hamurlar, bol çikolata sosu.", "🍮", true),
  mk("Islak Kek (Brownie)", PK, 120, "Sıcak servis, yanında dondurma ile.", "🟫", true, { tags: ["sıcak"] }),
  mk("Havuçlu Tarçınlı Kek", PK, 110, "Cevizli, krem peynir kaplamalı.", "🥕", true),
  mk("Çikolatalı Sufle", PK, 170, "Akışkan içli, 12 dakikada fırından.", "🍫", false, { tags: ["sıcak"] }),

  // Cheesecake
  mk("San Sebastian", CC, 185, "Yanık yüzeyli, akışkan Bask cheesecake. Belçika çikolata sosuyla.", "🍰", true, { tags: ["çok satan"], discount: { type: "pct", value: 15 }, image: "img/san-sebastian.jpg" }),
  mk("Frambuazlı Cheesecake", CC, 170, "Taze frambuaz sosu, tereyağlı bisküvi tabanı.", "🍓", true),
  mk("Limonlu Cheesecake", CC, 170, "Limon kreması, hafif ve ferah.", "🍋", true),
  mk("Antep Fıstıklı Cheesecake", CC, 195, "Fıstık kreması ve kavrulmuş fıstık.", "🍰", true, { tags: ["yeni"] }),
  mk("Lotus Cheesecake", CC, 175, "Karamelize bisküvi kreması ve kırıntısı.", "🧁", false),

  // Sütlü Tatlılar
  mk("Kazandibi", ST, 120, "Geleneksel usul, karamelize tabanlı.", "🍮", true, { discount: { type: "tl", value: 20 }, image: "img/kazandibi.jpg" }),
  mk("Fırın Sütlaç", ST, 110, "Toprak kapta, üstü kızarmış.", "🥛", true),
  mk("Magnolia", ST, 125, "Muz ve çilekli, bisküvili.", "🍌", true, { tags: ["yeni"] }),
  mk("Supangle", ST, 115, "Yoğun kakaolu puding, kek tabanlı.", "🍫", true),
  mk("Keşkül", ST, 110, "Bademli, hindistan cevizli.", "🥛", true, { tags: ["glutensiz"] }),
  mk("Trileçe", ST, 130, "Üç sütlü, karamel soslu Balkan tatlısı.", "🍯", false),

  // Şerbetli Tatlılar
  mk("Fıstıklı Baklava (porsiyon)", SR, 210, "Antep fıstıklı, 4 dilim.", "🥮", true),
  mk("Kadayıf Dolması", SR, 160, "Cevizli, kıtır kadayıf.", "🥮", true),
  mk("Şekerpare", SR, 100, "Ev usulü, fındıklı.", "🟡", true),
  mk("Revani", SR, 95, "İrmikli, hindistan cevizli.", "🟡", true),
  mk("Künefe", SR, 220, "Sıcak servis, Hatay peyniri ile.", "🧀", false, { tags: ["sıcak"] }),

  // Dondurma & Waffle
  mk("Maraş Dondurması", DW, 0, "Kase: Küçük 2 top · Orta 3 top · Büyük 4 top.", "🍨", true, { tags: ["soğuk"], sizes: [90, 120, 150], discount: { type: "pct", value: 20 }, image: "img/maras-dondurmasi.jpg" }),
  mk("Waffle", DW, 220, "Muz, çilek, Belçika çikolatası.", "🧇", true, { tags: ["sıcak"] }),
  mk("Dondurmalı Brownie", DW, 165, "Sıcak brownie üzerine vanilyalı dondurma.", "🍨", true),
  mk("Meyveli Dondurma Kupası", DW, 175, "Üç top dondurma, mevsim meyveleri.", "🍦", false, { tags: ["soğuk"] }),

  // Kurabiye & Kurular
  mk("İzmit Pişmaniyesi", KK, 90, "Kocaeli'nin meşhur pişmaniyesi, Antep fıstıklı.", "🍥", true, { tags: ["yöresel"] }),
  mk("Bademli Kurabiye (3 adet)", KK, 80, "Glutensiz, badem unlu.", "🍪", true, { tags: ["glutensiz"] }),
  mk("Çikolatalı Cookie", KK, 75, "Bol damla çikolatalı, yumuşak içli.", "🍪", true),
  mk("Vegan Hurmalı Top", KK, 70, "Şeker ilavesiz, hindistan cevizli.", "🌰", true, { tags: ["vegan", "şekersiz"] }),
  mk("Makaron (3 adet)", KK, 120, "Frambuaz, fıstık, çikolata.", "🍬", false),
];

export const DEFAULT_SETTINGS = {
  cafeName: "Pure Black",
  tagline: "Kavaklı Sahili · Gölcük",
  showSoldOut: true,
  categories: DEFAULT_CATEGORIES,
  hiddenCategories: [],
};
