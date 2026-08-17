---
name: b2b-sem
description: 临沂全球机械配件 B2B 独立站 SEM 投放策略。输出 Google Ads 结构、关键词分组、广告文案、落地页匹配与 UTM 追踪。用户提及 SEM、Google Ads、PPC、投放、广告、CPC、转化追踪时使用。
---

# B2B SEM

## 前置

1. 读 `.cursor/MEMORY.md` 与 `memory/work-log.md`
2. 确认落地页 URL 与询盘表单
3. 英文广告文案，定向东南亚 + 全球 B2B 采购

## 投放目标

- **主转化**：Request Quote 表单提交
- **次转化**：电话点击、WhatsApp 点击（如有）
- **否定**：零售、二手、免费、repair service（非供货）

## 账户结构

```
Account: Linyi Songyu International Trade
├── Campaign: Brand
│   └── Ad Group: Brand Terms
├── Campaign: Generic - Heavy Machinery Parts
│   ├── AG: Spare Parts Generic
│   ├── AG: OEM Parts
│   └── AG: Wholesale / Supplier
├── Campaign: Category - Transmission
│   └── AG: Transmission Assembly / Gearbox Parts
├── Campaign: Category - Hydraulic
│   └── AG: Hydraulic Pump / Cylinder Parts
└── Campaign: Remarketing (Display/PMax)
    └── Audience: Quote Page Visitors, 30d
```

## 关键词分组

### Brand
- linyi songyu
- linyi songyu international trade
- linyi songyu machinery parts

### Generic
- heavy machinery spare parts supplier
- construction equipment parts wholesale
- OEM spare parts manufacturer China
- mining equipment parts supplier

### Category
- transmission assembly spare parts
- excavator undercarriage parts supplier
- hydraulic pump parts wholesale

### Part Number（Exact，视 SKU 量分批）
- `{part number}`
- `{OEM number} replacement`

### 否定关键词（账户级）
- free, cheap, used, second hand, repair, manual pdf, diagram only, salary, job

## 匹配类型

| 类型 | 用途 |
|------|------|
| Exact | 品牌词、零件号 |
| Phrase | 品类词、OEM 词 |
| Broad（谨慎） | 仅配合 Smart Bidding + 充足否定词 |

## 广告文案模板

### RSA 结构（每 Ad Group 15 标题 + 4 描述）

**Headlines（≤30 字符）**
1. `{Primary Keyword}` — 关键词插入
2. OEM Compatible Parts
3. 10+ Years Experience
4. 24H Dispatch Linyi Hub
5. Request Quote Today
6. Wholesale Spare Parts
7. Southeast Asia Shipping
8. Quality Inspected Parts
9. `{Category}` Specialist
10. Direct Factory Supply

**Descriptions（≤90 字符）**
1. OEM-compatible heavy machinery spare parts. Quality inspected. Request a quote in 24 hours.
2. Linyi Songyu: transmission, hydraulic & undercarriage parts. Fast dispatch to Southeast Asia.
3. Trusted supplier for fleet managers. Part number search. Bulk pricing available.
4. ISO-quality control. Secure packaging. Get your quote — no minimum for inquiry.

### 路径
- Path1: Parts
- Path2: Quote

## 落地页匹配

| 广告组 | 落地页 | 一致性要求 |
|--------|--------|------------|
| Brand | 首页 | Hero 含品牌名 |
| Generic Spare Parts | 目录页 / 首页 | H1 含 spare parts |
| Transmission | 传动详情或品类 | 页面含 transmission 关键词 |
| Part Number | 对应产品详情 | 标题含 exact part number |
| Quote Intent | /request-quote/ | 表单首屏可见 |

**质量得分要点**：关键词 ↔ 标题 ↔ 落地页 H1 三位一体。

## 预算与出价（参考）

| Campaign | 日预算占比 | 出价策略 |
|----------|------------|----------|
| Brand | 10% | Manual CPC 或 Max Clicks |
| Generic | 40% | Max Conversions（有数据后） |
| Category | 35% | Max Conversions |
| Remarketing | 15% | Target CPA |

初期数据不足时用 Max Clicks 或 Manual CPC 积累 30+ 转化后再切换。

## UTM 规范

```
?utm_source=google
&utm_medium=cpc
&utm_campaign={campaign_name}
&utm_content={ad_group}
&utm_term={keyword}
```

GA4 事件：
- `generate_lead` — 表单提交
- `click_phone` / `click_whatsapp` — 如有

## 转化追踪

1. Google Ads 转化：Quote Form Submit（Thank You 页或 GTM 触发）
2. 增强型转化：邮箱 + 国家（哈希）
3. 离线转化：CRM 回传 qualified lead（可选）

## A/B 测试优先级

1. 落地页：表单长度（短 vs 含零件号字段）
2. CTA：Request Quote vs Get Bulk Pricing
3. 广告：24H Dispatch vs Quality Inspected 主打

## 输出格式

```markdown
## SEM：[Campaign/Ad Group 名]
### 目标与预算
### 关键词列表（含匹配类型）
### 否定词
### 广告文案（Headlines + Descriptions）
### 落地页 URL + UTM 示例
### 转化追踪要点
### 优化建议
```

## 完成后

追加记录到 `.cursor/memory/work-log.md`
