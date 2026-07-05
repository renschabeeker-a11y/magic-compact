export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function unwrapString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
