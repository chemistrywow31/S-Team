#!/usr/bin/env node
// validate-tokens.cjs — structural + factual validation of a style tokens.md
//
// Usage:
//   node validate-tokens.cjs <path-to-tokens.md-or-style-dir> [--json]
//
// Checks:
//   S1  style folder name is kebab-case, file is named tokens.md
//   S2  the 10 required sections exist, numbered 1–10, in order (extra sections after 10 allowed)
//   S3  section 2 declares ≥ 5 CSS custom properties (--token: value)
//   S4  every declared contrast ratio is RECOMPUTED from the hex values —
//       declared vs computed must agree within ±0.5, and the claimed WCAG level must hold
//       (AAA ⇒ ≥ 7.0, AA ⇒ ≥ 4.5, AA-large ⇒ ≥ 3.0)
//   S5  section 8 contains a motion-policy YAML block with required/forbidden/density/reduced-motion,
//       density has both caps, and no effect appears in two of required/allowed/forbidden
//   S6  section 9 contains at least one ```html skeleton
//   S7  section 10 lists ≥ 5 don't entries
//   W1  (warning) file under 200 lines — README expects 200+ lines of depth for built-in quality
//
// Exit codes: 0 = PASS (warnings allowed), 1 = FAIL, 2 = invocation error

const fs = require('fs');
const path = require('path');

