import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

const RAW_FILE = path.join(process.cwd(), "github_issues_raw.json");
const OVERRIDES_FILE = path.join(process.cwd(), "roster_overrides.json");
const REPO = "saintmob/vad.gafa.26";

const KNOWN_NAMES = [
  "李家馨", "陆嘉豪", "冯子恒", "杜姝璇", "瞿玟茜", "张鸿誉", "卢钲昌", "张昊涵",
  "陈蕾冰", "万晨宇", "关雅文", "岑紫英", "秦浩桦", "罗予博", "卢俪文", "陈多多",
  "叶雯惠", "申乐乐", "李佳冰", "陈家恬", "曹雨涵", "刘彦余", "林诗博", "陈蔓琪",
  "陈宝天", "卢镇昌", "王启林", "申乐",
].sort((a, b) => b.length - a.length);

const TEACHER_LOGINS = new Set(["saintmob"]);
const COLOR_WORDS = ["绿色", "橙色", "黑色", "粉色", "透明色", "蓝色"];
const DEPLOY_HOSTS = ["vercel.app", "run.app", "staticsite.me", "vusercontent.net"];

export function defaultOverrides() {
  return {
    version: 1,
    updatedAt: null,
    people: {},
    issues: {},
  };
}

export async function readJson(file: string, fallback: any) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(await readFile(file, "utf8"));
}

export async function writeJson(file: string, value: any) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

export function extractLinks(text = "") {
  const matches = text.match(/https?:\/\/[^\s)\]<"，。；、]+/g) || [];
  return [...new Set(matches.map((link) => link.replace(/[.,，。]+$/, "")))];
}

function extractNames(title = "", body = "") {
  const text = `${title}\n${body}`;
  const found: string[] = [];
  for (const name of KNOWN_NAMES) {
    if (!text.includes(name)) continue;
    if (found.some((longer) => longer.includes(name))) continue;
    found.push(name);
  }
  return found;
}

function classifyIssue(issue: any) {
  const number = issue.number;
  const title = issue.title || "";
  const body = issue.body || "";
  const author = issue.author?.login || "";
  const state = issue.state || "";
  const text = `${title}\n${body}`;

  if (TEACHER_LOGINS.has(author) || title.includes("使用说明")) {
    return ["老师/课程说明", "老师说明"];
  }
  if (title.includes("课堂") || body.slice(0, 100).includes("课堂")) {
    return ["作业：课堂笔记/随记", "课堂笔记"];
  }
  if (state === "CLOSED") {
    return ["待处理/重复", "关闭项，优先判断为重复或废弃"];
  }
  if (number >= 57 && number <= 67 && text.toLowerCase().includes(".mp3")) {
    return ["作业：创意网页/音乐作品", "音频/音乐作品"];
  }
  if (text.includes("图像复") || text.includes("图像复制") || text.includes("图像重置") || (number >= 57 && number <= 67)) {
    return ["作业：图像复刻", "图像复刻/重绘"];
  }
  if (COLOR_WORDS.some((word) => title.includes(word)) || (number >= 68 && number <= 73)) {
    return ["作业：色彩小组", "小组色彩主题"];
  }
  if (number >= 74 && number <= 96) {
    return ["作业：专题介绍网站", "人物/音乐/艺术家介绍网站"];
  }
  if (number >= 30 && number <= 56) {
    return ["作业：创意网页/音乐作品", "早期网页或音乐主题作品"];
  }
  if (number >= 2 && number <= 29) {
    return ["作业：AI 提问/模型观察", "截图、文字或模型对比"];
  }
  return ["待处理/未分类", "规则未覆盖，需人工校对"];
}

function evidenceType(body: string, links: string[]) {
  const imgCount = (body || "").split("<img").length - 1;
  const deployLinks = links.filter((link) => DEPLOY_HOSTS.some((host) => link.includes(host)));
  if (deployLinks.length && imgCount) return "网站链接+图片";
  if (deployLinks.length) return "网站链接";
  if (imgCount && links.length) return "图片/附件";
  if (imgCount) return "图片";
  if (links.length) return "链接";
  if (cleanText(body)) return "文字";
  return "空内容";
}

function buildAuthorNameIndex(issues: any[]) {
  const index = new Map();
  for (const issue of issues) {
    const login = issue.author?.login;
    if (!login) continue;
    const names = extractNames(issue.title, issue.body);
    if (!index.has(login)) index.set(login, new Map());
    for (const name of names) {
      index.get(login).set(name, (index.get(login).get(name) || 0) + 1);
    }
  }
  return index;
}

