import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_FOCUS_PATH = join(homedir(), ".claude", "magic-compact-focus.md");
const FENCE_BREAKING_SEQUENCES = ["</focus>", "</system>"];

export type FocusNote = {
  note: string | null;
  status: string;
};

/**
 * Loads the user's compaction focus note, if one exists. The note names what
 * must survive summarization; per-user instructions live outside the repo so
 * each installation carries its own.
 *
 * A missing or empty note is not an error (the stock prompt is used), but its
 * absence is reported via `status` so a user who believes a note is armed can
 * see that it is not. A note containing fence-breaking sequences is rejected
 * loudly rather than stripped silently: a mangled note should be fixed, not
 * half-applied.
 */
export async function loadFocusNote(): Promise<FocusNote> {
  const focusPath = process.env["MAGIC_COMPACT_FOCUS"] ?? DEFAULT_FOCUS_PATH;

  let text: string;
  try {
    text = (await readFile(focusPath, "utf8")).trim();
  } catch {
    return { note: null, status: `No focus note found at ${focusPath}.` };
  }

  if (text === "") {
    return { note: null, status: `Focus note at ${focusPath} is empty.` };
  }

  const fenceBreaker = FENCE_BREAKING_SEQUENCES.find(sequence =>
    text.includes(sequence),
  );
  if (fenceBreaker !== undefined) {
    throw new Error(
      `Focus note at ${focusPath} contains the fence-breaking sequence "${fenceBreaker}". Remove it from the note and retry.`,
    );
  }

  return {
    note: text,
    status: `Focus note active (${text.length} chars from ${focusPath}).`,
  };
}
