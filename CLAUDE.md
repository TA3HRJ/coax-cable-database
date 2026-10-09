# coax-cable-database

Türkçe konuş. Kullanıcı Türkçe çalışıyor.

Amatör telsiz koaksiyel kablo veritabanı — referanslı zayıflama/güç/yapı verisi, Excel ana dosya + SQLite/CSV
dışa aktarım. Web arayüzü planlanıyor (`docs/PLAN.md`), GitHub Pages kökü `docs/` olacak.
Depo: `TA3HRJ/coax-cable-database`

## Yapı

```
TA3HRJ_Coax_Database.xlsx   # ana çalışma kitabı (üretilir, Excel'de hesaplanıp kaydedilir)
scripts/build_database.py   # çalışma kitabını üretir (pilot kablolar bu dosyada)
scripts/cables_extra.py     # diğer kablolar, kaynaklar, elle noktalar, eski tablo eşlemesi
scripts/gen_points.py       # kaynaklar/*.pdf -> scripts/points_extra.py (otomatik, elle düzenleme)
scripts/export_db.py        # xlsx -> export/coax.sqlite + export/csv/ (önce sanitize_xlsx ile üst veriyi temizler)
data/legacy/                # orijinal elle tablo, üst verisi temizlenmiş kopya (build bunu okur)
kaynaklar/                  # kaynak dizini; PDF'ler .gitignore'da (telif), .txt özetler repoda
```

## Veri hattı

```bash
python -X utf8 scripts/gen_points.py        # yalnızca PDF'ten nokta eklendiyse
python -X utf8 scripts/build_database.py    # COAX_OUT=... ile başka yola yazılabilir
# Excel'de aç-hesapla-kaydet (COM: Workbooks.Open, CalculateFull, Save)
python -X utf8 scripts/export_db.py
```

`export_db.py` Excel'in önbelleğe aldığı formül sonuçlarını okur; openpyxl ile yazılmış ve Excel'de
kaydedilmemiş dosyada formül hücreleri boş gelir.

## Kurallar

- **Kullanıcının Excel düzenlemelerini ezme.** `build_database.py` xlsx'in üzerine yazar. Önce dosya tarihini ve
  `~$` kilit dosyasını kontrol et; geçici yola üret, Excel'de hesapla, doğrula, sonra kopyala.
- Her değer bir `source_id`'ye bağlı olmalı; datasheet'te yazanı birimiyle olduğu gibi gir (dönüşüm formülde).
- Datasheet hatası gibi görünen değeri düzeltme: olduğu gibi gir, kaynak/kablo notuna yaz (QA zaten işaretler).
  Belgeden açıkça bozuk okunan satır alınmayabilir (ör. SCF38-50J 75 MHz) - nedeni kaynak notunda.
- Attenuation/Power satırları kablo bazında bitişik ve frekansa göre artan olmalı (interpolasyon formülü buna dayanır).
- Değer türü (nominal/tipik/maksimum) notlarda belirtilir; Reçber ve Ericsson maksimum verir.
- Üretici PDF'lerini commit'leme (`kaynaklar/*.pdf` yok sayılıyor).
- xlsx üst verisinde yerel yol ve kişi adı olur; commit öncesi `export_db.py` (ya da `sanitize_xlsx.py`) çalışmış olmalı.
  Kökteki orijinal eski tablo kişisel üst veri içerir ve `.gitignore`'da.
- `kaynaklar/README.md` sources tablosundan üretilir; kaynak ekleyince yeniden üret.
- Git kimliği: `TA3HX <136229226+TA3HRJ@users.noreply.github.com>`; commit mesajları Türkçe.

## Oturum sonu

Anlamlı bir iş yaptıysan bitirmeden önce `docs/HANDOFF.md`'yi güncelle: nerede kalındı, ne açık kaldı,
hangi tuzağa düşüldü ve neden.
