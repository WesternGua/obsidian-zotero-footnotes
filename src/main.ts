/**
 * main.ts – Obsidian plugin entry for Zotero Citations
 * Reconstructed from the existing bundled plugin so the source tree is buildable again.
 */
import * as obsidian from "obsidian";
import { CitationManager, EndnoteDef, InlineCitation } from "./CitationManager";
import { ExportManager } from "./ExportManager";
import { createFootnoteExtension } from "./extensions/FootnoteExtension";
import { appT, t } from "./i18n";
import { ExportModal } from "./modals/ExportModal";
import { PreferencesModal } from "./modals/PreferencesModal";
import { SearchModal } from "./modals/SearchModal";
import { DEFAULT_SETTINGS, ZoteroCitationsSettings, ZoteroSettingTab } from "./settings";
import {
  CaywResult,
  formatLocator,
  ZoteroAPI,
  ZoteroConnectionError,
  ZoteroItem,
  ZoteroPickerError,
} from "./ZoteroAPI";

type EditorLike = any;

type SelectionSnapshot = {
  from: any;
  to: any;
};

const ZOTERO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="10" y="10" width="80" height="80" rx="10" fill="currentColor" opacity="0.12"/>
  <text x="50" y="70" font-size="58" text-anchor="middle" font-family="serif" fill="currentColor" font-weight="bold">Z</text>
</svg>`;

const ZOTERO_CITE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 8h5v5H7z"/>
  <path d="M12 8h5v5h-5z"/>
  <path d="M9.5 13v3a2 2 0 0 1-2 2H6"/>
  <path d="M16.5 13v3a2 2 0 0 1-2 2H13"/>
</svg>`;

const ZOTERO_WORD_DISPLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 18h8"/>
  <path d="M9 18V7.5l-2 1.7"/>
  <path d="M15.5 9.5l1.7-3.5"/>
  <path d="M19 9.5l-1.7-3.5"/>
  <path d="M16 7h2.5"/>
</svg>`;

const ZOTERO_STYLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 18h6"/>
  <path d="M4 12h10"/>
  <path d="M4 6h14"/>
  <path d="m16 17 2-10 2 10"/>
  <path d="M15.2 13h5.6"/>
</svg>`;

const ZOTERO_EXPORT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
  <path d="M14 3v5h5"/>
  <path d="M12 11v6"/>
  <path d="m9.5 14.5 2.5 2.5 2.5-2.5"/>
</svg>`;

const ZOTERO_REFRESH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 6v5h-5"/>
  <path d="M4 18v-5h5"/>
  <path d="M18.2 10A7 7 0 0 0 6 7.2L4 9"/>
  <path d="M5.8 14A7 7 0 0 0 18 16.8l2-1.8"/>
</svg>`;

const ZOTERO_UNLINK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 14 5 19"/>
  <path d="m14 10 5-5"/>
  <path d="m8.5 8.5 7 7"/>
  <path d="M7 14H5a3 3 0 0 1 0-6h3"/>
  <path d="M16 10h3a3 3 0 0 1 0 6h-3"/>
