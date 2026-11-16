import type { AbstractIntlMessages } from "next-intl";

/**
 * The message bundle as it sits in the repository.
 *
 * One module owns the dynamic import so the request config, the copy store and
 * the admin page all read the exact same bundle. It is server-only by nature:
 * the import is dynamic and locale-keyed, which a client bundle cannot carry.
 */
export type Messages = Record<string, unknown>;

export async function loadRawMessages(locale: string): Promise<Messages> {
  const loaded = (await import(`../../messages/${locale}.json`)) as { default: Messages };
  return loaded.default;
}

/** The shape next-intl's `getRequestConfig` accepts. */
export function asIntlMessages(messages: Messages): AbstractIntlMessages {
  return messages as AbstractIntlMessages;
}
