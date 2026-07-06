/**
 * BloxForge AI — Studio connector store (in-memory)
 *
 * Ephemeral pairing sessions that link a Roblox Studio plugin instance to a
 * browser session. The plugin is a pure connector: it reports its selected
 * script as context and receives "insert this code" commands from the web app.
 * No AI chat happens inside the plugin.
 *
 * Sessions are kept in memory (single-server deployment) and garbage-collected
 * after the plugin stops heartbeating.
 */

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I

export interface InsertCommand {
  id: string;
  title: string;
  language: string;
  code: string;
  instanceType: string; // "Script" | "LocalScript" | "ModuleScript" | "Part" | "Model"
  instanceName: string; // the name to give the created instance
  parent: string; // service path, e.g. "ServerScriptService"
  createdAt: number;
}

export interface InsertResult {
  commandId: string;
  ok: boolean;
  message: string;
  at: number;
}

export interface StudioContext {
  scriptName: string;
  scriptPath: string;
  source: string;
  lineCount: number;
  updatedAt: number;
}

export interface StudioSession {
  code: string;
  createdAt: number;
  lastSeen: number; // 0 until first heartbeat
  context: StudioContext | null;
  pendingInserts: InsertCommand[];
  insertResults: InsertResult[];
}

export interface StudioState {
  connected: boolean;
  context: StudioContext | null;
  lastSeen: number | null;
  insertResults: InsertResult[];
  pairingCode: string;
}

function generateCode(): string {
  let raw = "";
  for (let i = 0; i < 6; i++) {
    raw += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return raw.slice(0, 3) + "-" + raw.slice(3);
}

/** Normalize a user-entered code to canonical "XXX-XXX" form. */
export function normalizeCode(input: string): string {
  const cleaned = (input || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  if (cleaned.length <= 3) return cleaned;
  return cleaned.slice(0, 3) + "-" + cleaned.slice(3);
}

const STALE_AFTER_MS = 30_000; // plugin offline if no heartbeat for 30s
const PURGE_AFTER_MS = 120_000; // drop session 2 min after going offline
const UNUSED_PAIR_AFTER_MS = 10 * 60_000; // drop unused pairing codes after 10 min

class StudioStore {
  private sessions = new Map<string, StudioSession>();

  pair(): { code: string } {
    this.cleanup();
    let code: string;
    do {
      code = generateCode();
    } while (this.sessions.has(code));
    this.sessions.set(code, {
      code,
      createdAt: Date.now(),
      lastSeen: 0,
      context: null,
      pendingInserts: [],
      insertResults: [],
    });
    return { code };
  }

  /** Plugin heartbeat: update lastSeen + context, drain pending insert commands. */
  heartbeat(
    code: string,
    context: StudioContext | null | undefined,
  ): { ok: boolean; commands: InsertCommand[] } {
    const normalized = normalizeCode(code);
    const s = this.sessions.get(normalized);
    if (!s) return { ok: false, commands: [] };
    s.lastSeen = Date.now();
    if (context !== undefined) {
      s.context = context;
    }
    const commands = s.pendingInserts;
    s.pendingInserts = [];
    return { ok: true, commands };
  }

  /** Web app → plugin: enqueue an insert command. */
  insert(
    code: string,
    cmd: {
      title: string;
      language: string;
      code: string;
      instanceType?: string;
      instanceName?: string;
      parent?: string;
    },
  ): { ok: boolean; commandId?: string; error?: string } {
    const normalized = normalizeCode(code);
    const s = this.sessions.get(normalized);
    if (!s) return { ok: false, error: "Unknown pairing code" };
    if (!s.lastSeen || Date.now() - s.lastSeen > STALE_AFTER_MS) {
      return { ok: false, error: "Studio is not connected" };
    }
    const commandId =
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    s.pendingInserts.push({
      id: commandId,
      title: cmd.title,
      language: cmd.language,
      code: cmd.code,
      instanceType: cmd.instanceType || "Script",
      instanceName: cmd.instanceName || cmd.title || "BloxForgeScript",
      parent: cmd.parent || "ServerScriptService",
      createdAt: Date.now(),
    });
    return { ok: true, commandId };
  }

  /** Plugin → server: report the result of an insert command. */
  ack(
    code: string,
    commandId: string,
    ok: boolean,
    message: string,
  ): boolean {
    const normalized = normalizeCode(code);
    const s = this.sessions.get(normalized);
    if (!s) return false;
    s.insertResults.push({ commandId, ok, message, at: Date.now() });
    if (s.insertResults.length > 50) s.insertResults = s.insertResults.slice(-50);
    return true;
  }

  /** Web app reads the current Studio state. */
  state(code: string): StudioState | null {
    const normalized = normalizeCode(code);
    const s = this.sessions.get(normalized);
    if (!s) return null;
    const connected = s.lastSeen > 0 && Date.now() - s.lastSeen < STALE_AFTER_MS;
    return {
      connected,
      context: s.context,
      lastSeen: s.lastSeen || null,
      insertResults: s.insertResults.slice(-10),
      pairingCode: s.code,
    };
  }

  disconnect(code: string): void {
    const normalized = normalizeCode(code);
    this.sessions.delete(normalized);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [code, s] of this.sessions) {
      if (s.lastSeen > 0) {
        if (now - s.lastSeen > PURGE_AFTER_MS) this.sessions.delete(code);
      } else {
        if (now - s.createdAt > UNUSED_PAIR_AFTER_MS) this.sessions.delete(code);
      }
    }
  }
}

const globalForStudio = globalThis as unknown as {
  __bloxforgeStudioStore?: StudioStore;
};

export const studioStore: StudioStore =
  globalForStudio.__bloxforgeStudioStore ??
  (globalForStudio.__bloxforgeStudioStore = new StudioStore());
