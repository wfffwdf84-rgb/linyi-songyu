export type Category = {
  slug: string;
  name: { en: string; zh: string };
  icon: string;
  description: { en: string; zh: string };
  filters: { en: string; zh: string }[];
};

export const categories: Category[] = [
  {
    slug: "transmission-systems",
    name: { en: "Transmission Systems", zh: "传动系统" },
    icon: "settings_ethernet",
    description: {
      en: "High-durability gearbox assemblies and gear shafts. Direct fit for SDLG, Liugong, XCMG, and ZF heavy machinery.",
      zh: "高耐久变速箱总成与齿轮轴，适配临工、柳工、徐工、ZF 重型机械。",
    },
    filters: [
      { en: "SDLG 956L", zh: "临工 956L" },
      { en: "ZF OEM", zh: "ZF OEM" },
      { en: "In Stock", zh: "现货" },
    ],
  },
  {
    slug: "brake-components",
    name: { en: "Brake Components", zh: "制动部件" },
    icon: "settings_input_hdmi",
    description: {
      en: "High-strength brake discs, pads, and calipers for wheel loaders and excavators.",
      zh: "装载机与挖掘机高强度刹车盘、刹车片与卡钳。",
    },
    filters: [
      { en: "Liugong CLG856", zh: "柳工 CLG856" },
      { en: "HT250", zh: "HT250" },
      { en: "In Stock", zh: "现货" },
    ],
  },
  {
    slug: "lubrication-parts",
    name: { en: "Lubrication Parts", zh: "润滑配件" },
    icon: "oil_barrel",
    description: {
      en: "Pneumatic grease pumps, high-pressure pipes, and maintenance kits for fleet operations.",
      zh: "气动黄油泵、高压油管与车队保养套件。",
    },
    filters: [
      { en: "50:1 Ratio", zh: "50:1 压力比" },
      { en: "Universal Excavator", zh: "通用挖掘机" },
      { en: "In Stock", zh: "现货" },
    ],
  },
  {
    slug: "hydraulic-tools",
    name: { en: "Hydraulic Tools", zh: "液压工具" },
    icon: "water_drop",
    description: {
      en: "Hydraulic pumps, cylinders, and tooling for construction and mining equipment.",
      zh: "工程与矿山设备液压泵、油缸与工具。",
    },
    filters: [
      { en: "OEM Compatible", zh: "OEM 兼容" },
      { en: "Pressure Tested", zh: "已压力测试" },
      { en: "In Stock", zh: "现货" },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
