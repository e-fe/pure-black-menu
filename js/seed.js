// İlk açılışta yüklenen örnek menü. Panelden hepsi düzenlenebilir / silinebilir.
// Fiyatlar örnektir (2026, sahil kafe seviyesi).
export const DEFAULT_CATEGORIES = [
  "Sıcak Kahveler",
  "Soğuk Kahveler",
  "Türk Kahvesi",
  "Çaylar",
  "Bitki Çayları",
  "Sıcak İçecekler",
  "Frozen & Milkshake",
  "Soğuk İçecekler",
  "Tatlılar",
  "Cheesecake",
  "Atıştırmalıklar",
];

// Örnekler "dün eklenmiş" sayılır; böylece "Bugün geldi" rozeti yalnızca
// personelin gün içinde aktife aldığı ürünlerde görünür.
const now = Date.now() - 24 * 60 * 60 * 1000;

// sizes: [Küçük, Orta, Büyük] fiyatları ya da null (tek fiyat)
const mk = (name, category, price, desc, emoji, active, tags = [], sizes = null) => ({
  id: Math.random().toString(36).slice(2, 10),
  name, category,
  price: sizes ? sizes[1] : price,
  sizes: sizes ? { s: sizes[0], m: sizes[1], l: sizes[2] } : null,
  desc, emoji, image: "",
  active, tags,
  createdAt: now, updatedAt: now,
  activatedAt: active ? now : null,
});

const SK = "Sıcak Kahveler", SO = "Soğuk Kahveler", TK = "Türk Kahvesi", CY = "Çaylar",
  BC = "Bitki Çayları", SI = "Sıcak İçecekler", FM = "Frozen & Milkshake", SG = "Soğuk İçecekler",
  TT = "Tatlılar", CC = "Cheesecake", AT = "Atıştırmalıklar";

