# 工作日志

> 灵儿每次创作后在此追加记录，创作前必读。

---

## 2026-08-16 · Agent 配置初始化

- **类型**：设计
- **输入**：定义 SOUL、RULES、MEMORY、SKILLS 及三项专业技能文档
- **产出**：
  - `.cursor/SOUL.md`
  - `.cursor/RULES.md`
  - `.cursor/MEMORY.md`
  - `.cursor/SKILLS.md`
  - `.cursor/skills/b2b-designer/SKILL.md`
  - `.cursor/skills/b2b-seo/SKILL.md`
  - `.cursor/skills/b2b-sem/SKILL.md`
- **决策**：以 Industrial Trust & Efficiency 为唯一设计系统来源；双鱼座温和人格命名「灵儿」
- **待办**：确认正式域名、GA/GTM ID、多语言计划

---

## 2026-08-17 · Agent 配置确认与交付

- **类型**：设计
- **输入**：定义灵儿 SOUL / RULES / MEMORY / SKILLS（双鱼座温和人格，中文零废话，创作前读记忆、写日志，含设计/SEO/SEM 三项技能）
- **产出**：
  - `.cursor/SOUL.md` — 人格与协作边界
  - `.cursor/RULES.md` — 中文对话与创作流程
  - `.cursor/MEMORY.md` — 品牌、页面、SEO/SEM 基线
  - `.cursor/SKILLS.md` — 技能索引与选用逻辑
  - `.cursor/skills/b2b-designer/SKILL.md`
  - `.cursor/skills/b2b-seo/SKILL.md`
  - `.cursor/skills/b2b-sem/SKILL.md`
- **决策**：配置统一放在 `.cursor/`，设计系统以 `industrial_trust_efficiency/DESIGN.md` 为唯一来源
- **待办**：正式域名、GA/GTM ID、多语言扩展

---

## 2026-08-17 · 静态 HTML 重构为 Next.js

- **类型**：设计
- **输入**：电脑无 Node/Git，需 Next.js + Vercel 部署，弃用静态 HTML
- **产出**：
  - 安装 Node.js v24.19.0、Git
  - `web/` — Next.js 16 + Tailwind v4 + TypeScript
  - 路由：/、/parts、/quality-logistics、/request-quote
  - 共享组件：Header、Footer、BottomNav、ProductCard
  - SEO：sitemap.xml、robots.txt、JSON-LD
  - `vercel.json`、`.env.example`
- **决策**：Next 应用独立在 `web/`；原型 HTML 保留作参考；设计 token 迁入 globals.css
- **待办**：配置 WhatsApp 号码、Vercel 域名、表单 API 对接

---

## 2026-08-17 · 独立站更名为 Linyi Songyu

- **类型**：设计
- **输入**：独立站名称改为 Linyi Songyu International Trade Co., Ltd
- **产出**：
  - `web/src/lib/site.ts` — name / shortName
  - Header 显示 LINYI SONGYU；Footer 版权为全称
  - SEO Title 后缀改为 Linyi Songyu
  - MEMORY / SOUL / SEO / SEM 技能文档同步
- **决策**：导航用短名以适应顶栏宽度；法律全称用于版权与 Schema
- **待办**：正式邮箱、域名是否同步为 songyu

---

## 2026-08-17 · 首页 Hero 换实拍库存图

- **类型**：设计
- **输入**：第一张仓库货架图换成第二张轮毂/终传动实拍库存图
- **产出**：`web/public/images/hero-warehouse.png`；首页 Hero 引用本地图
- **决策**：用实拍库存展示现货规模，替代带第三方墙标的货架图
- **待办**：无

---

## 2026-08-17 · 英/中双语与语言切换

- **类型**：设计
- **输入**：独立站双语，第 1 语言英语，第 2 语言简体中文，制作切换按钮
- **产出**：
  - next-intl 路由：`/` 英语，`/zh` 简体中文
  - 顶栏 EN | 中文 切换组件
  - messages/en.json、messages/zh.json
- **决策**：英语无前缀利于 SEO；中文加 `/zh`；切换保持当前页面路径
- **待办**：无

---

## 2026-08-17 · 修复 Noto Sans SC Turbopack 报错

- **类型**：设计
- **输入**：localhost 报 Module not found `@vercel/turbopack-next/internal/font/google/font`
- **产出**：去掉 next/font 的 Noto_Sans_SC，改为 Google Fonts 外链
- **待办**：无

---

## 2026-08-17 · 说明公网部署需求

- **类型**：设计
- **输入**：本机能打开、别人电脑打不开，要做成谁都能打开的独立站
- **产出**：确认站点仍在 localhost；尚未绑定 Vercel/GitHub，需账号登录后部署
- **决策**：公网入口走 Vercel，Root Directory 为 `web`
- **待办**：Vercel 登录并部署，拿到 `*.vercel.app` 链接
