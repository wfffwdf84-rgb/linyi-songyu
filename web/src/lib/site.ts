export const siteConfig = {
  name: "Linyi Songyu International Trade Co., Ltd",
  shortName: "LINYI SONGYU",
  description:
    "OEM-compatible heavy machinery spare parts supplier. Transmission assemblies, brake components, and lubrication equipment with 24-48H dispatch from Linyi Hub.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://linyiglobalparts.com",
  email: "export@linyiglobal.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "#",
  locale: "en",
} as const;
