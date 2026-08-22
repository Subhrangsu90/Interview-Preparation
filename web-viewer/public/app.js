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

  // ═══════════════════════════════════
  // FILE TREE
  // ═══════════════════════════════════
  async function loadTree() {
    try {
      const res = await fetch("/api/tree");
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
    state.theme = theme;
    if (theme === "paper") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("ip-theme", theme);

    $$(".theme-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === theme);
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

  // ─── Start ───
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
