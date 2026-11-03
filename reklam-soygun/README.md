# Kasa Defteri: Gelir Gider — "Soygun" reklamı (Reels, 25 sn, 1080×1920)

- `kasa-defteri-soygun.mp4` — bitmiş film
- Stil: Lemo-Opuscar **spy-titles** (60'lar casus filmi jeneriği, kesilmiş kâğıt) motoru dikey videoya uyarlandı (`paper.js`, `chars.js`; github.com/lemomo-ai/lemo-opuscar, MIT).
- Uygulama bölümü gerçek ekran kayıtlarından (`rec/`), seslendirme Gemini TTS (`vo/`), müzik özgün casus big band'i (`music/score.py`, CC0 enstrüman örnekleri).

Yeniden üretmek (Lemo-Opuscar kurulu, kütüphane `~/lemo-opuscar`):
```sh
LIB=~/lemo-opuscar; P=$(pwd)
$LIB/.venv/bin/python music/score.py && $LIB/.venv/bin/python mix.py
cd $LIB && node core/render/video.mjs "$P" --fps 24 --size 1080x1920 --out "$P/out/video24.mp4"
sh core/render/mux.sh "$P/out/video24.mp4" "$P/out/mix.wav" "$P/kasa-defteri-soygun.mp4" 24 0
```
Yazı tipleri: League Gothic, League Spartan (SIL OFL 1.1, `fonts/`).
