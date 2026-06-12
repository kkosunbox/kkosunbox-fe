#!/usr/bin/env node
/**
 * png/jpg/jpeg → webp 변환 스크립트.
 *
 * 사용법:
 *   node scripts/convert-to-webp.mjs <파일|디렉터리...> [옵션]
 *
 * 옵션:
 *   --quality=N    webp 품질 (기본 82, 1-100)
 *   --lossless     무손실 변환 (아이콘·일러스트 등 png에 권장)
 *   --delete       변환 성공 시 원본 삭제 (참조 경로 수정·검증 후 사용 권장)
 *
 * 변환 결과가 원본보다 크면 webp를 만들지 않고 건너뛴다.
 */
import { createRequire } from "node:module";
import { statSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
function loadSharp() {
  try {
    return require("sharp");
  } catch {
    // pnpm: next의 optionalDependency로 설치된 sharp를 사용
    const nextPkg = require.resolve("next/package.json");
    return createRequire(nextPkg)("sharp");
  }
}
const sharp = loadSharp();

const EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const targets = args.filter((a) => !a.startsWith("--"));

const quality = Number((flags.find((f) => f.startsWith("--quality=")) ?? "--quality=82").split("=")[1]);
const lossless = flags.includes("--lossless");
const deleteOriginal = flags.includes("--delete");

if (targets.length === 0) {
  console.error("사용법: node scripts/convert-to-webp.mjs <파일|디렉터리...> [--quality=N] [--lossless] [--delete]");
  process.exit(1);
}

function collectFiles(target) {
  const stat = statSync(target);
  if (stat.isFile()) {
    return EXTENSIONS.has(path.extname(target).toLowerCase()) ? [target] : [];
  }
  return readdirSync(target, { recursive: true, withFileTypes: false })
    .map((f) => path.join(target, f))
    .filter((f) => statSync(f).isFile() && EXTENSIONS.has(path.extname(f).toLowerCase()));
}

const files = [...new Set(targets.flatMap(collectFiles))];
if (files.length === 0) {
  console.log("변환할 png/jpg 파일이 없습니다.");
  process.exit(0);
}

const fmt = (bytes) => (bytes / 1024).toFixed(1) + "KB";
let totalBefore = 0;
let totalAfter = 0;
const converted = [];
const skipped = [];

for (const file of files) {
  const out = file.replace(/\.(png|jpe?g)$/i, ".webp");
  const before = statSync(file).size;
  await sharp(file).webp({ quality, lossless }).toFile(out);
  const after = statSync(out).size;

  if (after >= before) {
    unlinkSync(out);
    skipped.push(file);
    console.log(`건너뜀  ${file} (webp ${fmt(after)} >= 원본 ${fmt(before)})`);
    continue;
  }

  totalBefore += before;
  totalAfter += after;
  converted.push({ file, out });
  const saved = (((before - after) / before) * 100).toFixed(1);
  console.log(`변환    ${file} → ${path.basename(out)}  ${fmt(before)} → ${fmt(after)} (-${saved}%)`);

  if (deleteOriginal) unlinkSync(file);
}

console.log("");
console.log(`완료: ${converted.length}개 변환, ${skipped.length}개 건너뜀`);
if (converted.length > 0) {
  const totalSaved = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1);
  console.log(`용량: ${fmt(totalBefore)} → ${fmt(totalAfter)} (-${totalSaved}%)`);
}
if (deleteOriginal && converted.length > 0) {
  console.log("원본 삭제됨 — 참조 경로가 모두 .webp로 바뀌었는지 확인 필요");
}
