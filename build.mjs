// สร้างเว็บ resume แบบ static จาก data/resume.json ลงโฟลเดอร์ dist/
// - dist/index.html            → หน้ารวม ลิงก์ไปทุกเวอร์ชัน
// - dist/<slug>/index.html     → resume แต่ละตำแหน่ง
// ไม่มี dependency ใช้ Node อย่างเดียว: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { qrSvg } from "./src/qr.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "dist");
const data = JSON.parse(readFileSync(join(root, "data/resume.json"), "utf8"));

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// ค่าที่เป็น object แยกตามชุด (core / test / fa / pm) → เลือกชุดแรกที่มีตามลำดับ sets ของ variant
function pick(value, sets) {
  if (value == null || typeof value === "string" || Array.isArray(value)) return value;
  for (const s of sets) if (value[s] != null) return value[s];
  return undefined;
}

function renderSwitcher(current, base) {
  if (!data.showSwitcher) return "";
  const links = data.variants
    .map((v) => {
      const href = `${base}${v.slug}/`;
      const cur = v.slug === current.slug ? ' aria-current="page"' : "";
      return `<a href="${href}"${cur}>${esc(v.label)}</a>`;
    })
    .join("");
  return `<nav class="switcher" aria-label="Resume versions"><a href="${base}">All</a>${links}</nav>`;
}

// ทุกหน้าตั้ง noindex: เว็บนี้ส่งลิงก์ให้เฉพาะคนที่เกี่ยวกับการสมัครงาน ไม่ต้องการให้ค้นเจอใน Google
function renderHead(title, description, base) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="noindex">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${base}style.css">
</head>`;
}

function renderContact(p, onlineUrl) {
  const online = onlineUrl
    ? `
        <li class="print-only"><a href="${esc(onlineUrl)}">${esc(onlineUrl.replace(/^https?:\/\//, ""))}</a></li>`
    : "";
  return `<ul class="contact">
        <li>${esc(p.location)}</li>
        <li><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>
        <li><a href="tel:${esc(p.phoneIntl)}">${esc(p.phone)}</a></li>${online}
      </ul>`;
}

// แสดงเฉพาะตอนพิมพ์ / Save as PDF: QR code ไปยังหน้าเว็บของเวอร์ชันนี้ คนถือกระดาษสแกนกลับมาดูออนไลน์ได้
function renderQr(url) {
  return `<a class="qr print-only" href="${esc(url)}">${qrSvg(url, { label: esc(url) })}<span>Scan for online version</span></a>`;
}

// หน้ารวม: การ์ดของทุกเวอร์ชัน กดเข้าไปดู resume เต็มของตำแหน่งนั้น
function renderHub(base) {
  const p = data.profile;
  const cards = data.variants
    .map(
      (v) => `
      <li>
        <a class="card" href="${base}${v.slug}/">
          <span class="card-title">${esc(v.headline)}</span>
          <span class="card-text">${esc(v.summary.split(/(?<=\.)\s/)[0])}</span>
          <span class="card-tags">${v.competencies.slice(0, 3).map((c) => `<span>${esc(c)}</span>`).join("")}</span>
          <span class="card-cta">View resume →</span>
        </a>
      </li>`
    )
    .join("");
  return `${renderHead(`${p.name} — Resume`, `Resume versions of ${p.name} by target role.`, base)}
<body>
  <main class="sheet hub">
    <header class="top">
      <h1>${esc(p.name)}</h1>
      <p class="headline">${esc(data.hub.headline)}</p>
      ${renderContact(p)}
    </header>
    <section>
      <h2>Resume by Role</h2>
      <p class="hub-intro">${esc(data.hub.intro)}</p>
      <ul class="cards">${cards}</ul>
    </section>
  </main>
</body>
</html>
`;
}

function renderPage(v, base) {
  const p = data.profile;
  const sets = v.sets;
  const portfolioDesc = pick(data.portfolio.description, sets);
  const onlineUrl = data.siteUrl ? `${data.siteUrl.replace(/\/$/, "")}/${v.slug}/` : "";

  const experience = data.experience
    .map((job) => {
      const roles = job.roles
        .map((r) => {
          const bullets = pick(r.bullets, sets) || [];
          if (!bullets.length) return "";
          return `
          <div class="role">
            <div class="role-head">
              <h4>${esc(pick(r.area, sets))}</h4>
              <span class="period">${esc(r.period)}</span>
            </div>
            <ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
          </div>`;
        })
        .join("");
      return `
        <article class="job">
          <header class="job-head">
            <h3>${esc(job.title)}</h3>
            <p class="org">${esc(job.company)} · ${esc(job.location)}</p>
          </header>
          ${roles}
        </article>`;
    })
    .join("");

  const portfolio =
    v.portfolio && portfolioDesc
      ? `
    <section>
      <h2>Portfolio Project</h2>
      <div class="portfolio">
        <div class="role-head">
          <h4>${esc(data.portfolio.name)}</h4>
          <a class="period" href="${esc(data.portfolio.url)}" target="_blank" rel="noopener">${esc(data.portfolio.urlLabel)} ↗</a>
        </div>
        <p>${esc(portfolioDesc)}</p>
      </div>
    </section>`
      : "";

  return `${renderHead(`${p.name} — ${v.headline}`, v.summary, base)}
<body>
  <div class="toolbar">
    ${renderSwitcher(v, base)}
    <button type="button" class="print" onclick="window.print()">Download PDF</button>
  </div>
  <main class="sheet">
    <header class="top">
      <div class="top-text">
        <h1>${esc(p.name)}</h1>
        <p class="headline">${esc(v.headline)}</p>
        ${renderContact(p, onlineUrl)}
      </div>
      ${onlineUrl ? renderQr(onlineUrl) : ""}
    </header>

    <section>
      <h2>Professional Summary</h2>
      <p>${esc(v.summary)}</p>
    </section>

    <section>
      <h2>Core Competencies</h2>
      <ul class="chips">${v.competencies.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
    </section>
    ${portfolio}
    <section>
      <h2>Work Experience</h2>
      ${experience}
    </section>

    <section>
      <h2>Earlier Career</h2>
      <ul class="plain">
        ${data.earlierCareer
          .map(
            (e) =>
              `<li><span><strong>${esc(e.title)}</strong> — ${esc(e.org)} · ${esc(e.location)}</span><span class="period">${esc(e.period)}</span></li>`
          )
          .join("")}
      </ul>
    </section>

    <section>
      <h2>Education</h2>
      <ul class="plain">
        ${data.education
          .map(
            (e) =>
              `<li><span><strong>${esc(e.degree)}</strong> — ${esc(e.school)}</span><span class="period">${esc(e.year)}</span></li>`
          )
          .join("")}
      </ul>
    </section>
  </main>
</body>
</html>
`;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
copyFileSync(join(root, "src/style.css"), join(out, "style.css"));

// ใช้ path แบบ relative เพื่อให้ทำงานได้ทั้ง GitHub Pages (/repo-name/) และ Cloudflare Pages (/)
writeFileSync(join(out, "index.html"), renderHub("./"));
for (const v of data.variants) {
  mkdirSync(join(out, v.slug), { recursive: true });
  writeFileSync(join(out, v.slug, "index.html"), renderPage(v, "../"));
}

console.log(`สร้างแล้ว ${data.variants.length + 1} หน้า → dist/`);
for (const v of data.variants) console.log(`  /${v.slug}/  ${v.label}`);
