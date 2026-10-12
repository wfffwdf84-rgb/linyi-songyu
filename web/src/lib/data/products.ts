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
  imageFit?: "cover" | "contain";
  inStock: boolean;
  dispatch24h?: boolean;
  specs: ProductSpec[];
  technicalSpecs: ProductSpec[];
  compatibleMachines?: string;
  moq?: number;
};

const productSeed: Product[] = [
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
    slug: "zx-800-electric-grease-pump",
    partNumber: "ZX-800",
    name: {
      en: "Submersible Electric Grease Pump (DC24V)",
      zh: "下沉式电动黄油机（DC24V）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "DC24V submersible electric grease pump for fleet maintenance. 600/800W motor, 6000 psi, 13–18L bucket.",
      zh: "车队保养用 DC24V 下沉式电动黄油机。电机 600/800W，工作压力 6000psi，适用 13–18L 油桶。",
    },
    image: "/images/products/zx-800.png",
    images: ["/images/products/zx-800.png", "/images/products/zx-grease-pump-catalog.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "voltage", value: { en: "DC24V", zh: "DC24V" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "voltage", value: { en: "DC24V", zh: "DC24V" } },
      { labelKey: "motorPower", value: { en: "600 / 800 W", zh: "600/800W" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "bucketCapacity", value: { en: "13–18 L", zh: "13-18L" } },
      { labelKey: "greaseType", value: { en: "NLGI 0–3 grease", zh: "0-3号黄油" } },
      { labelKey: "outputRate", value: { en: "350 / 450 g/min", zh: "350/450 g/min" } },
      { labelKey: "colors", value: { en: "Blue, yellow, orange", zh: "蓝 / 黄 / 橙" } },
    ],
  },
  {
    slug: "zx-801-electric-grease-pump",
    partNumber: "ZX-801",
    name: {
      en: "Submersible Electric Grease Pump (AC220V)",
      zh: "下沉式电动黄油机（AC220V）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "AC220V submersible electric grease pump with side control box. 600/800W, 6000 psi, 13–18L bucket.",
      zh: "带侧控盒的 AC220V 下沉式电动黄油机。电机 600/800W，工作压力 6000psi，适用 13–18L 油桶。",
    },
    image: "/images/products/zx-801.png",
    images: ["/images/products/zx-801.png", "/images/products/zx-grease-pump-catalog.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "voltage", value: { en: "AC220V", zh: "AC220V" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "voltage", value: { en: "AC220V", zh: "AC220V" } },
      { labelKey: "motorPower", value: { en: "600 / 800 W", zh: "600/800W" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "bucketCapacity", value: { en: "13–18 L", zh: "13-18L" } },
      { labelKey: "greaseType", value: { en: "NLGI 0–3 grease", zh: "0-3号黄油" } },
      { labelKey: "outputRate", value: { en: "350 / 450 g/min", zh: "350/450 g/min" } },
      { labelKey: "colors", value: { en: "Blue, yellow, orange", zh: "蓝 / 黄 / 橙" } },
    ],
  },
  {
    slug: "zx-803-electric-grease-pump",
    partNumber: "ZX-803",
    name: {
      en: "Submersible Electric Grease Pump (DC24V)",
      zh: "下沉式电动黄油机（DC24V）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "DC24V submersible electric grease pump, compact drum-lid design. 600/800W, 6000 psi.",
      zh: "DC24V 下沉式电动黄油机，桶盖紧凑结构。电机 600/800W，工作压力 6000psi。",
    },
    image: "/images/products/zx-803.png",
    images: ["/images/products/zx-803.png", "/images/products/zx-grease-pump-catalog.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "voltage", value: { en: "DC24V", zh: "DC24V" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "voltage", value: { en: "DC24V", zh: "DC24V" } },
      { labelKey: "motorPower", value: { en: "600 / 800 W", zh: "600/800W" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "bucketCapacity", value: { en: "13–18 L", zh: "13-18L" } },
      { labelKey: "greaseType", value: { en: "NLGI 0–3 grease", zh: "0-3号黄油" } },
      { labelKey: "outputRate", value: { en: "350 / 450 g/min", zh: "350/450 g/min" } },
      { labelKey: "colors", value: { en: "Red / blue", zh: "红 / 蓝" } },
    ],
  },
  {
    slug: "zx-805-electric-grease-pump",
    partNumber: "ZX-805",
    name: {
      en: "Mobile Submersible Electric Grease Pump (AC220V)",
      zh: "下沉式电动黄油机（AC220V 移动式）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "AC220V submersible electric grease pump on a wheeled trolley for workshop and field service. 600/800W, 6000 psi.",
      zh: "带轮推车的 AC220V 下沉式电动黄油机，适合车间与现场保养。电机 600/800W，工作压力 6000psi。",
    },
    image: "/images/products/zx-805.png",
    images: ["/images/products/zx-805.png", "/images/products/zx-grease-pump-catalog.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "voltage", value: { en: "AC220V", zh: "AC220V" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "voltage", value: { en: "AC220V", zh: "AC220V" } },
      { labelKey: "motorPower", value: { en: "600 / 800 W", zh: "600/800W" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "bucketCapacity", value: { en: "13–18 L", zh: "13-18L" } },
      { labelKey: "greaseType", value: { en: "NLGI 0–3 grease", zh: "0-3号黄油" } },
      { labelKey: "outputRate", value: { en: "350 / 450 g/min", zh: "350/450 g/min" } },
      { labelKey: "colors", value: { en: "Blue, yellow, orange", zh: "蓝 / 黄 / 橙" } },
    ],
  },
  {
    slug: "zx-802-barrel-grease-pump",
    partNumber: "ZX-802",
    name: {
      en: "Barrel Electric Grease Pump (DC24V)",
      zh: "桶式电动黄油机（DC24V）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "DC24V barrel-type electric grease pump. 600/800W, 6000 psi, 300 mm inner diameter, 430 mm barrel height.",
      zh: "DC24V 桶式电动黄油机。电机 600/800W，工作压力 6000psi，桶内径 300mm，桶高 430mm。",
    },
    image: "/images/products/zx-802.png",
    images: ["/images/products/zx-802.png", "/images/products/zx-grease-pump-catalog-2.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "voltage", value: { en: "DC24V", zh: "DC24V" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "voltage", value: { en: "DC24V", zh: "DC24V" } },
      { labelKey: "motorPower", value: { en: "600 / 800 W", zh: "600/800W" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "barrelInnerDiameter", value: { en: "300 mm", zh: "300mm" } },
      { labelKey: "barrelHeight", value: { en: "430 mm", zh: "430mm" } },
      { labelKey: "greaseType", value: { en: "NLGI 0–3 grease", zh: "0-3号黄油" } },
      { labelKey: "outputRate", value: { en: "350 / 450 g/min", zh: "350/450 g/min" } },
      { labelKey: "colors", value: { en: "Brown, yellow", zh: "棕 / 黄" } },
    ],
  },
  {
    slug: "zx-807-barrel-grease-pump",
    partNumber: "ZX-807",
    name: {
      en: "Mobile Barrel Electric Grease Pump",
      zh: "桶式电动黄油机（移动式）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "Wheeled barrel electric grease pump, 24V / 48V / 220V. 600/800W, 6000 psi, 300 mm inner diameter, 500 mm barrel height.",
      zh: "带轮桶式电动黄油机，电压 24V / 48V / 220V。电机 600/800W，工作压力 6000psi，桶内径 300mm，桶高 500mm。",
    },
    image: "/images/products/zx-807.png",
    images: ["/images/products/zx-807.png", "/images/products/zx-grease-pump-catalog-2.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "voltage", value: { en: "24V / 48V / 220V", zh: "24V / 48V / 220V" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "voltage", value: { en: "24V / 48V / 220V", zh: "24V / 48V / 220V" } },
      { labelKey: "motorPower", value: { en: "600 / 800 W", zh: "600/800W" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "barrelInnerDiameter", value: { en: "300 mm", zh: "300mm" } },
      { labelKey: "barrelHeight", value: { en: "500 mm", zh: "500mm" } },
      { labelKey: "greaseType", value: { en: "NLGI 0–3 grease", zh: "0-3号黄油" } },
      { labelKey: "outputRate", value: { en: "350 g/min", zh: "350 g/min" } },
      { labelKey: "colors", value: { en: "Brown, yellow", zh: "棕 / 黄" } },
    ],
  },
  {
    slug: "zx-806-electric-grease-pump",
    partNumber: "ZX-806",
    name: {
      en: "Submersible Electric Grease Pump with Remote (AC220V)",
      zh: "下沉式电动黄油机（AC220V 遥控）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "AC220V submersible electric grease pump with wired remote. 600/800W, 6000 psi, 13–18L bucket.",
      zh: "带有线遥控的 AC220V 下沉式电动黄油机。电机 600/800W，工作压力 6000psi，适用 13–18L 油桶。",
    },
    image: "/images/products/zx-806.png",
    images: ["/images/products/zx-806.png", "/images/products/zx-grease-pump-catalog-2.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "voltage", value: { en: "AC220V", zh: "AC220V" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "voltage", value: { en: "AC220V", zh: "AC220V" } },
      { labelKey: "motorPower", value: { en: "600 / 800 W", zh: "600/800W" } },
      { labelKey: "workingPressure", value: { en: "6000 psi", zh: "6000psi" } },
      { labelKey: "bucketCapacity", value: { en: "13–18 L", zh: "13-18L" } },
      { labelKey: "greaseType", value: { en: "NLGI 0–3 grease", zh: "0-3号黄油" } },
      { labelKey: "outputRate", value: { en: "350 / 450 g/min", zh: "350/450 g/min" } },
      { labelKey: "colors", value: { en: "Blue, orange, yellow", zh: "蓝 / 橙 / 黄" } },
    ],
  },
  {
    slug: "zx-809-pneumatic-grease-pump",
    partNumber: "ZX-809",
    name: {
      en: "Pneumatic Grease Pump 40L (50:1)",
      zh: "气动黄油机 40L（50:1）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "40L pneumatic grease pump on caster base. 50:1 ratio, 0.85 L/min delivery, 16.6 kg.",
      zh: "40L 气动黄油机，四轮底座。压力比 50:1，出油量 0.85 L/min，设备重量 16.6kg。",
    },
    image: "/images/products/zx-809.png",
    images: ["/images/products/zx-809.png", "/images/products/zx-grease-pump-catalog-2.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "pressureRatio", value: { en: "50:1", zh: "50:1" } },
      { labelKey: "tankCapacity", value: { en: "40 L", zh: "40L" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "pressureRatio", value: { en: "50:1", zh: "50:1" } },
      { labelKey: "tankCapacity", value: { en: "40 L", zh: "40L" } },
      { labelKey: "dischargePressure", value: { en: "30–40 MPa", zh: "30-40 MPa" } },
      { labelKey: "intakeRange", value: { en: "0.6–0.8 MPa", zh: "0.6-0.8 MPa" } },
      { labelKey: "oilDelivery", value: { en: "0.85 L/min", zh: "0.85 L/min" } },
      { labelKey: "equipmentWeight", value: { en: "16.6 kg", zh: "16.6kg" } },
      { labelKey: "colors", value: { en: "Red, orange, yellow", zh: "红 / 橙 / 黄" } },
    ],
  },
  {
    slug: "st-808-oil-circuit-unblocker",
    partNumber: "ST-808",
    name: {
      en: "Electric Oil Circuit Unblocker",
      zh: "电动油路疏通器",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "Electric oil circuit unblocker for engine and hydraulic lines. 24V / 220V, 2500W, 14000 psi.",
      zh: "电动油路疏通器，用于机油与液压油管路。电压 24V/220V，电机 2500W，工作压力 14000psi。",
    },
    image: "/images/products/st-808.png",
    images: ["/images/products/st-808.png", "/images/products/zx-grease-pump-catalog-3.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "voltage", value: { en: "24V / 220V", zh: "24V/220V" } },
      { labelKey: "workingPressure", value: { en: "14000 psi", zh: "14000psi" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "voltage", value: { en: "24V / 220V", zh: "24V/220V" } },
      { labelKey: "motorPower", value: { en: "2500 W", zh: "2500W" } },
      { labelKey: "workingPressure", value: { en: "14000 psi", zh: "14000psi" } },
      { labelKey: "greaseType", value: { en: "Engine / hydraulic oil", zh: "机油 / 液压油" } },
    ],
  },
  {
    slug: "hose-reel-10-15m",
    partNumber: "HR-10/15",
    name: {
      en: "High-Pressure Hose Reel",
      zh: "卷管器",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "Iron-plate high-pressure hose reel, 10 m or 15 m hose, 440×440×300 mm, 1.5 m lead hose.",
      zh: "铁盘高压管卷管器，10m / 15m 可选。尺寸 440×440×300mm，连接导管 1.5 米。",
    },
    image: "/images/products/hose-reel.png",
    images: ["/images/products/hose-reel.png", "/images/products/zx-grease-pump-catalog-3.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "hoseLength", value: { en: "10 m / 15 m", zh: "10m / 15m" } },
      { labelKey: "dimensions", value: { en: "440×440×300 mm", zh: "440×440×300mm" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "hoseLength", value: { en: "10 m / 15 m", zh: "10m / 15m" } },
      { labelKey: "dimensions", value: { en: "440×440×300 mm", zh: "440×440×300mm" } },
      { labelKey: "material", value: { en: "Iron plate + HP hose", zh: "铁盘 + 高压管" } },
      { labelKey: "connectingHose", value: { en: "1.5 m", zh: "1.5米" } },
    ],
  },
  {
    slug: "zx-810-pneumatic-grease-pump",
    partNumber: "ZX-810",
    name: {
      en: "Pneumatic Grease Pump 20L (50:1)",
      zh: "气动黄油机 20L（50:1）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "20L pneumatic grease pump on four casters. 50:1 ratio, 0.85 L/min, 15.3 kg.",
      zh: "20L 气动黄油机，四轮底座。压力比 50:1，输油量 0.85 L/min，设备重量 15.3kg。",
    },
    image: "/images/products/zx-810.png",
    images: ["/images/products/zx-810.png", "/images/products/zx-grease-pump-catalog-3.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "pressureRatio", value: { en: "50:1", zh: "50:1" } },
      { labelKey: "tankCapacity", value: { en: "20 L", zh: "20L" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "pressureRatio", value: { en: "50:1", zh: "50:1" } },
      { labelKey: "tankCapacity", value: { en: "20 L", zh: "20L" } },
      { labelKey: "dischargePressure", value: { en: "30–40 MPa", zh: "30-40 MPa" } },
      { labelKey: "intakeRange", value: { en: "0.6–0.8 MPa", zh: "0.6-0.8 MPa" } },
      { labelKey: "oilDelivery", value: { en: "0.85 L/min", zh: "0.85 L/min" } },
      { labelKey: "equipmentWeight", value: { en: "15.3 kg", zh: "15.3kg" } },
      { labelKey: "colors", value: { en: "Red, orange, yellow", zh: "红 / 橙 / 黄" } },
    ],
  },
  {
    slug: "zx-811-pneumatic-grease-pump",
    partNumber: "ZX-811",
    name: {
      en: "Pneumatic Grease Pump 12L (50:1)",
      zh: "气动黄油机 12L（50:1）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "12L pneumatic grease pump with two-wheel trolley. 50:1 ratio, 0.85 L/min, 11.9 kg.",
      zh: "12L 气动黄油机，两轮推车。压力比 50:1，输油量 0.85 L/min，设备重量 11.9kg。",
    },
    image: "/images/products/zx-811.png",
    images: ["/images/products/zx-811.png", "/images/products/zx-grease-pump-catalog-3.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "pressureRatio", value: { en: "50:1", zh: "50:1" } },
      { labelKey: "tankCapacity", value: { en: "12 L", zh: "12L" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "pressureRatio", value: { en: "50:1", zh: "50:1" } },
      { labelKey: "tankCapacity", value: { en: "12 L", zh: "12L" } },
      { labelKey: "dischargePressure", value: { en: "30–40 MPa", zh: "30-40 MPa" } },
      { labelKey: "intakeRange", value: { en: "0.6–0.8 MPa", zh: "0.6-0.8 MPa" } },
      { labelKey: "oilDelivery", value: { en: "0.85 L/min", zh: "0.85 L/min" } },
      { labelKey: "equipmentWeight", value: { en: "11.9 kg", zh: "11.9kg" } },
      { labelKey: "colors", value: { en: "Red, orange, yellow", zh: "红 / 橙 / 黄" } },
    ],
  },
  {
    slug: "lg-600-lithium-grease-gun-blue",
    partNumber: "LG-600B",
    name: {
      en: "Portable Lithium Grease Gun (Blue)",
      zh: "手提式锂电黄油枪（蓝）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "Cordless lithium grease gun, 600 cc, 400 mm overall length, about 30 cartridges per charge.",
      zh: "手提式锂电黄油枪，容量 600cc，总长 400mm，续航约 30 管油。",
    },
    image: "/images/products/lg-600-blue.png",
    images: ["/images/products/lg-600-blue.png", "/images/products/zx-grease-pump-catalog-4.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "capacity", value: { en: "600 cc", zh: "600cc" } },
      { labelKey: "powerSupply", value: { en: "Lithium battery", zh: "锂电池" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "capacity", value: { en: "600 cc", zh: "600cc" } },
      { labelKey: "totalLength", value: { en: "400 mm", zh: "400mm" } },
      { labelKey: "powerSupply", value: { en: "Lithium battery", zh: "锂电池" } },
      { labelKey: "endurance", value: { en: "Approx. 30 cartridges", zh: "约 30 管油" } },
      { labelKey: "colors", value: { en: "Blue", zh: "蓝" } },
    ],
  },
  {
    slug: "lg-600-lithium-grease-gun-yellow",
    partNumber: "LG-600Y",
    name: {
      en: "Portable Lithium Grease Gun 21V (Yellow)",
      zh: "手提式锂电黄油枪 21V（黄）",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "21V cordless lithium grease gun, 600 cc, 400 mm overall length, about 30 cartridges per charge.",
      zh: "21V 手提式锂电黄油枪，容量 600cc，总长 400mm，续航约 30 管油。",
    },
    image: "/images/products/lg-600-yellow.png",
    images: ["/images/products/lg-600-yellow.png", "/images/products/zx-grease-pump-catalog-4.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "capacity", value: { en: "600 cc", zh: "600cc" } },
      { labelKey: "voltage", value: { en: "21V", zh: "21V" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "capacity", value: { en: "600 cc", zh: "600cc" } },
      { labelKey: "totalLength", value: { en: "400 mm", zh: "400mm" } },
      { labelKey: "powerSupply", value: { en: "21V lithium battery", zh: "21V 锂电池" } },
      { labelKey: "endurance", value: { en: "Approx. 30 cartridges", zh: "约 30 管油" } },
      { labelKey: "colors", value: { en: "Yellow", zh: "黄" } },
    ],
  },
  {
    slug: "intelligent-timing-system",
    partNumber: "ITS-1",
    name: {
      en: "Intelligent Timing System",
      zh: "智能计时系统",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "Control box with digital timer, start/stop buttons and selector for automated lubrication timing.",
      zh: "智能计时控制箱，带数显、启停按钮与旋钮，用于自动注油计时。",
    },
    image: "/images/products/its-timer.png",
    images: ["/images/products/its-timer.png", "/images/products/zx-grease-pump-catalog-4.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "application", value: { en: "Auto lube timing", zh: "自动注油计时" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Lubrication timing control", zh: "注油计时控制" } },
    ],
  },
  {
    slug: "alloy-universal-gun",
    partNumber: "AUG-1",
    name: {
      en: "Alloy Universal Grease Gun",
      zh: "合金万向枪",
    },
    categorySlug: "lubrication-parts",
    brands: ["Songyu"],
    description: {
      en: "Alloy swivel grease nozzle with trigger handle for multi-angle lubrication points.",
      zh: "合金万向注油枪，扳机手柄，适合多角度润滑点。",
    },
    image: "/images/products/alloy-gun.png",
    images: ["/images/products/alloy-gun.png", "/images/products/zx-grease-pump-catalog-4.png"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "material", value: { en: "Alloy", zh: "合金" } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "material", value: { en: "Alloy / brass fittings", zh: "合金 / 铜接头" } },
      { labelKey: "application", value: { en: "Multi-angle grease points", zh: "多角度注油点" } },
    ],
  },
  {
    slug: "rad-sdlg-953-2",
    partNumber: "RAD-SDLG-953-2",
    name: {
      en: "SDLG 953-2 Radiator",
      zh: "临工953-2 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["SDLG"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for SDLG 953-2. 930×1000 mm, water ports top-right / bottom-right Ø45.",
      zh: "防漏抗震型散热器，适配临工953-2。尺寸 930×1000mm，水口上右下右45。",
    },
    image: "/images/products/rad-sdlg-953-2.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "SDLG 953-2", zh: "临工953-2" } },
      { labelKey: "dimensions", value: { en: "930×1000 mm", zh: "930×1000mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom right Ø45", zh: "上右下右45" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "SDLG 953-2", zh: "临工953-2" } },
      { labelKey: "dimensions", value: { en: "930×1000 mm", zh: "930×1000mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom right Ø45", zh: "上右下右45" } },
    ],
    compatibleMachines: "SDLG 953-2",
  },
  {
    slug: "rad-xcmg-321",
    partNumber: "RAD-XCMG-321",
    name: {
      en: "XCMG 321 Radiator",
      zh: "徐工321 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["XCMG"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for XCMG 321. 760×860 mm, water ports top-right / bottom-left bent Ø45.",
      zh: "防漏抗震型散热器，适配徐工321。尺寸 760×860mm，水口上右下左弯45。",
    },
    image: "/images/products/rad-xcmg-321.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "XCMG 321", zh: "徐工321" } },
      { labelKey: "dimensions", value: { en: "760×860 mm", zh: "760×860mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom left bent Ø45", zh: "上右下左弯45" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "XCMG 321", zh: "徐工321" } },
      { labelKey: "dimensions", value: { en: "760×860 mm", zh: "760×860mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom left bent Ø45", zh: "上右下左弯45" } },
    ],
    compatibleMachines: "XCMG 321",
  },
  {
    slug: "rad-xcmg-50gl",
    partNumber: "RAD-XCMG-50GL",
    name: {
      en: "XCMG 50GL Radiator",
      zh: "徐工50GL 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["XCMG"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for XCMG 50GL. 900×1070 mm, water ports top-right Ø55 / bottom-center Ø58.",
      zh: "防漏抗震型散热器，适配徐工50GL。尺寸 900×1070mm，水口上右55下中58。",
    },
    image: "/images/products/rad-xcmg-50gl.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "XCMG 50GL", zh: "徐工50GL" } },
      { labelKey: "dimensions", value: { en: "900×1070 mm", zh: "900×1070mm" } },
      { labelKey: "waterPort", value: { en: "Top right Ø55 / bottom center Ø58", zh: "上右55下中58" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "XCMG 50GL", zh: "徐工50GL" } },
      { labelKey: "dimensions", value: { en: "900×1070 mm", zh: "900×1070mm" } },
      { labelKey: "waterPort", value: { en: "Top right Ø55 / bottom center Ø58", zh: "上右55下中58" } },
    ],
    compatibleMachines: "XCMG 50GL",
  },
  {
    slug: "rad-xgma-955",
    partNumber: "RAD-XGMA-955",
    name: {
      en: "XGMA 955 Radiator",
      zh: "厦工955 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["XGMA"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for XGMA 955. 860×1060 mm, water ports top-left / bottom-right bent Ø58.",
      zh: "防漏抗震型散热器，适配厦工955。尺寸 860×1060mm，水口上左下右弯58。",
    },
    image: "/images/products/rad-xgma-955.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "XGMA 955", zh: "厦工955" } },
      { labelKey: "dimensions", value: { en: "860×1060 mm", zh: "860×1060mm" } },
      { labelKey: "waterPort", value: { en: "Top left / bottom right bent Ø58", zh: "上左下右弯58" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "XGMA 955", zh: "厦工955" } },
      { labelKey: "dimensions", value: { en: "860×1060 mm", zh: "860×1060mm" } },
      { labelKey: "waterPort", value: { en: "Top left / bottom right bent Ø58", zh: "上左下右弯58" } },
    ],
    compatibleMachines: "XGMA 955",
  },
  {
    slug: "rad-sdlg-953",
    partNumber: "RAD-SDLG-953",
    name: {
      en: "SDLG 953 Radiator",
      zh: "临工953 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["SDLG"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for SDLG 953. 900×1040 mm, water ports top-right / bottom-right Ø45.",
      zh: "防漏抗震型散热器，适配临工953。尺寸 900×1040mm，水口上右下右45。",
    },
    image: "/images/products/rad-sdlg-953.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "SDLG 953", zh: "临工953" } },
      { labelKey: "dimensions", value: { en: "900×1040 mm", zh: "900×1040mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom right Ø45", zh: "上右下右45" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "SDLG 953", zh: "临工953" } },
      { labelKey: "dimensions", value: { en: "900×1040 mm", zh: "900×1040mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom right Ø45", zh: "上右下右45" } },
    ],
    compatibleMachines: "SDLG 953",
  },
  {
    slug: "rad-daewoo-500-7",
    partNumber: "RAD-DAEWOO-500-7",
    name: {
      en: "Daewoo 500-7 Radiator",
      zh: "大宇500-7 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Daewoo 500-7. 1125×1280 mm, water ports top-left / bottom-right Ø58.",
      zh: "防漏抗震型散热器，适配大宇500-7。尺寸 1125×1280mm，水口上左下右58。",
    },
    image: "/images/products/rad-daewoo-500-7.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Daewoo 500-7", zh: "大宇500-7" } },
      { labelKey: "dimensions", value: { en: "1125×1280 mm", zh: "1125×1280mm" } },
      { labelKey: "waterPort", value: { en: "Top left / bottom right Ø58", zh: "上左下右58" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Daewoo 500-7", zh: "大宇500-7" } },
      { labelKey: "dimensions", value: { en: "1125×1280 mm", zh: "1125×1280mm" } },
      { labelKey: "waterPort", value: { en: "Top left / bottom right Ø58", zh: "上左下右58" } },
    ],
    compatibleMachines: "Daewoo 500-7",
  },
  {
    slug: "rad-xcmg-300f",
    partNumber: "RAD-XCMG-300F",
    name: {
      en: "XCMG 300F Radiator",
      zh: "徐工300F 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["XCMG"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for XCMG 300F. 760×920 mm, water ports top-right / bottom-left bent Ø45.",
      zh: "防漏抗震型散热器，适配徐工300F。尺寸 760×920mm，水口上右下左弯45。",
    },
    image: "/images/products/rad-xcmg-300f.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "XCMG 300F", zh: "徐工300F" } },
      { labelKey: "dimensions", value: { en: "760×920 mm", zh: "760×920mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom left bent Ø45", zh: "上右下左弯45" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "XCMG 300F", zh: "徐工300F" } },
      { labelKey: "dimensions", value: { en: "760×920 mm", zh: "760×920mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom left bent Ø45", zh: "上右下左弯45" } },
    ],
    compatibleMachines: "XCMG 300F",
  },
  {
    slug: "rad-sdlg-936",
    partNumber: "RAD-SDLG-936",
    name: {
      en: "SDLG 936 Radiator",
      zh: "临工936 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["SDLG"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for SDLG 936. 760×990 mm, water ports top-right / bottom-left bent Ø45.",
      zh: "防漏抗震型散热器，适配临工936。尺寸 760×990mm，水口上右下左弯45。",
    },
    image: "/images/products/rad-sdlg-936.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "SDLG 936", zh: "临工936" } },
      { labelKey: "dimensions", value: { en: "760×990 mm", zh: "760×990mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom left bent Ø45", zh: "上右下左弯45" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "SDLG 936", zh: "临工936" } },
      { labelKey: "dimensions", value: { en: "760×990 mm", zh: "760×990mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom left bent Ø45", zh: "上右下左弯45" } },
    ],
    compatibleMachines: "SDLG 936",
  },
  {
    slug: "rad-liugong-50cn",
    partNumber: "RAD-LIUGONG-50CN",
    name: {
      en: "Liugong 50CN Radiator",
      zh: "柳工50CN 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Liugong"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Liugong 50CN. 880×990 mm, water ports top-right / bottom-right Ø50.",
      zh: "防漏抗震型散热器，适配柳工50CN。尺寸 880×990mm，水口上右下右50。",
    },
    image: "/images/products/rad-liugong-50cn.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Liugong 50CN", zh: "柳工50CN" } },
      { labelKey: "dimensions", value: { en: "880×990 mm", zh: "880×990mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom right Ø50", zh: "上右下右50" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Liugong 50CN", zh: "柳工50CN" } },
      { labelKey: "dimensions", value: { en: "880×990 mm", zh: "880×990mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom right Ø50", zh: "上右下右50" } },
    ],
    compatibleMachines: "Liugong 50CN",
  },
  {
    slug: "rad-changlin-956",
    partNumber: "RAD-CHANGLIN-956",
    name: {
      en: "Changlin 956 Radiator",
      zh: "常林956 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Changlin"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Changlin 956. 930×1040 mm, water ports top-right / bottom-right Ø45.",
      zh: "防漏抗震型散热器，适配常林956。尺寸 930×1040mm，水口上右下右45。",
    },
    image: "/images/products/rad-changlin-956.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Changlin 956", zh: "常林956" } },
      { labelKey: "dimensions", value: { en: "930×1040 mm", zh: "930×1040mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom right Ø45", zh: "上右下右45" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Changlin 956", zh: "常林956" } },
      { labelKey: "dimensions", value: { en: "930×1040 mm", zh: "930×1040mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom right Ø45", zh: "上右下右45" } },
    ],
    compatibleMachines: "Changlin 956",
  },
  {
    slug: "rad-xcmg-500f",
    partNumber: "RAD-XCMG-500F",
    name: {
      en: "XCMG 500F Radiator",
      zh: "徐工500F 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["XCMG"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for XCMG 500F. 900×1050 mm, water ports top-right Ø58 / bottom-left Ø50.",
      zh: "防漏抗震型散热器，适配徐工500F。尺寸 900×1050mm，水口上右58下左50。",
    },
    image: "/images/products/rad-xcmg-500f.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "XCMG 500F", zh: "徐工500F" } },
      { labelKey: "dimensions", value: { en: "900×1050 mm", zh: "900×1050mm" } },
      { labelKey: "waterPort", value: { en: "Top right Ø58 / bottom left Ø50", zh: "上右58下左50" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "XCMG 500F", zh: "徐工500F" } },
      { labelKey: "dimensions", value: { en: "900×1050 mm", zh: "900×1050mm" } },
      { labelKey: "waterPort", value: { en: "Top right Ø58 / bottom left Ø50", zh: "上右58下左50" } },
    ],
    compatibleMachines: "XCMG 500F",
  },
  {
    slug: "rad-xcmg-500k",
    partNumber: "RAD-XCMG-500K",
    name: {
      en: "XCMG 500K Radiator",
      zh: "徐工500K 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["XCMG"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for XCMG 500K. 900×1080 mm, water ports top-right / bottom-left Ø50.",
      zh: "防漏抗震型散热器，适配徐工500K。尺寸 900×1080mm，水口上右下左50。",
    },
    image: "/images/products/rad-xcmg-500k.png",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "XCMG 500K", zh: "徐工500K" } },
      { labelKey: "dimensions", value: { en: "900×1080 mm", zh: "900×1080mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom left Ø50", zh: "上右下左50" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "XCMG 500K", zh: "徐工500K" } },
      { labelKey: "dimensions", value: { en: "900×1080 mm", zh: "900×1080mm" } },
      { labelKey: "waterPort", value: { en: "Top right / bottom left Ø50", zh: "上右下左50" } },
    ],
    compatibleMachines: "XCMG 500K",
  },
  {
    slug: "rad-dh55-5",
    partNumber: "RAD-DH55-5",
    name: {
      en: "Doosan DH55-5 Radiator",
      zh: "斗山DH55-5 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Doosan DH55-5. 500×765×85 mm, core 3排16波8.",
      zh: "防漏抗震型散热器，适配斗山DH55-5。尺寸 500×765×85mm，规格 3排16波8。",
    },
    image: "/images/products/rad-dh55-5.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Doosan DH55-5", zh: "斗山DH55-5" } },
      { labelKey: "dimensions", value: { en: "500×765×85 mm", zh: "500×765×85mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Doosan DH55-5", zh: "斗山DH55-5" } },
      { labelKey: "dimensions", value: { en: "500×765×85 mm", zh: "500×765×85mm" } },
    ],
    compatibleMachines: "Doosan DH55-5",
  },
  {
    slug: "rad-dh55-7",
    partNumber: "RAD-DH55-7",
    name: {
      en: "Doosan DH55-7 Radiator",
      zh: "斗山DH55-7 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Doosan DH55-7. 495×760×65 mm, core 2排22波8.",
      zh: "防漏抗震型散热器，适配斗山DH55-7。尺寸 495×760×65mm，规格 2排22波8。",
    },
    image: "/images/products/rad-dh55-7.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Doosan DH55-7", zh: "斗山DH55-7" } },
      { labelKey: "dimensions", value: { en: "495×760×65 mm", zh: "495×760×65mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Doosan DH55-7", zh: "斗山DH55-7" } },
      { labelKey: "dimensions", value: { en: "495×760×65 mm", zh: "495×760×65mm" } },
    ],
    compatibleMachines: "Doosan DH55-7",
  },
  {
    slug: "rad-dh55-7-new",
    partNumber: "RAD-DH55-7-NEW",
    name: {
      en: "Doosan DH55-7 Radiator (new type)",
      zh: "斗山DH55-7 散热器（新款）",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Doosan DH55-7, new type. 495×760×60 mm, core 2排22波8.",
      zh: "防漏抗震型散热器，适配斗山DH55-7 新款。尺寸 495×760×60mm，规格 2排22波8。",
    },
    image: "/images/products/rad-dh55-7-new.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Doosan DH55-7 (new type)", zh: "斗山DH55-7 新款" } },
      { labelKey: "dimensions", value: { en: "495×760×60 mm", zh: "495×760×60mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Doosan DH55-7 (new type)", zh: "斗山DH55-7 新款" } },
      { labelKey: "dimensions", value: { en: "495×760×60 mm", zh: "495×760×60mm" } },
    ],
    compatibleMachines: "Doosan DH55-7",
  },
  {
    slug: "rad-dh60-7-old",
    partNumber: "RAD-DH60-7-OLD",
    name: {
      en: "Doosan DH60-7 Radiator (old type)",
      zh: "斗山DH60-7 散热器（老款）",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Doosan DH60-7, old type. 495×765×70 mm, core 3排16波8.",
      zh: "防漏抗震型散热器，适配斗山DH60-7 老款。尺寸 495×765×70mm，规格 3排16波8。",
    },
    image: "/images/products/rad-dh60-7-old.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Doosan DH60-7 (old type)", zh: "斗山DH60-7 老款" } },
      { labelKey: "dimensions", value: { en: "495×765×70 mm", zh: "495×765×70mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Doosan DH60-7 (old type)", zh: "斗山DH60-7 老款" } },
      { labelKey: "dimensions", value: { en: "495×765×70 mm", zh: "495×765×70mm" } },
    ],
    compatibleMachines: "Doosan DH60-7",
  },
  {
    slug: "rad-dh60-7-new",
    partNumber: "RAD-DH60-7-NEW",
    name: {
      en: "Doosan DH60-7 Radiator (new type)",
      zh: "斗山DH60-7 散热器（新款）",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Doosan DH60-7, new type. 500×760×70 mm, core 3排16波8.",
      zh: "防漏抗震型散热器，适配斗山DH60-7 新款。尺寸 500×760×70mm，规格 3排16波8。",
    },
    image: "/images/products/rad-dh60-7-new.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Doosan DH60-7 (new type)", zh: "斗山DH60-7 新款" } },
      { labelKey: "dimensions", value: { en: "500×760×70 mm", zh: "500×760×70mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Doosan DH60-7 (new type)", zh: "斗山DH60-7 新款" } },
      { labelKey: "dimensions", value: { en: "500×760×70 mm", zh: "500×760×70mm" } },
    ],
    compatibleMachines: "Doosan DH60-7",
  },
  {
    slug: "rad-dh80-7-old",
    partNumber: "RAD-DH80-7-OLD",
    name: {
      en: "Doosan DH80-7 Radiator (old type)",
      zh: "斗山DH80-7 散热器（老款）",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Doosan DH80-7, old type. 510×770×90 mm, core 3排16波8.",
      zh: "防漏抗震型散热器，适配斗山DH80-7 老款。尺寸 510×770×90mm，规格 3排16波8。",
    },
    image: "/images/products/rad-dh80-7-old.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Doosan DH80-7 (old type)", zh: "斗山DH80-7 老款" } },
      { labelKey: "dimensions", value: { en: "510×770×90 mm", zh: "510×770×90mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Doosan DH80-7 (old type)", zh: "斗山DH80-7 老款" } },
      { labelKey: "dimensions", value: { en: "510×770×90 mm", zh: "510×770×90mm" } },
    ],
    compatibleMachines: "Doosan DH80-7",
  },
  {
    slug: "rad-dh80-7-new",
    partNumber: "RAD-DH80-7-NEW",
    name: {
      en: "Doosan DH80-7 Radiator (new type)",
      zh: "斗山DH80-7 散热器（新款）",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Doosan DH80-7, new type. 490×770×65 mm, core 3排16波8.",
      zh: "防漏抗震型散热器，适配斗山DH80-7 新款。尺寸 490×770×65mm，规格 3排16波8。",
    },
    image: "/images/products/rad-dh80-7-new.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Doosan DH80-7 (new type)", zh: "斗山DH80-7 新款" } },
      { labelKey: "dimensions", value: { en: "490×770×65 mm", zh: "490×770×65mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Doosan DH80-7 (new type)", zh: "斗山DH80-7 新款" } },
      { labelKey: "dimensions", value: { en: "490×770×65 mm", zh: "490×770×65mm" } },
    ],
    compatibleMachines: "Doosan DH80-7",
  },
  {
    slug: "rad-dh130-7",
    partNumber: "RAD-DH130-7",
    name: {
      en: "Doosan DH130-7 Radiator",
      zh: "斗山DH130-7 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Doosan DH130-7. 770×910×140 mm, core 4排22波8.",
      zh: "防漏抗震型散热器，适配斗山DH130-7。尺寸 770×910×140mm，规格 4排22波8。",
    },
    image: "/images/products/rad-dh130-7.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Doosan DH130-7", zh: "斗山DH130-7" } },
      { labelKey: "dimensions", value: { en: "770×910×140 mm", zh: "770×910×140mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Doosan DH130-7", zh: "斗山DH130-7" } },
      { labelKey: "dimensions", value: { en: "770×910×140 mm", zh: "770×910×140mm" } },
    ],
    compatibleMachines: "Doosan DH130-7",
  },
  {
    slug: "rad-dh150-7",
    partNumber: "RAD-DH150-7",
    name: {
      en: "Doosan DH150-7 Radiator",
      zh: "斗山DH150-7 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Doosan", "Daewoo"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Doosan DH150-7. 720×885×105 mm, core 4排16波8.",
      zh: "防漏抗震型散热器，适配斗山DH150-7。尺寸 720×885×105mm，规格 4排16波8。",
    },
    image: "/images/products/rad-dh150-7.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Doosan DH150-7", zh: "斗山DH150-7" } },
      { labelKey: "dimensions", value: { en: "720×885×105 mm", zh: "720×885×105mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Doosan DH150-7", zh: "斗山DH150-7" } },
      { labelKey: "dimensions", value: { en: "720×885×105 mm", zh: "720×885×105mm" } },
    ],
    compatibleMachines: "Doosan DH150-7",
  },
  {
    slug: "rad-sk60-3",
    partNumber: "RAD-SK60-3",
    name: {
      en: "Kobelco SK60-3 Radiator",
      zh: "神钢SK60-3 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK60-3. 490×650×80 mm, core 3排16波8.",
      zh: "防漏抗震型散热器，适配神钢SK60-3。尺寸 490×650×80mm，规格 3排16波8。",
    },
    image: "/images/products/rad-sk60-3.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK60-3", zh: "神钢SK60-3" } },
      { labelKey: "dimensions", value: { en: "490×650×80 mm", zh: "490×650×80mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK60-3", zh: "神钢SK60-3" } },
      { labelKey: "dimensions", value: { en: "490×650×80 mm", zh: "490×650×80mm" } },
    ],
    compatibleMachines: "Kobelco SK60-3",
  },
  {
    slug: "rad-sk120-5",
    partNumber: "RAD-SK120-5",
    name: {
      en: "Kobelco SK120-5 Radiator",
      zh: "神钢SK120-5 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK120-5. 580×850×100 mm, core 3排18波8.",
      zh: "防漏抗震型散热器，适配神钢SK120-5。尺寸 580×850×100mm，规格 3排18波8。",
    },
    image: "/images/products/rad-sk120-5.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK120-5", zh: "神钢SK120-5" } },
      { labelKey: "dimensions", value: { en: "580×850×100 mm", zh: "580×850×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK120-5", zh: "神钢SK120-5" } },
      { labelKey: "dimensions", value: { en: "580×850×100 mm", zh: "580×850×100mm" } },
    ],
    compatibleMachines: "Kobelco SK120-5",
  },
  {
    slug: "rad-sk140-8",
    partNumber: "RAD-SK140-8",
    name: {
      en: "Kobelco SK140-8 Radiator",
      zh: "神钢SK140-8 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK140-8. 295×970×120 mm, core 4排22波6.",
      zh: "防漏抗震型散热器，适配神钢SK140-8。尺寸 295×970×120mm，规格 4排22波6。",
    },
    image: "/images/products/rad-sk140-8.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK140-8", zh: "神钢SK140-8" } },
      { labelKey: "dimensions", value: { en: "295×970×120 mm", zh: "295×970×120mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK140-8", zh: "神钢SK140-8" } },
      { labelKey: "dimensions", value: { en: "295×970×120 mm", zh: "295×970×120mm" } },
    ],
    compatibleMachines: "Kobelco SK140-8",
  },
  {
    slug: "rad-sk200-3",
    partNumber: "RAD-SK200-3",
    name: {
      en: "Kobelco SK200-3 Radiator",
      zh: "神钢SK200-3 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200-3. 760×880×100 mm, core 4排16波8.",
      zh: "防漏抗震型散热器，适配神钢SK200-3。尺寸 760×880×100mm，规格 4排16波8。",
    },
    image: "/images/products/rad-sk200-3.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200-3", zh: "神钢SK200-3" } },
      { labelKey: "dimensions", value: { en: "760×880×100 mm", zh: "760×880×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200-3", zh: "神钢SK200-3" } },
      { labelKey: "dimensions", value: { en: "760×880×100 mm", zh: "760×880×100mm" } },
    ],
    compatibleMachines: "Kobelco SK200-3",
  },
  {
    slug: "rad-sk200-5",
    partNumber: "RAD-SK200-5",
    name: {
      en: "Kobelco SK200-5 Radiator",
      zh: "神钢SK200-5 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200-5. 760×980×100 mm, core 4排16波8.",
      zh: "防漏抗震型散热器，适配神钢SK200-5。尺寸 760×980×100mm，规格 4排16波8。",
    },
    image: "/images/products/rad-sk200-5.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200-5", zh: "神钢SK200-5" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200-5", zh: "神钢SK200-5" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    compatibleMachines: "Kobelco SK200-5",
  },
  {
    slug: "rad-sk200-6",
    partNumber: "RAD-SK200-6",
    name: {
      en: "Kobelco SK200-6 Radiator",
      zh: "神钢SK200-6 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200-6. 760×980×100 mm, core 4排16波8.",
      zh: "防漏抗震型散热器，适配神钢SK200-6。尺寸 760×980×100mm，规格 4排16波8。",
    },
    image: "/images/products/rad-sk200-6.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200-6", zh: "神钢SK200-6" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200-6", zh: "神钢SK200-6" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    compatibleMachines: "Kobelco SK200-6",
  },
  {
    slug: "rad-sk200-6e-230e",
    partNumber: "RAD-SK200-6E-230E",
    name: {
      en: "Kobelco SK200-6E / 230E Radiator",
      zh: "神钢SK200-6E / 230E 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200-6E / 230E. 760×980×100 mm, core 4排16波8.",
      zh: "防漏抗震型散热器，适配神钢SK200-6E / 230E。尺寸 760×980×100mm，规格 4排16波8。",
    },
    image: "/images/products/rad-sk200-6e-230e.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200-6E / 230E", zh: "神钢SK200-6E / 230E" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200-6E / 230E", zh: "神钢SK200-6E / 230E" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    compatibleMachines: "Kobelco SK200-6E / 230E",
  },
  {
    slug: "rad-sk200-8-a",
    partNumber: "RAD-SK200-8-A",
    name: {
      en: "Kobelco SK200-8 Radiator (320×985×120)",
      zh: "神钢SK200-8 散热器（320×985×120）",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200-8 (320×985×120). 320×985×120 mm, core 4排22波6.5.",
      zh: "防漏抗震型散热器，适配神钢SK200-8（320×985×120）。尺寸 320×985×120mm，规格 4排22波6.5。",
    },
    image: "/images/products/rad-sk200-8-a.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200-8 (320×985×120)", zh: "神钢SK200-8（320×985×120）" } },
      { labelKey: "dimensions", value: { en: "320×985×120 mm", zh: "320×985×120mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200-8 (320×985×120)", zh: "神钢SK200-8（320×985×120）" } },
      { labelKey: "dimensions", value: { en: "320×985×120 mm", zh: "320×985×120mm" } },
    ],
    compatibleMachines: "Kobelco SK200-8 (320×985×120)",
  },
  {
    slug: "rad-sk200-8-b",
    partNumber: "RAD-SK200-8-B",
    name: {
      en: "Kobelco SK200-8 Radiator (370×1210×140)",
      zh: "神钢SK200-8 散热器（370×1210×140）",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200-8 (370×1210×140). 370×1210×140 mm, core 5排22波6.5.",
      zh: "防漏抗震型散热器，适配神钢SK200-8（370×1210×140）。尺寸 370×1210×140mm，规格 5排22波6.5。",
    },
    image: "/images/products/rad-sk200-8-b.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200-8 (370×1210×140)", zh: "神钢SK200-8（370×1210×140）" } },
      { labelKey: "dimensions", value: { en: "370×1210×140 mm", zh: "370×1210×140mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200-8 (370×1210×140)", zh: "神钢SK200-8（370×1210×140）" } },
      { labelKey: "dimensions", value: { en: "370×1210×140 mm", zh: "370×1210×140mm" } },
    ],
    compatibleMachines: "Kobelco SK200-8 (370×1210×140)",
  },
  {
    slug: "rad-sk220-3",
    partNumber: "RAD-SK220-3",
    name: {
      en: "Kobelco SK220-3 Radiator",
      zh: "神钢SK220-3 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK220-3. 720×955×100 mm, core 4排16波8.",
      zh: "防漏抗震型散热器，适配神钢SK220-3。尺寸 720×955×100mm，规格 4排16波8。",
    },
    image: "/images/products/rad-sk220-3.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK220-3", zh: "神钢SK220-3" } },
      { labelKey: "dimensions", value: { en: "720×955×100 mm", zh: "720×955×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK220-3", zh: "神钢SK220-3" } },
      { labelKey: "dimensions", value: { en: "720×955×100 mm", zh: "720×955×100mm" } },
    ],
    compatibleMachines: "Kobelco SK220-3",
  },
  {
    slug: "rad-sk250-3",
    partNumber: "RAD-SK250-3",
    name: {
      en: "Kobelco SK250-3 Radiator",
      zh: "神钢SK250-3 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK250-3. 720×990×90 mm, core 3排18波8.",
      zh: "防漏抗震型散热器，适配神钢SK250-3。尺寸 720×990×90mm，规格 3排18波8。",
    },
    image: "/images/products/rad-sk250-3.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK250-3", zh: "神钢SK250-3" } },
      { labelKey: "dimensions", value: { en: "720×990×90 mm", zh: "720×990×90mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK250-3", zh: "神钢SK250-3" } },
      { labelKey: "dimensions", value: { en: "720×990×90 mm", zh: "720×990×90mm" } },
    ],
    compatibleMachines: "Kobelco SK250-3",
  },
  {
    slug: "rad-sk300-3",
    partNumber: "RAD-SK300-3",
    name: {
      en: "Kobelco SK300-3 Radiator",
      zh: "神钢SK300-3 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK300-3. 920×1110×110 mm, core 4排16波8.",
      zh: "防漏抗震型散热器，适配神钢SK300-3。尺寸 920×1110×110mm，规格 4排16波8。",
    },
    image: "/images/products/rad-sk300-3.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK300-3", zh: "神钢SK300-3" } },
      { labelKey: "dimensions", value: { en: "920×1110×110 mm", zh: "920×1110×110mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK300-3", zh: "神钢SK300-3" } },
      { labelKey: "dimensions", value: { en: "920×1110×110 mm", zh: "920×1110×110mm" } },
    ],
    compatibleMachines: "Kobelco SK300-3",
  },
  {
    slug: "rad-sk330-6",
    partNumber: "RAD-SK330-6",
    name: {
      en: "Kobelco SK330-6 Radiator",
      zh: "神钢SK330-6 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK330-6. 920×1200×155 mm, core 5排22波6.",
      zh: "防漏抗震型散热器，适配神钢SK330-6。尺寸 920×1200×155mm，规格 5排22波6。",
    },
    image: "/images/products/rad-sk330-6.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK330-6", zh: "神钢SK330-6" } },
      { labelKey: "dimensions", value: { en: "920×1200×155 mm", zh: "920×1200×155mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK330-6", zh: "神钢SK330-6" } },
      { labelKey: "dimensions", value: { en: "920×1200×155 mm", zh: "920×1200×155mm" } },
    ],
    compatibleMachines: "Kobelco SK330-6",
  },
  {
    slug: "rad-sk350-6e",
    partNumber: "RAD-SK350-6E",
    name: {
      en: "Kobelco SK350-6E Radiator",
      zh: "神钢SK350-6E 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK350-6E. 940×1200×120 mm, core 4排18波8.",
      zh: "防漏抗震型散热器，适配神钢SK350-6E。尺寸 940×1200×120mm，规格 4排18波8。",
    },
    image: "/images/products/rad-sk350-6e.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK350-6E", zh: "神钢SK350-6E" } },
      { labelKey: "dimensions", value: { en: "940×1200×120 mm", zh: "940×1200×120mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK350-6E", zh: "神钢SK350-6E" } },
      { labelKey: "dimensions", value: { en: "940×1200×120 mm", zh: "940×1200×120mm" } },
    ],
    compatibleMachines: "Kobelco SK350-6E",
  },
  {
    slug: "rad-sk350-8",
    partNumber: "RAD-SK350-8",
    name: {
      en: "Kobelco SK350-8 Radiator",
      zh: "神钢SK350-8 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK350-8. 370×1210×140 mm, core 5排22波6.5.",
      zh: "防漏抗震型散热器，适配神钢SK350-8。尺寸 370×1210×140mm，规格 5排22波6.5。",
    },
    image: "/images/products/rad-sk350-8.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK350-8", zh: "神钢SK350-8" } },
      { labelKey: "dimensions", value: { en: "370×1210×140 mm", zh: "370×1210×140mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK350-8", zh: "神钢SK350-8" } },
      { labelKey: "dimensions", value: { en: "370×1210×140 mm", zh: "370×1210×140mm" } },
    ],
    compatibleMachines: "Kobelco SK350-8",
  },
  {
    slug: "rad-lg225",
    partNumber: "RAD-LG225",
    name: {
      en: "Liugong 225 Radiator",
      zh: "柳工225 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Liugong"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Liugong 225. 840×965×195 mm, core 4排16波8.",
      zh: "防漏抗震型散热器，适配柳工225。尺寸 840×965×195mm，规格 4排16波8。",
    },
    image: "/images/products/rad-lg225.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Liugong 225", zh: "柳工225" } },
      { labelKey: "dimensions", value: { en: "840×965×195 mm", zh: "840×965×195mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Liugong 225", zh: "柳工225" } },
      { labelKey: "dimensions", value: { en: "840×965×195 mm", zh: "840×965×195mm" } },
    ],
    compatibleMachines: "Liugong 225",
  },
  {
    slug: "rad-lg225c",
    partNumber: "RAD-LG225C",
    name: {
      en: "Liugong 225C Radiator",
      zh: "柳工225C 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Liugong"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Liugong 225C. 760×920×120 mm, core 4排18波8.",
      zh: "防漏抗震型散热器，适配柳工225C。尺寸 760×920×120mm，规格 4排18波8。",
    },
    image: "/images/products/rad-lg225c.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Liugong 225C", zh: "柳工225C" } },
      { labelKey: "dimensions", value: { en: "760×920×120 mm", zh: "760×920×120mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Liugong 225C", zh: "柳工225C" } },
      { labelKey: "dimensions", value: { en: "760×920×120 mm", zh: "760×920×120mm" } },
    ],
    compatibleMachines: "Liugong 225C",
  },
  {
    slug: "rad-lg906c",
    partNumber: "RAD-LG906C",
    name: {
      en: "Liugong 906C Radiator",
      zh: "柳工906C 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Liugong"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Liugong 906C. 620×810×85 mm, core 3排18波8.",
      zh: "防漏抗震型散热器，适配柳工906C。尺寸 620×810×85mm，规格 3排18波8。",
    },
    image: "/images/products/rad-lg906c.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Liugong 906C", zh: "柳工906C" } },
      { labelKey: "dimensions", value: { en: "620×810×85 mm", zh: "620×810×85mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Liugong 906C", zh: "柳工906C" } },
      { labelKey: "dimensions", value: { en: "620×810×85 mm", zh: "620×810×85mm" } },
    ],
    compatibleMachines: "Liugong 906C",
  },
  {
    slug: "rad-lg908c",
    partNumber: "RAD-LG908C",
    name: {
      en: "Liugong 908C Radiator",
      zh: "柳工908C 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Liugong"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Liugong 908C. 720×740×100 mm, core 3排16波8.",
      zh: "防漏抗震型散热器，适配柳工908C。尺寸 720×740×100mm，规格 3排16波8。",
    },
    image: "/images/products/rad-lg908c.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Liugong 908C", zh: "柳工908C" } },
      { labelKey: "dimensions", value: { en: "720×740×100 mm", zh: "720×740×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Liugong 908C", zh: "柳工908C" } },
      { labelKey: "dimensions", value: { en: "720×740×100 mm", zh: "720×740×100mm" } },
    ],
    compatibleMachines: "Liugong 908C",
  },
  {
    slug: "rad-sk200-6e-plastic",
    partNumber: "RAD-SK200-6E-PLASTIC",
    name: {
      en: "Kobelco SK200-6E Radiator (aluminium-plastic tank)",
      zh: "神钢SK200-6E 散热器（铝塑）",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200-6E. 760×980×100 mm, core 3排18波8.",
      zh: "防漏抗震型散热器，适配神钢SK200-6E。尺寸 760×980×100mm，规格 3排18波8。",
    },
    image: "/images/products/rad-sk200-6e-plastic.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200-6E", zh: "神钢SK200-6E" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium-plastic tank, aluminium core", zh: "铝塑水室，芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200-6E", zh: "神钢SK200-6E" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    compatibleMachines: "Kobelco SK200-6E",
  },
  {
    slug: "rad-sk200sr-plastic",
    partNumber: "RAD-SK200SR-PLASTIC",
    name: {
      en: "Kobelco SK200SR Radiator (aluminium-plastic tank)",
      zh: "神钢SK200SR 散热器（铝塑）",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200SR. 760×980×100 mm, core 3排18波8.",
      zh: "防漏抗震型散热器，适配神钢SK200SR。尺寸 760×980×100mm，规格 3排18波8。",
    },
    image: "/images/products/rad-sk200sr-plastic.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200SR", zh: "神钢SK200SR" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium-plastic tank, aluminium core", zh: "铝塑水室，芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200SR", zh: "神钢SK200SR" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    compatibleMachines: "Kobelco SK200SR",
  },
  {
    slug: "rad-sk200-6e-cast",
    partNumber: "RAD-SK200-6E-CAST",
    name: {
      en: "Kobelco SK200-6E / 230 Radiator (cast aluminium tank)",
      zh: "神钢SK200-6E / 230 散热器（铸铝）",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200-6E / 230. 760×980×100 mm, core 3排18波8.",
      zh: "防漏抗震型散热器，适配神钢SK200-6E / 230。尺寸 760×980×100mm，规格 3排18波8。",
    },
    image: "/images/products/rad-sk200-6e-cast.jpg",
    images: [
      "/images/products/rad-sk200-6e-cast.jpg",
      "/images/products/rad-sk200-6e-alt.jpg",
    ],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200-6E / 230", zh: "神钢SK200-6E / 230" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Cast aluminium tank, aluminium core", zh: "铸铝水室，芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200-6E / 230", zh: "神钢SK200-6E / 230" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    compatibleMachines: "Kobelco SK200-6E / 230",
  },
  {
    slug: "rad-yc20-1",
    partNumber: "RAD-YC20-1",
    name: {
      en: "Yuchai 20-1 Radiator",
      zh: "玉柴20-1 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Yuchai"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Yuchai 20-1. 370×430×50 mm, core 2排16波8.",
      zh: "防漏抗震型散热器，适配玉柴20-1。尺寸 370×430×50mm，规格 2排16波8。",
    },
    image: "/images/products/rad-yc20-1.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Yuchai 20-1", zh: "玉柴20-1" } },
      { labelKey: "dimensions", value: { en: "370×430×50 mm", zh: "370×430×50mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Yuchai 20-1", zh: "玉柴20-1" } },
      { labelKey: "dimensions", value: { en: "370×430×50 mm", zh: "370×430×50mm" } },
    ],
    compatibleMachines: "Yuchai 20-1",
  },
  {
    slug: "rad-yc60-6",
    partNumber: "RAD-YC60-6",
    name: {
      en: "Yuchai 60-6 Radiator",
      zh: "玉柴60-6 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Yuchai"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Yuchai 60-6. 500×620×80 mm, core 4排16波8.",
      zh: "防漏抗震型散热器，适配玉柴60-6。尺寸 500×620×80mm，规格 4排16波8。",
    },
    image: "/images/products/rad-yc60-6.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Yuchai 60-6", zh: "玉柴60-6" } },
      { labelKey: "dimensions", value: { en: "500×620×80 mm", zh: "500×620×80mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Yuchai 60-6", zh: "玉柴60-6" } },
      { labelKey: "dimensions", value: { en: "500×620×80 mm", zh: "500×620×80mm" } },
    ],
    compatibleMachines: "Yuchai 60-6",
  },
  {
    slug: "rad-yc60-7",
    partNumber: "RAD-YC60-7",
    name: {
      en: "Yuchai 60-7 Radiator (domestic)",
      zh: "玉柴60-7国产 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Yuchai"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Yuchai 60-7 (domestic). 500×570×85 mm, core 3排16波8.",
      zh: "防漏抗震型散热器，适配玉柴60-7国产。尺寸 500×570×85mm，规格 3排16波8。",
    },
    image: "/images/products/rad-yc60-7.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Yuchai 60-7 (domestic)", zh: "玉柴60-7国产" } },
      { labelKey: "dimensions", value: { en: "500×570×85 mm", zh: "500×570×85mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Yuchai 60-7 (domestic)", zh: "玉柴60-7国产" } },
      { labelKey: "dimensions", value: { en: "500×570×85 mm", zh: "500×570×85mm" } },
    ],
    compatibleMachines: "Yuchai 60-7 (domestic)",
  },
  {
    slug: "rad-yc70-8",
    partNumber: "RAD-YC70-8",
    name: {
      en: "Yuchai 70-8 Radiator",
      zh: "玉柴70-8 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Yuchai"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Yuchai 70-8. 545×570×70 mm, core 3排16波8.",
      zh: "防漏抗震型散热器，适配玉柴70-8。尺寸 545×570×70mm，规格 3排16波8。",
    },
    image: "/images/products/rad-yc70-8.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Yuchai 70-8", zh: "玉柴70-8" } },
      { labelKey: "dimensions", value: { en: "545×570×70 mm", zh: "545×570×70mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Yuchai 70-8", zh: "玉柴70-8" } },
      { labelKey: "dimensions", value: { en: "545×570×70 mm", zh: "545×570×70mm" } },
    ],
    compatibleMachines: "Yuchai 70-8",
  },
  {
    slug: "rad-yc85",
    partNumber: "RAD-YC85",
    name: {
      en: "Yuchai 85 Radiator",
      zh: "玉柴85 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Yuchai"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Yuchai 85. 630×790×165 mm, core 双排凸琴管.",
      zh: "防漏抗震型散热器，适配玉柴85。尺寸 630×790×165mm，规格 双排凸琴管。",
    },
    image: "/images/products/rad-yc85.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Yuchai 85", zh: "玉柴85" } },
      { labelKey: "dimensions", value: { en: "630×790×165 mm", zh: "630×790×165mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Yuchai 85", zh: "玉柴85" } },
      { labelKey: "dimensions", value: { en: "630×790×165 mm", zh: "630×790×165mm" } },
    ],
    compatibleMachines: "Yuchai 85",
  },
  {
    slug: "rad-yc85-7",
    partNumber: "RAD-YC85-7",
    name: {
      en: "Yuchai 85-7 / 85-6 / 80-6 Radiator",
      zh: "玉柴85-7 / 85-6 / 80-6 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Yuchai"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Yuchai 85-7 / 85-6 / 80-6. 680×660×70 mm, core 2排22波8.",
      zh: "防漏抗震型散热器，适配玉柴85-7 / 85-6 / 80-6。尺寸 680×660×70mm，规格 2排22波8。",
    },
    image: "/images/products/rad-yc85-7.jpg",
    images: ["/images/products/rad-yc85-7.jpg", "/images/products/rad-yc85-6-80-6.jpg"],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Yuchai 85-7 / 85-6 / 80-6", zh: "玉柴85-7 / 85-6 / 80-6" } },
      { labelKey: "dimensions", value: { en: "680×660×70 mm", zh: "680×660×70mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Yuchai 85-7 / 85-6 / 80-6", zh: "玉柴85-7 / 85-6 / 80-6" } },
      { labelKey: "dimensions", value: { en: "680×660×70 mm", zh: "680×660×70mm" } },
    ],
    compatibleMachines: "Yuchai 85-7 / 85-6 / 80-6",
  },
  {
    slug: "rad-yc230-8",
    partNumber: "RAD-YC230-8",
    name: {
      en: "Yuchai 230-8 Radiator",
      zh: "玉柴230-8 散热器",
    },
    categorySlug: "cooling-parts",
    brands: ["Yuchai"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Yuchai 230-8. 680×1030×80 mm, core 3排18波8.",
      zh: "防漏抗震型散热器，适配玉柴230-8。尺寸 680×1030×80mm，规格 3排18波8。",
    },
    image: "/images/products/rad-yc230-8.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Yuchai 230-8", zh: "玉柴230-8" } },
      { labelKey: "dimensions", value: { en: "680×1030×80 mm", zh: "680×1030×80mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant", zh: "防漏抗震型" } },
      { labelKey: "material", value: { en: "Aluminium core", zh: "芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Yuchai 230-8", zh: "玉柴230-8" } },
      { labelKey: "dimensions", value: { en: "680×1030×80 mm", zh: "680×1030×80mm" } },
    ],
    compatibleMachines: "Yuchai 230-8",
  },
  {
    slug: "rad-sk200-6-plastic",
    partNumber: "RAD-SK200-6-PLASTIC",
    name: {
      en: "Kobelco SK200-6 Radiator (aluminium-plastic tank)",
      zh: "神钢SK200-6 散热器（铝塑）",
    },
    categorySlug: "cooling-parts",
    brands: ["Kobelco"],
    description: {
      en: "Leak-proof, vibration-resistant radiator for Kobelco SK200-6, aluminium-plastic tank. 760×980×100 mm.",
      zh: "防漏抗震型散热器，适配神钢SK200-6，铝塑水室。尺寸 760×980×100mm。",
    },
    image: "/images/products/rad-sk200-6-plastic.jpg",
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: "Kobelco SK200-6", zh: "神钢SK200-6" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: "Leak-proof, vibration-resistant, aluminium-plastic tank", zh: "防漏抗震型，铝塑水室" } },
      { labelKey: "material", value: { en: "Aluminium-plastic tank, aluminium core", zh: "铝塑水室，芯体铝" } },
      { labelKey: "compatibleMachines", value: { en: "Kobelco SK200-6", zh: "神钢SK200-6" } },
      { labelKey: "dimensions", value: { en: "760×980×100 mm", zh: "760×980×100mm" } },
    ],
    compatibleMachines: "Kobelco SK200-6",
  },
];

