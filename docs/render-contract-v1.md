# 站点渲染契约 v1

更新时间：2026-03-25  
适用范围：前台模板渲染、后台实时预览、发布快照组装  
目标：把模板层真正消费的数据结构定成统一 DTO，避免模板直接贴数据库表字段。

## 1. 为什么补这份契约

在原有文档里，数据库模型已经覆盖：

1. `navigation_items`
2. 项目视觉类型与封面字段
3. 联系方式图标来源字段
4. 首页区块开关与排序

但模板文档中的 `SiteRenderData` 还没有把这些字段完整收进来。  
如果继续按旧版本直接开发，会出现以下问题：

1. 模板中心、实时预览、正式发布消费的数据不一致
2. 模板要么直接读取数据库表，要么临时拼接字段
3. 新模板接入时需要反复补字段，容易返工

## 2. v1 契约边界

当前统一契约的实现位置：

1. `src/templates/types.ts`
2. `src/features/site/server/mock-site.ts`

设计原则：

1. 模板只接收 `SiteRenderData`
2. 发布快照中的前台渲染数据也应能还原为这份结构
3. 数据库存储仍然保持实体表设计，不把模板源码和样式写进数据库

## 3. v1 核心结构

`SiteRenderData` 现阶段包括：

1. `site`
2. `navigation`
3. `sections`
4. `hero`
5. `skills`
6. `projects`
7. `contacts`

### 3.1 `site`

用于站点级基础信息：

1. `title`
2. `subtitle`
3. `seoTitle`
4. `seoDescription`
5. `seoKeywords`
6. `footerText`
7. `icp`
8. `favicon`

### 3.2 `navigation`

补齐原模板契约中缺失的导航层：

1. `id`
2. `label`
3. `href`
4. `openInNewTab`
5. `isEnabled`
6. `sortOrder`

### 3.3 `sections`

用于前台模板和后台预览统一感知区块状态：

1. `key`
2. `title`
3. `isEnabled`
4. `sortOrder`
5. `config`

说明：

1. `navigation` 作为渲染模块存在于 DTO 中
2. `home_sections` 表本身仍然只保存当前约定的首页区块

### 3.4 `hero`

保留原有能力并补齐图片引用对象：

1. `greeting`
2. `name`
3. `titles`
4. `description`
5. `avatar`
6. `primaryAction`
7. `secondaryAction`

### 3.5 `skills`

分为分组和技能项两层：

1. 分组：`id`、`title`、`subtitle`、`sortOrder`、`isEnabled`
2. 技能项：`id`、`name`、`level`、`sortOrder`、`isEnabled`

### 3.6 `projects`

这里是这次补齐的重点之一：

1. `title`
2. `description`
3. `techStack`
4. `visual.type`
5. `visual.iconName`
6. `visual.cover`
7. `repoUrl`
8. `previewUrl`
9. `isFeatured`
10. `sortOrder`
11. `isEnabled`

这样模板既能做当前图标式卡片，也能做未来封面图模板。

### 3.7 `contacts`

这里同样补齐了图标层：

1. `type`
2. `label`
3. `value`
4. `href`
5. `icon.type`
6. `icon.name`
7. `icon.image`
8. `openInNewTab`
9. `sortOrder`
10. `isEnabled`

## 4. 配套类型

除 `SiteRenderData` 外，还统一了以下辅助类型：

1. `SectionKey`
2. `ImageAssetRef`
3. `TemplateManifest`
4. `TemplateSchema`
5. `TemplateRenderProps`
6. `SiteThemeState`

## 5. 实施要求

后续开发按以下规则执行：

1. 模板入口只接受 `TemplateRenderProps`
2. 后台预览层只拼装 `SiteRenderData + templateConfig + templateId`
3. 发布快照回放时，也要以这份契约作为前台渲染输入
4. 新增模板字段时，先改契约，再改模板和后台表单

## 6. 当前状态

当前仓库已落地：

1. `SiteRenderData v1`
2. 显式模板注册表
3. `neon-tech` 与 `minimal-card` 两套模板
4. 后台 Dashboard / Content / Templates / Media / Publish / Settings 页面骨架
5. Prisma 7 数据模型骨架

这意味着项目已经从“文档阶段”进入“可持续迭代的工程骨架阶段”。
