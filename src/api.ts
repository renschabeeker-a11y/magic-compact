import type { PluginInput } from "@opencode-ai/plugin";
import { OpencodeClient as _V2Client } from "@opencode-ai/sdk/v2";
import type { Client as GenV2Client } from "@opencode-ai/sdk/v2/gen/client";

export type V2Client = _V2Client;

export function getV2Client(input: PluginInput): V2Client {
  const rawClient = input.client["_client"];
  return new _V2Client({ client: rawClient as unknown as GenV2Client });
}

export function unwrap<T, E>(response: { data?: T; error?: E }): T {
  if ("error" in response && response.error) {
    throw new Error(String(response.error));
  }

  return response.data as T;
}
