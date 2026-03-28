# 数据库表结构设计文档

更新时间：2026-03-25  
适用范围：个人主页系统当前数据库设计  
文档目标：明确表结构、字段、关系、约束、发布快照机制，以及“本地媒体库 + 手动 URL”并存时的存储方式。

## 1. 设计前提

当前数据库设计按以下前提执行：

1. 项目按单站点系统设计。
2. 前台按单页个人主页设计。
3. 模板来自本地 `src/templates/` 目录。
4. 媒体库管理本地上传资源。
5. 所有需要图片的业务字段都支持两种来源：
   `本地媒体库选择` 或 `手动输入外部 URL`
6. 发布与回滚使用“整站快照”机制，而不是逐字段版本控制。

## 2. 设计原则

### 2.1 单站点模型

所有核心内容按单站点设计，减少表数量和开发复杂度。

### 2.2 内容与模板分离

数据库只保存内容数据和模板配置，不保存模板源码。

数据库负责保存：

1. 站点基础信息
2. Hero 内容
3. 技能组与技能项
4. 项目
5. 联系方式
6. 导航
7. 本地媒体资源
8. 当前模板 ID 与模板配置
9. 发布快照

数据库不负责保存：

1. 模板 JSX/TSX
2. 模板 CSS
3. 模板脚本
4. 模板预览图定义本身

### 2.3 本地媒体入库

媒体库只记录本地上传的资源。  
外部 URL 不进入媒体库，只作为业务表字段的另一种输入方式存在。

## 3. 命名与通用字段规范

命名规范：

1. 表名使用 `snake_case` 复数形式
2. 主键统一使用 `uuid`
3. 时间字段统一使用：
   `created_at`、`updated_at`
4. 排序字段统一使用：
   `sort_order`
5. 启用状态统一使用：
   `is_enabled`

通用字段：

```text
id uuid primary key
created_at timestamptz not null
updated_at timestamptz not null
```

## 4. 图片字段统一模式

因为系统既支持本地媒体库选择，也支持手动输入 URL，所以所有图片类字段统一采用以下三字段模式：

```text
*_source_type
*_media_asset_id
*_external_url
```

例如头像字段：

```text
avatar_source_type
avatar_media_asset_id
avatar_external_url
```

字段含义：

1. `*_source_type`
   取值：`none`、`local`、`external`
2. `*_media_asset_id`
   当来源为本地媒体库时，关联 `media_assets.id`
3. `*_external_url`
   当来源为外部链接时，保存完整 URL

业务校验规则：

1. `source_type = local`
   则 `media_asset_id` 必填，`external_url` 为空
2. `source_type = external`
   则 `external_url` 必填，`media_asset_id` 为空
3. `source_type = none`
   则两者都为空

说明：

1. 该规则先由服务层保证。
2. 如需更严格的数据完整性，可在 PostgreSQL 中补 `CHECK` 约束。

## 5. 核心表清单

当前数据库落以下表：

1. `users`
2. `site_settings`
3. `hero_profiles`
4. `home_sections`
5. `navigation_items`
6. `skill_groups`
7. `skill_items`
8. `projects`
9. `contact_items`
10. `media_assets`
11. `site_theme_state`
12. `publish_snapshots`
13. `activity_logs`

## 6. 表结构详细设计

### 6.1 `users`

作用：后台登录用户表。

字段：

```text
id uuid pk
email varchar(191) not null unique
password_hash text not null
display_name varchar(80) not null
is_active boolean not null default true
last_login_at timestamptz null
created_at timestamptz not null
updated_at timestamptz not null
```

说明：

1. 后台按单账号模型设计，因此 `users` 表不设置 `role` 字段
2. `email` 唯一
3. 当前不引入复杂第三方登录

### 6.2 `site_settings`

作用：站点级全局设置，单站点下通常只会有一条记录。

字段：

```text
id uuid pk
site_name varchar(100) not null
site_subtitle varchar(255) null
seo_title varchar(120) null
seo_description varchar(255) null
seo_keywords text[] not null default '{}'
footer_text varchar(255) null
icp_text varchar(100) null
icp_url varchar(255) null
favicon_source_type varchar(20) not null default 'none'
favicon_media_asset_id uuid null
favicon_external_url text null
created_at timestamptz not null
updated_at timestamptz not null
```

关系：

1. `favicon_media_asset_id -> media_assets.id`

说明：

1. 这是单站点表，服务层保证只有一条有效记录
2. 页脚文案、备案信息放这里足够

### 6.3 `hero_profiles`

作用：管理首页 Hero 区块内容。

字段：

```text
id uuid pk
greeting varchar(50) null
name varchar(80) not null
typing_titles jsonb not null default '[]'
description text null
avatar_source_type varchar(20) not null default 'none'
avatar_media_asset_id uuid null
avatar_external_url text null
primary_button_label varchar(50) null
primary_button_href varchar(255) null
secondary_button_label varchar(50) null
secondary_button_href varchar(255) null
created_at timestamptz not null
updated_at timestamptz not null
```

