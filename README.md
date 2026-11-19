# PURE BLACK · Canlı QR Menü

**Pure Black** — Kavaklı Sahili, Gölcük / Kocaeli

### 🔗 Canlı site

| | |
|---|---|
| **Müşteri menüsü** | https://e-fe.github.io/pure-black-menu/ |
| **Personel paneli** | https://e-fe.github.io/pure-black-menu/admin.html (demo şifresi: `1234`) |
| **Sunum ekranı** | https://e-fe.github.io/pure-black-menu/sunum.html |

Kafenin tatlı menüsü, masadaki QR kodla açılır ve **canlı güncellenir**.
Personel panelden biten tatlıyı tek dokunuşla "Tükendi" yapar, indirim tanımlar, yeni ürün ve sekme ekler;
müşterinin telefonundaki menü anında değişir.

| Sayfa | Ne işe yarar |
|---|---|
| `index.html` | Müşteri menüsü (telefona göre tasarlandı, koyu tema) |
| `admin.html` | Personel paneli: ürünler, indirimler, sekmeler, aktif/pasif, gün sonu, QR, yedek (açık tema) |
| `afis.html` | İndirim afişleri: A4'e 1, 2 veya 4 afiş; yazdır ya da PDF olarak kaydet |
| `sunum.html` | Sunum ekranı: solda panel, sağda telefon. Soldaki her değişiklik sağda anında görünür |

## Özellikler

**Müşteri menüsü**
- Kaydırılabilir tatlı sekmeleri (Pastalar & Kekler, Cheesecake, Sütlü Tatlılar, Şerbetli Tatlılar,
  Dondurma & Waffle, Kurabiye & Kurular); sayfa kaydırıldıkça bulunduğunuz sekme otomatik seçilir
- **İndirim vitrini:** PURE BLACK başlığının hemen altında indirimdeki tatlılar banner olarak kayar.
  Kendiliğinden geçer (4,5 sn), telefonda parmakla, masaüstünde ‹ › oklarıyla ya da klavyeyle elle geçirilir;
  dokunulunca otomatik geçiş birkaç saniye bekler. Alttaki yarı saydam noktalar kaçıncı bannerda olunduğunu
  gösterir, noktaya dokununca o bannera gidilir. Fotoğrafı olan ürünün fotoğrafı bannerı doldurur (esnemez);
  bannera dokununca ürünün menüdeki kartına gidilir
- **İndirimler:** kartlarda eski fiyat üstü çizili, yanında yeni fiyat ve "%15 İNDİRİM" / "₺20 İNDİRİM" etiketi;
  indirimli tatlılar kendi sekmelerinde ilk sırada gelir
