import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent
RAW = ROOT / "github_issues_raw.json"
CSV_OUT = ROOT / "issues整理.csv"
MD_OUT = ROOT / "issues整理.md"

KNOWN_NAMES = [
    "李家馨", "陆嘉豪", "冯子恒", "杜姝璇", "瞿玟茜", "张鸿誉", "卢钲昌", "张昊涵",
    "陈蕾冰", "万晨宇", "关雅文", "岑紫英", "秦浩桦", "罗予博", "卢俪文", "陈多多",
    "叶雯惠", "申乐乐", "李佳冰", "陈家恬", "曹雨涵", "刘彦余", "林诗博", "陈蔓琪",
    "陈宝天", "卢镇昌", "王启林", "申乐",
]

TEACHER_LOGINS = {"saintmob"}

COLOR_WORDS = {"绿色", "橙色", "黑色", "粉色", "透明色", "蓝色"}


def clean_text(value: str) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return value


def extract_links(text: str) -> list[str]:
    links = re.findall(r"https?://[^\s\)\]\<\"，。；、]+", text or "")
    return list(dict.fromkeys(link.rstrip(".,，。") for link in links))


def extract_names(title: str, body: str) -> str:
    text = f"{title}\n{body}"
    found = []
    for name in sorted(KNOWN_NAMES, key=len, reverse=True):
        if name not in text:
            continue
        if any(name in longer for longer in found):
            continue
        found.append(name)
    return "、".join(found)


def classify_issue(issue: dict) -> tuple[str, str]:
    number = issue["number"]
    title = issue["title"]
    body = issue.get("body") or ""
    author = issue["author"]["login"]
    state = issue["state"]
    text = f"{title}\n{body}"

    if author in TEACHER_LOGINS or "使用说明" in title:
        return "老师/课程说明", "老师说明"
    if "课堂" in title or "课堂" in body[:100]:
        return "作业：课堂笔记/随记", "课堂笔记"
    if state == "CLOSED":
        return "待处理/重复", "关闭项，优先判断为重复或废弃"
    if 57 <= number <= 67 and ".mp3" in text.lower():
        return "作业：创意网页/音乐作品", "音频/音乐作品"
    if "图像复" in text or "图像复制" in text or "图像重置" in text or 57 <= number <= 67:
        return "作业：图像复刻", "图像复刻/重绘"
    if any(word in title for word in COLOR_WORDS) or 68 <= number <= 73:
        return "作业：色彩小组", "小组色彩主题"
    if 74 <= number <= 96:
        return "作业：专题介绍网站", "人物/音乐/艺术家介绍网站"
    if 30 <= number <= 56:
        return "作业：创意网页/音乐作品", "早期网页或音乐主题作品"
    if 2 <= number <= 29:
        return "作业：AI 提问/模型观察", "截图、文字或模型对比"
    return "待处理/未分类", "规则未覆盖，需人工校对"


def evidence_type(body: str, links: list[str]) -> str:
    img_count = (body or "").count("<img")
    deploy_links = [
        link for link in links
        if any(host in link for host in ["vercel.app", "appspot.com", "run.app", "staticsite.me", "vusercontent.net"])
    ]
    if deploy_links and img_count:
        return "网站链接+图片"
    if deploy_links:
        return "网站链接"
    if img_count and not links:
        return "图片"
    if img_count:
        return "图片/附件"
    if links:
        return "链接"
    if clean_text(body):
        return "文字"
    return "空内容"


def quality_flags(issue: dict, names: str, links: list[str], role: str, category: str, evidence: str) -> str:
    flags = []
    if role.startswith("老师"):
        return ""
    if issue["state"] == "CLOSED":
        flags.append("关闭项")
    if not names:
        flags.append("缺姓名")
    if evidence == "空内容":
        flags.append("空内容")
    if category.startswith("作业：专题介绍网站") and not any(
        host in " ".join(links) for host in ["vercel.app", "run.app", "staticsite.me", "vusercontent.net"]
    ):
        flags.append("专题网站缺可识别部署链接")
    if category.startswith("作业：色彩小组") and not any(
        host in " ".join(links) for host in ["vercel.app", "run.app", "staticsite.me", "vusercontent.net"]
    ):
        flags.append("色彩小组缺可识别部署链接")
    if category.startswith("作业：AI 提问") and evidence in {"文字", "空内容"}:
        flags.append("缺截图/链接证据")
    return "；".join(flags)


