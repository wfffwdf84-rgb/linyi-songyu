"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Currency = "USD" | "CNY" | "RMB";
type SpecRow = { labelKey: string; en: string; zh: string };

const ERRORS: Record<string, string> = {
  invalid_slug:
    "产品标识（slug）无效：3–80 个字符，只用小写字母、数字和连字符，不能以连字符开头。",
  slug_taken: "这个 slug 已被现有产品或代码里的种子产品占用。",
  invalid_part_number: "零件号必填，且不超过 60 个字符。",
  part_number_taken: "这个零件号已经被别的产品使用。",
  invalid_brand: "品牌必填，且不超过 80 个字符。",
  invalid_category: "请选择真实存在的分类。",
  invalid_name: "英文名称必填，中英文名称各不超过 200 字。",
  invalid_description: "描述超过 2000 字或包含非法字符。",
  invalid_price: "价格无效：需为 0 – 10,000,000 之间的数字，且币种有效。",
  invalid_image: "图片地址无效：只接受 https 的 Blob / Google 图片地址，或站内 /images/… 路径。",
  invalid_specs: "规格无效：labelKey 只能用字母/数字/下划线（字母开头），值上限 200 字，最多 40 行。",
  invalid_compatible: "适配机型过长（上限 400 字）。",
  invalid_patch: "提交的内容无法识别，请刷新页面重试。",
  too_many_products: "覆盖层里的新增产品已达上限，请先清理。",
  not_configured: "服务器未配置 Blob 存储或加密密钥，无法保存。",
  unavailable: "保存失败：覆盖层无法读写，请稍后重试。",
  unauthorized: "登录已过期，请重新登录。",
  forbidden: "需要所有者或运营权限。",
};

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,79}$/;

const inputClass =
  "w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0";

