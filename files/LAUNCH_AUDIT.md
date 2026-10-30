# Launch audit: Deliverable site

2026-10-30. Run with the launch-audit skill. This is a practical checklist, not legal advice.

**Context:** the business is in Ho Chi Minh City and the buyers are in AU, UK and SG, so this assumes the strictest case: UK GDPR for anyone who fills in the form. Vietnam's own personal-data rules also apply to a Vietnam-based business. Audited the repo at `e3db53a` (same as live main) and the live site at `deliverable-project.vercel.app`.

## Summary
PASS 8 · FAIL 4 · MISSING 3 · N/A 5 · UNVERIFIED 0 (plus 3 open questions below)

**Risk read:** the site itself is clean: no trackers, no cookies, no claims, honest labels. The gaps are around the enquiry form and contact details. The listed email can't receive mail, and there's no privacy notice for the personal data the form collects.

## Status, 2026-10-30
- Done: `/privacy` and `/terms` pages, linked from every footer, from the line under the form and from the sitemap (#1, #2, #8, #10). The focus ring now uses `--amber-ink` (#16). The cold email has a sender footer and an opt-out (#19).
- **Final launch steps, parked by Ethan until the end:** secure the domain and the `hello@deliverable.studio` mailbox (#18). The privacy and terms pages both point to that address, so it must work before outreach starts. Also confirm the legal trading name and the Supabase region, then review both pages.

## Fix first (as found)
1. **The contact email can't receive mail (#18).** `hello@deliverable.studio` is in every footer, but the domain has no MX record, so mail to it bounces. It's also the only way to ask for data deletion. Fix: secure the domain and set up the mailbox, or swap in an address that works today.
2. **No privacy notice (#1, #8, #10).** The form collects name, email, company and a message. It stores them in Supabase (`script.js:173`) on a site hosted by Vercel. Fix: one short `/privacy` page, linked from every footer and from the line under the form. It should cover:
   - who you are (your name, trading as Deliverable, Ho Chi Minh City)
   - what you collect and why (to reply to the enquiry)
   - where it's stored (Supabase, Vercel)
   - how long you keep it
   - how to see or delete it (by email)
3. **Cold email has no opt-out (#19).** The template in `files/PITCH_PREP.md` has no sender details and no way to say no. The AU, UK and SG rules on commercial email all expect clear sender identification and a working way to opt out. Fix: add a short footer: your name, Deliverable, a line saying "Not relevant? Reply 'no' and I won't write again", and keep a do-not-contact list.
4. **The focus ring is too faint (#16).** The keyboard focus outline uses amber `#E8940A` on the `#F8F7F3` canvas, which is 2.26:1. Focus indicators need 3:1 (`style.css:44`, `:163`, `:297`). Fix: use `--amber-ink` (`#8A5606`, 5.74:1) for outlines and keep amber for fills.
5. **No terms (#2).** There's no checkout, so a terms page is low priority. The scope, revisions and payment terms belong in the written quote. Add a page only if you want one place to link to from quotes.

## Needs your check
- **How do you hear about a new lead?** Enquiries go straight into the Supabase `Leads` table, and neither main nor the security branch sends a notification. Check: open the table and see whether anything is waiting. If you can only find leads by looking, add an email alert. A lead that sits for three days is lost.
- **Legal name.** Is Deliverable a registered business, or are you trading under your own name? The privacy notice and invoices need the real answer.
- **Supabase region.** Check: Supabase dashboard → Project Settings → General. Data held outside the UK needs one line in the privacy notice.

## Full table
| # | Item | Status | Evidence | Note |
| --- | --- | --- | --- | --- |
| 1 | Privacy policy | MISSING | No page; footer `index.html:272-284` has no link | The scanner's "privacy" hits are the form note, not a policy |
| 2 | Terms | MISSING | No page | Low priority, no checkout |
| 3 | Refund policy | N/A | Nothing sold on site | Belongs in the quote |
| 4 | Cookie policy | N/A | Live: `document.cookie` empty, no localStorage | No cookies set |
| 5 | Consent banner | N/A | Live: only first-party requests; one script, `script.js` | No trackers to gate |
| 6 | Pre-ticked boxes | PASS | Scan: none; form has no checkboxes | |
| 7 | Form fields have a reason | PASS | `index.html:246-259`: name, email, company (optional), message | Minimal |
| 8 | Third parties named | FAIL | Supabase (`script.js:6,173`), Vercel hosting | No policy names them |
| 9 | Children | N/A | B2B service for companies | |
| 10 | Data deletion path | MISSING | No stated route; the listed email bounces | |
| 11 | Dark patterns | PASS | Scan: none; copy read in full | |
| 12 | Hidden fees | N/A | No prices or checkout | |
| 13 | Fake reviews | PASS | No testimonials; examples labelled concept pieces | |
| 14 | Unsupported claims | PASS | Scan: none; homepage and About read | |
| 15 | Alt text | PASS | Scan: no images missing alt | |
| 16 | Contrast | FAIL | Body `#6D6E67` on canvas 4.81:1, on paper 5.10:1 (pass); focus ring amber 2.26:1 (fail) | Amber logo text is exempt as a logotype |
| 17 | Keyboard | PASS | `:focus-visible` at `style.css:44`; loops take Enter/Space (`script.js:95`) | Ring colour is #16 |
| 18 | Business details | FAIL | Footer: email and city; `deliverable.studio` has no MX record | Legal name unverified |
| 19 | Unsubscribe | FAIL | No marketing email yet; cold template lacks opt-out | Applies once outreach starts |
| 20 | Licensed assets | PASS | Geist self-hosted under SIL OFL (`fonts/fonts.css:1`); Inter (OFL) in renders; no stock or music in `media/src/scenes` | |

## Paywall section
N/A. Nothing is sold or subscribed on the site. Payment happens by invoice after a written quote. Stripe doesn't support Vietnamese businesses, so use Wise or Payoneer, per `personal-brand/offers.md`.
