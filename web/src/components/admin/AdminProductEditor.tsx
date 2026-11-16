"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminOemNumbersField } from "@/components/admin/AdminOemNumbersField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { parseOemNumberText } from "@/lib/oem-numbers";

type Localised = { en: string; zh: string };
type SpecRow = { labelKey: string; value: Localised };
type Currency = "USD" | "CNY" | "RMB";

type Price = { amount: number; currency: Currency; note?: string };

type EditorProduct = {
  slug: string;
  partNumber: string;
  name: Localised;
  description: Localised;
  specs: SpecRow[];
  image: string;
  inStock: boolean;
  hidden: boolean;
  overridden: boolean;
  /** OEM numbers after the overlay is applied: what the site shows now. */
  oemNumbers: string[];
  /** A product created in the panel: its URL 404s after a delete. */
  isNew: boolean;
  price: Price | null;
};

type SeedValues = {
  name: Localised;
  description: Localised;
  specs: SpecRow[];
  image: string;
  inStock: boolean;
  price: Price | null;
  oemNumbers: string[];
};

const ERRORS: Record<string, string> = {
  invalid_name: "名称过长或包含非法字符（上限 200 字）。",
  invalid_description: "描述过长或包含非法字符（上限 2000 字）。",
  invalid_price: "价格无效：需为 0 – 10,000,000 之间的数字，且币种有效。",
  invalid_specs: "规格无效：labelKey 只能用字母/数字/下划线（字母开头），值上限 200 字，最多 40 行。",
  invalid_slug: "产品标识无效。",
  invalid_image: "图片地址无效：只接受 https 的 Blob / Google 图片地址，或站内 /images/… 路径。",
  invalid_oem_numbers: "OEM 交叉参考号无效：需要是列表，最多 10 个，每个 1–40 个字符。",
  invalid_patch: "提交的内容无法识别，请刷新页面重试。",
  not_found: "产品不存在。",
  not_configured: "服务器未配置 Blob 存储或加密密钥，无法保存。",
  unavailable: "保存失败：覆盖层无法读写，请稍后重试。",
  unauthorized: "登录已过期，请重新登录。",
  forbidden: "需要所有者或运营权限。",
};

const inputClass =
  "w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0";

type EditableRow = { labelKey: string; en: string; zh: string };

function rowsFromSpecs(specs: SpecRow[]): EditableRow[] {
  return specs.map((spec) => ({
    labelKey: spec.labelKey,
    en: spec.value.en,
    zh: spec.value.zh,
  }));
}

