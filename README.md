# Travma Bilgili Yoga — Eğitim Arşivi

Travma Bilgili Yoga Eğitimi kayıtlarından çıkarılmış içindekiler arşivi. Tamamen statik
bir site: derleme adımı, bağımlılık ya da sunucu tarafı kod yok.

## Sayfalar

| Dosya | İçerik |
| --- | --- |
| `index.html` | **Modüller** — 21 modül kaydının zaman damgalı bölüm ve madde arşivi, tüm içerikte arama |
| `dersler.html` | **Dersler & Formlar** — 33 ders/süpervizyon oturumunun form dökümü ve alfabetik form indeksi |

## Dosya düzeni

```
index.html                    modül arşivi
dersler.html                  ders ve form indeksi
assets/
  theme.css                   ortak renk paleti, tipografi, üst çubuk  (her iki sayfa)
  theme.js                    karanlık mod anahtarı                     (her iki sayfa)
  moduller.css / moduller.js  modül arşivine özgü
  dersler.css  / dersler.js   ders indeksine özgü
  dersler-filters.css         tarih filtresi kuralları (ders listesinden üretilmiştir)
```

## Tasarım

- Tek bir renk paleti (`assets/theme.css` içindeki CSS değişkenleri) ve tek bir yazı tipi
  ailesi her iki sayfada da kullanılır: **Fraunces** (başlıklar), **Karla** (metin),
  **JetBrains Mono** (etiket, zaman damgası, sayı).
- **Karanlık mod** her sayfada sağ üsttedir. Seçim `localStorage` içinde saklanır; hiç
  seçim yapılmadıysa işletim sisteminin tercihi izlenir.
- Mobil uyumlu: modül arşivinde kenar çubuğu çekmeceye dönüşür, ders indeksinde ders
  şeridi yatay kayar, tablolar kendi içinde kayar.
- JavaScript kapalıyken de okunabilir: ders sekmeleri, tarih filtresi ve ⭐ filtresi saf
  CSS ile çalışır; modül sayfasında tüm modüller düz sayfa olarak akar. Yalnızca serbest
  metin arama JavaScript ister.
- Yazdırmaya uygun stiller içerir.

## Klavye kısayolları

| Tuş | Etki |
| --- | --- |
| `/` | Arama kutusuna odaklan |
| `Esc` | Aramayı temizle, menüleri kapat |

## GitHub Pages ile yayına alma

1. Depoyu GitHub'a gönderin.
2. **Settings → Pages → Build and deployment** bölümünde kaynak olarak
   **Deploy from a branch** ve dalın kökünü (`/`) seçin.
3. Site `https://<kullanıcı-adı>.github.io/<depo-adı>/` adresinde yayınlanır.

Yazı tipleri Google Fonts'tan yüklenir; bağlantı olmadığında sistem yazı tiplerine düşer.

## İçerik notu

Katılımcı ve eğitmen adayı isimleri ile kişisel paylaşımlar arşivden çıkarılmıştır;
yalnızca eğitmen isimleri (ders atıfları) yer alır.
