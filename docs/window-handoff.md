# 窗口交接文档

更新时间：2026-03-28  
用途：给新窗口 / 新会话快速恢复当前项目上下文，避免重新摸索代码结构和当前状态。

## 1. 项目当前状态

当前项目已经进入“可用 + 持续打磨”的阶段，不再是文档骨架。

当前已完成的主链路：

1. 前台首页可运行
2. 后台登录可用
3. PostgreSQL 已接通
4. Prisma migration 已落库
5. 默认开发数据已写入
6. Dashboard 已接真实数据
7. Settings 已拆成子页并接通真实读写
8. Content 已拆成子页并接通真实读写
9. 模板中心已接真实模板状态与预览
10. 媒体库已接真实上传、引用校验与删除
11. 前台首页读取当前最新保存内容

当前系统行为已经改为：

1. 保存后直接生效
2. 不再存在发布中心、发布快照和回滚流程
3. 模板切换和模板配置保存后会直接作用到当前站点

## 2. 当前可用账号

默认开发账号：

1. 邮箱：`admin@example.com`
2. 密码：`Admin123456!`

登录页：

1. `/admin/login`

## 3. 当前运行方式

环境变量参考：

1. [README.md](D:/code/Projects/myhome/README.md)
2. [.env.example](D:/code/Projects/myhome/.env.example)

常用命令：

```bash
npm run dev
npm run build
npm run lint
npm run prisma:generate
npx prisma migrate deploy
npm run dev:setup
```

默认本地地址：

1. 前台首页：`http://127.0.0.1:3000/`
2. 后台登录：`http://127.0.0.1:3000/admin/login`

## 4. 关键实现文件

### 前台与数据源

1. [page.tsx](D:/code/Projects/myhome/app/page.tsx)
2. [site-data.ts](D:/code/Projects/myhome/src/features/site/server/site-data.ts)
3. [site-metadata.ts](D:/code/Projects/myhome/src/features/site/server/site-metadata.ts)
4. [site-renderer.tsx](D:/code/Projects/myhome/src/features/site/components/site-renderer.tsx)

### 后台布局与通用组件

1. [layout.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/layout.tsx)
2. [admin-shell.tsx](D:/code/Projects/myhome/src/features/admin/components/admin-shell.tsx)
3. [admin-sidebar.tsx](D:/code/Projects/myhome/src/features/admin/components/admin-sidebar.tsx)
4. [admin-section-tabs.tsx](D:/code/Projects/myhome/src/features/admin/components/admin-section-tabs.tsx)

### Settings

1. [page.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/settings/site/page.tsx)
2. [page.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/settings/account/page.tsx)
3. [settings-subnav.tsx](D:/code/Projects/myhome/src/features/admin/components/settings-subnav.tsx)
4. [settings-editor.tsx](D:/code/Projects/myhome/src/features/admin/components/settings-editor.tsx)
5. [account-settings-editor.tsx](D:/code/Projects/myhome/src/features/admin/components/account-settings-editor.tsx)
6. [settings.ts](D:/code/Projects/myhome/src/features/admin/server/settings.ts)
7. [settings-actions.ts](D:/code/Projects/myhome/src/features/admin/server/settings-actions.ts)

### Content

1. [page.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/content/structure/page.tsx)
2. [page.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/content/hero/page.tsx)
3. [page.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/content/projects/page.tsx)
4. [page.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/content/skills/page.tsx)
5. [page.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/content/contacts/page.tsx)
6. [content-subnav.tsx](D:/code/Projects/myhome/src/features/admin/components/content-subnav.tsx)
7. [content-form-shared.tsx](D:/code/Projects/myhome/src/features/admin/components/content-form-shared.tsx)
8. [content-structure-editor.tsx](D:/code/Projects/myhome/src/features/admin/components/content-structure-editor.tsx)
9. [content-hero-editor.tsx](D:/code/Projects/myhome/src/features/admin/components/content-hero-editor.tsx)
10. [content-projects-editor.tsx](D:/code/Projects/myhome/src/features/admin/components/content-projects-editor.tsx)
11. [content-skills-editor.tsx](D:/code/Projects/myhome/src/features/admin/components/content-skills-editor.tsx)
12. [content-contacts-editor.tsx](D:/code/Projects/myhome/src/features/admin/components/content-contacts-editor.tsx)
13. [content.ts](D:/code/Projects/myhome/src/features/admin/server/content.ts)
14. [content-actions.ts](D:/code/Projects/myhome/src/features/admin/server/content-actions.ts)
15. [content-flash.ts](D:/code/Projects/myhome/src/features/admin/server/content-flash.ts)