type CatalogKind =
  | "md"
  | "diff"
  | "pc"
  | "gr"
  | "ss"
  | "ah"
  | "hs"
  | "bd"
  | "vrt"
  | "gba"
  | "gbh"
  | "th"
  | "gea"
  | "geb"
  | "gec"
  | "ges"
  | "gbg"
  | "gbs"
  | "gbr"
  | "gbf"
  | "bc"
  | "pch"
  | "pg"
  | "sg"
  | "sgs"
  | "sf"
  | "la"
  | "ps"
  | "rk";

const catalogTypeLabel: Record<CatalogKind, { en: string; zh: string }> = {
  md: { en: "Main Drive Assembly", zh: "主传动总成" },
  diff: { en: "Differential Assembly", zh: "差速器总成" },
  pc: { en: "Planet Carrier Assembly", zh: "轮架总成" },
  gr: { en: "Gear Ring", zh: "轮边内齿圈" },
  ss: { en: "Support Shaft", zh: "支撑轴" },
  ah: { en: "Axle Housing", zh: "桥壳" },
  hs: { en: "Half Shaft", zh: "半轴" },
  bd: { en: "Brake Disc", zh: "制动盘" },
  vrt: { en: "VRT Series Part", zh: "VRT系列件" },
  gba: { en: "Gearbox Assembly", zh: "双变总成" },
  gbh: { en: "Gearbox Housing", zh: "箱体" },
  th: { en: "Torque Housing", zh: "壳体" },
  gea: { en: "Gear Assembly", zh: "齿轮总成" },
  geb: { en: "Gear Assembly", zh: "齿轮总成" },
  gec: { en: "Gear Assembly", zh: "齿轮总成" },
  ges: { en: "Gear Shaft", zh: "齿轮轴" },
  gbg: { en: "Gearbox Gear", zh: "变速箱齿轮" },
  gbs: { en: "Gearbox Shaft", zh: "变速箱轴" },
  gbr: { en: "Gearbox Gear", zh: "变速箱齿轮" },
  gbf: { en: "Gearbox Flange", zh: "法兰" },
  bc: { en: "Disc Brake Caliper", zh: "制动钳" },
  pch: { en: "Planet Carrier Housing/Hub", zh: "轮架外壳/轮毂" },
  pg: { en: "Planet Gear", zh: "行星轮" },
  sg: { en: "Sun Gear", zh: "太阳轮" },
  sgs: { en: "Sun Gear Shaft", zh: "太阳轮轴" },
  sf: { en: "Swing Frame", zh: "车架" },
  la: { en: "Link Arm", zh: "连杆" },
  ps: { en: "Pin and Sleeve", zh: "销轴套" },
  rk: { en: "Articulated Pin Repair Kit", zh: "铰接销修理包" },
};

