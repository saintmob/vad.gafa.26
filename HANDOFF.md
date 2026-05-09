# Handoff

## 目标与验收标准

- 整理 `saintmob/vad.gafa.26` GitHub issues 中的学生作业提交。
- 区分老师说明、学生作业、课堂笔记、关闭/重复项。
- 为作业补充分类、学生姓名、链接/附件证据类型和待校对标记。

## 当前状态

- 已通过 `gh issue list` 拉取 93 条 issues 到 `github_issues_raw.json`。
- 已生成结构化表格 `issues整理.csv`。
- 已生成分组阅读版 `issues整理.md`。
- 已生成可复跑脚本 `organize_issues.py`。
- 已新增本地课堂名册工具：
  - `server.mjs`：本地 HTTP/API 服务，提供刷新 GitHub issues、合并外挂、保存修正。
  - `public/index.html`、`public/styles.css`、`public/app.js`：名册、原始 issues、数据修正界面。
  - `roster_overrides.json`：人工修正外挂，当前为空。
  - `roster-screenshot.png`：当前修正界面验证截图。

## 分类口径

- 老师/课程说明
- 作业：课堂笔记/随记
- 作业：AI 提问/模型观察
- 作业：创意网页/音乐作品
- 作业：图像复刻
- 作业：色彩小组
- 作业：专题介绍网站
- 待处理/重复

## 验证方式

启动课堂名册：

```bash
node server.mjs
```

打开：

```text
http://127.0.0.1:4319
```

接口检查：

```bash
curl -s http://127.0.0.1:4319/api/data
```

重新生成旧版 CSV/Markdown 整理表：

```bash
python3 organize_issues.py
```

复跑后检查：

```bash
sed -n '1,50p' issues整理.md
python3 -c 'import csv,collections; rows=list(csv.DictReader(open("issues整理.csv",encoding="utf-8-sig"))); print(collections.Counter(r["category"] for r in rows)); print(sum(1 for r in rows if r["flags"]))'
```

## 已知问题与风险

- 学生姓名主要从标题/正文和作者账号历史提交推断，仍需人工校对。
- 同一真实姓名可能有多个 GitHub 账号，当前按 GitHub 账号展示成员，人工修正可在页面里补真实姓名和备注。
- #8、#31 缺姓名。
- #19、#28 是文字提交，缺截图/链接证据。
- #70、#72、#73 色彩小组缺可识别部署链接或内容不完整。
- #78、#79 专题网站不是常规部署链接，可能需要人工确认。
- #7、#23、#24、#26、#49、#89 为关闭项，优先视为重复/废弃。

## 下一步

- 人工校对 `issues整理.csv` 中 `flags` 非空的行。
- 在页面“数据修正”中处理待校对项，保存后会写入 `roster_overrides.json`，不会覆盖 `github_issues_raw.json`。
- 如需发布回 GitHub，可把分类映射成 labels，再批量给 issues 打标签。