### 模板中心

1. [page.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/templates/page.tsx)
2. [template-draft-editor.tsx](D:/code/Projects/myhome/src/features/admin/components/template-draft-editor.tsx)
3. [templates.ts](D:/code/Projects/myhome/src/features/admin/server/templates.ts)
4. [template-actions.ts](D:/code/Projects/myhome/src/features/admin/server/template-actions.ts)
5. [registry.ts](D:/code/Projects/myhome/src/templates/registry.ts)

### 媒体库

1. [page.tsx](D:/code/Projects/myhome/app/admin/(dashboard)/media/page.tsx)
2. [media-library.tsx](D:/code/Projects/myhome/src/features/admin/components/media-library.tsx)
3. [media.ts](D:/code/Projects/myhome/src/features/admin/server/media.ts)
4. [media-actions.ts](D:/code/Projects/myhome/src/features/admin/server/media-actions.ts)
5. [form-select.tsx](D:/code/Projects/myhome/src/shared/ui/form-select.tsx)
6. [media-select.tsx](D:/code/Projects/myhome/src/shared/ui/media-select.tsx)
7. [file-input.tsx](D:/code/Projects/myhome/src/shared/ui/file-input.tsx)

### 代表性模板

1. [entry.tsx](D:/code/Projects/myhome/src/templates/glow-vision/entry.tsx)
2. [styles.module.css](D:/code/Projects/myhome/src/templates/glow-vision/styles.module.css)
3. [particle-background.tsx](D:/code/Projects/myhome/src/templates/glow-vision/components/particle-background.tsx)
4. [hero-typing-line.tsx](D:/code/Projects/myhome/src/templates/glow-vision/components/hero-typing-line.tsx)

## 5. 当前最近完成的重构

最近这轮已经完成的重构重点：

1. 移除了发布中心与快照读取逻辑
2. 首页改成读取当前内容
3. 浏览器标题已接入动态 metadata
4. Settings 已拆成子页
5. Content 已拆成子页
6. Hero 已从 Settings 迁到 Content
7. 各子页已接入页面内二级导航
8. Hero / 项目 / 联系方式 已开始做互斥字段减噪
9. 本地媒体选择已支持缩略图
10. 媒体上传区已改成自定义文件选择器

## 6. 当前已知背景

1. 项目目录不是 git 仓库
2. 当前系统是“保存即生效”模型
3. `Content` 子页中的新增 / 删除 / 排序属于立即生效动作
4. `Content` 子页中的普通字段编辑属于显式保存动作
5. 媒体上传使用本地 `public/uploads/...`
6. `Glow Vision` 是当前最接近 `kek1.cn` 的模板

## 7. 当前更适合继续做的事

如果继续迭代，当前最合适的方向是：

1. 文档继续清理，尤其是方案文档里的旧发布模型描述
2. 后台移动端和平板端细节继续收尾
3. `Glow Vision` 继续按 `kek1.cn` 收细节
4. `Skills` 子页如果还觉得重，可以再压一轮密度

## 8. 可直接复制到新窗口的说明

```text
项目目录：D:\\code\\Projects\\myhome

这是一个已经进入可用阶段的个人主页内容系统，技术栈是 Next.js 16 + TypeScript + Prisma 7 + PostgreSQL + next-auth Credentials。

系统当前已经改成“保存即生效”，不再有发布中心、发布快照和回滚。

后台已拆成：
1. Settings
   - /admin/settings/site
   - /admin/settings/account
2. Content
   - /admin/content/structure
   - /admin/content/hero
   - /admin/content/projects
   - /admin/content/skills
   - /admin/content/contacts

默认测试账号：
email: admin@example.com
password: Admin123456!

关键文件：
1. src/features/admin/components/content-form-shared.tsx
2. src/features/admin/components/content-hero-editor.tsx
3. src/features/admin/components/content-projects-editor.tsx
4. src/features/admin/components/content-skills-editor.tsx
5. src/features/admin/components/content-contacts-editor.tsx
6. src/features/admin/components/settings-editor.tsx
7. src/features/admin/components/account-settings-editor.tsx
8. src/templates/glow-vision/entry.tsx

当前更适合继续做的是：
1. 文档清理
2. 后台移动端细节
3. Glow Vision 模板继续对齐 kek1.cn
```
