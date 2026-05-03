/**
 * settings.ts – Plugin settings, CSL styles, and the SettingTab
 */
import { Plugin, PluginSettingTab, Setting, App, requestUrl, Notice } from "obsidian";
import { Language, t, getLanguage } from "./i18n";
import { CitationManager, MinimalEditor } from "./CitationManager";

// ── Hardcoded fallback CSL styles ──────────────────────────────────────────
export interface CslStyleEntry {
  id: string;
  zh: string;
  en: string;
}

export const CSL_STYLES: CslStyleEntry[] = [
  { id: "chicago-note-bibliography", zh: "Chicago 17th（注释-书目）", en: "Chicago 17th (Notes-Bibliography)" },
  { id: "chicago-author-date", zh: "Chicago 17th（著者-出版年）", en: "Chicago 17th (Author-Date)" },
  { id: "apa", zh: "APA 第7版", en: "APA 7th Edition" },
  { id: "modern-language-association", zh: "MLA 第9版", en: "MLA 9th Edition" },
  { id: "vancouver", zh: "Vancouver", en: "Vancouver" },
  { id: "gb-t-7714-2015-numeric", zh: "GB/T 7714-2015（顺序编码）", en: "GB/T 7714-2015 (Numeric)" },
  { id: "gb-t-7714-2015-author-date", zh: "GB/T 7714-2015（著者-出版年）", en: "GB/T 7714-2015 (Author-Date)" },
  { id: "oscola", zh: "OSCOLA", en: "OSCOLA" },
  { id: "harvard-cite-them-right", zh: "Harvard", en: "Harvard Cite Them Right" },
  { id: "ieee", zh: "IEEE", en: "IEEE" },
];

// ── Toolbar button config (Improvement 3) ─────────────────────────────────
export interface ToolbarButtons {
  export: boolean;
  unlink: boolean;
  changeStyle: boolean;
  refresh: boolean;
  wordDisplay: boolean;
  insertCitation: boolean;
}

// ── Settings interface ─────────────────────────────────────────────────────
export interface ZoteroCitationsSettings {
  cslStyle: string;
  citationMode: string;
  showWordStyleFootnotes: boolean;
  showToolbar: boolean;
  toolbarButtons: ToolbarButtons;
  pandocPath: string;
  pandocFlags: string;
  useDefaultExportDir: boolean;
  exportOutputDir: string;
  zoteroPort: number;
  language: string;
}

export const DEFAULT_SETTINGS: ZoteroCitationsSettings = {
  cslStyle: "chicago-note-bibliography",
  citationMode: "endnote",
  showWordStyleFootnotes: true,
  showToolbar: true,
  toolbarButtons: {
    export: true,
    unlink: true,
    changeStyle: true,
    refresh: true,
    wordDisplay: true,
    insertCitation: true,
  },
  pandocPath: "pandoc",
  pandocFlags: "",
  useDefaultExportDir: false,
  exportOutputDir: "",
  zoteroPort: 23119,
  language: "zh",
};


interface SettingsLike {
  language?: string;
}

interface ZoteroPluginLike extends Plugin {
  settings: ZoteroCitationsSettings;
  saveSettings: () => Promise<void>;
  applyLanguage: () => void;
  getEditor: () => MinimalEditor | null;
  refreshEditorExtension: () => void;
  refreshToolbars: () => void;
  resolveItems: (keys: string[]) => Promise<Map<string, import("./ZoteroAPI").ZoteroItem> | null>;
  getCommandLabels: () => Record<string, string>;
}

// ── Helpers ────────────────────────────────────────────────────────────────
export function getStyleName(styleId: string, settingsOrLang: SettingsLike | Language): string {
  const lang = typeof settingsOrLang === "string" ? settingsOrLang : getLanguage(settingsOrLang);
  const style = CSL_STYLES.find((s) => s.id === styleId);
  if (!style) return styleId;
  return lang === "en" ? style.en : style.zh;
}

export function getModeLabel(mode: string, settingsOrLang: SettingsLike | Language, variant: string = "option"): string {
  return t(settingsOrLang, `mode.${mode}.${variant}`);
}

export function getItemTypeLabel(itemType: string, settingsOrLang: SettingsLike | Language): string {
  return t(settingsOrLang, `itemType.${itemType}`);
}

