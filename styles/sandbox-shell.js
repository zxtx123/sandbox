/* ============================================================
   sandbox-shell.js — AI 沙箱公共区（顶栏 + 左侧图标栏 + 侧边栏菜单）
   单一数据源：菜单只在此处定义一次，各页面只放一个占位容器：
     <div id="sandbox-shell" data-active="运行日志" data-breadcrumb="运行日志"></div>
   本脚本在运行时注入 header + icon-bar + sidebar，并把页面自带的
   .main-content 接入为第三栏，同时高亮 data-active 对应的菜单项。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 侧边栏菜单：唯一数据源 ----------
     href 为 null 表示暂无对应页面，渲染为不可跳转的占位项。 */
  var SANDBOX_MENU = [
    { text: "概览", href: "sandbox-dashboard.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="9" y="2" width="5" height="3" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="9" y="7" width="5" height="7" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' },
    { text: "沙箱实例", href: "index.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' },
    { text: "沙箱快照", href: "sandbox-snapshots.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 4.5C3 3.7 4.8 3 8 3s5 0.7 5 1.5S11.2 6 8 6 3 5.3 3 4.5z" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 4.5v7C3 12.3 4.8 13 8 13s5-0.7 5-1.5v-7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 8c0 0.8 1.8 1.5 5 1.5s5-0.7 5-1.5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' },
    { text: "沙箱模板", href: "sandbox-template.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M6 6l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    { text: "网络策略", href: "sandbox-policy.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 12l3-3 3 3 4-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    { text: "试验场", href: "sandbox-playground.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 5v3l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    { text: "用量统计", href: "sandbox-usage.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 12l3-3 3 3 4-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    { text: "运行日志", href: "sandbox-logs.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 7h6M5 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    { text: "API密钥", href: "sandbox-apikeys.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M7 3L3 6v5c0 2 2 3 4 3s4-1 4-3V6l-4-3z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' },
    { text: "访问凭证", href: "sandbox-credentials.html",
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="3" y="2.5" width="10" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5.5 6h5M5.5 9h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    { text: "定价和资源包", href: null,
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 4V3a3 3 0 016 0v1" stroke="currentColor" stroke-width="1.5"/></svg>' },
    { text: "资源组详情", href: null,
      icon: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M2 6h12M6 6v8" stroke="currentColor" stroke-width="1.5"/></svg>' }
  ];

  /* ---------- 左侧图标栏：唯一数据源 ---------- */
  var ICON_ITEMS = [
    { label: "全部", title: "全部", svg: '<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/><rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor"/><rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/><rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/></svg>' },
    { label: "最近", title: "最近", svg: '<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 4v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    { label: "收藏", title: "收藏", svg: '<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M8 2l2.2 4.4 4.8.7-3.5 3.4.8 4.8L8 13l-4.3 2.3.8-4.8-3.5-3.4 4.8-.7L8 2z" fill="currentColor"/></svg>' },
    { label: "TLP", title: "标注TLP", svg: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M2 3h12v10H2V3z" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 6h6M5 9h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    { label: "AMS", title: "记忆AMS", svg: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 5v6M5 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    { label: "TiDB", title: "TiDB", svg: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' },
    { label: "AIM", title: "对话AIM", svg: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 4h10v8H9l-3 2v-2H3V4z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="6" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="8" r="1" fill="currentColor"/></svg>' },
    { label: "CIS", title: "智器CIS", svg: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 7h6M5 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
    { label: "Mgo", title: "MongoDB", svg: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M4 5c0-2 2-3 4-3s4 1 4 3c0 4-4 7-4 9" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' },
    { label: "规则", title: "云规则", svg: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M4 11h8v-1H4v1zm0-3h8V7H4v1zm0-3h8V4H4v1z" fill="currentColor"/></svg>' },
    { label: "DSC", title: "计算DSC", svg: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M2 8c2-3 4-4 6-4s4 1 6 4c-2 3-4 4-6 4s-4-1-6-4z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>' }
  ];

  /* ---------- 顶部导航栏 HTML ---------- */
  var HEADER_HTML =
    '<div class="header">' +
      '<div class="header-left">' +
        '<div class="logo"><img class="logo-icon" src="img/logo.png" alt="360智汇云" /></div>' +
        '<button class="header-btn">' +
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">' +
            '<path d="M2 6L8 1L14 6V14C14 14.5304 13.7893 15.0391 13.4142 15.4142C13.0391 15.7893 12.5304 16 12 16H4C3.46957 16 2.96086 15.7893 2.58579 15.4142C2.21071 15.0391 2 14.5304 2 14V6Z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M6 16V10H10V16" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg><span>工作台总览</span>' +
        '</button>' +
        '<button class="header-btn group">' +
          '<span class="tag">组</span><span>BD奇麟大数据-系统部</span>' +
          '<svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5L6 7.5L9 4.5" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="header-right">' +
        '<a class="header-link">费用</a>' +
        '<a class="header-link">工单<span class="dot"></span></a>' +
        '<a class="header-link">消息<span class="dot"></span></a>' +
        '<a class="header-link">帮助</a>' +
        '<div class="header-divider"></div>' +
        '<div class="user-info">' +
          '<div class="user-avatar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="currentColor"/></svg></div>' +
          '<div class="user-detail"><div class="user-name">zhangsan</div><div class="user-sub">子账号</div></div>' +
          '<svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5L6 7.5L9 4.5" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>' +
      '</div>' +
    '</div>';

  function buildIconBar() {
    var html = '<div class="icon-bar">';
    ICON_ITEMS.forEach(function (it, i) {
      html += '<div class="icon-item' + (i === 0 ? ' active' : '') + '" title="' + it.title + '">' +
        '<div class="icon-svg">' + it.svg + '</div>' +
        '<span class="icon-label">' + it.label + '</span>' +
        '</div>';
    });
    return html + '</div>';
  }

  function buildSidebar(activeText) {
    var items = SANDBOX_MENU.map(function (m) {
      var isActive = m.text === activeText;
      var iconHtml = '<div class="menu-icon">' + m.icon + '</div>';
      var textHtml = '<span class="menu-text">' + m.text + '</span>';
      // 统一范式：可跳转且非当前页 => <a class="menu-item">；当前页或无 href => <div class="menu-item">
      if (m.href && !isActive) {
        return '<a href="' + m.href + '" class="menu-item">' + iconHtml + textHtml + '</a>';
      }
      return '<div class="menu-item' + (isActive ? ' active' : '') + '">' + iconHtml + textHtml + '</div>';
    }).join("");

    return '<div class="sidebar"><div class="sidebar-menu">' +
      '<div class="menu-level-1">' +
        '<div class="menu-item">' +
          '<div class="menu-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
          '<span class="menu-text">AI沙箱 Sandbox</span>' +
          '<span class="menu-arrow"><svg class="star-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9,0 L6.21763372,5.92433023 L0,6.87455368 L4.5,11.4870539 L3.43727684,18 L9,14.9243307 L14.5627232,18 L13.5,11.4870539 L18,6.87455368 L11.7803574,5.92433023 L9,0 Z" stroke="currentColor" stroke-width="1.5"/></svg></span>' +
        '</div>' +
        '<div class="submenu-expanded">' + items + '</div>' +
      '</div>' +
    '</div></div>';
  }

  function buildBreadcrumb(text, link) {
    return '<div class="breadcrumb">' +
      '<span class="breadcrumb-left" id="menu-name-display">' + (text || "") + '</span>' +
      '<a class="breadcrumb-link" id="menu-link-display">' + (link || "Sandbox 帮助文档") + '</a>' +
    '</div>';
  }

  function bindShellEvents() {
    document.querySelectorAll(".icon-item").forEach(function (item) {
      item.addEventListener("click", function () {
        document.querySelectorAll(".icon-item").forEach(function (i) { i.classList.remove("active"); });
        this.classList.add("active");
      });
    });
    document.querySelectorAll(".menu-level-1 > .menu-item").forEach(function (item) {
      item.addEventListener("click", function (e) { e.stopPropagation(); this.classList.toggle("selected"); });
    });
  }

  function htmlToNode(html) {
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    return wrap.firstChild;
  }

  function renderShell() {
    var mount = document.getElementById("sandbox-shell");
    if (!mount) return;

    var active = mount.getAttribute("data-active") || "";
    var crumb = mount.getAttribute("data-breadcrumb") || active;
    var crumbLink = mount.getAttribute("data-breadcrumb-link") || "Sandbox 帮助文档";

    // 页面自带的第三栏主内容（差异部分）
    var mainContent = document.querySelector(".main-content");

    // 面包屑：主内容没有则补一个；有则在标题为空时回填
    if (mainContent && !mainContent.querySelector(".breadcrumb")) {
      mainContent.insertAdjacentHTML("afterbegin", buildBreadcrumb(crumb, crumbLink));
    } else if (mainContent) {
      var nameEl = mainContent.querySelector("#menu-name-display");
      if (nameEl && !nameEl.textContent.trim()) nameEl.textContent = crumb;
    }

    var headerEl = htmlToNode(HEADER_HTML);
    var iconBarEl = htmlToNode(buildIconBar());
    var sidebarEl = htmlToNode(buildSidebar(active));

    // 容器：优先复用页面已有的 .container（占位符在其中的情形）；
    // 否则新建一个 container，并把 main-content 放进去。
    var container = document.querySelector(".container");
    if (container) {
      // header 插到 container 之前；图标栏、侧边栏插到 main-content（或占位符）之前
      container.parentNode.insertBefore(headerEl, container);
      var anchor = mainContent && mainContent.parentNode === container ? mainContent : mount;
      container.insertBefore(iconBarEl, anchor);
      container.insertBefore(sidebarEl, anchor);
      if (mount.parentNode) mount.parentNode.removeChild(mount);
    } else {
      container = document.createElement("div");
      container.className = "container";
      container.appendChild(iconBarEl);
      container.appendChild(sidebarEl);
      mount.parentNode.insertBefore(headerEl, mount);
      mount.parentNode.insertBefore(container, mount);
      if (mainContent) container.appendChild(mainContent);
      mount.parentNode.removeChild(mount);
    }

    bindShellEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderShell);
  } else {
    renderShell();
  }

  // 暴露给其他脚本（如 ai-sandbox.js）判断 shell 是否已接管
  window.SandboxShell = { menu: SANDBOX_MENU, render: renderShell };
})();
