# Concept demo: Professional-services explainer (Harwood & Co, e-signature)

Text-led motion explainer, 52 s, 1280x720, 30 fps, silent. Built for sound-off viewing. All timings shown in the video are labelled illustrative.
Source: `media/src/scenes/demo-explainer.html` (one master timeline driven by `window.seek(t)`).
Render: `cd media/src && npm install && node render.mjs demo-explainer`. Outputs `media/demo-explainer.{mp4,webm,webp}`.

Persistent elements from 4.5 s to 45 s: "H" monogram and "Harwood & Co" top left, "Client explainer" pill top right, a hairline progress track along the bottom with an amber dot travelling across it and stop markers that light at each section.

| # | Start | Scene | Viewer takeaway | On-screen text | Visual action |
|---|---|---|---|---|---|
| a | 0.0 s | Hook (poster frame) | The question this answers | "Concept demo" pill. Eyebrow HARWOOD & CO, CLIENT EXPLAINER. "What changes when your contract moves to e-signature?" ("e-signature?" amber) | Static composition, short amber rule beneath |
| b | 4.5 s | Before and after | Days become hours | Eyebrow BEFORE AND AFTER. "Same contract, two routes" (Illustrative timings). Before, paper route: Print and sign, Day 1. Courier to the other party, Day 3. Countersign and send back, Day 5. Scan and share copies, Day 6. File the original, Day 7. Total about 7 days. After, e-signature route: Send for signature, 9:00. Both parties sign online, 10:30. Signed copy filed automatically, 11:45. Total about 3 hours | Left rows land 6.0 to 9.2 s with a slow travelling dot; right rows land 11.0 to 11.9 s with a fast one |
| c | 16.5 s | Your part | Three things that do not change | Eyebrow YOUR PART. "Three things you still need to do". 1 "Confirm who can sign" / "Each signer must be authorised for their party." 2 "Check the document type" / "Some deeds still need a witness present." 3 "Keep the audit trail" / "Store the signing certificate with the contract." | Numbered rows land at 17.7, 21.2 and 24.7 s |
| d | 30.0 s | Common mistake | The one thing to avoid | Eyebrow COMMON MISTAKE. "Sending the draft, not the final version." The fix: "Lock the final PDF and check it against the agreed draft before you send." | Amber-band card, fix pill enters at 32.1 s |
| e | 39.0 s | Summary | The point in one line | Eyebrow IN SHORT. "E-signature speeds up signing. The checks before you send stay the same." (last line amber) | Word-by-word entrance |
| f | 45.0 s | End card | Where to go next | "H" monogram. "Harwood & Co". "Questions? Talk to your engagement lead." | Static end card |
| g | 48.5 s | Deliverable slate | Who made it | "Deliverable" wordmark. "Concept demo, built to show what's possible" | Holds to 52 s |

Revision notes: firm name, steps and timings are placeholders for a real client's process; swap the copy in the scene file and re-render. The third "your part" row holds about 0.3 s under the words/3 + 1 s reading rule.
