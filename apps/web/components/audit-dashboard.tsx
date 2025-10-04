import { Suspense } from "react";

interface AuditMetrics {
  commits_per_week?: number;
  avg_gap_hours?: number;
  comparisons?: {
    SP?: { commits_wk_delta?: number; time_between_delta_h?: number };
    EU?: { commits_wk_delta?: number; time_between_delta_h?: number };
    US?: { commits_wk_delta?: number; time_between_delta_h?: number };
  };
  hot_files?: [string, number][];
  window_days?: number;
}

interface CoverageData {
  line_rate: number;
}

interface SecurityData {
  results?: Array<{ issue_severity: string }>;
  vulnerabilities?: Array<{ severity: string }>;
  dependencies?: Array<{ vulns?: Array<{ severity: string }> }>;
  errorCount?: number;
  warningCount?: number;
}

async function loadAuditData() {
  try {
    // En desarrollo, usamos datos de ejemplo
    // En producción, estos vendrían de archivos JSON generados por CI/CD
    const mockMetrics: AuditMetrics = {
      commits_per_week: 24,
      avg_gap_hours: 3.2,
      comparisons: {
        SP: { commits_wk_delta: 2.1, time_between_delta_h: -0.5 },
        EU: { commits_wk_delta: -1.3, time_between_delta_h: 0.8 },
        US: { commits_wk_delta: 0.7, time_between_delta_h: -0.2 },
      },
      hot_files: [
        ["apps/web/src/components/dashboard.tsx", 15],
        ["apps/api-facturas/src/routes/invoices.ts", 12],
        ["packages/ui/src/components/button.tsx", 8],
        ["apps/auth-service/src/auth/jwt.ts", 7],
        ["apps/invoice-service/src/services/pdf.ts", 6],
        ["apps/web/src/lib/api.ts", 5],
        ["apps/tax-calculator/src/calculations/tax.ts", 4],
        ["packages/config/tailwind.config.ts", 3],
      ],
      window_days: 90,
    };

    const mockCoverage: CoverageData = {
      line_rate: 0.87,
    };

    const mockBandit: SecurityData = {
      results: [
        { issue_severity: "LOW" },
        { issue_severity: "MEDIUM" },
        { issue_severity: "LOW" },
      ],
    };

    const mockPipAudit: SecurityData = {
      vulnerabilities: [
        { severity: "HIGH" },
        { severity: "MEDIUM" },
        { severity: "LOW" },
        { severity: "LOW" },
      ],
    };

    const mockEslint: SecurityData = {
      errorCount: 2,
      warningCount: 15,
    };

    return {
      metrics: mockMetrics,
      coverage: mockCoverage,
      bandit: mockBandit,
      pipAudit: mockPipAudit,
      eslint: mockEslint,
    };
  } catch (error) {
    console.error("Error loading audit data:", error);
    return null;
  }
}

function formatDelta(x: number | null | undefined): string {
  if (x === null || x === undefined) return "N/A";
  const sign = x > 0 ? "+" : "";
  return `${sign}${x.toFixed(2)}`;
}

