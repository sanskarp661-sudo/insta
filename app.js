(function () {
  const R = window.REPORT;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const n = (v) => v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v >= 1e3 ? Math.round(v / 1e3) + "K" : String(v);
  const pct = (a, b) => b ? Math.round((a / b) * 1000) / 10 : 0;
  const col = (p, good, ok) => p >= good ? "var(--grn)" : p >= ok ? "var(--amb)" : "var(--red)";
  const day = (s) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  $("handle").textContent = "@" + R.account.handle;
  $("updated").textContent = "Updated " + new Date(R.updated).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST";

  const t = R.totals;
  const avgHook = R.reels.reduce((a, r) => a + r.past3s, 0) / R.reels.length;
  const avgWatch = R.reels.reduce((a, r) => a + r.avgWatch / r.duration, 0) / R.reels.length * 100;
  const kpis = [
    ["Reel views", n(t.views), R.account.reels + " reels"],
    ["People reached", n(t.reach), "unique accounts"],
    ["Followers", R.account.followers, "following " + R.account.following],
    ["Shares", t.shares, pct(t.shares, t.views) + "% of views"],
    ["Past 3 seconds", avgHook.toFixed(0) + "%", "average hook hold"],
    ["Watched", avgWatch.toFixed(0) + "%", "average of each reel"],
    ["Saves", t.saves, "comments " + t.comments],
  ];
  $("kpis").innerHTML = kpis.map(([l, v, s]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div><div class="s">${s}</div></div>`).join("");

  $("reelList").innerHTML = R.reels.map((r) => {
    const w = pct(r.avgWatch, r.duration);
    const stat = (l, v) => `<div class="stat"><div class="v">${v}</div><div class="l">${l}</div></div>`;
    const barStat = (l, p, good, ok, txt) => `<div class="stat"><div class="v">${txt}</div><div class="l">${l}</div><div class="bar"><i style="width:${Math.min(p, 100)}%;background:${col(p, good, ok)}"></i></div></div>`;
    return `<article class="reel">
      <a href="${esc(r.url)}" target="_blank" rel="noopener"><img src="${esc(r.thumb)}" alt="${esc(r.title)} cover" loading="lazy"></a>
      <div>
        <h3>${esc(r.title)}<span class="tag">${esc(r.verdict)}</span></h3>
        <div class="meta">Posted ${day(r.posted)} · ${r.duration.toFixed(0)} s · <a href="${esc(r.url)}" target="_blank" rel="noopener">Open on Instagram</a></div>
        <div class="stats">
          ${stat("Views", r.views)}${stat("Reach", r.reach)}${stat("Likes", r.likes)}${stat("Shares", r.shares)}${stat("Saves", r.saves)}${stat("Comments", r.comments)}
          ${barStat("Past 3 s", r.past3s, 50, 35, r.past3s + "%")}
          ${barStat("Watched", w, 50, 30, r.avgWatch.toFixed(1) + " s")}
        </div>
        <p>${esc(r.note)}</p>
        <p class="cap">“${esc(r.caption)}”</p>
      </div>
    </article>`;
  }).join("");

  $("good").innerHTML = R.good.map((g) => `<div>${esc(g)}</div>`).join("");
  $("issues").innerHTML = R.wrong.map((w) => `<div class="issue ${w.sev}">
      <div class="sev">${w.sev === "high" ? "Fix first" : w.sev === "medium" ? "Fix next" : "Later"}</div>
      <h3>${esc(w.title)}</h3>
      <p class="data">${esc(w.data)}</p>
      <p class="fixt"><b>Fix:</b> ${esc(w.fix)}</p>
    </div>`).join("");
  $("bestTime").textContent = "Best time to post: " + R.bestTime;

  $("trendNote").textContent = R.trendNote;
  $("trendList").innerHTML = R.trending.map((x) => `<article class="tcard">
      <a class="th" href="${esc(x.url)}" target="_blank" rel="noopener"><img src="${esc(x.thumb)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"><span class="mult">${x.multiple}× usual</span></a>
      <div class="body">
        <h3><a href="${esc(x.url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${esc(x.title)}</a></h3>
        <div class="ch">${esc(x.channel)} · ${n(x.views)} views</div>
        <p class="why">${esc(x.why)}</p>
        <p class="use"><b>For us:</b> ${esc(x.use)}</p>
      </div>
    </article>`).join("");

  $("nextList").innerHTML = R.nextup.map((x) => `<div class="ncard"><div class="ty">${esc(x.type)}</div><h3>${esc(x.t)}</h3><p>${esc(x.why)}</p></div>`).join("");
  $("tipList").innerHTML = R.tips.map((x) => `<div class="tip"><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join("");

  const links = [...document.querySelectorAll("#nav a")];
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section").forEach((s) => io.observe(s));
})();