function likelyNameForAuthor(index: Map<any, any>, login: string) {
  const scores = index.get(login);
  if (!scores) return "";
  return [...scores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function issueFlags(issue: any, names: string[], category: string, evidence: string, links: string[]) {
  const flags: string[] = [];
  if (category === "老师/课程说明") return flags;
  if (issue.state === "CLOSED") flags.push("关闭项");
  if (!names.length) flags.push("缺姓名");
  if (evidence === "空内容") flags.push("空内容");
  if (category.startsWith("作业：专题介绍网站") && !links.some((link) => DEPLOY_HOSTS.some((host) => link.includes(host)))) {
    flags.push("专题网站缺可识别部署链接");
  }
  if (category.startsWith("作业：色彩小组") && !links.some((link) => DEPLOY_HOSTS.some((host) => link.includes(host)))) {
    flags.push("色彩小组缺可识别部署链接");
  }
  if (category.startsWith("作业：AI 提问") && ["文字", "空内容"].includes(evidence)) {
    flags.push("缺截图/链接证据");
  }
  return flags;
}

function mergeIssueOverride(base: any, override: any = {}) {
  return {
    ...base,
    correctedStudentNames: override.studentNames || base.studentNames,
    correctedCategory: override.category || base.category,
    correctedRole: override.role || base.role,
    reviewNote: override.note || "",
    resolved: Boolean(override.resolved),
  };
}

export function buildData(rawIssues: any[], overrides: any) {
  const authorNameIndex = buildAuthorNameIndex(rawIssues);
  const issues = rawIssues
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((issue) => {
      const body = issue.body || "";
      const links = extractLinks(`${issue.title}\n${body}`);
      let names = extractNames(issue.title, body);
      if (!names.length) {
        const inferred = likelyNameForAuthor(authorNameIndex, issue.author?.login);
        if (inferred) names = [inferred];
      }
      const [category, subcategory] = classifyIssue(issue);
      const role = category === "老师/课程说明" ? "老师" : "学生/待校对";
      const evidence = evidenceType(body, links);
      const flags = issueFlags(issue, names, category, evidence, links);
      return mergeIssueOverride({
        issue: issue.number,
        state: issue.state,
        role,
        category,
        subcategory,
        studentNames: names,
        author: issue.author?.login || "",
        authorName: issue.author?.name || "",
        title: cleanText(issue.title),
        evidenceType: evidence,
        links,
        flags,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        issueUrl: issue.url,
      }, overrides.issues[String(issue.number)]);
    });

  const peopleByLogin = new Map();
  for (const issue of issues) {
    const login = issue.author;
    if (!login) continue;
    if (!peopleByLogin.has(login)) {
      const manual = overrides.people[login] || {};
      peopleByLogin.set(login, {
        login,
        githubName: manual.githubName || issue.authorName || login,
        realName: manual.realName || issue.correctedStudentNames[0] || issue.studentNames[0] || "",
        role: manual.role || (TEACHER_LOGINS.has(login) ? "老师" : "学生"),
        avatarUrl: manual.avatarUrl || `https://github.com/${login}.png`,
        note: manual.note || "",
        issueCount: 0,
        categories: new Set(),
        flags: new Set(),
        issueNumbers: [],
        manuallyCorrected: Boolean(overrides.people[login]),
        hasMusic: false,
      });
    }
    const person = peopleByLogin.get(login);
    person.issueCount += 1;
    person.categories.add(issue.correctedCategory);
    if (issue.correctedCategory.includes("音乐")) {
      person.hasMusic = true;
    }
    issue.flags.forEach((flag: string) => person.flags.add(flag));
    person.issueNumbers.push(issue.issue);
  }

  const people = [...peopleByLogin.values()].map((person) => ({
    ...person,
    categories: [...person.categories],
    flags: [...person.flags],
  })).sort((a, b) => {
    if (a.role !== b.role) return a.role === "老师" ? -1 : 1;
    return a.realName.localeCompare(b.realName, "zh-Hans-CN") || a.login.localeCompare(b.login);
  });

  return {
    repo: REPO,
    rawCount: rawIssues.length,
    generatedAt: new Date().toISOString(),
    overridesUpdatedAt: overrides.updatedAt,
    counts: {
      people: people.length,
      issues: issues.length,
      needsReview: issues.filter((issue) => issue.flags.length && !issue.resolved).length,
      correctedPeople: Object.keys(overrides.people).length,
      correctedIssues: Object.keys(overrides.issues).length,
    },
    people,
    issues,
    needsReview: issues.filter((issue) => issue.flags.length && !issue.resolved),
    overrides,
  };
}

export async function loadData() {
  const raw = await readJson(RAW_FILE, []);
  const overrides = await readJson(OVERRIDES_FILE, defaultOverrides());
  return buildData(raw, overrides);
}

export async function refreshIssues() {
  const args = [
    "issue", "list",
    "--repo", REPO,
    "--state", "all",
    "--limit", "300",
    "--json", "number,title,body,author,labels,state,createdAt,updatedAt,url",
  ];
  const output = await new Promise<string>((resolve, reject) => {
    execFile("gh", args, { cwd: process.cwd(), maxBuffer: 20 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout);
    });
  });
  const issues = JSON.parse(output);
  await writeJson(RAW_FILE, issues);
  return loadData();
}

export async function updatePerson(body: any) {
  const overrides = await readJson(OVERRIDES_FILE, defaultOverrides());
  overrides.people[body.login] = {
    realName: cleanText(body.realName),
    githubName: cleanText(body.githubName),
    role: cleanText(body.role) || "学生",
    avatarUrl: cleanText(body.avatarUrl),
    note: cleanText(body.note),
  };
  overrides.updatedAt = new Date().toISOString();
  await writeJson(OVERRIDES_FILE, overrides);
  return loadData();
}

export async function updateIssue(body: any) {
  const overrides = await readJson(OVERRIDES_FILE, defaultOverrides());
  overrides.issues[String(body.issue)] = {
    studentNames: String(body.studentNames || "").split(/[、,，]/).map((item) => cleanText(item)).filter(Boolean),
    category: cleanText(body.category),
    role: cleanText(body.role),
    note: cleanText(body.note),
    resolved: Boolean(body.resolved),
  };
  overrides.updatedAt = new Date().toISOString();
  await writeJson(OVERRIDES_FILE, overrides);
  return loadData();
}