const SECTION_PATTERNS = [
  { n: 1,  re: /concept|mood/i,                      label: 'Concept & Mood' },
  { n: 2,  re: /color/i,                             label: 'Color Tokens' },
  { n: 3,  re: /typograph/i,                         label: 'Typography' },
  { n: 4,  re: /spacing|rhythm/i,                    label: 'Spacing & Rhythm' },
  { n: 5,  re: /surface|border|rule|divider/i,       label: 'Surfaces & Borders' },
  { n: 6,  re: /texture|atmosphere/i,                label: 'Texture & Atmosphere' },
  { n: 7,  re: /signature|component/i,               label: 'Signature Components' },
  { n: 8,  re: /motion.*effects|effects.*policy/i,   label: 'Motion & Effects Policy' },
  { n: 9,  re: /slide template/i,                    label: 'Slide Templates' },
  { n: 10, re: /don'?ts/i,                           label: "Don'ts" },
];

// --- WCAG relative luminance / contrast ---
function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}
function luminance([r, g, b]) {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(fg, bg) {
  const l1 = luminance(fg), l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function main() {
  const argPath = process.argv[2];
  const asJson = process.argv.includes('--json');
  if (!argPath) { console.error('Usage: node validate-tokens.cjs <tokens.md | style-dir> [--json]'); process.exit(2); }

  let file = path.resolve(argPath);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'tokens.md');
  if (!fs.existsSync(file)) { console.error(`FATAL: not found: ${file}`); process.exit(2); }

  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const styleDir = path.basename(path.dirname(file));
  const failures = [];
  const warnings = [];
  const passes = [];

  // S1 naming
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(styleDir)) failures.push(`S1 naming: style folder "${styleDir}" is not kebab-case`);
  else passes.push(`S1 naming: "${styleDir}" is kebab-case`);
  if (path.basename(file) !== 'tokens.md') failures.push(`S1 naming: file must be tokens.md, got ${path.basename(file)}`);

  // S2 sections
  const headers = [];
  lines.forEach((l, i) => {
    const m = l.match(/^##\s+(\d+)\.\s+(.*)$/);
    if (m) headers.push({ num: parseInt(m[1], 10), title: m[2].trim(), line: i + 1 });
  });
  let cursor = 0;
  for (const spec of SECTION_PATTERNS) {
    const idx = headers.findIndex((h, i) => i >= cursor && h.num === spec.n && spec.re.test(h.title));
    if (idx === -1) {
      failures.push(`S2 sections: missing or out-of-order section ${spec.n} (${spec.label})`);
    } else {
      cursor = idx + 1;
      passes.push(`S2 sections: ${spec.n}. ${spec.label} found (line ${headers[idx].line})`);
    }
  }
  const sectionBody = n => {
    const start = headers.find(h => h.num === n);
    if (!start) return '';
    const next = headers.find(h => h.num === n + 1) || { line: lines.length + 1 };
    return lines.slice(start.line, next.line - 1).join('\n');
  };

  // S3 css tokens in section 2
  const tokenDecls = [...sectionBody(2).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)];
  if (tokenDecls.length < 5) failures.push(`S3 tokens: section 2 declares only ${tokenDecls.length} CSS custom properties (need ≥ 5)`);
  else passes.push(`S3 tokens: ${tokenDecls.length} CSS custom properties declared`);

  // token → hex map (whole file, so hexes defined elsewhere still resolve)
  const tokenHex = {};
  for (const m of src.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\b/g)) {
    if (!(m[1] in tokenHex)) tokenHex[m[1]] = m[2];
  }

  // S4 recompute declared contrast ratios
  // Line shape: - `--fg` (#hex)? (prose)? on `--bg` (#hex)? ...: **N:1** ✓ AA|AAA|AA-large
  const contrastRe = /`(--[\w-]+)`(?:\s*\((#[0-9a-fA-F]{3,6})?[^)]*\))?[^`\n]*?on\s+`(--[\w-]+)`(?:\s*\((#[0-9a-fA-F]{3,6})?[^)]*\))?[^*\n]*\*\*([\d.]+):1\*\*(?:[^\n]*?(AAA|AA-large|AA\b))?/g;
  let contrastCount = 0;
  for (const m of src.matchAll(contrastRe)) {
    contrastCount++;
    const [ , fgTok, fgInline, bgTok, bgInline, declaredStr, level ] = m;
    const fgHex = fgInline || tokenHex[fgTok];
    const bgHex = bgInline || tokenHex[bgTok];
    if (!fgHex || !bgHex) {
      warnings.push(`S4 contrast: cannot resolve ${fgTok} on ${bgTok} to hex (non-hex token?) — declared ${declaredStr}:1 not verified`);
      continue;
    }
    const computed = contrast(hexToRgb(fgHex), hexToRgb(bgHex));
    const declared = parseFloat(declaredStr);
    if (Math.abs(computed - declared) > 0.5) {
      failures.push(`S4 contrast: ${fgTok} on ${bgTok} declared ${declared}:1 but computes to ${computed.toFixed(1)}:1 (${fgHex} on ${bgHex})`);
      continue;
    }
    const minByLevel = level === 'AAA' ? 7.0 : level === 'AA-large' ? 3.0 : level === 'AA' ? 4.5 : null;
    if (minByLevel !== null && computed < minByLevel) {
      failures.push(`S4 contrast: ${fgTok} on ${bgTok} claims ${level} but computes to ${computed.toFixed(1)}:1 (< ${minByLevel})`);
      continue;
    }
    passes.push(`S4 contrast: ${fgTok} on ${bgTok} = ${computed.toFixed(1)}:1 ✓ matches declared ${declared}:1${level ? ' ' + level : ''}`);
  }
  if (contrastCount === 0) failures.push('S4 contrast: no contrast declarations found in the WCAG format (`--fg` on `--bg`: **N:1**)');

  // S5 motion-policy
  const s8 = sectionBody(8);
  const policyMatch = s8.match(/```ya?ml\n([\s\S]*?)```/);
  if (!policyMatch || !/motion-policy:/.test(policyMatch[1])) {
    failures.push('S5 motion-policy: section 8 has no ```yaml block containing motion-policy:');
  } else {
    const y = policyMatch[1];
    for (const key of ['required:', 'forbidden:', 'density:', 'reduced-motion:']) {
      if (!y.includes(key)) failures.push(`S5 motion-policy: missing key "${key.replace(':', '')}"`);
    }
    for (const cap of ['continuous-animations-per-slide', 'slides-with-effects']) {
      if (!new RegExp(`${cap}\\s*:\\s*\\d+`).test(y)) failures.push(`S5 motion-policy: density missing numeric cap "${cap}"`);
    }
    // effects must not appear under two of required/allowed/forbidden
    const listUnder = key => {
      const m2 = y.match(new RegExp(`^\\s*${key}:\\s*\\n((?:\\s+-\\s+[^\\n]+\\n?)+)`, 'm'));
      if (!m2) return [];
      return [...m2[1].matchAll(/-\s+([\w-]+)/g)].map(x => x[1]);
    };
    const req = listUnder('required'), alw = listUnder('allowed'), fbd = listUnder('forbidden');
    const seen = {};
    [['required', req], ['allowed', alw], ['forbidden', fbd]].forEach(([name, list]) =>
      list.forEach(e => { if (seen[e]) failures.push(`S5 motion-policy: effect "${e}" appears in both ${seen[e]} and ${name}`); else seen[e] = name; }));
    if (!failures.some(f => f.startsWith('S5'))) passes.push(`S5 motion-policy: structure valid (${req.length} required, ${alw.length} allowed, ${fbd.length} forbidden)`);
  }

  // S6 html skeletons
  const htmlBlocks = [...sectionBody(9).matchAll(/```html/g)].length;
  if (htmlBlocks === 0) failures.push('S6 templates: section 9 contains no ```html skeleton');
  else passes.push(`S6 templates: ${htmlBlocks} HTML skeleton(s) in section 9`);

  // S7 don'ts
  const dontCount = sectionBody(10).split('\n').filter(l => /^\s*-\s+\S/.test(l)).length;
  if (dontCount < 5) failures.push(`S7 don'ts: section 10 lists only ${dontCount} entries (need ≥ 5)`);
  else passes.push(`S7 don'ts: ${dontCount} entries`);

  // W1 depth
  if (lines.length < 200) warnings.push(`W1 depth: ${lines.length} lines — README expects 200+ lines for built-in quality; add depth before promoting`);

  const status = failures.length === 0 ? 'PASS' : 'FAIL';
  if (asJson) {
    console.log(JSON.stringify({ file: path.relative(process.cwd(), file), status, failures, warnings, passes }, null, 2));
  } else {
    console.log(`validate-tokens ${status} — ${path.relative(process.cwd(), file)}`);
    failures.forEach(f => console.log(`  FAIL  ${f}`));
    warnings.forEach(w => console.log(`  WARN  ${w}`));
    console.log(`  (${passes.length} checks passed, ${warnings.length} warnings, ${failures.length} failures)`);
  }
  process.exit(status === 'PASS' ? 0 : 1);
}

main();
