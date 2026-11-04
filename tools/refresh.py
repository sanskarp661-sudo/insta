#!/usr/bin/env python3
"""Refresh the numbers in data/report.js from Metricool exports.

    python3 tools/refresh.py reels.json evolution.json

reels.json: the "rows" from Metricool getAnalyticsDataByMetrics (brand 7873446) with metrics, in this order:
    IGRE02 IGRE03 IGRE06 IGRE23 IGRE11 IGRE10 IGRE07 IGRE12 IGRE21 IGRE24 IGRE28
    (date, caption, url, views, reach, likes, comments, saves, shares, avg watch s, past-3s %)
evolution.json: the "rows" for IGEV01 IGEV02 IGEV05 IGEV06 (followers, following, views, reach), last column = yyyymmdd.

Existing reels are matched by URL and only their numbers change. New reels are added with a placeholder
title and note; edit those by hand (title, thumb, duration, verdict, note) after the run.
Prints a short summary of what changed.
"""
import json, os, re, sys
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "report.js")
IST = timezone(timedelta(hours=5, minutes=30))

def load_report():
    s = open(DATA, encoding="utf-8").read()
    return json.loads(re.sub(r"^window\.REPORT\s*=\s*", "", s.strip()).rstrip(";"))

def num(v, f=float):
    try: return f(float(v))
    except (TypeError, ValueError): return None

def main(reels_path, evo_path):
    R = load_report()
    rows = json.load(open(reels_path))
    rows = rows.get("rows", rows) if isinstance(rows, dict) else rows
    by_url = {r["url"]: r for r in R["reels"]}
    changes = []
    for row in rows:
        date, cap, url, views, reach, likes, com, saves, shares, aw, p3 = (row + [None] * 11)[:11]
        r = by_url.get(url)
        if r is None:
            r = dict(key=url.rstrip("/").split("/")[-1], title=(cap or "New reel").split("\n")[0][:60], url=url,
                     posted=f"{date[:4]}-{date[4:6]}-{date[6:8]}T{date[8:10]}:{date[10:12]}", thumb="", duration=30.0,
                     caption=(cap or "").split("\n")[0][:160], verdict="New", note="New reel, numbers still coming in.")
            R["reels"].insert(0, r); by_url[url] = r
            changes.append(f"NEW reel {url} (fill title/thumb/duration/note)")
        before = r.get("views", 0)
        for k, v, f in (("views", views, int), ("reach", reach, int), ("likes", likes, int), ("comments", com, int),
                        ("saves", saves, int), ("shares", shares, int)):
            x = num(v, f)
            if x is not None: r[k] = x
        x = num(aw)
        if x is not None: r["avgWatch"] = round(x, 1)
        x = num(p3)
        if x is not None: r["past3s"] = round(x, 1)
        if r.get("views", 0) != before: changes.append(f"{r['title']}: views {before} -> {r['views']}")
    R["reels"].sort(key=lambda r: r["posted"], reverse=True)
    R["account"]["reels"] = len(R["reels"])
    R["totals"] = {k: sum(r.get(k, 0) for r in R["reels"]) for k in ("views", "reach", "likes", "comments", "saves", "shares")}

    evo = json.load(open(evo_path))
    evo = evo.get("rows", evo) if isinstance(evo, dict) else evo
    evo.sort(key=lambda r: r[-1])
    for row in evo:
        fol, fing = num(row[0], int), num(row[1], int)
        if fol: R["account"]["followers"] = fol
        if fing is not None and fol: R["account"]["following"] = fing
    daily = {d["d"]: d for d in R.get("daily", [])}
    for row in evo:
        v, rc, d = num(row[2], int), num(row[3], int), row[-1]
        if v is not None and rc is not None:
            daily[f"{d[:4]}-{d[4:6]}-{d[6:8]}"] = dict(d=f"{d[:4]}-{d[4:6]}-{d[6:8]}", views=v, reach=rc)
    R["daily"] = sorted(daily.values(), key=lambda x: x["d"])
    R["updated"] = datetime.now(IST).strftime("%Y-%m-%dT%H:%M+05:30")

    open(DATA, "w", encoding="utf-8").write("window.REPORT = " + json.dumps(R, ensure_ascii=False, indent=1) + ";\n")
    print("totals", R["totals"], "followers", R["account"]["followers"])
    print("\n".join(changes) or "no view changes")

if __name__ == "__main__":
    if len(sys.argv) < 3: print(__doc__); sys.exit(1)
    main(sys.argv[1], sys.argv[2])