const catalogImage: Record<CatalogKind, string> = {
  md: "/images/products/drive-diff-catalog.png",
  diff: "/images/products/drive-diff-catalog.png",
  pc: "/images/products/planet-carrier-catalog.png",
  gr: "/images/products/gear-ring-catalog.png",
  ss: "/images/products/support-shaft-catalog.png",
  ah: "/images/products/axle-halfshaft-catalog.png",
  hs: "/images/products/axle-halfshaft-catalog.png",
  bd: "/images/products/brake-disc-catalog.png",
  vrt: "/images/products/vrt-series-catalog.png",
  gba: "/images/products/gearbox-assy-housing-catalog.png",
  gbh: "/images/products/gearbox-assy-housing-catalog.png",
  th: "/images/products/gearbox-assy-housing-catalog.png",
  gea: "/images/products/gear-assy-catalog.png",
  geb: "/images/products/gear-assy-catalog.png",
  gec: "/images/products/gear-assy-catalog.png",
  ges: "/images/products/gear-assy-catalog.png",
  gbg: "/images/products/gearbox-gear-catalog.png",
  gbs: "/images/products/gearbox-gear-flange-catalog.png",
  gbr: "/images/products/gearbox-gear-flange-catalog.png",
  gbf: "/images/products/gearbox-gear-flange-catalog.png",
  bc: "/images/products/disc-brake-caliper-catalog.png",
  pch: "/images/products/planet-carrier-housing-catalog.png",
  pg: "/images/products/planet-sun-gear-catalog.png",
  sg: "/images/products/planet-sun-gear-catalog.png",
  sgs: "/images/products/planet-sun-gear-catalog.png",
  sf: "/images/products/structural-catalog.png",
  la: "/images/products/structural-catalog.png",
  ps: "/images/products/pin-sleeve-catalog.png",
  rk: "/images/products/pin-sleeve-catalog.png",
};

