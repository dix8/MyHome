# myhome

个人主页内容系统，包含：

1. 前台站点
2. 后台管理
3. 模板中心
4. 本地媒体库

当前仓库已经不是纯文档状态，而是一套可运行、可编辑、可维护的 Next.js 应用。

## 当前能力

当前已经完成：

1. `Next.js App Router + TypeScript + Prisma + PostgreSQL`
2. `Auth.js Credentials` 后台登录
3. 首页核心内容的后台编辑
4. 模板配置与后台预览
5. 本地媒体上传、列表、引用校验与资源选择
6. Dashboard 真实总览
7. Settings / Content 路由级拆分

当前后台已支持真实数据库读写的主要内容：

1. 站点设置 / SEO / 页脚 / ICP
2. 管理员账号
3. Hero 与导航
4. 技能分组与技能项
5. 项目
6. 联系方式
7. 模板状态
8. 媒体资源

## 技术栈

1. 框架：`Next.js 16`
2. 语言：`TypeScript`
3. 样式：`Tailwind CSS`
4. 数据库：`PostgreSQL`
5. ORM：`Prisma 7`
6. 鉴权：`next-auth` / `Auth.js Credentials`

## 目录概览

```text
app/
  admin/
  api/auth/
src/
  features/
  server/
  shared/
  templates/
prisma/
  migrations/
docs/
```

关键目录：

1. `app/`
   页面路由
2. `src/features/admin/`
   后台页面、server actions、后台组件
3. `src/features/site/`
   前台站点读取和渲染逻辑
4. `src/templates/`
   模板定义、schema、注册表
5. `prisma/`
   Prisma schema 与 migration

## 环境要求

1. `Node.js >= 24`
2. `PostgreSQL`

## 环境变量

参考 [.env.example](./.env.example)：

```env
DATABASE_URL="postgresql://postgres:your-password@127.0.0.1:5432/myhome"
AUTH_SECRET="replace-with-a-long-random-string-at-least-32-characters"
AUTO_BOOTSTRAP_ADMIN="true"
DEFAULT_ADMIN_EMAIL="admin@example.com"
DEFAULT_ADMIN_NAME="Admin"
DEFAULT_ADMIN_PASSWORD="Admin123456!"
```

说明：

1. `DATABASE_URL`
   指向本地或远程 PostgreSQL
2. `AUTH_SECRET`
   后台登录使用的密钥
3. `AUTO_BOOTSTRAP_ADMIN`
   是否启用首次自动初始化管理员，默认可设为 `true`
4. `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_NAME` / `DEFAULT_ADMIN_PASSWORD`
   当数据库里还没有任何管理员用户时，系统会使用这组信息自动创建默认管理员

## 安装

```bash
npm install
```

## 初始化

### 1. 生成 Prisma Client

```bash
npm run prisma:generate
```

### 2. 应用数据库迁移

生产或已有 migration 的开发库：

```bash
npx prisma migrate deploy
```

如果你是第一次本地开发，也可以使用：

```bash
npm run prisma:migrate
```

### 3. 可选：写入默认开发数据

推荐直接运行：

```bash
npm run dev:setup
```

它会完成：

1. 初始化默认站点内容
2. 初始化默认模板状态
3. 创建测试管理员账号

默认开发账号：

1. 邮箱：`admin@example.com`
2. 密码：`Admin123456!`

如果你只想单独创建或覆盖管理员：

```bash
npm run admin:create -- --email your@email.com --name Admin --password your-password
```

### 4. 首次启动自动初始化管理员

只要数据库里还没有任何管理员用户，系统会在首次访问后台登录或首次使用凭据登录时自动创建一个默认管理员。

默认读取：

1. `DEFAULT_ADMIN_EMAIL`
2. `DEFAULT_ADMIN_NAME`
3. `DEFAULT_ADMIN_PASSWORD`

如果这些环境变量没有设置：

1. 非生产环境会回退到：
   `admin@example.com` / `Admin123456!`
2. 生产环境不会自动使用硬编码默认值

## 启动开发服务

```bash
npm run dev
```

默认地址：

1. 前台首页：`http://127.0.0.1:3000/`
2. 后台登录：`http://127.0.0.1:3000/admin/login`

## Docker Compose 部署

如果你要通过 `docker compose` 部署，直接使用：

1. [.env.docker.example](./.env.docker.example)
2. [docker-compose.yml](./docker-compose.yml)
3. [Dockerfile](./Dockerfile)

当前 Compose 方案包含：