// ── Setting Tab ────────────────────────────────────────────────────────────
export class ZoteroSettingTab extends PluginSettingTab {
  plugin: ZoteroPluginLike;
  private statusDot!: HTMLElement;
  private statusText!: HTMLElement;

  constructor(app: App, plugin: ZoteroPluginLike) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Top-level general setting (no heading per Obsidian plugin guidelines)
    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settings.interface"))
      .setDesc(t(this.plugin.settings, "settings.interfaceDesc"))
      .addDropdown((dd) => {
        dd.addOption("zh", t(this.plugin.settings, "lang.zh"));
        dd.addOption("en", t(this.plugin.settings, "lang.en"));
        dd.setValue(getLanguage(this.plugin.settings));
        dd.onChange((v: string) => {
          void (async () => {
            this.plugin.settings.language = v === "en" ? "en" : "zh";
            await this.plugin.saveSettings();
            this.plugin.applyLanguage();
            this.display();
          })();
        });
      });

    // ── Connection status ──
    new Setting(containerEl).setName(t(this.plugin.settings, "settings.connection")).setHeading();
    const row = containerEl.createDiv({ cls: "zotero-status-row" });
    this.statusDot = row.createSpan({ cls: "zotero-status-dot zotero-status-unknown" });
    this.statusText = row.createSpan({ text: t(this.plugin.settings, "settings.checking") });
    const btn = containerEl.createEl("button", {
      text: t(this.plugin.settings, "settings.recheck"),
      cls: "zotero-settings-check-button",
    });
    btn.addEventListener("click", () => { void this.checkConnection(); });
    void this.checkConnection();

    // ── Citation style ──
    new Setting(containerEl).setName(t(this.plugin.settings, "settings.citationStyleSection")).setHeading();
    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settings.defaultStyle"))
      .setDesc(t(this.plugin.settings, "settings.defaultStyleDesc"))
      .addDropdown((dd) => {
        for (const s of CSL_STYLES) dd.addOption(s.id, getStyleName(s.id, this.plugin.settings));
        dd.setValue(this.plugin.settings.cslStyle);
        dd.onChange((v: string) => {
          void (async () => {
            this.plugin.settings.cslStyle = v;
            await this.plugin.saveSettings();
          })();
        });
      });

    // ── Citation mode ──
    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settings.citationMode"))
      .setDesc(t(this.plugin.settings, "settings.citationModeDesc"))
      .addDropdown((dd) => {
        dd.addOption("endnote", getModeLabel("endnote", this.plugin.settings, "option"));
        dd.addOption("inline", getModeLabel("inline", this.plugin.settings, "option"));
        dd.setValue(this.plugin.settings.citationMode);
        dd.onChange((v: string) => {
          void (async () => {
            this.plugin.settings.citationMode = v;
            await this.plugin.saveSettings();
            const editor = this.plugin.getEditor();
            if (!editor) return;
            const content = editor.getValue();
            const all = CitationManager.parseAllCitations(content);
            if (!all.length) {
              this.plugin.refreshEditorExtension();
              return;
            }
            const keys = [...new Set(all.map((c) => c.key))];
            const itemMap = await this.plugin.resolveItems(keys);
            if (!itemMap) return;
            const count = CitationManager.refreshDocument(editor, itemMap, this.plugin.settings.cslStyle, v);
            this.plugin.refreshEditorExtension();
            new Notice(t(this.plugin.settings, "settings.switchModeNotice", {
              mode: getModeLabel(v, this.plugin.settings, "short"),
              count,
            }));
          })();
        });
      });

