# -*- coding: utf-8 -*-
"""
Dışa aktarılan verinin tutarlılığı (yalnızca standart kütüphane).
    python -m unittest discover -s tests
"""
import csv
import json
import math
import os
import sqlite3
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(ROOT, "site", "data", "cables.min.json")
DB = os.path.join(ROOT, "export", "coax.sqlite")
HAM = os.path.join(ROOT, "export", "csv", "ham_bands.csv")


def interp(points, f):
    """site/js/coax.js interpLogLog ile aynı."""
    k = -1
    for j, p in enumerate(points):
        if p[0] <= f:
            k = j
        else:
            break
    i = min(max(k, 0), len(points) - 2)
    x0, x1 = math.log(points[i][0]), math.log(points[i + 1][0])
    y0, y1 = math.log(points[i][1]), math.log(points[i + 1][1])
    return math.exp(y0 + (y1 - y0) * (math.log(f) - x0) / (x1 - x0))


class ExportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(WEB, encoding="utf-8") as f:
            cls.web = json.load(f)
        cls.con = sqlite3.connect(DB)
        cls.by_id = {c["id"]: c for c in cls.web["cables"]}

    @classmethod
    def tearDownClass(cls):
        cls.con.close()

    def test_web_json_matches_sqlite(self):
        n_cab = self.con.execute("select count(*) from cables").fetchone()[0]
        n_att = self.con.execute("select count(*) from attenuation").fetchone()[0]
        n_pwr = self.con.execute("select count(*) from power").fetchone()[0]
        self.assertEqual(len(self.web["cables"]), n_cab)
        self.assertEqual(sum(len(c["a"]) for c in self.web["cables"]), n_att)
        self.assertEqual(sum(len(c.get("p", [])) for c in self.web["cables"]), n_pwr)
        self.assertEqual(set(self.web["src"]), {r[0] for r in self.con.execute("select source_id from sources")})

    def test_points_sorted_and_sourced(self):
        for c in self.web["cables"]:
            for key in ("a", "p"):
                pts = c.get(key, [])
                self.assertTrue(all(pts[i][0] > pts[i - 1][0] for i in range(1, len(pts))), (c["id"], key))
                self.assertTrue(all(p[2] in self.web["src"] for p in pts), (c["id"], key))
            self.assertGreaterEqual(len(c["a"]), 2, c["id"])

    def test_popular_and_classes(self):
        ranks = sorted(c["pop"] for c in self.web["cables"] if "pop" in c)
        self.assertEqual(ranks, list(range(1, len(ranks) + 1)))
        self.assertGreaterEqual(len(ranks), self.web["featured"])
        classes = {k["k"] for k in self.web["classes"]}
        self.assertTrue(all(c["cls"] in classes for c in self.web["cables"]))
        self.assertTrue(all(c["val"] in ("typ", "max") for c in self.web["cables"]))

    def test_interpolation_matches_excel_ham_bands(self):
        with open(HAM, encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        self.assertGreater(len(rows), 600)
        for r in rows:
            got = interp(self.by_id[r["cable_id"]]["a"], float(r["freq_mhz"]))
            want = float(r["att_db_100m"])
            self.assertAlmostEqual(got / want, 1.0, delta=2e-5, msg=(r["cable_id"], r["freq_mhz"]))


class SiteTests(unittest.TestCase):
    def test_service_worker_precaches_every_site_file(self):
        """Yeni bir sayfa/dosya eklenip sw.js PRECACHE'e yazılmazsa çevrimdışı çalışma sessizce bozulur."""
        import re
        site = os.path.join(ROOT, "site")
        with open(os.path.join(site, "sw.js"), encoding="utf-8") as f:
            pre = set(re.findall(r'"\./([^"]+)"', f.read()))
        need = set()
        for d, _, files in os.walk(site):
            for fn in files:
                rel = os.path.relpath(os.path.join(d, fn), site).replace(os.sep, "/")
                if rel.endswith((".js", ".css", ".json", ".html")) and rel != "sw.js":
                    need.add(rel)
        self.assertEqual(sorted(need - pre), [], "sw.js PRECACHE listesinde eksik dosya")
        self.assertEqual(sorted(p for p in pre if p and not os.path.exists(os.path.join(site, p))), [], "PRECACHE'te olmayan dosya")


if __name__ == "__main__":
    unittest.main()
