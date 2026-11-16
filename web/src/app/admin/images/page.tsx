import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AdminImageManager,
  type AdminImageGroupView,
} from "@/components/admin/AdminImageManager";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAdminSession, requireRole } from "@/lib/admin-auth";
import {
  HERO_INTERVAL_DEFAULT_MS,
  HERO_INTERVAL_MAX_MS,
  HERO_INTERVAL_MIN_MS,
  HERO_INTERVAL_STEP_MS,
  readSiteImagesReport,
  SITE_IMAGE_GROUPS,
  SITE_IMAGE_SLOTS,
  siteImageDefaults,
  siteImageListFrom,
  siteImageOverridden,
} from "@/lib/site-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "图片 · 运营后台",
  robots: { index: false, follow: false },
};

/**
 * The site-image manager.
 *
 * The slot list is code (`site-image-slots.ts`), the current values come from the
 * sparse overlay document, and this page is the only place that joins them: one
 * group per page an operator recognises, one card per image position.
 *
 * Owners and editors only - product photos and site decoration are both content
 * writes, and `sales` does not get either.
 */
export default async function AdminImagesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!requireRole(session, ["owner", "editor"])) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
        <p className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          仅所有者与运营可以替换网站图片
        </p>
        <p className="text-body-md text-on-surface-variant">业务员账号只能查看和导出询盘。</p>
      </div>
    );
  }

  const { images, overrides, settings, status } = await readSiteImagesReport();

  // The carousel settings belong to the "首页" group, because that is where the
  // operator changes the slides the cadence applies to. The bounds travel with
  // the values so the panel and the API cannot disagree about 2-15 seconds.
  const heroSettings = {
    intervalMs: settings.heroIntervalMs,
    autoplay: settings.heroAutoplay,
    defaultIntervalMs: HERO_INTERVAL_DEFAULT_MS,
    minIntervalMs: HERO_INTERVAL_MIN_MS,
    maxIntervalMs: HERO_INTERVAL_MAX_MS,
    stepIntervalMs: HERO_INTERVAL_STEP_MS,
  };

  const groups: AdminImageGroupView[] = SITE_IMAGE_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    pagePath: group.pagePath,
    hint: group.hint,
    heroSettings: group.id === "home" ? heroSettings : undefined,
    slots: SITE_IMAGE_SLOTS.filter((slot) => slot.group === group.id).map((slot) => ({
      id: slot.id,
      label: slot.label,
      kind: slot.kind,
      where: slot.where,
      hint: slot.hint,
      value: siteImageListFrom(images, slot.id),
      defaults: siteImageDefaults(slot),
      overridden: siteImageOverridden(overrides, slot.id),
    })),
  }));

  return <AdminImageManager groups={groups} status={status} />;
}
