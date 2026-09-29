const SCROLL_PREFIX = "lsy-scroll:";
const STACK_KEY = "lsy-path-stack";
const PRODUCT_KEY = "lsy-return-product";

export function locationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

export function saveScroll() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SCROLL_PREFIX + locationKey(), String(Math.round(window.scrollY)));
  } catch {
    // private mode
  }
}

function readSavedScroll(key = locationKey()) {
  try {
    const value = Number(sessionStorage.getItem(SCROLL_PREFIX + key));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function rememberProduct(slug: string) {
  try {
    sessionStorage.setItem(PRODUCT_KEY, slug);
  } catch {
    // private mode
  }
}

export function readPathStack(): string[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STACK_KEY) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function writePathStack(stack: string[]) {
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-20)));
  } catch {
    // private mode
  }
}

export function canGoBackInSite() {
  const current = locationKey();
  return readPathStack().some((key) => key !== current);
}

export function restoreScroll() {
  if (typeof window === "undefined") return;
  const y = readSavedScroll();
  let slug = "";
  try {
    slug = sessionStorage.getItem(PRODUCT_KEY) || "";
  } catch {
    slug = "";
  }

  const apply = () => {
    if (y > 0) {
      window.scrollTo(0, y);
      return;
    }
    if (!slug) return;
    const card = document.querySelector(`[data-product="${CSS.escape(slug)}"]`);
    if (!(card instanceof HTMLElement)) return;
    const top = card.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo(0, Math.max(0, top));
  };

  apply();
  requestAnimationFrame(apply);
  window.setTimeout(apply, 50);
  window.setTimeout(apply, 200);
  window.setTimeout(apply, 500);
}
