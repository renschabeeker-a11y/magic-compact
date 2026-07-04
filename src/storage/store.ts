import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname } from "node:path";
import type { z } from "zod";

export function pluginStorageDirectory(): string {
  const base = Bun.env.XDG_DATA_HOME ?? `${homedir()}/.local/share`;
  return `${base}/opencode/storage/magic-compact`;
}

export async function readJSONFile<T>(
  filePath: string,
  schema: z.ZodType<T>,
): Promise<T | null> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return null;
  }

  const value = await file.json();
  const result = schema.safeParse(value);
  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function writeJSONFile(
  filePath: string,
  value: unknown,
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await Bun.write(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
