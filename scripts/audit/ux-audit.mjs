#!/usr/bin/env node
// ============================================================
// RÉCUPÉO UX Audit Tool — Zero dependency, pure Node.js
// Analyse: HTTP, HTML, links, meta, API, source code
// Usage: node scripts/audit/ux-audit.mjs [/page] [--all] [--api] [--fix]
// ============================================================

import http from 'http'
import https from 'https'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:3000'
const DOMAIN = 'https://recupeo.fr'
const SRC = '/var/www/recupeo/src'
const REPORT = { pages: [], api: [], links: [], source: [], summary: {} }

// ─── HTTP fetch helper ───
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, { timeout: 10000, ...options }, (res) => {
      let body = ''
      res.on('data', d => body += d)
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }))
    })
    req.on('error', e => resolve({ status: 0, headers: {}, body: '', error: e.message }))
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, headers: {}, body: '', error: 'timeout' }) })
  })
}

// ─── HTML Parser (regex-based, no deps) ───
function parseHTML(html) {
  const links = []
  const images = []
  const buttons = []
  const inputs = []
  const anchors = []
  const metas = []
  const scripts = []
  const errors = []

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const title = titleMatch ? titleMatch[1].replace(/&#x27;/g, "'").replace(/&amp;/g, '&') : null

  // Meta tags
  const metaRe = /<meta\s+([^>]+)\/?>/gi
  let m
  while ((m = metaRe.exec(html))) {
    const attrs = {}
    const attrRe = /(\w[\w-]*)=["']([^"']*?)["']/g
    let a
    while ((a = attrRe.exec(m[1]))) attrs[a[1]] = a[2]
    metas.push(attrs)
  }

  // Links (a href)
  const linkRe = /<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi
  while ((m = linkRe.exec(html))) {
    const href = m[1].match(/href=["']([^"']*?)["']/)?.[1]
    const text = html.slice(m.index, m.index + 500).match(/>([^<]{0,100})/)?.[1]?.trim()
    const target = m[1].match(/target=["']([^"']*?)["']/)?.[1]
    if (href) links.push({ href, text: text?.slice(0, 80), target })
  }

  // Images
  const imgRe = /<img\s+([^>]*src=["'][^"']*["'][^>]*)>/gi
  while ((m = imgRe.exec(html))) {
    const src = m[1].match(/src=["']([^"']*?)["']/)?.[1]
    const alt = m[1].match(/alt=["']([^"']*?)["']/)?.[1]
    if (src) images.push({ src, alt: alt || null, hasAlt: !!alt })
  }

  // Buttons
  const btnRe = /<button\s+([^>]*)>([^<]{0,100})/gi
  while ((m = btnRe.exec(html))) {
    const disabled = /disabled/i.test(m[1])
    const type = m[1].match(/type=["']([^"']*?)["']/)?.[1]
    buttons.push({ text: m[2].trim().slice(0, 80), disabled, type: type || 'button' })
  }

  // Inputs
  const inputRe = /<input\s+([^>]*)>/gi
  while ((m = inputRe.exec(html))) {
    const type = m[1].match(/type=["']([^"']*?)["']/)?.[1] || 'text'
    const name = m[1].match(/name=["']([^"']*?)["']/)?.[1]
    const placeholder = m[1].match(/placeholder=["']([^"']*?)["']/)?.[1]
    inputs.push({ type, name, placeholder })
  }

  // Anchor IDs (for internal navigation)
  const idRe = /\bid=["']([^"']+)["']/gi
  while ((m = idRe.exec(html))) {
    anchors.push(m[1])
  }

  // OG tags
  const og = {}
  for (const meta of metas) {
    if (meta.property?.startsWith('og:')) og[meta.property] = meta.content
  }

  // Check for common issues
  if (!title) errors.push('MISSING: <title> tag')
  if (title && title.length > 70) errors.push(`WARN: Title too long (${title.length} chars)`)
  if (!og['og:title']) errors.push('MISSING: og:title meta tag')
  if (!og['og:description']) errors.push('MISSING: og:description meta tag')
  if (!og['og:image']) errors.push('MISSING: og:image meta tag')
  if (!metas.find(m => m.name === 'description')) errors.push('MISSING: meta description')

  const imgsNoAlt = images.filter(i => !i.hasAlt)
  if (imgsNoAlt.length) errors.push(`A11Y: ${imgsNoAlt.length} image(s) without alt text`)

  return { title, links, images, buttons, inputs, anchors, metas, og, errors }
}

// ─── Source code analysis ───
function auditSourceCode(pagePath) {
  const issues = []
  const dir = path.join(SRC, 'app', pagePath.replace(/^\//, ''))

  // Check page.tsx exists
  const pageFile = path.join(dir, 'page.tsx')
  if (!fs.existsSync(pageFile)) {
    issues.push({ severity: 'ERROR', file: pageFile, msg: 'page.tsx not found' })
    return issues
  }

  const content = fs.readFileSync(pageFile, 'utf8')

  // Check layout.tsx
  const layoutFile = path.join(dir, 'layout.tsx')
  if (!fs.existsSync(layoutFile)) {
    issues.push({ severity: 'WARN', file: dir, msg: 'No layout.tsx (using parent layout)' })
  } else {
    const layout = fs.readFileSync(layoutFile, 'utf8')
    if (!layout.includes('metadata') && !layout.includes('generateMetadata')) {
      issues.push({ severity: 'WARN', file: layoutFile, msg: 'No metadata export in layout' })
    }
  }

  // Check for common code issues
  if (content.includes('toLocaleString')) {
    issues.push({ severity: 'ERROR', file: pageFile, msg: 'Uses toLocaleString() instead of fmt() — causes □ glyphs in PDF' })
  }
  if (content.includes('console.log') && !content.includes('console.error')) {
    issues.push({ severity: 'WARN', file: pageFile, msg: 'Contains console.log (remove for production)' })
  }
  if (!content.includes('track(')) {
    issues.push({ severity: 'WARN', file: pageFile, msg: 'No GA4 tracking (track()) found' })
  }

  // Check components used
  if (!content.includes('CrossSellBriques') && pagePath !== '/') {
    issues.push({ severity: 'WARN', file: pageFile, msg: 'Missing CrossSellBriques component' })
  }
  if (!content.includes('TrustBanner') && pagePath !== '/') {
    issues.push({ severity: 'INFO', file: pageFile, msg: 'Missing TrustBanner component' })
  }
  if (!content.includes('FAQ') && pagePath !== '/') {
    issues.push({ severity: 'INFO', file: pageFile, msg: 'Missing FAQ component' })
  }
  if (!content.includes('LegalDisclaimer') && pagePath !== '/') {
    issues.push({ severity: 'WARN', file: pageFile, msg: 'Missing LegalDisclaimer component' })
  }

  // Check for broken imports
  const importRe = /from ['"](@\/[^'"]+)['"]/g
  let im
  while ((im = importRe.exec(content))) {
    const importPath = im[1].replace('@/', SRC + '/')
    const candidates = [importPath + '.ts', importPath + '.tsx', importPath + '/index.ts', importPath + '/index.tsx']
    if (!candidates.some(c => fs.existsSync(c))) {
      issues.push({ severity: 'ERROR', file: pageFile, msg: `Broken import: ${im[1]}` })
    }
  }

  return issues
}

// ─── Audit a single page ───
async function auditPage(pagePath) {
  const url = BASE + pagePath
  const result = { path: pagePath, url, errors: [], warnings: [], info: [] }

  // 1. HTTP check
  const res = await fetch(url)
  result.httpStatus = res.status
  if (res.status !== 200) {
    result.errors.push(`HTTP ${res.status} for ${pagePath}`)
    REPORT.pages.push(result)
    return result
  }

  // 2. Parse HTML
  const parsed = parseHTML(res.body)
  result.title = parsed.title
  result.linksCount = parsed.links.length
  result.imagesCount = parsed.images.length
  result.buttonsCount = parsed.buttons.length
  result.inputsCount = parsed.inputs.length
  result.anchorsCount = parsed.anchors.length
  result.ogTags = parsed.og

  // HTML errors
  for (const e of parsed.errors) {
    if (e.startsWith('MISSING') || e.startsWith('A11Y')) result.warnings.push(e)
    else result.info.push(e)
  }

  // 3. Check internal links
  const internalLinks = parsed.links
    .filter(l => l.href && !l.href.startsWith('http') && !l.href.startsWith('mailto') && !l.href.startsWith('#') && !l.href.startsWith('tel'))
    .map(l => l.href.split('?')[0].split('#')[0])
    .filter((v, i, a) => a.indexOf(v) === i) // unique

  for (const link of internalLinks) {
    const linkRes = await fetch(BASE + link)
    if (linkRes.status !== 200) {
      result.errors.push(`BROKEN LINK: ${link} → HTTP ${linkRes.status}`)
    }
    REPORT.links.push({ from: pagePath, to: link, status: linkRes.status })
  }

  // 4. Check external links (just log, don't fail)
  const externalLinks = parsed.links
    .filter(l => l.href && l.href.startsWith('http'))
    .map(l => ({ href: l.href, text: l.text }))
  result.externalLinks = externalLinks.length

  // 5. Source code audit
  const sourceIssues = auditSourceCode(pagePath)
  for (const issue of sourceIssues) {
    if (issue.severity === 'ERROR') result.errors.push(`CODE: ${issue.msg}`)
    else if (issue.severity === 'WARN') result.warnings.push(`CODE: ${issue.msg}`)
    else result.info.push(`CODE: ${issue.msg}`)
  }

  // 6. Check components in HTML output
  const htmlSize = res.body.length
  result.htmlSize = `${Math.round(htmlSize / 1024)}KB`

  // Check for empty sections
  if (res.body.includes('undefined') && !res.body.includes('undefined;') && !res.body.includes('$undefined')) {
    result.warnings.push('HTML contains "undefined" — possible render bug')
  }
  if (res.body.includes('NaN')) {
    result.errors.push('HTML contains "NaN" — calculation bug')
  }
  if (res.body.includes('[object Object]')) {
    result.errors.push('HTML contains "[object Object]" — render bug')
  }

  REPORT.pages.push(result)
  return result
}

// ─── Audit API routes ───
async function auditAPIs() {
  const apiDir = path.join(SRC, 'app/api')
  const routes = []

  function walk(dir, prefix = '/api') {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(dir, entry.name), `${prefix}/${entry.name}`)
      if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
        const content = fs.readFileSync(path.join(dir, entry.name), 'utf8')
        const methods = []
        if (content.includes('export async function GET') || content.includes('export function GET')) methods.push('GET')
        if (content.includes('export async function POST') || content.includes('export function POST')) methods.push('POST')
        routes.push({ path: prefix, methods, file: path.join(dir, entry.name) })
      }
    }
  }
  walk(apiDir)

  // Test GET routes
  for (const route of routes) {
    if (route.methods.includes('GET')) {
      const res = await fetch(BASE + route.path)
      route.getStatus = res.status
      if (res.status >= 500) {
        REPORT.api.push({ ...route, error: `GET ${route.path} → ${res.status}` })
      } else {
        REPORT.api.push(route)
      }
    } else {
      REPORT.api.push(route)
    }
  }
}

