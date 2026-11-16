"use client";

import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  OEM_NUMBER_MAX_LENGTH,
  OEM_NUMBERS_MAX,
  parseOemNumberText,
  sameOemNumbers,
  type OemRejectionReason,
} from "@/lib/oem-numbers";

const REJECTION_LABELS: Record<OemRejectionReason, string> = {
  not_text: "不是文字",
  too_long: `超过 ${OEM_NUMBER_MAX_LENGTH} 个字符`,
  invalid_characters: "含不允许的字符（只能用字母、数字、空格和 - / . _）",
  too_many: `超过 ${OEM_NUMBERS_MAX} 个上限`,
};

const inputClass =
  "w-full rounded-lg border-2 border-outline-variant bg-surface px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-0";

/**
 * One field shared by the edit form and the create form. Both parse the text
 * with the same module the API uses, so the operator sees the exact entries a
 * save would reject instead of discovering it after the fact.
 */
export function AdminOemNumbersField({
  value,
  onChange,
  seedNumbers,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  /** The values "restore original" would bring back. */
  seedNumbers: string[];
  disabled?: boolean;
}) {
  const parsed = parseOemNumberText(value);
  // Clearing the box means "no override", so the seed list is what the site
  // will show: that is the original state, not a modification.
  const restoringSeed = parsed.numbers.length === 0 && seedNumbers.length > 0;
  const modified = !sameOemNumbers(parsed.numbers, seedNumbers) && !restoringSeed;
  const effective = parsed.numbers.length > 0 ? parsed.numbers : restoringSeed ? seedNumbers : [];

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <h2 className="mb-1 flex items-center gap-2 text-headline-md text-on-surface">
        <MaterialIcon name="travel_explore" className="text-primary" />
        OEM 交叉参考号
      </h2>
      <p className="mb-4 text-body-sm text-on-surface-variant">
        买家常用原厂号搜索。多个号用逗号或换行分隔。
        <b>不确定的号不要填</b>——填错会导致客户订错件。
      </p>

      <label className="block space-y-1">
        <span className="block text-technical-data text-on-surface-variant">
          OEM 号（{OEM_NUMBERS_MAX} 个以内，每个 {OEM_NUMBER_MAX_LENGTH} 字符以内）
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          maxLength={800}
          disabled={disabled}
          spellCheck={false}
          placeholder={"如 4110001234\nLG856H-12345、SDLG-953"}
          className={inputClass}
        />
      </label>

      {parsed.rejected.length > 0 ? (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-error bg-error-container p-3 text-body-sm text-on-error-container"
        >
          <p className="mb-1 font-semibold">以下条目无效，不会被保存：</p>
          <ul className="list-inside list-disc space-y-0.5">
            {parsed.rejected.map((entry, index) => (
              <li key={`${entry.value}-${index}`}>
                「{entry.value}」：{REJECTION_LABELS[entry.reason]}
              </li>
            ))}
          </ul>
          <p className="mt-1">请修正或删掉这些条目后再保存。</p>
        </div>
      ) : (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
          <span
            className={
              modified
                ? "rounded bg-primary-fixed px-2 py-0.5 text-label-caps text-on-primary-fixed"
                : "rounded bg-surface-container px-2 py-0.5 text-label-caps text-on-surface-variant"
            }
          >
            {modified ? "已修改" : "原始"}
          </span>
          <span>
            当前生效：{effective.length > 0 ? `${effective.length} 个号` : "无"}
          </span>
          <span className="text-on-surface-variant/70">
            原始值：{seedNumbers.length > 0 ? seedNumbers.join(" · ") : "无"}
          </span>
        </p>
      )}

      {seedNumbers.length > 0 ? (
        <p className="mt-2 text-body-sm text-on-surface-variant">
          留空保存会回到上面的原始值；已有原厂号不能通过本字段清空。
        </p>
      ) : null}
    </section>
  );
}
