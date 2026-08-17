---
name: b2b-seo
description: 临沂全球机械配件 B2B 独立站 SEO 优化。输出 Title/Meta、URL 结构、Heading 层级、Schema、内链与内容策略。用户提及 SEO、排名、关键词、Meta、Schema、sitemap、长尾词时使用。
---

# B2B SEO

## 前置

1. 读 `.cursor/MEMORY.md` 与 `memory/work-log.md`
2. 确认目标页面与已有 URL 结构
3. 英文产出，面向 Google 国际搜索

## 站点 SEO 架构

```
/                                    首页
/parts/                              目录
/parts/{category}/                   品类页
/parts/{category}/{part-slug}/       产品详情
/quality-logistics/                  质检物流
/request-quote/                      询盘
/about/                              关于（待建）
```

URL 规则：小写、连字符、含品类或零件号关键词，无 ID 参数。

## 关键词策略

### 核心词（首页 / 品类）
- heavy machinery spare parts
- construction equipment parts supplier
- OEM spare parts Linyi
- mining machinery parts wholesale

### 品类词
- transmission assembly parts
- hydraulic pump spare parts
- undercarriage parts excavator
- engine parts heavy equipment

### 长尾词（详情 / 博客）
- `{OEM number} replacement part`
- `{brand} {model} transmission assembly`
- buy `{part number}` wholesale Southeast Asia

### 地域修饰
- Linyi China spare parts exporter
- machinery parts supplier for Southeast Asia

## 页面 SEO 清单

每页必输出：

| 字段 | 规范 |
|------|------|
| Title | 50–60 字符，主词靠前，品牌后缀 `\| Linyi Songyu` |
| Meta Description | 140–160 字符，含 CTA（Request Quote） |
| H1 | 唯一，含主关键词 |
| H2–H3 | 逻辑层级，不跳级 |
| Canonical | 绝对 URL |
| OG | title / description / image |

### Title 模板

- 首页：`Heavy Machinery Spare Parts Supplier \| Linyi Songyu`
- 品类：`{Category} Parts Wholesale \| OEM Compatible \| Linyi Songyu`
- 详情：`{Part Number} {Product Name} \| OEM {OEM List} \| Linyi Songyu`
- 质检：`Quality Control & Logistics \| Linyi Songyu`

## Schema  markup

### 全站
```json
Organization: name, url, logo, contactPoint, sameAs[]
WebSite: potentialAction SearchAction → /parts/?q=
```

### 产品页
```json
Product: name, sku(part number), brand, description, image,
         offers(availability, priceCurrency USD, price 0 或 Contact),
         manufacturer
BreadcrumbList
```

### 品类页
```json
CollectionPage + ItemList
BreadcrumbList
```

### FAQ（可选，详情/物流页）
```json
FAQPage
```

## 内链策略

- 首页 → 核心品类（≥3）
- 品类 → 热门产品 Top 10
- 详情 → 相关零件（同 OEM / 同总成）
- 全站 → Request Quote、Quality & Logistics
- 锚文本用零件号或品类名，不用「click here」

## 技术 SEO

- `lang="en"`，`hreflang` 预留
- 图片：WebP，alt=`{Part Number} {Category} spare part`
- robots.txt：Allow /，Disallow /admin/
- sitemap.xml：首页、品类、产品、静态页
- Core Web Vitals：LCP < 2.5s，CLS < 0.1
- 移动端优先索引

## 内容策略

| 类型 | 目的 | 频率 |
|------|------|------|
| 产品页 | 长尾 OEM 词 | 每 SKU |
| 品类页 | 品类核心词 | 每品类 |
| 兼容指南 | `{Brand} parts compatibility` | 按品牌 |
| 物流/质检 | E-E-A-T 信任 | 1 页 |
| 博客（可选） | 维护 tips、选型指南 | 2–4 篇/月 |

## 输出格式

```markdown
## SEO：[页面名]
### 目标关键词
主词 / 次词 / 长尾
### Title & Meta
### Heading 结构
H1 → H2 → H3
### URL
### Schema（JSON-LD）
### 内链建议
### 内容要点
```

## 完成后

追加记录到 `.cursor/memory/work-log.md`
