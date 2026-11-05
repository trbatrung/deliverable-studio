# Vietnam legal review and offshore company options

5 November 2026. Internal, for Ethan and his accountant. Not legal advice: it is built from secondary summaries of the laws (sources at the end), and every point marked "confirm" should be checked with a Vietnamese accountant or lawyer before acting.

Site reviewed: live main (`69c58db`), pages `privacy.html`, `terms.html`, `contact.html`, the Supabase form in `script.js`, and the outreach plan in `files/PITCH_PREP.md`.

## The short answer

The site is close. It sets no cookies, makes no invented claims, labels every example, has a privacy notice and terms, and has no online ordering. Four things fall short of Vietnamese law as it stands in November 2026:

1. **Form consent is implied, and Vietnam no longer accepts that.** (High)
2. **Form data goes to servers abroad without the transfer filing.** No size exemption covers this one. (Medium)
3. **There is no registered business behind "Deliverable"** (confirm), so the site names no legal entity or tax code, and income above about USD 19,000 a year becomes taxable. (Medium, grows with revenue)
4. **The privacy contact address bounces**, so data requests cannot reach you. (High once outreach starts; already parked as a final launch step)

An offshore company (US LLC, Singapore, UK) does not remove any of these. While you live in Vietnam you are a Vietnamese tax resident and the person processing the data, so Vietnamese law follows you whatever the company's flag. The cheapest fix for item 3 is to register a household business in HCMC. Item 2 is a filing you or the accountant prepare whatever the business form.

Cross-checked on 5 Nov 2026 with the `vn-law-check` skill (see the last section), which corrected the exemption point in item 2 and the reply deadlines in the privacy notice.

## Laws that apply

| Law | In force | Why it matters here |
|---|---|---|
| Personal Data Protection Law 91/2025/QH15, Decree 356/2025/ND-CP | 1 Jan 2026 | Replaces Decree 13/2023. Covers the enquiry form and the cold outreach list. |
| Decree 330/2026/ND-CP (data penalties) | 19 Aug 2026 | Fines up to VND 3 billion for organisations, half for individuals. |
| E-commerce Law 122/2025/QH15, Decree 248/2026/ND-CP | 1 Jul 2026 | Website notification now attaches to sites with online ordering. |
| Revised Personal Income Tax Law, VAT changes, end of presumptive tax | 2026 | Household and individual business revenue up to VND 500 million a year is tax free; above that, declare. |
| Investment Law 143/2025/QH15, Decree 103/2026/ND-CP | 1 Mar / 3 Apr 2026 | Rules for a Vietnamese resident owning a company abroad. |

## Site audit

### 1. Enquiry form consent (High)

**Status 5 Nov 2026:** fixed in code along with the reply deadlines in item 3. There is no Supabase project yet (the old one no longer resolves), so the live form cannot save anything today. Supabase is the last launch step: `files/supabase-setup.sql` creates the table with the consent columns in one go.

`privacy.html` says "sending the form means you agree to your details being used as described here." Under Law 91 and Decree 356, consent must be express and verifiable; silence or inaction is not consent, pre-ticked boxes are banned, and the business must keep a record of when and what was agreed.

Fix:
- An unticked, required checkbox above the submit button: "I agree to Deliverable using these details to reply to my enquiry, as described in the privacy notice."
- Save `consent_at` (timestamp) and `notice_version` (e.g. `2026-10-30`) with each row in the Supabase `Leads` table.
- Change the privacy sentence to describe the checkbox and how to withdraw consent.

Both forms need it: the homepage (`index.html`, the form card under the FAQ) and `contact.html`. Treating silence as consent is fined VND 25 to 35 million for an individual or household business (Decree 330/2026, Art. 43(2)).

This also holds up under UK, Australian and Singapore rules, so it costs nothing with buyers. The CSP hash for the inline `onsubmit` handler needs recomputing if that string changes.

### 2. Data stored abroad (Medium)

Supabase and Vercel store form data outside Vietnam. Under Law 91, storing data on offshore servers or clouds counts as a cross-border transfer, and the business must file a transfer impact assessment with the Ministry of Public Security (A05) within 60 days of the transfer starting.

No relief for this one. Article 38(3) of Law 91 exempts household businesses and micro-enterprises from the processing impact assessment (Art. 21), its updates (Art. 22) and appointing a data protection officer (Art. 33(2)), and Article 38(2) gives small enterprises five years on the same items. The cross-border dossier sits in Article 20(2), which is not on that list. Article 20(6) exempts only state bodies, an organisation's own staff data on cloud services, and people moving their own data; customer or enquiry data on a foreign cloud is not exempt. (An earlier draft of this review said the opposite, based on a secondary summary.)

