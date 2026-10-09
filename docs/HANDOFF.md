# Devir notu

## 2026-10-09 — Repo açıldı, web planı yazıldı

**Durum:** Veritabanı v1.0 tamam: 65 kablo, 1126 zayıflama ve 775 güç noktası, 54 kaynak. Excel, SQLite ve CSV güncel.
Web arayüzü için plan `docs/PLAN.md`'de; M1'e (veri ekleri + JSON + eşlik testi) başlanmadı.

**Açık kalanlar**
- PLAN.md'deki açık sorular kullanıcı onayı bekliyor: lisans, popüler liste, varsayılan dil, maksimum/tipik gösterimi.
- Çağrı işareti TA3HX'e geçmiş; dosya ve sayfa adlarında hâlâ TA3HRJ var. Yeniden adlandırma kullanıcıya soruldu.
- Kaynak bulunamayan tek eski tablo satırı: "RG58 CellFoil (9006)".
- Birikim Kablo RG 58 C/U kataloğu indirilemedi (sunucu HTML döndürüyor). Kullanıcı PDF'i sağlarsa eklenebilir.

**Tuzaklar**
- `build_database.py` xlsx'in üzerine yazar. Kullanıcı Excel'de düzenleme yapmış olabilir; önce tarih ve `~$` kilit kontrolü.
- openpyxl ile yazılan dosyada formül sonuçları yok; `export_db.py`'den önce Excel'de hesaplatıp kaydetmek şart.
- openpyxl Table: `_initialise_columns()` sonrası sütun adları başlık hücrelerinden ayrıca atanmazsa Excel dosyayı açmıyor.
- Excel `OR()` tüm argümanlarını değerlendirir; boş hücreyle aritmetik `#VALUE!` verir. İç içe `IF` kullan.
- M&P PDF'lerinde "10.000 MHz" binlik ayraçlıdır (`gen_points.num()` bunu ele alıyor). Bazı satırlar metinde iç içe
  geçmiş durumda (Ultraflex 10 7000/8000 MHz, Hyperflex 10 8000/9000 MHz); elle çözümlendi.
- Scratchpad'deki yardımcı betik adları stdlib modüllerini gölgelememeli (ör. `bisect.py` openpyxl'i bozdu).