1. `PostgreSQL` 容器
2. `Next.js` 应用容器
3. 应用启动前自动执行 `prisma migrate deploy`
4. `public/uploads` 本地持久化卷

### 1. 准备环境变量

复制：

```bash
cp .env.docker.example .env.docker
```

至少修改：

1. `POSTGRES_PASSWORD`
2. `AUTH_SECRET`
3. `DEFAULT_ADMIN_EMAIL`
4. `DEFAULT_ADMIN_NAME`
5. `DEFAULT_ADMIN_PASSWORD`

注意：

1. `docker compose` 会自动根据 `POSTGRES_*` 变量拼出容器内部使用的 `DATABASE_URL`
2. 默认数据库名是 `myhome`，默认用户是 `postgres`

### 2. 启动服务

```bash
docker compose --env-file .env.docker up -d --build
```

这一步会：

1. 启动 PostgreSQL
2. 构建 Next.js 应用镜像
3. 应用容器启动前自动执行 `prisma migrate deploy`
4. 迁移成功后再启动应用

### 3. 首次初始化默认内容

如果你想写入默认站点内容、模板状态和测试管理员，启动完成后执行：

```bash
docker compose --env-file .env.docker exec app npm run setup:initial
```

如果你不执行：

1. 系统仍然可以启动
2. 首次访问后台登录时，如果数据库里还没有管理员，系统会自动创建默认管理员

### 4. 数据持久化

Compose 已经内置两个卷：

1. `postgres_data`
   PostgreSQL 数据
2. `uploads_data`
   本地上传目录，对应 `public/uploads`

这意味着：

1. 重建容器后数据库不会丢
2. 后台上传的图片不会丢

### 5. 常用命令

查看应用日志：

```bash
docker compose --env-file .env.docker logs -f app
```

重启应用：

```bash
docker compose --env-file .env.docker restart app
```

更新后重建：

```bash
docker compose --env-file .env.docker up -d --build
```

停止服务：

```bash
docker compose --env-file .env.docker down
```

## 常用命令

```bash
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run admin:create -- --email your@email.com --name Admin --password your-password
npm run dev:setup
```

## 已实现的关键流程

### 后台登录

1. 打开 `/admin/login`
2. 如果数据库里还没有管理员，系统会先自动初始化默认管理员
3. 使用管理员账号登录
4. 进入 `/admin`

### 内容编辑

当前 `Content` 已拆成多个子页：

1. `/admin/content/structure`
   模块开关、模块顺序、右下角后台入口开关
2. `/admin/content/hero`
   Hero 文案、头像、按钮、导航菜单
3. `/admin/content/projects`
   项目内容、封面、链接、推荐状态
4. `/admin/content/skills`
   技能分组、技能项、排序
5. `/admin/content/contacts`
   联系方式、图标、跳转链接、新窗口行为

当前 `Content` 子页仍支持：

1. 新增 / 删除
2. 上移 / 下移排序
3. 媒体资源联动

### 媒体联动

当前媒体库已接到：

1. Hero 头像
2. 项目封面
3. 联系方式图片图标

### 模板配置

模板中心支持：

1. 切换当前模板
2. 按 `schema.ts` 渲染配置表单
3. 保存模板状态
4. 后台站点预览

## 当前系统行为说明

1. 后台保存后，前台首页会在下一次请求时直接读取最新内容
2. `Settings` 已拆成：
   `/admin/settings/site` 和 `/admin/settings/account`
3. `Content` 已拆成：
   `/admin/content/structure`、`/hero`、`/projects`、`/skills`、`/contacts`
4. 模板切换和模板配置保存后，会直接作用到当前站点

## 文档

详细方案文档见：

1. [personal-homepage-plan.md](./docs/personal-homepage-plan.md)
2. [database-schema-design.md](./docs/database-schema-design.md)
3. [template-development-spec.md](./docs/template-development-spec.md)
4. [admin-ui-detailed-design.md](./docs/admin-ui-detailed-design.md)
5. [render-contract-v1.md](./docs/render-contract-v1.md)

## 验收建议

手动验收流程见：

1. [acceptance-checklist.md](./docs/acceptance-checklist.md)

## 仓库说明

1. 本地上传的媒体资源保存在 `public/uploads/`，默认不进入 Git 版本库
2. `.env`、`.env.docker` 等环境变量文件默认不进入 Git 版本库
3. 首次运行前请先按环境示例文件补齐配置

## 现阶段建议

如果继续迭代，优先级建议是：

1. README / 验收清单之后，做一轮手动验收
2. 再根据验收结果修细节问题
3. 最后再考虑更复杂的交互优化或更多模块
