"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  locationKey,
  readPathStack,
  restoreScroll,
  saveScroll,
  writePathStack,
} from "@/lib/scroll-memory";

let popped = false;

function syncStackOnBack(key: string) {
  const stack = readPathStack();
  while (stack.length && stack[stack.length - 1] !== key) {
    stack.pop();
  }
  if (stack[stack.length - 1] !== key) stack.push(key);
  writePathStack(stack);
}

export function ScrollMemory() {
  const pathname = usePathname();
  const first = useRef(true);
  const pendingRestore = useRef(false);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    const onPop = () => {
      popped = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useLayoutEffect(() => {
    const key = locationKey();
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;

    if (first.current) {
      first.current = false;
      if (!nav || nav.type === "navigate") {
        writePathStack([key]);
        return;
      }
      if (nav.type === "back_forward") {
        pendingRestore.current = true;
        syncStackOnBack(key);
        restoreScroll();
      }
      return;
    }

    if (popped) {
      popped = false;
      pendingRestore.current = true;
      syncStackOnBack(key);
      restoreScroll();
      return;
    }

    const stack = readPathStack();
    if (stack[stack.length - 1] !== key) {
      stack.push(key);
      writePathStack(stack);
    }
  }, [pathname]);

  useEffect(() => {
    if (!pendingRestore.current) return;
    pendingRestore.current = false;
    restoreScroll();
  }, [pathname]);

  useLayoutEffect(() => {
    const onScroll = () => saveScroll();
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      if (!link || link.origin !== window.location.origin) return;
      saveScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", saveScroll);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", saveScroll);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
