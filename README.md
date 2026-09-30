# Resume — Peerapat Suwanphorung

เว็บ resume แบบ static ที่มีหลายเวอร์ชันตามตำแหน่งงาน สร้างจากข้อมูลไฟล์เดียว

## โครงสร้าง

- `data/resume.json` — ข้อมูลทั้งหมด (โปรไฟล์, ประสบการณ์, แต่ละเวอร์ชัน) **แก้ที่นี่ที่เดียว**
- `src/style.css` — หน้าตาเว็บ + รูปแบบตอนพิมพ์เป็น PDF (A4)
- `build.mjs` — สร้างหน้าเว็บลง `dist/`

## แต่ละเวอร์ชัน (URL)

| Path | ตำแหน่ง |
| --- | --- |
| `/` | หน้ารวม — การ์ดลิงก์ไปทุกเวอร์ชัน (ข้อความหัวหน้าอยู่ใน `hub`) |
| `/senior-process-engineer/` | Senior Process Engineer |
| `/senior-test-engineer/` | Senior Test Engineer |
| `/process-engineer/` | Process Engineer |
| `/failure-analysis-engineer/` | Failure Analysis Engineer |
| `/process-validation/` | Process Validation & Quality |

ทุกหน้าตั้ง `noindex` ไว้ Google จะไม่เก็บ ส่งลิงก์ให้เฉพาะคนที่เกี่ยวกับการสมัครงาน
หน้าแต่ละเวอร์ชันไม่มีลิงก์กลับไปหน้ารวม ถ้าอยากให้มีปุ่มสลับเวอร์ชัน ตั้ง `"showSwitcher": true`

## วิธีเลือก bullet ตามเวอร์ชัน

bullet และชื่อส่วนงานเก็บแยกเป็นชุด: `core`, `test`, `fa`, `pm`
แต่ละเวอร์ชันกำหนด `sets` เช่น `["test", "core"]` = ใช้ชุด `test` ถ้ามี ไม่มีก็ใช้ `core`

เพิ่มเวอร์ชันใหม่: เพิ่ม object ใน `variants` (slug, headline, summary, competencies, sets)

## คำสั่ง

```bash
npm run build      # สร้าง dist/
npm run preview    # สร้างแล้วเปิดดูที่ http://localhost:4321
npm run deploy:cf  # deploy ขึ้น Cloudflare Worker ด้วยมือ (ปกติ push แล้ว deploy เอง)
```

## Deploy

- **GitHub Pages** — push เข้า `main` แล้ว `.github/workflows/pages.yml` จะ build และ deploy ให้เอง
  (ครั้งแรกต้องตั้ง Settings → Pages → Source = GitHub Actions)
- **Cloudflare Worker** (`peerapat-resume`) — เชื่อม repo เดียวกันผ่าน Workers Builds push เข้า `main` แล้ว deploy เอง
  การตั้งค่าทั้งหมด (build command, โฟลเดอร์ `dist`, โดเมน `resume.songvijit.com`) อยู่ใน `wrangler.jsonc`