function AuditDashboardContent({ data }: { data: any }) {
  const { metrics, coverage, bandit, pipAudit, eslint } = data;

  // Procesar datos de seguridad
  const banditSummary = bandit?.results
    ? Object.entries(
        bandit.results.reduce((acc: Record<string, number>, item: any) => {
          acc[item.issue_severity] = (acc[item.issue_severity] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([k, v]) => `${k}:${v}`)
        .join("  ") || "OK"
    : "—";

  const pipAuditSummary = pipAudit?.vulnerabilities
    ? Object.entries(
        pipAudit.vulnerabilities.reduce(
          (acc: Record<string, number>, vuln: any) => {
            acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
            return acc;
          },
          {}
        )
      )
        .map(([k, v]) => `${k}:${v}`)
        .join("  ") || "OK"
    : pipAudit?.dependencies
      ? (() => {
          const vulns = pipAudit.dependencies.flatMap(
            (d: any) => d.vulns || []
          );
          const counts = vulns.reduce((acc: Record<string, number>, v: any) => {
            acc[v.severity] = (acc[v.severity] || 0) + 1;
            return acc;
          }, {});
          return Object.keys(counts).length
            ? Object.entries(counts)
                .map(([k, v]) => `${k}:${v}`)
                .join("  ")
            : "OK";
        })()
      : "—";

  const eslintSummary = eslint
    ? (Array.isArray(eslint)
        ? eslint.reduce(
            (acc: number, f: any) =>
              acc + (f.errorCount || 0) + (f.warningCount || 0),
            0
          )
        : (eslint.errorCount || 0) + (eslint.warningCount || 0)) + " issues"
    : "—";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          Audit Dashboard — facturación autónomos
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Transparencia en tiempo (casi) real: métricas de commits, cobertura,
          seguridad y SBOM.
        </p>
      </header>

      {/* Métricas principales */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow">
          <h2 className="font-semibold text-slate-900">Commits/semana</h2>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {metrics?.commits_per_week ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow">
          <h2 className="font-semibold text-slate-900">
            Gap medio entre commits (h)
          </h2>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {metrics?.avg_gap_hours ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow">
          <h2 className="font-semibold text-slate-900">Cobertura (%)</h2>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {coverage ? `${(coverage.line_rate * 100).toFixed(2)}` : "—"}
          </p>
        </div>
      </section>

      {/* Comparativa regional */}
      <section className="rounded-2xl border bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold text-slate-900">
          Comparativa regional (Δ vs media)
        </h2>
        <div className="grid gap-3 text-sm md:grid-cols-3">
          {["SP", "EU", "US"].map((region) => {
            const comparison =
              metrics?.comparisons?.[
                region as keyof typeof metrics.comparisons
              ];
            return (
              <div key={region} className="rounded-xl border bg-slate-50 p-3">
                <div className="font-medium text-slate-900">{region}</div>
                <div className="text-slate-600">
                  Commits/sem Δ{" "}
                  <span className="font-bold">
                    {formatDelta(comparison?.commits_wk_delta)}
                  </span>
                </div>
                <div className="text-slate-600">
                  Gap(h) Δ{" "}
                  <span className="font-bold">
                    {formatDelta(comparison?.time_between_delta_h)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hotspots */}
      <section className="rounded-2xl border bg-white p-4 shadow">
        <h2 className="mb-4 font-semibold text-slate-900">Hotspots</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm text-slate-700">
          {metrics?.hot_files
            ?.slice(0, 15)
            .map(([path, times]: [string, number]) => (
              <li key={path}>
                {path} · {times} cambios
              </li>
            )) ?? <li>No hay datos disponibles</li>}
        </ul>
      </section>

      {/* Evolución (commits últimos 90 días) */}
      <section className="rounded-2xl border bg-white p-4 shadow">
        <h2 className="mb-4 font-semibold text-slate-900">
          Evolución (commits últimos 90 días)
        </h2>
        <div className="flex h-20 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          <div className="text-center">
            <div className="text-lg font-medium">Commits/día (estimado)</div>
            <div className="text-sm">
              {metrics?.commits_per_week
                ? `${(metrics.commits_per_week / 7).toFixed(1)} commits/día`
                : "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Seguridad & Dependencias */}
      <section className="rounded-2xl border bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold text-slate-900">
          Seguridad & Dependencias
        </h2>
        <div className="space-y-1 text-sm text-slate-700">
          <p>
            <span className="font-medium">Bandit:</span>{" "}
            <span>{banditSummary}</span>
          </p>
          <p>
            <span className="font-medium">pip-audit:</span>{" "}
            <span>{pipAuditSummary}</span>
          </p>
          <p>
            <span className="font-medium">ESLint:</span>{" "}
            <span>{eslintSummary}</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t pt-6 text-center text-xs text-slate-500">
        Última actualización se refresca con cada push/schedule del Workflow
        (GitHub Pages).
      </footer>
    </div>
  );
}

function AuditDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <div className="mb-2 h-8 animate-pulse rounded bg-slate-200"></div>
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200"></div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-slate-200"
          ></div>
        ))}
      </div>

      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl bg-slate-200"
        ></div>
      ))}
    </div>
  );
}

export async function AuditDashboard() {
  const data = await loadAuditData();

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="text-center text-slate-600">
          No se pudieron cargar los datos del dashboard de auditoría.
        </div>
      </div>
    );
  }

  return <AuditDashboardContent data={data} />;
}
