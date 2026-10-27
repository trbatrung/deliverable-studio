# Concept demo: Course module (Brightline Training, Module 3 of 8)

Text-led motion explainer, 57.5 s, 1280x720, 30 fps, silent. Built for sound-off viewing.
Source: `media/src/scenes/demo-course-module.html` (one master timeline driven by `window.seek(t)`).
Render: `cd media/src && npm install && node render.mjs demo-course-module`. Outputs `media/demo-course-module.{mp4,webm,webp}`.

Persistent elements from 4.5 s to 53.5 s: "Brightline Training" top left, "Module 3 of 8" pill top right, an 8-segment course progress bar along the bottom (segments 1 and 2 full, segment 3 fills across the lesson).

| # | Start | Scene | Viewer takeaway | On-screen text | Visual action |
|---|---|---|---|---|---|
| a | 0.0 s | Title slate (poster frame) | This is a course module | "Concept demo" pill. "Module 3 of 8". "Giving feedback that lands". "Brightline Training, Leadership essentials" | Static composition, fades to cream at 4.1 s |
| b | 4.5 s | Learning objective | What you will be able to do | Eyebrow LEARNING OBJECTIVE. "By the end of this module, you can give feedback that is specific, fair and easy to act on." (last phrase amber) | Word-by-word entrance |
| c | 12.0 s | Framework | The three-step structure | Eyebrow THE FRAMEWORK. "Build feedback in three steps". Cards: 1 Observation "Describe what you saw or heard, not what you assume." 2 Impact "Explain the effect it had on the work, the team or you." 3 Request "Ask for one specific change, and agree on it together." | Cards land at 13.6, 18.2 and 22.8 s |
| d | 28.0 s | Worked example | What the rewrite looks like | Eyebrow WORKED EXAMPLE. "Same message, rewritten". Instead of: "You're always late with your reports." Try: "The last two reports arrived after Friday's deadline, so the client update slipped. Can we agree on Thursday drafts?" Pills: 1 Observation, 2 Impact, 3 Request | Weak line struck through at 30.5 s, strong line enters at 31.4 s, pills land from 32.8 s |
| e | 40.0 s | Recap | Three checks to remember | Eyebrow RECAP. "Three checks before you give feedback". "Describe what you saw, not what you assumed" / "Name the impact on the work or the team" / "Ask for one clear change you both agree on" | Ticks land at 42, 43.8 and 45.6 s |
| f | 49.5 s | Next module | The course continues | Eyebrow MODULE 3 COMPLETE. "Next: Module 4 of 8". "Handling pushback with care" | Pill and title enter, progress bar segment 3 completes |
| g | 53.5 s | Deliverable slate | Who made it | "Deliverable" wordmark. "Concept demo, built to show what's possible" | Holds to 57.5 s |

Revision notes: change any line of copy in the scene file and re-render; nothing else moves. Voiceover and music can be layered onto the mp4 later without re-rendering. Reading holds follow the words/3 + 1 s rule except the last recap tick and the "Try" line, which are each about 0.1 s short.