Fine band if missed: VND 15 to 25 million for an individual or household business, 30 to 50 million for an organisation (Decree 330/2026, Art. 56). For a site this size it is paperwork, not an emergency: the dossier is a Form 09 assessment, the Supabase and Vercel data processing terms, and a short data protection procedure, filed with the Ministry of Public Security (A05). Ask the accountant or a lawyer to prepare it.

Also still open from the launch audit: confirm the Supabase project's region.

### 3. Privacy notice contents (Medium)

The notice covers who is responsible, what is collected, purposes, recipients (Supabase, Vercel), retention and rights. Gaps against Law 91:
- **Reply deadlines are too long.** The notice promises a reply within 30 days. Decree 356, Article 5 sets: acknowledge any request within 2 working days; show or correct data within 10 days; withdraw consent or restrict processing within 15 days; delete within 20 days (each extendable once, with a reason). Promise the shorter ones.
- **Rights list** should also name restricting processing and objecting to it.
- **Right to withdraw consent**, and what happens if you do (no reply possible).
- **Vietnam's authority** is missing from the complaints line, which names only the ICO, OAIC and PDPC. One sentence naming the Ministry of Public Security's data protection department (A05) covers it.
- **Language.** One secondary source says notices must be in Vietnamese. Confirm; if true, a Vietnamese copy at `/privacy-vi`, linked only from the English notice, keeps the site English-first and matches your rule of keeping Vietnamese legal matter low-key.
- **Legal name** once registered (see item 5).

### 4. Privacy contact bounces (High before outreach)

`hello@deliverable.studio` has no MX record. Law 91 requires that people can exercise their rights, and the notice promises a reply within 30 days. Already listed as a final launch step in `files/LAUNCH_AUDIT.md`; it must work before the first cold email.

### 5. Business identity on the site (Medium)

The footer shows the email and city only, and the privacy notice names you personally, which is accurate while there is no entity. Once a household business or company exists, add its registered name (and tax code on invoices; the footer can carry the name alone).

E-commerce: under Decree 248, the Ministry of Industry and Trade notification applies to direct-sales sites with an online ordering function. Deliverable sells by written quote and invoice, with no cart or checkout, so no notification is needed (moderate confidence, confirm). If you ever add online checkout or plan sign-up, notification becomes required before launch.

### 6. Cold outreach (Low to medium)

Law 91 treats direct marketing as needing consent, and you would be processing prospects' names and work emails from Vietnam. Enforcement against a one-person studio emailing foreign businesses is unlikely, but the exposure is real. The existing plan already limits it: work emails only, a working opt-out, a do-not-contact list, deleting non-responders. Add: keep the list small, record where each address came from, delete it within 12 months, and never buy a list (buying or selling personal data is banned outright, with fines up to ten times the proceeds).

### 7. What already passes

- No cookies, analytics or tracking scripts.
- No invented claims or results; every example is labelled a concept piece (fits advertising rules on truthful claims).
- Terms: clear scope, payment, ownership, confidentiality, liability capped with a consumer-law carve-out, Vietnamese law as the default governing law.
- Retention periods stated (12 months for enquiries, 90 days for project material).
- No sensitive data collected, and the form asks people not to send confidential records.

### 8. Not site copy, but legal

- **Sound effect pack licence** is still unconfirmed (from the sound notes). Confirm the licence covers commercial use in client and promotional videos before outreach.
- **Security branch** (anon insert policy, rate limit, MFA) is still parked. Law 91 requires reasonable security measures, so it belongs in the same pass.

## Business setup and tax (for the accountant)

The site question and the company question meet here: most of the gaps above shrink once there is a registered business.

**Revenue threshold.** From 2026, business revenue up to VND 500 million a year (about USD 19,000 at roughly 26,000 VND per USD) is tax free; above it you declare VAT and PIT, with the 500 million deducted under one option. One Standard client for a year (USD 18,000) is right at the line. Sources also conflict on the exact effective date and one mentions VND 1 billion, so confirm.

**Service exports.** Work for foreign clients consumed outside Vietnam may qualify for export treatment, but only with a contract, invoice and bank evidence that line up. The written quote plus Wise or Payoneer invoice already creates most of that trail.

**Simplest compliant setup: register a household business (hộ kinh doanh) in HCMC.** Cheap and quick, gives "Deliverable" a legal trading name and a tax code, removes the processing impact assessment and data protection officer duties (but not the cross-border filing), and lets invoices name a business. A single-member LLC in Vietnam (công ty TNHH MTV) is the next step up if a client wants a company or you take on staff.

## Offshore company options

### What a foreign company does not change