关系：

1. `avatar_media_asset_id -> media_assets.id`

说明：

1. `typing_titles` 使用 `jsonb` 数组存储
2. 当前站点的打字机标题非常适合用这个字段表达
3. 该表同样属于单站点单记录表

### 6.4 `home_sections`

作用：控制首页区块是否显示、排序和少量区块级配置。

字段：

```text
id uuid pk
section_key varchar(50) not null unique
is_enabled boolean not null default true
sort_order integer not null default 0
section_config jsonb not null default '{}'
created_at timestamptz not null
updated_at timestamptz not null
```

`section_key` 取值：

1. `hero`
2. `skills`
3. `projects`
4. `contact`
5. `footer`

说明：

1. 当前站点虽然区块固定，依然保留排序和开关
2. `section_config` 只放轻量区块级配置，不放完整内容

### 6.5 `navigation_items`

作用：顶部导航菜单。

字段：

```text
id uuid pk
label varchar(50) not null
href varchar(255) not null
open_in_new_tab boolean not null default false
sort_order integer not null default 0
is_enabled boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

说明：

1. 当前站点主要是锚点导航，但也兼容外部链接
2. 导航一般数量不多，直接排序即可

### 6.6 `skill_groups`

作用：技能分组，例如“前端开发”“后端开发”“工具 & 其他”。

字段：

```text
id uuid pk
title varchar(80) not null
subtitle varchar(120) null
sort_order integer not null default 0
is_enabled boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

### 6.7 `skill_items`

作用：技能项。

字段：

```text
id uuid pk
skill_group_id uuid not null
name varchar(80) not null
level smallint null
sort_order integer not null default 0
is_enabled boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

关系：

1. `skill_group_id -> skill_groups.id`

约束：

1. `level` 为空表示不展示熟练度
2. 若启用熟练度，限制在 `0-100`

### 6.8 `projects`

作用：项目展示卡片。

字段：

```text
id uuid pk
title varchar(120) not null
description text not null
visual_type varchar(20) not null default 'icon'
icon_name varchar(80) null
cover_source_type varchar(20) not null default 'none'
cover_media_asset_id uuid null
cover_external_url text null
repo_url varchar(255) null
preview_url varchar(255) null
tech_stack text[] not null default '{}'
is_featured boolean not null default true
sort_order integer not null default 0
is_enabled boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

关系：

1. `cover_media_asset_id -> media_assets.id`

说明：

1. 当前站点项目区更偏图标卡片式，因此保留 `icon_name`
2. 同时兼容使用封面图的模板
3. `tech_stack` 使用 `text[]` 即可，不必单独拆表

### 6.9 `contact_items`

作用：联系方式卡片。

字段：

