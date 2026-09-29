"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { loc } from "@/lib/locale";
import { cn } from "@/lib/utils";
import type { ProductSearchHit } from "@/lib/data/products";

type ProductSearchFormProps = {
  defaultValue?: string;
  compact?: boolean;
  iconSubmit?: boolean;
  className?: string;
};

export function ProductSearchForm({
  defaultValue = "",
  compact,
  iconSubmit,
  className,
}: ProductSearchFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("catalog");
  const listId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState<ProductSearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const q = value.trim();
    const min = /[\u4e00-\u9fff]/.test(q) ? 1 : 2;
    if (q.length < min) {
      setItems([]);
      setOpen(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json().catch(() => null)) as { items?: ProductSearchHit[] } | null;
      const next = Array.isArray(data?.items) ? data.items : [];
      setItems(next);
      setOpen(next.length > 0);
      setActive(-1);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function goSearch(query: string) {
    const q = query.trim();
    setOpen(false);
    if (!q) {
      router.push("/parts/transmission-systems");
      return;
    }
    router.push(`/parts?q=${encodeURIComponent(q)}`);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (active >= 0 && items[active]) {
      router.push(items[active].href);
      setOpen(false);
      return;
    }
    goSearch(value);
  }

  return (
    <form
      ref={rootRef}
      onSubmit={onSubmit}
      className={cn("relative w-full", !compact && "flex-1", className)}
      role="search"
    >
      <div
        className={cn(
          "flex overflow-hidden rounded border-outline-variant bg-surface-bright focus-within:border-primary",
          compact ? "h-10 border" : "h-14 border-2",
        )}
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t("searchPlaceholder")}</span>
          {iconSubmit ? null : (
            <MaterialIcon
              name="search"
              className="pointer-events-none absolute top-1/2 start-3 -translate-y-1/2 text-on-surface-variant"
            />
          )}
          <input
            name="q"
            type="search"
            value={value}
            autoComplete="off"
            enterKeyHint="search"
            placeholder={compact ? t("searchShort") : t("searchPlaceholder")}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={open}
            className={cn(
              "h-full w-full border-0 bg-transparent pe-8 text-on-surface outline-none focus:ring-0",
              compact ? "text-sm" : "text-technical-data",
              iconSubmit ? "ps-3" : "ps-11",
            )}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => {
              if (items.length) setOpen(true);
            }}
            onKeyDown={(event) => {
              if (!open || items.length === 0) return;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((current) => (current + 1) % items.length);
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((current) => (current <= 0 ? items.length - 1 : current - 1));
              }
              if (event.key === "Escape") setOpen(false);
            }}
          />
          {value ? (
            <button
              type="button"
              className="absolute top-1/2 end-2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              aria-label={t("filterClear")}
              onClick={() => {
                setValue("");
                setItems([]);
                setOpen(false);
              }}
            >
              <MaterialIcon name="close" className="text-[18px]" />
            </button>
          ) : null}
        </label>
        <button
          type="submit"
          aria-label={t("searchSubmit")}
          className={cn(
            "shrink-0 font-bold",
            iconSubmit
              ? "flex h-full w-10 items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
              : "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary",
            !iconSubmit && (compact ? "px-3 text-sm" : "px-5 text-technical-data"),
          )}
        >
          {iconSubmit ? <MaterialIcon name="search" className="text-[20px]" /> : t("searchSubmit")}
        </button>
      </div>
      {open && items.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+4px)] z-[60] max-h-80 overflow-auto rounded border border-outline-variant bg-surface shadow-lg"
        >
          {items.map((item, index) => (
            <li key={item.href} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-start hover:bg-surface-container-low",
                  index === active && "bg-surface-container-low",
                )}
                onMouseEnter={() => setActive(index)}
                onClick={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
              >
                <Image
                  src={item.image}
                  alt=""
                  width={40}
                  height={40}
                  quality={100}
                  unoptimized
                  className="h-10 w-10 shrink-0 rounded border border-outline-variant bg-white object-contain"
                />
                <span className="min-w-0">
                  <span className="block truncate text-technical-data text-on-surface">{item.partNumber}</span>
                  <span className="block truncate text-sm text-on-surface-variant">
                    {loc(locale, item.name.en, item.name.zh)}
                  </span>
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="w-full border-t border-outline-variant px-3 py-2 text-start text-technical-data text-primary hover:bg-surface-container-low"
              onClick={() => goSearch(value)}
            >
              {t("searchAll")}
            </button>
          </li>
        </ul>
      ) : null}
    </form>
  );
}
