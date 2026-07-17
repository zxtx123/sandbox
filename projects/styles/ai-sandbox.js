(function () {
  const pageLabels = {
    "index.html": "沙箱实例",
    "sandbox-template.html": "沙箱模板",
    "sandbox-policy.html": "网络策略",
    "sandbox-policy-create.html": "网络策略",
    "sandbox-playground.html": "实验场"
  };

  function currentFile() {
    const file = location.pathname.split("/").pop();
    return file || "index.html";
  }

  function setActiveSandboxMenu() {
    // 公共区已由 sandbox-shell.js 注入并负责菜单高亮与面包屑，避免重复处理。
    if (window.SandboxShell) return;

    const label = pageLabels[currentFile()];
    if (!label) return;

    document.querySelectorAll(".sidebar .menu-item").forEach((item) => {
      const text = item.querySelector(".menu-text")?.textContent?.trim();
      if (text === label) {
        item.classList.add("active");
      } else if (Object.values(pageLabels).includes(text)) {
        item.classList.remove("active");
      }
    });

    const display = document.getElementById("menu-name-display");
    if (display) {
      display.textContent = currentFile() === "sandbox-policy-create.html" ? "网络策略 / 创建网络策略" : label;
    }
  }

  function makeIcon(kind) {
    if (kind === "grid") {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="4" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="14" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="1.6"/></svg>';
    }
    if (kind === "edit") {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19h4l9.2-9.2a2.1 2.1 0 0 0-3-3L6 16v3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M13.8 8.2l3 3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    }
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 1 1 2.34 5.66" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 18v-5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function ensureFloatingTools() {
    if (document.querySelector(".floating-buttons, .sandbox-float-tools")) return;

    const wrap = document.createElement("div");
    wrap.className = "sandbox-float-tools";
    wrap.innerHTML = [
      '<button class="sandbox-float-btn" type="button" title="快捷入口" aria-label="快捷入口">' + makeIcon("grid") + "</button>",
      '<button class="sandbox-float-btn primary sandbox-refresh-action" type="button" title="刷新" aria-label="刷新">' + makeIcon("refresh") + "</button>",
      '<button class="sandbox-float-btn" type="button" title="AI 助手" aria-label="AI 助手"><strong style="font-size:13px;line-height:1;">ai</strong></button>'
    ].join("");
    document.body.appendChild(wrap);
  }

  function rowMatches(row, keyword) {
    if (!keyword) return true;
    return row.textContent.toLowerCase().includes(keyword);
  }

  function removeEmptyRow(tbody) {
    tbody.querySelectorAll(".sandbox-filter-empty").forEach((row) => row.remove());
  }

  function showEmptyRow(tbody, colspan) {
    removeEmptyRow(tbody);
    const tr = document.createElement("tr");
    tr.className = "sandbox-filter-empty";
    tr.innerHTML = '<td class="sandbox-empty-cell" colspan="' + colspan + '"><span class="sandbox-empty"><span class="sandbox-empty-icon"></span><span>暂无匹配数据</span></span></td>';
    tbody.appendChild(tr);
  }

  function bindTableSearch() {
    const input = document.getElementById("sandbox-search");
    const table = document.querySelector(".product-table table, .table-wrapper table, table");
    if (!input || !table || input.dataset.sandboxBound === "1") return;

    input.dataset.sandboxBound = "1";
    const searchBox = input.closest(".search-box");
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody?.querySelectorAll("tr") || []);
    const colCount = table.querySelectorAll("thead th").length || 1;
    const updateValueState = () => {
      if (searchBox) searchBox.classList.toggle("has-value", input.value.trim().length > 0);
    };

    const apply = () => {
      const keyword = input.value.trim().toLowerCase();
      let visible = 0;
      updateValueState();
      removeEmptyRow(tbody);
      rows.forEach((row) => {
        const match = rowMatches(row, keyword);
        row.style.display = match ? "" : "none";
        if (match) visible += 1;
      });
      if (!visible) showEmptyRow(tbody, colCount);
    };

    input.addEventListener("input", apply);
    document.querySelectorAll(".clear-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        input.value = "";
        apply();
        input.focus();
      });
    });
    updateValueState();
  }

  function bindRefresh() {
    document.querySelectorAll(".refresh-btn, .sandbox-refresh-action, .float-btn.refresh").forEach((btn) => {
      if (btn.dataset.sandboxRefreshBound === "1") return;
      btn.dataset.sandboxRefreshBound = "1";
      btn.addEventListener("click", () => {
        btn.classList.remove("sandbox-spin");
        void btn.offsetWidth;
        btn.classList.add("sandbox-spin");
        window.setTimeout(() => btn.classList.remove("sandbox-spin"), 520);
      });
    });
  }

  function bindPlaygroundExamples() {
    const input = document.querySelector(".sandbox-input");
    if (!input) return;
    document.querySelectorAll(".example-btn").forEach((btn) => {
      if (btn.dataset.sandboxExampleBound === "1") return;
      btn.dataset.sandboxExampleBound = "1";
      btn.addEventListener("click", () => {
        input.value = btn.textContent.trim();
        input.focus();
      });
    });
  }

  function bindModalEsc() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      document.querySelectorAll(".modal-overlay.active").forEach((modal) => modal.classList.remove("active"));
    });
  }

  function init() {
    setActiveSandboxMenu();
    ensureFloatingTools();
    bindTableSearch();
    bindRefresh();
    bindPlaygroundExamples();
    bindModalEsc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
