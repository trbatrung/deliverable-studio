# Deliverable — Project Context

## What this is

Deliverable is a boutique AI video production studio brand, built for Trung Truong (also goes by Ethan), a video producer and AI workflow specialist based in Ho Chi Minh City with 7+ years of experience.

The studio targets international B2B clients, specifically SMEs in Australia, UK, and Singapore that need training videos, onboarding content, and course modules, but don't want to hire an in-house team or pay traditional agency rates.

## Why this positioning

The Vietnamese local market for AI video is commoditized and a race to zero (people charging as little as 30,000 VND per video, roughly 1-2 USD). That market is not worth competing in.

The real differentiator is owning an end-to-end AI video pipeline: scripting, AI avatar generation (HeyGen), AI video tools (Veo 3, Flo), editing (Final Cut Pro, Premiere Pro), and delivery, combined with real production judgment from 7 years of experience.

## Brand identity

- **Name:** Deliverable
- **Tagline:** "AI video solutions for businesses that move fast."
- **Color:** Warm amber, #E8940A, on white background
- **Logo:** Wordmark only, Inter font, medium weight (500), tight letter spacing
- **Tone:** Clean, trustworthy, confident, B2B. Not a creative agency vibe, more like a sharp consultancy.
- **No em-dashes anywhere in copy.** Use commas or periods instead.

## Target audience (in priority order)

1. HR and people teams — onboarding videos, policy explainers, culture content
2. Training providers — course modules, lesson videos, produced consistently at scale
3. Legal and professional services — complex topics explained clearly
4. Growing SMEs — general video content needs without in-house production capability

## Service model

- Client sends a brief (script optional, can be written by Deliverable)
- Deliverable produces using AI avatar + voiceover + editing pipeline
- 3-5 day turnaround
- Revisions included
- Pricing: retainer or per-project (starting conversation around 2k USD/month)

---

## Current setup (as of session June 2026)

### Infrastructure
- **Git repo:** `~/Desktop/Deliverable-project` (local)
- **GitHub:** `trbatrung/deliverable-studio` (private repo, user account trbatrung)
- **Vercel:** connected to GitHub repo, auto-deploys on every push to main
- **Commits via:** GitHub Desktop
- **Claude Code:** always launch from `~/Desktop/Deliverable-project` so it has full folder access

### File structure
```
Deliverable-project/
├── index.html          ← the live site file (edit this one)
├── .gitignore
├── deliverable-handoff-brief.md
└── files/
    ├── index.html      ← original backup copy, ignore this
    ├── BRAND.md
    ├── NEXT_STEPS.md
    └── PROJECT_CONTEXT.md   ← this file
```

### index.html — current state
Single-file HTML site, no build step, no framework. Sections in order:
1. Nav — sticky, mobile hamburger below 768px, "Get in touch" scrolls to #contact
2. Hero — headline + two buttons (both wired to scroll to sections)
3. Trust bar — four trust signals
4. Our work — tabbed (HR / Training / Professional Services). HR tab has the YouTube trailer embedded. Training and professional services tabs still show "Demo coming soon" placeholders.
5. Why Deliverable — in-house vs Deliverable comparison table
6. Who it's for — 4 card grid
7. How it works — 4 step process
8. About — studio bio + 3 stat cards
9. Contact — form with fields: name, email, company, message. Submits to Supabase.
10. Footer

### YouTube trailer
- Embedded in the HR and onboarding tab
- Video ID: `lCPMtNWJa7E`
- URL: https://youtu.be/lCPMtNWJa7E

### Technical notes
- Forced light mode via color-scheme meta, CSS root, and dark mode overrides with !important. Never remove these — the brand must never render dark.
- Mobile responsive via hamburger menu below 768px.
- Tabs use vanilla JS switchTab() function.
- All em-dashes replaced with commas per brand rules. Maintain this in any future copy.

---

## Supabase integration — INCOMPLETE, needs finishing

The contact form in index.html submits to Supabase. The JS is wired up but uses placeholder credentials.

### What still needs to be done

**Step 1 — Create the table in Supabase:**
- Go to Supabase project → Table Editor → New table
- Table name: `leads`
- Columns:
  - `id` (uuid, primary key, default: gen_random_uuid())
  - `created_at` (timestamptz, default: now())
  - `name` (text, not null)
  - `email` (text, not null)
  - `company` (text, nullable)
  - `message` (text, not null)
- Enable Row Level Security, then add an INSERT policy allowing anon role to insert

**Step 2 — Get credentials:**
- Supabase project → Settings → API
- Copy: Project URL and anon/public key

**Step 3 — Update index.html:**
Find these two lines at the top of the `<script>` block and replace with real values:
```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

**Step 4 — Commit and push** via GitHub Desktop. Vercel auto-deploys.

---

## Remaining checklist

- [ ] Finish Supabase setup (see above)
- [ ] Produce training demo video (standalone script needed)
- [ ] Produce course module demo video (standalone script needed)
- [ ] Embed training and course module demo videos into the two remaining tabs
- [ ] Secure domain (candidates: deliverable.studio, getdeliverable.com, deliverable.co)
- [ ] Set up domain email (hello@yourdomain) and replace footer placeholder
- [ ] Send cold outreach to first 5 target prospects (AU/UK/SG, HR/training/professional services focus)

---

## Working style notes

- Concise, no-filler communication
- Punchy, direct copy over corporate fluff
- No em-dashes in any copy, anywhere
- Decisions get made fast once options are presented
- This is a test/MVP project — keep things simple and shippable
