# 模板开发规范文档

更新时间：2026-03-25  
适用范围：个人主页系统中的模板中心、模板开发、模板接入、模板维护  
文档目标：明确模板目录结构、文件职责、导出约定、后台读取方式、前台加载方式，确保后续新增模板时不返工、不混乱。

## 1. 设计目标

模板系统的目标不是“把一堆 HTML、CSS、JS 塞进来”，而是建立一套稳定的模板接入规范。

模板规范需要解决以下问题：

1. 新增模板时，目录结构统一。
2. 后台可以自动读取模板名称、预览图、配置项。
3. 前台可以按统一方式渲染模板。
4. 模板自己的样式和脚本不污染别的模板。
5. 模板切换、预览、发布、回滚都走同一套机制。

## 2. 根目录规范

项目中统一设置一个专门的模板根目录：

```text
src/templates/
```

规则如下：

1. 所有模板都必须放在 `src/templates/` 下。
2. 每个模板都必须是一个独立文件夹。
3. 模板自己的样式、脚本、组件、图片、预览图，都必须留在该模板目录中。
4. 模板之间禁止直接互相引用文件。
5. 模板只允许引用自己目录下的文件，或者引用 `src/shared/` 中的公共能力。

## 3. 模板目录结构

标准结构如下：

```text
src/
  templates/
    neon-tech/
      manifest.ts
      schema.ts
      entry.tsx
      styles/
        index.css
        hero.css
        projects.css
      scripts/
        index.ts
        particles.ts
        typing.ts
      components/
        Hero.tsx
        Skills.tsx
        Projects.tsx
        Contact.tsx
      assets/
        preview.png
        bg-grid.svg
```

允许的变体：

1. 文件少时，可以不拆 `styles/`、`scripts/`、`components/` 子目录，直接放在模板根目录。
2. 文件多时，按 `styles/`、`scripts/`、`components/`、`assets/` 分目录。
3. 无论是否拆子目录，模板文件都不能跑到模板目录外面散放。

## 4. 必选文件

每个模板至少需要以下 3 个文件：

1. `manifest.ts`
2. `schema.ts`
3. `entry.tsx`

标准模板同时具备：

1. `styles/` 或模板样式文件
2. `scripts/` 或模板脚本文件
3. `assets/preview.png`

## 5. 文件职责说明

### 5.1 `manifest.ts`

作用：

1. 提供模板的元信息。
2. 供后台模板中心展示使用。
3. 供系统识别模板能力和适配范围。

导出接口：

```ts
export interface TemplateManifest {
  id: string
  name: string
  version: string
  description: string
  cover: string
  tags: string[]
  supportedSections: string[]
  defaultConfig: Record<string, unknown>
}
```

字段说明：

1. `id`
   模板唯一标识，使用短横线命名，例如 `neon-tech`
2. `name`
   模板展示名称
3. `version`
   模板版本号，例如 `1.0.0`
4. `description`
   模板简介，用于后台展示
5. `cover`
   模板封面图路径，通常指向 `assets/preview.png`
6. `tags`
   风格标签，例如 `科技感`、`极简`、`卡片式`
7. `supportedSections`
   支持的页面模块，例如 `hero`、`skills`、`projects`、`contact`、`footer`
8. `defaultConfig`
   默认模板配置，首次启用模板时可直接使用

示例：

```ts
import preview from './assets/preview.png'

export const manifest = {
  id: 'neon-tech',
  name: 'Neon Tech',
  version: '1.0.0',
  description: '深色技术风单页模板，支持粒子背景和打字机效果。',
  cover: preview,
  tags: ['科技感', '深色', '动态效果'],
  supportedSections: ['hero', 'skills', 'projects', 'contact', 'footer'],
  defaultConfig: {
    accentColor: '#00f0ff',
    enableParticles: true,
    heroStyle: 'typing',
    cardStyle: 'glow',
  },
} satisfies TemplateManifest
```

### 5.2 `schema.ts`

作用：

1. 定义当前模板有哪些可配置项。
2. 后台根据 schema 动态生成模板配置表单。
3. 限制模板配置的数据结构，避免后台随意写死字段。

设计原则：

1. `schema.ts` 只描述模板配置，不描述站点内容。
2. 站点内容例如姓名、技能、项目，不放在这里定义。
3. `schema.ts` 定义的是“这个模板怎么表现”，不是“站点有什么内容”。

字段类型：

1. `text`
2. `textarea`
3. `switch`
4. `select`
5. `color`
6. `number`
7. `slider`
8. `group`

接口：

