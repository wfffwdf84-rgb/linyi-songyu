export const siteConfig = {
  name: "Linyi Songyu International Trade Co., Ltd",
  nameZh: "临沂松昱国际贸易有限公司",
  shortName: "LINYI SONGYU",
  shortNameZh: "临沂松昱",
  description:
    "OEM-compatible heavy machinery spare parts supplier. Transmission assemblies, brake components, and radiators with 24-48H dispatch from Linyi Hub.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://songyuheavyparts.com",
  email: "wfffwdf84@gmail.com",
  phone: "+86 175 6815 5882",
  whatsappNumber: "8617568155882",
  tel: "tel:+8617568155882",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "https://wa.me/8617568155882",
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ??
    "https://www.facebook.com/profile.php?id=61592685976455",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@loader.parts0",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/rodgwdcj/",
  locale: "en",
  logo: "/images/brand/logo.png",
  linyi: {
    lat: 35.1047,
    lng: 118.3565,
    query: "Linyi, Shandong, China",
  },
} as const;

const PLACEHOLDER_SOCIAL = new Set([
  "https://www.facebook.com",
  "https://www.tiktok.com",
  "https://www.instagram.com",
]);

export function organizationSameAs() {
  return [siteConfig.whatsapp, siteConfig.facebook, siteConfig.tiktok, siteConfig.instagram].filter(
    (url) => !PLACEHOLDER_SOCIAL.has(url.replace(/\/$/, "")),
  );
}

const SMS_BODY_MAX = 450;

export function inquirySmsHref(body: string, isIos = false) {
  const text = body.length > SMS_BODY_MAX ? `${body.slice(0, SMS_BODY_MAX)}…` : body;
  const encoded = encodeURIComponent(text);
  const n = siteConfig.whatsappNumber;
  return isIos ? `sms:+${n}&body=${encoded}` : `sms:+${n}?body=${encoded}`;
}

export function inquiryWhatsAppHref(body: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(body)}`;
}

export function isMobilePhone() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function openInquirySms(body: string) {
  if (typeof window === "undefined") return;
  const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const href = inquirySmsHref(body, isIos);
  if (isMobilePhone()) {
    window.location.href = href;
    return;
  }
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