export function AdminProductEditor({
  product,
  seed,
}: {
  product: EditorProduct;
  seed: SeedValues;
}) {
  const router = useRouter();
  const [nameEn, setNameEn] = useState(product.name.en);
  const [nameZh, setNameZh] = useState(product.name.zh);
  const [descriptionEn, setDescriptionEn] = useState(product.description.en);
  const [descriptionZh, setDescriptionZh] = useState(product.description.zh);
  const [priceAmount, setPriceAmount] = useState(product.price ? String(product.price.amount) : "");
  const [priceCurrency, setPriceCurrency] = useState<Currency>(product.price?.currency ?? "USD");
  const [priceNote, setPriceNote] = useState(product.price?.note ?? "");
  const [inStock, setInStock] = useState(product.inStock);
  const [hidden, setHidden] = useState(product.hidden);
  const [image, setImage] = useState(product.image);
  const [specs, setSpecs] = useState<EditableRow[]>(rowsFromSpecs(product.specs));
  const [oemText, setOemText] = useState(product.oemNumbers.join("\n"));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [overridden, setOverridden] = useState(product.overridden);

  function updateSpec(index: number, patch: Partial<EditableRow>) {
    setSpecs((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeSpec(index: number) {
    setSpecs((current) => current.filter((_, i) => i !== index));
  }

  function addSpec() {
    setSpecs((current) => [...current, { labelKey: "", en: "", zh: "" }]);
  }

  /**
   * Puts the form back to the base values (the seed entry, or the record a
   * product was created with). Nothing is written until 保存 is pressed: with
   * every field back at the base the diff is empty and the save deletes the
   * override. 恢复原始内容 uses the DELETE route instead, which clears it at once.
   */
  function loadSeedValues() {
    setNameEn(seed.name.en);
    setNameZh(seed.name.zh);
    setDescriptionEn(seed.description.en);
    setDescriptionZh(seed.description.zh);
    setSpecs(rowsFromSpecs(seed.specs));
    setImage(seed.image);
    setInStock(seed.inStock);
    setHidden(false);
    setPriceAmount(seed.price ? String(seed.price.amount) : "");
    setPriceCurrency(seed.price?.currency ?? "USD");
    setPriceNote(seed.price?.note ?? "");
    setOemText(seed.oemNumbers.join("\n"));
    setSaved("");
    setError("");
  }

  /** Clears the overlay for this product: every field returns to the original. */
  async function onRestore() {
    const message = product.isNew
      ? "恢复为创建时的内容？该产品仍是新增产品，不会被删除。"
      : "恢复为代码里的原始内容？覆盖层中该产品的修改会被清空。";
    if (!window.confirm(message)) return;

    setBusy(true);
    setError("");
    setSaved("");
    try {
      const response = await fetch(`/api/admin/products?slug=${encodeURIComponent(product.slug)}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; reset?: boolean }
        | null;
      if (!response.ok || !data?.ok) {
        setError(ERRORS[data?.error ?? ""] ?? "恢复失败，请稍后重试。");
        return;
      }
      loadSeedValues();
      setOverridden(false);
      setSaved(
        product.isNew
          ? "已恢复为创建时的内容，前台页面正在重新生成。"
          : "已恢复为原始内容，前台页面正在重新生成。",
      );
      router.refresh();
    } catch {
      setError("网络错误，恢复失败。");
    } finally {
      setBusy(false);
    }
  }

  /** Removes a product the panel added. Seed products can only be restored. */
  async function onDelete() {
    if (
      !window.confirm(
        `删除产品「${product.partNumber}」？它会从前台、搜索结果和 sitemap 中消失，且无法撤销。`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const response = await fetch(`/api/admin/products?slug=${encodeURIComponent(product.slug)}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; deleted?: boolean }
        | null;
      if (!response.ok || !data?.ok) {
        setError(ERRORS[data?.error ?? ""] ?? "删除失败，请稍后重试。");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("网络错误，删除失败。");
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    setError("");
    setSaved("");

    const oem = parseOemNumberText(oemText);
    if (oem.rejected.length > 0) {
      setError(`OEM 交叉参考号有 ${oem.rejected.length} 条无效，请按下方提示修正后再保存。`);
      return;
    }

    setBusy(true);

    const trimmedAmount = priceAmount.trim();
    const price =
      trimmedAmount === ""
        ? null
        : {
            amount: Number(trimmedAmount),
            currency: priceCurrency,
            note: priceNote.trim() || undefined,
          };

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: product.slug,
          patch: {
            name: { en: nameEn, zh: nameZh },
            description: { en: descriptionEn, zh: descriptionZh },
            price,
            inStock,
            hidden,
            image,
            oemNumbers: oem.numbers,
            specs: specs.map((row) => ({
              labelKey: row.labelKey.trim(),
              value: { en: row.en, zh: row.zh },
            })),
          },
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; overridden?: boolean }
        | null;
      if (!response.ok || !data?.ok) {
        setError(ERRORS[data?.error ?? ""] ?? "保存失败，请稍后重试。");
        return;
      }
      setOverridden(Boolean(data.overridden));
      setSaved(data.overridden ? "已保存，前台页面正在重新生成。" : "已保存，该产品已恢复为原始内容。");
      router.refresh();
    } catch {
      setError("网络错误，保存失败。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="edit_note" className="text-primary" />
          名称与描述
        </h2>
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container p-3 text-body-sm text-on-surface-variant">
          其它 11 种语言（阿语、法语、泰语…）的译文<b>按英文原文做键</b>：改动英文名称或描述后，
          这些语言的译文将失效并<b>回退显示英文</b>。只改中文不影响其它语言。
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">名称（英文）</span>
            <input
              value={nameEn}
              onChange={(event) => setNameEn(event.target.value)}
              maxLength={200}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">名称（中文）</span>
            <input
              value={nameZh}
              onChange={(event) => setNameZh(event.target.value)}
              maxLength={200}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">描述（英文）</span>
            <textarea
              value={descriptionEn}
              onChange={(event) => setDescriptionEn(event.target.value)}
              maxLength={2000}
              rows={4}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">描述（中文）</span>
            <textarea
              value={descriptionZh}
              onChange={(event) => setDescriptionZh(event.target.value)}
              maxLength={2000}
              rows={4}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <AdminOemNumbersField
        value={oemText}
        onChange={setOemText}
        seedNumbers={seed.oemNumbers}
        disabled={busy}
      />

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="image" className="text-primary" />
          图片
        </h2>
        <p className="mb-4 text-body-sm text-on-surface-variant">
          上传一张新图会得到 Blob 上的完整 https 地址；保存后产品页、列表卡片、搜索建议和
          JSON-LD 都使用它。也可以直接填站内路径。
        </p>
        <AdminImageField value={image} onChange={setImage} slug={product.slug} disabled={busy} />
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="payments" className="text-primary" />
          价格
        </h2>
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-outline bg-secondary-container p-3 text-body-sm text-on-secondary-container">
          <MaterialIcon name="visibility_off" className="text-[18px]" />
          <span>
            <b>仅内部可见，前台永不显示。</b>
            价格保存在加密的覆盖层里，公开页面的数据加载器会把它整个剔除；产品页、分类页、JSON-LD、
            搜索索引和 sitemap 都不会出现价格。
          </span>
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">金额（留空表示不记录）</span>
            <input
              value={priceAmount}
              onChange={(event) => setPriceAmount(event.target.value)}
              inputMode="decimal"
              placeholder="如 128.50"
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">币种</span>
            <select
              value={priceCurrency}
              onChange={(event) => setPriceCurrency(event.target.value as Currency)}
              className={inputClass}
            >
              <option value="USD">USD 美元</option>
              <option value="CNY">CNY 人民币</option>
              <option value="RMB">RMB 人民币（旧写法）</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">备注（内部）</span>
            <input
              value={priceNote}
              onChange={(event) => setPriceNote(event.target.value)}
              maxLength={200}
              placeholder="如 含税 / 底价 / 2026Q1"
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="inventory_2" className="text-primary" />
          上下架
        </h2>
        <p className="mb-4 text-body-sm text-on-surface-variant">
          下架后前台列表、分类页、搜索结果和 sitemap 都不再显示该产品，数据保留，可随时恢复。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <label className="flex items-center gap-2 text-body-md text-on-surface">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(event) => setInStock(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            在库（前台显示「现货」标记）
          </label>
          <label className="flex items-center gap-2 text-body-md text-on-surface">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(event) => setHidden(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            下架（前台不显示）
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="table_rows" className="text-primary" />
          规格
        </h2>
        <p className="mb-4 text-body-sm text-on-surface-variant">
          保存后会同时替换列表卡片与详情页「技术参数」的规格行。labelKey 必须是已有的翻译键
          （如 material / fits / voltage / location），否则前台直接显示键名本身；值上限 200 字。
        </p>
        <div className="space-y-2">
          {specs.map((row, index) => (
            <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[10rem_1fr_1fr_auto]">
              <input
                value={row.labelKey}
                onChange={(event) => updateSpec(index, { labelKey: event.target.value })}
                placeholder="labelKey"
                spellCheck={false}
                className={inputClass}
              />
              <input
                value={row.en}
                onChange={(event) => updateSpec(index, { en: event.target.value })}
                placeholder="英文值"
                className={inputClass}
              />
              <input
                value={row.zh}
                onChange={(event) => updateSpec(index, { zh: event.target.value })}
                placeholder="中文值"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeSpec(index)}
                aria-label="删除这一行"
                className="flex items-center justify-center rounded-lg border border-outline-variant px-3 text-on-surface-variant hover:border-error hover:text-error"
              >
                <MaterialIcon name="delete" className="text-[18px]" />
              </button>
            </div>
          ))}
          {specs.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">还没有规格行。</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={addSpec}
          className="mt-3 inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1 text-technical-data text-on-surface-variant hover:border-primary"
        >
          <MaterialIcon name="add" className="text-[16px]" />
          增加一行
        </button>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-error bg-error-container p-4 text-body-md text-on-error-container"
        >
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-xl border border-outline-variant bg-secondary-container p-4 text-body-md text-on-secondary-container">
          {saved}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={busy}
          className="rounded-xl bg-primary px-5 py-2 text-body-md font-semibold text-on-primary disabled:opacity-60"
        >
          {busy ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={() => void onRestore()}
          disabled={busy}
          className="rounded-xl border border-outline-variant px-4 py-2 text-body-md text-on-surface-variant hover:border-primary disabled:opacity-60"
        >
          {product.isNew ? "恢复为创建时内容" : "恢复原始内容"}
        </button>
        {product.isNew ? (
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-xl border border-error px-4 py-2 text-body-md text-error hover:bg-error-container disabled:opacity-60"
          >
            <MaterialIcon name="delete" className="text-[18px]" />
            删除该产品
          </button>
        ) : null}
        <span className="text-body-sm text-on-surface-variant">
          {overridden
            ? "该产品有覆盖层修改"
            : product.isNew
              ? "该新增产品当前为创建时的内容"
              : "该产品当前为原始内容"}
        </span>
      </div>
    </div>
  );
}