```text
id uuid pk
type varchar(50) not null
label varchar(50) not null
value varchar(255) not null
href varchar(255) null
icon_type varchar(20) not null default 'builtin'
icon_name varchar(80) null
icon_source_type varchar(20) not null default 'none'
icon_media_asset_id uuid null
icon_external_url text null
open_in_new_tab boolean not null default false
sort_order integer not null default 0
is_enabled boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

关系：

1. `icon_media_asset_id -> media_assets.id`

说明：

1. `type` 可取 `email`、`github`、`wechat`、`website`、`custom`
2. 当前站点中的博客入口在这里仍然表现为一个联系方式卡片
3. `icon_type` 可区分是内置图标还是图片图标

### 6.10 `media_assets`

作用：本地媒体库，只记录本地上传资源。

字段：

```text
id uuid pk
kind varchar(20) not null default 'image'
original_name varchar(255) not null
stored_name varchar(255) not null
storage_path varchar(500) not null unique
public_url varchar(500) not null unique
mime_type varchar(100) not null
extension varchar(20) null
size_bytes bigint not null
width integer null
height integer null
alt_text varchar(255) null
uploaded_by_user_id uuid null
created_at timestamptz not null
updated_at timestamptz not null
deleted_at timestamptz null
```

关系：

1. `uploaded_by_user_id -> users.id`

说明：

1. 本表只存本地资源，不存外部 URL
2. 文件实际存储路径统一为 `public/uploads/yyyy/mm/`
3. 采用软删除，避免误删后页面资源失效
4. 删除前应先检查业务引用

说明补充：

1. 当前不单独建立 `media_usages` 表
2. 资源引用关系由服务层扫描以下表得出：
   `site_settings`、`hero_profiles`、`projects`、`contact_items`

### 6.11 `site_theme_state`

作用：保存当前站点的模板草稿状态和已发布快照指针。

字段：

```text
id uuid pk
template_id varchar(80) not null
template_config jsonb not null default '{}'
published_snapshot_id uuid null
created_at timestamptz not null
updated_at timestamptz not null
```

关系：

1. `published_snapshot_id -> publish_snapshots.id`

说明：

1. `template_id` 对应本地模板目录 ID，例如 `neon-tech`
2. 不建立模板表，模板信息由 `src/templates/*/manifest.ts` 读取
3. 后台编辑的是这里的草稿配置
4. 前台正式站点读取 `published_snapshot_id` 对应的快照

### 6.12 `publish_snapshots`

作用：保存每次发布或回滚时的整站快照。

字段：

```text
id uuid pk
snapshot_number integer not null unique
action_type varchar(20) not null
template_id varchar(80) not null
template_config jsonb not null
snapshot_data jsonb not null
comment varchar(255) null
published_by_user_id uuid null
source_snapshot_id uuid null
created_at timestamptz not null
updated_at timestamptz not null
```

关系：

1. `published_by_user_id -> users.id`
2. `source_snapshot_id -> publish_snapshots.id`

`action_type` 取值：

1. `publish`
2. `rollback`

`snapshot_data` 包含：

1. `site_settings`
2. `hero_profiles`
3. `home_sections`
4. `navigation_items`
5. `skill_groups`
6. `skill_items`
7. `projects`
8. `contact_items`
9. `template_id`
10. `template_config`

说明：

1. 回滚时不是“直接改旧快照”，而是基于旧快照重新生成一条新快照
2. 这样版本历史更清晰

### 6.13 `activity_logs`

作用：后台操作日志。

字段：

```text
id uuid pk
user_id uuid null
action varchar(50) not null
entity_type varchar(50) not null
entity_id varchar(100) null
summary varchar(255) not null
detail jsonb not null default '{}'
created_at timestamptz not null
updated_at timestamptz not null
```

关系：

1. `user_id -> users.id`

示例：

1. 更新 Hero 内容
2. 新增项目
3. 上传媒体
4. 切换模板
5. 发布站点
6. 回滚快照

## 7. 表关系概览

关系图可以简化理解为：

```text
users
  ├─ media_assets.uploaded_by_user_id
  ├─ publish_snapshots.published_by_user_id
  └─ activity_logs.user_id

media_assets
  ├─ site_settings.favicon_media_asset_id
  ├─ hero_profiles.avatar_media_asset_id
  ├─ projects.cover_media_asset_id
  └─ contact_items.icon_media_asset_id

skill_groups
  └─ skill_items.skill_group_id

publish_snapshots
  └─ site_theme_state.published_snapshot_id
```

## 8. 发布与回滚的数据流

### 8.1 编辑阶段

后台编辑时，写入以下实时表：

1. `site_settings`
2. `hero_profiles`
3. `home_sections`
4. `navigation_items`
5. `skill_groups`
6. `skill_items`
7. `projects`
8. `contact_items`
9. `site_theme_state`

这些数据代表当前草稿状态。

### 8.2 发布阶段

发布时执行：

1. 读取所有实时表
2. 组装为完整 `snapshot_data`
3. 写入 `publish_snapshots`
4. 更新 `site_theme_state.published_snapshot_id`

前台线上站点只读取最新发布快照，不直接读取草稿表。

### 8.3 回滚阶段

回滚时执行：

1. 选择某条历史 `publish_snapshots`
2. 取出其 `snapshot_data`
3. 生成一条新的 `rollback` 类型快照
4. 将 `site_theme_state.published_snapshot_id` 指向新的回滚快照

这样不会破坏历史记录。

## 9. 索引与约束

索引：

1. `users.email unique`
2. `home_sections.section_key unique`
3. `media_assets.storage_path unique`
4. `media_assets.public_url unique`
5. `publish_snapshots.snapshot_number unique`
6. `navigation_items(sort_order)`
7. `skill_groups(sort_order)`
8. `skill_items(skill_group_id, sort_order)`
9. `projects(sort_order, is_enabled)`
10. `contact_items(sort_order, is_enabled)`

业务约束：

1. 单站点单记录表由服务层限制只有一条有效记录：
   `site_settings`、`hero_profiles`、`site_theme_state`
2. 资源删除前必须校验引用关系
3. 发布时必须校验 `template_id` 在本地模板注册表中存在
4. 外部 URL 进行基础格式校验

## 10. 当前不使用的表

当前不使用以下表：

1. `templates`
   模板来自本地目录
2. `posts`
   当前项目不包含博客系统
3. `comments`
   当前项目不包含评论系统
4. `media_usages`
   资源引用由服务层计算

## 11. Prisma 建模方向

按 Prisma 实现时，遵循以下方向：

1. 所有表都建为显式模型，不依赖隐式大 JSON
2. 真正需要灵活性的字段使用 `Json`
3. `tech_stack` 和 `seo_keywords` 可直接使用 PostgreSQL 数组或 JSON
4. 图片来源三字段模式保留，不额外抽象成复杂多态资源表
5. 复杂约束优先由服务层校验，必要时再补数据库约束

## 12. 最终结论

当前数据库设计的重点是：

1. 单站点
2. 单页内容
3. 本地媒体库
4. 外部 URL 作为字段输入
5. 模板文件本地化
6. 发布与回滚用快照解决

这套表结构足够支撑你现在要的项目，并且不会为了额外复杂需求而提前变重。