- **You stay a Vietnamese tax resident** (183 days or a home here), taxed on worldwide income. Dividends from a foreign company are taxed at 5% when received; salary at progressive rates. Vietnam has no US-style rules taxing undistributed profits (unconfirmed, per a secondary source), but a company whose only director and worker sits in HCMC is at risk of being treated as doing business in Vietnam. There is no comprehensive US–Vietnam tax treaty to fall back on.
- **Vietnamese data law still applies**, because you collect and process the data from Vietnam.
- **Owning it is an outward investment.** Under Decree 103/2026, an overseas project under VND 7 billion outside restricted sectors (banking, insurance, securities, media, real estate) no longer needs an outward investment certificate, but you still register the foreign exchange transaction with the State Bank, and banks reportedly still ask for the certificate in practice. Many Vietnamese founders skip this; it is a gap, not a safe default.

### Options compared

| | Vietnam household business | Vietnam single-member LLC | US LLC (Wyoming or New Mexico) | Singapore Pte Ltd | UK Ltd |
|---|---|---|---|---|---|
| Setup | Very low, days | Low, 1 to 2 weeks | About USD 300 to 500 (Atlas, Doola, Firstbase or direct) | About SGD 2,500 to 6,000 in year one | About GBP 100 plus an address service |
| Yearly cost | Tax filings | Accounting, audit-free at small size | State fee and registered agent about USD 100 to 300, plus Form 5472 and pro forma 1120 every year (USD 25,000 penalty if missed) | Nominee resident director SGD 1,000 to 5,000, corporate secretary, accounts | Address service, accounts, confirmation statement, director ID verification |
| Card payments (Stripe) | No | No | Yes, but Vietnam-based founders get extra scrutiny; open the US bank account first | Yes | Yes |
| Credibility with AU/UK/SG buyers | Neutral, invoice via Wise | Neutral | Neutral to slight plus | Strong for SG buyers | Strong for UK buyers |
| Vietnam tax and data duties | Covered | Covered | All still apply, plus outward investment registration | Same | Same, and a UK company managed from Vietnam can raise residence questions |
| Fit now | Best | When a client needs a company | Only if you need card payments or subscriptions | Only if SG becomes the main market | Only if UK becomes the main market |

Estonia e-Residency (OÜ) is often suggested too; it adds an EU entity with no market you are targeting and the same Vietnam residency issues, so it is not listed.

### Recommendation

1. **Now:** register a household business in HCMC, then fix the site items above (consent checkbox, privacy notice lines, mailbox). That makes the site and invoices legally clean in Vietnam at the lowest cost.
2. **Keep invoicing by bank transfer through Wise or Payoneer.** It already works for B2B and needs no foreign entity.
3. **Revisit a foreign company only when a concrete need appears:** a buyer that insists on paying a local company, wanting card payments or self-serve subscriptions, or revenue large enough that an accountant can show a real saving after the dual compliance cost. If that happens, a US LLC is the cheap route for payments and a Singapore Pte Ltd the credible one for SG buyers. Either way, do the outward investment and foreign exchange registration with the accountant rather than skipping it.

## Questions for the accountant

1. Should I register a household business, or can I declare foreign client income as an individual? Which is cleaner for invoicing in USD, AUD, GBP and SGD?
2. Does my service income qualify for export treatment, and what records do you want for each project?
3. Which revenue threshold and effective date apply to my 2026 return (VND 500 million or the VND 1 billion some sources cite)?
4. Can you prepare the cross-border transfer dossier (Law 91, Art. 20(2)) for enquiry data held on Supabase and Vercel, and is it worth doing now at this volume?
5. Does my privacy notice need a Vietnamese version?
6. If I later form a US LLC or Singapore company, what are the outward investment, foreign exchange and tax filings, and when does it start to pay off?

## Cross-check with vn-law-check (5 Nov 2026)

