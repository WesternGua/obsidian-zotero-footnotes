/**
 * PreferencesModal.ts – Document preferences modal
 * Improvement 2: Searchable style selector with dynamic Zotero styles
 */
import { Modal, App, Notice } from "obsidian";
import { appT, getAppSettings, t } from "../i18n";
import { ZoteroAPI, ZoteroItem, ZoteroConnectionError, InstalledStyle } from "../ZoteroAPI";
import { CitationManager } from "../CitationManager";
import { CSL_STYLES, DEFAULT_SETTINGS, getStyleName, getModeLabel } from "../settings";

export interface PreferencesModalOpts {
  api: ZoteroAPI;
  currentStyle: string;
  currentMode: string;
  onStyleChange: (style: string) => Promise<void>;
  onModeChange: (mode: string) => Promise<void>;
  refreshEditorExtension?: () => void;
  getEditor: () => any;
  getItemFromCache: (key: string) => ZoteroItem | undefined;
  fetchAndCacheItem: (key: string) => Promise<ZoteroItem | null>;
}

export class PreferencesModal extends Modal {
  private opts: PreferencesModalOpts;
  private selectedStyle: string;
  private selectedMode: string;
  private citationsFoundEl!: HTMLElement;
  private styleListEl!: HTMLElement;
  private styleSearchInput!: HTMLInputElement;
  private allStyles: { id: string; title: string }[] = [];

  constructor(app: App, opts: PreferencesModalOpts) {
    super(app);
    this.opts = opts;
    this.selectedStyle = opts.currentStyle;
    this.selectedMode = opts.currentMode;
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zotero-prefs-modal");
    contentEl.createEl("h2", { text: appT(this.app, "prefs.title") });

    // ── Style selector with search (Improvement 2) ──
    const styleWrap = contentEl.createDiv();
    styleWrap.style.marginBottom = "16px";

    const labelRow = styleWrap.createDiv();
    labelRow.style.display = "flex";
    labelRow.style.justifyContent = "space-between";
    labelRow.style.alignItems = "center";
    labelRow.style.marginBottom = "6px";

    labelRow.createEl("label", { text: appT(this.app, "prefs.styleLabel") });

    const refreshBtn = labelRow.createEl("button", {
      text: appT(this.app, "prefs.refreshStyles"),
      cls: "clickable-icon",
    });
    refreshBtn.style.fontSize = "0.85em";
    refreshBtn.addEventListener("click", () => this.loadStyles(true));

    // Search input for styles
    this.styleSearchInput = styleWrap.createEl("input", {
      type: "text",
      placeholder: appT(this.app, "prefs.searchStylePlaceholder"),
    });
    this.styleSearchInput.style.width = "100%";
    this.styleSearchInput.style.marginBottom = "6px";
    this.styleSearchInput.style.padding = "4px 8px";
    this.styleSearchInput.addEventListener("input", () => this.filterStyles());

    // Style list container
    this.styleListEl = styleWrap.createDiv({ cls: "zotero-style-list" });
    this.styleListEl.style.maxHeight = "200px";
    this.styleListEl.style.overflowY = "auto";
    this.styleListEl.style.border = "1px solid var(--background-modifier-border)";
    this.styleListEl.style.borderRadius = "4px";
    this.styleListEl.style.padding = "4px";

    // Load styles (dynamic from Zotero + fallback)
    await this.loadStyles(false);

    // ── Mode selector ──
    const modeWrap = contentEl.createDiv();
    modeWrap.style.marginBottom = "16px";
    modeWrap.createEl("label", { text: appT(this.app, "prefs.modeLabel") }).style.display = "block";
    const modeSelect = modeWrap.createEl("select");
    modeSelect.style.width = "100%";
    modeSelect.style.marginTop = "6px";
    modeSelect.createEl("option", { text: getModeLabel("endnote", getAppSettings(this.app) || DEFAULT_SETTINGS, "option"), value: "endnote" });
    modeSelect.createEl("option", { text: getModeLabel("inline", getAppSettings(this.app) || DEFAULT_SETTINGS, "option"), value: "inline" });
    modeSelect.value = this.selectedMode;
    modeSelect.addEventListener("change", () => {
      this.selectedMode = modeSelect.value;
      this.updateCitationCount();
    });

    // ── Citation count info ──
    const infoWrap = contentEl.createDiv({ cls: "zotero-prefs-info" });
    infoWrap.style.background = "var(--background-secondary)";
    infoWrap.style.padding = "10px";
    infoWrap.style.borderRadius = "4px";
    infoWrap.style.marginBottom = "16px";
    infoWrap.createEl("span", { text: appT(this.app, "prefs.citationCount") });
    this.citationsFoundEl = infoWrap.createEl("span", { text: "–", cls: "zotero-citation-count" });
    this.citationsFoundEl.style.fontWeight = "600";
    this.updateCitationCount();

    // ── Buttons ──
    const btnRow = contentEl.createDiv({ cls: "zotero-btn-row" });
    btnRow.style.display = "flex";
    btnRow.style.gap = "8px";
    btnRow.style.justifyContent = "flex-end";
    const cancelBtn = btnRow.createEl("button", { text: appT(this.app, "common.cancel") });
    cancelBtn.addEventListener("click", () => this.close());
    const applyBtn = btnRow.createEl("button", { text: appT(this.app, "prefs.apply"), cls: "mod-cta" });
    applyBtn.addEventListener("click", () => this.applyToDocument(applyBtn));
  }