- Boyut fiyatları (ör. dondurma kasesi): `S ₺90 · M ₺120 · L ₺150`; indirim her boyuta uygulanır
- Pasif ürünler "Tükendi" olarak görünür (Ayarlar'dan tamamen gizlenebilir); tüm ürünleri biten sekme gizlenir
- Gün içinde aktife alınan ürünlerde "Bugün geldi" rozeti, imza ürünler sekmenin üst sıralarında
- Siyah-beyaz tasarım: Bebas Neue + Inter, emojiler tek renk, fotoğraflar renkli

**Personel paneli**
- Tek dokunuşla aktif/pasif, sekme bazında "hepsini aç/kapat", **Gün sonu** ile hepsini pasife alma (geri alınabilir)
- Ürün ekle/düzenle: ad, sekme (listeden seçilir, "＋ Yeni kategori" ile eklenir), fiyat ya da Küçük/Orta/Büyük
  fiyatları, **indirim**, açıklama, simge veya fotoğraf, etiketler (yeni, imza, çok satan, yöresel, sıcak, soğuk,
  glutensiz, vegan, şekersiz)
- **Fotoğraf:** "＋ Galeriden / dosyadan seç" ile telefon galerisinden, kameradan ya da bilgisayardan eklenir.
  Fotoğraf tarayıcıda otomatik küçültülür (en uzun kenar 800 px, ~60–140 KB JPEG); istenirse bağlantı da yapıştırılabilir.
  Demo modunda fotoğraflar tarayıcı hafızasında durur (yaklaşık 40–60 fotoğraf); dolunca uyarı çıkar, veri bozulmaz
- **İndirim:** miktar + tür (**% Yüzde** ya da **₺ TL**). Formda eski → yeni fiyat önizlemesi görünür;
  %100 ve üstü ya da fiyattan büyük TL indirim kaydedilmez. "Kaldır" ile indirim biter
- **⎙ İndirim afişleri:** indirimli ürünleri seçip A4'e **büyük afiş (1)**, **yarım sayfa (2)** veya **masa kartı (4)**
  olarak basın. Afişte kafe adı, indirim oranı, ürün, eski/yeni fiyat ve menüye giden QR kod var; kesim çizgili.
  Ürünün fotoğrafı varsa afişte de çıkar; afiş sayfasından **renkli** ya da **siyah-beyaz** seçilebilir
- **☰ Sekmeler** ekranı: ↑ ↓ ya da sürükle-bırak ile sıralama, yeniden adlandırma (ürünler de taşınır),
  gizle / göster, silme (ürünleri taşı ya da ürünleriyle sil — **Geri al** ile geri alınır), "＋ Yeni sekme"
- Arama, sekme, durum ve **"İndirimde"** filtresi, istatistik kartları
- Masa QR kodu üretme ve yazdırma, JSON yedek alma / yükleme
- Kurulum gerektirmez: saf HTML/CSS/JS, GitHub Pages'te ücretsiz çalışır

---

## 1) GitHub Pages'e yükleme

1. github.com → **New repository** → ad: `pure-black-menu` → **Public** → **Create repository**
2. **"uploading an existing file"** → klasördeki her şeyi sürükleyip bırakın → **Commit changes**
3. Repo → **Settings → Pages** → *Source*: **Deploy from a branch** → **main** / **(root)** → **Save**
4. 1-2 dakika sonra:
   ```
   https://KULLANICI-ADINIZ.github.io/pure-black-menu/              müşteri menüsü
   https://KULLANICI-ADINIZ.github.io/pure-black-menu/admin.html    personel paneli (demo şifresi: 1234)
   https://KULLANICI-ADINIZ.github.io/pure-black-menu/sunum.html    sunum ekranı
   ```

## 2) Sunum akışı (önerilen)

1. `sunum.html`'i açın, tam ekran yapın (F11). Soldaki panele **1234** ile girin
2. Sağdaki telefonda başlığın altındaki **indirim vitrinini** gösterin: kendiliğinden kayar, noktalar konumu gösterir,
   elle de kaydırılır; bir bannera dokununca ürüne gider. Aşağı kaydırıp sekmelerin kendiliğinden seçildiğini gösterin
3. Soldan **Tiramisu**'nun anahtarını kapatın → telefonda **anında "Tükendi"**. Tekrar açın → **"Bugün geldi"** rozetiyle geri gelir
4. **Waffle** → ✎ → İndirim: **25 / % Yüzde** → formda `₺220 → ₺165` görünür → Kaydet → vitrine yeni banner eklenir
5. **San Sebastian** → ✎ → **＋ Galeriden / dosyadan seç** ile fotoğraf ekleyin → menüde ve afişte görünür
6. **⎙ İndirim afişleri** → ürünleri seçin → **Masa kartı** → açılan sayfada **Yazdır / PDF**
7. **☰ Sekmeler** → yeni bir sekme ekleyin, içine ürün koyun → telefonda yeni sekme çıkar.
   Sonra yeniden adlandırın, gizleyin, silin → **Geri al**
8. **Gün sonu** → hepsi kapanır → toast'taki **Geri al** ile geri gelir
9. **QR kod** → masaya konacak kodu gösterin; telefonunuzla okutup menünün mobil halini gösterin

> ⚠️ **Demo modu:** Varsayılan olarak veriler tarayıcıda saklanır. Aynı tarayıcıdaki sekmeler/sunum ekranı
> birbirini canlı görür, fakat **başka bir telefon değişiklikleri görmez**. Kafede kullanmak için Canlı Mod'u açın.

## 3) Canlı mod: Firebase (tüm cihazlar senkron)

1. https://console.firebase.google.com → **Proje ekle** (Analytics gerekmez)
2. **Build → Firestore Database → Create database** → konum: `europe-west` → *production mode*
3. **Build → Authentication → Get started → Email/Password**'u açın → **Users**'dan personel kullanıcısı ekleyin
4. **Proje ayarları (⚙) → Genel → Web (</>)** → kaydedin, çıkan `firebaseConfig`'i kopyalayın
5. `js/config.js` içinde `FIREBASE_CONFIG = null` yerine bu config'i yapıştırın
6. **Firestore → Rules** (herkes okur, sadece personel yazar):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
7. **Authentication → Settings → Authorized domains**'e `KULLANICI-ADINIZ.github.io` ekleyin
8. Paneli açın, e-posta/şifre ile girin → liste boşsa **"Örnek menüyü yükle"**

Sekme yeniden adlandırma, taşıma ve silme işlemleri Firestore'a tek bir toplu yazma (writeBatch) ile gider.

## Dosya yapısı
```
index.html      müşteri menüsü
admin.html      personel paneli
sunum.html      sunum ekranı (panel + telefon yan yana)
afis.html       indirim afişleri (yazdır / PDF)
favicon.svg     PB logosu
css/style.css   tüm stiller (koyu menü, açık panel)
img/            örnek ürün fotoğrafları
js/config.js    Firebase ayarı + demo şifresi
js/store.js     veri katmanı (localStorage veya Firestore), sekme işlemleri, indirim hesabı
js/seed.js      örnek tatlı menüsü (32 ürün), sekmeler ve varsayılan ayarlar
js/menu.js      müşteri menüsü mantığı
js/promo.js     indirim vitrini (kayan banner)
js/admin.js     panel mantığı
js/afis.js      afiş sayfası mantığı
```

## Örnek fotoğraflar
`img/` klasöründeki dört fotoğraf yalnızca örnek menünün dolu görünmesi içindir; kendi ürün fotoğraflarınızla
değiştirin (panelde ürünü düzenleyip **＋ Galeriden / dosyadan seç**). Hepsi [Unsplash Lisansı](https://unsplash.com/license)
ile ücretsiz kullanılabilir; küçültülüp kırpıldı:

| Dosya | Ürün | Fotoğraf |
|---|---|---|
| `img/san-sebastian.jpg` | San Sebastian | [Chaman Raj](https://unsplash.com/photos/xH0TWBxGVZM) — Bask yanık cheesecake |
| `img/ekler.jpg` | Ekler Pasta | [Emre Çoban](https://unsplash.com/photos/ZIVhImrOI3w) — çikolatalı ekler |
| `img/kazandibi.jpg` | Kazandibi | [Kamara Rahmat](https://unsplash.com/photos/gynfA2P1dis) — karamelli flan (benzer görünümlü yer tutucu) |
| `img/maras-dondurmasi.jpg` | Maraş Dondurması | [Kelsey Curtis](https://unsplash.com/photos/dIs-MqalSSE) — vanilyalı dondurma |

## Not
Demo modundaki PIN girişi yalnızca gösterim içindir; şifre sayfa kaynağında görünür.
Kafede kullanırken Canlı Mod'u açın — orada yazma yetkisi Firebase Authentication ve güvenlik kurallarıyla korunur.