    // ── Editor display ──
    new Setting(containerEl).setName(t(this.plugin.settings, "settings.editorDisplaySection")).setHeading();
    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settings.wordDisplay"))
      .setDesc(t(this.plugin.settings, "settings.wordDisplayDesc"))
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.showWordStyleFootnotes);
        toggle.onChange((v: boolean) => {
          void (async () => {
            this.plugin.settings.showWordStyleFootnotes = v;
            await this.plugin.saveSettings();
            this.plugin.refreshEditorExtension();
          })();
        });
      });

    // ── Toolbar master toggle ──
    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settings.showToolbar"))
      .setDesc(t(this.plugin.settings, "settings.showToolbarDesc"))
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.showToolbar);
        toggle.onChange((v: boolean) => {
          void (async () => {
            this.plugin.settings.showToolbar = v;
            await this.plugin.saveSettings();
            this.plugin.refreshToolbars();
            this.display();
          })();
        });
      });

    // ── Improvement 3: Individual toolbar button toggles ──
    if (this.plugin.settings.showToolbar) {
      const toolbarSection = containerEl.createDiv({ cls: "zotero-toolbar-buttons-section" });

      const buttonKeys: { key: keyof ToolbarButtons; labelKey: string }[] = [
        { key: "export", labelKey: "settings.toolbarBtn.export" },
        { key: "unlink", labelKey: "settings.toolbarBtn.unlink" },
        { key: "changeStyle", labelKey: "settings.toolbarBtn.changeStyle" },
        { key: "refresh", labelKey: "settings.toolbarBtn.refresh" },
        { key: "wordDisplay", labelKey: "settings.toolbarBtn.wordDisplay" },
        { key: "insertCitation", labelKey: "settings.toolbarBtn.insertCitation" },
      ];

      for (const { key, labelKey } of buttonKeys) {
        new Setting(toolbarSection)
          .setName(t(this.plugin.settings, labelKey))
          .addToggle((toggle) => {
            toggle.setValue(this.plugin.settings.toolbarButtons[key]);
            toggle.onChange((v: boolean) => {
              void (async () => {
                this.plugin.settings.toolbarButtons[key] = v;
                await this.plugin.saveSettings();
                this.plugin.refreshToolbars();
              })();
            });
          });
      }
    }

    // ── Export section ──
    new Setting(containerEl).setName(t(this.plugin.settings, "settings.exportSection")).setHeading();
    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settings.pandocPath"))
      .setDesc(t(this.plugin.settings, "settings.pandocPathDesc"))
      .addText((text) =>
        text.setPlaceholder("Pandoc").setValue(this.plugin.settings.pandocPath).onChange((v: string) => {
          void (async () => {
            this.plugin.settings.pandocPath = v.trim() || "pandoc";
            await this.plugin.saveSettings();
          })();
        })
      );
    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settings.pandocFlags"))
      .setDesc(t(this.plugin.settings, "settings.pandocFlagsDesc"))
      .addText((text) =>
        text.setPlaceholder("").setValue(this.plugin.settings.pandocFlags).onChange((v: string) => {
          void (async () => {
            this.plugin.settings.pandocFlags = v.trim();
            await this.plugin.saveSettings();
          })();
        })
      );
    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settings.useDefaultExportDir"))
      .setDesc(t(this.plugin.settings, "settings.useDefaultExportDirDesc"))
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.useDefaultExportDir);
        toggle.onChange((v: boolean) => {
          void (async () => {
            this.plugin.settings.useDefaultExportDir = v;
            await this.plugin.saveSettings();
            this.display();
          })();
        });
      });
    if (this.plugin.settings.useDefaultExportDir) {
      new Setting(containerEl)
        .setName(t(this.plugin.settings, "settings.defaultExportDir"))
        .setDesc(t(this.plugin.settings, "settings.defaultExportDirDesc"))
        .addText((text) =>
          text.setPlaceholder("/Users/you/documents").setValue(this.plugin.settings.exportOutputDir).onChange((v: string) => {
            void (async () => {
              this.plugin.settings.exportOutputDir = v.trim();
              await this.plugin.saveSettings();
            })();
          })
        );
    }

    // ── Command list ──
    new Setting(containerEl).setName(t(this.plugin.settings, "settings.commandsSection")).setHeading();
    const cmds = Object.values(this.plugin.getCommandLabels());
    const ul = containerEl.createEl("ul");
    for (const c of cmds) {
      ul.createEl("li", { text: c, cls: "zotero-settings-command" });
    }
  }

  private async checkConnection(): Promise<void> {
    this.statusDot.className = "zotero-status-dot zotero-status-unknown";
    this.statusText.textContent = t(this.plugin.settings, "settings.checking");
    try {
      const r = await requestUrl({
        url: `http://127.0.0.1:${this.plugin.settings.zoteroPort}/connector/ping`,
        method: "GET",
        throw: false,
      });
      if (r.status === 200) {
        this.statusDot.className = "zotero-status-dot zotero-status-ok";
        this.statusText.textContent = t(this.plugin.settings, "status.connected");
      } else throw new Error();
    } catch {
      this.statusDot.className = "zotero-status-dot zotero-status-err";
      this.statusText.textContent = t(this.plugin.settings, "status.disconnected");
    }
  }
}