[`vn-law-check`](https://github.com/mhfed/vn-law-check) (commit `3a8617d`, v1.5.3, law data checked to 3 Nov 2026) is installed as a personal Claude skill in `~/.claude/skills/vn-law-check`. Ask "audit pháp lý website này theo luật Việt Nam" or "Vietnam legal compliance audit" in any project to run it. It is one developer's checklist, not a lawyer's, and it marks unverified points "CHƯA XÁC MINH".

**Scan.** On the repo it reports level 2 (selling online), but from false hits: `actions/checkout` in the GitHub workflow, the word "signin" inside video scenes, and the CI workflow's AI call, none of which ship. On the live site it reports **level 1, light collection**: one form, no tracking, no selling, no login, foreign host. That applies checklist 01, sections A to D.

| Level | Item | Finding | Basis | Fix |
|---|---|---|---|---|
| 🔴 | B. Consent | Both forms rely on "sending the form means you agree" | Law 91 Art. 9(4)(d); Decree 356 Art. 6 | Unticked checkbox, store time and notice version |
| 🔴 | A. Notice | Reply within 30 days is longer than allowed | Decree 356 Art. 5 | 2 working days to acknowledge; 10, 15, 20 days by request type |
| 🟡 | A. Notice | Rights list lacks restricting and objecting; no withdrawal route | Law 91 Art. 4, Art. 10(2) | Add both lines |
| 🟡 | A. Notice | Rights channel `hello@deliverable.studio` bounces | Law 91 Art. 4 | Set up the mailbox (parked launch step) |
| 🟡 | D. Cross-border | Enquiries stored on Supabase and Vercel abroad, no dossier | Law 91 Art. 20(2), not exempt under Art. 38(3) | Ask the accountant or a lawyer |
| 🟢 | C. Cookies | No cookies, analytics or tracking | | |
| 🟢 | F. Prohibited acts | No data bought or sold, collection limited to the enquiry | Law 91 Art. 7 | Keep cold outreach lists small and never buy one |
| ⚪ | E. Internal duties | Impact assessment and data officer | Exempt once a household business (Art. 38(3)) | |

**Not applicable:** e-commerce notification and consumer protection (no online ordering or checkout), cybersecurity (no large-scale data), AI transparency (no chatbot or AI feature on the site).

**Where it changed this review:** it corrected the cross-border exemption (item 2) and added the reply deadlines and the fine bands. Everything else matched.

## Sources

- Personal data: [Vietnam Briefing on Decree 356](https://www.vietnam-briefing.com/news/vietnam-personal-data-protection-regulation-decree-356.html/), [EY legal alert on Decree 356](https://www.ey.com/en_vn/technical/tax/tax-and-law-updates/legal-alert-march-2026-decree-no-356-2025-nd-cp-providing-detailed-guidance-for-implementation-of-personal-data-protection-law), [Be Vietnam Wise PDPL guide](https://bewiseapps.com/doing-business-in-vietnam/intellectual-property-data-and-technology/personal-data-protection), [LuatVietnam on the PDP Law](https://english.luatvietnam.vn/legal-updates/the-latest-law-on-personal-data-protection-and-the-guiding-documents-892-106778-article.html)
- E-commerce: [Law on E-commerce 122/2025](https://english.luatvietnam.vn/law-on-e-commerce-no-122-2025-qh15-dated-december-10-2025-of-the-national-assembly-423356-doc1.html), [Decree 248/2026 (Lexology)](https://www.lexology.com/library/detail.aspx?g=113328d4-030c-416c-9656-ace21eef2865), [Decree 248 in the Official Gazette](https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-248-2026-nd-cp-469983/66872.htm), [Tenzen on website notification under Decree 248](https://tenzen.vn/huong-dan-thong-bao-website-bo-cong-thuong-theo-nghi-dinh-248-2026/)
- Tax: [Viet An Law on 2026 household business tax](https://vietanlaw.com/new-2026-rules-for-household-enterprises-tax-in-vietnam/), [Vietnam Briefing on the PIT law](https://www.vietnam-briefing.com/news/vietnams-personal-income-tax-law.html/), [PwC Vietnam individual tax summary](https://taxsummaries.pwc.com/vietnam/individual/taxes-on-personal-income)
- Outward investment: [Law on Investment 143/2025](https://english.luatvietnam.vn/law-on-investment-no-143-2025-qh15-dated-december-11-2025-of-the-national-assembly-422585-doc1.html), [Decree 103/2026 summary](https://kinhtemoitruong.vn/nghi-dinh-1032026nd-cp-quy-dinh-vo-tien-khoang-hau-ve-thu-tuc-dang-ky-dau-tu-ra-nuoc-ngoai-111065.html), [Tri Minh Law on the certificate exemption](https://luattriminh.vn/co-phai-nha-dau-tu-khong-can-phai-xin-giay-chung-nhan-dang-ky-dau-tu-ra-nuoc-ngoai-khong.html)
- Offshore: [Mercury, Wise and Relay for non-resident LLCs](https://www.globalsolo.global/blog/mercury-vs-wise-vs-relay-best-bank-2026), [Stripe rejection risk for non-resident LLCs](https://usllcglobal.com/guides/stripe-rejection-non-resident-llc), [Singapore nominee director costs](https://vivos.com.sg/blog/nominee-director-singapore-costs-risks-safeguards/), [Singapore formation cost](https://growacross.com/insights/singapore-company-formation-cost)