def main() -> None:
    issues = json.loads(RAW.read_text(encoding="utf-8"))
    author_names = defaultdict(Counter)
    for issue in issues:
        names = extract_names(issue["title"], issue.get("body") or "")
        for name in names.split("、"):
            if name and name != "待校对":
                author_names[issue["author"]["login"]][name] += 1

    rows = []
    for issue in sorted(issues, key=lambda item: item["number"]):
        body = issue.get("body") or ""
        links = extract_links(f"{issue['title']}\n{body}")
        names = extract_names(issue["title"], body)
        if not names and author_names.get(issue["author"]["login"]):
            names = author_names[issue["author"]["login"]].most_common(1)[0][0]
        category, subcategory = classify_issue(issue)
        role = "老师" if category == "老师/课程说明" else "学生/待校对"
        evidence = evidence_type(body, links)
        flags = quality_flags(issue, names, links, role, category, evidence)
        rows.append({
            "issue": issue["number"],
            "state": issue["state"],
            "role": role,
            "category": category,
            "subcategory": subcategory,
            "student_names": names or "待校对",
            "author": issue["author"]["login"],
            "title": clean_text(issue["title"]),
            "evidence_type": evidence,
            "links": " ".join(links),
            "flags": flags,
            "created_at": issue["createdAt"],
            "updated_at": issue["updatedAt"],
            "issue_url": issue["url"],
        })

    fieldnames = [
        "issue", "state", "role", "category", "subcategory", "student_names", "author", "title",
        "evidence_type", "links", "flags", "created_at", "updated_at", "issue_url",
    ]
    with CSV_OUT.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    category_counts = Counter(row["category"] for row in rows)
    flag_rows = [row for row in rows if row["flags"]]
    by_category = defaultdict(list)
    for row in rows:
        by_category[row["category"]].append(row)

    lines = [
        "# GitHub Issues 作业整理",
        "",
        f"- 数据源：{RAW.name}",
        f"- Issue 总数：{len(rows)}",
        f"- 生成文件：`{CSV_OUT.name}`、`{MD_OUT.name}`",
        "",
        "## 分类统计",
        "",
    ]
    for category, count in category_counts.most_common():
        lines.append(f"- {category}: {count}")

    lines.extend(["", "## 需要人工校对/补充", ""])
    if flag_rows:
        for row in flag_rows:
            lines.append(
                f"- #{row['issue']} [{row['title']}]({row['issue_url']})：{row['flags']}；"
                f"分类={row['category']}；姓名={row['student_names']}"
            )
    else:
        lines.append("- 暂无")

    lines.extend(["", "## 分组清单", ""])
    order = [
        "老师/课程说明",
        "作业：课堂笔记/随记",
        "作业：AI 提问/模型观察",
        "作业：创意网页/音乐作品",
        "作业：图像复刻",
        "作业：色彩小组",
        "作业：专题介绍网站",
        "待处理/重复",
        "待处理/未分类",
    ]
    for category in order:
        items = by_category.get(category, [])
        if not items:
            continue
        lines.extend([f"### {category}", ""])
        for row in items:
            links = row["links"] or "无链接"
            lines.append(
                f"- #{row['issue']} {row['student_names']}｜{row['title']}｜"
                f"{row['evidence_type']}｜{row['state']}｜[issue]({row['issue_url']})｜{links}"
            )
        lines.append("")

    MD_OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {CSV_OUT}")
    print(f"Wrote {MD_OUT}")
    print(f"Rows: {len(rows)}")


if __name__ == "__main__":
    main()