```ts
export type TemplateField =
  | {
      type: 'switch'
      key: string
      label: string
      description?: string
      defaultValue: boolean
    }
  | {
      type: 'color'
      key: string
      label: string
      description?: string
      defaultValue: string
    }
  | {
      type: 'select'
      key: string
      label: string
      description?: string
      defaultValue: string
      options: Array<{ label: string; value: string }>
    }
  | {
      type: 'slider'
      key: string
      label: string
      description?: string
      defaultValue: number
      min: number
      max: number
      step?: number
    }

export interface TemplateSchema {
  sections: Array<{
    key: string
    title: string
    fields: TemplateField[]
  }>
}
```

示例：

```ts
export const schema = {
  sections: [
    {
      key: 'appearance',
      title: '视觉样式',
      fields: [
        {
          type: 'color',
          key: 'accentColor',
          label: '强调色',
          defaultValue: '#00f0ff',
        },
        {
          type: 'select',
          key: 'cardStyle',
          label: '项目卡片风格',
          defaultValue: 'glow',
          options: [
            { label: '光晕', value: 'glow' },
            { label: '简洁', value: 'flat' },
          ],
        },
      ],
    },
    {
      key: 'effects',
      title: '模板效果',
      fields: [
        {
          type: 'switch',
          key: 'enableParticles',
          label: '粒子背景',
          defaultValue: true,
        },
        {
          type: 'slider',
          key: 'particleDensity',
          label: '粒子密度',
          defaultValue: 80,
          min: 20,
          max: 160,
          step: 10,
        },
      ],
    },
  ],
} satisfies TemplateSchema
```

### 5.3 `entry.tsx`

作用：

1. 作为模板渲染入口。
2. 接收统一的站点内容数据和模板配置。
3. 输出当前模板的页面结构。

接口：

```tsx
export interface SiteRenderData {
  site: {
    title: string
    subtitle?: string
    avatar?: string
    footerText?: string
    icp?: string
  }
  hero: {
    greeting?: string
    name: string
    titles: string[]
    description?: string
    primaryAction?: { label: string; href: string }
    secondaryAction?: { label: string; href: string }
  }
  skills: Array<{
    id: string
    title: string
    items: Array<{ name: string; level?: number }>
  }>
  projects: Array<{
    id: string
    title: string
    description: string
    techStack: string[]
    repoUrl?: string
    previewUrl?: string
  }>
  contacts: Array<{
    id: string
    type: string
    label: string
    value: string
    href?: string
  }>
}

export interface TemplateRenderProps {
  data: SiteRenderData
  config: Record<string, unknown>
  mode?: 'preview' | 'published'
}

export default function TemplateEntry(props: TemplateRenderProps) {
  return null
}
```

实现要求：

1. 只能接收统一数据，不直接查数据库。
2. 只负责渲染，不负责后台逻辑。
3. 模板内部可以拆分成多个组件，但统一从 `entry.tsx` 作为入口导出。

### 5.4 `scripts/index.ts`

作用：

1. 组织模板自己的动效与脚本逻辑。
2. 只在当前模板启用时加载。
3. 允许模板在挂载时注册动画、事件监听、粒子背景等行为。

接口：

```ts
export interface TemplateScriptContext {
  root: HTMLElement
  config: Record<string, unknown>
  mode?: 'preview' | 'published'
}

export type TemplateScriptCleanup = () => void

export function mountTemplateScripts(
  context: TemplateScriptContext,
): TemplateScriptCleanup | void {
  return undefined
}
```

实现要求：

1. 脚本必须支持销毁清理。
2. 绑定事件时必须在清理函数中解绑。
3. 不允许把所有模板脚本一次性加载到前台。

### 5.5 `styles/`

作用：

1. 存放模板自己的视觉样式。
2. 只服务于当前模板，不写公共样式。

样式规则：

1. 优先使用 CSS Modules，或至少使用稳定的模板根类名。
2. 避免使用全局选择器直接污染其他模板。
3. 可由 `styles/index.css` 作为样式总入口，再导入其他样式文件。

## 6. 模板注册机制

模板注册采用显式注册，不使用运行时自动扫描目录。

原因：

1. 显式注册更稳定。
2. 在 Next.js 打包环境下更容易控制动态导入。
3. 排查问题更直观。
4. 注册过程保持显式可见，便于排查问题。

注册文件：

```text
src/templates/registry.ts
```

示例：

```ts
export const templateRegistry = {
  'neon-tech': {
    manifest: () => import('./neon-tech/manifest').then((m) => m.manifest),
    schema: () => import('./neon-tech/schema').then((m) => m.schema),
    entry: () => import('./neon-tech/entry'),
    scripts: () => import('./neon-tech/scripts/index'),
  },
  'minimal-card': {
    manifest: () => import('./minimal-card/manifest').then((m) => m.manifest),
    schema: () => import('./minimal-card/schema').then((m) => m.schema),
    entry: () => import('./minimal-card/entry'),
    scripts: () => import('./minimal-card/scripts/index'),
  },
} as const
```

