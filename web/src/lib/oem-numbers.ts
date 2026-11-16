/**
 * Rules for the OEM cross-reference numbers an operator types into the admin
 * panel. They live in their own module (no server imports) so the two admin
 * forms can show exactly which entry the server would reject, using the same
 * code the API runs.
 *
 * An OEM number is printed on a real part and read by a buyer searching Google,
 * so the shape is deliberately narrow: letters, digits, spaces and the marks
 * that appear in factory part numbers (`-`, `/`, `.`, `_`). Anything else is
 * rejected instead of being silently stored.
 */

export const OEM_NUMBERS_MAX = 10;
export const OEM_NUMBER_MAX_LENGTH = 40;

/** Letters, digits, spaces and the punctuation factory part numbers use. */
const OEM_NUMBER_PATTERN = /^[A-Za-z0-9 /._-]+$/;

/** Comma, ideographic comma, enumeration comma and any whitespace/newline. */
const OEM_SEPARATOR = /[\s,，、]+/;

export type OemRejectionReason =
  | "not_text"
  | "too_long"
  | "invalid_characters"
  | "too_many";

export type OemRejection = {
  /** The entry as typed, so the form can quote it back to the operator. */
  value: string;
  reason: OemRejectionReason;
};

export type CleanOemNumbers = {
  numbers: string[];
  rejected: OemRejection[];
};

/**
 * Control characters and angle brackets are stripped for the same reason every
 * text field strips them: the value is rendered, never parsed as markup.
 */
function strip(raw: string) {
  return raw.replace(/[\u0000-\u001f<>]/g, "").trim();
}

/**
 * Cleans a list of numbers: per-entry rejection, case-insensitive de-duplication
 * and a hard cap. An entry that fails a rule is reported, never silently kept.
 */
export function cleanOemNumbers(input: unknown): CleanOemNumbers {
  const numbers: string[] = [];
  const rejected: OemRejection[] = [];
  if (!Array.isArray(input)) return { numbers, rejected };

  const seen = new Set<string>();
  for (const entry of input) {
    if (typeof entry !== "string") {
      rejected.push({ value: "", reason: "not_text" });
      continue;
    }
    const value = strip(entry);
    // A blank entry is not an error: it is the trailing separator of a textarea.
    if (!value) continue;
    if (value.length > OEM_NUMBER_MAX_LENGTH) {
      rejected.push({ value, reason: "too_long" });
      continue;
    }
    if (!OEM_NUMBER_PATTERN.test(value)) {
      rejected.push({ value, reason: "invalid_characters" });
      continue;
    }
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    if (numbers.length >= OEM_NUMBERS_MAX) {
      rejected.push({ value, reason: "too_many" });
      continue;
    }
    seen.add(key);
    numbers.push(value);
  }
  return { numbers, rejected };
}

/** Splits what the operator typed and then applies the same per-entry rules. */
export function parseOemNumberText(text: string): CleanOemNumbers {
  return cleanOemNumbers(text.split(OEM_SEPARATOR));
}

/** Two lists are "the same" when they hold the same numbers, ignoring case/order. */
export function sameOemNumbers(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) return false;
  const normalize = (list: readonly string[]) =>
    list.map((value) => value.trim().toLowerCase()).sort();
  const a = normalize(left);
  const b = normalize(right);
  return a.every((value, index) => value === b[index]);
}
