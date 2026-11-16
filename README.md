# PURE BLACK · Canlı QR Menü

**Pure Black** — Kavaklı Sahili, Gölcük / Kocaeli

### 🔗 Canlı site

| | |
|---|---|
| **Müşteri menüsü** | https://e-fe.github.io/pure-black-menu/ |
| **Personel paneli** | https://e-fe.github.io/pure-black-menu/admin.html (demo şifresi: `1234`) |
| **Sunum ekranı** | https://e-fe.github.io/pure-black-menu/sunum.html |

Kafenin içecek ve yiyecek menüsü, masadaki QR kodla açılır ve **canlı güncellenir**.
Personel panelden biten ürünü tek dokunuşla "Tükendi" yapar, yeni ürün ve sekme ekler;
müşterinin telefonundaki menü anında değişir.

| Sayfa | Ne işe yarar |
|---|---|
| `index.html` | Müşteri menüsü (telefona göre tasarlandı, koyu tema) |
| `admin.html` | Personel paneli: ürünler, sekmeler, aktif/pasif, gün sonu, QR, yedek (açık tema) |
| `sunum.html` | Sunum ekranı: solda panel, sağda telefon. Soldaki her değişiklik sağda anında görünür |

## Özellikler

**Müşteri menüsü**
- Üstte iki ana sekme: **İÇECEKLER** ve **YİYECEKLER**
- Altında kaydırılabilir alt sekmeler (Sıcak Kahveler, Soğuk Kahveler, Türk Kahvesi, Çaylar, Bitki Çayları,
  Sıcak İçecekler, Frozen & Milkshake, Soğuk İçecekler, Tatlılar, Cheesecake, Atıştırmalıklar)
- Sayfa kaydırıldıkça bulunduğunuz bölümün sekmesi otomatik seçilir
- **Boyut fiyatları:** kahvelerde `S ₺150 · M ₺170 · L ₺190`, tek fiyatlı ürünler eskisi gibi
- Pasif ürünler "Tükendi" olarak görünür (Ayarlar'dan tamamen gizlenebilir); tüm ürünleri biten sekme gizlenir
- Gün içinde aktife alınan ürünlerde "Bugün geldi" rozeti, imza ürünler sekmenin en üstünde
- Siyah-beyaz tasarım: Bebas Neue + Inter, emojiler tek renk, fotoğraflar renkli

**Personel paneli**
- Tek dokunuşla aktif/pasif, sekme bazında "hepsini aç/kapat", **Gün sonu** ile hepsini pasife alma (geri alınabilir)
- Ürün ekle/düzenle: ad, sekme, fiyat ya da **Küçük/Orta/Büyük fiyatları**, açıklama, simge veya fotoğraf, etiketler
  (yeni, imza, çok satan, yöresel, sıcak, soğuk, kafeinsiz, laktozsuz seçenek, glutensiz, vegan, şekersiz)
- **☰ Sekmeler** ekranı:
  - ↑ ↓ ya da sürükle-bırak ile sıralama
  - Her sekmenin İçecekler / Yiyecekler grubunu seçme
  - Yeniden adlandırma (sekmedeki tüm ürünler de yeni ada taşınır)
  - Gizle / göster (ürünler silinmez)
  - Silme: boşsa direkt; doluysa "ürünleri başka sekmeye taşı" veya "ürünleriyle sil" — **Geri al** ile geri alınabilir
  - "＋ Yeni sekme" ile ekleme
- Arama, sekme ve durum filtresi, istatistik kartları
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
2. Sağdaki telefonda **İÇECEKLER / YİYECEKLER** arasında geçin, aşağı kaydırıp sekmelerin kendiliğinden seçildiğini gösterin
3. Soldan **Latte**'nin anahtarını kapatın → telefonda **anında "Tükendi"**. Tekrar açın → **"Bugün geldi"** rozetiyle geri gelir
4. **＋ Ürün ekle** → "Fındıklı Latte" → **Boyut fiyatları kullan** → S 160 / M 180 / L 200 → telefonda `S · M · L` fiyatlarıyla belirir
5. **☰ Sekmeler** → "Kahvaltı" sekmesi ekleyin (Yiyecekler), içine bir ürün koyun → telefonda yeni sekme çıkar.
   Sonra yeniden adlandırın, gizleyin, silin → **Geri al**
6. **Gün sonu** → hepsi kapanır → toast'taki **Geri al** ile geri gelir
7. **QR kod** → masaya konacak kodu gösterin; telefonunuzla okutup menünün mobil halini gösterin

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
favicon.svg     PB logosu
css/style.css   tüm stiller (koyu menü, açık panel)
js/config.js    Firebase ayarı + demo şifresi
js/store.js     veri katmanı (localStorage veya Firestore), sekme işlemleri
js/seed.js      örnek menü (81 ürün), sekmeler ve varsayılan ayarlar
js/menu.js      müşteri menüsü mantığı
js/admin.js     panel mantığı
```

## Not
Demo modundaki PIN girişi yalnızca gösterim içindir; şifre sayfa kaynağında görünür.
Kafede kullanırken Canlı Mod'u açın — orada yazma yetkisi Firebase Authentication ve güvenlik kurallarıyla korunur.