</svg>`;

export default class ZoteroCitations extends obsidian.Plugin {
  api!: ZoteroAPI;
  settings!: ZoteroCitationsSettings;
  itemCache: Map<string, ZoteroItem> = new Map();

  // Reference to the registered editor extension so we can refresh it
  editorExtension: any = null;
  ribbonIconEl: HTMLElement | null = null;
  titlebarActions: WeakMap<any, HTMLElement[]> = new WeakMap();
  styleEl: HTMLStyleElement | null = null;
  focusBurstTimer: number | null = null;
  focusBurstStopTimer: number | null = null;
  focusBurstTopmostResetTimer: number | null = null;

  async onload() {
    await this.loadSettings();
    this.api = new ZoteroAPI(this.settings.zoteroPort);

    obsidian.addIcon("zotero-z", ZOTERO_ICON);
    obsidian.addIcon("zotero-cite", ZOTERO_CITE_ICON);
    obsidian.addIcon("zotero-word-display", ZOTERO_WORD_DISPLAY_ICON);
    obsidian.addIcon("zotero-style", ZOTERO_STYLE_ICON);
    obsidian.addIcon("zotero-export", ZOTERO_EXPORT_ICON);
    obsidian.addIcon("zotero-refresh", ZOTERO_REFRESH_ICON);
    obsidian.addIcon("zotero-unlink", ZOTERO_UNLINK_ICON);

    this.ribbonIconEl = this.addRibbonIcon("zotero-z", this.t("ribbon.preferences"), () => this.openPreferences());

    this.editorExtension = createFootnoteExtension({
      isEnabled: () => this.settings.showWordStyleFootnotes,
      app: this.app,
      getSourcePath: () => this.app.workspace.getActiveFile()?.path ?? "",
    });
    this.registerEditorExtension(this.editorExtension);
    this.registerMarkdownPostProcessor((el) => this.decorateRenderedFootnotes(el));

    const commandLabels = this.getCommandLabels();
    this.addCommand({
      id: "insert-edit-citation",
      name: commandLabels["insert-edit-citation"],
      editorCallback: (editor) => this.insertOrEditCitation(editor),
    });
    this.addCommand({
      id: "toggle-word-display",
      name: commandLabels["toggle-word-display"],
      callback: () => this.toggleWordDisplay(),
    });
    this.addCommand({
      id: "toggle-toolbar",
      name: commandLabels["toggle-toolbar"],
      callback: () => this.toggleToolbar(),
    });
    this.addCommand({
      id: "insert-bibliography",
      name: commandLabels["insert-bibliography"],
      editorCallback: async (editor) => this.insertBibliography(editor),
    });
    this.addCommand({
      id: "refresh-citations",
      name: commandLabels["refresh-citations"],
      editorCallback: async (editor) => this.refreshAll(editor),
    });
    this.addCommand({
      id: "export-to-word",
      name: commandLabels["export-to-word"],
      callback: () => this.exportToWord(),
    });
    this.addCommand({
      id: "unlink-citations",
      name: commandLabels["unlink-citations"],
      editorCallback: (editor) => this.unlinkCitations(editor),
    });
    this.addCommand({
      id: "document-preferences",
      name: commandLabels["document-preferences"],
      callback: () => this.openPreferences(),
    });
    this.addCommand({
      id: "check-pandoc",
      name: commandLabels["check-pandoc"],
      callback: () => ExportManager.verifyAndNotify(this.settings),
    });

    this.addSettingTab(new ZoteroSettingTab(this.app, this));
    this.injectStyles();
    this.applyLanguage();

    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.refreshToolbars()));
    this.registerEvent(this.app.workspace.on("layout-change", () => this.refreshToolbars()));

    window.setTimeout(() => this.refreshToolbars(), 100);
  }

  onunload() {
    if (this.focusBurstTimer) window.clearInterval(this.focusBurstTimer);
    if (this.focusBurstStopTimer) window.clearTimeout(this.focusBurstStopTimer);
    if (this.focusBurstTopmostResetTimer) window.clearTimeout(this.focusBurstTopmostResetTimer);

    this.focusBurstTimer = null;
    this.focusBurstStopTimer = null;
    this.focusBurstTopmostResetTimer = null;

    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof obsidian.MarkdownView) {
        this.clearToolbar(leaf.view);
      }
    });

    this.styleEl?.remove();
    this.styleEl = null;
  }

  // ══ Settings ══════════════════════════════════════════════════════════════
  async loadSettings() {
    const data = (await this.loadData()) as {
      settings?: Partial<ZoteroCitationsSettings>;
      itemCache?: Record<string, ZoteroItem>;
    } | null;

    this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings ?? {});
    this.settings.toolbarButtons = Object.assign({}, DEFAULT_SETTINGS.toolbarButtons, this.settings.toolbarButtons);
    this.itemCache = new Map(Object.entries(data?.itemCache ?? {}));
  }

  async saveSettings() {
    await this.saveData({
      settings: this.settings,
      itemCache: Object.fromEntries(this.itemCache),
    });
  }

  t(key: string, vars?: Record<string, any>) {
    return t(this.settings, key, vars);
  }

  getCommandLabels() {
    const prefix = "Zotero Citations: ";
    return {
      "insert-edit-citation": prefix + this.t("command.insertCitation"),
      "toggle-word-display": prefix + this.t("command.toggleWordDisplay"),
      "toggle-toolbar": prefix + this.t("command.toggleToolbar"),
      "insert-bibliography": prefix + this.t("command.insertBibliography"),
      "refresh-citations": prefix + this.t("command.refreshCitations"),
      "export-to-word": prefix + this.t("command.exportToWord"),
      "unlink-citations": prefix + this.t("command.unlinkCitations"),
      "document-preferences": prefix + this.t("command.documentPreferences"),
      "check-pandoc": prefix + this.t("command.checkPandoc"),
    };
  }

  syncCommandLabels() {
    const labels = this.getCommandLabels();
    const commands = (this.app as any).commands?.commands ?? {};

    for (const [id, name] of Object.entries(labels)) {
      const fullId = `${this.manifest.id}:${id}`;
      if (commands[fullId]) commands[fullId].name = name;
    }
  }

  syncRibbonLabel() {
    if (!this.ribbonIconEl) return;
    const label = this.t("ribbon.preferences");
    this.ribbonIconEl.setAttribute("aria-label", label);
    this.ribbonIconEl.setAttribute("title", label);
    this.ribbonIconEl.setAttribute("data-tooltip", label);
  }

  applyLanguage() {
    this.syncCommandLabels();
    this.syncRibbonLabel();
    this.refreshToolbars();
  }

  /** Force Markdown views to re-render so Word-style footnote settings update everywhere. */
  refreshEditorExtension() {
    (this.app.workspace as any).updateOptions();
    this.refreshMarkdownPreviews();
    this.refreshToolbars();
  }

  refreshMarkdownPreviews() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof obsidian.MarkdownView) {
        (leaf.view as any).previewMode?.rerender(true);
      }
    });
  }

  // ══ Item cache ════════════════════════════════════════════════════════════
  cacheItem(item: ZoteroItem) {
    this.itemCache.set(item.key, item);
    void this.saveSettings();
  }

  getCached(key: string) {
    return this.itemCache.get(key);
  }

  async fetchAndCache(key: string): Promise<ZoteroItem | null> {
    try {
      const map = await this.api.getItemsByKeys([key]);
      const item = map.get(key) ?? null;
      if (item) {
        item.key = key;
        this.cacheItem(item);
      }
      return item;
    } catch (_e) {
      return null;
    }
  }

  // ══ Commands ══════════════════════════════════════════════════════════════
  getEditor(): EditorLike | null {
    return this.app.workspace.getActiveViewOfType(obsidian.MarkdownView)?.editor ?? null;
  }

  getInputFilePath(): string | null {
    const file = this.app.workspace.getActiveFile();
    if (!file) return null;

    const base = (this.app.vault.adapter as any).getBasePath?.();
    return base ? `${base}/${file.path}` : file.path;
  }

  captureEditorSelection(editor: EditorLike): SelectionSnapshot {
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    return { from, to };
  }

  getEditorForInsertion(fallbackEditor: EditorLike, sourcePath: string | null) {
    const activeView = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
    const activeEditor = activeView?.editor;
    const activePath = this.app.workspace.getActiveFile()?.path;
    if (activeEditor && (!sourcePath || activePath === sourcePath)) return activeEditor;
    return fallbackEditor;
  }

  restoreEditorSelection(editor: EditorLike, snapshot?: SelectionSnapshot | null) {
    if (!snapshot) return;
    try {
      editor.setSelection(snapshot.from, snapshot.to);
    } catch (_e) {
      try {
        editor.setCursor(snapshot.to);
      } catch (_e2) {
        // noop
      }
    }
  }

  refocusObsidianWindow(editor?: EditorLike | null) {
    const focusEditor = () => {
      try {
        editor?.focus?.();
      } catch (_e) {
        // noop
      }
      try {
        editor?.cm?.focus?.();
      } catch (_e) {
        // noop
      }
    };

    const attempt = () => {
      try {
        const remote = require("@electron/remote");
        const win = remote?.getCurrentWindow?.();
        const appName = remote?.app?.getName?.();

        try {
          if (win?.isMinimized?.()) win.restore?.();
        } catch (_e) {
          // noop
        }
        try {
          win?.show?.();
        } catch (_e) {
          // noop
        }
        try {
          win?.focus?.();
        } catch (_e) {
          // noop
        }
        try {
          win?.moveTop?.();
        } catch (_e) {
          // noop
        }
        try {
          remote?.app?.focus?.({ steal: true });
        } catch (_e) {
          try {
            remote?.app?.focus?.();
          } catch (_e2) {
            // noop
          }
        }
        try {
          if (process.platform === "darwin") {
            const { execFile } = require("child_process");
            execFile(
              "osascript",
              ["-e", `tell application "${String(appName || "Obsidian").replace(/"/g, '\\"')}" to activate`],
              () => {
                // noop
              },
            );
          }
        } catch (_e) {
          // noop
        }
      } catch (_e) {
        try {
          const electron = require("electron");
          const win = electron.remote?.getCurrentWindow?.();
          try {
            if (win?.isMinimized?.()) win.restore?.();
          } catch (_e2) {
            // noop
          }
          try {
            win?.focus?.();
          } catch (_e2) {
            // noop
          }
        } catch (_e2) {
          // noop
        }
      }

      try {
        window.focus();
      } catch (_e) {
        // noop
      }
      try {
        (this.app as any).commands.executeCommandById("editor:focus");
      } catch (_e) {
        // noop
      }
      focusEditor();
    };

    if (this.focusBurstTimer) {
      window.clearInterval(this.focusBurstTimer);
      this.focusBurstTimer = null;
    }
    if (this.focusBurstStopTimer) {
      window.clearTimeout(this.focusBurstStopTimer);
      this.focusBurstStopTimer = null;
    }
    if (this.focusBurstTopmostResetTimer) {
      window.clearTimeout(this.focusBurstTopmostResetTimer);
      this.focusBurstTopmostResetTimer = null;
    }

    let win: any = null;
    try {
      const remote = require("@electron/remote");
      win = remote?.getCurrentWindow?.();
      try {
        win?.setAlwaysOnTop?.(true);
      } catch (_e) {
        // noop
      }
    } catch (_e) {
      // noop
    }

    attempt();
    this.focusBurstTimer = window.setInterval(attempt, 40);
    this.focusBurstStopTimer = window.setTimeout(() => {
      if (this.focusBurstTimer) {
        window.clearInterval(this.focusBurstTimer);
        this.focusBurstTimer = null;
      }
      this.focusBurstStopTimer = null;
    }, 1200);
    this.focusBurstTopmostResetTimer = window.setTimeout(() => {
      try {
        win?.setAlwaysOnTop?.(false);
      } catch (_e) {
        // noop
      }
      this.focusBurstTopmostResetTimer = null;
    }, 1400);
  }

  // ── Insert / Edit citation (uses Zotero native CAYW picker) ──────────────
  async insertOrEditCitation(editor: EditorLike) {
    const content = editor.getValue();
    const pos = editor.posToOffset(editor.getCursor());
    const existingInline = CitationManager.isInsideInline(content, pos);
    const existingEndnote = CitationManager.isInsideEndnoteRef(content, pos);
    const sourcePath = this.app.workspace.getActiveFile()?.path || null;
    const selectionSnapshot = this.captureEditorSelection(editor);
    const notice = new obsidian.Notice(this.t("notice.openPicker"), 0);

    let items: CaywResult[];
    try {
      items = await this.api.openCAYW(() => this.refocusObsidianWindow(this.getEditorForInsertion(editor, sourcePath)));
    } catch (err) {
      notice.hide();
      this.refocusObsidianWindow(this.getEditorForInsertion(editor, sourcePath));

      if (err instanceof ZoteroConnectionError) {
        new obsidian.Notice(this.t("notice.connectZoteroFailed"), 6000);
      } else if (err instanceof ZoteroPickerError) {
        new obsidian.Notice(this.t("notice.nativePickerFallback"), 5000);
        this.openSearchFallback(
          editor,
          existingInline?.page,
          existingEndnote?.page,
          existingInline,
          existingEndnote,
        );
      } else {
        new obsidian.Notice(this.t("notice.pickerError", { error: String(err) }), 6000);
      }
      return;
    }

    notice.hide();
    const targetEditor = this.getEditorForInsertion(editor, sourcePath);
    if (!items.length) {
      this.refocusObsidianWindow(targetEditor);
      return;
    }

    for (const ci of items) this.cacheItem(ci.item);
    this.restoreEditorSelection(targetEditor, selectionSnapshot);
    this.applySelectedCitations(targetEditor, items, existingInline, existingEndnote);
    this.refocusObsidianWindow(targetEditor);
  }

  // ── Toggle Word-style display ─────────────────────────────────────────────
  toggleWordDisplay() {
    this.settings.showWordStyleFootnotes = !this.settings.showWordStyleFootnotes;
    void this.saveSettings();
    this.refreshEditorExtension();
    new obsidian.Notice(
      this.settings.showWordStyleFootnotes ? this.t("notice.wordDisplayOn") : this.t("notice.wordDisplayOff"),
    );
  }

  // ── Insert bibliography ───────────────────────────────────────────────────
  async insertBibliography(editor: EditorLike) {
    const content = editor.getValue();
    const all = CitationManager.parseAllCitations(content);
    if (!all.length) {
      new obsidian.Notice(this.t("notice.noManagedCitations"));
      return;
    }

    const keys = [...new Set(all.map((c) => c.key))];
    const itemMap = await this.resolveItems(keys);
    if (!itemMap) return;

    const bib = CitationManager.generateBibliography(
      content,
      itemMap,
      this.settings.cslStyle,
      this.t("bibliography.heading"),
    );
    if (!bib) {
      new obsidian.Notice(this.t("notice.noBibliography"));
      return;
    }

    CitationManager.insertOrReplaceBibliography(editor, bib);
    new obsidian.Notice(this.t("notice.bibliographyUpdated"));
  }

  // ── Refresh all ───────────────────────────────────────────────────────────
  async refreshAll(editor: EditorLike) {
    const removedOrphans = CitationManager.removeUnreferencedEndnotes(editor);
    const content = editor.getValue();
    const all = CitationManager.parseAllCitations(content);

    if (!all.length) {
      const removedBib = CitationManager.removeManagedBibliography(editor);
      if (removedOrphans || removedBib) {
        new obsidian.Notice(
          this.t("notice.cleanedOrphans", {
            count: removedOrphans,
            extra: removedBib ? this.t("notice.cleanedOrphans.extraBib") : "",
          }),
        );
      } else {
        new obsidian.Notice(this.t("notice.noManagedCitations"));
      }
      return;
    }

    const notice = new obsidian.Notice(this.t("notice.refreshing"), 0);
    try {
      const keys = [...new Set(all.map((c) => c.key))];
      const fetched = await this.api.getItemsByKeys(keys);
      for (const [k, v] of fetched) this.cacheItem(v.key ? v : { ...v, key: k });

      const itemMap = new Map<string, ZoteroItem>();
      for (const key of keys) {
        const item = fetched.get(key) ?? this.getCached(key);
        if (item) itemMap.set(key, item);
      }

      notice.hide();
      const style = this.settings.cslStyle;
      let count = 0;
      count += CitationManager.refreshInline(editor, itemMap, style);
      count += CitationManager.refreshEndnotes(editor, itemMap, style);

      const newContent = editor.getValue();
      if (newContent.includes("<!-- zotero-bibliography-start -->")) {
        const existingHeading = CitationManager.extractBibHeading(newContent);
        const bib = CitationManager.generateBibliography(
          newContent,
          itemMap,
          style,
          existingHeading || this.t("bibliography.heading"),
        );
        CitationManager.insertOrReplaceBibliography(editor, bib);
      }

      const extra = removedOrphans ? this.t("notice.refreshed.extraOrphans", { count: removedOrphans }) : "";
      new obsidian.Notice(this.t("notice.refreshed", { count, extra }));
    } catch (err) {
      notice.hide();
      if (err instanceof ZoteroConnectionError) {
        new obsidian.Notice(this.t("notice.zoteroUnavailable"), 5000);
      } else {
        new obsidian.Notice(this.t("notice.refreshFailed", { error: String(err) }), 5000);
      }
    }
  }

  // ── Export to Word ────────────────────────────────────────────────────────
  async exportToWord() {
    const inputPath = this.getInputFilePath();
    if (!inputPath) {
      new obsidian.Notice(this.t("notice.openFileBeforeExport"));
      return;
    }

    const suggested = ExportManager.suggestOutputPath(inputPath, this.settings);
    if (this.settings.useDefaultExportDir) {
      await this.doExport(inputPath, suggested);
    } else {
      const chosen = await ExportManager.showNativeSaveDialog(suggested, this.settings);
      if (chosen === null) return;
      if (chosen) {
        await this.doExport(inputPath, chosen);
      } else {
        new ExportModal(this.app, suggested, async (outputPath) => {
          await this.doExport(inputPath, outputPath);
        }).open();
      }
    }
  }

  async doExport(inputPath: string, outputPath: string) {
    const notice = new obsidian.Notice(this.t("notice.exporting"), 0);
    try {
      await ExportManager.exportToWord(inputPath, outputPath, this.settings);
      notice.hide();
      new obsidian.Notice(this.t("notice.exportSuccess", { path: outputPath }), 8000);
    } catch (err) {
      notice.hide();
      new obsidian.Notice(String(err), 10000);
    }
  }

  // ── Unlink citations ──────────────────────────────────────────────────────
  unlinkCitations(editor: EditorLike) {
    const inlines = CitationManager.parseInlineCitations(editor.getValue()).length;
    const endnotes = CitationManager.parseEndnoteDefs(editor.getValue()).length;
    const total = inlines + endnotes;

    if (!total) {
      new obsidian.Notice(this.t("notice.noManagedCitations"));
      return;
    }

    new ConfirmModal(
      this.app,
      this.t("unlink.title"),
      this.t("unlink.message", { total, inline: inlines, endnote: endnotes }),
      () => {
        const count = CitationManager.unlinkAll(editor);
        new obsidian.Notice(this.t("unlink.done", { count }));
      },
      "zotero-unlink-modal",
    ).open();
  }

  // ── Document preferences ──────────────────────────────────────────────────
  openPreferences() {
    new PreferencesModal(this.app, {
      api: this.api,
      currentStyle: this.settings.cslStyle,
      currentMode: this.settings.citationMode,
      onStyleChange: async (s) => {
        this.settings.cslStyle = s;
        await this.saveSettings();
      },
      onModeChange: async (m) => {
        this.settings.citationMode = m;
        await this.saveSettings();
      },
      refreshEditorExtension: () => this.refreshEditorExtension(),
      getEditor: () => this.getEditor(),
      getItemFromCache: (k) => this.getCached(k),
      fetchAndCacheItem: (k) => this.fetchAndCache(k),
    }).open();
  }

  openSearchFallback(
    editor: EditorLike,
    existingInlinePage?: string,
    existingEndnotePage?: string,
    existingInline: InlineCitation | null = CitationManager.isInsideInline(
      editor.getValue(),
      editor.posToOffset(editor.getCursor()),
    ),
    existingEndnote: EndnoteDef | null = CitationManager.isInsideEndnoteRef(
      editor.getValue(),
      editor.posToOffset(editor.getCursor()),
    ),
  ) {
    const existingPage = existingInlinePage || existingEndnotePage;
    new SearchModal(this.app, {
      api: this.api,
      style: this.settings.cslStyle,
      existingPage: this.toEditableLocator(existingPage),
      onConfirm: (item, page) => {
        this.cacheItem(item);
        this.applySelectedCitations(
          editor,
          [{ item, locator: page || undefined, locatorLabel: "page" }],
          existingInline,
          existingEndnote,
        );
      },
    }).open();
  }

  applySelectedCitations(
    editor: EditorLike,
    items: CaywResult[],
    existingInline: InlineCitation | null = CitationManager.isInsideInline(
      editor.getValue(),
      editor.posToOffset(editor.getCursor()),
    ),
    existingEndnote: EndnoteDef | null = CitationManager.isInsideEndnoteRef(
      editor.getValue(),
      editor.posToOffset(editor.getCursor()),
    ),
  ) {
    const style = this.settings.cslStyle;
    const mode = this.settings.citationMode;

    if (items.length === 1) {
      const ci = items[0];
      const page = formatLocator(ci.locator, ci.locatorLabel) || undefined;

      if (existingInline) {
        CitationManager.replaceInline(editor, existingInline, ci.item, style, page);
        new obsidian.Notice(this.t("notice.citationUpdated"));
        return;
      }
      if (existingEndnote) {
        CitationManager.replaceEndnoteDef(editor, existingEndnote, ci.item, style, page);
        new obsidian.Notice(this.t("notice.citationUpdated"));
        return;
      }
    }

    for (const ci of items) {
      const page = formatLocator(ci.locator, ci.locatorLabel) || undefined;
      if (mode === "inline") {
        CitationManager.insertInline(editor, ci.item, style, page);
      } else {
        CitationManager.insertEndnote(editor, ci.item, style, page);
      }
    }

    new obsidian.Notice(this.t("notice.insertedCitations", { count: items.length }));
  }

  // ── Shared helper ─────────────────────────────────────────────────────────
  async resolveItems(keys: string[]): Promise<Map<string, ZoteroItem> | null> {
    const map = new Map<string, ZoteroItem>();
    const missing: string[] = [];

    for (const k of keys) {
      const c = this.getCached(k);
      if (c) map.set(k, c);
      else missing.push(k);
    }

    if (missing.length) {
      const n = new obsidian.Notice(this.t("notice.fetchingItems", { count: missing.length }), 0);
      try {
        for (const k of missing) {
          const item = await this.fetchAndCache(k);
          if (item) map.set(k, item);
        }
      } catch (err) {
        n.hide();
        if (err instanceof ZoteroConnectionError) {
          new obsidian.Notice(this.t("notice.zoteroUnavailable"), 5000);
        } else {
          new obsidian.Notice(this.t("notice.fetchItemsFailed", { error: String(err) }), 5000);
        }
        return null;
      }
      n.hide();
    }

    return map;
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────
  /** Public so settings tab can call it. */
  refreshToolbars() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof obsidian.MarkdownView) {
        this.syncToolbar(leaf.view as any);
      }
    });
  }

  toggleToolbar() {
    this.settings.showToolbar = !this.settings.showToolbar;
    void this.saveSettings();
    this.refreshToolbars();
    new obsidian.Notice(this.settings.showToolbar ? this.t("notice.toolbarShown") : this.t("notice.toolbarHidden"));
  }

  syncToolbar(view: any) {
    this.clearToolbar(view);
    if (!this.settings.showToolbar) return;

    const btns = this.settings.toolbarButtons || {};
    const actionEls: HTMLElement[] = [];
    const action = (icon: string, title: string, cb: () => void, active = false) => {
      const el = view.addAction(icon, title, (evt: Event) => {
        evt.preventDefault();
        evt.stopPropagation();
        cb();
      }) as HTMLElement;
      el.classList.add("zotero-titlebar-action");
      if (active) el.classList.add("is-active");
      actionEls.push(el);
    };

    if (btns.export !== false) action("zotero-export", this.t("toolbar.export"), () => this.exportToWord());
    if (btns.unlink !== false) action("zotero-unlink", this.t("toolbar.unlink"), () => {
      const ed = view.editor;
      if (ed) this.unlinkCitations(ed);
    });
    if (btns.changeStyle !== false) action("zotero-style", this.t("toolbar.changeStyle"), () => this.openPreferences());
    if (btns.refresh !== false) action("zotero-refresh", this.t("toolbar.refresh"), () => {
      const ed = view.editor;
      if (ed) this.refreshAll(ed);
    });
    if (btns.wordDisplay !== false) {
      action(
        "zotero-word-display",
        this.t("toolbar.wordDisplay"),
        () => this.toggleWordDisplay(),
        this.settings.showWordStyleFootnotes,
      );
    }
    if (btns.insertCitation !== false) action("zotero-cite", this.t("toolbar.insertCitation"), () => {
      const ed = view.editor;
      if (ed) this.insertOrEditCitation(ed);
    });

    this.titlebarActions.set(view, actionEls);
  }

  clearToolbar(view: any) {
    view.contentEl.querySelectorAll(".zotero-toolbar").forEach((el: Element) => el.remove());
    const actionEls = this.titlebarActions.get(view);
    if (!actionEls) return;
    for (const el of actionEls) el.remove();
    this.titlebarActions.delete(view);
  }

  decorateRenderedFootnotes(root: HTMLElement) {
    if (!this.settings.showWordStyleFootnotes) return;
    const refs = root.querySelectorAll("a.footnote-ref, a[data-footnote-ref]");
    refs.forEach((refEl) => {
      const ref = refEl as HTMLAnchorElement;
      const marker = this.getRenderedFootnoteMarker(ref);
      if (marker) ref.textContent = marker;
      ref.classList.add("zotero-rendered-footnote-ref");
      ref.parentElement?.classList.add("zotero-rendered-footnote-sup");
      const tooltip = this.getRenderedFootnoteTooltip(ref, root);
      ref.removeAttribute("title");
      if (!tooltip) return;
      ref.removeAttribute("aria-label");
    });
  }

  getRenderedFootnoteMarker(ref: HTMLAnchorElement) {
    const text = ref.textContent?.trim() ?? "";
    const fromText = text.match(/\d+/)?.[0];
    if (fromText) return fromText;
    const href = ref.getAttribute("href") ?? "";
    return href.match(/\d+/)?.[0] ?? text.replace(/^\[|\]$/g, "");
  }

  getRenderedFootnoteTooltip(ref: HTMLAnchorElement, root: ParentNode) {
    const href = ref.getAttribute("href");
    if (!href?.startsWith("#")) return "";

    const targetId = decodeURIComponent(href.slice(1));
    const noteEl = this.findById(root, targetId) ?? ref.ownerDocument?.getElementById(targetId);
    if (!noteEl) return "";

    const cloned = noteEl.cloneNode(true) as HTMLElement;
    cloned
      .querySelectorAll('a.footnote-backref, a[data-footnote-backref], a[href^="#fnref"]')
      .forEach((el) => el.remove());
    return this.normalizeFootnoteText(cloned.textContent ?? "");
  }

  findById(root: ParentNode, id: string): HTMLElement | null {
    if (!id) return null;
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return root.querySelector(`#${CSS.escape(id)}`) as HTMLElement | null;
    }
    return root.querySelector(`[id="${id.replace(/"/g, '\\"')}"]`) as HTMLElement | null;
  }

  normalizeFootnoteText(text: string) {
    return text.replace(/\s+/g, " ").trim();
  }

  toEditableLocator(locator?: string) {
    if (!locator) return locator;
    return locator.replace(/^(p\.|para\.|sec\.|ch\.|fig\.|table|v\.|l\.|n\.|col\.|no\.|vol\.)\s+/i, "");
  }

  // ── CSS ───────────────────────────────────────────────────────────────────
  injectStyles() {
    this.styleEl?.remove();
    const s = document.createElement("style");
    s.id = "zotero-wi-styles";
    s.textContent = `
      /* Word-style footnote marker */
      .zotero-fn-widget {
        display: inline;
        vertical-align: baseline;
      }
      sup.zotero-fn-num {
        line-height: 0;
      }
      sup.zotero-fn-num > .zotero-footnote-marker {
        color: var(--text-accent) !important;
        display: inline;
        font-size: 0.75em;
        font-weight: 500;
        cursor: pointer;
        font-family: var(--font-text);
        pointer-events: auto;
        text-decoration: none !important;
        box-shadow: none !important;
        border: none !important;
      }
      sup.zotero-fn-num > .zotero-footnote-marker:hover,
      sup.zotero-fn-num > .zotero-footnote-marker:focus-visible {
        color: var(--text-accent-hover, var(--text-accent)) !important;
        text-decoration: none !important;
        outline: none;
      }
      .zotero-fn-widget.zotero-fn-highlighted {
        background: var(--text-highlight-bg) !important;
        color: var(--text-normal) !important;
        box-shadow: none !important;
        border: none !important;
      }
      .zotero-fn-widget.zotero-fn-highlighted > sup.zotero-fn-num,
      .zotero-fn-widget.zotero-fn-highlighted > sup.zotero-fn-num > .zotero-footnote-marker,
      mark .zotero-rendered-footnote-sup,
      mark .zotero-rendered-footnote-ref {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }
      .zotero-rendered-footnote-sup {
        line-height: 0;
      }
      a.zotero-rendered-footnote-ref {
        color: var(--text-accent);
        font-size: 0.75em;
        text-decoration: none;
        box-shadow: none !important;
        border: none !important;
      }
      .zotero-footnote-hover {
        position: fixed;
        z-index: 9999;
        max-width: min(32rem, calc(100vw - 16px));
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--background-primary);
        border: 1px solid var(--background-modifier-border);
        box-shadow: var(--shadow-s);
        color: var(--text-normal);
        font-size: 0.9em;
        line-height: 1.45;
        white-space: normal;
        pointer-events: none;
      }
      .zotero-footnote-popover {
        max-width: min(36rem, calc(100vw - 16px));
        max-height: min(70vh, 42rem);
        overflow: auto;
      }
      .zotero-footnote-popover .markdown-embed {
        border: none;
        padding: 0;
      }
      .zotero-footnote-popover .markdown-embed-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .zotero-footnote-popover .markdown-preview-view {
        min-height: 0;
        padding: 0 12px 2px;
        font-size: 0.95em;
      }
      .zotero-footnote-popover .markdown-preview-view > *:first-child {
        margin-top: 0;
      }
      .zotero-footnote-popover .markdown-preview-view > *:last-child {
        margin-bottom: 0;
      }
      .zotero-footnote-locator-editor {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px 10px;
      }
      .zotero-footnote-locator-editor input {
        flex: 1 1 auto;
        min-width: 0;
        height: 26px;
        padding: 2px 8px;
        font-size: 0.9em;
        border-radius: 6px;
      }
      .zotero-footnote-locator-editor > div {
        display: flex;
        justify-content: flex-end;
      }
      .zotero-footnote-locator-editor button {
        height: 26px;
        padding: 2px 8px;
        font-size: 0.85em;
        border-radius: 6px;
      }
      /* Connection status dots */
      .zotero-status-dot {
        display: inline-block; width: 10px; height: 10px;
        border-radius: 50%; margin-right: 8px; vertical-align: middle;
      }
      .zotero-status-ok  { background: #4caf50; }
      .zotero-status-err { background: #f44336; }
      .zotero-status-unknown { background: #9e9e9e; }
      .zotero-status-row { display: flex; align-items: center; margin: 6px 0; }
      .view-action.zotero-titlebar-action.is-active {
        color: var(--text-accent);
      }
      .view-action.zotero-titlebar-action.is-active svg {
        stroke: currentColor;
      }
      /* Reduce excessive top spacing in plugin modals so title aligns with close button */
      .modal:has(.zotero-prefs-modal),
      .modal:has(.zotero-unlink-modal),
      .modal:has(.zotero-search-modal) {
        padding-top: 12px;
      }
      .zotero-prefs-modal, .zotero-unlink-modal, .zotero-search-modal {
        padding-top: 0 !important;
      }
      .zotero-prefs-modal h2:first-child,
      .zotero-unlink-modal h2:first-child,
      .zotero-search-modal h2:first-child {
        margin-top: 0;
      }
    `;
    document.head.appendChild(s);
    this.styleEl = s;
  }
}

class ConfirmModal extends obsidian.Modal {
  title: string;
  msg: string;
  cb: () => void;
  cls?: string;

  constructor(app: obsidian.App, title: string, msg: string, cb: () => void, cls?: string) {
    super(app);
    this.title = title;
    this.msg = msg;
    this.cb = cb;
    this.cls = cls;
  }

  onOpen() {
    if (this.cls) this.contentEl.addClass(this.cls);
    this.contentEl.createEl("h2", { text: this.title });
    this.contentEl.createEl("p", { text: this.msg });
    const row = this.contentEl.createDiv({ cls: "zotero-btn-row" });
    row.style.cssText = "display:flex;justify-content:flex-end;gap:8px;margin-top:16px";
    row.createEl("button", { text: appT(this.app, "common.cancel") }).addEventListener("click", () => this.close());
    const ok = row.createEl("button", { text: appT(this.app, "common.confirm"), cls: "mod-warning" });
    ok.addEventListener("click", () => {
      this.cb();
      this.close();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