function driveDiffPart(item: {
  slug: string;
  partNumber: string;
  brand: string;
  machineEn: string;
  machineZh: string;
  kind: CatalogKind;
  file: string;
}): Product {
  const { en: typeEn, zh: typeZh } = catalogTypeLabel[item.kind];
  const img = `/images/products/${item.file}`;
  const catalog = catalogImage[item.kind];
  const categorySlug =
    item.kind === "bd" || item.kind === "bc"
      ? "brake-components"
      : item.kind === "sf" || item.kind === "la" || item.kind === "ps" || item.kind === "rk"
        ? "structural-components"
        : "transmission-systems";
  const nameEn =
    item.kind === "vrt"
      ? `VRT ${item.machineEn}`
      : item.kind === "ps"
        ? `${item.brand} ${item.machineEn}`
        : `${item.brand} ${item.machineEn} ${typeEn}`;
  const nameZh =
    item.kind === "vrt" || item.kind === "ps" ? item.machineZh : `${item.machineZh} ${typeZh}`;
  return {
    slug: item.slug,
    partNumber: item.partNumber,
    name: { en: nameEn, zh: nameZh },
    categorySlug,
    brands: [item.brand],
    description: {
      en:
        item.kind === "vrt"
          ? `${item.machineEn} for VRT series transmissions. In stock at Linyi hub.`
          : `${typeEn} for ${item.brand} ${item.machineEn}. In stock at Linyi hub.`,
      zh:
        item.kind === "vrt"
          ? `VRT 系列${item.machineZh}，临沂仓现货。`
          : `适配 ${item.machineZh} 的${typeZh}，临沂仓现货。`,
    },
    image: img,
    images: [img, catalog],
    imageFit: "contain",
    inStock: true,
    dispatch24h: true,
    specs: [
      { labelKey: "fits", value: { en: `${item.brand} ${item.machineEn}`, zh: item.machineZh } },
      { labelKey: "application", value: { en: typeEn, zh: typeZh } },
      { labelKey: "location", value: { en: "Linyi Hub", zh: "临沂仓" } },
    ],
    technicalSpecs: [
      { labelKey: "application", value: { en: typeEn, zh: typeZh } },
      {
        labelKey: "compatibleMachines",
        value: { en: `${item.brand} ${item.machineEn}`, zh: item.machineZh },
      },
    ],
    compatibleMachines: `${item.brand} ${item.machineEn}`,
  };
}

