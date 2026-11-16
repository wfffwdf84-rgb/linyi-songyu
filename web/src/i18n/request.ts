import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { asIntlMessages, loadRawMessages } from "./messages";
import { applyCopyOverrides, readCopyOverridesFor } from "@/lib/copy";

/**
 * The messages a request renders: the bundle shipped in `messages/<locale>.json`
 * with the operator overlay for that locale layered on top.
 *
 * The overlay is read through `unstable_cache` + tag (see `src/lib/copy.ts`), so
 * it costs one row read per cache lifetime instead of one per page. It is
 * fail-open: a missing, unreadable or corrupt document applies no overrides and
 * every key keeps the shipped text.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [messages, overrides] = await Promise.all([
    loadRawMessages(locale),
    readCopyOverridesFor(locale),
  ]);

  return {
    locale,
    messages: asIntlMessages(applyCopyOverrides(messages, overrides)),
  };
});
