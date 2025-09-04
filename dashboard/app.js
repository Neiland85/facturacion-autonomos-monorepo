const dataBase = "./data"; // en Pages quedará /data

async function loadJSON(path) {
  try { const r = await fetch(path, {cache: "no-store"}); if (!r.ok) throw 0; return await r.json(); }
  catch { return null; }
}

function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

function fmtDelta(x) {
  if (x === null || x === undefined) return "N/A";
  const sign = x > 0 ? "+" : "";
  return `${sign}${x.toFixed(2)}`;
}

(async () => {
  const metrics = await loadJSON(`${dataBase}/metrics.json`);
  const cov      = await loadJSON(`${dataBase}/coverage.json`);
  const bandit   = await loadJSON(`${dataBase}/bandit.json`);
  const pip      = await loadJSON(`${dataBase}/pip_audit.json`);
  const eslint   = await loadJSON(`${dataBase}/eslint.json`);

  if (metrics) {
    setText("commitsWeek", metrics.commits_per_week ?? "—");
    setText("gapHours", metrics.avg_gap_hours ?? "—");

    // comparativa regional
    const reg = document.getElementById("regional");
    ["SP","EU","US"].forEach(r => {
      const c = metrics.comparisons?.[r] || {};
      const card = document.createElement("div");
      card.className = "p-3 rounded-xl border bg-slate-50";
      card.innerHTML = `<div class="font-medium">${r}</div>
        <div>Commits/sem Δ <b>${fmtDelta(c.commits_wk_delta)}</b></div>
        <div>Gap(h) Δ <b>${fmtDelta(c.time_between_delta_h)}</b></div>`;
      reg.appendChild(card);
    });

    // hotspots
    const ul = document.getElementById("hotfiles");
    (metrics.hot_files || []).slice(0, 15).forEach(([path, times]) => {
      const li = document.createElement("li"); li.textContent = `${path} · ${times} cambios`; ul.appendChild(li);
    });

    // gráfico simple (distribución por día a partir de commits totales estimados)
    // Nota: para precisión diaria real podríamos publicar serie en metrics_git.py. Aquí mostramos ejemplo liviano.
    const days = metrics.window_days || 90;
    const perWeek = metrics.commits_per_week || 0;
    const perDay = perWeek / 7;
    const labels = [...Array(days).keys()].map(i => `D-${days - i}`);
    const values = labels.map(() => perDay);
    const ctx = document.getElementById("commitsChart");
    if (ctx) new Chart(ctx, { type: "line", data: { labels, datasets: [{ label: "Commits/día (estimado)", data: values }] } });
  }

  if (cov) {
    setText("coverage", `${(cov.line_rate * 100).toFixed(2)}`);
  }

  // Resúmenes seguridad
  if (bandit && bandit.results) {
    const sev = (bandit.results || []).reduce((acc, it) => { acc[it.issue_severity] = (acc[it.issue_severity]||0)+1; return acc; }, {});
    setText("banditSummary", Object.entries(sev).map(([k,v]) => `${k}:${v}`).join("  ") || "OK");
  }

  if (pip && pip.vulnerabilities) {
    const counts = pip.vulnerabilities.reduce((a,v) => { a[v.severity]=(a[v.severity]||0)+1; return a; },{});
    setText("pipAuditSummary", Object.entries(counts).map(([k,v])=>`${k}:${v}`).join("  ") || "OK");
  } else if (pip && pip.dependencies) {
    // formato alterno de pip-audit
    const vulns = (pip.dependencies||[]).flatMap(d=>d.vulns||[]);
    const counts = vulns.reduce((a,v)=>{a[v.severity]=(a[v.severity]||0)+1;return a;},{});
    setText("pipAuditSummary", Object.keys(counts).length? Object.entries(counts).map(([k,v])=>`${k}:${v}`).join("  ") : "OK");
  }

  if (eslint) {
    const problems = Array.isArray(eslint) ? eslint.reduce((a,f)=>a+f.errorCount+f.warningCount,0)
                                           : (eslint.errorCount||0)+(eslint.warningCount||0);
    setText("eslintSummary", problems ? `${problems} issues` : "OK");
  }
})();
