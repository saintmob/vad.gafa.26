const state = {
  data: null,
  view: "roster",
  query: "",
  selectedIssue: null,
};

const categories = [
  "老师/课程说明",
  "作业：课堂笔记/随记",
  "作业：AI 提问/模型观察",
  "作业：创意网页/音乐作品",
  "作业：图像复刻",
  "作业：色彩小组",
  "作业：专题介绍网站",
  "待处理/重复",
  "待处理/未分类",
];

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "请求失败");
  return payload;
}

function searchableText(item) {
  return JSON.stringify(item).toLowerCase();
}

function matchesQuery(item) {
  if (!state.query) return true;
  return searchableText(item).includes(state.query.toLowerCase());
}

function setStatus(text) {
  $("#syncStatus").textContent = text;
}

function renderStats() {
  const { counts, rawCount } = state.data;
  $("#issueTotal").textContent = rawCount;
  $("#peopleCount").textContent = counts.people;
  $("#reviewCount").textContent = counts.needsReview;
  $("#personFixCount").textContent = counts.correctedPeople;
  $("#issueFixCount").textContent = counts.correctedIssues;
}

function renderPeople() {
  const people = state.data.people.filter(matchesQuery);
  $("#peopleGrid").innerHTML = people.length
    ? people.map((person) => `
      <article class="person-card">
        <div class="person-top">
          <img class="avatar" src="${escapeHtml(person.avatarUrl)}" alt="${escapeHtml(person.realName || person.login)}" />
          <div>
            <h3 class="person-name">${escapeHtml(person.realName || "待校对")}</h3>
            <a class="github-link" href="https://github.com/${escapeHtml(person.login)}" target="_blank" rel="noreferrer">@${escapeHtml(person.login)}</a>
          </div>
        </div>
        <div class="meta-row">
          <span class="chip">${escapeHtml(person.role)}</span>
          <span class="chip">${person.issueCount} 条 issue</span>
          ${person.manuallyCorrected ? '<span class="chip">已外挂修正</span>' : ""}
        </div>
        <div class="tag-row">
          ${person.categories.slice(0, 3).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
          ${person.flags.length ? `<span class="chip warn">${person.flags.length} 个待校对信号</span>` : ""}
        </div>
        <div class="card-actions">
          <button class="text-btn" data-edit-person="${escapeHtml(person.login)}">修正信息</button>
          <button class="text-btn" data-filter-login="${escapeHtml(person.login)}">查看 Issues</button>
        </div>
      </article>
    `).join("")
    : '<div class="empty-state">没有匹配的成员。</div>';
}

function renderReview() {
  const items = state.data.needsReview.filter(matchesQuery);
  $("#reviewList").innerHTML = items.length
    ? items.map((issue) => `
      <article class="review-item ${state.selectedIssue === issue.issue ? "active" : ""}" data-select-issue="${issue.issue}">
        <div class="review-title">
          <h4>#${issue.issue} ${escapeHtml(issue.title)}</h4>
          <a href="${escapeHtml(issue.issueUrl)}" target="_blank" rel="noreferrer">打开</a>
        </div>
        <div class="meta-row">
          <span class="chip">${escapeHtml(issue.correctedStudentNames.join("、") || "待校对")}</span>
          <span class="chip">${escapeHtml(issue.correctedCategory)}</span>
          <span class="chip">${escapeHtml(issue.evidenceType)}</span>
        </div>
        <div class="tag-row">
          ${issue.flags.map((flag) => `<span class="chip warn">${escapeHtml(flag)}</span>`).join("")}
        </div>
      </article>
    `).join("")
    : '<div class="empty-state">当前没有待校对项。</div>';
}

function firstVisibleReviewIssue() {
  return state.data.needsReview.filter(matchesQuery)[0] || null;
}

function renderIssues() {
  const issues = state.data.issues.filter(matchesQuery);
  $("#issueTable").innerHTML = issues.length
    ? issues.map((issue) => `
      <article class="issue-row">
        <div class="issue-number">#${issue.issue}</div>
        <div>
          <h4>${escapeHtml(issue.title)}</h4>
          <div class="meta-row">
            <span class="chip">${escapeHtml(issue.correctedStudentNames.join("、") || "待校对")}</span>
            <span class="chip">${escapeHtml(issue.correctedCategory)}</span>
            <span class="chip">${escapeHtml(issue.state)}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="text-btn" data-select-issue="${issue.issue}">修正</button>
          <a class="text-btn" href="${escapeHtml(issue.issueUrl)}" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </article>
    `).join("")
    : '<div class="empty-state">没有匹配的 issue。</div>';
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  document.querySelectorAll(".view").forEach((item) => item.classList.remove("active-view"));
  $(`#${view}View`).classList.add("active-view");
  const titles = {
    roster: ["师生名册", "展示头像、GitHub 名称、真实姓名和作业提交概况。"],
    review: ["数据修正", "只写入本地外挂数据，刷新 GitHub 原始内容也不会丢失。"],
    issues: ["原始 Issues", "按修正后的姓名和分类展示全部公开 issues。"],
  };
  $("#viewTitle").textContent = titles[view][0];
  $("#viewSubtitle").textContent = titles[view][1];
  if (view === "review" && !state.selectedIssue) {
    const first = firstVisibleReviewIssue();
    if (first) fillEditForm(first);
  }
}

