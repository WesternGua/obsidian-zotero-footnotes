/**
 * ZoteroAPI.ts – Communication with Zotero via Better BibTeX HTTP API
 * Improvement 2: Added getInstalledStyles() to dynamically read CSL styles from Zotero
 */
import { requestUrl } from "obsidian";
import * as nodeHttp from "http";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// ── Types ──────────────────────────────────────────────────────────────────
export interface ZoteroItem {
  key: string;
  itemType: string;
  title: string;
  creators: ZoteroCreator[];
  date?: string;
  publicationTitle?: string;
  bookTitle?: string;
  publisher?: string;
  place?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  edition?: string;
  DOI?: string;
  URL?: string;
  ISBN?: string;
  thesisType?: string;
  university?: string;
  conferenceName?: string;
  authority?: string;
  court?: string;
  docketNumber?: string;
  extra?: string;
}

export interface ZoteroCreator {
  firstName: string;
  lastName: string;
  name?: string;
  creatorType: string;
}

export interface CaywResult {
  item: ZoteroItem;
  locator?: string;
  locatorLabel?: string;
}

export interface InstalledStyle {
  id: string;
  title: string;
}

// ── Locator formatting ─────────────────────────────────────────────────────
const LOCATOR_PREFIX: Record<string, string> = {
  page: "p.",
  paragraph: "para.",
  section: "sec.",
  chapter: "ch.",
  figure: "fig.",
  table: "table",
  verse: "v.",
  line: "l.",
  note: "n.",
  column: "col.",
  issue: "no.",
  volume: "vol.",
};

export function formatLocator(locator?: string, label?: string): string {
  if (!locator) return "";
  const prefix = LOCATOR_PREFIX[label ?? "page"] ?? "";
  return prefix ? `${prefix} ${locator}` : locator;
}

// ── Error classes ──────────────────────────────────────────────────────────
export class ZoteroConnectionError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ZoteroConnectionError";
  }
}

export class ZoteroPickerError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ZoteroPickerError";
  }
}

// ── Main API class ─────────────────────────────────────────────────────────
export class ZoteroAPI {
  port: number;
  baseUrl: string;

  constructor(port: number = 23119) {
    this.port = port;
    this.baseUrl = `http://127.0.0.1:${port}`;
  }