  private async loadStyles(showNotice: boolean): Promise<void> {
    // First, populate from hardcoded fallback
    const settings = getAppSettings(this.app) || DEFAULT_SETTINGS;
    const fallbackStyles = CSL_STYLES.map((s) => ({
      id: s.id,
      title: getStyleName(s.id, settings),
    }));

    // Try reading dynamic styles from Zotero
    let dynamicStyles: InstalledStyle[] = [];
    try {
      dynamicStyles = await this.opts.api.getInstalledStyles();
    } catch (e) {
      // ignore
    }

    if (dynamicStyles.length > 0) {
      // Merge: dynamic styles take priority, add any fallback not already present
      const idSet = new Set(dynamicStyles.map((s) => s.id));
      this.allStyles = [
        ...dynamicStyles,
        ...fallbackStyles.filter((s) => !idSet.has(s.id)),
      ];
      if (showNotice) {
        new Notice(appT(this.app, "prefs.stylesRefreshed", { count: dynamicStyles.length }));
      }
    } else {
      this.allStyles = fallbackStyles;
    }

    this.renderStyleList(this.allStyles);
  }

  private filterStyles(): void {
    const query = this.styleSearchInput.value.trim().toLowerCase();
    if (!query) {
      this.renderStyleList(this.allStyles);
      return;
    }
    const filtered = this.allStyles.filter(
      (s) => s.title.toLowerCase().includes(query) || s.id.toLowerCase().includes(query)
    );
    this.renderStyleList(filtered);
  }

  private renderStyleList(styles: { id: string; title: string }[]): void {
    this.styleListEl.empty();
    for (const style of styles) {
      const item = this.styleListEl.createDiv({ cls: "zotero-style-item" });
      item.style.padding = "4px 8px";
      item.style.cursor = "pointer";
      item.style.borderRadius = "3px";
      item.textContent = style.title;

      if (style.id === this.selectedStyle) {
        item.style.background = "var(--background-modifier-active-hover)";
        item.style.fontWeight = "600";
      }

      item.addEventListener("click", () => {
        this.selectedStyle = style.id;
        this.renderStyleList(
          this.styleSearchInput.value.trim()
            ? styles
            : this.allStyles
        );
        this.updateCitationCount();
      });
      item.addEventListener("mouseover", () => {
        if (style.id !== this.selectedStyle) item.style.background = "var(--background-modifier-hover)";
      });
      item.addEventListener("mouseout", () => {
        if (style.id !== this.selectedStyle) item.style.background = "";
      });
    }
  }

  private updateCitationCount(): void {
    const editor = this.opts.getEditor();
    if (!editor) {
      this.citationsFoundEl.setText(appT(this.app, "prefs.noDocument"));
      return;
    }
    const citations = CitationManager.parseDocumentCitations(editor.getValue());
    this.citationsFoundEl.setText(String(citations.length));
  }

  private async applyToDocument(btn: HTMLButtonElement): Promise<void> {
    const editor = this.opts.getEditor();
    if (!editor) {
      new Notice(appT(this.app, "prefs.noEditor"));
      return;
    }
    const citations = CitationManager.parseDocumentCitations(editor.getValue());
    if (!citations.length) {
      await this.opts.onStyleChange(this.selectedStyle);
      new Notice(appT(this.app, "prefs.noCitationsToReformat"));
      this.close();
      return;
    }

    btn.disabled = true;
    btn.setText(appT(this.app, "prefs.fetching"));
    try {
      const uniqueKeys = [...new Set(citations.map((c: any) => c.key))];
      const itemMap = new Map<string, ZoteroItem>();
      for (const key of uniqueKeys) {
        const cached = this.opts.getItemFromCache(key);
        if (cached) { itemMap.set(key, cached); continue; }
        const item = await this.opts.fetchAndCacheItem(key);
        if (item) itemMap.set(key, item);
      }
      const missing = uniqueKeys.filter((k) => !itemMap.has(k));
      if (missing.length) {
        new Notice(appT(this.app, "prefs.missingWarning", { count: missing.length }), 6000);
      }

      btn.setText(appT(this.app, "prefs.updating"));
      await this.opts.onStyleChange(this.selectedStyle);
      await this.opts.onModeChange(this.selectedMode);
      const count = CitationManager.refreshDocument(editor, itemMap, this.selectedStyle, this.selectedMode);
      if (this.opts.refreshEditorExtension) this.opts.refreshEditorExtension();
      const modeName = getModeLabel(this.selectedMode, getAppSettings(this.app) || DEFAULT_SETTINGS, "label");
      new Notice(appT(this.app, "prefs.updated", {
        count,
        style: getStyleName(this.selectedStyle, getAppSettings(this.app) || DEFAULT_SETTINGS),
        mode: modeName,
      }));
      this.close();
    } catch (err) {
      if (err instanceof ZoteroConnectionError) {
        new Notice(appT(this.app, "prefs.zoteroUnavailable"), 6000);
      } else {
        new Notice(appT(this.app, "prefs.updateFailed", { error: String(err) }), 6000);
      }
      btn.disabled = false;
      btn.setText(appT(this.app, "prefs.apply"));
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