function fillEditForm(issue) {
  state.selectedIssue = issue.issue;
  $("#editIssue").value = issue.issue;
  $("#editIssueLabel").value = `#${issue.issue} ${issue.title}`;
  $("#editNames").value = issue.correctedStudentNames.join("、");
  $("#editCategory").value = issue.correctedCategory;
  $("#editRole").value = issue.correctedRole;
  $("#editNote").value = issue.reviewNote || "";
  $("#editResolved").checked = issue.resolved;
  renderReview();
  setView("review");
}

function openPersonDialog(person) {
  $("#personLogin").value = person.login;
  $("#personGithubName").value = person.githubName || person.login;
  $("#personRealName").value = person.realName || "";
  $("#personRole").value = person.role || "学生";
  $("#personAvatarUrl").value = person.avatarUrl || "";
  $("#personNote").value = person.note || "";
  $("#personDialog").showModal();
}

function renderAll() {
  renderStats();
  renderPeople();
  renderReview();
  renderIssues();
}

async function load() {
  state.data = await api("/api/data");
  renderAll();
  setStatus(`已载入：${new Date(state.data.generatedAt).toLocaleString()}`);
}

async function refresh() {
  const button = $("#refreshBtn");
  button.disabled = true;
  setStatus("正在通过 gh 拉取公开 issues...");
  try {
    state.data = await api("/api/refresh", { method: "POST", body: "{}" });
    renderAll();
    setStatus(`刷新完成：${new Date().toLocaleString()}`);
  } catch (error) {
    setStatus(`刷新失败：${error.message}`);
  } finally {
    button.disabled = false;
  }
}

function wireEvents() {
  $("#editCategory").innerHTML = categories.map((item) => `<option>${escapeHtml(item)}</option>`).join("");

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $("#searchInput").addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    if (state.view === "review") {
      const stillVisible = state.data.needsReview
        .filter(matchesQuery)
        .some((issue) => issue.issue === state.selectedIssue);
      if (!stillVisible) state.selectedIssue = null;
    }
    renderAll();
    if (state.view === "review" && !state.selectedIssue) {
      const first = firstVisibleReviewIssue();
      if (first) fillEditForm(first);
    }
  });

  $("#refreshBtn").addEventListener("click", refresh);

  document.body.addEventListener("click", (event) => {
    const issueButton = event.target.closest("[data-select-issue]");
    if (issueButton) {
      const issue = state.data.issues.find((item) => item.issue === Number(issueButton.dataset.selectIssue));
      if (issue) fillEditForm(issue);
      return;
    }
    const personButton = event.target.closest("[data-edit-person]");
    if (personButton) {
      const person = state.data.people.find((item) => item.login === personButton.dataset.editPerson);
      if (person) openPersonDialog(person);
      return;
    }
    const filterButton = event.target.closest("[data-filter-login]");
    if (filterButton) {
      $("#searchInput").value = filterButton.dataset.filterLogin;
      state.query = filterButton.dataset.filterLogin;
      setView("issues");
      renderAll();
    }
  });

  $("#editForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!$("#editIssue").value) return;
    state.data = await api("/api/issue", {
      method: "POST",
      body: JSON.stringify({
        issue: Number($("#editIssue").value),
        studentNames: $("#editNames").value,
        category: $("#editCategory").value,
        role: $("#editRole").value,
        note: $("#editNote").value,
        resolved: $("#editResolved").checked,
      }),
    });
    renderAll();
    setStatus("Issue 修正已保存到本地外挂");
  });

  $("#personForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.data = await api("/api/person", {
      method: "POST",
      body: JSON.stringify({
        login: $("#personLogin").value,
        githubName: $("#personGithubName").value,
        realName: $("#personRealName").value,
        role: $("#personRole").value,
        avatarUrl: $("#personAvatarUrl").value,
        note: $("#personNote").value,
      }),
    });
    $("#personDialog").close();
    renderAll();
    setStatus("成员修正已保存到本地外挂");
  });

  $("#cancelPerson").addEventListener("click", () => $("#personDialog").close());
}

wireEvents();
load().catch((error) => {
  setStatus(`载入失败：${error.message}`);
});
