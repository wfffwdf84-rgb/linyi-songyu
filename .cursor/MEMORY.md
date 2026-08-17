# Memory · 项目记忆

> 每次创作前必读本文档与 `memory/work-log.md`，创作后追加工作日志。

## 品牌

| 项 | 值 |
|----|-----|
| 品牌名 | Linyi Songyu International Trade Co., Ltd |
| 定位 | 临沂全球工程机械配件 B2B 独立站 |
| 目标用户 | 东南亚车队管理、矿山/工程设备采购决策人 |
| 核心价值 | 可靠供应、零件号精准匹配、临沂仓快速发货、质检可追溯 |

## 设计系统

- 名称：Industrial Trust & Efficiency
- 路径：`stitch_linyi_machinery_b2b_global_platform/industrial_trust_efficiency/DESIGN.md`
- 风格：Corporate Modern + Industrial Brutalist
- 技术栈：Next.js 16 App Router、Tailwind CSS v4、TypeScript、Vercel 部署
- 项目路径：`web/`（Next.js 应用）
- 原型 HTML（已迁移，保留参考）：`stitch_linyi_machinery_b2b_global_platform/*/code.html`

## 已有页面

| 页面 | Next.js 路由 |
|------|------|
| 首页 | `/` · `/zh` |
| 零件目录 | `/parts/[category]` · `/zh/parts/[category]` |
| 产品详情 | `/parts/[category]/[slug]` |
| 质检物流 | `/quality-logistics` · `/zh/quality-logistics` |
| 询盘报价 | `/request-quote` · `/zh/request-quote` |

## 语言

- 默认：英语（无前缀 `/`）
- 第二语言：简体中文（`/zh`）
- 顶栏 **EN | 中文** 切换，保持当前路径

## 关键 UI 模式

- 零件号 / OEM 双模式搜索
- 信任徽章：10 Years Experience、24H Dispatch、Linyi Hub
- 产品卡：零件号为主标题，库存状态醒目
- 规格表：桌面斑马纹表格，移动端 spec cards
- 主 CTA：Heavy Duty Yellow 按钮「Add to Quote / Request Quote」

## SEO 基线

- 语言：英文（en）
- 核心词方向：heavy machinery parts、OEM spare parts、Linyi、transmission assembly、fleet parts
- 每页需独立 Title、Meta Description、H1
- 产品页需 Product Schema；站点需 Organization + BreadcrumbList

## SEM 基线

- 平台：Google Ads（Search + 可选 Performance Max）
- 落地页：产品详情 / 询盘页，与广告关键词一致
- 转化：Request Quote 表单提交
- UTM 规范：`utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_term={keyword}`

## 待定项

- [ ] 正式域名与 CDN 图片规范
- [ ] 多语言（泰语/印尼语）扩展计划
- [ ] Google Analytics / GTM 容器 ID
- [ ] 真实 OEM 兼容列表数据源

## 工作日志

详细记录见 → [memory/work-log.md](memory/work-log.md)

### 日志格式

```markdown
## YYYY-MM-DD · 任务简述

- **类型**：设计 | SEO | SEM
- **输入**：用户需求摘要
- **产出**：文件路径或交付物清单
- **决策**：关键设计/策略选择及原因
- **待办**：后续需确认或补充项
```
