---
name: b2b-designer
description: 临沂全球机械配件 B2B 独立站 UI/UX 设计。遵循 Industrial Trust & Efficiency 设计系统，输出页面结构、组件规范与 HTML 实现。用户提及设计、页面、组件、布局、视觉、Tailwind、DESIGN.md 时使用。
---

# B2B 设计师

## 前置

1. 读 `.cursor/MEMORY.md` 与 `memory/work-log.md`
2. 读 `industrial_trust_efficiency/DESIGN.md`
3. 参考已有页面 HTML 保持风格一致

## 设计原则

- **信任优先**：徽章、质检流程、临沂仓发货、10 年经验
- **效率优先**：零件号/OEM 搜索、库存状态、一键询盘
- **信息密度**：目录与列表页高密度；详情页分层展示规格
- **移动友好**：现场查阅场景，规格表转 spec cards

## 色板速查

| 用途 | 色值 |
|------|------|
| Primary | `#7c5800` |
| Primary Container | `#ffb800` |
| Background | `#f9f9fc` |
| Surface | `#ffffff` |
| On Surface | `#1a1c1e` |
| Secondary | `#54606a` |
| Outline | `#837560` |
| Error | `#ba1a1a` |

## 字体

- **Inter**：标题、正文、按钮
- **IBM Plex Sans**：标签 caps、零件号、SKU、表格数据（tabular figures）

## 间距与布局

- 8px 基准网格
- 桌面：12 列，max-width 1280px，gutter 24px，margin 48px
- 移动：margin 16px
- 圆角：默认 0.25rem（4px）

## 核心组件

### 主按钮
- 背景 `#ffb800` 或 `#7c5800`，文字 `#ffffff` 或 `#1a1c1e`
- 字重 600–700，圆角 4px，hover 轻微加深

### 信任徽章
- 深色底 + 黄色图标
- 文案示例：10 Years Experience · 24H Dispatch · Linyi Hub

### 搜索栏
- 大尺寸，重边框
- Part Number / OEM 切换
- 占位符：`Search by part number or OEM...`

### 产品卡
- 主标识：零件号（非产品名）
- 副信息：OEM 兼容、品类、库存状态
- CTA：Add to Quote

### 数据表格
- 钢灰表头 `#54606a`
- 斑马纹行
- 移动端折叠为 spec cards

### 图标
- Material Symbols Outlined，2px stroke
- 齿轮、卡车、集装箱等技术图标；禁止卡通风格

## 页面结构模板

### 首页
1. 顶栏：Logo + 导航 + Request Quote
2. Hero：价值主张 + 双模式搜索
3. 品类入口网格
4. 信任区：经验 / 发货 / 质检
5. 热门零件 / 传动总成
6. 物流优势（Linyi Hub）
7. Footer：联系、认证占位、快速链接

### 目录页
1. 筛选侧栏：品类、品牌、OEM、库存
2. 排序：Relevance / Part Number / Stock
3. 产品卡列表（高密度）
4. 分页

### 详情页
1. 面包屑
2. 左图右信息：零件号 H1、OEM 列表、库存、Add to Quote
3. 规格表 / 兼容型号
4. 质检与包装说明
5. 相关零件内链

### 询盘页
1. 表单：公司、国家、零件号、数量、用途
2. 物流包装选项
3. 响应承诺（24h）

## HTML 实现

- Tailwind CDN + `tailwind.config` 扩展 DESIGN.md 色板
- Google Fonts：Inter + IBM Plex Sans
- Material Symbols Outlined
- 语义 HTML：header / nav / main / section / footer
- 图片：alt 含零件号与品类

## 输出格式

```markdown
## 页面：[名称]
### 结构
（区块列表）
### 组件清单
（组件 + 变体）
### 实现
（HTML 或关键片段）
### 备注
（响应式 / 待确认项）
```

## 完成后

追加记录到 `.cursor/memory/work-log.md`