export const SEED_ITEMS = [
  // Sıcak Kahveler
  mk("Pure Black Signature", SK, 0, "İmza kahvemiz: siyah kakao, çift shot espresso ve kadifemsi süt köpüğü.", "☕", true, ["imza", "çok satan"], [195, 220, 245]),
  mk("Espresso", SK, 110, "Tek shot, yoğun ve dengeli.", "☕", true),
  mk("Double Espresso", SK, 140, "Çift shot espresso.", "☕", true),
  mk("Americano", SK, 0, "Espresso ve sıcak su.", "☕", true, [], [130, 150, 170]),
  mk("Latte", SK, 0, "Espresso ve buharda ısıtılmış süt.", "☕", true, ["laktozsuz seçenek"], [150, 170, 190]),
  mk("Cappuccino", SK, 0, "Espresso, süt ve bol süt köpüğü.", "☕", true, ["laktozsuz seçenek"], [150, 170, 190]),
  mk("Flat White", SK, 0, "Çift ristretto, ince mikro köpük.", "☕", true, [], [160, 180, 200]),
  mk("Cortado", SK, 150, "Eşit oranda espresso ve sıcak süt.", "☕", false),
  mk("Macchiato", SK, 130, "Espresso üzerine bir kaşık süt köpüğü.", "☕", true),
  mk("Mocha", SK, 0, "Espresso, Belçika çikolatası ve süt.", "☕", true, [], [170, 190, 210]),
  mk("White Mocha", SK, 0, "Espresso, beyaz çikolata ve süt.", "☕", false, [], [175, 195, 215]),
  mk("Caramel Macchiato", SK, 0, "Vanilyalı süt, espresso ve karamel sos.", "☕", true, [], [175, 195, 215]),
  mk("Filtre Kahve", SK, 0, "Günün çekirdeğiyle demlenir.", "☕", true, [], [120, 140, 160]),

  // Soğuk Kahveler
  mk("Iced Americano", SO, 0, "Buz üzerine espresso ve soğuk su.", "🧊", true, [], [140, 160, 180]),
  mk("Iced Latte", SO, 0, "Buz, espresso ve soğuk süt.", "🧊", true, ["laktozsuz seçenek"], [160, 180, 200]),
  mk("Iced Mocha", SO, 0, "Çikolata soslu soğuk latte.", "🧊", true, [], [180, 200, 220]),
  mk("Iced Caramel Latte", SO, 0, "Karamel şuruplu soğuk latte.", "🧊", true, ["çok satan"], [180, 200, 220]),
  mk("Cold Brew", SO, 0, "18 saat soğuk demleme, yumuşak içim.", "🥤", true, [], [170, 190, 210]),
  mk("Espresso Tonic", SO, 0, "Tonik, buz ve espresso, portakal kabuğuyla.", "🍹", false, ["yeni"], [180, 195, 210]),
  mk("Affogato", SO, 0, "Vanilyalı dondurma üzerine sıcak espresso.", "🍨", true, [], [160, 180, 200]),

  // Türk Kahvesi
  mk("Türk Kahvesi · Sade", TK, 110, "Közde pişirilir, lokumla servis.", "☕", true),
  mk("Türk Kahvesi · Orta", TK, 110, "Közde pişirilir, lokumla servis.", "☕", true),
  mk("Türk Kahvesi · Şekerli", TK, 110, "Közde pişirilir, lokumla servis.", "☕", true),
  mk("Double Türk Kahvesi", TK, 160, "Büyük fincanda, çift kavrulmuş.", "☕", true),
  mk("Menengiç Kahvesi", TK, 120, "Sütlü, kafeinsiz yöresel lezzet.", "☕", true, ["kafeinsiz"]),
  mk("Dibek Kahvesi", TK, 125, "Taş dibekte dövülmüş, yumuşak içim.", "☕", false),
  mk("Damla Sakızlı Türk Kahvesi", TK, 130, "Sakız aromalı, köpüklü.", "☕", true),

  // Çaylar
  mk("Çay", CY, 30, "İnce belli bardakta taze demlenmiş.", "🍵", true),
  mk("Fincan Çay", CY, 50, "Büyük fincanda.", "🍵", true),
  mk("Kupa Çay", CY, 60, "Kupada, limon dilimiyle istenirse.", "🍵", false),
  mk("Demlik Çay (2 kişilik)", CY, 140, "Semaverden demlik, iki kişilik.", "🫖", true),

  // Bitki Çayları
  mk("Ihlamur", BC, 90, "Ballı ve limonlu servis.", "🫖", true, ["kafeinsiz"]),
  mk("Yeşil Çay", BC, 90, "Hafif, antioksidan.", "🍵", true),
  mk("Kış Çayı", BC, 100, "Tarçın, karanfil, zencefil ve elma.", "🫖", true, ["kafeinsiz"]),
  mk("Papatya Çayı", BC, 90, "Rahatlatıcı, hafif.", "🍵", false, ["kafeinsiz"]),
  mk("Adaçayı", BC, 90, "Taze adaçayı yaprakları.", "🍵", true, ["kafeinsiz"]),

  // Sıcak İçecekler
  mk("Sahlep", SI, 140, "Maraş sahlebi, tarçınla.", "🥛", true, ["yöresel"]),
  mk("Sıcak Çikolata", SI, 0, "Belçika çikolatası ve süt, krema ile.", "🍫", true, [], [150, 170, 190]),
  mk("Beyaz Sıcak Çikolata", SI, 0, "Beyaz çikolata ve vanilya.", "🍫", false, [], [160, 180, 200]),
  mk("Chai Tea Latte", SI, 0, "Baharatlı siyah çay ve süt.", "🍵", true, [], [150, 170, 190]),
  mk("Ballı Süt", SI, 110, "Sıcak süt, çiçek balı ve tarçın.", "🥛", true, ["kafeinsiz"]),

  // Frozen & Milkshake
  mk("Çilekli Milkshake", FM, 180, "Taze çilek ve vanilyalı dondurma.", "🍓", true),
  mk("Muzlu Milkshake", FM, 180, "Muz ve vanilyalı dondurma.", "🍌", true),
  mk("Oreo Milkshake", FM, 195, "Oreo bisküvi parçacıklı.", "🥤", true, ["çok satan"]),
  mk("Karamelli Milkshake", FM, 185, "Tuzlu karamel soslu.", "🥤", true),
  mk("Mango Frozen", FM, 170, "Buzlu mango püresi.", "🥭", true, ["vegan"]),
  mk("Frambuaz Frozen", FM, 170, "Buzlu frambuaz, nane yaprağıyla.", "🍹", false, ["vegan"]),

  // Soğuk İçecekler
  mk("Ev Yapımı Limonata", SG, 120, "Taze sıkım limon, az şekerli.", "🍋", true, ["çok satan"]),
  mk("Naneli Limonata", SG, 130, "Taze nane ve limon.", "🍋", true),
  mk("Churchill", SG, 90, "Maden suyu, limon ve tuz.", "🍋", true),
  mk("Çilek-Muz Smoothie", SG, 170, "Çilek, muz ve yoğurt.", "🥤", true),
  mk("Orman Meyveli Smoothie", SG, 175, "Böğürtlen, yaban mersini, frambuaz.", "🫐", true, ["vegan"]),
  mk("Mango Smoothie", SG, 175, "Mango ve portakal suyu.", "🥭", false, ["vegan"]),
  mk("Soda", SG, 50, "Sade maden suyu.", "🧊", true),
  mk("Meyveli Soda", SG, 60, "Limon, elma veya karpuz.", "🧊", true),
  mk("Su", SG, 25, "50 cl.", "🧊", true),

  // Tatlılar
  mk("İzmit Pişmaniyesi", TT, 90, "Kocaeli'nin meşhur pişmaniyesi, Antep fıstıklı.", "🍥", true, ["yöresel"]),
  mk("Tiramisu", TT, 160, "Mascarpone, espresso ve kakao. Günlük hazırlanır.", "☕", true),
  mk("Ekler Pasta", TT, 150, "Bol kremalı, sıcak çikolata soslu.", "🍫", true),
  mk("Islak Kek (Brownie)", TT, 120, "Sıcak servis, yanında dondurma ile.", "🟫", true, ["sıcak"]),
  mk("Havuçlu Tarçınlı Kek", TT, 110, "Cevizli, krem peynir kaplamalı.", "🥕", true),
  mk("Kazandibi", TT, 120, "Geleneksel usul, karamelize tabanlı.", "🍮", true),
  mk("Fırın Sütlaç", TT, 110, "Toprak kapta, üstü kızarmış.", "🥛", true),
  mk("Trileçe", TT, 130, "Üç sütlü, karamel soslu Balkan tatlısı.", "🍯", false),
  mk("Magnolia", TT, 125, "Muz ve çilekli, bisküvili.", "🍌", true, ["yeni"]),
  mk("Fıstıklı Baklava (porsiyon)", TT, 210, "Antep fıstıklı, 4 dilim.", "🥮", true),
  mk("Künefe", TT, 220, "Sıcak servis, Hatay peyniri ile.", "🧀", false, ["sıcak"]),
  mk("Şekerpare", TT, 100, "Ev usulü, fındıklı.", "🟡", true),
  mk("Bademli Kurabiye (3 adet)", TT, 80, "Glutensiz, badem unlu.", "🍪", true, ["glutensiz"]),
  mk("Vegan Hurmalı Top", TT, 70, "Şeker ilavesiz, hindistan cevizli.", "🌰", true, ["vegan"]),

  // Cheesecake
  mk("San Sebastian", CC, 185, "Yanık yüzeyli, akışkan Bask cheesecake. Belçika çikolata sosuyla.", "🍰", true, ["çok satan"]),
  mk("Frambuazlı Cheesecake", CC, 170, "Taze frambuaz sosu, tereyağlı bisküvi tabanı.", "🍓", true),
  mk("Limonlu Cheesecake", CC, 170, "Limon kreması, hafif ve ferah.", "🍋", true),
  mk("Lotus Cheesecake", CC, 175, "Karamelize bisküvi kreması ve kırıntısı.", "🧁", false),

  // Atıştırmalıklar
  mk("Kaşarlı Tost", AT, 140, "Trakya kaşarı, köy ekmeğinde.", "🥪", true, ["sıcak"]),
  mk("Karışık Tost", AT, 170, "Kaşar ve sucuk, domates ile.", "🥪", true, ["sıcak"]),
  mk("Sade Kruvasan", AT, 95, "Tereyağlı, günlük pişer.", "🥐", true),
  mk("Peynirli Kruvasan", AT, 130, "Beyaz peynir ve kaşar.", "🥐", true),
  mk("Çikolatalı Kruvasan", AT, 120, "Bitter çikolata dolgulu.", "🥐", true),
  mk("Ton Balıklı Sandviç", AT, 190, "Ton balığı, mısır, marul, ekşi maya ekmek.", "🥪", true),
  mk("Hindi Füme Sandviç", AT, 185, "Hindi füme, cheddar, roka.", "🥪", false),
];

export const DEFAULT_SETTINGS = {
  cafeName: "Pure Black",
  tagline: "Kavaklı Sahili · Gölcük",
  showSoldOut: true,
  categories: DEFAULT_CATEGORIES,
  hiddenCategories: [],
  // Müşteri menüsündeki ana sekme: "drinks" (İçecekler) veya "food" (Yiyecekler)
  categoryGroups: {
    "Sıcak Kahveler": "drinks", "Soğuk Kahveler": "drinks", "Türk Kahvesi": "drinks",
    "Çaylar": "drinks", "Bitki Çayları": "drinks", "Sıcak İçecekler": "drinks",
    "Frozen & Milkshake": "drinks", "Soğuk İçecekler": "drinks",
    "Tatlılar": "food", "Cheesecake": "food", "Atıştırmalıklar": "food",
  },
};