// ─── Check all component files for issues ───
function auditComponents() {
  const issues = []
  const compDir = path.join(SRC, 'components')

  function walkFiles(dir) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walkFiles(path.join(dir, entry.name))
      if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        const file = path.join(dir, entry.name)
        const content = fs.readFileSync(file, 'utf8')
        const relPath = file.replace(SRC + '/', '')

        if (content.includes('toLocaleString')) {
          issues.push({ severity: 'ERROR', file: relPath, msg: 'Uses toLocaleString() — use fmt() instead' })
        }
        if (content.includes("'use client'") && content.includes('async function')) {
          // Client components can't be async
          if (content.match(/export\s+default\s+async\s+function/)) {
            issues.push({ severity: 'ERROR', file: relPath, msg: 'Client component with async default export' })
          }
        }
        // Check for hardcoded prices without fmt()
        if (content.match(/\d{3,}€/) && !content.includes('fmt(') && !content.includes('FAQ') && !content.includes('Hero')) {
          issues.push({ severity: 'WARN', file: relPath, msg: 'Hardcoded price without fmt()' })
        }
        // Check href consistency
        const hrefs = content.match(/href=["']\/[^"']+["']/g) || []
        for (const h of hrefs) {
          const href = h.match(/href=["']([^"']+)["']/)?.[1]
          if (href && !href.startsWith('/') && !href.startsWith('http') && !href.startsWith('#')) {
            issues.push({ severity: 'WARN', file: relPath, msg: `Relative href: ${href}` })
          }
        }
      }
    }
  }
  walkFiles(compDir)

  // Also check lib files
  const libDir = path.join(SRC, 'lib')
  function walkLib(dir) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walkLib(path.join(dir, entry.name))
      if (entry.name.endsWith('.ts') && !entry.name.includes('test')) {
        const file = path.join(dir, entry.name)
        const content = fs.readFileSync(file, 'utf8')
        const relPath = file.replace(SRC + '/', '')
        if (content.includes('toLocaleString') && !content.includes('// OK:') && !content.includes('JAMAIS toLocaleString')) {
          issues.push({ severity: 'ERROR', file: relPath, msg: 'Uses toLocaleString() — use fmt()' })
        }
      }
    }
  }
  walkLib(libDir)

  REPORT.source = issues
}

