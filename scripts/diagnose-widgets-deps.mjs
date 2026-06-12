#!/usr/bin/env node
/**
 * Widgets 의존성 4축 진단 스크립트
 * Usage: node scripts/diagnose-widgets-deps.mjs [--json]
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const WIDGET_IMPORT_RE = /from\s+["']@\/widgets\/([^"']+)["']/g;
const LAYERS = ["app", "widgets", "features", "entities", "shared", "tests"];

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|mts)$/.test(name)) acc.push(full);
  }
  return acc;
}

function layerOf(filePath) {
  const rel = relative(ROOT, filePath).split(sep)[0];
  return LAYERS.includes(rel) ? rel : "other";
}

function topWidgetSlice(importPath) {
  const parts = importPath.split("/");
  if (parts[0] === "home" || parts[0] === "subscribe" || parts[0] === "support") {
    return parts.slice(0, 2).join("/");
  }
  return parts[0];
}

function sourceWidgetSlice(filePath) {
  const rel = relative(join(ROOT, "widgets"), filePath);
  if (!rel || rel.startsWith("..")) return null;
  const parts = rel.split(sep);
  if (parts[0] === "home" || parts[0] === "subscribe" || parts[0] === "support") {
    return parts.slice(0, 2).join("/");
  }
  return parts[0];
}

function isDeepImport(importPath) {
  return /\/(ui|lib|assets)\//.test(importPath);
}

function scan() {
  const files = walk(ROOT);
  const importsByLayer = Object.fromEntries(LAYERS.map((l) => [l, []]));
  const targetSliceCounts = new Map();
  const violations = [];
  const crossWidget = [];
  const deepImports = [];

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const layer = layerOf(file);
    const relFile = relative(ROOT, file);

    let m;
    WIDGET_IMPORT_RE.lastIndex = 0;
    while ((m = WIDGET_IMPORT_RE.exec(content)) !== null) {
      const importPath = m[1];
      const entry = { file: relFile, importPath, layer };

      importsByLayer[layer].push(entry);

      const slice = topWidgetSlice(importPath);
      targetSliceCounts.set(slice, (targetSliceCounts.get(slice) ?? 0) + 1);

      if (["features", "entities", "shared"].includes(layer)) {
        violations.push(entry);
      }

      if (layer === "widgets") {
        const src = sourceWidgetSlice(file);
        const tgt = topWidgetSlice(importPath);
        if (src && src !== tgt) {
          crossWidget.push({ from: src, to: tgt, file: relFile, importPath });
        }
      }

      if (isDeepImport(importPath)) {
        deepImports.push(entry);
      }
    }
  }

  const totalImports = [...targetSliceCounts.values()].reduce((a, b) => a + b, 0);
  const sliceRanking = [...targetSliceCounts.entries()].sort((a, b) => b[1] - a[1]);

  const crossMatrix = new Map();
  for (const { from, to } of crossWidget) {
    const key = `${from} -> ${to}`;
    crossMatrix.set(key, (crossMatrix.get(key) ?? 0) + 1);
  }

  return {
    generatedAt: new Date().toISOString(),
    totalImportLines: totalImports,
    uniqueImportingFiles: new Set(
      LAYERS.flatMap((l) => importsByLayer[l].map((e) => e.file))
    ).size,
    importsByLayer: Object.fromEntries(
      LAYERS.map((l) => [l, importsByLayer[l].length])
    ),
    fsdViolations: violations,
    sliceRanking: sliceRanking.map(([slice, count]) => ({
      slice,
      count,
      pct: totalImports ? Math.round((count / totalImports) * 100) : 0,
    })),
    crossWidgetMatrix: [...crossMatrix.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([edge, count]) => ({ edge, count })),
    crossWidgetFileCount: new Set(crossWidget.map((c) => c.file)).size,
    deepImportCount: deepImports.length,
    deepImports: deepImports.slice(0, 20),
  };
}

function formatReport(report) {
  const lines = [
    "# Widgets Dependency Diagnosis Report",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    `- Total @/widgets import lines: ${report.totalImportLines}`,
    `- Unique importing files: ${report.uniqueImportingFiles}`,
    `- FSD violations (features/entities/shared → widgets): ${report.fsdViolations.length}`,
    `- Cross-widget importer files: ${report.crossWidgetFileCount}`,
    `- Deep imports (ui/lib/assets): ${report.deepImportCount}`,
    "",
    "## Imports by layer",
    ...Object.entries(report.importsByLayer).map(([l, n]) => `- ${l}: ${n}`),
    "",
    "## Target slice ranking",
    ...report.sliceRanking.map(
      (r) => `- ${r.slice}: ${r.count} (${r.pct}%)`
    ),
    "",
    "## FSD violations",
    ...(report.fsdViolations.length
      ? report.fsdViolations.map(
          (v) => `- [${v.layer}] ${v.file} → @/widgets/${v.importPath}`
        )
      : ["- (none)"]),
    "",
    "## Cross-widget dependency matrix",
    ...report.crossWidgetMatrix.map((e) => `- ${e.edge}: ${e.count}`),
    "",
    "## Extraction priorities",
    "- [P0 DONE] entities/package — package tier data & theme helpers",
    "- [P1 DONE] features/order — order pricing & invite validation",
    "- [P1 DONE] entities/package/ui — shared package UI (subscribe ↔ home decoupled)",
    "- [P2 DONE] PackageNutritionGuide/CompareTable → entities/package",
    "- [P2 DONE] OrderSection sub-modules, mypage dashboard-shared → lib/",
    "- [P3] SubscriptionChangePlansSection, OrderSection section split, CI depcruise",
  ];
  return lines.join("\n");
}

const jsonMode = process.argv.includes("--json");
const report = scan();

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const text = formatReport(report);
  console.log(text);
  const outDir = join(ROOT, "scripts", "reports");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "widgets-deps-latest.md");
  writeFileSync(outPath, text, "utf8");
  console.log(`\nReport written to ${relative(ROOT, outPath)}`);
}