const driveDiffCatalog: Product[] = (
  [
    { slug: "md-sdlg-953n", partNumber: "MD-SDLG-953N", brand: "SDLG", machineEn: "953N", machineZh: "临953N", kind: "md", file: "md-sdlg-953n.png" },
  { slug: "md-lonking-856", partNumber: "MD-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "md", file: "md-lonking-856.png" },
  { slug: "md-lonking-862", partNumber: "MD-LONKING-862", brand: "Lonking", machineEn: "862", machineZh: "龙862", kind: "md", file: "md-lonking-862.png" },
  { slug: "md-sdlg-968f", partNumber: "MD-SDLG-968F", brand: "SDLG", machineEn: "968F", machineZh: "临968F", kind: "md", file: "md-sdlg-968f.png" },
  { slug: "md-xcmg-600f", partNumber: "MD-XCMG-600F", brand: "XCMG", machineEn: "600F", machineZh: "徐600F", kind: "md", file: "md-xcmg-600f.png" },
  { slug: "md-xcmg-500kv", partNumber: "MD-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "md", file: "md-xcmg-500kv.png" },
  { slug: "md-liugong-50c", partNumber: "MD-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "md", file: "md-liugong-50c.png" },
  { slug: "md-liugong-862h", partNumber: "MD-LIUGONG-862H", brand: "Liugong", machineEn: "862H", machineZh: "柳862H", kind: "md", file: "md-liugong-862h.png" },
  { slug: "diff-sdlg-953n", partNumber: "DIFF-SDLG-953N", brand: "SDLG", machineEn: "953N", machineZh: "临953N", kind: "diff", file: "diff-sdlg-953n.png" },
  { slug: "diff-lonking-856", partNumber: "DIFF-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "diff", file: "diff-lonking-856.png" },
  { slug: "diff-liugong-50c", partNumber: "DIFF-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "diff", file: "diff-liugong-50c.png" },
  { slug: "diff-liugong-862", partNumber: "DIFF-LIUGONG-862", brand: "Liugong", machineEn: "862", machineZh: "柳862", kind: "diff", file: "diff-liugong-862.png" },
  { slug: "diff-xgma-50", partNumber: "DIFF-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "diff", file: "diff-xgma-50.png" },
  { slug: "diff-xcmg-500kl", partNumber: "DIFF-XCMG-500KL", brand: "XCMG", machineEn: "500KL", machineZh: "徐500KL", kind: "diff", file: "diff-xcmg-500kl.png" },
  { slug: "diff-xcmg-60", partNumber: "DIFF-XCMG-60", brand: "XCMG", machineEn: "60", machineZh: "徐60", kind: "diff", file: "diff-xcmg-60.png" },
  { slug: "diff-sdlg-968", partNumber: "DIFF-SDLG-968", brand: "SDLG", machineEn: "968", machineZh: "临968", kind: "diff", file: "diff-sdlg-968.png" },
    { slug: "pc-xcmg-600f", partNumber: "PC-XCMG-600F", brand: "XCMG", machineEn: "600F", machineZh: "徐600F", kind: "pc", file: "pc-xcmg-600f.png" },
    { slug: "pc-xcmg-500kv", partNumber: "PC-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "pc", file: "pc-xcmg-500kv.png" },
    { slug: "pc-liugong-862-bearing", partNumber: "PC-LIUGONG-862-BEARING", brand: "Liugong", machineEn: "862 Bearing type", machineZh: "柳862（轴承式）", kind: "pc", file: "pc-liugong-862-bearing.png" },
    { slug: "pc-liugong-862-lock", partNumber: "PC-LIUGONG-862-LOCK", brand: "Liugong", machineEn: "862 Lock type", machineZh: "柳862（锁片式）", kind: "pc", file: "pc-liugong-862-lock.png" },
    { slug: "pc-lonking-860", partNumber: "PC-LONKING-860", brand: "Lonking", machineEn: "860", machineZh: "龙860", kind: "pc", file: "pc-lonking-860.png" },
    { slug: "pc-sdlg-975", partNumber: "PC-SDLG-975", brand: "SDLG", machineEn: "975", machineZh: "临975", kind: "pc", file: "pc-sdlg-975.png" },
    { slug: "pc-sdlg-968f-front", partNumber: "PC-SDLG-968F-FRONT", brand: "SDLG", machineEn: "968F front", machineZh: "临968F前", kind: "pc", file: "pc-sdlg-968f-front.png" },
    { slug: "pc-sdlg-968f-rear", partNumber: "PC-SDLG-968F-REAR", brand: "SDLG", machineEn: "968F rear", machineZh: "临968F后", kind: "pc", file: "pc-sdlg-968f-rear.png" },
    { slug: "pc-lovol-60", partNumber: "PC-LOVOL-60", brand: "LOVOL", machineEn: "60", machineZh: "福60", kind: "pc", file: "pc-lovol-60.png" },
    { slug: "pc-yunyu-60", partNumber: "PC-YUNYU-60", brand: "Yunyu", machineEn: "60", machineZh: "肥城60", kind: "pc", file: "pc-yunyu-60.png" },
    { slug: "pc-xgma-e", partNumber: "PC-XGMA-E", brand: "XGMA", machineEn: "E", machineZh: "夏E型", kind: "pc", file: "pc-xgma-e.png" },
    { slug: "pc-sdlg-953n-rear", partNumber: "PC-SDLG-953N-REAR", brand: "SDLG", machineEn: "953N rear", machineZh: "临953N后", kind: "pc", file: "pc-sdlg-953n-rear.png" },
    { slug: "pc-lovol-956h", partNumber: "PC-LOVOL-956H", brand: "LOVOL", machineEn: "956H", machineZh: "福956H", kind: "pc", file: "pc-lovol-956h.png" },
    { slug: "pc-liugong-50c", partNumber: "PC-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "pc", file: "pc-liugong-50c.png" },
    { slug: "pc-lonking-856", partNumber: "PC-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "pc", file: "pc-lonking-856.png" },
    { slug: "pc-sdlg-953", partNumber: "PC-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "pc", file: "pc-sdlg-953.png" },
    { slug: "gr-sdlg-968f-front", partNumber: "GR-SDLG-968F-FRONT", brand: "SDLG", machineEn: "968F front", machineZh: "临968F前", kind: "gr", file: "gr-sdlg-968f-front.png" },
    { slug: "gr-sdlg-968f-rear", partNumber: "GR-SDLG-968F-REAR", brand: "SDLG", machineEn: "968F rear", machineZh: "临968F后", kind: "gr", file: "gr-sdlg-968f-rear.png" },
    { slug: "gr-liugong-862-lock", partNumber: "GR-LIUGONG-862-LOCK", brand: "Liugong", machineEn: "862 Lock type", machineZh: "柳862（锁片式）", kind: "gr", file: "gr-liugong-862-lock.png" },
    { slug: "gr-liugong-862-bearing", partNumber: "GR-LIUGONG-862-BEARING", brand: "Liugong", machineEn: "862 Bearing type", machineZh: "柳862（轴承式）", kind: "gr", file: "gr-liugong-862-bearing.png" },
    { slug: "gr-sdlg-975", partNumber: "GR-SDLG-975", brand: "SDLG", machineEn: "975", machineZh: "临975", kind: "gr", file: "gr-sdlg-975.png" },
    { slug: "gr-xcmg-500kv", partNumber: "GR-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "gr", file: "gr-xcmg-500kv.png" },
    { slug: "gr-xcmg-600f", partNumber: "GR-XCMG-600F", brand: "XCMG", machineEn: "600F", machineZh: "徐600F", kind: "gr", file: "gr-xcmg-600f.png" },
    { slug: "gr-lovol-60", partNumber: "GR-LOVOL-60", brand: "LOVOL", machineEn: "60", machineZh: "福60", kind: "gr", file: "gr-lovol-60.png" },
    { slug: "gr-lovol-956", partNumber: "GR-LOVOL-956", brand: "LOVOL", machineEn: "956", machineZh: "福956", kind: "gr", file: "gr-lovol-956.png" },
    { slug: "gr-lonking-860", partNumber: "GR-LONKING-860", brand: "Lonking", machineEn: "860", machineZh: "龙860", kind: "gr", file: "gr-lonking-860.png" },
    { slug: "gr-lonking-50f", partNumber: "GR-LONKING-50F", brand: "Lonking", machineEn: "50F", machineZh: "龙50F", kind: "gr", file: "gr-lonking-50f.png" },
    { slug: "gr-liugong-50c", partNumber: "GR-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "gr", file: "gr-liugong-50c.png" },
    { slug: "gr-xgma-e", partNumber: "GR-XGMA-E", brand: "XGMA", machineEn: "E", machineZh: "厦E型", kind: "gr", file: "gr-xgma-e.png" },
    { slug: "gr-sdlg-953", partNumber: "GR-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "gr", file: "gr-sdlg-953.png" },
    { slug: "gr-sdlg-953n", partNumber: "GR-SDLG-953N", brand: "SDLG", machineEn: "953N", machineZh: "临953N", kind: "gr", file: "gr-sdlg-953n.png" },
    { slug: "gr-lonking-856", partNumber: "GR-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "gr", file: "gr-lonking-856.png" },
    { slug: "ss-liugong-862-bearing", partNumber: "SS-LIUGONG-862-BEARING", brand: "Liugong", machineEn: "862 Bearing type", machineZh: "柳862（轴承式）", kind: "ss", file: "ss-liugong-862-bearing.png" },
    { slug: "ss-liugong-862-lock", partNumber: "SS-LIUGONG-862-LOCK", brand: "Liugong", machineEn: "862 Lock type", machineZh: "柳862（锁片式）", kind: "ss", file: "ss-liugong-862-lock.png" },
    { slug: "ss-liugong-856h", partNumber: "SS-LIUGONG-856H", brand: "Liugong", machineEn: "856H", machineZh: "柳856H", kind: "ss", file: "ss-liugong-856h.png" },
    { slug: "ss-sdlg-968f", partNumber: "SS-SDLG-968F", brand: "SDLG", machineEn: "968F", machineZh: "临968F", kind: "ss", file: "ss-sdlg-968f.png" },
    { slug: "ss-sdlg-956f", partNumber: "SS-SDLG-956F", brand: "SDLG", machineEn: "956F", machineZh: "临956F", kind: "ss", file: "ss-sdlg-956f.png" },
    { slug: "ss-liugong-855n-front", partNumber: "SS-LIUGONG-855N-FRONT", brand: "Liugong", machineEn: "855N front", machineZh: "柳855N前", kind: "ss", file: "ss-liugong-855n-front.png" },
    { slug: "ss-liugong-855n-rear", partNumber: "SS-LIUGONG-855N-REAR", brand: "Liugong", machineEn: "855N rear", machineZh: "柳855N后", kind: "ss", file: "ss-liugong-855n-rear.png" },
    { slug: "ss-liugong-50c", partNumber: "SS-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "ss", file: "ss-liugong-50c.png" },
    { slug: "ss-xcmg-600f", partNumber: "SS-XCMG-600F", brand: "XCMG", machineEn: "600F", machineZh: "徐600F", kind: "ss", file: "ss-xcmg-600f.png" },
    { slug: "ss-lovol-60", partNumber: "SS-LOVOL-60", brand: "LOVOL", machineEn: "60", machineZh: "福60", kind: "ss", file: "ss-lovol-60.png" },
    { slug: "ss-xcmg-500kv", partNumber: "SS-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "ss", file: "ss-xcmg-500kv.png" },
    { slug: "ss-sdlg-953", partNumber: "SS-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "ss", file: "ss-sdlg-953.png" },
    { slug: "ss-lonking-60", partNumber: "SS-LONKING-60", brand: "Lonking", machineEn: "60", machineZh: "龙60", kind: "ss", file: "ss-lonking-60.png" },
    { slug: "ss-lonking-856", partNumber: "SS-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "ss", file: "ss-lonking-856.png" },
    { slug: "ss-xgma-e", partNumber: "SS-XGMA-E", brand: "XGMA", machineEn: "E", machineZh: "厦E型", kind: "ss", file: "ss-xgma-e.png" },
    { slug: "ss-shantui-32", partNumber: "SS-SHANTUI-32", brand: "Shantui", machineEn: "CEM-32 axle", machineZh: "山32桥", kind: "ss", file: "ss-shantui-32.png" },
    { slug: "ah-sdlg-953", partNumber: "AH-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "ah", file: "ah-sdlg-953.png" },
    { slug: "ah-xgma-951", partNumber: "AH-XGMA-951", brand: "XGMA", machineEn: "951", machineZh: "厦951", kind: "ah", file: "ah-xgma-951.png" },
    { slug: "ah-liugong-50c", partNumber: "AH-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "ah", file: "ah-liugong-50c.png" },
    { slug: "ah-lonking-856", partNumber: "AH-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "ah", file: "ah-lonking-856.png" },
    { slug: "hs-sdlg-975-lr", partNumber: "HS-SDLG-975-LR", brand: "SDLG", machineEn: "975 Left/right", machineZh: "临975 左/右", kind: "hs", file: "hs-sdlg-975-lr.png" },
    { slug: "hs-sdlg-968f-lr", partNumber: "HS-SDLG-968F-LR", brand: "SDLG", machineEn: "968F Left/right", machineZh: "临968F左/右", kind: "hs", file: "hs-sdlg-968f-lr.png" },
    { slug: "hs-xcmg-60-fa", partNumber: "HS-XCMG-60-FA", brand: "XCMG", machineEn: "60 front/rear", machineZh: "徐60 前/后", kind: "hs", file: "hs-xcmg-60-fa.png" },
    { slug: "hs-xcmg-50", partNumber: "HS-XCMG-50", brand: "XCMG", machineEn: "50", machineZh: "徐50", kind: "hs", file: "hs-xcmg-50.png" },
    { slug: "hs-lovol-60-fa", partNumber: "HS-LOVOL-60-FA", brand: "LOVOL", machineEn: "60 front/rear", machineZh: "福60 前/后", kind: "hs", file: "hs-lovol-60-fa.png" },
    { slug: "hs-liugong-862", partNumber: "HS-LIUGONG-862", brand: "Liugong", machineEn: "862", machineZh: "柳862", kind: "hs", file: "hs-liugong-862.png" },
    { slug: "hs-lonking-860", partNumber: "HS-LONKING-860", brand: "Lonking", machineEn: "860", machineZh: "龙860", kind: "hs", file: "hs-lonking-860.png" },
    { slug: "hs-liugong-856h", partNumber: "HS-LIUGONG-856H", brand: "Liugong", machineEn: "856H", machineZh: "柳856H", kind: "hs", file: "hs-liugong-856h.png" },
    { slug: "hs-sdlg-953n", partNumber: "HS-SDLG-953N", brand: "SDLG", machineEn: "953N", machineZh: "临953N", kind: "hs", file: "hs-sdlg-953n.png" },
    { slug: "hs-liugong-50c", partNumber: "HS-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "hs", file: "hs-liugong-50c.png" },
    { slug: "hs-xcmg-500kv", partNumber: "HS-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "hs", file: "hs-xcmg-500kv.png" },
    { slug: "hs-sdlg-953", partNumber: "HS-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "hs", file: "hs-sdlg-953.png" },
    { slug: "bd-sdlg-975", partNumber: "BD-SDLG-975", brand: "SDLG", machineEn: "975", machineZh: "临975", kind: "bd", file: "bd-sdlg-975.png" },
    { slug: "bd-sdlg-968f", partNumber: "BD-SDLG-968F", brand: "SDLG", machineEn: "968F", machineZh: "临968F", kind: "bd", file: "bd-sdlg-968f.png" },
    { slug: "bd-sdlg-956f", partNumber: "BD-SDLG-956F", brand: "SDLG", machineEn: "956F", machineZh: "临956F", kind: "bd", file: "bd-sdlg-956f.png" },
    { slug: "bd-sdlg-956", partNumber: "BD-SDLG-956", brand: "SDLG", machineEn: "956", machineZh: "临956", kind: "bd", file: "bd-sdlg-956.png" },
    { slug: "bd-sdlg-968v", partNumber: "BD-SDLG-968V", brand: "SDLG", machineEn: "968V", machineZh: "临968V", kind: "bd", file: "bd-sdlg-968v.png" },
    { slug: "bd-sdlg-978", partNumber: "BD-SDLG-978", brand: "SDLG", machineEn: "978", machineZh: "临978", kind: "bd", file: "bd-sdlg-978.png" },
    { slug: "bd-sdlg-953", partNumber: "BD-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "bd", file: "bd-sdlg-953.png" },
    { slug: "bd-liugong-855n", partNumber: "BD-LIUGONG-855N", brand: "Liugong", machineEn: "855N", machineZh: "柳855N", kind: "bd", file: "bd-liugong-855n.png" },
    { slug: "bd-liugong-860", partNumber: "BD-LIUGONG-860", brand: "Liugong", machineEn: "860", machineZh: "柳860", kind: "bd", file: "bd-liugong-860.png" },
    { slug: "bd-xgma-50", partNumber: "BD-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "bd", file: "bd-xgma-50.png" },
    { slug: "bd-lonking-60", partNumber: "BD-LONKING-60", brand: "Lonking", machineEn: "60", machineZh: "龙60", kind: "bd", file: "bd-lonking-60.png" },
    { slug: "bd-xgma-955", partNumber: "BD-XGMA-955", brand: "XGMA", machineEn: "955", machineZh: "厦955", kind: "bd", file: "bd-xgma-955.png" },
    { slug: "bd-liugong-50c", partNumber: "BD-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "bd", file: "bd-liugong-50c.png" },
    { slug: "bd-somer-50", partNumber: "BD-SOMER-50", brand: "Somer", machineEn: "50", machineZh: "索玛50", kind: "bd", file: "bd-somer-50.png" },
    { slug: "bd-xcmg-600f-front", partNumber: "BD-XCMG-600F-FRONT", brand: "XCMG", machineEn: "600F front", machineZh: "徐600F前", kind: "bd", file: "bd-xcmg-600f-front.png" },
    { slug: "bd-xcmg-600f-rear", partNumber: "BD-XCMG-600F-REAR", brand: "XCMG", machineEn: "600F rear", machineZh: "徐600F后", kind: "bd", file: "bd-xcmg-600f-rear.png" },
    { slug: "vrt-200-205-assy", partNumber: "VRT-200-205-ASSY", brand: "VRT", machineEn: "200-205 Ass'y", machineZh: "200-205箱总成", kind: "vrt", file: "vrt-200-205-assy.png" },
    { slug: "vrt-200-205-torque-housing", partNumber: "VRT-200-205-TORQUE", brand: "VRT", machineEn: "200-205 Torque housing", machineZh: "200-205变矩器", kind: "vrt", file: "vrt-200-205-torque-housing.png" },
    { slug: "vrt-200-transfer-case", partNumber: "VRT-200-TRANSFER", brand: "VRT", machineEn: "200 Transfer case", machineZh: "200分动箱", kind: "vrt", file: "vrt-200-transfer-case.png" },
    { slug: "vrt-205-transfer-case", partNumber: "VRT-205-TRANSFER", brand: "VRT", machineEn: "205 Transfer case", machineZh: "205分动箱", kind: "vrt", file: "vrt-205-transfer-case.png" },
    { slug: "vrt-k12-200", partNumber: "VRT-K12-200", brand: "VRT", machineEn: "K12-200", machineZh: "K12-200", kind: "vrt", file: "vrt-k12-200.png" },
    { slug: "vrt-k12-205", partNumber: "VRT-K12-205", brand: "VRT", machineEn: "K12-205", machineZh: "K12-205", kind: "vrt", file: "vrt-k12-205.png" },
    { slug: "vrt-k34", partNumber: "VRT-K34", brand: "VRT", machineEn: "K34", machineZh: "K34", kind: "vrt", file: "vrt-k34.png" },
    { slug: "vrt-kfr", partNumber: "VRT-KFR", brand: "VRT", machineEn: "KFR", machineZh: "KFR", kind: "vrt", file: "vrt-kfr.png" },
    { slug: "vrt-r33-200", partNumber: "VRT-R33-200", brand: "VRT", machineEn: "R33-200", machineZh: "R33-200", kind: "vrt", file: "vrt-r33-200.png" },
    { slug: "vrt-r33-205", partNumber: "VRT-R33-205", brand: "VRT", machineEn: "R33-205", machineZh: "R33-205", kind: "vrt", file: "vrt-r33-205.png" },
    { slug: "vrt-r11-assy", partNumber: "VRT-R11-ASSY", brand: "VRT", machineEn: "R11 Ass'y", machineZh: "R11总成", kind: "vrt", file: "vrt-r11-assy.png" },
    { slug: "vrt-r12-assy", partNumber: "VRT-R12-ASSY", brand: "VRT", machineEn: "R12 Ass'y", machineZh: "R12总成", kind: "vrt", file: "vrt-r12-assy.png" },
    { slug: "vrt-r31-assy", partNumber: "VRT-R31-ASSY", brand: "VRT", machineEn: "R31 Ass'y", machineZh: "R31总成", kind: "vrt", file: "vrt-r31-assy.png" },
    { slug: "vrt-r32-assy", partNumber: "VRT-R32-ASSY", brand: "VRT", machineEn: "R32 Ass'y", machineZh: "R32总成", kind: "vrt", file: "vrt-r32-assy.png" },
    { slug: "vrt-r41-assy", partNumber: "VRT-R41-ASSY", brand: "VRT", machineEn: "R41 Ass'y", machineZh: "R41总成", kind: "vrt", file: "vrt-r41-assy.png" },
    { slug: "vrt-r42-assy", partNumber: "VRT-R42-ASSY", brand: "VRT", machineEn: "R42 Ass'y", machineZh: "R42总成", kind: "vrt", file: "vrt-r42-assy.png" },
    { slug: "gba-sdlg-955f", partNumber: "GBA-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "gba", file: "gba-sdlg-955f.png" },
    { slug: "gba-liugong-50c", partNumber: "GBA-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "gba", file: "gba-liugong-50c.png" },
    { slug: "gba-lonking-856", partNumber: "GBA-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "gba", file: "gba-lonking-856.png" },
    { slug: "gba-xcmg-500kv", partNumber: "GBA-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "gba", file: "gba-xcmg-500kv.png" },
    { slug: "gbh-cem-60", partNumber: "GBH-CEM-60", brand: "CEM", machineEn: "60", machineZh: "山60", kind: "gbh", file: "gbh-cem-60.png" },
    { slug: "gbh-advance-60", partNumber: "GBH-ADVANCE-60", brand: "Advance", machineEn: "60", machineZh: "杭60", kind: "gbh", file: "gbh-advance-60.png" },
    { slug: "gbh-xgma-50", partNumber: "GBH-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "gbh", file: "gbh-xgma-50.png" },
    { slug: "gbh-advance-50", partNumber: "GBH-ADVANCE-50", brand: "Advance", machineEn: "50", machineZh: "杭50", kind: "gbh", file: "gbh-advance-50.png" },
    { slug: "gbh-sdlg-955f", partNumber: "GBH-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "gbh", file: "gbh-sdlg-955f.png" },
    { slug: "gbh-liugong-856h", partNumber: "GBH-LIUGONG-856H", brand: "Liugong", machineEn: "856H", machineZh: "柳856H", kind: "gbh", file: "gbh-liugong-856h.png" },
    { slug: "gbh-lonking-856", partNumber: "GBH-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "gbh", file: "gbh-lonking-856.png" },
    { slug: "gbh-xcmg-50", partNumber: "GBH-XCMG-50", brand: "XCMG", machineEn: "50", machineZh: "徐50", kind: "gbh", file: "gbh-xcmg-50.png" },
    { slug: "th-liugong-500", partNumber: "TH-LIUGONG-500", brand: "Liugong", machineEn: "500", machineZh: "柳500", kind: "th", file: "th-liugong-500.png" },
    { slug: "th-cem-50", partNumber: "TH-CEM-50", brand: "CEM", machineEn: "50", machineZh: "山50", kind: "th", file: "th-cem-50.png" },
    { slug: "th-lonking-50", partNumber: "TH-LONKING-50", brand: "Lonking", machineEn: "50", machineZh: "龙50", kind: "th", file: "th-lonking-50.png" },
    { slug: "th-liugong-856h", partNumber: "TH-LIUGONG-856H", brand: "Liugong", machineEn: "856H", machineZh: "柳856H", kind: "th", file: "th-liugong-856h.png" },
    { slug: "gea-sdlg-955f", partNumber: "GEA-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "gea", file: "gea-sdlg-955f.png" },
    { slug: "gea-liugong-50c", partNumber: "GEA-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "gea", file: "gea-liugong-50c.png" },
    { slug: "gea-lonking-856", partNumber: "GEA-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "gea", file: "gea-lonking-856.png" },
    { slug: "gea-xcmg-500kv", partNumber: "GEA-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "gea", file: "gea-xcmg-500kv.png" },
    { slug: "geb-liugong-50c", partNumber: "GEB-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "geb", file: "geb-liugong-50c.png" },
    { slug: "geb-sdlg-955f", partNumber: "GEB-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "geb", file: "geb-sdlg-955f.png" },
    { slug: "geb-xgma-50", partNumber: "GEB-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "geb", file: "geb-xgma-50.png" },
    { slug: "geb-xcmg-500kv", partNumber: "GEB-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "geb", file: "geb-xcmg-500kv.png" },
    { slug: "gec-liugong-50c", partNumber: "GEC-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "gec", file: "gec-liugong-50c.png" },
    { slug: "gec-sdlg-955f", partNumber: "GEC-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "gec", file: "gec-sdlg-955f.png" },
    { slug: "gec-xgma-50", partNumber: "GEC-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "gec", file: "gec-xgma-50.png" },
    { slug: "gec-xcmg-500kv", partNumber: "GEC-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "gec", file: "gec-xcmg-500kv.png" },
    { slug: "ges-liugong-50c", partNumber: "GES-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "ges", file: "ges-liugong-50c.png" },
    { slug: "ges-sdlg-953", partNumber: "GES-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "ges", file: "ges-sdlg-953.png" },
    { slug: "ges-xgma-50", partNumber: "GES-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "ges", file: "ges-xgma-50.png" },
    { slug: "ges-xcmg-500kv", partNumber: "GES-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "ges", file: "ges-xcmg-500kv.png" },
    { slug: "gbg-a-sdlg-953", partNumber: "GBG-A-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "gbg", file: "gbg-a-sdlg-953.png" },
    { slug: "gbg-a-xcmg-500kv", partNumber: "GBG-A-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "gbg", file: "gbg-a-xcmg-500kv.png" },
    { slug: "gbg-a-liugong-50c", partNumber: "GBG-A-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "gbg", file: "gbg-a-liugong-50c.png" },
    { slug: "gbg-a-liugong-50cn", partNumber: "GBG-A-LIUGONG-50CN", brand: "Liugong", machineEn: "50CN", machineZh: "柳50CN", kind: "gbg", file: "gbg-a-liugong-50cn.png" },
    { slug: "gbg-a-liugong-850h", partNumber: "GBG-A-LIUGONG-850H", brand: "Liugong", machineEn: "850H", machineZh: "柳850H", kind: "gbg", file: "gbg-a-liugong-850h.png" },
    { slug: "gbg-a-liugong-856h", partNumber: "GBG-A-LIUGONG-856H", brand: "Liugong", machineEn: "856H", machineZh: "柳856H", kind: "gbg", file: "gbg-a-liugong-856h.png" },
    { slug: "gbg-a-chenggong-50", partNumber: "GBG-A-CHENGGONG-50", brand: "Chenggong", machineEn: "50", machineZh: "成50", kind: "gbg", file: "gbg-a-chenggong-50.png" },
    { slug: "gbg-a-lonking-50", partNumber: "GBG-A-LONKING-50", brand: "Lonking", machineEn: "50", machineZh: "龙50", kind: "gbg", file: "gbg-a-lonking-50.png" },
    { slug: "gbg-b-lonking-856", partNumber: "GBG-B-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "gbg", file: "gbg-b-lonking-856.png" },
    { slug: "gbg-b-sdlg-953", partNumber: "GBG-B-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "gbg", file: "gbg-b-sdlg-953.png" },
    { slug: "gbg-b-xcmg-500kv", partNumber: "GBG-B-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "gbg", file: "gbg-b-xcmg-500kv.png" },
    { slug: "gbg-b-liugong-50cn", partNumber: "GBG-B-LIUGONG-50CN", brand: "Liugong", machineEn: "50CN", machineZh: "柳50CN", kind: "gbg", file: "gbg-b-liugong-50cn.png" },
    { slug: "gbg-b-liugong-850h", partNumber: "GBG-B-LIUGONG-850H", brand: "Liugong", machineEn: "850H", machineZh: "柳850H", kind: "gbg", file: "gbg-b-liugong-850h.png" },
    { slug: "gbg-b-chenggong-50", partNumber: "GBG-B-CHENGGONG-50", brand: "Chenggong", machineEn: "50", machineZh: "成50", kind: "gbg", file: "gbg-b-chenggong-50.png" },
    { slug: "gbg-b-xgma-50", partNumber: "GBG-B-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "gbg", file: "gbg-b-xgma-50.png" },
    { slug: "gbg-b-xgma-955h", partNumber: "GBG-B-XGMA-955H", brand: "XGMA", machineEn: "955H", machineZh: "厦955H", kind: "gbg", file: "gbg-b-xgma-955h.png" },
    { slug: "bc-sdlg-975", partNumber: "BC-SDLG-975", brand: "SDLG", machineEn: "975", machineZh: "临975", kind: "bc", file: "bc-sdlg-975.png" },
    { slug: "bc-sdlg-968f", partNumber: "BC-SDLG-968F", brand: "SDLG", machineEn: "968F", machineZh: "临968F", kind: "bc", file: "bc-sdlg-968f.png" },
    { slug: "bc-lonking-862", partNumber: "BC-LONKING-862", brand: "Lonking", machineEn: "862", machineZh: "龙862", kind: "bc", file: "bc-lonking-862.png" },
    { slug: "bc-somer-50", partNumber: "BC-SOMER-50", brand: "Somer", machineEn: "50", machineZh: "索玛50", kind: "bc", file: "bc-somer-50.png" },
    { slug: "bc-liugong-50c", partNumber: "BC-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "bc", file: "bc-liugong-50c.png" },
    { slug: "bc-sdlg-953", partNumber: "BC-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "bc", file: "bc-sdlg-953.png" },
    { slug: "bc-xgma-50", partNumber: "BC-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "bc", file: "bc-xgma-50.png" },
    { slug: "bc-xcmg-500kv", partNumber: "BC-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "bc", file: "bc-xcmg-500kv.png" },
    { slug: "bc-changlin-50", partNumber: "BC-CHANGLIN-50", brand: "Changlin", machineEn: "50", machineZh: "常50", kind: "bc", file: "bc-changlin-50.png" },
    { slug: "bc-changlin-30", partNumber: "BC-CHANGLIN-30", brand: "Changlin", machineEn: "30", machineZh: "常30", kind: "bc", file: "bc-changlin-30.png" },
    { slug: "bc-chenggong-50", partNumber: "BC-CHENGGONG-50", brand: "Chenggong", machineEn: "50", machineZh: "成50", kind: "bc", file: "bc-chenggong-50.png" },
    { slug: "bc-chenggong-30", partNumber: "BC-CHENGGONG-30", brand: "Chenggong", machineEn: "30", machineZh: "成30", kind: "bc", file: "bc-chenggong-30.png" },
    { slug: "bc-liugong-835", partNumber: "BC-LIUGONG-835", brand: "Liugong", machineEn: "835", machineZh: "柳835", kind: "bc", file: "bc-liugong-835.png" },
    { slug: "bc-xcmg-500hv", partNumber: "BC-XCMG-500HV", brand: "XCMG", machineEn: "500HV", machineZh: "徐500HV", kind: "bc", file: "bc-xcmg-500hv.png" },
    { slug: "bc-xcmg-600f", partNumber: "BC-XCMG-600F", brand: "XCMG", machineEn: "600F", machineZh: "徐600F", kind: "bc", file: "bc-xcmg-600f.png" },
    { slug: "bc-liugong-856h", partNumber: "BC-LIUGONG-856H", brand: "Liugong", machineEn: "856H", machineZh: "柳856H", kind: "bc", file: "bc-liugong-856h.png" },
    { slug: "pch-sdlg-968f-front", partNumber: "PCH-SDLG-968F-FRONT", brand: "SDLG", machineEn: "968F front", machineZh: "临968F前", kind: "pch", file: "pch-sdlg-968f-front.png" },
    { slug: "pch-sdlg-968f-rear", partNumber: "PCH-SDLG-968F-REAR", brand: "SDLG", machineEn: "968F rear", machineZh: "临968F后", kind: "pch", file: "pch-sdlg-968f-rear.png" },
    { slug: "pch-lonking-862-a", partNumber: "PCH-LONKING-862-A", brand: "Lonking", machineEn: "862", machineZh: "龙862", kind: "pch", file: "pch-lonking-862-a.png" },
    { slug: "pch-sdlg-975", partNumber: "PCH-SDLG-975", brand: "SDLG", machineEn: "975", machineZh: "临975", kind: "pch", file: "pch-sdlg-975.png" },
    { slug: "pch-sdlg-968", partNumber: "PCH-SDLG-968", brand: "SDLG", machineEn: "968", machineZh: "临968", kind: "pch", file: "pch-sdlg-968.png" },
    { slug: "pch-sdlg-956", partNumber: "PCH-SDLG-956", brand: "SDLG", machineEn: "956", machineZh: "临956", kind: "pch", file: "pch-sdlg-956.png" },
    { slug: "pch-sdlg-953", partNumber: "PCH-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "pch", file: "pch-sdlg-953.png" },
    { slug: "pch-sdlg-933", partNumber: "PCH-SDLG-933", brand: "SDLG", machineEn: "933", machineZh: "临933", kind: "pch", file: "pch-sdlg-933.png" },
    { slug: "pch-liugong-862-bearing", partNumber: "PCH-LIUGONG-862-BEARING", brand: "Liugong", machineEn: "862 Bearing type", machineZh: "柳862（轴承式）", kind: "pch", file: "pch-liugong-862-bearing.png" },
    { slug: "pch-liugong-862-lock", partNumber: "PCH-LIUGONG-862-LOCK", brand: "Liugong", machineEn: "862 Lock type", machineZh: "柳862（锁片式）", kind: "pch", file: "pch-liugong-862-lock.png" },
    { slug: "pch-liugong-50c", partNumber: "PCH-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "pch", file: "pch-liugong-50c.png" },
    { slug: "pch-liugong-855n", partNumber: "PCH-LIUGONG-855N", brand: "Liugong", machineEn: "855N", machineZh: "柳855N", kind: "pch", file: "pch-liugong-855n.png" },
    { slug: "pch-lonking-862-b", partNumber: "PCH-LONKING-862-B", brand: "Lonking", machineEn: "862 hub", machineZh: "龙862轮毂", kind: "pch", file: "pch-lonking-862-b.png" },
    { slug: "pch-xgma-50", partNumber: "PCH-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "pch", file: "pch-xgma-50.png" },
    { slug: "pch-chenggong-955", partNumber: "PCH-CHENGGONG-955", brand: "Chenggong", machineEn: "955", machineZh: "成955", kind: "pch", file: "pch-chenggong-955.png" },
    { slug: "pch-ensign-50", partNumber: "PCH-ENSIGN-50", brand: "Ensign", machineEn: "50", machineZh: "英轩50", kind: "pch", file: "pch-ensign-50.png" },
    { slug: "pg-sdlg-968f-front", partNumber: "PG-SDLG-968F-FRONT", brand: "SDLG", machineEn: "968F front", machineZh: "临968F前", kind: "pg", file: "pg-sdlg-968f-front.png" },
    { slug: "pg-sdlg-968f-rear", partNumber: "PG-SDLG-968F-REAR", brand: "SDLG", machineEn: "968F rear", machineZh: "临968F后", kind: "pg", file: "pg-sdlg-968f-rear.png" },
    { slug: "pg-liugong-862-bearing", partNumber: "PG-LIUGONG-862-BEARING", brand: "Liugong", machineEn: "862 Bearing type", machineZh: "柳862（轴承式）", kind: "pg", file: "pg-liugong-862-bearing.png" },
    { slug: "pg-liugong-862-lock", partNumber: "PG-LIUGONG-862-LOCK", brand: "Liugong", machineEn: "862 Lock type", machineZh: "柳862（锁片式）", kind: "pg", file: "pg-liugong-862-lock.png" },
    { slug: "pg-sdlg-975", partNumber: "PG-SDLG-975", brand: "SDLG", machineEn: "975", machineZh: "临975", kind: "pg", file: "pg-sdlg-975.png" },
    { slug: "pg-lovol-60", partNumber: "PG-LOVOL-60", brand: "LOVOL", machineEn: "60", machineZh: "福田60", kind: "pg", file: "pg-lovol-60.png" },
    { slug: "pg-liugong-50c", partNumber: "PG-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "pg", file: "pg-liugong-50c.png" },
    { slug: "pg-sdlg-953n", partNumber: "PG-SDLG-953N", brand: "SDLG", machineEn: "953N", machineZh: "临953N", kind: "pg", file: "pg-sdlg-953n.png" },
    { slug: "sg-sdlg-953", partNumber: "SG-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "sg", file: "sg-sdlg-953.png" },
    { slug: "sg-liugong-50c", partNumber: "SG-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "sg", file: "sg-liugong-50c.png" },
    { slug: "sg-xcmg-500kv", partNumber: "SG-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "sg", file: "sg-xcmg-500kv.png" },
    { slug: "sg-lovol-60-rear", partNumber: "SG-LOVOL-60-REAR", brand: "LOVOL", machineEn: "60 rear", machineZh: "福田60后", kind: "sg", file: "sg-lovol-60-rear.png" },
    { slug: "sgs-sdlg-968-front", partNumber: "SGS-SDLG-968-FRONT", brand: "SDLG", machineEn: "968 front", machineZh: "临968前", kind: "sgs", file: "sgs-sdlg-968-front.png" },
    { slug: "sgs-sdlg-975", partNumber: "SGS-SDLG-975", brand: "SDLG", machineEn: "975", machineZh: "临975", kind: "sgs", file: "sgs-sdlg-975.png" },
    { slug: "sgs-liugong-862-lock", partNumber: "SGS-LIUGONG-862-LOCK", brand: "Liugong", machineEn: "862 Lock type", machineZh: "柳862（锁片式）", kind: "sgs", file: "sgs-liugong-862-lock.png" },
    { slug: "sgs-liugong-862-bearing", partNumber: "SGS-LIUGONG-862-BEARING", brand: "Liugong", machineEn: "862 Bearing type", machineZh: "柳862（轴承式）", kind: "sgs", file: "sgs-liugong-862-bearing.png" },
    { slug: "gbs-sdlg-956", partNumber: "GBS-SDLG-956", brand: "SDLG", machineEn: "956", machineZh: "临956", kind: "gbs", file: "gbs-sdlg-956.png" },
    { slug: "gbs-sdlg-955f", partNumber: "GBS-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "gbs", file: "gbs-sdlg-955f.png" },
    { slug: "gbs-liugong-850h", partNumber: "GBS-LIUGONG-850H", brand: "Liugong", machineEn: "850H", machineZh: "柳850H", kind: "gbs", file: "gbs-liugong-850h.png" },
    { slug: "gbs-xgma-50", partNumber: "GBS-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "gbs", file: "gbs-xgma-50.png" },
    { slug: "gbs-lovol-50", partNumber: "GBS-LOVOL-50", brand: "LOVOL", machineEn: "50", machineZh: "福50", kind: "gbs", file: "gbs-lovol-50.png" },
    { slug: "gbs-lovol-50-efi", partNumber: "GBS-LOVOL-50-EFI", brand: "LOVOL", machineEn: "50 EFI", machineZh: "福50电喷", kind: "gbs", file: "gbs-lovol-50-efi.png" },
    { slug: "gbs-liugong-50cn", partNumber: "GBS-LIUGONG-50CN", brand: "Liugong", machineEn: "50CN", machineZh: "柳50CN", kind: "gbs", file: "gbs-liugong-50cn.png" },
    { slug: "gbs-advance-50", partNumber: "GBS-ADVANCE-50", brand: "Advance", machineEn: "50", machineZh: "杭齿50", kind: "gbs", file: "gbs-advance-50.png" },
    { slug: "gbr-sdlg-955f", partNumber: "GBR-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "gbr", file: "gbr-sdlg-955f.png" },
    { slug: "gbr-xcmg-500kv", partNumber: "GBR-XCMG-500KV", brand: "XCMG", machineEn: "500KV", machineZh: "徐500KV", kind: "gbr", file: "gbr-xcmg-500kv.png" },
    { slug: "gbr-liugong-856h", partNumber: "GBR-LIUGONG-856H", brand: "Liugong", machineEn: "856H", machineZh: "柳856H", kind: "gbr", file: "gbr-liugong-856h.png" },
    { slug: "gbr-xgma-50", partNumber: "GBR-XGMA-50", brand: "XGMA", machineEn: "50", machineZh: "厦50", kind: "gbr", file: "gbr-xgma-50.png" },
    { slug: "gbf-xcmg-500k", partNumber: "GBF-XCMG-500K", brand: "XCMG", machineEn: "500K", machineZh: "徐500K", kind: "gbf", file: "gbf-xcmg-500k.png" },
    { slug: "gbf-lonking-855", partNumber: "GBF-LONKING-855", brand: "Lonking", machineEn: "855", machineZh: "龙855", kind: "gbf", file: "gbf-lonking-855.png" },
    { slug: "gbf-liugong-850h", partNumber: "GBF-LIUGONG-850H", brand: "Liugong", machineEn: "850H", machineZh: "柳850H", kind: "gbf", file: "gbf-liugong-850h.png" },
    { slug: "gbf-sdlg-955f", partNumber: "GBF-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "gbf", file: "gbf-sdlg-955f.png" },
    { slug: "ps-sdlg", partNumber: "PS-SDLG", brand: "SDLG", machineEn: "Pin and sleeve", machineZh: "临-销轴套系列", kind: "ps", file: "ps-sdlg.png" },
    { slug: "ps-lonking", partNumber: "PS-LONKING", brand: "Lonking", machineEn: "Pin and sleeve", machineZh: "龙-销轴套系列", kind: "ps", file: "ps-lonking.png" },
    { slug: "ps-liugong", partNumber: "PS-LIUGONG", brand: "Liugong", machineEn: "Pin and sleeve", machineZh: "柳-销轴套系列", kind: "ps", file: "ps-liugong.png" },
    { slug: "ps-xcmg", partNumber: "PS-XCMG", brand: "XCMG", machineEn: "Pin and sleeve", machineZh: "徐-销轴套系列", kind: "ps", file: "ps-xcmg.png" },
    { slug: "rk-sdlg-955f", partNumber: "RK-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "rk", file: "rk-sdlg-955f.png" },
    { slug: "rk-sdlg-953", partNumber: "RK-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "rk", file: "rk-sdlg-953.png" },
    { slug: "rk-sdlg-955fc", partNumber: "RK-SDLG-955FC", brand: "SDLG", machineEn: "955FC", machineZh: "临955FC", kind: "rk", file: "rk-sdlg-955fc.png" },
    { slug: "rk-sdlg-968f", partNumber: "RK-SDLG-968F", brand: "SDLG", machineEn: "968F", machineZh: "临968F", kind: "rk", file: "rk-sdlg-968f.png" },
    { slug: "rk-liugong-50c", partNumber: "RK-LIUGONG-50C", brand: "Liugong", machineEn: "50C", machineZh: "柳50C", kind: "rk", file: "rk-liugong-50c.png" },
    { slug: "rk-liugong-50cn", partNumber: "RK-LIUGONG-50CN", brand: "Liugong", machineEn: "50CN", machineZh: "柳50CN", kind: "rk", file: "rk-liugong-50cn.png" },
    { slug: "rk-liugong-856", partNumber: "RK-LIUGONG-856", brand: "Liugong", machineEn: "856", machineZh: "柳856", kind: "rk", file: "rk-liugong-856.png" },
    { slug: "rk-liugong-850h-new", partNumber: "RK-LIUGONG-850H-NEW", brand: "Liugong", machineEn: "850H New Pattern", machineZh: "柳850H（新款）", kind: "rk", file: "rk-liugong-850h-new.png" },
    { slug: "rk-lonking-856", partNumber: "RK-LONKING-856", brand: "Lonking", machineEn: "856", machineZh: "龙856", kind: "rk", file: "rk-lonking-856.png" },
    { slug: "rk-lonking-855n", partNumber: "RK-LONKING-855N", brand: "Lonking", machineEn: "855N", machineZh: "龙855N", kind: "rk", file: "rk-lonking-855n.png" },
    { slug: "rk-xcmg-500kl", partNumber: "RK-XCMG-500KL", brand: "XCMG", machineEn: "500KL", machineZh: "徐500KL", kind: "rk", file: "rk-xcmg-500kl.png" },
    { slug: "rk-lovol-956", partNumber: "RK-LOVOL-956", brand: "LOVOL", machineEn: "956", machineZh: "福956", kind: "rk", file: "rk-lovol-956.png" },
    { slug: "sf-a-lonking-855", partNumber: "SF-A-LONKING-855", brand: "Lonking", machineEn: "855", machineZh: "龙855", kind: "sf", file: "sf-a-lonking-855.png" },
    { slug: "sf-a-sdlg-956", partNumber: "SF-A-SDLG-956", brand: "SDLG", machineEn: "956", machineZh: "临956", kind: "sf", file: "sf-a-sdlg-956.png" },
    { slug: "sf-a-sdlg-953", partNumber: "SF-A-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "sf", file: "sf-a-sdlg-953.png" },
    { slug: "sf-a-doosan-50", partNumber: "SF-A-DOOSAN-50", brand: "Doosan", machineEn: "50", machineZh: "斗50", kind: "sf", file: "sf-a-doosan-50.png" },
    { slug: "sf-b-lonking-855", partNumber: "SF-B-LONKING-855", brand: "Lonking", machineEn: "855", machineZh: "龙855", kind: "sf", file: "sf-b-lonking-855.png" },
    { slug: "sf-b-sdlg-956", partNumber: "SF-B-SDLG-956", brand: "SDLG", machineEn: "956", machineZh: "临956", kind: "sf", file: "sf-b-sdlg-956.png" },
    { slug: "sf-b-sdlg-953", partNumber: "SF-B-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "sf", file: "sf-b-sdlg-953.png" },
    { slug: "sf-b-doosan-50", partNumber: "SF-B-DOOSAN-50", brand: "Doosan", machineEn: "50", machineZh: "斗50", kind: "sf", file: "sf-b-doosan-50.png" },
    { slug: "la-sdlg-953", partNumber: "LA-SDLG-953", brand: "SDLG", machineEn: "953", machineZh: "临953", kind: "la", file: "la-sdlg-953.png" },
    { slug: "la-sdlg-955f", partNumber: "LA-SDLG-955F", brand: "SDLG", machineEn: "955F", machineZh: "临955F", kind: "la", file: "la-sdlg-955f.png" },
    { slug: "la-sdlg-970", partNumber: "LA-SDLG-970", brand: "SDLG", machineEn: "970", machineZh: "临970", kind: "la", file: "la-sdlg-970.png" },
    { slug: "la-sdlg-968f-std", partNumber: "LA-SDLG-968F-STD", brand: "SDLG", machineEn: "968F Standard", machineZh: "临968F（标准）", kind: "la", file: "la-sdlg-968f-std.png" },
    { slug: "la-sdlg-968f-long", partNumber: "LA-SDLG-968F-LONG", brand: "SDLG", machineEn: "968F Lengthen", machineZh: "临968F（加长）", kind: "la", file: "la-sdlg-968f-long.png" },
    { slug: "la-xcmg-500k", partNumber: "LA-XCMG-500K", brand: "XCMG", machineEn: "500K", machineZh: "徐500K", kind: "la", file: "la-xcmg-500k.png" },
    { slug: "la-liugong-860", partNumber: "LA-LIUGONG-860", brand: "Liugong", machineEn: "860", machineZh: "柳860", kind: "la", file: "la-liugong-860.png" },
    { slug: "la-lovol-955", partNumber: "LA-LOVOL-955", brand: "LOVOL", machineEn: "955", machineZh: "福955", kind: "la", file: "la-lovol-955.png" },
  ] as const
).map(driveDiffPart);

export const products: Product[] = [...productSeed, ...driveDiffCatalog].filter(
  (product) => product.categorySlug !== "lubrication-parts",
);

const chineseMachineBrands = new Set([
  "sdlg",
  "lonking",
  "liugong",
  "xcmg",
  "xgma",
  "lovol",
  "yunyu",
  "sany",
  "shantui",
  "somer",
  "advance",
  "chenggong",
  "cem",
  "changlin",
  "ensign",
]);

export function isChineseMachineBrand(brand: string) {
  return chineseMachineBrands.has(brand.toLowerCase());
}

export function getProductsByCategory(categorySlug: string) {
  if (categorySlug === "chinese-brand-parts") {
    return products.filter((product) => product.brands.some(isChineseMachineBrand));
  }
  return products.filter((p) => p.categorySlug === categorySlug);
}

const homeFeaturedBrakeSlugs = [
  "bd-sdlg-956",
  "bd-liugong-50c",
  "bd-lonking-60",
  "bd-xcmg-600f-front",
] as const;

const homeFeaturedRadiatorSlugs = [
  "rad-sdlg-953-2",
  "rad-xcmg-321",
  "rad-liugong-50cn",
  "rad-xgma-955",
] as const;

function productsBySlug(slugs: readonly string[]) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((product): product is Product => Boolean(product));
}

export function getHomeFeaturedProducts() {
  return {
    brakeDiscs: productsBySlug(homeFeaturedBrakeSlugs),
    radiators: productsBySlug(homeFeaturedRadiatorSlugs),
  };
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

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[\s\-_/.]/g, "");
}

const searchAliases: [string, string][] = [
  ["柳工", "liugong"],
  ["临工", "sdlg"],
  ["山东临工", "sdlg"],
  ["龙工", "lonking"],
  ["徐工", "xcmg"],
  ["厦工", "xgma"],
  ["常林", "changlin"],
  ["英轩", "ensign"],
  ["成工", "chenggong"],
  ["杭齿", "advance"],
  ["主传动", "maindrive"],
  ["差速器", "differential"],
  ["刹车盘", "brakedisc"],
  ["制动盘", "brakedisc"],
  ["制动钳", "caliper"],
  ["散热器", "radiator"],
  ["水箱", "radiator"],
  ["大宇", "daewoo"],
  ["斗山", "doosan"],
  ["大宇", "doosan"],
];

function searchNeedles(query: string) {
  const raw = query.trim();
  const needles = new Set<string>([normalizeSearch(raw), raw.toLowerCase()]);
  const compact = normalizeSearch(raw);
  for (const [zh, en] of searchAliases) {
    const zhN = normalizeSearch(zh);
    const enN = normalizeSearch(en);
    if (compact.includes(zhN) || compact.includes(enN) || raw.includes(zh)) {
      needles.add(zhN);
      needles.add(enN);
    }
  }
  return [...needles].filter(Boolean);
}

function productSearchBlob(product: Product) {
  return [
    product.partNumber,
    product.slug,
    product.name.en,
    product.name.zh,
    product.description.en,
    product.description.zh,
    product.oemRef,
    product.oemPart,
    product.brands.join(" "),
    product.compatibleMachines,
    ...product.specs.map((spec) => `${spec.value.en} ${spec.value.zh}`),
    ...product.technicalSpecs.map((spec) => `${spec.value.en} ${spec.value.zh}`),
  ]
    .filter(Boolean)
    .join(" ");
}

function productMatchesQuery(product: Product, needles: string[]) {
  const blob = productSearchBlob(product);
  const compact = normalizeSearch(blob);
  const lower = blob.toLowerCase();
  return needles.some((needle) => compact.includes(needle) || lower.includes(needle));
}

function matchScore(product: Product, compactQuery: string) {
  const pn = normalizeSearch(product.partNumber);
  if (pn === compactQuery) return 100;
  if (pn.startsWith(compactQuery)) return 80;
  if (normalizeSearch(product.name.zh).includes(compactQuery)) return 60;
  if (normalizeSearch(product.name.en).includes(compactQuery)) return 50;
  return 30;
}

export function searchProducts(query: string) {
  const raw = query.trim();
  if (!raw) return [];
  const needles = searchNeedles(raw);
  const compact = normalizeSearch(raw);
  return products
    .filter((product) => productMatchesQuery(product, needles))
    .sort((a, b) => matchScore(b, compact) - matchScore(a, compact));
}

export type ProductSearchHit = {
  href: string;
  partNumber: string;
  name: { en: string; zh: string };
  image: string;
};

export function suggestProducts(query: string, limit = 8): ProductSearchHit[] {
  return searchProducts(query)
    .slice(0, limit)
    .map((product) => ({
      href: `/parts/${product.categorySlug}/${product.slug}`,
      partNumber: product.partNumber,
      name: product.name,
      image: product.image,
    }));
}

export function productMatchesFilter(product: Product, filterId: string) {
  if (filterId === "inStock") return product.inStock;
  if (filterId === "mainDrive") return product.slug.startsWith("md-");
  if (filterId === "planetCarrier") return product.slug.startsWith("pc-");
  if (filterId === "carrierHousing") return product.slug.startsWith("pch-");
  if (filterId === "planetGear") return product.slug.startsWith("pg-");
  if (filterId === "sunGear") {
    return product.slug.startsWith("sg-") || product.slug.startsWith("sgs-");
  }
  if (filterId === "gearRing") return product.slug.startsWith("gr-");
  if (filterId === "supportShaft") return product.slug.startsWith("ss-");
  if (filterId === "axleHousing") return product.slug.startsWith("ah-");
  if (filterId === "halfShaft") return product.slug.startsWith("hs-");
  if (filterId === "vrtSeries") return product.slug.startsWith("vrt-");
  if (filterId === "gearboxAssy") return product.slug.startsWith("gba-");
  if (filterId === "gearboxHousing") return product.slug.startsWith("gbh-");
  if (filterId === "torqueHousing") return product.slug.startsWith("th-");
  if (filterId === "gearAssy") {
    return (
      product.slug.startsWith("gea-") ||
      product.slug.startsWith("geb-") ||
      product.slug.startsWith("gec-") ||
      product.slug.startsWith("ges-")
    );
  }
  if (filterId === "gearboxGear") {
    return product.slug.startsWith("gbg-") || product.slug.startsWith("gbr-");
  }
  if (filterId === "gearboxShaft") return product.slug.startsWith("gbs-");
  if (filterId === "gearboxFlange") return product.slug.startsWith("gbf-");
  if (filterId === "swingFrame") return product.slug.startsWith("sf-");
  if (filterId === "linkArm") return product.slug.startsWith("la-");
  if (filterId === "pinSleeve") return product.slug.startsWith("ps-");
  if (filterId === "repairKit") return product.slug.startsWith("rk-");
  if (filterId === "differential") return product.slug.startsWith("diff-");
  if (filterId === "brakeDisc") return product.slug.startsWith("bd-");
  if (filterId === "brakeCaliper") return product.slug.startsWith("bc-");
  if (filterId === "electric") {
    return product.specs.some((spec) => spec.labelKey === "voltage");
  }
  if (filterId === "pneumatic") {
    return product.specs.some((spec) => spec.labelKey === "pressureRatio");
  }
  if (filterId === "ht250") {
    return [...product.specs, ...product.technicalSpecs].some((spec) =>
      `${spec.value.en} ${spec.value.zh}`.toUpperCase().includes("HT250"),
    );
  }
  if (filterId.startsWith("brand:")) {
    const brand = filterId.slice(6).toLowerCase();
    return product.brands.some((item) => item.toLowerCase() === brand);
  }
  return true;
}

export function filterProducts(list: Product[], selected: string[]) {
  if (selected.length === 0) return list;
  const wantsStock = selected.includes("inStock");
  const others = selected.filter((id) => id !== "inStock");
  return list.filter((product) => {
    if (wantsStock && !product.inStock) return false;
    if (others.length === 0) return true;
    return others.some((id) => productMatchesFilter(product, id));
  });
}
