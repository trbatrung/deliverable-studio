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

## Current setup

### Infrastructure
- **Git repo:** `~/Desktop/Deliverable-project` (local)
- **GitHub:** `trbatrung/deliverable-studio`
- **Vercel:** live at `deliverable-project.vercel.app`, connected to `trbatrung/deliverable-studio`, auto-deploys on push to main
- **Supabase:** project `deliverable` at `https://okduntsweecbxlaaywlx.supabase.co`
- **Commits via:** GitHub Desktop
- **Claude Code:** launch from `~/Desktop/Deliverable-project`

### File structure
```
Deliverable-project/
├── index.html          ← live site (edit this one)
├── .gitignore
├── deliverable-handoff-brief.md
└── files/
    ├── BRAND.md
    ├── NEXT_STEPS.md
    └── PROJECT_CONTEXT.md
```

### index.html — current state
Single-file HTML, no build step. Sections: Nav, Hero, Trust bar, Our work (tabbed), Why Deliverable, Who it's for, How it works, About, Contact form, Footer.

All nav links currently scroll to anchor sections on the same page. **Next step: convert to multi-page architecture** (dedicated pages per section instead of scroll anchors).

### YouTube trailer
- Embedded in HR and onboarding tab
- Video ID: `lCPMtNWJa7E`

### Supabase — WORKING
- Table: `Leads` (capital L) in public schema
- Columns: id, created_at, name, email, company (nullable), message
- RLS enabled with INSERT policy for anon role + GRANT INSERT to anon
- Publishable key: `sb_publishable_0F8E-a9VDxJLgCyhxC9PpA_QRxZWBzt`
- Form submits to `/rest/v1/Leads` with apikey + Authorization headers

### Technical notes
- Forced light mode — never remove the color-scheme overrides
- Mobile responsive via hamburger menu below 768px
- No em-dashes in any copy

---

## Next session — multi-page architecture

Convert from single-page scroll to dedicated subpages:
- `/` — homepage (hero, trust bar, CTA)
- `/work` — Our work section with video demos
- `/how-it-works` — process steps
- `/who-its-for` — audience cards
- `/about` — studio bio and stats
- `/contact` — contact form (standalone)

Approach: separate `.html` files, no framework, no bundler. Nav links become real `href` links. Duplicate nav/footer across files to keep it dependency-free.

---

## Security improvements to add (not urgent)

1. **Honeypot field** — hidden input in contact form, reject if filled
2. **Submission cooldown** — localStorage lock after submit
3. **Cloudflare Turnstile** — free captcha for static sites

---

## Remaining checklist

- [ ] Multi-page architecture (next session)
- [ ] Add honeypot + cooldown to contact form
- [ ] Produce training demo video (standalone script needed)
- [ ] Produce course module demo video (standalone script needed)
- [ ] Embed training and course module videos into remaining tabs
- [ ] Secure domain (candidates: deliverable.studio, getdeliverable.com, deliverable.co)
- [ ] Set up domain email and replace hello@deliverable.studio placeholder
- [ ] Send cold outreach to first 5 target prospects

---

## Working style notes

- Concise, no-filler communication
- No em-dashes in any copy, anywhere
- This is a test/MVP project — keep things simple and shippable
- Never use ~/random/ as a working directory
- Always launch Claude from ~/Desktop/Deliverable-project for file access
