# -*- coding: utf-8 -*-
"""site/assets/icon.svg ile aynı tasarımda PWA PNG simgeleri üretir (koaksiyel kablo kesiti, aprsagent.com ailesi renkleri).
Kullanım: python scripts/make_icons.py   (Pillow gerekir)"""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "assets")


def icon(size, maskable=False):
    s = size * 4  # kenar yumuşatma için büyük çiz, sonra küçült
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = s / 2
    k = 0.8 if maskable else 1.0  # maskable: güvenli alan için içerik küçültülür, zemin tam dolu
    if maskable:
        d.rectangle([0, 0, s, s], fill="#22201a")
    r = lambda f: f * s / 64 * k  # noqa: E731
    d.ellipse([c - r(30), c - r(30), c + r(30), c + r(30)], fill="#22201a")
    d.ellipse([c - r(25.5), c - r(25.5), c + r(25.5), c + r(25.5)], fill="#b0413e")
    d.ellipse([c - r(20.5), c - r(20.5), c + r(20.5), c + r(20.5)], fill="#22201a")
    d.ellipse([c - r(16), c - r(16), c + r(16), c + r(16)], fill="#f6f3ea")
    d.ellipse([c - r(6), c - r(6), c + r(6), c + r(6)], fill="#b57a18")
    return img.resize((size, size), Image.LANCZOS)


for size in (192, 512):
    icon(size).save(os.path.join(OUT, f"icon-{size}.png"), optimize=True)
icon(512, maskable=True).save(os.path.join(OUT, "icon-maskable-512.png"), optimize=True)
icon(180).save(os.path.join(OUT, "apple-touch-icon.png"), optimize=True)
print("yazıldı:", OUT)
