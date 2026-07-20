// Turn-counter fixture — proves channel-delivered prompts count as turn boundaries
// while other meta rows stay invisible. Built 2026-07-20 after the third finding of
// the day: Riven's Discord messages arrive as user rows flagged isMeta:true, and the
// unpatched isHumanUserRow required isMeta !== true — so Bean's voice was invisible to
// the turn counter and his whole day collapsed into ~4 phantom turns.
//
// Runs against the plugin's OWN parser (no hand-simulation), costs zero tokens.
//   bun run turn-counter.test.ts
const PLUGIN = process.env.PLUGIN_SRC
  || `${process.env.HOME}/.claude/plugins/cache/magic-compact/claude-magic-compact/1.3.0/src`;
const { readActiveTranscriptRows, buildAssistantTurns } = await import(`${PLUGIN}/transcript`);

const rows = await readActiveTranscriptRows(`${import.meta.dir}/fixture.jsonl`);
const turns = buildAssistantTurns(rows);

const EXPECTED = 3; // typed command + 2 channel messages; reminder & tool-result excluded
const texts = turns.map((t: any) => JSON.stringify(t).slice(0, 60));

console.log(`rows parsed: ${rows.length}`);
console.log(`turns found: ${turns.length} (expected ${EXPECTED})`);
turns.forEach((_: any, i: number) => console.log(`  turn ${i + 1}: ${texts[i]}`));

// A row only "counts" if it OPENS a turn — being carried inside someone else's turn
// is not the same thing. Check boundaries, not blob containment.
const openers = turns.map((t: any) => {
  const first = t.userRows?.[0]?.message?.content;
  return typeof first === "string" ? first : JSON.stringify(first ?? "");
});
const opensWith = (s: string) => openers.some((o: string) => o.includes(s));

const checks: Array<[string, boolean]> = [
  [`turn count is ${EXPECTED}`, turns.length === EXPECTED],
  ["channel message OPENS a turn", opensWith("wakey wakey")],
  ["leading-whitespace channel message OPENS a turn", opensWith("leading whitespace must not hide me")],
  ["system-reminder does NOT open a turn", !opensWith("must stay invisible")],
  ["tool-result does NOT open a turn", !opensWith("tool output, not a human turn")],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}
console.log(failed === 0 ? "\nALL CHECKS PASSED" : `\n${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