规则：

1. 后台模板中心通过 `manifest()` 读取模板列表。
2. 后台模板配置页通过 `schema()` 读取可配置项。
3. 前台渲染时通过 `entry()` 加载当前模板。
4. 需要模板脚本时，通过 `scripts()` 按需加载。

## 7. 后台读取流程

后台与模板的交互流程应固定如下：

1. 模板列表页读取每个模板的 `manifest.ts`
2. 展示模板名称、封面、简介、标签、支持模块
3. 进入模板详情后读取 `schema.ts`
4. 根据 `schema.ts` 动态生成表单
5. 保存模板配置到数据库中的 `site_theme_state.templateConfig`
6. 预览和发布时，将 `SiteRenderData + templateConfig + templateId` 传给前台渲染层

## 8. 前台加载流程

前台固定为以下流程：

```text
读取当前站点内容数据
-> 读取当前 templateId 和 templateConfig
-> 从 registry.ts 动态加载当前模板 entry.tsx
-> 如有需要，再动态加载当前模板 scripts/index.ts
-> 渲染页面
```

注意事项：

1. 未启用模板的脚本不加载。
2. 未启用模板的重型样式资源不参与运行。
3. 模板切换时需要卸载上一模板脚本并执行清理函数。

## 9. 配置存储规范

数据库只保存以下与模板相关的数据：

```ts
type SiteThemeState = {
  templateId: string
  templateConfig: Record<string, unknown>
  publishedSnapshotId: string | null
}
```

说明：

1. 不把模板源码存数据库。
2. 不把模板 CSS、JS 原文存数据库。
3. 数据库只保存“当前使用哪个模板”以及“该模板的配置值”。

## 10. 模板样式规范

规则：

1. 每个模板页面都应该有自己的根节点类名，例如 `.tpl-neon-tech`。
2. 所有模板样式尽量收敛到该根节点下。
3. 禁止直接改写 `body`, `a`, `button` 等全局元素，除非由模板根作用域包裹。
4. 若使用动画类名，也建议加模板前缀。

示例：

```css
.tpl-neon-tech {
  background: #0a0a1a;
  color: #e8e8f0;
}

.tpl-neon-tech .heroTitle {
  background: linear-gradient(135deg, #00f0ff, #7c3aed);
}
```

## 11. 模板脚本规范

规则：

1. 所有模板脚本只能操作自己的模板根节点。
2. 不直接查询整个 `document` 中的通用选择器。
3. 所有事件监听必须有清理逻辑。
4. 粒子背景、打字机、卡片光晕等属于模板脚本能力，不进入系统全局脚本。

不推荐写法：

```ts
document.querySelectorAll('.project-card')
```

推荐写法：

```ts
root.querySelectorAll('[data-role=\"project-card\"]')
```

## 12. 模板兼容性规范

每个模板都应能明确声明自己支持哪些模块。

如果模板不支持某模块：

1. 后台模板中心展示兼容性提示。
2. 预览时提示该模块将被隐藏或降级展示。
3. 发布前进行检查。

兼容模块枚举：

```ts
type SectionKey =
  | 'hero'
  | 'skills'
  | 'projects'
  | 'contact'
  | 'footer'
  | 'stats'
  | 'links'
```

## 13. 模板复制与新建规范

新增模板时以复制现有模板目录作为起点：

1. 复制一个现有模板目录
2. 修改目录名
3. 修改 `manifest.ts`
4. 修改 `schema.ts`
5. 修改 `entry.tsx`
6. 修改样式和脚本
7. 在 `registry.ts` 中注册
8. 补上 `preview.png`

这样比从零搭模板更稳，也更容易保证结构一致。

## 14. 强制约束

规则定死，不留模糊空间：

1. 模板必须有 `manifest.ts`
2. 模板必须有 `schema.ts`
3. 模板必须有 `entry.tsx`
4. 模板必须注册到 `src/templates/registry.ts`
5. 模板资源必须保留在模板目录内
6. 模板脚本必须支持销毁清理
7. 模板只能接收统一的 `SiteRenderData`

## 15. 最终结论

模板系统的正确做法不是“全局混放模板资源”，而是：

1. 一个统一的 `templates` 根目录
2. 每个模板一个独立目录
3. 每个模板独立管理自己的样式、脚本、组件、资源
4. 系统只负责模板注册、模板读取、模板渲染、模板发布
5. 内容数据全局统一，表现层完全模板化

这套规范最大的价值，不是当前能不能跑，而是模板多起来之后依然不会乱。
