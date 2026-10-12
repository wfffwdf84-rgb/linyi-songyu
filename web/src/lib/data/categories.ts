export type CategoryFilter = {
  id: string;
  en: string;
  zh: string;
};

export type CategoryBrand = {
  id: string;
  en: string;
  zh: string;
};

export type Category = {
  slug: string;
  name: { en: string; zh: string };
  icon: string;
  description: { en: string; zh: string };
  filters: CategoryFilter[];
  brands?: CategoryBrand[];
};

export const categories: Category[] = [
  {
    slug: "transmission-systems",
    name: { en: "Transmission Systems", zh: "传动系统" },
    icon: "settings_ethernet",
    description: {
      en: "Main drive, gearbox, gear, shaft, flange, planet carrier, gear ring, axle, VRT, and differential parts for Chinese wheel loaders.",
      zh: "主传动、双变、齿轮、轴类、法兰、轮架、内齿圈、桥壳、VRT与差速器配件，适配国产品牌装载机。",
    },
    filters: [
      { id: "mainDrive", en: "Main Drive", zh: "主传动" },
      { id: "gearboxAssy", en: "Gearbox Ass'y", zh: "双变总成" },
      { id: "gearboxHousing", en: "Gearbox Housing", zh: "箱体" },
      { id: "torqueHousing", en: "Torque Housing", zh: "壳体" },
      { id: "gearAssy", en: "Gear Ass'y", zh: "齿轮总成" },
      { id: "gearboxGear", en: "Gearbox Gear", zh: "变速箱齿轮" },
      { id: "gearboxShaft", en: "Gearbox Shaft", zh: "变速箱轴" },
      { id: "gearboxFlange", en: "Gearbox Flange", zh: "法兰" },
      { id: "planetCarrier", en: "Planet Carrier", zh: "轮架" },
      { id: "carrierHousing", en: "Carrier Housing/Hub", zh: "轮架外壳" },
      { id: "planetGear", en: "Planet Gear", zh: "行星轮" },
      { id: "sunGear", en: "Sun Gear", zh: "太阳轮" },
      { id: "gearRing", en: "Gear Ring", zh: "内齿圈" },
      { id: "supportShaft", en: "Support Shaft", zh: "支撑轴" },
      { id: "axleHousing", en: "Axle Housing", zh: "桥壳" },
      { id: "halfShaft", en: "Half Shaft", zh: "半轴" },
      { id: "vrtSeries", en: "VRT Series", zh: "VRT系列" },
      { id: "differential", en: "Differential", zh: "差速器" },
      { id: "inStock", en: "In Stock", zh: "现货" },
    ],
  },
  {
    slug: "brake-components",
    name: { en: "Brake Components", zh: "制动部件" },
    icon: "settings_input_hdmi",
    description: {
      en: "Brake discs and disc brake calipers for SDLG, Liugong, XGMA, Lonking, XCMG, Changlin, Chenggong, and Somer.",
      zh: "临工、柳工、厦工、龙工、徐工、常林、成工与索玛制动盘、制动钳。",
    },
    filters: [
      { id: "brakeDisc", en: "Brake Disc", zh: "制动盘" },
      { id: "brakeCaliper", en: "Disc Brake", zh: "制动钳" },
      { id: "brand:SDLG", en: "SDLG", zh: "临工" },
      { id: "brand:Liugong", en: "Liugong", zh: "柳工" },
      { id: "brand:XCMG", en: "XCMG", zh: "徐工" },
      { id: "inStock", en: "In Stock", zh: "现货" },
    ],
  },
  {
    slug: "cooling-parts",
    name: { en: "Radiators", zh: "散热器" },
    icon: "device_thermostat",
    description: {
      en: "Leak-proof, vibration-resistant radiators for SDLG, XCMG, Liugong, XGMA, Changlin, Daewoo, and Doosan machines.",
      zh: "防漏抗震型散热器，适配临工、徐工、柳工、厦工、常林、大宇与斗山机型。",
    },
    filters: [
      { id: "brand:SDLG", en: "SDLG", zh: "临工" },
      { id: "brand:XCMG", en: "XCMG", zh: "徐工" },
      { id: "brand:Liugong", en: "Liugong", zh: "柳工" },
      { id: "brand:XGMA", en: "XGMA", zh: "厦工" },
      { id: "brand:Changlin", en: "Changlin", zh: "常林" },
      { id: "brand:Doosan", en: "Doosan", zh: "斗山" },
      { id: "brand:Daewoo", en: "Daewoo", zh: "大宇" },
      { id: "inStock", en: "In Stock", zh: "现货" },
    ],
  },
  {
    slug: "chinese-brand-parts",
    name: { en: "Chinese Brand Parts", zh: "中国品牌配件" },
    icon: "factory",
    description: {
      en: "Browse parts by Chinese machine brand.",
      zh: "按主机品牌查看配件。",
    },
    filters: [{ id: "inStock", en: "In Stock", zh: "现货" }],
    brands: [
      { id: "SDLG", en: "SDLG", zh: "临工" },
      { id: "Lonking", en: "Lonking", zh: "龙工" },
      { id: "XCMG", en: "XCMG", zh: "徐工" },
      { id: "Liugong", en: "Liugong", zh: "柳工" },
      { id: "XGMA", en: "XGMA", zh: "厦工" },
      { id: "LOVOL", en: "LOVOL", zh: "雷沃" },
      { id: "Yunyu", en: "Yunyu", zh: "肥城" },
      { id: "SANY", en: "SANY", zh: "三一" },
      { id: "Shantui", en: "Shantui", zh: "山推" },
      { id: "Somer", en: "Somer", zh: "索玛" },
      { id: "Advance", en: "Advance", zh: "杭齿" },
      { id: "Chenggong", en: "Chenggong", zh: "成工" },
      { id: "CEM", en: "CEM", zh: "山" },
      { id: "Changlin", en: "Changlin", zh: "常林" },
      { id: "Ensign", en: "Ensign", zh: "英轩" },
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
      { id: "inStock", en: "In Stock", zh: "现货" },
    ],
  },
  {
    slug: "structural-components",
    name: { en: "Structural Components", zh: "结构件" },
    icon: "view_in_ar",
    description: {
      en: "Swing frames, link arms, pins and sleeves, and articulated pin repair kits for Chinese and Doosan wheel loaders.",
      zh: "装载机车架、连杆、销轴套与铰接销修理包，适配国产品牌与斗山。",
    },
    filters: [
      { id: "swingFrame", en: "Swing Frame", zh: "车架" },
      { id: "linkArm", en: "Link Arm", zh: "连杆" },
      { id: "pinSleeve", en: "Pin and Sleeve", zh: "销轴套" },
      { id: "repairKit", en: "Repair Kit", zh: "修理包" },
      { id: "inStock", en: "In Stock", zh: "现货" },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function findCategoryBrand(category: Category, brand?: string) {
  if (!brand) return undefined;
  const key = brand.toLowerCase();
  return category.brands?.find((item) => item.id.toLowerCase() === key);
}
