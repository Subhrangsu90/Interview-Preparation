/* ═══════════════════════════════════════════════
   Interview Prep Viewer — Client App
   ═══════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── State ───
  const state = {
    tree: [],
    currentFile: null,
    fontSize: 16.5,
    theme: localStorage.getItem("ip-theme") || "paper",
    showLines: localStorage.getItem("ip-lines") !== "false",
    sidebarOpen: true,
    searchTimeout: null,
    tocVisible: false,
    tocHasContent: false,
  };

  // ─── DOM References ───
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    sidebar: $("#sidebar"),
    fileTree: $("#file-tree"),
    sidebarStats: $("#sidebar-stats"),
    contentInner: $("#content-inner"),
    contentArea: $("#content-area"),
    breadcrumb: $("#breadcrumb-bar"),
    tocBtn: $("#toggle-toc"),
    tocContainer: $("#toc-container"),
    welcomeScreen: $("#welcome-screen"),
    searchInput: $("#search-input"),
    searchResults: $("#search-results"),
    themeMenu: $("#theme-menu"),
    fontSizeLabel: $("#font-size-label"),
    toastContainer: $("#toast-container"),
  };

  // ─── SVG Icon System ───
  function svg(name, size = 16) {
    const s = size;
    const icons = {
      'folder':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
      'file':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      'file-text':    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
      'file-code':    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="10 15 8 17 10 19"/><polyline points="14 15 16 17 14 19"/></svg>`,
      'image':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
      'copy':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
      'save':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
      'play':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
      'palette':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-5.2-4.5-9.5-10-9.5z"/></svg>`,
      'terminal':     `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
      'x-circle':     `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      'alert-triangle': `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      'check-circle': `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      'refresh':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
      'zap':          `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      'star':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'link':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
      'frown':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
      'ban':          `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
      'info':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      'hash':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
      'globe':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      'timer':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      'sparkle':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'sparkles':     `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'brain':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/></svg>`,
      'check':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      'x':            `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      'key':          `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1 1-1.5-1.5-1.5 1.5 1.5 1.5L4.5 14.5a5 5 0 1 0 7-7l3-3"/><circle cx="7.5" cy="16.5" r="1.5"/></svg>`,
      'arrow-right':  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
      'arrow-left':   `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
      'target':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
      'flask':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v4l-4 12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l-4-12V2"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="7" y1="14" x2="17" y2="14"/></svg>`,
      'search':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      'lightbulb':    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/></svg>`,
    };
    return icons[name] || '';
  }

  // ─── File type helpers ───
  const EXT_ICONS = {
    ".js": svg('file-code'), ".ts": svg('file-code'), ".jsx": svg('file-code'), ".tsx": svg('file-code'),
    ".md": svg('file-text'), ".json": svg('file'), ".css": svg('palette'), ".html": svg('globe'),
    ".py": svg('file-code'), ".txt": svg('file-text'), ".png": svg('image'), ".jpg": svg('image'),
    ".jpeg": svg('image'), ".gif": svg('image'), ".svg": svg('image'), ".webp": svg('image'),
  };

  const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"];
  const CODE_EXTS = [".js", ".ts", ".jsx", ".tsx", ".json", ".css", ".html", ".py", ".java", ".c", ".cpp", ".go", ".rs", ".rb"];
  const MD_EXTS = [".md", ".markdown"];

  const LANG_MAP = {
    ".js": "javascript", ".ts": "typescript", ".jsx": "jsx", ".tsx": "tsx",
    ".json": "json", ".css": "css", ".html": "html", ".py": "python",
    ".sh": "bash", ".bash": "bash", ".md": "markdown",
  };

  function getIcon(name, ext, isDir) {
    if (isDir) return svg('folder');
    return EXT_ICONS[ext] || svg('file');
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  // ─── Toast Notification System ───
  function showToast(msg, type = "info") {
    const container = dom.toastContainer || document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    if (type === "success") {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === "error") {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <div class="toast-content">${msg}</div>
      <button class="toast-close" title="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="toast-timer"></div>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    let timer = null;

    const dismiss = () => {
      clearTimeout(timer);
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener("click", dismiss);
    timer = setTimeout(dismiss, 3500);

    container.appendChild(toast);
  }

  // ═══════════════════════════════════
  // FILE TREE
  // ═══════════════════════════════════
  async function loadTree() {
    try {
      const res = await fetch("/api/tree");
      if (!res.ok) {
        throw new Error(`Tree request failed (${res.status})`);
      }
      const data = await res.json();
      state.tree = data.tree;
      renderTree();
    } catch (err) {
      console.error("Failed to load tree:", err);
      showToast(svg('x-circle'), "Failed to load file tree");
    }
  }

  function renderTree() {
    dom.fileTree.innerHTML = "";
    let fileCount = 0;
    let folderCount = 0;

    function countItems(items) {
      for (const item of items) {
        if (item.type === "directory") { folderCount++; countItems(item.children || []); }
        else fileCount++;
      }
    }
    countItems(state.tree);

    dom.sidebarStats.innerHTML = `
      <span class="stat-badge">${svg('folder', 13)} ${folderCount} folders</span>
      <span class="stat-badge">${svg('file', 13)} ${fileCount} files</span>
    `;

    const fragment = document.createDocumentFragment();
    renderTreeLevel(state.tree, fragment, 0);
    dom.fileTree.appendChild(fragment);
  }

  function renderTreeLevel(items, container, depth) {
    for (const item of items) {
      const el = document.createElement("div");
      el.className = "tree-item";

      const icon = getIcon(item.name, item.extension, item.type === "directory");
      const isDir = item.type === "directory";
      const childCount = isDir ? (item.children || []).length : 0;

      const row = document.createElement("div");
      row.className = "tree-item-row";
      row.style.setProperty("--depth", depth);
      row.style.paddingLeft = (16 + depth * 18) + "px";

      if (isDir) {
        row.innerHTML = `
          <span class="tree-chevron"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
          <span class="tree-icon">${icon}</span>
          <span class="tree-name">${item.name}</span>
          ${childCount > 0 ? `<span class="tree-badge">${childCount}</span>` : ""}
        `;
      } else {
        row.innerHTML = `
          <span class="tree-icon">${icon}</span>
          <span class="tree-name">${item.name}</span>
        `;
      }

      el.appendChild(row);

      if (isDir) {
        const children = document.createElement("div");
        children.className = "tree-children expanded"; // auto-expand
        renderTreeLevel(item.children || [], children, depth + 1);
        el.appendChild(children);

        // Chevron starts expanded
        const chevron = row.querySelector(".tree-chevron");
        chevron.classList.add("expanded");

        row.addEventListener("click", (e) => {
          e.stopPropagation();
          children.classList.toggle("expanded");
          chevron.classList.toggle("expanded");
        });
      } else {
        row.addEventListener("click", (e) => {
          e.stopPropagation();
          loadFile(item.path);
          // Mark active
          $$(".tree-item-row.active").forEach((r) => r.classList.remove("active"));
          row.classList.add("active");
        });
      }

      container.appendChild(el);
    }
  }

  // ═══════════════════════════════════
  // FILE LOADING & RENDERING
  // ═══════════════════════════════════
  async function loadFile(filePath) {
    state.currentFile = filePath;
    const ext = "." + filePath.split(".").pop().toLowerCase();
    const fileName = filePath.split("/").pop();

    // Auto-close sidebar on mobile viewports
    if (window.innerWidth < 900) {
      state.sidebarOpen = false;
      dom.sidebar.classList.add("collapsed");
      const backdrop = document.getElementById("sidebar-backdrop");
      if (backdrop) backdrop.classList.remove("active");
    }

    // Update breadcrumb
    updateBreadcrumb(filePath);

    // Update Assistant Context
    if (typeof updateAssistantContext === "function") {
      updateAssistantContext(filePath);
    }

    // Hide welcome
    if (dom.welcomeScreen) dom.welcomeScreen.classList.add('hidden');

    // Image files
    if (IMAGE_EXTS.includes(ext)) {
      renderImage(filePath, fileName);
      hideTOC();
      return;
    }

    // Fetch text content
    try {
      dom.contentInner.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <span>Loading ${fileName}...</span>
        </div>
      `;

      const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();

      if (MD_EXTS.includes(ext)) {
        renderMarkdown(data.content, filePath, fileName);
      } else if (CODE_EXTS.includes(ext)) {
        renderCodeFile(data.content, ext, fileName, data.path);
      } else {
        renderPlainText(data.content, fileName);
      }
    } catch (err) {
      dom.contentInner.innerHTML = `
        <div class="welcome-screen">
          <div class="welcome-icon">${svg('frown', 48)}</div>
          <h2 class="welcome-title">Oops!</h2>
          <p class="welcome-subtitle">Could not load ${fileName}.</p>
        </div>
      `;
      hideTOC();
    }

    // Scroll to top
    dom.contentArea.scrollTop = 0;
  }

  // ─── Render Markdown ───
  function renderMarkdown(content, filePath, fileName) {
    // Configure marked
    const renderer = new marked.Renderer();
    const basePath = filePath.substring(0, filePath.lastIndexOf("/"));

    // Handle images — resolve relative paths to /api/raw
    // marked v12 uses positional args: image(href, title, text)
    renderer.image = function (href, title, text) {
      let src = href || '';
      const alt = text || '';
      // Resolve relative image paths
      if (src.startsWith("./")) src = src.substring(2);
      if (!src.startsWith("http") && !src.startsWith("/")) {
        src = `/api/raw?path=${encodeURIComponent(basePath ? basePath + "/" + src : src)}`;
      }
      return `<img src="${src}" alt="${alt}" loading="lazy">`;
    };

    // Code blocks with copy button and lang tag
    // marked v12 uses positional args: code(code, language, escaped)
    renderer.code = function (codeStr, lang, escaped) {
      const code = (codeStr || '').trim();
      lang = lang || '';
      const langClass = lang ? `language-${lang}` : "";
      const highlighted = lang && Prism.languages[lang]
        ? Prism.highlight(code, Prism.languages[lang], lang)
        : escapeHtml(code);

      return `<pre><div class="code-block-header"><span class="code-lang-tag">${lang || "code"}</span><button class="code-copy-btn" onclick="copyCode(this)">${svg('copy', 12)} Copy</button></div><code class="${langClass}">${highlighted}</code></pre>`;
    };

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: false,
    });

    const html = marked.parse(content);
    dom.contentInner.innerHTML = `<div class="rendered-content">${html}</div>`;

    // Build TOC
    buildTOC();
  }

  // ─── Monaco Editor Instance ───
  let monacoEditorInstance = null;
  let currentEditorFilePath = null;

  const MONACO_LANG_MAP = {
    ".js": "javascript", ".ts": "typescript", ".jsx": "javascript", ".tsx": "typescript",
    ".json": "json", ".css": "css", ".html": "html", ".py": "python",
    ".sh": "shell", ".bash": "shell", ".md": "markdown", ".java": "java",
    ".cpp": "cpp", ".c": "c", ".go": "go", ".rs": "rust", ".php": "php"
  };

  // ─── Render Code File (VS Code Editor) ───
  function renderCodeFile(content, ext, fileName, filePath) {
    // Dispose previous Monaco instance if any
    if (monacoEditorInstance) {
      monacoEditorInstance.dispose();
      monacoEditorInstance = null;
    }

    currentEditorFilePath = filePath;
    const monacoLang = MONACO_LANG_MAP[ext] || "javascript";
    const icon = getIcon(fileName, ext, false);
    const rawLines = content.split("\n");

    dom.contentInner.innerHTML = `
      <div class="vscode-container">
        <!-- VS Code Top Tab Bar -->
        <div class="vscode-topbar">
          <div class="vscode-tabs">
            <div class="vscode-tab active">
              <span class="vscode-tab-icon">${icon}</span>
              <span class="vscode-tab-name">${fileName}</span>
              <span class="vscode-dirty-dot" id="vscode-dirty-dot" style="display:none;">•</span>
            </div>
          </div>
          <div class="vscode-actions">
            ${['.js', '.ts'].includes(ext) ? `<button class="vscode-btn vscode-btn-run" onclick="window.__runJSCode()" title="Run Code (Ctrl+Enter)">${svg('play', 13)} Run</button>` : ''}
            <button class="vscode-btn vscode-btn-save" onclick="window.__saveCodeFile()" title="Save File (Ctrl+S)">${svg('save', 13)} Save</button>
            <button class="vscode-btn" onclick="window.__formatCodeFile()" title="Format Code">${svg('palette', 13)} Format</button>
            <button class="vscode-btn" onclick="window.__copyCodeFile()" title="Copy Code">${svg('copy', 13)} Copy</button>
          </div>
        </div>

        <!-- Monaco Editor Container -->
        <div class="vscode-editor-wrapper">
          <div id="monaco-editor-container" class="monaco-editor-box"></div>
        </div>

        <!-- VS Code / DevTools Console Output Panel (for JS/TS) -->
        <div class="vscode-console-panel" id="vscode-console-panel" style="display:none;">
          <div class="vscode-console-header">
            <span class="vscode-console-title">${svg('terminal', 13)} Console</span>
            <span class="vscode-console-meta" id="vscode-console-meta"></span>
            <button class="vscode-console-clear" onclick="window.__clearConsole()" title="Clear Console">${svg('ban', 12)} Clear</button>
            <button class="vscode-console-close" onclick="document.getElementById('vscode-console-panel').style.display='none'">&times;</button>
          </div>
          <div class="vscode-console-body" id="vscode-console-body"></div>
          <div class="vscode-console-prompt">
            <span class="console-prompt-icon">›</span>
            <input type="text" class="console-prompt-input" id="console-prompt-input" placeholder="Evaluate JavaScript expression..." onkeydown="if(event.key==='Enter') window.__evalConsolePrompt(this.value)">
          </div>
        </div>

        <!-- VS Code Status Bar -->
        <div class="vscode-statusbar">
          <div class="vscode-status-left">
            <span>READY</span>
            <span id="vscode-cursor-pos">Ln 1, Col 1</span>
          </div>
          <div class="vscode-status-right">
            <span>${rawLines.length} lines</span>
            <span>UTF-8</span>
            <span class="vscode-lang-badge">${monacoLang.toUpperCase()}</span>
          </div>
        </div>
      </div>
    `;

    window.__fullFileContent = content;
    hideTOC();

    // Initialize Monaco Editor
    initMonacoEditor(content, monacoLang);
  }

  function initMonacoEditor(content, lang) {
    const editorContainer = document.getElementById("monaco-editor-container");
    if (!editorContainer) return;

    // Load monaco if require is defined
    if (window.require) {
      window.require.config({
        paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs" }
      });

      window.require(["vs/editor/editor.main"], function () {
        const editorTheme = state.theme === "dark" ? "vs-dark" : "vs";

        monacoEditorInstance = monaco.editor.create(editorContainer, {
          value: content,
          language: lang,
          theme: editorTheme,
          automaticLayout: true,
          fontSize: Math.round(state.fontSize),
          fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
          fontLigatures: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          lineNumbers: "on",
          renderLineHighlight: "all",
          tabSize: 2,
        });

        // Dirty state indicator
        monacoEditorInstance.onDidChangeModelContent(() => {
          const dirtyDot = document.getElementById("vscode-dirty-dot");
          if (dirtyDot) dirtyDot.style.display = "inline";
        });

        // Update cursor position in status bar
        monacoEditorInstance.onDidChangeCursorPosition((e) => {
          const posEl = document.getElementById("vscode-cursor-pos");
          if (posEl) posEl.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
        });

        // Add Ctrl+S save shortcut
        monacoEditorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
          window.__saveCodeFile();
        });

        // Add Ctrl+Enter run shortcut
        monacoEditorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
          window.__runJSCode();
        });
      });
    }
  }

  // Save Code File via API
  window.__saveCodeFile = async function () {
    if (!monacoEditorInstance || !currentEditorFilePath) return;
    const content = monacoEditorInstance.getValue();

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: currentEditorFilePath, content })
      });

      const data = await res.json();
      if (data.success) {
        showToast(svg('check-circle'), "File saved successfully!");
        const dirtyDot = document.getElementById("vscode-dirty-dot");
        if (dirtyDot) dirtyDot.style.display = "none";
      } else {
        showToast(svg('x-circle'), "Failed to save file");
      }
    } catch (err) {
      showToast(svg('x-circle'), "Error saving file: " + err.message);
    }
  };

  // ─── Real DevTools Console Engine ───
  window.__runJSCode = function () {
    if (!monacoEditorInstance) return;
    const code = monacoEditorInstance.getValue();

    const consolePanel = document.getElementById("vscode-console-panel");
    const consoleBody = document.getElementById("vscode-console-body");
    const consoleMeta = document.getElementById("vscode-console-meta");

    if (!consolePanel || !consoleBody) return;

    consolePanel.style.display = "flex";
    consoleBody.innerHTML = "";

    const logs = [];
    const startTime = performance.now();
    const counts = {};
    const timers = {};
    let groupIndent = 0;

    const getIndentPx = () => (groupIndent * 16) + "px";

    const customConsole = {
      log: (...args) => logs.push({ type: "log", html: formatConsoleItem(args), indent: getIndentPx() }),
      warn: (...args) => logs.push({ type: "warn", html: `<span class="dev-icon">${svg('alert-triangle', 13)}</span> ` + formatConsoleItem(args), indent: getIndentPx() }),
      error: (...args) => logs.push({ type: "error", html: `<span class="dev-icon">${svg('x-circle', 13)}</span> ` + formatConsoleItem(args), indent: getIndentPx() }),
      info: (...args) => logs.push({ type: "info", html: `<span class="dev-icon">${svg('info', 13)}</span> ` + formatConsoleItem(args), indent: getIndentPx() }),
      dir: (obj) => logs.push({ type: "log", html: formatObjectTree(obj), indent: getIndentPx() }),
      table: (data) => logs.push({ type: "table", html: buildDevToolsTable(data), indent: getIndentPx() }),
      group: (...args) => {
        const title = args.length > 0 ? args.map(formatConsoleArg).join(" ") : "Console Group";
        logs.push({ type: "group-header", html: `<span class="group-caret">▼</span> <strong>${escapeHtml(title)}</strong>`, indent: getIndentPx() });
        groupIndent++;
      },
      groupCollapsed: (...args) => {
        const title = args.length > 0 ? args.map(formatConsoleArg).join(" ") : "Console Group";
        logs.push({ type: "group-header", html: `<span class="group-caret">▶</span> <strong>${escapeHtml(title)}</strong>`, indent: getIndentPx() });
        groupIndent++;
      },
      groupEnd: () => {
        if (groupIndent > 0) groupIndent--;
      },
      time: (label = "default") => {
        timers[label] = performance.now();
      },
      timeEnd: (label = "default") => {
        if (timers[label]) {
          const elapsed = (performance.now() - timers[label]).toFixed(2);
          logs.push({ type: "info", html: `<span class="dev-icon">${svg('timer', 13)}</span> <span>${escapeHtml(label)}: ${elapsed}ms</span>`, indent: getIndentPx() });
          delete timers[label];
        }
      },
      count: (label = "default") => {
        counts[label] = (counts[label] || 0) + 1;
        logs.push({ type: "log", html: `<span>${escapeHtml(label)}: ${counts[label]}</span>`, indent: getIndentPx() });
      },
      countReset: (label = "default") => {
        counts[label] = 0;
      },
      assert: (cond, ...args) => {
        if (!cond) {
          const msg = args.length > 0 ? args.map(formatConsoleArg).join(" ") : "Assertion failed";
          logs.push({ type: "error", html: `<span class="dev-icon">${svg('x-circle', 13)}</span> Assertion failed: ${escapeHtml(msg)}`, indent: getIndentPx() });
        }
      },
      trace: (...args) => {
        const msg = args.map(formatConsoleArg).join(" ");
        const stack = new Error().stack.split("\n").slice(2).join("\n");
        logs.push({ type: "warn", html: `<span class="dev-icon">${svg('alert-triangle', 13)}</span> Trace: ${escapeHtml(msg)}<pre class="console-trace">${escapeHtml(stack)}</pre>`, indent: getIndentPx() });
      },
      clear: () => {
        logs.length = 0;
        consoleBody.innerHTML = "";
      }
    };

    try {
      const runFn = new Function("console", code);
      runFn(customConsole);
      const executionTime = (performance.now() - startTime).toFixed(2);

      if (consoleMeta) consoleMeta.textContent = `Done in ${executionTime}ms`;

      if (logs.length === 0) {
        consoleBody.innerHTML = `<div class="console-line console-meta">${svg('zap', 13)} Code executed with no console output.</div>`;
      } else {
        consoleBody.innerHTML = logs.map(l => `
          <div class="console-line console-${l.type}" style="padding-left: ${l.indent};">
            <div class="console-line-content">${l.html}</div>
          </div>
        `).join("");
      }
    } catch (err) {
      if (consoleMeta) consoleMeta.textContent = `Execution Error`;
      consoleBody.innerHTML = `
        <div class="console-line console-error">
          <span class="dev-icon">${svg('x-circle', 14)}</span>
          <div class="console-line-content">
            <strong>Uncaught ${escapeHtml(err.name)}: ${escapeHtml(err.message)}</strong>
            <pre class="console-trace">${escapeHtml(err.stack || '')}</pre>
          </div>
        </div>
      `;
    }

    consoleBody.scrollTop = consoleBody.scrollHeight;
  };

  // Build authentic HTML <table> for console.table()
  function buildDevToolsTable(data) {
    if (!data || typeof data !== "object") return escapeHtml(String(data));

    // Handle array of objects
    if (Array.isArray(data)) {
      if (data.length === 0) return `<div class="devtools-table-empty">Array[0]</div>`;

      // Extract all unique keys
      const keys = new Set();
      data.forEach(item => {
        if (item && typeof item === "object") {
          Object.keys(item).forEach(k => keys.add(k));
        }
      });

      const cols = Array.from(keys);

      let tableHtml = `<table class="devtools-table"><thead><tr><th>(index)</th>`;
      cols.forEach(col => { tableHtml += `<th>${escapeHtml(col)}</th>`; });
      tableHtml += `</tr></thead><tbody>`;

      data.forEach((item, idx) => {
        tableHtml += `<tr><td class="idx-col">${idx}</td>`;
        if (item && typeof item === "object") {
          cols.forEach(col => {
            const val = item[col];
            tableHtml += `<td>${val !== undefined ? escapeHtml(formatConsoleArg(val)) : '<span class="empty-val">empty</span>'}</td>`;
          });
        } else {
          tableHtml += `<td colspan="${cols.length}">${escapeHtml(formatConsoleArg(item))}</td>`;
        }
        tableHtml += `</tr>`;
      });

      tableHtml += `</tbody></table>`;
      return tableHtml;
    }

    // Handle plain object
    const keys = Object.keys(data);
    let tableHtml = `<table class="devtools-table"><thead><tr><th>(index)</th><th>Value</th></tr></thead><tbody>`;
    keys.forEach(k => {
      tableHtml += `<tr><td class="idx-col">${escapeHtml(k)}</td><td>${escapeHtml(formatConsoleArg(data[k]))}</td></tr>`;
    });
    tableHtml += `</tbody></table>`;
    return tableHtml;
  }

  function formatConsoleItem(args) {
    return args.map(arg => {
      if (typeof arg === "object" && arg !== null) {
        return formatObjectTree(arg);
      }
      return `<span>${escapeHtml(String(arg))}</span>`;
    }).join(" ");
  }

  function formatObjectTree(obj) {
    try {
      const json = JSON.stringify(obj, null, 2);
      return `<pre class="console-obj-pre">${escapeHtml(json)}</pre>`;
    } catch {
      return `<span>${escapeHtml(String(obj))}</span>`;
    }
  }

  function formatConsoleArg(arg) {
    if (typeof arg === "object" && arg !== null) {
      try { return JSON.stringify(arg); } catch { return String(arg); }
    }
    return String(arg);
  }

  // Interactive REPL prompt evaluation
  window.__evalConsolePrompt = function (expr) {
    const input = document.getElementById("console-prompt-input");
    const consoleBody = document.getElementById("vscode-console-body");
    if (!expr.trim() || !consoleBody) return;

    // Append prompt line
    const promptLine = document.createElement("div");
    promptLine.className = "console-line console-prompt-entry";
    promptLine.innerHTML = `<span class="dev-icon">&rsaquo;</span> <code>${escapeHtml(expr)}</code>`;
    consoleBody.appendChild(promptLine);

    try {
      // Evaluate in current monaco environment context
      const res = window.eval(expr);
      const resultLine = document.createElement("div");
      resultLine.className = "console-line console-result";
      resultLine.innerHTML = `<span class="dev-icon">&lsaquo;</span> ${formatConsoleItem([res])}`;
      consoleBody.appendChild(resultLine);
    } catch (err) {
      const errorLine = document.createElement("div");
      errorLine.className = "console-line console-error";
      errorLine.innerHTML = `<span class="dev-icon">${svg('x-circle', 13)}</span> Uncaught ${escapeHtml(err.message)}`;
      consoleBody.appendChild(errorLine);
    }

    input.value = "";
    consoleBody.scrollTop = consoleBody.scrollHeight;
  };

  window.__clearConsole = function () {
    const consoleBody = document.getElementById("vscode-console-body");
    if (consoleBody) consoleBody.innerHTML = "";
  };

  window.__formatCodeFile = function () {
    if (monacoEditorInstance) {
      monacoEditorInstance.getAction("editor.action.formatDocument").run();
      showToast(svg('palette'), "Formatted document");
    }
  };

  window.__copyCodeFile = function () {
    if (monacoEditorInstance) {
      navigator.clipboard.writeText(monacoEditorInstance.getValue()).then(() => {
        showToast(svg('copy'), "Copied code to clipboard!");
      });
    }
  };

  // ─── Render Image ───
  function renderImage(filePath, fileName) {
    const src = `/api/raw?path=${encodeURIComponent(filePath)}`;
    dom.contentInner.innerHTML = `
      <div class="image-viewer">
        <div class="code-file-header">
          <span class="code-file-icon">${svg('image', 28)}</span>
          <div class="code-file-info">
            <h2>${fileName}</h2>
            <div class="code-file-meta"><span>Image</span></div>
          </div>
        </div>
        <img src="${src}" alt="${fileName}" loading="lazy">
        <span class="image-caption">${svg('link', 14)} ${fileName}</span>
      </div>
    `;
    hideTOC();
  }

  // ─── Render Plain Text ───
  function renderPlainText(content, fileName) {
    dom.contentInner.innerHTML = `
      <div class="code-file-container">
        <div class="code-file-header">
          <span class="code-file-icon">${svg('file-text', 28)}</span>
          <div class="code-file-info">
            <h2>${fileName}</h2>
            <div class="code-file-meta"><span>Plain text</span></div>
          </div>
        </div>
        <div class="code-file-body">
          <pre><code>${escapeHtml(content)}</code></pre>
        </div>
      </div>
    `;
    hideTOC();
  }

  // ═══════════════════════════════════
  // BREADCRUMB
  // ═══════════════════════════════════
  function updateBreadcrumb(filePath) {
    const parts = filePath.split("/");
    let html = `<span class="breadcrumb-item" onclick="window.__goHome()">Workspace</span>`;

    let accumulated = "";
    for (let i = 0; i < parts.length; i++) {
      accumulated += (i > 0 ? "/" : "") + parts[i];
      html += `<span class="breadcrumb-sep"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>`;
      if (i === parts.length - 1) {
        html += `<span class="breadcrumb-current">${parts[i]}</span>`;
      } else {
        html += `<span class="breadcrumb-item" data-path="${accumulated}">${parts[i]}</span>`;
      }
    }
    dom.breadcrumb.innerHTML = html;

    // Attach click listeners to breadcrumb items
    dom.breadcrumb.querySelectorAll(".breadcrumb-item[data-path]").forEach((item) => {
      item.addEventListener("click", () => {
        const p = item.dataset.path;
        if (p) {
          showFolderNotes(p);
        } else {
          window.__goHome();
        }
      });
    });
  }

  window.__goHome = function () {
    const welcome = document.getElementById("welcome-screen");
    if (welcome) {
      welcome.classList.remove("hidden");
    } else {
      dom.contentInner.innerHTML = `
        <div class="welcome-screen" id="welcome-screen">
          <div class="welcome-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="13" y2="11"/></svg>
          </div>
          <p class="welcome-eyebrow">YOUR KNOWLEDGE BASE</p>
          <h2 class="welcome-title">Ready when you are.</h2>
          <p class="welcome-subtitle">Select a note from your library to start reading.</p>
          <div class="welcome-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            <span>Your workspace updates automatically</span>
          </div>
        </div>
      `;
    }
    dom.breadcrumb.innerHTML = `<span class="breadcrumb-item">Workspace</span>`;
    hideTOC();
    $$(".tree-item-row.active").forEach((r) => r.classList.remove("active"));
  };

  // ═══════════════════════════════════
  // TABLE OF CONTENTS
  // ═══════════════════════════════════
  function hideTOC() {
    state.tocHasContent = false;
    if (dom.tocBtn) {
      dom.tocBtn.classList.add('hidden');
      dom.tocBtn.classList.remove('active');
    }
    if (dom.tocContainer) {
      dom.tocContainer.classList.add('hidden');
    }
  }

  function buildTOC() {
    const headings = dom.contentInner.querySelectorAll(".rendered-content h1, .rendered-content h2, .rendered-content h3, .rendered-content h4, .rendered-content h5, .rendered-content h6");
    if (!headings || headings.length === 0) {
      hideTOC();
      return;
    }

    let html = `
      <div class="toc-header">
        <span class="toc-title">Table of Contents</span>
        <button class="toc-close-btn" id="toc-close-btn" title="Close TOC">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="toc-list">
    `;

    headings.forEach((h, i) => {
      const level = parseInt(h.tagName[1]) || 2;
      const id = "heading-" + i;
      h.id = id;
      html += `<a href="#${id}" class="toc-link depth-${level}">${escapeHtml(h.textContent)}</a>`;
    });
    html += `</div>`;

    dom.tocContainer.innerHTML = html;
    state.tocHasContent = true;

    // Show floating TOC button for markdown
    if (dom.tocBtn) dom.tocBtn.classList.remove('hidden');

    // Show or hide based on toggle state
    if (state.tocVisible) {
      dom.tocContainer.classList.remove('hidden');
      if (dom.tocBtn) dom.tocBtn.classList.add('active');
    } else {
      dom.tocContainer.classList.add('hidden');
      if (dom.tocBtn) dom.tocBtn.classList.remove('active');
    }

    // Bind link click scrolling
    dom.tocContainer.querySelectorAll(".toc-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    const closeBtn = document.getElementById("toc-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        state.tocVisible = false;
        dom.tocContainer.classList.add('hidden');
        if (dom.tocBtn) dom.tocBtn.classList.remove('active');
      });
    }
  }

  // ═══════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════
  async function performSearch(query) {
    if (!query.trim()) {
      dom.searchResults.classList.remove("active");
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.results.length === 0) {
        dom.searchResults.innerHTML = `<div class="search-result-item"><span class="search-result-name">No results found</span></div>`;
      } else {
        dom.searchResults.innerHTML = data.results
          .slice(0, 20)
          .map((r) => {
            let matchHtml = "";
            if (r.matches) {
              matchHtml = r.matches.map((m) => `<div class="search-result-match">L${m.line}: ${escapeHtml(m.text)}</div>`).join("");
            }
            return `
              <div class="search-result-item" onclick="window.__openFile('${r.path}')">
                <div class="search-result-name">${getIcon(r.name, "." + r.name.split(".").pop(), false)} ${r.name}</div>
                <div class="search-result-path">${r.path}</div>
                ${matchHtml}
              </div>
            `;
          })
          .join("");
      }

      dom.searchResults.classList.add("active");
    } catch (err) {
      console.error("Search error:", err);
    }
  }

  window.__openFile = function (path) {
    dom.searchResults.classList.remove("active");
    dom.searchInput.value = "";
    loadFile(path);
  };

  // ═══════════════════════════════════
  // THEME
  // ═══════════════════════════════════
  function applyTheme(theme) {
    state.theme = theme || "paper";
    if (state.theme === "paper") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", state.theme);
    }
    localStorage.setItem("ip-theme", state.theme);

    if (window.monaco && monacoEditorInstance) {
      monaco.editor.setTheme(state.theme === "dark" ? "vs-dark" : "vs");
    }

    const themeNames = {
      paper: "Paper Warm",
      sepia: "Sepia Soft",
      dark: "Midnight Dark",
      japanese: "Japanese Sakura",
    };

    const toggleBtn = $("#theme-toggle");
    if (toggleBtn) {
      toggleBtn.title = `Switch theme (Current: ${themeNames[state.theme] || state.theme})`;
    }

    $$(".theme-option").forEach((btn) => {
      const isSelected = btn.dataset.theme === state.theme;
      btn.classList.toggle("active", isSelected);
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  // ═══════════════════════════════════
  // FONT SIZE
  // ═══════════════════════════════════
  function updateFontSize(delta) {
    state.fontSize = Math.max(12, Math.min(24, state.fontSize + delta));
    document.documentElement.style.setProperty("--font-size-reading", state.fontSize + "px");
    dom.fontSizeLabel.textContent = Math.round(state.fontSize);
    localStorage.setItem("ip-font-size", state.fontSize);
  }

  // ═══════════════════════════════════
  // LIVE RELOAD (SSE)
  // ═══════════════════════════════════
  // ─── Live Reload (SSE) ───
  function connectLiveReload() {
    // If deployed on Vercel or production static host, live watch is not applicable
    if (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("vercel")) {
      if (dom.liveIndicator) dom.liveIndicator.style.display = "none";
      return;
    }

    let evtSource;
    try {
      evtSource = new EventSource("/api/watch");
    } catch {
      if (dom.liveIndicator) dom.liveIndicator.style.display = "none";
      return;
    }

    evtSource.onmessage = (event) => {
      if (event.data === "disabled-on-vercel") {
        if (dom.liveIndicator) dom.liveIndicator.style.display = "none";
        evtSource.close();
        return;
      }

      if (event.data === "connected" || event.data === "chokidar-not-available") return;

      try {
        const change = JSON.parse(event.data);

        // Refresh tree on any file system change
        loadTree();

        // If the currently viewed file changed, reload it
        if (state.currentFile && change.path === state.currentFile && change.event === "change") {
          loadFile(state.currentFile);
          showToast(svg('refresh'), `Updated: ${change.path.split("/").pop()}`);
        }

        // Notify on new files
        if (change.event === "add") {
          showToast(svg('star'), `New file: ${change.path.split("/").pop()}`);
        }
      } catch { /* ignore parse errors */ }
    };

    evtSource.onerror = () => {
      evtSource.close();

      // Only retry on local environment
      if (!window.location.hostname.includes("vercel")) {
        setTimeout(() => {
          connectLiveReload();
        }, 5000);
      }
    };
  }

  // ═══════════════════════════════════
  // TOAST
  // ═══════════════════════════════════
  function showToast(icon, message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ═══════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Global copy function
  window.copyCode = function (btn, isFullFile) {
    let code;
    if (isFullFile) {
      const codeEl = btn.closest(".code-file-body").querySelector("code");
      code = decodeURIComponent(codeEl.dataset.raw || codeEl.textContent);
    } else {
      const codeEl = btn.closest("pre").querySelector("code");
      code = codeEl.textContent;
    }

    navigator.clipboard.writeText(code).then(() => {
      btn.innerHTML = `${svg('check-circle', 12)} Copied!`;
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = isFullFile ? `${svg('copy', 12)} Copy All` : "Copy";
        btn.classList.remove("copied");
      }, 2000);
    });
  };

  // ═══════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════
  function init() {
    // Apply saved theme
    applyTheme(state.theme);

    // Apply saved font size
    const savedFontSize = localStorage.getItem("ip-font-size");
    if (savedFontSize) {
      state.fontSize = parseFloat(savedFontSize);
      document.documentElement.style.setProperty("--font-size-reading", state.fontSize + "px");
      dom.fontSizeLabel.textContent = Math.round(state.fontSize);
    }

    // Apply lines (now opt-in: show-lines class)
    if (state.showLines) dom.contentArea.classList.add('show-lines');

    // Load file tree
    loadTree();

    // Connect live reload
    connectLiveReload();

    // Initialize A2UI Assistant
    initAssistant();

    // Create mobile backdrop element if missing
    let backdrop = document.getElementById("sidebar-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "sidebar-backdrop";
      backdrop.className = "sidebar-backdrop";
      document.body.appendChild(backdrop);
    }

    backdrop.addEventListener("click", () => {
      state.sidebarOpen = false;
      dom.sidebar.classList.add("collapsed");
      backdrop.classList.remove("active");
    });

    // ─── Sidebar toggle ───
    $("#toggle-sidebar").addEventListener("click", () => {
      state.sidebarOpen = !state.sidebarOpen;
      dom.sidebar.classList.toggle("collapsed", !state.sidebarOpen);
      if (window.innerWidth < 900) {
        backdrop.classList.toggle("active", state.sidebarOpen);
      }
    });

    // ─── Search ───
    dom.searchInput.addEventListener("input", (e) => {
      clearTimeout(state.searchTimeout);
      state.searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
    });

    dom.searchInput.addEventListener("focus", () => {
      if (dom.searchInput.value.trim()) dom.searchResults.classList.add("active");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        dom.searchResults.classList.remove("active");
      }
    });

    // ─── Theme ───
    $("#theme-toggle").addEventListener("click", (e) => {
      e.stopPropagation();
      dom.themeMenu.classList.toggle("active");
    });

    $$(".theme-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyTheme(btn.dataset.theme);
        dom.themeMenu.classList.remove("active");
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".theme-dropdown")) {
        dom.themeMenu.classList.remove("active");
      }
      if (state.tocVisible && !e.target.closest("#toc-container") && !e.target.closest("#toggle-toc")) {
        state.tocVisible = false;
        dom.tocContainer.classList.add("hidden");
        if (dom.tocBtn) dom.tocBtn.classList.remove("active");
      }
    });

    // ─── Font size ───
    $("#font-decrease").addEventListener("click", () => updateFontSize(-1));
    $("#font-increase").addEventListener("click", () => updateFontSize(1));

    // ─── TOC toggle ───
    if (dom.tocBtn) {
      dom.tocBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.tocVisible = !state.tocVisible;
        if (state.tocVisible && state.tocHasContent) {
          dom.tocContainer.classList.remove('hidden');
          dom.tocBtn.classList.add('active');
        } else {
          dom.tocContainer.classList.add('hidden');
          dom.tocBtn.classList.remove('active');
        }
      });
    }

    // ─── Keyboard shortcuts ───
    document.addEventListener("keydown", (e) => {
      // Ctrl+K or Ctrl+/ to focus search
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "/")) {
        e.preventDefault();
        dom.searchInput.focus();
      }
      // Escape to close search, theme menu, and TOC
      if (e.key === "Escape") {
        dom.searchResults.classList.remove("active");
        dom.themeMenu.classList.remove("active");
        if (state.tocVisible) {
          state.tocVisible = false;
          dom.tocContainer.classList.add("hidden");
          if (dom.tocBtn) dom.tocBtn.classList.remove("active");
        }
        dom.searchInput.blur();
      }
    });
  }

  // ═══════════════════════════════════
  // A2UI ASSISTANT & GENERATIVE UI ENGINE
  // ═══════════════════════════════════
  let updateAssistantContext = null;

  function initAssistant() {
    const toggleBtn = $("#toggle-assistant-btn");
    const drawer = $("#assistant-drawer");
    const resizeHandle = $("#drawer-resize-handle");
    const expandBtn = $("#assistant-expand-btn");
    const closeBtn = $("#assistant-close-btn");
    const clearBtn = $("#assistant-clear-btn");
    const settingsBtn = $("#assistant-settings-btn");
    const settingsModal = $("#assistant-settings-modal");
    const modalCloseBtn = $("#modal-close-btn");
    const modalCancelBtn = $("#modal-cancel-btn");
    const modalSaveBtn = $("#modal-save-btn");
    const providerSelect = $("#setting-provider");
    const apiKeyInput = $("#setting-api-key");
    const modelInput = $("#setting-model");
    const chatBody = $("#assistant-chat-body");
    const form = $("#assistant-form");
    const input = $("#assistant-input");
    const contextLabel = $("#context-file-label");
    const providerLabel = $("#assistant-provider-label");
    const quickChips = $$(".quick-chip");

    // Refine UI Elements
    const promptRefineBtn = $("#assistant-prompt-refine-btn");
    const promptRefinePresets = $$(".refine-preset-btn");
    const promptRefinePreview = $("#prompt-refine-preview");
    const refineModeTag = $("#refine-mode-tag");
    const refineReason = $("#refine-reason");
    const refineContent = $("#refine-content");
    const refineTags = $("#refine-tags");
    const refineCloseBtn = $("#refine-close-btn");
    const refineDiscardBtn = $("#refine-discard-btn");
    const refineCopyBtn = $("#refine-copy-btn");
    const refineApplyBtn = $("#refine-apply-btn");
    const refineSendNowBtn = $("#refine-send-now-btn");
    const charCountEl = $("#prompt-char-count");
    const welcomeSuggestions = $$(".suggestion-chip");

    let history = [];
    let selectedRefineMode = "auto";
    let activeAbortController = null;
    let lastUserQuery = "";

    // State settings
    let aiSettings = {
      provider: localStorage.getItem("ip-ai-provider") || "gemini",
      apiKey: localStorage.getItem("ip-ai-key") || "",
      model: localStorage.getItem("ip-ai-model") || "gemini-2.5-flash",
    };

    // Restore saved custom drawer width on desktop
    const savedDrawerWidth = localStorage.getItem("ip-drawer-width");
    if (savedDrawerWidth && drawer && window.innerWidth > 768) {
      drawer.style.width = savedDrawerWidth;
    }

    // Responsive window resize listener
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768 && drawer) {
        drawer.style.width = "";
      } else if (drawer && savedDrawerWidth) {
        drawer.style.width = savedDrawerWidth;
      }
    });

    // ─── Resizable Drawer (Drag Handle) ───
    if (resizeHandle && drawer) {
      let isDragging = false;
      let startX = 0;
      let startWidth = 0;
      let animationFrameId = null;

      resizeHandle.addEventListener("mousedown", (e) => {
        if (window.innerWidth <= 768) return;
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
        startWidth = drawer.getBoundingClientRect().width;
        drawer.classList.add("resizing");
        document.body.style.cursor = "ew-resize";
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging || window.innerWidth <= 768) return;
        const deltaX = startX - e.clientX;
        const newWidth = Math.min(window.innerWidth - 30, Math.max(360, startWidth + deltaX));
        
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
          drawer.style.width = `${newWidth}px`;
          drawer.classList.remove("expanded-half", "expanded-full");
        });
      });

      window.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          drawer.classList.remove("resizing");
          document.body.style.cursor = "";
          if (window.innerWidth > 768) {
            localStorage.setItem("ip-drawer-width", drawer.style.width);
          }
        }
      });
    }

    // ─── Expand / Full-Screen Toggle ───
    if (expandBtn && drawer) {
      let expandState = 0; // 0: standard, 1: 55vw, 2: 90vw
      expandBtn.addEventListener("click", () => {
        expandState = (expandState + 1) % 3;
        drawer.classList.remove("expanded-half", "expanded-full");

        if (expandState === 1) {
          drawer.classList.add("expanded-half");
          showToast("Assistant width: 55% Split View", "info");
        } else if (expandState === 2) {
          drawer.classList.add("expanded-full");
          showToast("Assistant width: 90% Full View", "info");
        } else {
          const w = localStorage.getItem("ip-drawer-width") || "500px";
          drawer.style.width = w;
          showToast("Assistant width: Standard", "info");
        }
      });
    }

    // ─── Study Stats & Scoreboard State ───
    function getQuizStats() {
      try {
        return JSON.parse(localStorage.getItem("ip-quiz-stats")) || {
          pts: 0,
          total: 0,
          correct: 0,
          streak: 0,
          topicMastery: {}
        };
      } catch {
        return { pts: 0, total: 0, correct: 0, streak: 0, topicMastery: {} };
      }
    }

    function updateScoreboardUI() {
      const stats = getQuizStats();
      const ptsEl = $("#score-pts");
      const accEl = $("#score-accuracy");
      const streakEl = $("#score-streak");

      if (ptsEl) ptsEl.textContent = stats.pts || 0;
      if (accEl) {
        const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        accEl.textContent = `${acc}%`;
      }
      if (streakEl) streakEl.textContent = stats.streak || 0;
    }
    updateScoreboardUI();

    const resetScoreBtn = $("#score-reset-btn");
    if (resetScoreBtn) {
      resetScoreBtn.addEventListener("click", () => {
        if (confirm("Reset your study score and accuracy stats?")) {
          localStorage.removeItem("ip-quiz-stats");
          updateScoreboardUI();
          showToast("Study statistics reset", "info");
        }
      });
    }

    function updateProviderBadge() {
      if (providerLabel) {
        const provName = aiSettings.provider === "gemini" ? "Gemini" : (aiSettings.provider === "openai" ? "OpenAI" : "Offline Workspace");
        const status = aiSettings.apiKey ? "Configured" : "Ready";
        providerLabel.textContent = `Provider: ${provName} (${status})`;
      }
    }
    updateProviderBadge();

    // Context Updater
    updateAssistantContext = function (filePath) {
      if (contextLabel) {
        const fileName = filePath.split("/").pop();
        contextLabel.textContent = `Active File: ${fileName}`;
        contextLabel.title = filePath;
      }
    };

    // Toggle drawer
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener("click", () => {
        drawer.classList.toggle("hidden");
        if (!drawer.classList.contains("hidden") && input) {
          input.focus();
        }
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener("click", () => {
        drawer.classList.add("hidden");
      });
    }

    // Clear Chat
    if (clearBtn && chatBody) {
      clearBtn.addEventListener("click", () => {
        history = [];
        chatBody.innerHTML = `
          <div class="assistant-welcome-msg">
            <div class="welcome-sparkle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3>Welcome to your AI Interview Coach</h3>
            <p>I can quiz you on your notes, create interactive flashcards, run live code playgrounds, and answer technical interview questions using Gemini or OpenAI.</p>
            <div class="welcome-prompt-suggestions" id="welcome-prompt-suggestions">
              <button class="suggestion-chip" data-prompt="Explain JavaScript Event Loop with microtasks & macrotasks execution order">
                ${svg('refresh', 12)}
                <span>Event Loop & Microtasks</span>
              </button>
              <button class="suggestion-chip" data-prompt="Generate a senior interview quiz on Closures, Lexical Scope, and Memory Leaks">
                ${svg('brain', 12)}
                <span>Closures & Memory Trap</span>
              </button>
              <button class="suggestion-chip" data-prompt="Create an interactive coding challenge to implement Promise.all() from scratch">
                ${svg('zap', 12)}
                <span>Implement Promise.all</span>
              </button>
            </div>
          </div>
        `;
        bindWelcomeSuggestions();
        showToast("Chat history reset", "info");
      });
    }

    // Settings Modal
    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener("click", () => {
        if (providerSelect) providerSelect.value = aiSettings.provider;
        if (apiKeyInput) apiKeyInput.value = aiSettings.apiKey;
        if (modelInput) modelInput.value = aiSettings.model;
        settingsModal.classList.remove("hidden");
      });

      const closeModal = () => settingsModal.classList.add("hidden");
      if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
      if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeModal);

      if (modalSaveBtn) {
        modalSaveBtn.addEventListener("click", () => {
          aiSettings.provider = providerSelect.value;
          aiSettings.apiKey = apiKeyInput.value.trim();
          aiSettings.model = modelInput.value.trim() || (aiSettings.provider === "gemini" ? "gemini-2.5-flash" : "gpt-4o-mini");

          localStorage.setItem("ip-ai-provider", aiSettings.provider);
          localStorage.setItem("ip-ai-key", aiSettings.apiKey);
          localStorage.setItem("ip-ai-model", aiSettings.model);

          updateProviderBadge();
          closeModal();
          showToast("AI Settings saved successfully!", "success");
        });
      }
    }

    // Quick Action Chips
    quickChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const action = chip.dataset.action;
        let promptText = "";
        const file = state.currentFile ? `for ${state.currentFile.split("/").pop()}` : "for JavaScript/TypeScript";

        if (action === "quiz") {
          promptText = `Generate an interactive multiple-choice technical interview quiz ${file}.`;
        } else if (action === "flashcard") {
          promptText = `Generate 3 interactive interview flashcards with key takeaways ${file}.`;
        } else if (action === "playground") {
          promptText = `Generate an interactive code challenge and playground ${file}.`;
        } else if (action === "explain") {
          promptText = `Explain the core concepts, runtime mechanics, and common interview questions ${file}.`;
        }

        if (drawer.classList.contains("hidden")) {
          drawer.classList.remove("hidden");
        }
        sendAssistantMessage(promptText);
      });
    });

    // ─── Auto-Resizing Textarea & Character Count ───
    function autoResizeInput() {
      if (!input) return;
      input.style.height = "auto";
      const newHeight = Math.min(120, Math.max(24, input.scrollHeight));
      input.style.height = `${newHeight}px`;
      if (charCountEl) {
        const len = input.value.length;
        charCountEl.textContent = `${len} char${len === 1 ? "" : "s"}`;
      }
    }

    // ─── Welcome Suggestions Click Binding ───
    function bindWelcomeSuggestions() {
      $$(".suggestion-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prompt = btn.dataset.prompt;
          if (prompt) {
            sendAssistantMessage(prompt);
          }
        });
      });
    }
    bindWelcomeSuggestions();

    // ─── Prompt Refinement Mode Selection ───
    promptRefinePresets.forEach((btn) => {
      btn.addEventListener("click", () => {
        promptRefinePresets.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedRefineMode = btn.dataset.mode || "auto";
        showToast(`Refine mode: ${btn.textContent.trim()}`, "info");

        // If user already has text in input or preview is open, offer immediate re-refine
        if (input && input.value.trim()) {
          triggerPromptRefine();
        }
      });
    });

    // ─── Trigger Prompt Refinement Logic ───
    async function triggerPromptRefine() {
      const rawPrompt = (input ? input.value.trim() : "") || (state.currentFile ? `Analyze and review ${state.currentFile.split("/").pop()}` : "");
      if (!rawPrompt) {
        showToast("Type a prompt or open a workspace file to refine", "warning");
        if (input) input.focus();
        return;
      }

      if (promptRefineBtn) {
        promptRefineBtn.classList.add("loading");
        promptRefineBtn.innerHTML = `
          <div class="spinner" style="width: 12px; height: 12px; border-width: 1.5px;"></div>
          <span>Refining...</span>
        `;
      }

      try {
        const res = await fetch("/api/assistant/refine-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: rawPrompt,
            mode: selectedRefineMode,
            currentFilePath: state.currentFile,
            provider: aiSettings.provider,
            apiKey: aiSettings.apiKey,
            model: aiSettings.model,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Render preview banner
        if (promptRefinePreview) {
          if (refineModeTag) refineModeTag.textContent = `${data.mode || selectedRefineMode} mode`;
          if (refineReason) refineReason.textContent = data.explanation || "Refined for higher technical clarity and interview rigor.";
          if (refineContent) refineContent.textContent = data.refinedPrompt || rawPrompt;
          
          if (refineTags) {
            refineTags.innerHTML = (data.tags || []).map((t) => `<span class="refine-tag-pill">${escapeHtml(t)}</span>`).join("");
          }

          promptRefinePreview.classList.remove("hidden");
        }

        showToast("Prompt successfully refined with AI", "success");
      } catch (err) {
        console.error("Refine prompt error:", err);
        showToast(`Prompt refine failed: ${err.message}`, "error");
      } finally {
        if (promptRefineBtn) {
          promptRefineBtn.classList.remove("loading");
          promptRefineBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>Refine</span>
          `;
        }
      }
    }

    // Prompt Refine Action Buttons
    if (promptRefineBtn) {
      promptRefineBtn.addEventListener("click", () => triggerPromptRefine());
    }

    const closeRefinePreview = () => {
      if (promptRefinePreview) promptRefinePreview.classList.add("hidden");
    };

    if (refineCloseBtn) refineCloseBtn.addEventListener("click", closeRefinePreview);
    if (refineDiscardBtn) refineDiscardBtn.addEventListener("click", closeRefinePreview);

    if (refineCopyBtn) {
      refineCopyBtn.addEventListener("click", () => {
        const text = refineContent ? refineContent.textContent : "";
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            showToast("Refined prompt copied to clipboard!", "success");
          });
        }
      });
    }

    if (refineApplyBtn) {
      refineApplyBtn.addEventListener("click", () => {
        const text = refineContent ? refineContent.textContent : "";
        if (text && input) {
          input.value = text;
          autoResizeInput();
          input.focus();
          closeRefinePreview();
          showToast("Applied to input prompt box!", "info");
        }
      });
    }

    if (refineSendNowBtn) {
      refineSendNowBtn.addEventListener("click", () => {
        const text = refineContent ? refineContent.textContent : "";
        if (text) {
          closeRefinePreview();
          if (input) input.value = "";
          autoResizeInput();
          sendAssistantMessage(text);
        }
      });
    }

    // ─── Handle Form Submit & Input Listeners ───
    if (form && input) {
      input.addEventListener("input", autoResizeInput);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        input.value = "";
        autoResizeInput();
        closeRefinePreview();
        sendAssistantMessage(query);
      });

      input.addEventListener("keydown", (e) => {
        // Submit on Enter (without Shift)
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          form.dispatchEvent(new Event("submit"));
        }
        // Refine on Ctrl+R or Cmd+R
        else if ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R")) {
          e.preventDefault();
          triggerPromptRefine();
        }
      });
    }

    // ─── Format Time Helper ───
    function getMessageTimestamp() {
      const d = new Date();
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    // ─── Send Message & Process A2UI Payload ───
    async function sendAssistantMessage(query) {
      // Remove welcome message if present
      const welcome = chatBody.querySelector(".assistant-welcome-msg");
      if (welcome) welcome.remove();

      lastUserQuery = query;

      // Append user bubble
      appendUserMessage(query);

      // Cancel previous pending request if any
      if (activeAbortController) {
        activeAbortController.abort();
      }
      activeAbortController = new AbortController();

      // ─── Multi-Stage Advanced Loading Card ───
      const loadingEl = document.createElement("div");
      loadingEl.className = "chat-msg assistant";
      loadingEl.innerHTML = `
        <div class="a2ui-loading-card">
          <div class="loading-header">
            <div class="loading-agent-status">
              <div class="ai-pulse-orb">
                <span class="ai-pulse-orb-sparkle">${svg('sparkle', 14)}</span>
              </div>
              <div class="loading-status-text-wrap">
                <span class="loading-phase-title" id="loading-phase-title">Analyzing Workspace Context...</span>
                <span class="loading-phase-detail" id="loading-phase-detail">Inspecting active code AST & interview notes...</span>
              </div>
            </div>
            <div class="loading-meta-controls">
              <span class="loading-timer-badge" id="loading-timer-badge">0.0s</span>
              <button class="loading-cancel-btn" id="loading-cancel-btn" title="Cancel Generation">Cancel</button>
            </div>
          </div>
          <div class="skeleton-container">
            <div class="skeleton-shimmer-bar skeleton-w-100"></div>
            <div class="skeleton-shimmer-bar skeleton-w-85"></div>
            <div class="skeleton-shimmer-bar skeleton-w-70"></div>
            <div class="skeleton-card-preview">
              <div class="skeleton-shimmer-bar skeleton-w-50" style="height: 10px;"></div>
              <div class="skeleton-pill-grid">
                <div class="skeleton-pill"></div>
                <div class="skeleton-pill"></div>
                <div class="skeleton-pill"></div>
                <div class="skeleton-pill"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      chatBody.appendChild(loadingEl);
      chatBody.scrollTop = chatBody.scrollHeight;

      // Dynamic Stages & Timer Controller
      const startTime = performance.now();
      const timerBadge = loadingEl.querySelector("#loading-timer-badge");
      const phaseTitle = loadingEl.querySelector("#loading-phase-title");
      const phaseDetail = loadingEl.querySelector("#loading-phase-detail");
      const cancelBtn = loadingEl.querySelector("#loading-cancel-btn");

      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          if (activeAbortController) {
            activeAbortController.abort();
            showToast("Assistant generation cancelled", "info");
          }
        });
      }

      const timerInterval = setInterval(() => {
        const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(1);
        if (timerBadge) timerBadge.textContent = `${elapsedSec}s`;

        const sec = parseFloat(elapsedSec);
        if (phaseTitle && phaseDetail) {
          if (sec < 1.2) {
            phaseTitle.textContent = "Analyzing Context...";
            phaseDetail.textContent = "Scanning active code, symbols & interview context...";
          } else if (sec < 2.8) {
            phaseTitle.textContent = "Reasoning Architecture...";
            phaseDetail.textContent = "Evaluating ECMAScript runtime mechanics & interview traps...";
          } else if (sec < 4.5) {
            phaseTitle.textContent = "Synthesizing Interactive Content...";
            phaseDetail.textContent = "Generating interactive quiz, flashcards & sandbox...";
          } else {
            phaseTitle.textContent = "Polishing Response Layout...";
            phaseDetail.textContent = "Applying syntax highlights and reactive components...";
          }
        }
      }, 100);

      try {
        const response = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: activeAbortController.signal,
          body: JSON.stringify({
            query,
            currentFilePath: state.currentFile,
            conversationHistory: history,
            provider: aiSettings.provider,
            apiKey: aiSettings.apiKey,
            model: aiSettings.model,
          }),
        });

        clearInterval(timerInterval);
        loadingEl.remove();

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const payload = await response.json();
        renderA2UIResponse(payload, query);

        // Update history
        history.push({ role: "user", content: query });
        history.push({ role: "assistant", content: JSON.stringify(payload) });
      } catch (err) {
        clearInterval(timerInterval);
        loadingEl.remove();

        if (err.name === "AbortError") {
          const cancelEl = document.createElement("div");
          cancelEl.className = "chat-msg assistant";
          cancelEl.innerHTML = `
            <div class="chat-bubble-assistant">
              <div class="a2ui-text-card" style="border-style:dashed; color:var(--text-muted);">
                <span style="display:inline-flex; align-items:center; gap:4px;">${svg('zap', 13)} <em>Response generation cancelled by user.</em></span>
              </div>
            </div>
          `;
          chatBody.appendChild(cancelEl);
          chatBody.scrollTop = chatBody.scrollHeight;
          return;
        }

        const errEl = document.createElement("div");
        errEl.className = "chat-msg assistant";
        errEl.innerHTML = `
          <div class="chat-bubble-assistant">
            <div class="a2ui-text-card" style="border-color: #e74c3c; color: #e74c3c;">
              <strong>Error:</strong> Failed to fetch assistant response (${err.message}).
            </div>
          </div>
        `;
        chatBody.appendChild(errEl);
        chatBody.scrollTop = chatBody.scrollHeight;
      } finally {
        activeAbortController = null;
      }
    }

    function appendUserMessage(text) {
      const msg = document.createElement("div");
      msg.className = "chat-msg user";
      const time = getMessageTimestamp();
      msg.innerHTML = `
        <div class="chat-msg-meta">
          <span class="chat-msg-author">You</span>
          <span>${time}</span>
        </div>
        <div class="chat-bubble-user">${escapeHtml(text)}</div>
      `;
      chatBody.appendChild(msg);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // ─── A2UI Declarative Component Renderer ───
    function renderA2UIResponse(payload, originalQuery) {
      const assistantMsg = document.createElement("div");
      assistantMsg.className = "chat-msg assistant";
      const time = getMessageTimestamp();

      const meta = document.createElement("div");
      meta.className = "chat-msg-meta";
      meta.innerHTML = `
        <span class="chat-msg-author" style="color:var(--accent-primary);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          AI Coach
        </span>
        <div class="chat-msg-actions">
          <span>${time}</span>
          <button class="msg-action-btn copy-msg-btn" title="Copy Response Text">${svg('copy', 12)} <span>Copy</span></button>
          <button class="msg-action-btn retry-msg-btn" title="Regenerate Response">${svg('refresh', 12)} <span>Retry</span></button>
        </div>
      `;
      assistantMsg.appendChild(meta);

      const bubble = document.createElement("div");
      bubble.className = "chat-bubble-assistant";

      const components = payload.components || [
        { type: "text", content: typeof payload === "string" ? payload : JSON.stringify(payload) },
      ];

      components.forEach((comp) => {
        if (comp.type === "text") {
          bubble.appendChild(createA2UIText(comp));
        } else if (comp.type === "quiz") {
          bubble.appendChild(createA2UIQuiz(comp));
        } else if (comp.type === "flashcard") {
          bubble.appendChild(createA2UIFlashcard(comp));
        } else if (comp.type === "playground") {
          bubble.appendChild(createA2UIPlayground(comp));
        } else if (comp.type === "progress") {
          bubble.appendChild(createA2UIProgress(comp));
        }
      });

      assistantMsg.appendChild(bubble);
      chatBody.appendChild(assistantMsg);

      // Copy Entire Message Content Action
      const copyBtn = assistantMsg.querySelector(".copy-msg-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          const textToCopy = components.map((c) => c.content || c.question || c.title || "").filter(Boolean).join("\n\n");
          navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.innerHTML = `${svg('check', 12)} <span>Copied!</span>`;
            setTimeout(() => (copyBtn.innerHTML = `${svg('copy', 12)} <span>Copy</span>`), 2000);
            showToast("Assistant response copied!", "success");
          });
        });
      }

      // Retry / Regenerate Action
      const retryBtn = assistantMsg.querySelector(".retry-msg-btn");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          const queryToRetry = originalQuery || lastUserQuery;
          if (queryToRetry) {
            sendAssistantMessage(queryToRetry);
          }
        });
      }

      // Highlight code blocks
      if (window.Prism) {
        Prism.highlightAllUnder(assistantMsg);
      }

      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Component: Text
    function createA2UIText(comp) {
      const card = document.createElement("div");
      card.className = "a2ui-text-card";
      if (window.marked) {
        card.innerHTML = marked.parse(comp.content || "");
      } else {
        card.textContent = comp.content || "";
      }

      // Enhance code blocks with copy buttons
      card.querySelectorAll("pre").forEach((pre) => {
        const copyBtn = document.createElement("button");
        copyBtn.className = "quick-chip";
        copyBtn.style.cssText = "position:absolute; right:8px; top:8px; font-size:10.5px; padding:2px 8px; opacity:0.8;";
        copyBtn.innerHTML = `${svg('copy', 11)} <span>Copy</span>`;
        pre.style.position = "relative";

        copyBtn.addEventListener("click", () => {
          const code = pre.querySelector("code")?.textContent || pre.textContent;
          navigator.clipboard.writeText(code).then(() => {
            copyBtn.innerHTML = `${svg('check', 11)} <span>Copied!</span>`;
            setTimeout(() => (copyBtn.innerHTML = `${svg('copy', 11)} <span>Copy</span>`), 2000);
            showToast("Code copied to clipboard!", "info");
          });
        });

        pre.appendChild(copyBtn);
      });

      return card;
    }

    // Component: Quiz
    function createA2UIQuiz(comp) {
      const card = document.createElement("div");
      card.className = "a2ui-quiz-card";

      const header = document.createElement("div");
      header.className = "a2ui-quiz-header";
      header.innerHTML = `
        <span class="a2ui-quiz-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          ${escapeHtml(comp.title || "Interview Quiz")}
        </span>
      `;
      card.appendChild(header);

      const q = document.createElement("div");
      q.className = "a2ui-quiz-question";
      q.textContent = comp.question || "";
      card.appendChild(q);

      if (comp.code) {
        const codeEl = document.createElement("pre");
        codeEl.className = "a2ui-quiz-code";
        codeEl.innerHTML = `<code class="language-javascript">${escapeHtml(comp.code)}</code>`;
        card.appendChild(codeEl);
      }

      const optionsContainer = document.createElement("div");
      optionsContainer.className = "a2ui-quiz-options";

      (comp.options || []).forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "a2ui-option-btn";
        btn.innerHTML = `
          <span class="a2ui-option-id">${opt.id}.</span>
          <span class="a2ui-option-text">${escapeHtml(opt.text)}</span>
        `;

        btn.addEventListener("click", () => {
          // Disable all buttons in this quiz
          optionsContainer.querySelectorAll(".a2ui-option-btn").forEach((b) => (b.disabled = true));

          const isCorrect = opt.id === comp.correctOptionId;

          // 1. Update stats & scoreboard
          const stats = getQuizStats();
          stats.total += 1;
          if (isCorrect) {
            stats.correct += 1;
            stats.pts += 10;
            stats.streak += 1;
          } else {
            stats.streak = 0;
          }

          const topicKey = comp.title || (state.currentFile ? state.currentFile.split("/").pop() : "JavaScript");
          if (!stats.topicMastery[topicKey]) {
            stats.topicMastery[topicKey] = { correct: 0, total: 0 };
          }
          stats.topicMastery[topicKey].total += 1;
          if (isCorrect) stats.topicMastery[topicKey].correct += 1;

          localStorage.setItem("ip-quiz-stats", JSON.stringify(stats));
          updateScoreboardUI();

          // 2. Button feedback
          if (isCorrect) {
            btn.classList.add("selected-correct");
            showToast("Correct Answer! +10 Points earned", "success");
          } else {
            btn.classList.add("selected-wrong");
            // Highlight the correct one
            optionsContainer.querySelectorAll(".a2ui-option-btn").forEach((b) => {
              if (b.querySelector(".a2ui-option-id").textContent.startsWith(comp.correctOptionId)) {
                b.classList.add("selected-correct");
              }
            });
            showToast("Incorrect answer. Review the explanation!", "error");
          }

          // 3. Explanation
          if (comp.explanation) {
            const exp = document.createElement("div");
            exp.className = "a2ui-quiz-explanation";
            exp.innerHTML = `<span style="display:inline-flex; align-items:center; gap:4px; font-weight:700; color:var(--accent-primary);"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> Explanation:</span> ${escapeHtml(comp.explanation)}`;
            card.appendChild(exp);
          }

          // 4. INSTANT Quiz Progress Banner
          const topicStats = stats.topicMastery[topicKey];
          const topicPct = Math.round((topicStats.correct / topicStats.total) * 100);
          const overallAcc = Math.round((stats.correct / stats.total) * 100);

          const progressBanner = document.createElement("div");
          progressBanner.className = "a2ui-quiz-progress-banner";
          progressBanner.innerHTML = `
            <div class="a2ui-qpb-header">
              <span class="a2ui-qpb-tag ${isCorrect ? 'correct' : 'wrong'}">
                ${isCorrect ? `<span style="display:inline-flex; align-items:center; gap:3px;">${svg('check', 12)} +10 Points Earned</span>` : `<span style="display:inline-flex; align-items:center; gap:3px;">${svg('x', 12)} Review Recommended</span>`}
              </span>
              <span style="font-size:11px; font-weight:700; color:var(--accent-primary);">
                ${topicPct}% Topic Mastery
              </span>
            </div>
            <div class="a2ui-qpb-bar-bg">
              <div class="a2ui-qpb-bar-fill" style="width: ${topicPct}%;"></div>
            </div>
            <div class="a2ui-qpb-stats">
              <span style="display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Acc: ${overallAcc}%</span>
              <span style="display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Streak: ${stats.streak}</span>
              <span style="display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg> Score: ${stats.pts} Pts</span>
            </div>
            <div class="a2ui-qpb-actions">
              <button class="a2ui-btn-next-quiz">
                <span>Next Question</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          `;

          progressBanner.querySelector(".a2ui-btn-next-quiz").addEventListener("click", () => {
            sendAssistantMessage(`Generate another technical interview quiz question for ${topicKey}.`);
          });

          card.appendChild(progressBanner);
          chatBody.scrollTop = chatBody.scrollHeight;
        });

        optionsContainer.appendChild(btn);
      });

      card.appendChild(optionsContainer);
      return card;
    }

    // Component: Flashcard
    function createA2UIFlashcard(comp) {
      const wrapper = document.createElement("div");
      wrapper.className = "a2ui-text-card";
      wrapper.style.padding = "12px";

      const cards = comp.cards || [];
      const topicKey = comp.topic || (state.currentFile ? state.currentFile.split("/").pop() : "JavaScript");
      let currentIndex = 0;

      const title = document.createElement("div");
      title.style.cssText = "display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;";
      title.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:var(--accent-primary);">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          Flashcards: ${escapeHtml(topicKey)}
        </span>
        <span class="a2ui-fc-counter" id="fc-counter-badge">${cards.length > 0 ? `1 / ${cards.length}` : '0 / 0'}</span>
      `;
      wrapper.appendChild(title);

      const container = document.createElement("div");
      container.className = "a2ui-flashcard-container";

      function renderCard(idx) {
        const item = cards[idx] || { front: "No flashcards available.", back: "Ask assistant to generate flashcards for this topic.", keyTakeaway: "" };
        container.innerHTML = `
          <div class="a2ui-flashcard-inner" id="fc-inner">
            <div class="a2ui-card-front">
              <div style="font-weight:600; font-size:14px; line-height:1.45; margin-bottom:8px; text-align:center;">${escapeHtml(item.front)}</div>
              <span class="a2ui-card-hint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                Click to flip card
              </span>
            </div>
            <div class="a2ui-card-back">
              <div style="font-size:13px; line-height:1.55; text-align:center; width:100%;">${escapeHtml(item.back)}</div>
              ${item.keyTakeaway ? `
                <div class="a2ui-card-takeaway">
                  <span style="display:inline-flex; align-items:center; gap:4px; font-weight:700;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    Pro-Tip:
                  </span>
                  <span>${escapeHtml(item.keyTakeaway)}</span>
                </div>
              ` : ""}
              <span class="a2ui-card-hint" style="margin-top:8px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                Click to flip back
              </span>
            </div>
          </div>
        `;

        const inner = container.querySelector("#fc-inner");
        if (inner) {
          inner.addEventListener("click", () => inner.classList.toggle("is-flipped"));
        }
      }

      renderCard(0);
      wrapper.appendChild(container);

      // Controls Bar & Finish Banner Container
      const controls = document.createElement("div");
      controls.className = "a2ui-fc-controls";

      const prevBtn = document.createElement("button");
      prevBtn.className = "quick-chip";
      prevBtn.innerHTML = `${svg('arrow-left', 12)} <span>Prev</span>`;

      const counterBadge = title.querySelector("#fc-counter-badge");

      const nextBtn = document.createElement("button");
      nextBtn.className = "quick-chip";
      nextBtn.innerHTML = cards.length <= 1 ? `${svg('zap', 12)} <span>Next Flashcards</span>` : `<span>Next</span> ${svg('arrow-right', 12)}`;
      if (cards.length <= 1) nextBtn.classList.add("a2ui-fc-btn-next-set");

      const finishBanner = document.createElement("div");
      finishBanner.className = "a2ui-fc-finish-banner";
      finishBanner.innerHTML = `
        <div class="a2ui-fc-finish-header">
          <span class="a2ui-fc-finish-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            Deck Finished! Ready for next step?
          </span>
        </div>
        <div class="a2ui-fc-finish-actions">
          <button class="quick-chip a2ui-fc-btn-next-set" id="fc-action-next-set">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            <span>Next 3 Flashcards</span>
          </button>
          <button class="quick-chip" id="fc-action-quiz">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <span>Test with Quiz</span>
          </button>
          <button class="quick-chip" id="fc-action-restart" title="Review this deck from card 1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>Restart</span>
          </button>
        </div>
      `;

      function updateControlsState() {
        if (counterBadge) {
          counterBadge.textContent = `${currentIndex + 1} / ${cards.length}`;
        }

        prevBtn.disabled = currentIndex === 0;
        prevBtn.style.opacity = currentIndex === 0 ? "0.5" : "1";
        prevBtn.style.cursor = currentIndex === 0 ? "not-allowed" : "pointer";

        const isLastCard = currentIndex >= cards.length - 1;
        if (isLastCard) {
          nextBtn.innerHTML = `${svg('zap', 12)} <span>Next Set</span>`;
          nextBtn.classList.add("a2ui-fc-btn-next-set");
          if (!wrapper.contains(finishBanner)) {
            wrapper.appendChild(finishBanner);
          }
        } else {
          nextBtn.innerHTML = `<span>Next</span> ${svg('arrow-right', 12)}`;
          nextBtn.classList.remove("a2ui-fc-btn-next-set");
          if (wrapper.contains(finishBanner)) {
            finishBanner.remove();
          }
        }
      }

      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          renderCard(currentIndex);
          updateControlsState();
        }
      });

      nextBtn.addEventListener("click", () => {
        if (currentIndex < cards.length - 1) {
          currentIndex++;
          renderCard(currentIndex);
          updateControlsState();
        } else {
          // On last card, clicking Next Set triggers next flashcard request
          sendAssistantMessage(`Generate another set of 3 advanced technical interview flashcards for ${topicKey}.`);
        }
      });

      // Finish Banner Actions
      finishBanner.querySelector("#fc-action-next-set").addEventListener("click", () => {
        sendAssistantMessage(`Generate another set of 3 advanced technical interview flashcards for ${topicKey}.`);
      });

      finishBanner.querySelector("#fc-action-quiz").addEventListener("click", () => {
        sendAssistantMessage(`Generate an interactive technical interview quiz for ${topicKey}.`);
      });

      finishBanner.querySelector("#fc-action-restart").addEventListener("click", () => {
        currentIndex = 0;
        renderCard(0);
        updateControlsState();
        showToast("Flashcard deck restarted", "info");
      });

      controls.appendChild(prevBtn);
      controls.appendChild(nextBtn);
      wrapper.appendChild(controls);

      updateControlsState();

      return wrapper;
    }

    // Component: Code Playground
    function createA2UIPlayground(comp) {
      const card = document.createElement("div");
      card.className = "a2ui-playground-card";

      card.innerHTML = `
        <div class="a2ui-pg-header">
          <span class="a2ui-pg-title" style="display:inline-flex; align-items:center; gap:5px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span>${escapeHtml(comp.title || "Code Challenge")}</span>
          </span>
          <span class="a2ui-quiz-badge">${comp.language || "javascript"}</span>
        </div>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">${escapeHtml(comp.instructions || "")}</p>
        <textarea class="a2ui-pg-editor">${escapeHtml(comp.starterCode || "")}</textarea>
        <div class="a2ui-pg-actions">
          <button class="a2ui-btn-run">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>Run Code</span>
          </button>
        </div>
        <div class="a2ui-pg-output">Ready to execute...</div>
      `;

      const editor = card.querySelector(".a2ui-pg-editor");
      const runBtn = card.querySelector(".a2ui-btn-run");
      const output = card.querySelector(".a2ui-pg-output");

      runBtn.addEventListener("click", () => {
        output.textContent = "Executing...\n";
        const logs = [];

        // Sandboxed logger
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
        };

        try {
          // Execute in isolated function context
          const fn = new Function(editor.value);
          fn();
          output.textContent = logs.length ? logs.join("\n") : "Code executed successfully with 0 logs.";
          output.style.color = "#a6e22e";
          showToast("Code executed successfully!", "success");
        } catch (err) {
          output.textContent = `Error: ${err.message}`;
          output.style.color = "#f92672";
        } finally {
          console.log = originalLog;
        }
      });

      return card;
    }

    // Component: Progress
    function createA2UIProgress(comp) {
      const card = document.createElement("div");
      card.className = "a2ui-progress-card";

      const score = Math.min(100, Math.max(0, comp.readinessScore || 70));
      card.innerHTML = `
        <div class="a2ui-progress-header">
          <span style="display:inline-flex; align-items:center; gap:5px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>Readiness: ${escapeHtml(comp.topic || "JavaScript")}</span>
          </span>
          <span style="color:var(--accent-primary);">${score}%</span>
        </div>
        <div class="a2ui-progress-bar-bg">
          <div class="a2ui-progress-bar-fill" style="width: ${score}%;"></div>
        </div>
        <div style="font-size:11.5px; color:var(--text-secondary);">
          <strong>Level:</strong> ${escapeHtml(comp.masteryLevel || "Intermediate")}
          ${(comp.recommendations || []).length ? `<br><strong>Key Next Steps:</strong> ${escapeHtml(comp.recommendations.join(", "))}` : ""}
        </div>
      `;
      return card;
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ─── Start ───
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

