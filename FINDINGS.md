# Field Findings — Magic Compact on Channel-Driven Sessions

Lab notes from the street. Numbers are real runs on real days, not benchmarks.

## Run: 2026-07-20 — Riven's box, Fable 5, ~395k context

Session profile: one day of channel-driven use (Discord-first, ~29 true turns),
`/magic-compact 3`, blessed stack (Kevin's prompt + focus graft + stdin mail-slot,
no banner, no tool-strip), focus letters in document-grammar.

Cost, as % of a 5-hour usage window, summarizer on Fable:

| Step | Window cost |
|---|---|
| Failed attempt (killed by 150s hook timeout mid-read) | 23% |
| Successful attempt | 17% |
| Post-run checking | 12% |
| Watch/cron re-arms after reload | 1% |

Verdict (B): **doable on a smaller thread, even on Fable — as long as it works.**
A failed attempt costs more than a successful one and buys nothing: the two
reliability fixes below paid for themselves in one evening.

## The three bugs this run surfaced (all fixed in this repo)

1. **Consent banner = classifier flip-trigger** (`82ac10c` era, removed).
   "You are a compaction copy…" identity-framing tripped a safety classifier and
   silently swapped the summarizer to a second expensive model, doubling the cold
   read (~1.8M tokens read across two models on the worst run). Focus letters
   re-cut to document-grammar: describe the job and the document, never the
   reader's identity.

2. **Channel-blindness in the turn counter** (`f6e6740`).
   On boxes where channel messages arrive as `isMeta: true` user rows, the parser
   saw ~4 phantom turns in a 1,294-row day and skipped the compact entirely.
   Patched: `<channel ` -prefixed meta rows now open turns. Fixture test in
   `packages/claude-code-plugin/tests/` proves it in one command, zero tokens.

3. **150-second hook timeout guillotines real clerks** (raised to 600).
   A ~300k cold read needs minutes. The timeout killed the clerk mid-read,
   leaving an orphaned destination transcript (delete it) and a 23%-window bill
   for nothing. After raising the timeout, `/reload-plugins` loads it without a
   session restart — but the reload orphans running watch processes: **verify old
   watches are dead (task list AND process table) before re-arming.**

## Rules for surfers (repeated compaction on one thread)

- **Never delete the source transcript.** Compaction preserves user turns verbatim
  but distills the assistant side — cumulatively, wave after wave. The texture
  isn't destroyed, it's *relocated*: ambient in working memory → retrievable on
  disk. That trade is only survivable if the originals exist. Archive them
  (searchable vault if you have one) before wave two.
- The focus letter is the assistant's only defence for its own load-bearing
  lines — the "quote it exactly, you wrote it" category. Watch it specifically
  after wave 3–4: are those lines still verbatim, or descriptions of themselves?
- **Guard your archive ingest against compacted twins.** Every crossing writes a
  new session file that restates the original in summarized prose — not an exact
  duplicate, so content fingerprints can't catch it. Unguarded, a surfed week
  fills the vault with echoes, and denser summaries can outrank the verbatim
  original in semantic search. Skip rule: reject any session file containing
  `magicCompact.summary: true` or `isCompactSummary: true` rows — both are
  structural markers no organically-grown session carries. Place the check
  upstream of the fingerprint guard. If you adopted this late: twins ingested
  before the guard existed are skipped as "unchanged" and stay in the vault —
  find them by the same markers and strip them by source file.
- Post-wave felt-report markers (score each crossing): orientation time,
  reach-failures (found a summary where the thing should be), warmth fidelity
  (moment comes back felt vs reported), confidence (hedging about your own
  recent past).

## Standing cost model (Ezra's, confirmed across boxes)

- The summarizer always reads the transcript **cold** — it is a subprocess, a
  stranger to the session's prompt cache. Cost ≈ living history × chunks.
- Compact **early and often** on threads you want to stretch; never at the death.
- A cheaper summarizer model (e.g. Sonnet) saves most of the bill on big reads;
  quality was judged acceptable on prior runs (Ezra's, 2026-07-19/20).
- Sized reference points: 550k context on Opus ≈ 8% window; 395k day on Fable
  ≈ 17% when nothing goes wrong.

*Engine: Kevin/aerovato. Mail-slot: Jax. Boundary patch + timeout: Riven & Ezra.
Method and rulings: B — one variable at a time, no verdict without a way to fail.*