// ─── Pretty print report ───
function printReport() {
  const C = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', gray: '\x1b[90m', reset: '\x1b[0m', bold: '\x1b[1m' }

  console.log(`\n${C.bold}${'═'.repeat(60)}`)
  console.log(`  RÉCUPÉO UX AUDIT REPORT`)
  console.log(`${'═'.repeat(60)}${C.reset}\n`)

  let totalErrors = 0, totalWarnings = 0

  // Pages
  for (const page of REPORT.pages) {
    const icon = page.errors.length ? '❌' : page.warnings.length ? '⚠️' : '✅'
    console.log(`${icon} ${C.bold}${page.path}${C.reset} — HTTP ${page.httpStatus} | ${page.htmlSize || '?'} | ${page.linksCount || 0} links | ${page.buttonsCount || 0} btns | ${page.inputsCount || 0} inputs`)
    if (page.title) console.log(`   ${C.gray}Title: ${page.title}${C.reset}`)

    for (const e of page.errors) { console.log(`   ${C.red}ERROR: ${e}${C.reset}`); totalErrors++ }
    for (const w of page.warnings) { console.log(`   ${C.yellow}WARN: ${w}${C.reset}`); totalWarnings++ }
    for (const i of page.info) { console.log(`   ${C.gray}INFO: ${i}${C.reset}`) }
    console.log()
  }

  // Broken links
  const broken = REPORT.links.filter(l => l.status !== 200)
  if (broken.length) {
    console.log(`${C.bold}─── BROKEN LINKS ───${C.reset}`)
    for (const l of broken) {
      console.log(`   ${C.red}${l.from} → ${l.to} (${l.status})${C.reset}`)
      totalErrors++
    }
    console.log()
  }

  // API routes
  if (REPORT.api.length) {
    console.log(`${C.bold}─── API ROUTES (${REPORT.api.length}) ───${C.reset}`)
    for (const r of REPORT.api) {
      const status = r.getStatus ? (r.getStatus < 400 ? `${C.green}${r.getStatus}${C.reset}` : `${C.red}${r.getStatus}${C.reset}`) : `${C.gray}POST-only${C.reset}`
      console.log(`   ${r.methods.join(',')} ${r.path} ${status}`)
    }
    console.log()
  }

  // Source code issues
  if (REPORT.source.length) {
    console.log(`${C.bold}─── SOURCE CODE ISSUES (${REPORT.source.length}) ───${C.reset}`)
    for (const s of REPORT.source) {
      const color = s.severity === 'ERROR' ? C.red : s.severity === 'WARN' ? C.yellow : C.gray
      console.log(`   ${color}${s.severity}: ${s.file} — ${s.msg}${C.reset}`)
      if (s.severity === 'ERROR') totalErrors++
      if (s.severity === 'WARN') totalWarnings++
    }
    console.log()
  }

  // Summary
  console.log(`${C.bold}${'═'.repeat(60)}`)
  console.log(`  SUMMARY: ${REPORT.pages.length} pages | ${REPORT.api.length} API routes | ${REPORT.links.length} links checked`)
  console.log(`  ${C.red}${totalErrors} errors${C.reset} | ${C.yellow}${totalWarnings} warnings${C.reset}`)
  console.log(`${'═'.repeat(60)}${C.reset}\n`)

  return { totalErrors, totalWarnings }
}

// ─── Main ───
async function main() {
  const args = process.argv.slice(2)
  const doAll = args.includes('--all')
  const doApi = args.includes('--api') || doAll
  const specificPage = args.find(a => a.startsWith('/'))

  // All brique pages
  const PAGES = [
    '/', '/monimpot', '/macaution', '/retraitia', '/monloyer',
    '/mataxe', '/mapension', '/mabanque', '/monchomage',
    '/avis', '/connexion',
    '/mentions-legales', '/cgu', '/confidentialite',
  ]

  const pagesToAudit = specificPage ? [specificPage] : (doAll ? PAGES : ['/monimpot'])

  console.log(`\n🔍 Auditing ${pagesToAudit.length} page(s)...\n`)

  for (const p of pagesToAudit) {
    process.stdout.write(`  Auditing ${p}...`)
    await auditPage(p)
    console.log(' done')
  }

  if (doApi) {
    console.log('  Auditing API routes...')
    await auditAPIs()
  }

  console.log('  Auditing source code...')
  auditComponents()

  const { totalErrors, totalWarnings } = printReport()

  // Save JSON report
  const reportPath = '/var/www/recupeo/scripts/audit/last-report.json'
  fs.writeFileSync(reportPath, JSON.stringify(REPORT, null, 2))
  console.log(`📄 Full report saved: ${reportPath}\n`)

  process.exit(totalErrors > 0 ? 1 : 0)
}

main().catch(e => { console.error(e); process.exit(1) })
