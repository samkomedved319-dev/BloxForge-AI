/**
 * Derive a sensible Roblox instance name + type from a generated Luau code block.
 * Used by the "Insert in Studio" button so scripts land in Studio with a real
 * name instead of "BloxForgeScript".
 */

export type InstanceType =
  | "Script"
  | "LocalScript"
  | "ModuleScript"
  | "Part"
  | "Model";

export interface DerivedInstance {
  instanceType: InstanceType;
  instanceName: string;
  parent: string;
}

const PASCAL_RE = /^[A-Z][A-Za-z0-9_]*$/;

function sanitizeName(raw: string): string {
  let n = raw.replace(/[^A-Za-z0-9 _-]/g, "").trim();
  // Strip leading digits
  n = n.replace(/^[0-9 _-]+/, "");
  if (!n) return "BloxForgeScript";
  // Convert snake_case / kebab-case → PascalCase
  if (n.includes("_") || n.includes("-")) {
    n = n
      .split(/[_-]/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("");
  }
  // Capitalize first letter if lowercase
  if (n.charAt(0) === n.charAt(0).toLowerCase() && /[a-z]/.test(n.charAt(0))) {
    n = n.charAt(0).toUpperCase() + n.slice(1);
  }
  return n.slice(0, 50);
}

/**
 * Inspect a code block + optional AI-provided title/heading to derive a name.
 * Heuristics (in priority order):
 *   1. `local Foo = {}` / `local Foo = setmetatable(...)` → "Foo" (ModuleScript)
 *   2. `Foo = {}` module pattern → "Foo"
 *   3. `function Foo` / `local function Foo` → "Foo"
 *   4. `class Foo` → "Foo"
 *   5. AI heading/comment line like "-- Foo" or "--[[ Foo ]]--"
 *   6. fallback → "BloxForgeScript"
 *
 * Type heuristics:
 *   - returns something at end → ModuleScript
 *   - references LocalPlayer / RunService.RenderStepped → LocalScript
 *   - otherwise → Script
 */
export function deriveInstance(
  code: string,
  aiTitle?: string,
): DerivedInstance {
  const src = code || "";

  // 1. module table pattern
  let m = src.match(/local\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\{\}/);
  if (!m) m = src.match(/local\s+([A-Z][A-Za-z0-9_]*)\s*=\s*setmetatable/);
  if (!m) m = src.match(/^\s*([A-Z][A-Za-z0-9_]*)\s*=\s*\{\}/m);
  let name = m?.[1];

  // 2. function pattern
  if (!name) {
    const fm = src.match(/(?:local\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)/);
    if (fm && PASCAL_RE.test(fm[1])) name = fm[1];
  }

  // 3. AI title fallback
  if (!name && aiTitle) {
    const tm = aiTitle.match(/[A-Z][A-Za-z0-9]+/);
    if (tm) name = tm[0];
  }

  // 4. comment header
  if (!name) {
    const cm = src.match(/^\s*--\s*([A-Z][A-Za-z0-9_ ]+)/m);
    if (cm) name = cm[1].trim().split(/\s+/)[0];
  }

  const instanceName = sanitizeName(name || "BloxForgeScript");

  // Determine type
  const lower = src.toLowerCase();
  const returnsAtEnd = /\breturn\s+[A-Za-z_]/.test(src.slice(-400));
  const isClient =
    /\blocalplayer\b/.test(lower) ||
    /runservice:renderstepped/.test(lower) ||
    /runservice\.heartbeat/.test(lower) === false &&
      (/uiservice|userinputservice|contextactionservice/.test(lower));

  let instanceType: InstanceType = "Script";
  if (returnsAtEnd) instanceType = "ModuleScript";
  else if (isClient) instanceType = "LocalScript";

  // Parent: client scripts → StarterPlayerScripts; everything else → ServerScriptService
  let parent = "ServerScriptService";
  if (instanceType === "LocalScript") parent = "StarterPlayerScripts";
  if (instanceType === "ModuleScript" && isClient) parent = "ReplicatedStorage";

  return { instanceType, instanceName, parent };
}
