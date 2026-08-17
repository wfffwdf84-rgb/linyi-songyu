export type ProductSpec = {
  labelKey: string;
  value: { en: string; zh: string };
};

export type Product = {
  slug: string;
  partNumber: string;
  name: { en: string; zh: string };
  categorySlug: string;
  oemRef?: string;
  oemPart?: string;
  brands: string[];
  description: { en: string; zh: string };
  image: string;
  images?: string[];
  inStock: boolean;
  dispatch24h?: boolean;
  specs: ProductSpec[];
  technicalSpecs: ProductSpec[];
  compatibleMachines?: string;
};

export const products: Product[] = [
  {
    slug: "zf-4wg200-transmission-assembly",
    partNumber: "4WG200-ZF",
    name: {
      en: "ZF 4WG200 Transmission Assembly",
      zh: "ZF 4WG200 变速箱总成",
    },
    categorySlug: "transmission-systems",
    oemRef: "4WG200",
    brands: ["SDLG", "Liugong"],
    description: {
      en: "Heavy-duty power shift transmission for 5-ton wheel loader applications with optimal gear ratio switching.",
      zh: "适用于 5 吨级轮式装载机的重型动力换挡变速箱，齿比切换平稳。",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGkb0zqsqy5dM_oiHPtMc5FZIcZgqZ1jYY_piXDRCJkJvDQM2Gjxv4GPNWRNvvQp7q6TZLPrXfXuY9M6ts30uWi4BsMFBtXCuyp6bbtLncYtoOAFS0dqMMIdbAnaFSLvJDf1DouG_XsH0oSYYDatEFU6ZgkImkuFLVHREOtft_Hu9gMTEBk76m_YNh6Ruw7WSr5R1lfRN6EesEg1mRSWRBsaABpCm_-GqIlMdaVfiVYm99yxJLB0XR",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "SDLG 956L", zh: "临工 956L" } },
      { labelKey: "weight", value: { en: "850 kg", zh: "850 kg" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      {
        labelKey: "transmissionType",
        value: { en: "Power Shift, Countershaft", zh: "动力换挡，中间轴" },
      },
      { labelKey: "gears", value: { en: "4 Forward, 3 Reverse", zh: "4 前进 / 3 后退" } },
      { labelKey: "maxInputPower", value: { en: "162 kW / 220 HP", zh: "162 kW / 220 HP" } },
      { labelKey: "maxInputSpeed", value: { en: "2200 RPM", zh: "2200 RPM" } },
      { labelKey: "dryWeight", value: { en: "850 kg", zh: "850 kg" } },
      {
        labelKey: "compatibleMachines",
        value: {
          en: "SDLG LG956L, Liugong 856, XCMG LW500",
          zh: "临工 LG956L、柳工 856、徐工 LW500",
        },
      },
    ],
    compatibleMachines: "SDLG LG956L, Liugong 856, XCMG LW500",
  },
  {
    slug: "wg180-wheel-loader-transmission",
    partNumber: "4110000081014",
    name: {
      en: "WG180 Advanced Wheel Loader Transmission Assembly",
      zh: "WG180 轮式装载机变速箱总成",
    },
    categorySlug: "transmission-systems",
    oemRef: "4WG180",
    oemPart: "4110000081014 | Ref ID: 4WG180",
    brands: ["SDLG", "LIUGONG"],
    description: {
      en: "Heavy-duty power shift transmission designed for severe 5-ton wheel loader applications in mining and construction.",
      zh: "面向矿山与工程工况的 5 吨级轮式装载机重型动力换挡变速箱。",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQnpXAxUx3wa9w4bZAswpM17hfpdPaP7bcmSNDAuH6yDH6bgbSbGYGfBltsrt3-yoqz9Uz0knEVVKkdzItJgH_Vrp2FentwI5AkFiLFYVZOsmFoKiqoYW0om5o2m5KvLU8B8e0OaQc_CPJg6JWhJmofcQMtwGCHRjH5OIqmA9AySL7UF5_ywjs6QuNCVONBXr29oqlcypfJSCW-5WZ7lAHSfJWI9LAW3Eaptm1gqYXCA-B0SRcqH_h",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQnpXAxUx3wa9w4bZAswpM17hfpdPaP7bcmSNDAuH6yDH6bgbSbGYGfBltsrt3-yoqz9Uz0knEVVKkdzItJgH_Vrp2FentwI5AkFiLFYVZOsmFoKiqoYW0om5o2m5KvLU8B8e0OaQc_CPJg6JWhJmofcQMtwGCHRjH5OIqmA9AySL7UF5_ywjs6QuNCVONBXr29oqlcypfJSCW-5WZ7lAHSfJWI9LAW3Eaptm1gqYXCA-B0SRcqH_h",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKnCt9TiIpB7xjNsRgH-s8-0XFE4Qxbov9eJBldkKYOUdZy3Yz5RjjkqMW8FrOnxGVVtSE69zXSXffmOZpygk4yvPsSY0Xzh0ajqBkkUTTXIzbq8e-14nulHkIBsYHCGbXd_4w3lgGxINSYu6J4wqpm34ZCefkZupVJrmikUCUc3PBxdMOs10w1vwoKENuigHliqe8SfKlekedjFNfTWTaQGgsAhGCYZZK4EIH-LtFNFGofT03z_xa",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvNSQm53tXwyrIEh8pbD2Ly2vIbYKiekLZxGwf64uuUpo7P3pjwfh3ISWxfvrveB4ZagnmB2vu30eFztFqbKKHmd2HowovlGGNkKurAQo21w4eBdXrN6GZJqAnhUuALLco7v3ZreYeC3CT_mqhI2RUvW6kXM4yV_U5GUL7k2FcIzQBaoxCYFmNifGKos67FCx7-p4qHC_VSq6ADDb65_bfmRXY_ONlAD1MggRGuqLnsNQAT9fFxq3-",
    ],
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "SDLG 956L", zh: "临工 956L" } },
      { labelKey: "weight", value: { en: "850 kg", zh: "850 kg" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      {
        labelKey: "transmissionType",
        value: { en: "Power Shift, Countershaft", zh: "动力换挡，中间轴" },
      },
      { labelKey: "gears", value: { en: "4 Forward, 3 Reverse", zh: "4 前进 / 3 后退" } },
      { labelKey: "maxInputPower", value: { en: "162 kW / 220 HP", zh: "162 kW / 220 HP" } },
      { labelKey: "maxInputSpeed", value: { en: "2200 RPM", zh: "2200 RPM" } },
      { labelKey: "dryWeight", value: { en: "850 kg", zh: "850 kg" } },
      {
        labelKey: "compatibleMachines",
        value: {
          en: "SDLG LG956L, Liugong 856, XCMG LW500",
          zh: "临工 LG956L、柳工 856、徐工 LW500",
        },
      },
    ],
    compatibleMachines: "SDLG LG956L, Liugong 856, XCMG LW500",
  },
  {
    slug: "bd-lg50-brake-disc",
    partNumber: "BD-LG50",
    name: {
      en: "High-Strength Brake Disc (Liugong)",
      zh: "高强度刹车盘（柳工）",
    },
    categorySlug: "brake-components",
    brands: ["Liugong"],
    description: {
      en: "High-strength vented brake disc for wheel loader applications.",
      zh: "轮式装载机高强度通风刹车盘。",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6X-ondp2ybyC0jCY3iRZm0qFnuoRymxwLLaMqjHKSh11dU75xY6h8bq7J-rkbMjjIKadToog3J-LGcen4LxpsU43EY_LBtxpmIf_88vIUFIDWyuBLNNjel-GStKznxE22xJ4n4MXkuxW_X3u9a_Jvnpy9AS4DEgtYLVLgZBdk1QyMupHvlNoVInswUG_DsTAtAAtOvvwd9nBnb_huodLnRtTvj18cuFL0gcvrXxfSk_sxTJCmuHpM",
    inStock: true,
    specs: [
      { labelKey: "fits", value: { en: "Liugong CLG856", zh: "柳工 CLG856" } },
      { labelKey: "material", value: { en: "HT250", zh: "HT250" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "material", value: { en: "HT250 Cast Iron", zh: "HT250 铸铁" } },
      {
        labelKey: "application",
        value: { en: "Wheel Loader Front Axle", zh: "轮式装载机前桥" },
      },
      {
        labelKey: "compatibleMachines",
        value: { en: "Liugong CLG856", zh: "柳工 CLG856" },
      },
    ],
  },
  {
    slug: "gp-501-grease-pump",
    partNumber: "GP-501",
    name: {
      en: "Pneumatic Grease Pump 50:1",
      zh: "气动黄油泵 50:1",
    },
    categorySlug: "lubrication-parts",
    brands: ["Universal"],
    description: {
      en: "Industrial pneumatic grease pump for excavator fleet maintenance.",
      zh: "挖掘机车队保养用工业气动黄油泵。",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCufF_iOlLj_W20oloFvuLiiogpb4h-QLgPXjI8p7T76U4nz8WolE_npY1_V8Wine3KuSI992ymyZcLP6P7rgyd6RRRESachc7X1VTNiKv3o_JbX8UOEPLJGQV3ZWM66GUHuxTVH3hpZ4wlhrMnFu9nwsvMicFGN9HxPNAk6bC0YrOSa9ECGH3Luuo5sEQePv3O-LSZiYLbvWNOnY1GPUYV7QHXVXTQ-MJrwZx1nfqPWwLU8TEddL97",
    inStock: true,
    specs: [
      { labelKey: "pressureRatio", value: { en: "50:1", zh: "50:1" } },
      {
        labelKey: "application",
        value: { en: "Universal Excavator", zh: "通用挖掘机" },
      },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "pressureRatio", value: { en: "50:1", zh: "50:1" } },
      { labelKey: "tankCapacity", value: { en: "20L", zh: "20L" } },
      {
        labelKey: "application",
        value: { en: "Universal Excavator", zh: "通用挖掘机" },
      },
    ],
  },
];

export function getProductsByCategory(categorySlug: string) {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getProduct(categorySlug: string, slug: string) {
  return products.find(
    (p) => p.categorySlug === categorySlug && p.slug === slug,
  );
}

export function getAllProductPaths() {
  return products.map((p) => ({
    category: p.categorySlug,
    slug: p.slug,
  }));
}