export function AdminNewProductForm({
  categories,
}: {
  categories: { slug: string; label: string }[];
}) {
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionZh, setDescriptionZh] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState<Currency>("USD");
  const [image, setImage] = useState("");
  const [inStock, setInStock] = useState(true);
  const [compatibleMachines, setCompatibleMachines] = useState("");
  const [specs, setSpecs] = useState<SpecRow[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateSpec(index: number, patch: Partial<SpecRow>) {
    setSpecs((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  /** Mirrors the server rules so the operator sees the problem before saving. */
  function validate(): string | null {
    const trimmedSlug = slug.trim().toLowerCase();
    if (!SLUG_PATTERN.test(trimmedSlug)) {
      return ERRORS.invalid_slug;
    }
    if (!partNumber.trim()) return ERRORS.invalid_part_number;
    if (partNumber.trim().length > 60) return ERRORS.invalid_part_number;
    if (!brand.trim()) return ERRORS.invalid_brand;
    if (!categories.some((category) => category.slug === categorySlug)) {
      return ERRORS.invalid_category;
    }
    if (!nameEn.trim()) return ERRORS.invalid_name;
    if (nameEn.length > 200 || nameZh.length > 200) return ERRORS.invalid_name;
    if (descriptionEn.length > 2000 || descriptionZh.length > 2000) {
      return ERRORS.invalid_description;
    }
    if (!image.trim()) return ERRORS.invalid_image;
    if (image.trim().length > 500) return ERRORS.invalid_image;
    if (!/^https:\/\//i.test(image.trim()) && !image.trim().startsWith("/")) {
      return ERRORS.invalid_image;
    }
    const amountText = priceAmount.trim();
    if (amountText !== "") {
      const amount = Number(amountText);
      if (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000) {
        return ERRORS.invalid_price;
      }
    }
    for (const row of specs) {
      const filled = row.en.trim() || row.zh.trim();
      if (!filled) continue;
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(row.labelKey.trim())) return ERRORS.invalid_specs;
      if (row.en.length > 200 || row.zh.length > 200) return ERRORS.invalid_specs;
    }
    return null;
  }

  async function onSave() {
    setError("");
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    const amountText = priceAmount.trim();
    const specsPayload = specs
      .filter((row) => row.en.trim() || row.zh.trim())
      .map((row) => ({
        labelKey: row.labelKey.trim(),
        value: { en: row.en, zh: row.zh },
      }));

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim().toLowerCase(),
          partNumber: partNumber.trim(),
          brand: brand.trim(),
          categorySlug,
          name: { en: nameEn, zh: nameZh },
          description: { en: descriptionEn, zh: descriptionZh },
          image: image.trim(),
          inStock,
          compatibleMachines,
          price:
            amountText === ""
              ? null
              : { amount: Number(amountText), currency: priceCurrency },
          specs: specsPayload,
          technicalSpecs: specsPayload,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!response.ok || !data?.ok) {
        setError(ERRORS[data?.error ?? ""] ?? "保存失败，请稍后重试。");
        return;
      }
      router.push("/admin/products");
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
        <h2 className="mb-4 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="badge" className="text-primary" />
          基本信息
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">
              产品标识 slug（URL 里的一段）
            </span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="如 bd-sdlg-956-new"
              maxLength={80}
              spellCheck={false}
              className={inputClass}
            />
            <span className="block text-body-sm text-on-surface-variant">
              保存后地址为 <code>/parts/&lt;分类&gt;/{slug.trim().toLowerCase() || "…"}</code>
              ，不能与现有产品或种子产品重复。
            </span>
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">零件号</span>
            <input
              value={partNumber}
              onChange={(event) => setPartNumber(event.target.value)}
              maxLength={60}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">品牌</span>
            <input
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="如 SDLG / Liugong"
              maxLength={80}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">分类</span>
            <select
              value={categorySlug}
              onChange={(event) => setCategorySlug(event.target.value)}
              className={inputClass}
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}（{category.slug}）
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="edit_note" className="text-primary" />
          名称与描述
        </h2>
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container p-3 text-body-sm text-on-surface-variant">
          其它 11 种语言的译文<b>按英文原文做键</b>：英文名称与描述会决定阿语、法语、泰语等语言的显示，
          没有对应译文时回退英文。
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">名称（英文，必填）</span>
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

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="image" className="text-primary" />
          图片
        </h2>
        <p className="mb-4 text-body-sm text-on-surface-variant">
          上传的图片存在 Vercel Blob，前台用 next/image 直接渲染。也可以填已有的站内路径。
        </p>
        <AdminImageField value={image} onChange={setImage} slug={slug} disabled={busy} />
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="payments" className="text-primary" />
          价格（内部）
        </h2>
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-outline bg-secondary-container p-3 text-body-sm text-on-secondary-container">
          <MaterialIcon name="visibility_off" className="text-[18px]" />
          <span>
            <b>仅内部可见，前台永不显示。</b>
            价格保存在加密的覆盖层里，公开页面的数据加载器会把它整个剔除。
          </span>
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="inventory_2" className="text-primary" />
          库存与适配
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-body-md text-on-surface">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(event) => setInStock(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            在库（前台显示「现货」标记）
          </label>
          <label className="block space-y-1">
            <span className="block text-technical-data text-on-surface-variant">适配机型（可选）</span>
            <input
              value={compatibleMachines}
              onChange={(event) => setCompatibleMachines(event.target.value)}
              placeholder="如 SDLG LG956 / Liugong CLG856"
              maxLength={400}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="table_rows" className="text-primary" />
          规格（可选）
        </h2>
        <p className="mb-4 text-body-sm text-on-surface-variant">
          会同时出现在列表卡片与详情页「技术参数」。labelKey 必须是已有翻译键（如 material / fits /
          voltage / location），否则前台直接显示键名本身。
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
                onClick={() => setSpecs((current) => current.filter((_, i) => i !== index))}
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
          onClick={() => setSpecs((current) => [...current, { labelKey: "", en: "", zh: "" }])}
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-body-md font-semibold text-on-primary disabled:opacity-60"
        >
          <MaterialIcon name="save" className="text-[18px]" />
          {busy ? "保存中…" : "保存并发布"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          disabled={busy}
          className="rounded-xl border border-outline-variant px-4 py-2 text-body-md text-on-surface-variant hover:border-primary disabled:opacity-60"
        >
          取消
        </button>
        <span className="text-body-sm text-on-surface-variant">
          保存后前台分类页、/parts、首页、sitemap 与该产品页会一起重新生成。
        </span>
      </div>
    </div>
  );
}
