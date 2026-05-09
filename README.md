# AI 学习课程 Issues 名册工具

这个仓库把课程作业提交区里的公开 GitHub Issues 整理成一个本地可运行的课堂名册。

目标不是替代 Issues，而是在保留原始提交内容的基础上，提供一个更容易查看、校对和继续完善的界面：

- 展示师生名单、头像、GitHub 名称、真实姓名和提交概况。
- 从公开 Issues 自动提取作业、链接、分类、姓名线索。
- 把需要人工确认的数据集中列出。
- 人工修正只写入本地外挂 JSON，不覆盖原始 Issues 数据。
- 随时点击页面里的“刷新 Issues”，重新拉取公开 Issues，并继续兼容已有人工修正。

## 快速开始

需要本机安装：

- Node.js 18 或更高版本
- Python 3，用于重新生成整理表
- GitHub CLI `gh`，用于刷新公开 Issues

启动本地名册：

```bash
git clone https://github.com/saintmob/vad.gafa.26.git
cd vad.gafa.26
npm start
```

然后打开：

```text
http://127.0.0.1:4319
```

如果没有登录 GitHub CLI，页面仍能读取仓库里已有的 `github_issues_raw.json` 快照；点击“刷新 Issues”时需要 `gh` 能访问 GitHub：

```bash
gh auth login
```

## 页面功能

### 师生名册

展示每个 GitHub 账号对应的成员卡片，包括：

- GitHub 头像
- GitHub 用户名
- 推断或人工修正后的真实姓名
- 老师/学生角色
- 提交过的 issue 数量
- 涉及的作业分类
- 是否存在待校对信号

当前按 GitHub 账号建档。若同一个真实姓名用了多个账号，可以在“修正信息”里补充真实姓名和备注，后续也欢迎提交 PR 改进合并逻辑。

### 数据修正

系统会把这些记录列为待校对：

- 缺姓名
- 已关闭 issue，可能是重复或废弃
- 空内容
- 文字提交但缺截图/链接证据
- 专题网站或色彩小组缺可识别部署链接

点击待校对项后，可以手动修正：

- 真实姓名
- 分类
- 角色
- 备注
- 是否已校对

保存后写入 `roster_overrides.json`。这个文件是“外挂层”，不会修改 `github_issues_raw.json`，也不会修改 GitHub 上的原始 Issues。

### 原始 Issues

展示全部公开 Issues，并叠加本地修正后的姓名和分类，方便核对来源。

## 数据设计

这个项目使用两层 JSON：

```text
github_issues_raw.json    GitHub Issues 原始数据快照
roster_overrides.json     人工修正外挂
```

页面读取时会即时合并：

```text
最终展示数据 = 原始 Issues 数据 + 人工修正外挂
```

这样做的好处：

- 保留同学们真实提交的原始内容。
- 可以随时重新拉取公开 Issues。
- 人工校对结果不会被刷新覆盖。
- 任何人都能提交 PR 改进规则或补充修正。

## 重新拉取 Issues

页面左下角有“刷新 Issues”按钮，会在本地执行：

```bash
gh issue list \
  --repo saintmob/vad.gafa.26 \
  --state all \
  --limit 300 \
  --json number,title,body,author,labels,state,createdAt,updatedAt,url
```

刷新结果会覆盖 `github_issues_raw.json`，但不会覆盖 `roster_overrides.json`。

## 重新生成整理表

早期整理结果仍然保留，便于学习整个数据清洗过程：

```bash
npm run organize
```

会生成：

- `issues整理.csv`：适合表格筛选
- `issues整理.md`：适合阅读和人工校对

## 项目结构

```text
.
├── server.mjs              # 本地 HTTP/API 服务
├── public/
│   ├── index.html          # 页面结构
│   ├── styles.css          # 界面样式
│   └── app.js              # 前端交互逻辑
├── github_issues_raw.json  # 公开 Issues 原始数据快照
├── roster_overrides.json   # 人工修正外挂
├── organize_issues.py      # 生成 CSV/Markdown 整理表的脚本
├── issues整理.csv          # 已生成的整理表
├── issues整理.md           # 已生成的分组清单
├── HANDOFF.md              # 本次构建过程和后续交接说明
└── roster-screenshot.png   # 本地页面验证截图
```

## API 简介

本地服务提供几个简单接口：

```text
GET  /api/data      读取合并后的名册数据
POST /api/refresh   重新拉取公开 Issues
POST /api/person    保存成员修正
POST /api/issue     保存 Issue 修正
```

所有接口只写本地文件，不会直接修改 GitHub Issues。

## 同学如何参与

欢迎自由提交 Pull Request：

1. Fork 这个仓库。
2. 本地运行并修改功能。
3. 提交 PR，说明你改了什么、为什么改。

适合改进的方向：

- 补充真实姓名和 GitHub 账号映射。
- 改进分类规则。
- 增加按作业类型筛选。
- 增加导出名册功能。
- 改进同一学生多个 GitHub 账号的合并逻辑。
- 给页面增加更清晰的批改或展示视图。

## 已知限制

- 姓名提取主要来自标题、正文和同账号历史提交，不能保证完全准确。
- GitHub 头像来自 `https://github.com/<login>.png`。
- 刷新 Issues 依赖 GitHub CLI 和网络。
- 当前没有数据库，所有修正都保存在本地 JSON 文件中，适合课程协作和轻量维护。

## 学习重点

这个项目可以作为一个小型数据工具案例，观察完整流程：

1. 从公开 Issues 拉取原始数据。
2. 用规则做初步结构化。
3. 保留不确定项，让人来校对。
4. 用外挂 JSON 记录人工修正。
5. 页面展示时合并原始数据和修正数据。
6. 保持可刷新、可追溯、可 PR 协作。