  async ping(): Promise<boolean> {
    try {
      const r = await requestUrl({ url: `${this.baseUrl}/connector/ping`, method: "GET", throw: false } as any);
      return r.status === 200;
    } catch (e) {
      return false;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // IMPROVEMENT 2: Dynamic CSL style reading
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Locate the Zotero styles directory across platforms.
   */
  locateZoteroStylesDir(): string | null {
    const home = os.homedir();
    const candidates: string[] = [];

    if (process.platform === "darwin") {
      candidates.push(path.join(home, "Zotero", "styles"));
      candidates.push(path.join(home, "Library", "Application Support", "Zotero", "Profiles"));
    } else if (process.platform === "win32") {
      const appdata = process.env.APPDATA || path.join(home, "AppData", "Roaming");
      candidates.push(path.join(appdata, "Zotero", "Zotero", "Profiles"));
      candidates.push(path.join(home, "Zotero", "styles"));
    } else {
      // Linux
      candidates.push(path.join(home, "Zotero", "styles"));
      candidates.push(path.join(home, ".zotero", "zotero"));
    }

    // Direct styles folder
    for (const dir of candidates) {
      try {
        if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
          // Check if this IS the styles directory
          const files = fs.readdirSync(dir);
          if (files.some((f) => f.endsWith(".csl"))) return dir;
        }
      } catch (e) {
        // skip
      }
    }

    // Search in Profiles for the styles subfolder
    for (const dir of candidates) {
      if (!dir.includes("Profiles")) continue;
      try {
        if (!fs.existsSync(dir)) continue;
        const profiles = fs.readdirSync(dir);
        for (const profile of profiles) {
          const stylesDir = path.join(dir, profile, "styles");
          if (fs.existsSync(stylesDir) && fs.statSync(stylesDir).isDirectory()) {
            return stylesDir;
          }
        }
      } catch (e) {
        // skip
      }
    }

    return null;
  }

  /**
   * Read all installed CSL styles from Zotero's styles directory.
   * Parses each .csl file's <title> and <id> tags.
   */
  async getInstalledStyles(): Promise<InstalledStyle[]> {
    const stylesDir = this.locateZoteroStylesDir();
    if (!stylesDir) return [];

    const results: InstalledStyle[] = [];
    try {
      const files = fs.readdirSync(stylesDir).filter((f) => f.endsWith(".csl"));
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(stylesDir, file), "utf-8");
          // Extract <title> from CSL XML
          const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/);
          // Extract the ID from <id> or from filename
          const idMatch = content.match(/<id[^>]*>([^<]+)<\/id>/);
          let id = file.replace(/\.csl$/, "");
          if (idMatch) {
            // CSL IDs are typically URLs like http://www.zotero.org/styles/apa
            const urlId = idMatch[1];
            const lastSlash = urlId.lastIndexOf("/");
            if (lastSlash !== -1) id = urlId.slice(lastSlash + 1);
          }
          const title = titleMatch ? titleMatch[1].trim() : id;
          results.push({ id, title });
        } catch (e) {
          // skip unreadable files
        }
      }
    } catch (e) {
      return [];
    }

    // Sort by title
    results.sort((a, b) => a.title.localeCompare(b.title));
    return results;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CAYW picker
  // ════════════════════════════════════════════════════════════════════════════

  async openCAYW(onReturn?: () => void): Promise<CaywResult[]> {
    const rawText = await this.httpGet(
      `http://127.0.0.1:${this.port}/better-bibtex/cayw?format=json`,
      600000 // 10 min
    );
    try {
      onReturn?.();
    } catch (e) {}

    if (!rawText || rawText === "[]" || rawText === "null" || rawText === "{}") return [];

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      return [];
    }

    const rawItems = this.extractArray(parsed);
    if (!rawItems.length) return [];

    const result: CaywResult[] = [];
    for (const raw of rawItems) {
      const cayw = this.parseCaywItem(raw);
      if (!cayw) continue;
      if (!cayw.item.creators.length) {
        const key = cayw.item.key;
        const full = key ? await this.fetchFullItem(key, cayw.item.title) : null;
        if (full) {
          cayw.item = { ...full, key: cayw.item.key };
        }
      }
      result.push(cayw);
    }
    return result;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Search
  // ════════════════════════════════════════════════════════════════════════════

  async searchItems(query: string): Promise<ZoteroItem[]> {
    if (!query.trim()) return [];
    try {
      const r = await requestUrl({
        url: `${this.baseUrl}/better-bibtex/json-rpc`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "item.search", params: [query], id: 1 }),
        throw: false,
      } as any);
      if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
      const d = r.json;
      if (d.error) throw new Error(d.error.message);
      return (d.result ?? []).map((i: any) => this.normalizeAny(i)).filter((i: ZoteroItem) => !!i.title);
    } catch (err) {
      throw new ZoteroConnectionError(String(err));
    }
  }

  async getCitationKeys(itemKeys: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (!itemKeys.length) return map;
    try {
      const r = await requestUrl({
        url: `${this.baseUrl}/better-bibtex/json-rpc`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "item.citationkey", params: [itemKeys], id: 2 }),
        throw: false,
      } as any);
      if (r.status !== 200) return map;
      const d = r.json;
      if (d.error || !d.result || typeof d.result !== "object") return map;
      for (const [itemKey, citeKey] of Object.entries(d.result)) {
        if (typeof citeKey === "string" && citeKey.trim()) map.set(itemKey, citeKey);
      }
    } catch (e) {}
    return map;
  }

  async getItemsByKeys(keys: string[], libraryID: number = 1): Promise<Map<string, ZoteroItem>> {
    const map = new Map<string, ZoteroItem>();
    if (!keys.length) return map;

    // Try via export
    try {
      const r = await requestUrl({
        url: `${this.baseUrl}/better-bibtex/json-rpc`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "item.export",
          params: [keys, "f4b52ab0-f878-4556-85a0-c7aeedd09dfc", libraryID],
          id: 3,
        }),
        throw: false,
      } as any);
      if (r.status === 200) {
        const d = r.json;
        if (!d?.error && d?.result) {
          const items = JSON.parse(d.result);
          for (const it of items) {
            const item = this.normalizeAny(it);
            if (item.key && keys.includes(item.key)) map.set(item.key, item);
          }
        }
      }
    } catch (e) {}

    // Fallback: via citation keys
    const missing = keys.filter((k) => !map.has(k));
    if (!missing.length) return map;
    try {
      const citeKeyMap = await this.getCitationKeys(missing);
      const citeKeys: string[] = [];
      const reverse = new Map<string, string>();
      for (const itemKey of missing) {
        const citeKey = citeKeyMap.get(itemKey);
        if (!citeKey) continue;
        citeKeys.push(citeKey);
        reverse.set(citeKey, itemKey);
      }
      if (citeKeys.length) {
        const r = await requestUrl({
          url: `${this.baseUrl}/better-bibtex/json-rpc`,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "item.export",
            params: [citeKeys, "f4b52ab0-f878-4556-85a0-c7aeedd09dfc", libraryID],
            id: 4,
          }),
          throw: false,
        } as any);
        const d = r.json;
        if (r.status === 200 && !d.error && d.result) {
          const items = JSON.parse(d.result);
          for (const it of items) {
            const item = this.normalizeAny(it);
            const found = item.key ? reverse.get(item.key) : undefined;
            if (found) map.set(found, { ...item, key: found });
          }
        }
      }
    } catch (e) {}

    // Fallback: local DB
    const stillMissing = keys.filter((k) => !map.has(k));
    if (!stillMissing.length) return map;
    try {
      const dbItems = await this.getItemsFromLocalDB(stillMissing);
      for (const [k, v] of dbItems) map.set(k, v);
    } catch (e) {}

    return map;
  }

  async getItemsFromLocalDB(keys: string[]): Promise<Map<string, ZoteroItem>> {
    const map = new Map<string, ZoteroItem>();
    if (!keys.length) return map;

    const sqlite = await this.locateZoteroSQLite();
    if (!sqlite) return map;

    const tmpDir = path.join(os.tmpdir(), "zotero-citations-db");
    const tmpDb = path.join(tmpDir, "zotero.sqlite");
    const tmpJournal = path.join(tmpDir, "zotero.sqlite-journal");

    try {
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.copyFileSync(sqlite, tmpDb);
      const journal = `${sqlite}-journal`;
      if (fs.existsSync(journal)) fs.copyFileSync(journal, tmpJournal);
    } catch (e) {
      return map;
    }

    const quoted = keys.map((k) => `'${String(k).replace(/'/g, "''")}'`).join(", ");
    const fieldSql = `SELECT i.key as itemKey, it.typeName as itemType, f.fieldName as fieldName, v.value as value
FROM items i
JOIN itemTypesCombined it ON it.itemTypeID=i.itemTypeID
LEFT JOIN itemData d ON d.itemID=i.itemID
LEFT JOIN fieldsCombined f ON f.fieldID=d.fieldID
LEFT JOIN itemDataValues v ON v.valueID=d.valueID
WHERE i.key IN (${quoted})
ORDER BY i.key, f.fieldName;`;

    const creatorSql = `SELECT i.key as itemKey, ct.creatorType as creatorType, c.firstName as firstName, c.lastName as lastName, ic.orderIndex as orderIndex
FROM items i
JOIN itemCreators ic ON ic.itemID=i.itemID
JOIN creators c ON c.creatorID=ic.creatorID
JOIN creatorTypes ct ON ct.creatorTypeID=ic.creatorTypeID
WHERE i.key IN (${quoted})
ORDER BY i.key, ic.orderIndex;`;

    try {
      const { execAsync, buildEnv } = await import("./ExportManager");
      const { stdout: fieldsRaw } = await execAsync(`sqlite3 -json ${this.q(tmpDb)} ${this.q(fieldSql)}`, { timeout: 10000, env: buildEnv() });
      const { stdout: creatorsRaw } = await execAsync(`sqlite3 -json ${this.q(tmpDb)} ${this.q(creatorSql)}`, { timeout: 10000, env: buildEnv() });
      const fieldRows = JSON.parse(fieldsRaw || "[]");
      const creatorRows = JSON.parse(creatorsRaw || "[]");

      const grouped = new Map<string, { key: string; creators: ZoteroCreator[]; fields: Record<string, string>; itemType?: string }>();
      for (const row of fieldRows) {
        if (!row.itemKey) continue;
        const cur: { key: string; creators: ZoteroCreator[]; fields: Record<string, string>; itemType?: string } =
          grouped.get(row.itemKey) || { key: row.itemKey, creators: [], fields: {}, itemType: row.itemType };
        if (row.itemType && !cur.itemType) cur.itemType = row.itemType;
        if (row.fieldName && row.value != null) cur.fields[row.fieldName] = String(row.value);
        grouped.set(row.itemKey, cur);
      }
      for (const row of creatorRows) {
        if (!row.itemKey) continue;
        const cur: { key: string; creators: ZoteroCreator[]; fields: Record<string, string>; itemType?: string } =
          grouped.get(row.itemKey) || { key: row.itemKey, creators: [], fields: {}, itemType: undefined };
        cur.creators.push({
          firstName: row.firstName || "",
          lastName: row.lastName || "",
          creatorType: row.creatorType || "author",
        });
        grouped.set(row.itemKey, cur);
      }

      for (const [key, g] of grouped) {
        const f = g.fields;
        const item: ZoteroItem = {
          key,
          itemType: g.itemType === "case" ? "legal_case" : (g.itemType || ""),
          title: f.title || f.caseName || "",
          creators: g.creators,
          date: f.date || f.dateDecided || undefined,
          publicationTitle: f.publicationTitle || undefined,
          bookTitle: f.bookTitle || undefined,
          publisher: f.publisher || undefined,
          place: f.place || undefined,
          volume: f.volume || undefined,
          issue: f.issue || undefined,
          pages: f.pages || undefined,
          edition: f.edition || undefined,
          DOI: f.DOI || undefined,
          URL: f.url || undefined,
          ISBN: f.ISBN || undefined,
          thesisType: f.thesisType || undefined,
          university: f.university || undefined,
          conferenceName: f.conferenceName || undefined,
          authority: f.authority || f.court || undefined,
          court: f.court || f.authority || undefined,
          docketNumber: f.docketNumber || f.number || undefined,
          extra: f.extra || undefined,
        };
        if (item.title) map.set(key, item);
      }
    } catch (e) {}
    return map;
  }

  async locateZoteroSQLite(): Promise<string | null> {
    const home = os.homedir();
    const candidates = [
      path.join(home, "Zotero", "zotero.sqlite"),
      path.join(home, "Library", "Application Support", "Zotero", "zotero.sqlite"),
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) return p;
      } catch (e) {}
    }
    return null;
  }

  q(s: string): string {
    return `"${String(s).replace(/(["\\$`\\\\])/g, "\\\\$1")}"`;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async fetchFullItem(key: string, title?: string): Promise<ZoteroItem | null> {
    try {
      const byKey = await this.getItemsByKeys([key]);
      const item = byKey.get(key);
      if (item?.title) return item;
    } catch (e) {}
    try {
      const byDb = await this.getItemsFromLocalDB([key]);
      const item = byDb.get(key);
      if (item?.title) return item;
    } catch (e) {}
    try {
      const results = await this.searchItems(key);
      const match = results.find((r) => r.key === key) ?? (results.length ? results[0] : null);
      if (match?.title) return match;
    } catch (e) {}
    if (title) {
      try {
        const results = await this.searchItems(title);
        const match = results.find((r) => r.title.toLowerCase() === title.toLowerCase()) ?? results[0];
        if (match?.title) return match;
      } catch (e) {}
    }
    return null;
  }

  private httpGet(url: string, timeoutMs: number = 30000): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = nodeHttp.get(url, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: any) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8").trim()));
        res.on("error", (e: Error) => reject(new ZoteroConnectionError(e.message)));
      });
      req.on("error", (e: Error) => reject(new ZoteroConnectionError(e.message)));
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        resolve("");
      });
    });
  }

  private extractArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      for (const key of ["items", "citationItems", "citations"]) {
        if (Array.isArray(data[key])) return data[key];
      }
    }
    return [];
  }

  private parseCaywItem(raw: any): CaywResult | null {
    const locator = raw.locator ? String(raw.locator) : undefined;
    const locatorLabel = raw.label ? String(raw.label) : "page";
    const itemSrc = raw.itemData && typeof raw.itemData === "object" ? raw.itemData : raw.item && typeof raw.item === "object" ? raw.item : raw;
    const preferParentKey = itemSrc.itemType === "attachment" && itemSrc.parentItem ? String(itemSrc.parentItem) : "";
    let key = "";
    if (preferParentKey) key = preferParentKey;
    for (const f of ["itemKey", "key", "citationKey", "citekey"]) {
      if (key) break;
      const v = itemSrc[f] ?? raw[f];
      if (v && String(v).length >= 2) { key = String(v); break; }
    }
    if (!key) {
      for (const f of ["id"]) {
        const v = itemSrc[f] ?? raw[f];
        if (v && String(v).length >= 2) { key = String(v); break; }
      }
    }
    const item = this.normalizeAny(itemSrc);
    if (key) item.key = key;
    if (!item.key) return null;
    return { item, locator, locatorLabel };
  }

  /**
   * Unified normalizer that handles BOTH native Zotero AND CSL-JSON formats.
   */
  normalizeAny(r: any): ZoteroItem {
    let key = "";
    for (const f of ["itemKey", "key", "citationKey"]) {
      if (r[f]) { key = String(r[f]); break; }
    }
    if (!key && typeof r.id === "string") {
      const m = String(r.id).match(/\/items\/([A-Z0-9]{8})(?:$|[/?#])/i);
      if (m) key = m[1];
    }
    for (const f of ["citation-key", "citekey", "id"]) {
      if (key) break;
      if (r[f]) { key = String(r[f]); break; }
    }

    const cslTypeMap: Record<string, string> = {
      "article-journal": "journalArticle",
      "article-magazine": "magazineArticle",
      "article-newspaper": "newspaperArticle",
      "book": "book",
      "chapter": "bookSection",
      "thesis": "thesis",
      "paper-conference": "conferencePaper",
      "webpage": "webpage",
      "report": "report",
      "legal_case": "legal_case",
    };
    const rawType = String(r.itemType ?? r.type ?? "");
    const itemType = cslTypeMap[rawType] ?? rawType;
    const title = String(r.title ?? r.caseName ?? "");

    const creators: ZoteroCreator[] = [];
    if (Array.isArray(r.creators) && r.creators.length > 0) {
      for (const c of r.creators) {
        creators.push({
          firstName: String(c.firstName ?? c.given ?? ""),
          lastName: String(c.lastName ?? c.family ?? ""),
          name: (c.name ?? c.literal) ? String(c.name ?? c.literal) : undefined,
          creatorType: String(c.creatorType ?? "author"),
        });
      }
    } else {
      for (const [field, ctype] of [["author", "author"], ["editor", "editor"]] as const) {
        if (Array.isArray(r[field])) {
          for (const a of r[field]) {
            creators.push({
              firstName: String(a.given ?? a.firstName ?? ""),
              lastName: String(a.family ?? a.lastName ?? ""),
              name: (a.literal ?? a.name) ? String(a.literal ?? a.name) : undefined,
              creatorType: ctype,
            });
          }
        }
      }
    }

    let date: string | undefined;
    if (r.date) {
      const m = String(r.date).match(/\b(\d{4})\b/);
      date = m ? m[1] : String(r.date);
    } else {
      const issued = r.issued;
      const y = issued?.["date-parts"]?.[0]?.[0];
      if (y) date = String(y);
    }

    const publicationTitle = String(r.publicationTitle ?? r["container-title"] ?? r.journalAbbreviation ?? "") || undefined;
    const authority = String(r.authority ?? r.court ?? "") || undefined;

    return {
      key,
      itemType,
      title,
      creators,
      date,
      publicationTitle,
      bookTitle: String(r.bookTitle ?? r["collection-title"] ?? "") || undefined,
      publisher: String(r.publisher ?? "") || undefined,
      place: String(r.place ?? r["publisher-place"] ?? "") || undefined,
      volume: String(r.volume ?? "") || undefined,
      issue: String(r.issue ?? "") || undefined,
      pages: String(r.pages ?? r.page ?? "") || undefined,
      edition: String(r.edition ?? "") || undefined,
      DOI: String(r.DOI ?? "") || undefined,
      URL: String(r.url ?? r.URL ?? "") || undefined,
      ISBN: String(r.ISBN ?? "") || undefined,
      thesisType: String(r.thesisType ?? "") || undefined,
      university: String(r.university ?? r.school ?? "") || undefined,
      conferenceName: String(r.conferenceName ?? r["event-title"] ?? "") || undefined,
      authority,
      court: authority,
      docketNumber: r.docketNumber ?? r.number ? String(r.docketNumber ?? r.number) : undefined,
      extra: r.extra ?? r.note ? String(r.extra ?? r.note) : undefined,
    };
  }
}
