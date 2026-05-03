var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/CitationManager.ts
var KEY_PAT, INLINE_RE_SRC, ENDNOTE_DEF_RE_SRC, BIBLIOGRAPHY_START, BIBLIOGRAPHY_END, CitationManager;
var init_CitationManager = __esm({
  "src/CitationManager.ts"() {
    KEY_PAT = "[A-Za-z0-9_:.-]+";
    INLINE_RE_SRC = `\\^\\[<!-- zotero:(${KEY_PAT}):([^ ]*) --> ([\\s\\S]*?)\\]`;
    ENDNOTE_DEF_RE_SRC = `^\\[\\^(\\d+)\\]: <!-- zotero:(${KEY_PAT}):([^ ]*) --> (.+)$`;
    BIBLIOGRAPHY_START = "<!-- zotero-bibliography-start -->";
    BIBLIOGRAPHY_END = "<!-- zotero-bibliography-end -->";
    CitationManager = class _CitationManager {
      // ════════════════════════════════════════════════════════════════════════
      // PARSING
      // ════════════════════════════════════════════════════════════════════════
      static parseInlineCitations(content) {
        const results = [];
        const startRe = new RegExp(`\\^\\[<!-- zotero:(${KEY_PAT}):([^ ]*) --> `, "g");
        let m;
        while ((m = startRe.exec(content)) !== null) {
          const index = m.index;
          const key = m[1];
          const page = decodeURIComponent(m[2]);
          const bodyStart = index + m[0].length;
          let pos = bodyStart;
          let depth = 0;
          while (pos < content.length) {
            const ch = content[pos];
            if (ch === "\\") {
              pos += 2;
              continue;
            }
            if (ch === "[") {
              depth++;
              pos++;
              continue;
            }
            if (ch === "]") {
              if (depth === 0)
                break;
              depth--;
              pos++;
              continue;
            }
            pos++;
          }
          if (pos >= content.length)
            break;
          results.push({
            fullMatch: content.slice(index, pos + 1),
            key,
            page,
            formattedText: content.slice(bodyStart, pos),
            index
          });
          startRe.lastIndex = pos + 1;
        }
        return results;
      }
      static parseEndnoteDefs(content) {
        const results = [];
        const re = new RegExp(ENDNOTE_DEF_RE_SRC, "gm");
        let m;
        while ((m = re.exec(content)) !== null) {
          results.push({
            label: m[1],
            key: m[2],
            page: decodeURIComponent(m[3]),
            formattedText: m[4],
            fullMatch: m[0],
            defIndex: m.index
          });
        }
        return results;
      }
      static parseAllCitations(content) {
        const seen = /* @__PURE__ */ new Set();
        const out = [];
        for (const c of _CitationManager.parseInlineCitations(content)) {
          if (!seen.has(c.key)) {
            seen.add(c.key);
            out.push({ key: c.key, page: c.page });
          }
        }
        for (const c of _CitationManager.parseEndnoteRefs(content)) {
          if (!seen.has(c.key)) {
            seen.add(c.key);
            out.push({ key: c.key, page: c.page });
          }
        }
        return out;
      }
      static parseDocumentCitations(content) {
        return [
          ..._CitationManager.parseInlineCitations(content),
          ..._CitationManager.parseEndnoteRefs(content)
        ];
      }
      static parseEndnoteRefs(content) {
        const defs = new Map(
          _CitationManager.parseEndnoteDefs(content).map((d) => [d.label, d])
        );
        const refs = [];
        const re = /\[\^([^\]\n]+)\]/g;
        let m;
        while ((m = re.exec(content)) !== null) {
          if (content[m.index + m[0].length] === ":")
            continue;
          const def = defs.get(m[1]);
          if (!def)
            continue;
          refs.push({
            label: m[1],
            key: def.key,
            page: def.page,
            formattedText: def.formattedText,
            fullMatch: m[0],
            index: m.index
          });
        }
        return refs;
      }
      static isInsideInline(content, pos) {
        for (const c of _CitationManager.parseInlineCitations(content)) {
          if (pos > c.index && pos < c.index + c.fullMatch.length)
            return c;
        }
        return null;
      }
      static isInsideEndnoteRef(content, pos) {
        var _a;
        const defs = new Map(
          _CitationManager.parseEndnoteDefs(content).map((d) => [d.label, d])
        );
        const re = /\[\^(\d+)\]/g;
        let m;
        while ((m = re.exec(content)) !== null) {
          if (content[m.index + m[0].length] === ":")
            continue;
          if (pos >= m.index && pos <= m.index + m[0].length)
            return (_a = defs.get(m[1])) != null ? _a : null;
        }
        return null;
      }
      // ════════════════════════════════════════════════════════════════════════
      // BUILDING
      // ════════════════════════════════════════════════════════════════════════
      static buildInlineFootnote(item, style, page) {
        const text = _CitationManager.formatCitation(item, style, page);
        return `^[<!-- zotero:${item.key}:${encodeURIComponent(page != null ? page : "")} --> ${text}]`;
      }
      static buildEndnoteDef(label, item, style, page) {
        const text = _CitationManager.formatCitation(item, style, page);
        return `[^${label}]: <!-- zotero:${item.key}:${encodeURIComponent(page != null ? page : "")} --> ${text}`;
      }
      // ════════════════════════════════════════════════════════════════════════
      // INSERTION
      // ════════════════════════════════════════════════════════════════════════
      static insertInline(editor, item, style, page) {
        editor.replaceSelection(_CitationManager.buildInlineFootnote(item, style, page));
      }
      static insertEndnote(editor, item, style, page) {
        const content = editor.getValue();
        let max = 0;
        const re = /\[\^(\d+)\]/g;
        let m;
        while ((m = re.exec(content)) !== null)
          max = Math.max(max, parseInt(m[1]));
        const label = String(max + 1);
        editor.replaceSelection(`[^${label}]`);
        const updated = editor.getValue();
        const def = _CitationManager.buildEndnoteDef(label, item, style, page);
        const bibStart = updated.indexOf(BIBLIOGRAPHY_START);
        if (bibStart !== -1) {
          let ins = bibStart;
          while (ins > 0 && updated[ins - 1] === "\n")
            ins--;
          editor.replaceRange("\n\n" + def, editor.offsetToPos(ins), editor.offsetToPos(ins));
        } else {
          editor.replaceRange("\n\n" + def, editor.offsetToPos(updated.length));
        }
      }
      static replaceInline(editor, existing, item, style, page) {
        editor.replaceRange(
          _CitationManager.buildInlineFootnote(item, style, page),
          editor.offsetToPos(existing.index),
          editor.offsetToPos(existing.index + existing.fullMatch.length)
        );
      }
      static replaceEndnoteDef(editor, existing, item, style, page) {
        editor.replaceRange(
          _CitationManager.buildEndnoteDef(existing.label, item, style, page),
          editor.offsetToPos(existing.defIndex),
          editor.offsetToPos(existing.defIndex + existing.fullMatch.length)
        );
      }
      // ════════════════════════════════════════════════════════════════════════
      // REFRESH
      // ════════════════════════════════════════════════════════════════════════
      static refreshInline(editor, itemMap, style) {
        let content = editor.getValue();
        const citations = _CitationManager.parseInlineCitations(content);
        let count = 0;
        for (let i = citations.length - 1; i >= 0; i--) {
          const c = citations[i];
          const item = itemMap.get(c.key);
          if (!item)
            continue;
          content = content.slice(0, c.index) + _CitationManager.buildInlineFootnote(item, style, c.page || void 0) + content.slice(c.index + c.fullMatch.length);
          count++;
        }
        editor.setValue(content);
        return count;
      }
      static refreshEndnotes(editor, itemMap, style) {
        let content = editor.getValue();
        const defs = _CitationManager.parseEndnoteDefs(content);
        let count = 0;
        for (let i = defs.length - 1; i >= 0; i--) {
          const d = defs[i];
          const item = itemMap.get(d.key);
          if (!item)
            continue;
          content = content.slice(0, d.defIndex) + _CitationManager.buildEndnoteDef(d.label, item, style, d.page || void 0) + content.slice(d.defIndex + d.fullMatch.length);
          count++;
        }
        editor.setValue(content);
        return count;
      }
      static removeUnreferencedEndnotes(editor) {
        let content = editor.getValue();
        const referencedLabels = new Set(_CitationManager.parseEndnoteRefs(content).map((r) => r.label));
        const defs = _CitationManager.parseEndnoteDefs(content);
        let count = 0;
        for (let i = defs.length - 1; i >= 0; i--) {
          const d = defs[i];
          if (referencedLabels.has(d.label))
            continue;
          let start = d.defIndex;
          while (start >= 2 && content[start - 1] === "\n" && content[start - 2] === "\n")
            start--;
          const end = d.defIndex + d.fullMatch.length;
          content = content.slice(0, start) + content.slice(end);
          count++;
        }
        if (count)
          editor.setValue(content);
        return count;
      }
      static removeManagedBibliography(editor) {
        const content = editor.getValue();
        const startIdx = content.indexOf(BIBLIOGRAPHY_START);
        const endIdx = content.indexOf(BIBLIOGRAPHY_END);
        if (startIdx === -1 || endIdx === -1)
          return false;
        let start = startIdx;
        while (start >= 2 && content[start - 1] === "\n" && content[start - 2] === "\n")
          start--;
        let end = endIdx + BIBLIOGRAPHY_END.length;
        while (end < content.length && content[end] === "\n")
          end++;
        editor.replaceRange("", editor.offsetToPos(start), editor.offsetToPos(end));
        return true;
      }
      static convertEndnotesToInline(editor, itemMap, style) {
        let content = editor.getValue();
        const refs = _CitationManager.parseEndnoteRefs(content);
        let count = 0;
        for (let i = refs.length - 1; i >= 0; i--) {
          const ref = refs[i];
          const item = itemMap.get(ref.key);
          if (!item)
            continue;
          content = content.slice(0, ref.index) + _CitationManager.buildInlineFootnote(item, style, ref.page || void 0) + content.slice(ref.index + ref.fullMatch.length);
          count++;
        }
        const defs = _CitationManager.parseEndnoteDefs(content);
        for (let i = defs.length - 1; i >= 0; i--) {
          const d = defs[i];
          let end = d.defIndex + d.fullMatch.length;
          while (end < content.length && content[end] === "\n")
            end++;
          content = content.slice(0, d.defIndex) + content.slice(end);
        }
        editor.setValue(content);
        return count;
      }
      static convertInlineToEndnotes(editor, itemMap, style) {
        let content = editor.getValue();
        const inlines = _CitationManager.parseInlineCitations(content);
        if (!inlines.length)
          return 0;
        let max = 0;
        const re = /\[\^(\d+)\]/g;
        let m;
        while ((m = re.exec(content)) !== null)
          max = Math.max(max, parseInt(m[1]));
        const labels = inlines.map((_, idx) => String(max + idx + 1));
        for (let i = inlines.length - 1; i >= 0; i--) {
          const c = inlines[i];
          content = content.slice(0, c.index) + `[^${labels[i]}]` + content.slice(c.index + c.fullMatch.length);
        }
        const defs = [];
        for (let i = 0; i < inlines.length; i++) {
          const c = inlines[i];
          const item = itemMap.get(c.key);
          if (!item)
            continue;
          defs.push(_CitationManager.buildEndnoteDef(labels[i], item, style, c.page || void 0));
        }
        if (defs.length) {
          const bibStart = content.indexOf(BIBLIOGRAPHY_START);
          if (bibStart !== -1) {
            let ins = bibStart;
            while (ins > 0 && content[ins - 1] === "\n")
              ins--;
            content = content.slice(0, ins) + "\n\n" + defs.join("\n\n") + content.slice(ins);
          } else {
            content += "\n\n" + defs.join("\n\n");
          }
        }
        editor.setValue(content);
        return defs.length;
      }
      static refreshDocument(editor, itemMap, style, mode = "endnote") {
        let count = 0;
        if (mode === "inline") {
          count += _CitationManager.convertEndnotesToInline(editor, itemMap, style);
          count += _CitationManager.refreshInline(editor, itemMap, style);
        } else {
          count += _CitationManager.convertInlineToEndnotes(editor, itemMap, style);
          count += _CitationManager.refreshEndnotes(editor, itemMap, style);
        }
        const newContent = editor.getValue();
        if (newContent.includes(BIBLIOGRAPHY_START)) {
          const bib = _CitationManager.generateBibliography(newContent, itemMap, style);
          _CitationManager.insertOrReplaceBibliography(editor, bib);
        }
        return count;
      }
      // ════════════════════════════════════════════════════════════════════════
      // BIBLIOGRAPHY
      // ════════════════════════════════════════════════════════════════════════
      static generateBibliography(content, itemMap, style, heading) {
        const all = _CitationManager.parseAllCitations(content);
        const seen = /* @__PURE__ */ new Set();
        const items = [];
        for (const c of all) {
          if (!seen.has(c.key)) {
            seen.add(c.key);
            const it = itemMap.get(c.key);
            if (it)
              items.push(it);
          }
        }
        if (!items.length)
          return "";
        const entries = items.map((it, i) => _CitationManager.formatBibEntry(it, style, i + 1));
        const title = heading || "References";
        const quotedEntries = entries.map((e) => "> " + e).join("\n>\n");
        return BIBLIOGRAPHY_START + "\n\n# " + title + "\n\n" + quotedEntries + "\n\n" + BIBLIOGRAPHY_END;
      }
      static insertOrReplaceBibliography(editor, bib) {
        const content = editor.getValue();
        const startIdx = content.indexOf(BIBLIOGRAPHY_START);
        const endIdx = content.indexOf(BIBLIOGRAPHY_END);
        if (startIdx !== -1 && endIdx !== -1) {
          editor.replaceRange(bib, editor.offsetToPos(startIdx), editor.offsetToPos(endIdx + BIBLIOGRAPHY_END.length));
        } else {
          editor.replaceSelection("\n\n" + bib + "\n");
        }
      }
      static extractBibHeading(content) {
        const startIdx = content.indexOf(BIBLIOGRAPHY_START);
        const endIdx = content.indexOf(BIBLIOGRAPHY_END);
        if (startIdx === -1 || endIdx === -1)
          return null;
        const block = content.slice(startIdx + BIBLIOGRAPHY_START.length, endIdx);
        const m = block.match(/^#{1,2}\s+(.+)$/m);
        return m ? m[1].trim() : null;
      }
      // ════════════════════════════════════════════════════════════════════════
      // UNLINK
      // ════════════════════════════════════════════════════════════════════════
      static unlinkAll(editor) {
        let content = editor.getValue();
        let count = 0;
        const inlines = _CitationManager.parseInlineCitations(content);
        for (let i = inlines.length - 1; i >= 0; i--) {
          const c = inlines[i];
          content = content.slice(0, c.index) + `^[${c.formattedText}]` + content.slice(c.index + c.fullMatch.length);
          count++;
        }
        const defs = _CitationManager.parseEndnoteDefs(content);
        for (let i = defs.length - 1; i >= 0; i--) {
          const d = defs[i];
          content = content.slice(0, d.defIndex) + `[^${d.label}]: ${d.formattedText}` + content.slice(d.defIndex + d.fullMatch.length);
          count++;
        }
        editor.setValue(content);
        return count;
      }
      // ════════════════════════════════════════════════════════════════════════
      // FORMATTERS
      // ════════════════════════════════════════════════════════════════════════
      static formatCitation(item, style, page) {
        switch (style) {
          case "chicago-note-bibliography":
            return _CitationManager.fmtChicagoNote(item, page);
          case "chicago-author-date":
            return _CitationManager.fmtChicagoAD(item, page);
          case "apa":
            return _CitationManager.fmtAPA(item, page);
          case "modern-language-association":
            return _CitationManager.fmtMLA(item, page);
          case "vancouver":
            return _CitationManager.fmtVancouver(item, page);
          case "gb-t-7714-2015-numeric":
          case "gb-t-7714-2015-author-date":
            return _CitationManager.fmtGBT(item, page);
          case "oscola":
            return _CitationManager.fmtOSCOLA(item, page);
          case "harvard-cite-them-right":
            return _CitationManager.fmtHarvard(item, page);
          case "ieee":
            return _CitationManager.fmtIEEE(item, page);
          default:
            return _CitationManager.fmtChicagoNote(item, page);
        }
      }
      static formatBibEntry(item, style, idx) {
        switch (style) {
          case "chicago-note-bibliography":
          case "chicago-author-date":
            return _CitationManager.bibChicago(item);
          case "apa":
          case "harvard-cite-them-right":
            return _CitationManager.bibAPA(item);
          case "modern-language-association":
            return _CitationManager.bibMLA(item);
          case "vancouver":
            return `${idx}. ${_CitationManager.bibVancouver(item)}`;
          case "gb-t-7714-2015-numeric":
            return `[${idx}] ${_CitationManager.bibGBT(item)}`;
          case "gb-t-7714-2015-author-date":
            return _CitationManager.bibGBT(item);
          case "oscola":
            return _CitationManager.bibOSCOLA(item);
          case "ieee":
            return `[${idx}] ${_CitationManager.bibIEEE(item)}`;
          default:
            return _CitationManager.bibChicago(item);
        }
      }
      // ── Helpers ───────────────────────────────────────────────────────────────
      static getYear(item) {
        var _a, _b;
        if (!item.date)
          return "n.d.";
        return (_b = (_a = item.date.match(/\b(\d{4})\b/)) == null ? void 0 : _a[1]) != null ? _b : item.date;
      }
      static getAuthors(item, type = "author") {
        return item.creators.filter((c) => c.creatorType === type);
      }
      static nameNormal(c) {
        if (c.name)
          return c.name;
        return [c.firstName, c.lastName].filter(Boolean).join(" ");
      }
      static nameInverted(c) {
        var _a, _b;
        if (c.name)
          return c.name;
        const f = (_a = c.firstName) != null ? _a : "";
        const l = (_b = c.lastName) != null ? _b : "";
        return l ? `${l}${f ? ", " + f : ""}` : f;
      }
      static authorStr(item, max = 3, inverted = false) {
        const a = _CitationManager.getAuthors(item);
        if (!a.length)
          return "Anonymous";
        const names = a.map((x, i) => i === 0 && inverted ? _CitationManager.nameInverted(x) : _CitationManager.nameNormal(x));
        if (names.length > max)
          return names[0] + " et al.";
        if (names.length === 1)
          return names[0];
        return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
      }
      static initials(item, max = 6) {
        const a = _CitationManager.getAuthors(item);
        if (!a.length)
          return "Anon";
        const names = a.map((x) => {
          var _a, _b;
          if (x.name)
            return x.name;
          const inits = ((_a = x.firstName) != null ? _a : "").split(/\s+/).filter(Boolean).map((n) => n[0] + ".").join(" ");
          return ((_b = x.lastName) != null ? _b : "") + (inits ? " " + inits : "");
        });
        return names.length > max ? names.slice(0, max).join(", ") + " et al." : names.join(", ");
      }
      static it(s) {
        return `*${s}*`;
      }
      // ── Chicago Notes-Bibliography ─────────────────────────────────────────────
      static fmtChicagoNote(item, page) {
        var _a, _b, _c, _d, _e;
        const a = _CitationManager.authorStr(item);
        const y = _CitationManager.getYear(item);
        const p = page ? `, ${page}` : "";
        switch (item.itemType) {
          case "legal_case": {
            const court = (_a = item.court) != null ? _a : item.authority;
            return `${_CitationManager.it(item.title)} [${y}]${court ? " " + court : ""}${item.docketNumber ? " " + item.docketNumber : ""}${p}.`;
          }
          case "book":
            return `${a}, ${_CitationManager.it(item.title)} (${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y})${p}.`;
          case "bookSection": {
            const eds = _CitationManager.getAuthors(item, "editor").map((e) => _CitationManager.nameNormal(e)).join(", ");
            return `${a}, "${item.title}," in ${_CitationManager.it((_b = item.bookTitle) != null ? _b : "Unknown")}${eds ? ", ed. " + eds : ""} (${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y})${p}.`;
          }
          case "journalArticle":
            return `${a}, "${item.title}," ${_CitationManager.it((_c = item.publicationTitle) != null ? _c : "Journal")}${item.volume ? " " + item.volume : ""}${item.issue ? ", no. " + item.issue : ""} (${y})${item.pages ? ": " + item.pages : ""}${p}.`;
          case "thesis":
            return `${a}, "${item.title}" (${(_d = item.thesisType) != null ? _d : "PhD diss."}, ${(_e = item.university) != null ? _e : "n.p."}, ${y})${p}.`;
          default:
            return `${a}, "${item.title}" (${y})${p}.`;
        }
      }
      static bibChicago(item) {
        var _a, _b, _c, _d, _e;
        const a = _CitationManager.authorStr(item, 3, true);
        const y = _CitationManager.getYear(item);
        switch (item.itemType) {
          case "legal_case": {
            const court = (_a = item.court) != null ? _a : item.authority;
            return `${_CitationManager.it(item.title)}. ${court ? court + ". " : ""}${item.docketNumber ? item.docketNumber + ". " : ""}${y}.`;
          }
          case "book":
            return `${a}. ${_CitationManager.it(item.title)}. ${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y}.`;
          case "bookSection": {
            const eds = _CitationManager.getAuthors(item, "editor").map((e) => _CitationManager.nameNormal(e)).join(", ");
            return `${a}. "${item.title}." In ${_CitationManager.it((_b = item.bookTitle) != null ? _b : "Unknown")}${eds ? ", edited by " + eds : ""}. ${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y}.`;
          }
          case "journalArticle":
            return `${a}. "${item.title}." ${_CitationManager.it((_c = item.publicationTitle) != null ? _c : "Journal")}${item.volume ? " " + item.volume : ""}${item.issue ? ", no. " + item.issue : ""} (${y})${item.pages ? ": " + item.pages : ""}.${item.DOI ? " https://doi.org/" + item.DOI : ""}`;
          case "thesis":
            return `${a}. "${item.title}." ${(_d = item.thesisType) != null ? _d : "PhD diss."}, ${(_e = item.university) != null ? _e : "n.p."}, ${y}.`;
          default:
            return `${a}. "${item.title}." ${y}.`;
        }
      }
      static fmtChicagoAD(item, page) {
        var _a, _b;
        const l = (_b = (_a = _CitationManager.getAuthors(item)[0]) == null ? void 0 : _a.lastName) != null ? _b : "Anonymous";
        return `(${l} ${_CitationManager.getYear(item)}${page ? ", " + page : ""})`;
      }
      static fmtAPA(item, page) {
        var _a, _b;
        const a = _CitationManager.getAuthors(item);
        const str = a.length <= 2 ? a.map((x) => {
          var _a2;
          return (_a2 = x.lastName) != null ? _a2 : "";
        }).filter(Boolean).join(" & ") : ((_b = (_a = a[0]) == null ? void 0 : _a.lastName) != null ? _b : "") + " et al.";
        return `(${str || "Anonymous"}, ${_CitationManager.getYear(item)}${page ? ", p. " + page : ""})`;
      }
      static bibAPA(item) {
        var _a, _b;
        const a = _CitationManager.getAuthors(item).map((x) => {
          var _a2, _b2;
          if (x.name)
            return x.name;
          const ini = ((_a2 = x.firstName) != null ? _a2 : "").split(/\s+/).filter(Boolean).map((n) => n[0] + ".").join(" ");
          return `${(_b2 = x.lastName) != null ? _b2 : ""}${ini ? ", " + ini : ""}`;
        }).join(", ") || "Anonymous";
        const y = _CitationManager.getYear(item);
        switch (item.itemType) {
          case "book":
            return `${a}. (${y}). ${_CitationManager.it(item.title)}${item.edition ? ` (${item.edition} ed.)` : ""}. ${(_a = item.publisher) != null ? _a : "n.p."}.`;
          case "journalArticle":
            return `${a}. (${y}). ${item.title}. ${_CitationManager.it((_b = item.publicationTitle) != null ? _b : "Journal")}${item.volume ? `, ${_CitationManager.it(item.volume)}` : ""}${item.issue ? `(${item.issue})` : ""}${item.pages ? `, ${item.pages}` : ""}.${item.DOI ? ` https://doi.org/${item.DOI}` : ""}`;
          default:
            return `${a}. (${y}). ${item.title}.`;
        }
      }
      static fmtMLA(item, page) {
        var _a, _b;
        return `(${(_b = (_a = _CitationManager.getAuthors(item)[0]) == null ? void 0 : _a.lastName) != null ? _b : "Anonymous"}${page ? " " + page : ""})`;
      }
      static bibMLA(item) {
        var _a, _b;
        const a = _CitationManager.getAuthors(item);
        const as = !a.length ? "Anonymous." : a.length === 1 ? _CitationManager.nameInverted(a[0]) + "." : a.length === 2 ? `${_CitationManager.nameInverted(a[0])}, and ${_CitationManager.nameNormal(a[1])}.` : _CitationManager.nameInverted(a[0]) + ", et al.";
        const y = _CitationManager.getYear(item);
        switch (item.itemType) {
          case "book":
            return `${as} ${_CitationManager.it(item.title)}. ${(_a = item.publisher) != null ? _a : "n.p."}, ${y}.`;
          case "journalArticle":
            return `${as} "${item.title}." ${_CitationManager.it((_b = item.publicationTitle) != null ? _b : "Journal")}${item.volume ? `, vol. ${item.volume}` : ""}${item.issue ? `, no. ${item.issue}` : ""}, ${y}${item.pages ? `, pp. ${item.pages}` : ""}.`;
          default:
            return `${as} ${_CitationManager.it(item.title)}. ${y}.`;
        }
      }
      static fmtVancouver(item, page) {
        var _a, _b;
        return `${(_b = (_a = _CitationManager.getAuthors(item)[0]) == null ? void 0 : _a.lastName) != null ? _b : "Anon"} ${_CitationManager.getYear(item)}${page ? ":" + page : ""}`;
      }
      static bibVancouver(item) {
        var _a, _b;
        const a = _CitationManager.initials(item);
        const y = _CitationManager.getYear(item);
        switch (item.itemType) {
          case "journalArticle":
            return `${a}. ${item.title}. ${(_a = item.publicationTitle) != null ? _a : "Journal"}. ${y};${(_b = item.volume) != null ? _b : ""}${item.issue ? `(${item.issue})` : ""}${item.pages ? `:${item.pages}` : ""}.`;
          case "book":
            return `${a}. ${item.title}. ${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}; ${y}.`;
          default:
            return `${a}. ${item.title}. ${y}.`;
        }
      }
      static fmtGBT(item, page) {
        var _a, _b;
        return `${(_b = (_a = _CitationManager.getAuthors(item)[0]) == null ? void 0 : _a.lastName) != null ? _b : ""}${_CitationManager.getYear(item)}${page ? ": " + page : ""}`;
      }
      static bibGBT(item) {
        var _a, _b, _c;
        const a = _CitationManager.getAuthors(item).slice(0, 3).map((x) => {
          var _a2;
          return ((_a2 = x.lastName) != null ? _a2 : "") + (x.firstName ? " " + x.firstName : "");
        }).join(", ") + (_CitationManager.getAuthors(item).length > 3 ? ", \u7B49" : "") || "\u4F5A\u540D";
        const y = _CitationManager.getYear(item);
        const dt = { book: "M", journalArticle: "J", bookSection: "M", conferencePaper: "C", thesis: "D", report: "R", webpage: "EB/OL" };
        const d = (_a = dt[item.itemType]) != null ? _a : "Z";
        switch (item.itemType) {
          case "book":
            return `${a}. ${item.title}[${d}]. ${[item.place, item.publisher].filter(Boolean).join(": ") || "\u51FA\u7248\u5730\u4E0D\u8BE6: \u51FA\u7248\u8005\u4E0D\u8BE6"}, ${y}.`;
          case "journalArticle":
            return `${a}. ${item.title}[${d}]. ${(_b = item.publicationTitle) != null ? _b : "\u671F\u520A"}${item.volume ? `, ${item.volume}` : ""}${item.issue ? `(${item.issue})` : ""}, ${y}${item.pages ? `: ${item.pages}` : ""}.`;
          case "thesis":
            return `${a}. ${item.title}[${d}]. ${(_c = item.university) != null ? _c : "\u5B66\u6821\u4E0D\u8BE6"}, ${y}.`;
          default:
            return `${a}. ${item.title}[${d}]. ${y}.`;
        }
      }
      static fmtOSCOLA(item, page) {
        var _a, _b;
        const a = _CitationManager.authorStr(item);
        const y = _CitationManager.getYear(item);
        const p = page ? " " + page : "";
        switch (item.itemType) {
          case "book":
            return `${a}, ${_CitationManager.it(item.title)} (${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y})${p}`;
          case "journalArticle":
            return `${a}, '${item.title}' (${y}) ${(_a = item.volume) != null ? _a : ""} ${(_b = item.publicationTitle) != null ? _b : ""}${item.pages ? " " + item.pages : ""}${p}`;
          default:
            return `${a}, ${_CitationManager.it(item.title)} (${y})${p}`;
        }
      }
      static bibOSCOLA(item) {
        return _CitationManager.fmtOSCOLA(item);
      }
      static fmtHarvard(item, page) {
        var _a, _b;
        return `(${(_b = (_a = _CitationManager.getAuthors(item)[0]) == null ? void 0 : _a.lastName) != null ? _b : "Anonymous"}, ${_CitationManager.getYear(item)}${page ? ", p. " + page : ""})`;
      }
      static fmtIEEE(item, _page) {
        var _a, _b;
        return (_b = (_a = _CitationManager.getAuthors(item)[0]) == null ? void 0 : _a.lastName) != null ? _b : "Anon";
      }
      static bibIEEE(item) {
        var _a;
        const a = _CitationManager.initials(item);
        const y = _CitationManager.getYear(item);
        switch (item.itemType) {
          case "journalArticle":
            return `${a}, "${item.title}," ${_CitationManager.it((_a = item.publicationTitle) != null ? _a : "Journal")}${item.volume ? `, vol. ${item.volume}` : ""}${item.issue ? `, no. ${item.issue}` : ""}${item.pages ? `, pp. ${item.pages}` : ""}, ${y}.`;
          case "book":
            return `${a}, ${_CitationManager.it(item.title)}. ${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y}.`;
          default:
            return `${a}, "${item.title}," ${y}.`;
        }
      }
    };
  }
});

// src/i18n.ts
function getLanguage(settings) {
  return (settings == null ? void 0 : settings.language) === "en" ? "en" : "zh";
}
function formatI18n(template, vars = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] != null ? String(vars[key]) : "");
}
function t(settingsOrLang, key, vars) {
  const lang = typeof settingsOrLang === "string" ? settingsOrLang : getLanguage(settingsOrLang);
  const dict = I18N[lang] || I18N.zh;
  const fallback = I18N.zh[key] || key;
  return formatI18n(dict[key] || fallback, vars);
}
function getAppSettings(app) {
  var _a, _b, _c;
  return (_c = (_b = (_a = app == null ? void 0 : app.plugins) == null ? void 0 : _a.plugins) == null ? void 0 : _b["zotero-citations"]) == null ? void 0 : _c.settings;
}
function appT(app, key, vars) {
  return t(getAppSettings(app) || {}, key, vars);
}
var I18N;
var init_i18n = __esm({
  "src/i18n.ts"() {
    I18N = {
      zh: {
        "settings.interface": "\u754C\u9762\u8BED\u8A00",
        "settings.interfaceDesc": "\u9009\u62E9\u63D2\u4EF6\u754C\u9762\u7684\u663E\u793A\u8BED\u8A00",
        "settings.connection": "Zotero \u8FDE\u63A5\u72B6\u6001",
        "settings.checking": "\u68C0\u6D4B\u4E2D\u2026",
        "settings.recheck": "\u91CD\u65B0\u68C0\u6D4B",
        "settings.citationStyleSection": "\u5F15\u7528\u6837\u5F0F",
        "settings.defaultStyle": "\u9ED8\u8BA4 CSL \u6837\u5F0F",
        "settings.defaultStyleDesc": "\u65B0\u63D2\u5165\u5F15\u7528\u4F7F\u7528\u7684\u683C\u5F0F",
        "settings.citationMode": "\u5F15\u7528\u683C\u5F0F\u6A21\u5F0F",
        "settings.citationModeDesc": "\u811A\u6CE8\u6A21\u5F0F\uFF1A^[\u5F15\u7528\u6587\u672C]\uFF1B\u5C3E\u6CE8\u6A21\u5F0F\uFF1A[^1] + \u6587\u672B\u5B9A\u4E49",
        "settings.editorDisplaySection": "\u7F16\u8F91\u5668\u663E\u793A",
        "settings.wordDisplay": "Word \u98CE\u683C\u811A\u6CE8\u663E\u793A",
        "settings.wordDisplayDesc": "\u5F00\u542F\u540E\uFF0C\u7F16\u8F91\u5668\u548C\u9884\u89C8\u4E2D\u7684\u811A\u6CE8\u6807\u8BB0\u663E\u793A\u4E3A\u4E0A\u6807\u6570\u5B57\uFF1B\u60AC\u505C\u6570\u5B57\u53EF\u67E5\u770B\u5B8C\u6574\u811A\u6CE8/\u5C3E\u6CE8\u5185\u5BB9",
        "settings.showToolbar": "\u663E\u793A\u6807\u9898\u680F\u64CD\u4F5C\u56FE\u6807",
        "settings.showToolbarDesc": "\u5728 Markdown \u6807\u9898\u680F\u663E\u793A Zotero \u5FEB\u6377\u56FE\u6807\uFF08\u4F4D\u4E8E\u56DE\u9000\u3001\u524D\u8FDB\u3001\u66F4\u591A\u9009\u9879\u540C\u4E00\u884C\uFF09",
        "settings.toolbarButtonsSection": "\u6807\u9898\u680F\u6309\u94AE",
        "settings.toolbarButtonsDesc": "\u5355\u72EC\u63A7\u5236\u6BCF\u4E2A\u6807\u9898\u680F\u6309\u94AE\u7684\u663E\u9690",
        "settings.toolbarBtn.export": "\u5BFC\u51FA\u4E3A Word",
        "settings.toolbarBtn.unlink": "\u89E3\u9664\u5F15\u7528\u94FE\u63A5",
        "settings.toolbarBtn.changeStyle": "\u4FEE\u6539\u5F15\u7528\u683C\u5F0F",
        "settings.toolbarBtn.refresh": "\u5237\u65B0\u6240\u6709\u5F15\u7528",
        "settings.toolbarBtn.wordDisplay": "\u5207\u6362 Word \u98CE\u683C\u811A\u6CE8",
        "settings.toolbarBtn.insertCitation": "\u63D2\u5165\u5F15\u7528",
        "settings.exportSection": "Pandoc \u5BFC\u51FA",
        "settings.pandocPath": "Pandoc \u53EF\u6267\u884C\u6587\u4EF6\u8DEF\u5F84",
        "settings.pandocPathDesc": "\u9ED8\u8BA4 pandoc\uFF08\u9700\u5728 PATH \u4E2D\uFF09\uFF0C\u5426\u5219\u586B\u5B8C\u6574\u8DEF\u5F84",
        "settings.pandocFlags": "\u989D\u5916 Pandoc \u53C2\u6570",
        "settings.pandocFlagsDesc": "\u9644\u52A0\u5230\u5BFC\u51FA\u547D\u4EE4\uFF0C\u4F8B\u5982 --reference-doc=template.docx",
        "settings.useDefaultExportDir": "\u4F7F\u7528\u56FA\u5B9A\u5BFC\u51FA\u76EE\u5F55",
        "settings.useDefaultExportDirDesc": "\u5173\u95ED\u65F6\u6BCF\u6B21\u5BFC\u51FA\u5F39\u51FA\u8DEF\u5F84\u9009\u62E9\u6846",
        "settings.defaultExportDir": "\u9ED8\u8BA4\u5BFC\u51FA\u76EE\u5F55",
        "settings.defaultExportDirDesc": "\u7559\u7A7A\u5219\u4E0E\u6E90\u6587\u4EF6\u540C\u76EE\u5F55",
        "settings.commandsSection": "\u547D\u4EE4\u5217\u8868\uFF08\u5728\u5FEB\u6377\u952E\u8BBE\u7F6E\u4E2D\u7ED1\u5B9A\uFF09",
        "settings.switchModeNotice": "\u5DF2\u5207\u6362\u4E3A{mode}\u6A21\u5F0F\uFF0C\u66F4\u65B0 {count} \u4E2A\u5F15\u7528",
        "status.connected": "Zotero \u5DF2\u8FDE\u63A5 \u2713",
        "status.disconnected": "\u672A\u8FDE\u63A5\uFF08\u8BF7\u786E\u4FDD Zotero \u5DF2\u6253\u5F00\uFF09",
        "lang.zh": "\u4E2D\u6587",
        "lang.en": "English",
        "mode.inline.short": "\u811A\u6CE8",
        "mode.endnote.short": "\u5C3E\u6CE8",
        "mode.inline.label": "\u811A\u6CE8\u6A21\u5F0F",
        "mode.endnote.label": "\u5C3E\u6CE8\u6A21\u5F0F",
        "mode.inline.option": "\u811A\u6CE8\u6A21\u5F0F\uFF08^[\u5F15\u7528\u6587\u672C]\uFF09",
        "mode.endnote.option": "\u5C3E\u6CE8\u6A21\u5F0F\uFF08\u6B63\u6587\u53EA\u663E\u793A\u7F16\u53F7\uFF09",
        "export.dialogTitle": "\u5BFC\u51FA\u4E3A Word",
        "export.filterName": "Word \u6587\u6863",
        "export.pandocFailed": "Pandoc \u5931\u8D25\uFF1A\n{error}",
        "export.pandocMissing": '\u627E\u4E0D\u5230 Pandoc\uFF08"{pandoc}"\uFF09\u3002\n\u8BF7\u5B89\u88C5 Pandoc \u6216\u5728\u8BBE\u7F6E\u4E2D\u586B\u5199\u5B8C\u6574\u8DEF\u5F84\uFF0C\u4F8B\u5982 /opt/homebrew/bin/pandoc',
        "export.chooseLocation": "\u9009\u62E9\u5BFC\u51FA\u4F4D\u7F6E",
        "export.pathHint": "\u8BF7\u8F93\u5165\u8F93\u51FA\u6587\u4EF6\u7684\u5B8C\u6574\u8DEF\u5F84\uFF08\u542B\u6587\u4EF6\u540D\uFF09\uFF0C\u6216\u76F4\u63A5\u4F7F\u7528\u4E0B\u65B9\u5EFA\u8BAE\u8DEF\u5F84\uFF1A",
        "common.cancel": "\u53D6\u6D88",
        "common.export": "\u5BFC\u51FA",
        "common.confirm": "\u786E\u8BA4\u6267\u884C",
        "footnote.fallback": "\u811A\u6CE8 / \u5C3E\u6CE8 {value}",
        "footnote.locatorPlaceholder": "\u9875\u7801 / \u6BB5\u843D",
        "footnote.saveLocator": "\u4FDD\u5B58\u5B9A\u4F4D",
        "footnote.noEditor": "\u627E\u4E0D\u5230\u5F53\u524D\u7F16\u8F91\u5668",
        "footnote.noItem": "\u672A\u80FD\u8BFB\u53D6 Zotero \u6761\u76EE\uFF0C\u6682\u65F6\u65E0\u6CD5\u66F4\u65B0\u5B9A\u4F4D",
        "footnote.updated": "\u811A\u6CE8\u5B9A\u4F4D\u5DF2\u66F4\u65B0",
        "prefs.title": "\u6587\u6863\u9996\u9009\u9879",
        "prefs.styleLabel": "\u5F15\u7528\u6837\u5F0F\uFF1A",
        "prefs.modeLabel": "\u5F15\u7528\u683C\u5F0F\u6A21\u5F0F",
        "prefs.citationCount": "\u5F53\u524D\u6587\u6863\u63D2\u4EF6\u5F15\u7528\u6570\uFF1A",
        "prefs.noDocument": "\uFF08\u65E0\u6D3B\u52A8\u6587\u6863\uFF09",
        "prefs.apply": "\u5E94\u7528\u5230\u6587\u6863",
        "prefs.noEditor": "\u6CA1\u6709\u6D3B\u52A8\u7684\u7F16\u8F91\u5668",
        "prefs.noCitationsToReformat": "\u6837\u5F0F\u5DF2\u66F4\u65B0\uFF0C\u6587\u6863\u4E2D\u6CA1\u6709\u63D2\u4EF6\u5F15\u7528\u9700\u8981\u91CD\u65B0\u683C\u5F0F\u5316\u3002",
        "prefs.fetching": "\u83B7\u53D6\u5F15\u7528\u6570\u636E\u2026",
        "prefs.missingWarning": "\u8B66\u544A\uFF1A\u65E0\u6CD5\u4ECE Zotero \u83B7\u53D6 {count} \u4E2A\u6761\u76EE\uFF08\u53EF\u80FD Zotero \u672A\u8FD0\u884C\uFF09\u3002\u8FD9\u4E9B\u5F15\u7528\u5C06\u4FDD\u6301\u539F\u683C\u5F0F\u3002",
        "prefs.updating": "\u66F4\u65B0\u6587\u6863\u2026",
        "prefs.updated": '\u5DF2\u5C06 {count} \u4E2A\u5F15\u7528\u66F4\u65B0\u4E3A"{style}"\u683C\u5F0F\uFF0C\u5E76\u5207\u6362\u4E3A{mode}\u3002',
        "prefs.zoteroUnavailable": "Zotero \u672A\u8FD0\u884C\u6216\u65E0\u6CD5\u8FDE\u63A5\uFF0C\u8BF7\u786E\u4FDD Zotero \u5DF2\u542F\u52A8\u3002",
        "prefs.updateFailed": "\u66F4\u65B0\u5931\u8D25\uFF1A{error}",
        "prefs.refreshStyles": "\u5237\u65B0\u6837\u5F0F\u5217\u8868",
        "prefs.refreshingStyles": "\u6B63\u5728\u8BFB\u53D6 Zotero \u6837\u5F0F\u2026",
        "prefs.stylesRefreshed": "\u5DF2\u5237\u65B0 {count} \u4E2A\u6837\u5F0F",
        "prefs.searchStylePlaceholder": "\u641C\u7D22\u6837\u5F0F\u2026",
        "search.title": "\u63D2\u5165/\u7F16\u8F91\u5F15\u7528",
        "search.currentStyle": "\u5F53\u524D\u6837\u5F0F\uFF1A{style}",
        "search.placeholder": "\u6309\u6807\u9898\u3001\u4F5C\u8005\u6216\u5E74\u4EFD\u641C\u7D22\u2026",
        "search.enterQuery": "\u8BF7\u5728\u4E0A\u65B9\u8F93\u5165\u641C\u7D22\u8BCD",
        "search.pageLabel": "\u9875\u7801/\u5B9A\u4F4D\u7B26\uFF08\u53EF\u9009\uFF09\uFF1A",
        "search.pagePlaceholder": "\u5982\uFF1A23 \u6216 23\u201325",
        "search.confirm": "\u63D2\u5165\u5F15\u7528",
        "search.searching": "\u641C\u7D22\u4E2D\u2026",
        "search.noResults": "\u672A\u627E\u5230\u5339\u914D\u9879",
        "search.connectionError": "Zotero \u672A\u8FD0\u884C\u6216\u65E0\u6CD5\u8FDE\u63A5\u3002\u8BF7\u786E\u4FDD Zotero \u5DF2\u542F\u52A8\u4E14 Better BibTeX \u5DF2\u5B89\u88C5\u3002",
        "search.failed": "\u641C\u7D22\u5931\u8D25\uFF1A{error}",
        "search.preview": "\u9884\u89C8\uFF1A{preview}",
        "itemType.book": "\u4E66\u7C4D",
        "itemType.bookSection": "\u4E66\u7AE0",
        "itemType.journalArticle": "\u671F\u520A\u6587\u7AE0",
        "itemType.magazineArticle": "\u6742\u5FD7\u6587\u7AE0",
        "itemType.newspaperArticle": "\u62A5\u7EB8\u6587\u7AE0",
        "itemType.thesis": "\u5B66\u4F4D\u8BBA\u6587",
        "itemType.webpage": "\u7F51\u9875",
        "itemType.report": "\u62A5\u544A",
        "itemType.conferencePaper": "\u4F1A\u8BAE\u8BBA\u6587",
        "itemType.patent": "\u4E13\u5229",
        "ribbon.preferences": "Zotero \u6587\u6863\u9996\u9009\u9879",
        "command.insertCitation": "\u63D2\u5165\u5F15\u7528",
        "command.toggleWordDisplay": "\u5207\u6362 Word \u98CE\u683C\u811A\u6CE8\u663E\u793A",
        "command.toggleToolbar": "\u5207\u6362\u6807\u9898\u680F\u529F\u80FD\u533A\u663E\u793A",
        "command.insertBibliography": "\u63D2\u5165\u53C2\u8003\u4E66\u76EE",
        "command.refreshCitations": "\u5237\u65B0\u6240\u6709\u5F15\u7528\uFF08\u4ECE Zotero \u91CD\u65B0\u83B7\u53D6\uFF09",
        "command.exportToWord": "\u5BFC\u51FA\u4E3A Word (.docx)",
        "command.unlinkCitations": "\u89E3\u9664\u5F15\u7528\u94FE\u63A5\uFF08\u79FB\u9664\u63D2\u4EF6\u5143\u6570\u636E\uFF09",
        "command.documentPreferences": "\u6587\u6863\u9996\u9009\u9879\uFF08\u5207\u6362\u5F15\u7528\u6837\u5F0F\uFF09",
        "command.checkPandoc": "\u68C0\u6D4B Pandoc \u662F\u5426\u53EF\u7528",
        "notice.openPicker": "\u6B63\u5728\u6253\u5F00 Zotero \u5F15\u7528\u9009\u62E9\u5668\uFF0C\u8BF7\u5207\u6362\u5230 Zotero \u5B8C\u6210\u9009\u62E9\u2026",
        "notice.connectZoteroFailed": "\u65E0\u6CD5\u8FDE\u63A5 Zotero\u3002\u8BF7\u786E\u4FDD Zotero \u5DF2\u6253\u5F00\u4E14 Better BibTeX \u5DF2\u5B89\u88C5\u3002",
        "notice.nativePickerFallback": "Zotero \u539F\u751F\u5F15\u7528\u9009\u62E9\u5668\u5931\u8D25\uFF0C\u5DF2\u56DE\u9000\u5230\u63D2\u4EF6\u5185\u641C\u7D22\u9762\u677F\u3002",
        "notice.pickerError": "Zotero \u5F15\u7528\u9009\u62E9\u5668\u51FA\u9519\uFF1A{error}",
        "notice.wordDisplayOn": "Word \u98CE\u683C\u811A\u6CE8\u663E\u793A\uFF1A\u5DF2\u5F00\u542F",
        "notice.wordDisplayOff": "Word \u98CE\u683C\u811A\u6CE8\u663E\u793A\uFF1A\u5DF2\u5173\u95ED",
        "notice.noManagedCitations": "\u6587\u6863\u4E2D\u6CA1\u6709\u63D2\u4EF6\u7BA1\u7406\u7684\u5F15\u7528",
        "notice.noBibliography": "\u65E0\u6CD5\u751F\u6210\u53C2\u8003\u4E66\u76EE",
        "notice.bibliographyUpdated": "\u53C2\u8003\u4E66\u76EE\u5DF2\u63D2\u5165/\u66F4\u65B0",
        "bibliography.heading": "\u53C2\u8003\u6587\u732E",
        "notice.cleanedOrphans": "\u5DF2\u6E05\u7406 {count} \u4E2A\u5B64\u7ACB\u5C3E\u6CE8{extra}",
        "notice.cleanedOrphans.extraBib": "\u5E76\u79FB\u9664\u53C2\u8003\u4E66\u76EE",
        "notice.refreshing": "\u6B63\u5728\u4ECE Zotero \u91CD\u65B0\u83B7\u53D6\u5F15\u7528\u6570\u636E\u2026",
        "notice.refreshed": "\u5DF2\u5237\u65B0 {count} \u4E2A\u5F15\u7528{extra}",
        "notice.refreshed.extraOrphans": "\uFF0C\u6E05\u7406 {count} \u4E2A\u5B64\u7ACB\u5C3E\u6CE8",
        "notice.zoteroUnavailable": "Zotero \u672A\u8FD0\u884C\u6216\u65E0\u6CD5\u8FDE\u63A5",
        "notice.refreshFailed": "\u5237\u65B0\u5931\u8D25\uFF1A{error}",
        "notice.openFileBeforeExport": "\u8BF7\u5148\u6253\u5F00\u8981\u5BFC\u51FA\u7684\u6587\u4EF6",
        "notice.exporting": "\u6B63\u5728\u5BFC\u51FA\u4E3A Word\uFF0C\u8BF7\u7A0D\u5019\u2026",
        "notice.exportSuccess": "\u5BFC\u51FA\u6210\u529F\uFF01\n{path}",
        "notice.citationUpdated": "\u5F15\u7528\u5DF2\u66F4\u65B0",
        "notice.insertedCitations": "\u5DF2\u63D2\u5165 {count} \u4E2A\u5F15\u7528",
        "notice.fetchingItems": "\u4ECE Zotero \u83B7\u53D6 {count} \u4E2A\u6761\u76EE\u2026",
        "notice.fetchItemsFailed": "\u83B7\u53D6\u5F15\u7528\u6570\u636E\u5931\u8D25\uFF1A{error}",
        "notice.toolbarShown": "Zotero \u6807\u9898\u680F\u56FE\u6807\u5DF2\u663E\u793A",
        "notice.toolbarHidden": "Zotero \u6807\u9898\u680F\u56FE\u6807\u5DF2\u9690\u85CF",
        "toolbar.export": "\u5BFC\u51FA\u4E3A Word (.docx)",
        "toolbar.unlink": "\u89E3\u9664\u5F15\u7528\u94FE\u63A5",
        "toolbar.changeStyle": "\u4FEE\u6539\u5F15\u7528\u683C\u5F0F",
        "toolbar.refresh": "\u5237\u65B0\u6240\u6709\u5F15\u7528",
        "toolbar.wordDisplay": "\u5207\u6362 Word \u98CE\u683C\u811A\u6CE8\u663E\u793A",
        "toolbar.insertCitation": "\u63D2\u5165\u5F15\u7528",
        "unlink.title": "\u786E\u8BA4\u89E3\u9664\u5F15\u7528\u94FE\u63A5",
        "unlink.message": "\u5C06\u4ECE {total} \u4E2A\u5F15\u7528\u4E2D\u79FB\u9664 Zotero \u5143\u6570\u636E\uFF08\u811A\u6CE8 {inline} \u4E2A + \u5C3E\u6CE8 {endnote} \u4E2A\uFF09\u3002\n\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF08\u4F46\u53EF\u4EE5\u7528 Ctrl+Z \u56DE\u9000\u7F16\u8F91\u5668\u66F4\u6539\uFF09\u3002\n\u786E\u5B9A\u7EE7\u7EED\uFF1F",
        "unlink.done": "\u5DF2\u89E3\u9664 {count} \u4E2A\u5F15\u7528\u7684\u94FE\u63A5"
      },
      en: {
        "settings.interface": "Interface language",
        "settings.interfaceDesc": "Choose the display language for this plugin",
        "settings.connection": "Zotero connection status",
        "settings.checking": "Checking\u2026",
        "settings.recheck": "Check again",
        "settings.citationStyleSection": "Citation styles",
        "settings.defaultStyle": "Default CSL style",
        "settings.defaultStyleDesc": "Style used for newly inserted citations",
        "settings.citationMode": "Citation mode",
        "settings.citationModeDesc": "Footnote mode: ^[citation text]; endnote mode: [^1] plus note definitions at the end of the document",
        "settings.editorDisplaySection": "Editor display",
        "settings.wordDisplay": "Word-style footnote display",
        "settings.wordDisplayDesc": "When enabled, footnote markers in the editor and preview are shown as superscript numbers; hover a number to view the full footnote or endnote.",
        "settings.showToolbar": "Show title bar action icons",
        "settings.showToolbarDesc": "Show Zotero quick-action icons in the Markdown title bar alongside back, forward, and more options.",
        "settings.toolbarButtonsSection": "Title bar buttons",
        "settings.toolbarButtonsDesc": "Independently control the visibility of each title bar button",
        "settings.toolbarBtn.export": "Export to Word",
        "settings.toolbarBtn.unlink": "Unlink citations",
        "settings.toolbarBtn.changeStyle": "Change citation style",
        "settings.toolbarBtn.refresh": "Refresh all citations",
        "settings.toolbarBtn.wordDisplay": "Toggle Word-style footnotes",
        "settings.toolbarBtn.insertCitation": "Insert citation",
        "settings.exportSection": "Pandoc export",
        "settings.pandocPath": "Pandoc executable path",
        "settings.pandocPathDesc": "Default: pandoc in PATH. Otherwise enter the full executable path.",
        "settings.pandocFlags": "Extra Pandoc flags",
        "settings.pandocFlagsDesc": "Appended to the export command, e.g. --reference-doc=template.docx",
        "settings.useDefaultExportDir": "Use a fixed export directory",
        "settings.useDefaultExportDirDesc": "When off, a path picker is shown every time you export.",
        "settings.defaultExportDir": "Default export directory",
        "settings.defaultExportDirDesc": "Leave empty to use the source file's directory",
        "settings.commandsSection": "Command list (bind these in Hotkeys)",
        "settings.switchModeNotice": "Switched to {mode} mode and updated {count} citations",
        "status.connected": "Zotero connected \u2713",
        "status.disconnected": "Not connected (make sure Zotero is running)",
        "lang.zh": "\u4E2D\u6587",
        "lang.en": "English",
        "mode.inline.short": "Footnote",
        "mode.endnote.short": "Endnote",
        "mode.inline.label": "Footnote mode",
        "mode.endnote.label": "Endnote mode",
        "mode.inline.option": "Footnote mode (^[citation text])",
        "mode.endnote.option": "Endnote mode (number only in the main text)",
        "export.dialogTitle": "Export to Word",
        "export.filterName": "Word document",
        "export.pandocFailed": "Pandoc failed:\n{error}",
        "export.pandocMissing": 'Pandoc ("{pandoc}") was not found.\nInstall Pandoc or set the full executable path in settings, for example /opt/homebrew/bin/pandoc',
        "export.chooseLocation": "Choose export location",
        "export.pathHint": "Enter the full output path, including the filename, or use the suggested path below:",
        "common.cancel": "Cancel",
        "common.export": "Export",
        "common.confirm": "Confirm",
        "footnote.fallback": "Footnote / Endnote {value}",
        "footnote.locatorPlaceholder": "Page / locator",
        "footnote.saveLocator": "Save locator",
        "footnote.noEditor": "Could not find the active editor",
        "footnote.noItem": "Could not read the Zotero item, so the locator could not be updated right now",
        "footnote.updated": "Footnote locator updated",
        "prefs.title": "Document preferences",
        "prefs.styleLabel": "Citation style:",
        "prefs.modeLabel": "Citation mode",
        "prefs.citationCount": "Plugin-managed citations in the current document:",
        "prefs.noDocument": "(No active document)",
        "prefs.apply": "Apply to document",
        "prefs.noEditor": "No active editor",
        "prefs.noCitationsToReformat": "The style was updated, but this document has no plugin-managed citations to reformat.",
        "prefs.fetching": "Fetching citation data\u2026",
        "prefs.missingWarning": "Warning: could not fetch {count} items from Zotero (perhaps Zotero is not running). Those citations will keep their current formatting.",
        "prefs.updating": "Updating document\u2026",
        "prefs.updated": 'Updated {count} citations to "{style}" and switched to {mode}.',
        "prefs.zoteroUnavailable": "Zotero is not running or could not be reached. Make sure Zotero is open.",
        "prefs.updateFailed": "Update failed: {error}",
        "prefs.refreshStyles": "Refresh style list",
        "prefs.refreshingStyles": "Reading Zotero styles\u2026",
        "prefs.stylesRefreshed": "Refreshed {count} styles",
        "prefs.searchStylePlaceholder": "Search styles\u2026",
        "search.title": "Insert/edit citation",
        "search.currentStyle": "Current style: {style}",
        "search.placeholder": "Search by title, author, or year\u2026",
        "search.enterQuery": "Enter a search term above",
        "search.pageLabel": "Page / locator (optional):",
        "search.pagePlaceholder": "e.g. 23 or 23\u201325",
        "search.confirm": "Insert citation",
        "search.searching": "Searching\u2026",
        "search.noResults": "No matches found",
        "search.connectionError": "Zotero is not running or could not be reached. Make sure Zotero is open and Better BibTeX is installed.",
        "search.failed": "Search failed: {error}",
        "search.preview": "Preview: {preview}",
        "itemType.book": "Book",
        "itemType.bookSection": "Book section",
        "itemType.journalArticle": "Journal article",
        "itemType.magazineArticle": "Magazine article",
        "itemType.newspaperArticle": "Newspaper article",
        "itemType.thesis": "Thesis",
        "itemType.webpage": "Webpage",
        "itemType.report": "Report",
        "itemType.conferencePaper": "Conference paper",
        "itemType.patent": "Patent",
        "ribbon.preferences": "Zotero document preferences",
        "command.insertCitation": "Insert citation",
        "command.toggleWordDisplay": "Toggle Word-style footnote display",
        "command.toggleToolbar": "Toggle title bar actions",
        "command.insertBibliography": "Insert bibliography",
        "command.refreshCitations": "Refresh all citations (re-fetch from Zotero)",
        "command.exportToWord": "Export to Word (.docx)",
        "command.unlinkCitations": "Unlink citations (remove plugin metadata)",
        "command.documentPreferences": "Document preferences (change citation style)",
        "command.checkPandoc": "Check whether Pandoc is available",
        "notice.openPicker": "Opening the Zotero citation picker. Switch to Zotero to finish your selection\u2026",
        "notice.connectZoteroFailed": "Could not connect to Zotero. Make sure Zotero is open and Better BibTeX is installed.",
        "notice.nativePickerFallback": "The native Zotero citation picker failed. Falling back to the in-plugin search panel.",
        "notice.pickerError": "Zotero citation picker error: {error}",
        "notice.wordDisplayOn": "Word-style footnote display: on",
        "notice.wordDisplayOff": "Word-style footnote display: off",
        "notice.noManagedCitations": "No plugin-managed citations were found in this document",
        "notice.noBibliography": "Could not generate a bibliography",
        "notice.bibliographyUpdated": "Bibliography inserted/updated",
        "bibliography.heading": "References",
        "notice.cleanedOrphans": "Cleaned up {count} orphan endnotes{extra}",
        "notice.cleanedOrphans.extraBib": " and removed the bibliography",
        "notice.refreshing": "Re-fetching citation data from Zotero\u2026",
        "notice.refreshed": "Refreshed {count} citations{extra}",
        "notice.refreshed.extraOrphans": "; cleaned up {count} orphan endnotes",
        "notice.zoteroUnavailable": "Zotero is not running or could not be reached",
        "notice.refreshFailed": "Refresh failed: {error}",
        "notice.openFileBeforeExport": "Open the file you want to export first",
        "notice.exporting": "Exporting to Word, please wait\u2026",
        "notice.exportSuccess": "Export successful!\n{path}",
        "notice.citationUpdated": "Citation updated",
        "notice.insertedCitations": "Inserted {count} citations",
        "notice.fetchingItems": "Fetching {count} items from Zotero\u2026",
        "notice.fetchItemsFailed": "Failed to fetch citation data: {error}",
        "notice.toolbarShown": "Zotero title bar actions are now shown",
        "notice.toolbarHidden": "Zotero title bar actions are now hidden",
        "toolbar.export": "Export to Word (.docx)",
        "toolbar.unlink": "Unlink citations",
        "toolbar.changeStyle": "Change citation style",
        "toolbar.refresh": "Refresh all citations",
        "toolbar.wordDisplay": "Toggle Word-style footnote display",
        "toolbar.insertCitation": "Insert citation",
        "unlink.title": "Confirm unlink citations",
        "unlink.message": "Remove Zotero metadata from {total} citations (footnotes: {inline}, endnotes: {endnote}).\nThis cannot be undone, though you can still use Undo in the editor.\nContinue?",
        "unlink.done": "Unlinked {count} citations"
      }
    };
  }
});

// src/settings.ts
function getStyleName(styleId, settingsOrLang) {
  const lang = typeof settingsOrLang === "string" ? settingsOrLang : getLanguage(settingsOrLang);
  const style = CSL_STYLES.find((s) => s.id === styleId);
  if (!style)
    return styleId;
  return lang === "en" ? style.en : style.zh;
}
function getModeLabel(mode, settingsOrLang, variant = "option") {
  return t(settingsOrLang, `mode.${mode}.${variant}`);
}
function getItemTypeLabel(itemType, settingsOrLang) {
  return t(settingsOrLang, `itemType.${itemType}`);
}
var import_obsidian, CSL_STYLES, DEFAULT_SETTINGS, ZoteroSettingTab;
var init_settings = __esm({
  "src/settings.ts"() {
    import_obsidian = require("obsidian");
    init_i18n();
    init_CitationManager();
    CSL_STYLES = [
      { id: "chicago-note-bibliography", zh: "Chicago 17th\uFF08\u6CE8\u91CA-\u4E66\u76EE\uFF09", en: "Chicago 17th (Notes-Bibliography)" },
      { id: "chicago-author-date", zh: "Chicago 17th\uFF08\u8457\u8005-\u51FA\u7248\u5E74\uFF09", en: "Chicago 17th (Author-Date)" },
      { id: "apa", zh: "APA \u7B2C7\u7248", en: "APA 7th Edition" },
      { id: "modern-language-association", zh: "MLA \u7B2C9\u7248", en: "MLA 9th Edition" },
      { id: "vancouver", zh: "Vancouver", en: "Vancouver" },
      { id: "gb-t-7714-2015-numeric", zh: "GB/T 7714-2015\uFF08\u987A\u5E8F\u7F16\u7801\uFF09", en: "GB/T 7714-2015 (Numeric)" },
      { id: "gb-t-7714-2015-author-date", zh: "GB/T 7714-2015\uFF08\u8457\u8005-\u51FA\u7248\u5E74\uFF09", en: "GB/T 7714-2015 (Author-Date)" },
      { id: "oscola", zh: "OSCOLA", en: "OSCOLA" },
      { id: "harvard-cite-them-right", zh: "Harvard", en: "Harvard Cite Them Right" },
      { id: "ieee", zh: "IEEE", en: "IEEE" }
    ];
    DEFAULT_SETTINGS = {
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
        insertCitation: true
      },
      pandocPath: "pandoc",
      pandocFlags: "",
      useDefaultExportDir: false,
      exportOutputDir: "",
      zoteroPort: 23119,
      language: "zh"
    };
    ZoteroSettingTab = class extends import_obsidian.PluginSettingTab {
      constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
      }
      display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Zotero Citations" });
        containerEl.createEl("h3", { text: t(this.plugin.settings, "settings.interface") });
        new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settings.interface")).setDesc(t(this.plugin.settings, "settings.interfaceDesc")).addDropdown((dd) => {
          dd.addOption("zh", t(this.plugin.settings, "lang.zh"));
          dd.addOption("en", t(this.plugin.settings, "lang.en"));
          dd.setValue(getLanguage(this.plugin.settings));
          dd.onChange(async (v) => {
            this.plugin.settings.language = v === "en" ? "en" : "zh";
            await this.plugin.saveSettings();
            this.plugin.applyLanguage();
            this.display();
          });
        });
        containerEl.createEl("h3", { text: t(this.plugin.settings, "settings.connection") });
        const row = containerEl.createDiv({ cls: "zotero-status-row" });
        this.statusDot = row.createSpan({ cls: "zotero-status-dot zotero-status-unknown" });
        this.statusText = row.createSpan({ text: t(this.plugin.settings, "settings.checking") });
        const btn = containerEl.createEl("button", { text: t(this.plugin.settings, "settings.recheck") });
        btn.style.marginTop = "4px";
        btn.addEventListener("click", () => this.checkConnection());
        this.checkConnection();
        containerEl.createEl("h3", { text: t(this.plugin.settings, "settings.citationStyleSection") });
        new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settings.defaultStyle")).setDesc(t(this.plugin.settings, "settings.defaultStyleDesc")).addDropdown((dd) => {
          for (const s of CSL_STYLES)
            dd.addOption(s.id, getStyleName(s.id, this.plugin.settings));
          dd.setValue(this.plugin.settings.cslStyle);
          dd.onChange(async (v) => {
            this.plugin.settings.cslStyle = v;
            await this.plugin.saveSettings();
          });
        });
        new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settings.citationMode")).setDesc(t(this.plugin.settings, "settings.citationModeDesc")).addDropdown((dd) => {
          dd.addOption("endnote", getModeLabel("endnote", this.plugin.settings, "option"));
          dd.addOption("inline", getModeLabel("inline", this.plugin.settings, "option"));
          dd.setValue(this.plugin.settings.citationMode);
          dd.onChange(async (v) => {
            this.plugin.settings.citationMode = v;
            await this.plugin.saveSettings();
            const editor = this.plugin.getEditor();
            if (!editor)
              return;
            const content = editor.getValue();
            const all = CitationManager.parseAllCitations(content);
            if (!all.length) {
              this.plugin.refreshEditorExtension();
              return;
            }
            const keys = [...new Set(all.map((c) => c.key))];
            const itemMap = await this.plugin.resolveItems(keys);
            if (!itemMap)
              return;
            const count = CitationManager.refreshDocument(editor, itemMap, this.plugin.settings.cslStyle, v);
            this.plugin.refreshEditorExtension();
            new import_obsidian.Notice(t(this.plugin.settings, "settings.switchModeNotice", {
              mode: getModeLabel(v, this.plugin.settings, "short"),
              count
            }));
          });
        });
        containerEl.createEl("h3", { text: t(this.plugin.settings, "settings.editorDisplaySection") });
        new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settings.wordDisplay")).setDesc(t(this.plugin.settings, "settings.wordDisplayDesc")).addToggle((toggle) => {
          toggle.setValue(this.plugin.settings.showWordStyleFootnotes);
          toggle.onChange(async (v) => {
            this.plugin.settings.showWordStyleFootnotes = v;
            await this.plugin.saveSettings();
            this.plugin.refreshEditorExtension();
          });
        });
        new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settings.showToolbar")).setDesc(t(this.plugin.settings, "settings.showToolbarDesc")).addToggle((toggle) => {
          toggle.setValue(this.plugin.settings.showToolbar);
          toggle.onChange(async (v) => {
            this.plugin.settings.showToolbar = v;
            await this.plugin.saveSettings();
            this.plugin.refreshToolbars();
            this.display();
          });
        });
        if (this.plugin.settings.showToolbar) {
          const toolbarSection = containerEl.createDiv({ cls: "zotero-toolbar-buttons-section" });
          toolbarSection.style.paddingLeft = "24px";
          toolbarSection.style.borderLeft = "2px solid var(--background-modifier-border)";
          toolbarSection.style.marginLeft = "12px";
          toolbarSection.style.marginBottom = "12px";
          const buttonKeys = [
            { key: "export", labelKey: "settings.toolbarBtn.export" },
            { key: "unlink", labelKey: "settings.toolbarBtn.unlink" },
            { key: "changeStyle", labelKey: "settings.toolbarBtn.changeStyle" },
            { key: "refresh", labelKey: "settings.toolbarBtn.refresh" },
            { key: "wordDisplay", labelKey: "settings.toolbarBtn.wordDisplay" },
            { key: "insertCitation", labelKey: "settings.toolbarBtn.insertCitation" }
          ];
          for (const { key, labelKey } of buttonKeys) {
            new import_obsidian.Setting(toolbarSection).setName(t(this.plugin.settings, labelKey)).addToggle((toggle) => {
              toggle.setValue(this.plugin.settings.toolbarButtons[key]);
              toggle.onChange(async (v) => {
                this.plugin.settings.toolbarButtons[key] = v;
                await this.plugin.saveSettings();
                this.plugin.refreshToolbars();
              });
            });
          }
        }
        containerEl.createEl("h3", { text: t(this.plugin.settings, "settings.exportSection") });
        new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settings.pandocPath")).setDesc(t(this.plugin.settings, "settings.pandocPathDesc")).addText(
          (text) => text.setPlaceholder("pandoc").setValue(this.plugin.settings.pandocPath).onChange(async (v) => {
            this.plugin.settings.pandocPath = v.trim() || "pandoc";
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settings.pandocFlags")).setDesc(t(this.plugin.settings, "settings.pandocFlagsDesc")).addText(
          (text) => text.setPlaceholder("").setValue(this.plugin.settings.pandocFlags).onChange(async (v) => {
            this.plugin.settings.pandocFlags = v.trim();
            await this.plugin.saveSettings();
          })
        );
        new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settings.useDefaultExportDir")).setDesc(t(this.plugin.settings, "settings.useDefaultExportDirDesc")).addToggle((toggle) => {
          toggle.setValue(this.plugin.settings.useDefaultExportDir);
          toggle.onChange(async (v) => {
            this.plugin.settings.useDefaultExportDir = v;
            await this.plugin.saveSettings();
            this.display();
          });
        });
        if (this.plugin.settings.useDefaultExportDir) {
          new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settings.defaultExportDir")).setDesc(t(this.plugin.settings, "settings.defaultExportDirDesc")).addText(
            (text) => text.setPlaceholder("/Users/you/Documents").setValue(this.plugin.settings.exportOutputDir).onChange(async (v) => {
              this.plugin.settings.exportOutputDir = v.trim();
              await this.plugin.saveSettings();
            })
          );
        }
        containerEl.createEl("h3", { text: t(this.plugin.settings, "settings.commandsSection") });
        const cmds = Object.values(this.plugin.getCommandLabels());
        const ul = containerEl.createEl("ul");
        for (const c of cmds) {
          const li = ul.createEl("li", { text: c });
          li.style.color = "var(--text-muted)";
        }
      }
      async checkConnection() {
        this.statusDot.className = "zotero-status-dot zotero-status-unknown";
        this.statusText.textContent = t(this.plugin.settings, "settings.checking");
        try {
          const r = await (0, import_obsidian.requestUrl)({
            url: `http://127.0.0.1:${this.plugin.settings.zoteroPort}/connector/ping`,
            method: "GET",
            throw: false
          });
          if (r.status === 200) {
            this.statusDot.className = "zotero-status-dot zotero-status-ok";
            this.statusText.textContent = t(this.plugin.settings, "status.connected");
          } else
            throw new Error();
        } catch (e) {
          this.statusDot.className = "zotero-status-dot zotero-status-err";
          this.statusText.textContent = t(this.plugin.settings, "status.disconnected");
        }
      }
    };
  }
});

// node_modules/process-nextick-args/index.js
var require_process_nextick_args = __commonJS({
  "node_modules/process-nextick-args/index.js"(exports2, module2) {
    "use strict";
    if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
      module2.exports = { nextTick };
    } else {
      module2.exports = process;
    }
    function nextTick(fn, arg1, arg2, arg3) {
      if (typeof fn !== "function") {
        throw new TypeError('"callback" argument must be a function');
      }
      var len = arguments.length;
      var args, i;
      switch (len) {
        case 0:
        case 1:
          return process.nextTick(fn);
        case 2:
          return process.nextTick(function afterTickOne() {
            fn.call(null, arg1);
          });
        case 3:
          return process.nextTick(function afterTickTwo() {
            fn.call(null, arg1, arg2);
          });
        case 4:
          return process.nextTick(function afterTickThree() {
            fn.call(null, arg1, arg2, arg3);
          });
        default:
          args = new Array(len - 1);
          i = 0;
          while (i < args.length) {
            args[i++] = arguments[i];
          }
          return process.nextTick(function afterTick() {
            fn.apply(null, args);
          });
      }
    }
  }
});

// node_modules/isarray/index.js
var require_isarray = __commonJS({
  "node_modules/isarray/index.js"(exports2, module2) {
    var toString = {}.toString;
    module2.exports = Array.isArray || function(arr) {
      return toString.call(arr) == "[object Array]";
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/stream.js
var require_stream = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/stream.js"(exports2, module2) {
    module2.exports = require("stream");
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/core-util-is/lib/util.js
var require_util = __commonJS({
  "node_modules/core-util-is/lib/util.js"(exports2) {
    function isArray(arg) {
      if (Array.isArray) {
        return Array.isArray(arg);
      }
      return objectToString(arg) === "[object Array]";
    }
    exports2.isArray = isArray;
    function isBoolean(arg) {
      return typeof arg === "boolean";
    }
    exports2.isBoolean = isBoolean;
    function isNull(arg) {
      return arg === null;
    }
    exports2.isNull = isNull;
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports2.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
      return typeof arg === "number";
    }
    exports2.isNumber = isNumber;
    function isString(arg) {
      return typeof arg === "string";
    }
    exports2.isString = isString;
    function isSymbol(arg) {
      return typeof arg === "symbol";
    }
    exports2.isSymbol = isSymbol;
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports2.isUndefined = isUndefined;
    function isRegExp(re) {
      return objectToString(re) === "[object RegExp]";
    }
    exports2.isRegExp = isRegExp;
    function isObject(arg) {
      return typeof arg === "object" && arg !== null;
    }
    exports2.isObject = isObject;
    function isDate(d) {
      return objectToString(d) === "[object Date]";
    }
    exports2.isDate = isDate;
    function isError(e) {
      return objectToString(e) === "[object Error]" || e instanceof Error;
    }
    exports2.isError = isError;
    function isFunction(arg) {
      return typeof arg === "function";
    }
    exports2.isFunction = isFunction;
    function isPrimitive(arg) {
      return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
      typeof arg === "undefined";
    }
    exports2.isPrimitive = isPrimitive;
    exports2.isBuffer = require("buffer").Buffer.isBuffer;
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
  }
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/inherits/inherits_browser.js"(exports2, module2) {
    if (typeof Object.create === "function") {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "node_modules/inherits/inherits.js"(exports2, module2) {
    try {
      util = require("util");
      if (typeof util.inherits !== "function")
        throw "";
      module2.exports = util.inherits;
    } catch (e) {
      module2.exports = require_inherits_browser();
    }
    var util;
  }
});

// node_modules/readable-stream/lib/internal/streams/BufferList.js
var require_BufferList = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/BufferList.js"(exports2, module2) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Buffer2 = require_safe_buffer().Buffer;
    var util = require("util");
    function copyBuffer(src, target, offset) {
      src.copy(target, offset);
    }
    module2.exports = function() {
      function BufferList() {
        _classCallCheck(this, BufferList);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      BufferList.prototype.push = function push(v) {
        var entry = { data: v, next: null };
        if (this.length > 0)
          this.tail.next = entry;
        else
          this.head = entry;
        this.tail = entry;
        ++this.length;
      };
      BufferList.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head };
        if (this.length === 0)
          this.tail = entry;
        this.head = entry;
        ++this.length;
      };
      BufferList.prototype.shift = function shift() {
        if (this.length === 0)
          return;
        var ret = this.head.data;
        if (this.length === 1)
          this.head = this.tail = null;
        else
          this.head = this.head.next;
        --this.length;
        return ret;
      };
      BufferList.prototype.clear = function clear() {
        this.head = this.tail = null;
        this.length = 0;
      };
      BufferList.prototype.join = function join2(s) {
        if (this.length === 0)
          return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) {
          ret += s + p.data;
        }
        return ret;
      };
      BufferList.prototype.concat = function concat(n) {
        if (this.length === 0)
          return Buffer2.alloc(0);
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      };
      return BufferList;
    }();
    if (util && util.inspect && util.inspect.custom) {
      module2.exports.prototype[util.inspect.custom] = function() {
        var obj = util.inspect({ length: this.length });
        return this.constructor.name + " " + obj;
      };
    }
  }
});

// node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/destroy.js"(exports2, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    function destroy(err, cb) {
      var _this = this;
      var readableDestroyed = this._readableState && this._readableState.destroyed;
      var writableDestroyed = this._writableState && this._writableState.destroyed;
      if (readableDestroyed || writableDestroyed) {
        if (cb) {
          cb(err);
        } else if (err) {
          if (!this._writableState) {
            pna.nextTick(emitErrorNT, this, err);
          } else if (!this._writableState.errorEmitted) {
            this._writableState.errorEmitted = true;
            pna.nextTick(emitErrorNT, this, err);
          }
        }
        return this;
      }
      if (this._readableState) {
        this._readableState.destroyed = true;
      }
      if (this._writableState) {
        this._writableState.destroyed = true;
      }
      this._destroy(err || null, function(err2) {
        if (!cb && err2) {
          if (!_this._writableState) {
            pna.nextTick(emitErrorNT, _this, err2);
          } else if (!_this._writableState.errorEmitted) {
            _this._writableState.errorEmitted = true;
            pna.nextTick(emitErrorNT, _this, err2);
          }
        } else if (cb) {
          cb(err2);
        }
      });
      return this;
    }
    function undestroy() {
      if (this._readableState) {
        this._readableState.destroyed = false;
        this._readableState.reading = false;
        this._readableState.ended = false;
        this._readableState.endEmitted = false;
      }
      if (this._writableState) {
        this._writableState.destroyed = false;
        this._writableState.ended = false;
        this._writableState.ending = false;
        this._writableState.finalCalled = false;
        this._writableState.prefinished = false;
        this._writableState.finished = false;
        this._writableState.errorEmitted = false;
      }
    }
    function emitErrorNT(self2, err) {
      self2.emit("error", err);
    }
    module2.exports = {
      destroy,
      undestroy
    };
  }
});

// node_modules/util-deprecate/node.js
var require_node = __commonJS({
  "node_modules/util-deprecate/node.js"(exports2, module2) {
    module2.exports = require("util").deprecate;
  }
});

// node_modules/readable-stream/lib/_stream_writable.js
var require_stream_writable = __commonJS({
  "node_modules/readable-stream/lib/_stream_writable.js"(exports2, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    module2.exports = Writable;
    function CorkedRequest(state) {
      var _this = this;
      this.next = null;
      this.entry = null;
      this.finish = function() {
        onCorkedFinish(_this, state);
      };
    }
    var asyncWrite = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
    var Duplex;
    Writable.WritableState = WritableState;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var internalUtil = {
      deprecate: require_node()
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer().Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var destroyImpl = require_destroy();
    util.inherits(Writable, Stream);
    function nop() {
    }
    function WritableState(options, stream) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex)
        this.objectMode = this.objectMode || !!options.writableObjectMode;
      var hwm = options.highWaterMark;
      var writableHwm = options.writableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0)
        this.highWaterMark = hwm;
      else if (isDuplex && (writableHwm || writableHwm === 0))
        this.highWaterMark = writableHwm;
      else
        this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      var noDecode = options.decodeStrings === false;
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = function(er) {
        onwrite(stream, er);
      };
      this.writecb = null;
      this.writelen = 0;
      this.bufferedRequest = null;
      this.lastBufferedRequest = null;
      this.pendingcb = 0;
      this.prefinished = false;
      this.errorEmitted = false;
      this.bufferedRequestCount = 0;
      this.corkedRequestsFree = new CorkedRequest(this);
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      var current = this.bufferedRequest;
      var out = [];
      while (current) {
        out.push(current);
        current = current.next;
      }
      return out;
    };
    (function() {
      try {
        Object.defineProperty(WritableState.prototype, "buffer", {
          get: internalUtil.deprecate(function() {
            return this.getBuffer();
          }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
        });
      } catch (_) {
      }
    })();
    var realHasInstance;
    if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
      realHasInstance = Function.prototype[Symbol.hasInstance];
      Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function(object) {
          if (realHasInstance.call(this, object))
            return true;
          if (this !== Writable)
            return false;
          return object && object._writableState instanceof WritableState;
        }
      });
    } else {
      realHasInstance = function(object) {
        return object instanceof this;
      };
    }
    function Writable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
        return new Writable(options);
      }
      this._writableState = new WritableState(options, this);
      this.writable = true;
      if (options) {
        if (typeof options.write === "function")
          this._write = options.write;
        if (typeof options.writev === "function")
          this._writev = options.writev;
        if (typeof options.destroy === "function")
          this._destroy = options.destroy;
        if (typeof options.final === "function")
          this._final = options.final;
      }
      Stream.call(this);
    }
    Writable.prototype.pipe = function() {
      this.emit("error", new Error("Cannot pipe, not readable"));
    };
    function writeAfterEnd(stream, cb) {
      var er = new Error("write after end");
      stream.emit("error", er);
      pna.nextTick(cb, er);
    }
    function validChunk(stream, state, chunk, cb) {
      var valid = true;
      var er = false;
      if (chunk === null) {
        er = new TypeError("May not write null values to stream");
      } else if (typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      if (er) {
        stream.emit("error", er);
        pna.nextTick(cb, er);
        valid = false;
      }
      return valid;
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      var state = this._writableState;
      var ret = false;
      var isBuf = !state.objectMode && _isUint8Array(chunk);
      if (isBuf && !Buffer2.isBuffer(chunk)) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (isBuf)
        encoding = "buffer";
      else if (!encoding)
        encoding = state.defaultEncoding;
      if (typeof cb !== "function")
        cb = nop;
      if (state.ended)
        writeAfterEnd(this, cb);
      else if (isBuf || validChunk(this, state, chunk, cb)) {
        state.pendingcb++;
        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
      }
      return ret;
    };
    Writable.prototype.cork = function() {
      var state = this._writableState;
      state.corked++;
    };
    Writable.prototype.uncork = function() {
      var state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest)
          clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string")
        encoding = encoding.toLowerCase();
      if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1))
        throw new TypeError("Unknown encoding: " + encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    function decodeChunk(state, chunk, encoding) {
      if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
        chunk = Buffer2.from(chunk, encoding);
      }
      return chunk;
    }
    Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
      if (!isBuf) {
        var newChunk = decodeChunk(state, chunk, encoding);
        if (chunk !== newChunk) {
          isBuf = true;
          encoding = "buffer";
          chunk = newChunk;
        }
      }
      var len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      var ret = state.length < state.highWaterMark;
      if (!ret)
        state.needDrain = true;
      if (state.writing || state.corked) {
        var last = state.lastBufferedRequest;
        state.lastBufferedRequest = {
          chunk,
          encoding,
          isBuf,
          callback: cb,
          next: null
        };
        if (last) {
          last.next = state.lastBufferedRequest;
        } else {
          state.bufferedRequest = state.lastBufferedRequest;
        }
        state.bufferedRequestCount += 1;
      } else {
        doWrite(stream, state, false, len, chunk, encoding, cb);
      }
      return ret;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (writev)
        stream._writev(chunk, state.onwrite);
      else
        stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, sync, er, cb) {
      --state.pendingcb;
      if (sync) {
        pna.nextTick(cb, er);
        pna.nextTick(finishMaybe, stream, state);
        stream._writableState.errorEmitted = true;
        stream.emit("error", er);
      } else {
        cb(er);
        stream._writableState.errorEmitted = true;
        stream.emit("error", er);
        finishMaybe(stream, state);
      }
    }
    function onwriteStateUpdate(state) {
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
    }
    function onwrite(stream, er) {
      var state = stream._writableState;
      var sync = state.sync;
      var cb = state.writecb;
      onwriteStateUpdate(state);
      if (er)
        onwriteError(stream, state, sync, er, cb);
      else {
        var finished = needFinish(state);
        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
          clearBuffer(stream, state);
        }
        if (sync) {
          asyncWrite(afterWrite, stream, state, finished, cb);
        } else {
          afterWrite(stream, state, finished, cb);
        }
      }
    }
    function afterWrite(stream, state, finished, cb) {
      if (!finished)
        onwriteDrain(stream, state);
      state.pendingcb--;
      cb();
      finishMaybe(stream, state);
    }
    function onwriteDrain(stream, state) {
      if (state.length === 0 && state.needDrain) {
        state.needDrain = false;
        stream.emit("drain");
      }
    }
    function clearBuffer(stream, state) {
      state.bufferProcessing = true;
      var entry = state.bufferedRequest;
      if (stream._writev && entry && entry.next) {
        var l = state.bufferedRequestCount;
        var buffer = new Array(l);
        var holder = state.corkedRequestsFree;
        holder.entry = entry;
        var count = 0;
        var allBuffers = true;
        while (entry) {
          buffer[count] = entry;
          if (!entry.isBuf)
            allBuffers = false;
          entry = entry.next;
          count += 1;
        }
        buffer.allBuffers = allBuffers;
        doWrite(stream, state, true, state.length, buffer, "", holder.finish);
        state.pendingcb++;
        state.lastBufferedRequest = null;
        if (holder.next) {
          state.corkedRequestsFree = holder.next;
          holder.next = null;
        } else {
          state.corkedRequestsFree = new CorkedRequest(state);
        }
        state.bufferedRequestCount = 0;
      } else {
        while (entry) {
          var chunk = entry.chunk;
          var encoding = entry.encoding;
          var cb = entry.callback;
          var len = state.objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, cb);
          entry = entry.next;
          state.bufferedRequestCount--;
          if (state.writing) {
            break;
          }
        }
        if (entry === null)
          state.lastBufferedRequest = null;
      }
      state.bufferedRequest = entry;
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      cb(new Error("_write() is not implemented"));
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      var state = this._writableState;
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (chunk !== null && chunk !== void 0)
        this.write(chunk, encoding);
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (!state.ending)
        endWritable(this, state, cb);
    };
    function needFinish(state) {
      return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
    }
    function callFinal(stream, state) {
      stream._final(function(err) {
        state.pendingcb--;
        if (err) {
          stream.emit("error", err);
        }
        state.prefinished = true;
        stream.emit("prefinish");
        finishMaybe(stream, state);
      });
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === "function") {
          state.pendingcb++;
          state.finalCalled = true;
          pna.nextTick(callFinal, stream, state);
        } else {
          state.prefinished = true;
          stream.emit("prefinish");
        }
      }
    }
    function finishMaybe(stream, state) {
      var need = needFinish(state);
      if (need) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          state.finished = true;
          stream.emit("finish");
        }
      }
      return need;
    }
    function endWritable(stream, state, cb) {
      state.ending = true;
      finishMaybe(stream, state);
      if (cb) {
        if (state.finished)
          pna.nextTick(cb);
        else
          stream.once("finish", cb);
      }
      state.ended = true;
      stream.writable = false;
    }
    function onCorkedFinish(corkReq, state, err) {
      var entry = corkReq.entry;
      corkReq.entry = null;
      while (entry) {
        var cb = entry.callback;
        state.pendingcb--;
        cb(err);
        entry = entry.next;
      }
      state.corkedRequestsFree.next = corkReq;
    }
    Object.defineProperty(Writable.prototype, "destroyed", {
      get: function() {
        if (this._writableState === void 0) {
          return false;
        }
        return this._writableState.destroyed;
      },
      set: function(value) {
        if (!this._writableState) {
          return;
        }
        this._writableState.destroyed = value;
      }
    });
    Writable.prototype.destroy = destroyImpl.destroy;
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      this.end();
      cb(err);
    };
  }
});

// node_modules/readable-stream/lib/_stream_duplex.js
var require_stream_duplex = __commonJS({
  "node_modules/readable-stream/lib/_stream_duplex.js"(exports2, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    var objectKeys = Object.keys || function(obj) {
      var keys2 = [];
      for (var key in obj) {
        keys2.push(key);
      }
      return keys2;
    };
    module2.exports = Duplex;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var Readable = require_stream_readable();
    var Writable = require_stream_writable();
    util.inherits(Duplex, Readable);
    {
      keys = objectKeys(Writable.prototype);
      for (v = 0; v < keys.length; v++) {
        method = keys[v];
        if (!Duplex.prototype[method])
          Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    var keys;
    var method;
    var v;
    function Duplex(options) {
      if (!(this instanceof Duplex))
        return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      if (options && options.readable === false)
        this.readable = false;
      if (options && options.writable === false)
        this.writable = false;
      this.allowHalfOpen = true;
      if (options && options.allowHalfOpen === false)
        this.allowHalfOpen = false;
      this.once("end", onend);
    }
    Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function onend() {
      if (this.allowHalfOpen || this._writableState.ended)
        return;
      pna.nextTick(onEndNT, this);
    }
    function onEndNT(self2) {
      self2.end();
    }
    Object.defineProperty(Duplex.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
      },
      set: function(value) {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return;
        }
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
      }
    });
    Duplex.prototype._destroy = function(err, cb) {
      this.push(null);
      this.end();
      pna.nextTick(cb, err);
    };
  }
});

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "node_modules/string_decoder/lib/string_decoder.js"(exports2) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var isEncoding = Buffer2.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc)
        return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried)
              return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
        throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports2.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer2.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0)
        return "";
      var r;
      var i;
      if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0)
          return "";
        i = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i = 0;
      }
      if (i < buf.length)
        return r ? r + this.text(buf, i) : this.text(buf, i);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127)
        return 0;
      else if (byte >> 5 === 6)
        return 2;
      else if (byte >> 4 === 14)
        return 3;
      else if (byte >> 3 === 30)
        return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self2, buf, i) {
      var j = buf.length - 1;
      if (j < i)
        return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0)
          self2.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i || nb === -2)
        return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0)
          self2.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i || nb === -2)
        return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2)
            nb = 0;
          else
            self2.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self2, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self2.lastNeed = 0;
        return "\uFFFD";
      }
      if (self2.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self2.lastNeed = 1;
          return "\uFFFD";
        }
        if (self2.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self2.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed;
      var r = utf8CheckExtraBytes(this, buf, p);
      if (r !== void 0)
        return r;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i);
      if (!this.lastNeed)
        return buf.toString("utf8", i);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + "\uFFFD";
      return r;
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString("utf16le", i);
        if (r) {
          var c = r.charCodeAt(r.length - 1);
          if (c >= 55296 && c <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r.slice(0, -1);
          }
        }
        return r;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3;
      if (n === 0)
        return buf.toString("base64", i);
      this.lastNeed = 3 - n;
      this.lastTotal = 3;
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// node_modules/readable-stream/lib/_stream_readable.js
var require_stream_readable = __commonJS({
  "node_modules/readable-stream/lib/_stream_readable.js"(exports2, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    module2.exports = Readable;
    var isArray = require_isarray();
    var Duplex;
    Readable.ReadableState = ReadableState;
    var EE = require("events").EventEmitter;
    var EElistenerCount = function(emitter, type) {
      return emitter.listeners(type).length;
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer().Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var debugUtil = require("util");
    var debug = void 0;
    if (debugUtil && debugUtil.debuglog) {
      debug = debugUtil.debuglog("stream");
    } else {
      debug = function() {
      };
    }
    var BufferList = require_BufferList();
    var destroyImpl = require_destroy();
    var StringDecoder;
    util.inherits(Readable, Stream);
    var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === "function")
        return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event])
        emitter.on(event, fn);
      else if (isArray(emitter._events[event]))
        emitter._events[event].unshift(fn);
      else
        emitter._events[event] = [fn, emitter._events[event]];
    }
    function ReadableState(options, stream) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex)
        this.objectMode = this.objectMode || !!options.readableObjectMode;
      var hwm = options.highWaterMark;
      var readableHwm = options.readableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0)
        this.highWaterMark = hwm;
      else if (isDuplex && (readableHwm || readableHwm === 0))
        this.highWaterMark = readableHwm;
      else
        this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = null;
      this.pipesCount = 0;
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.resumeScheduled = false;
      this.destroyed = false;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.awaitDrain = 0;
      this.readingMore = false;
      this.decoder = null;
      this.encoding = null;
      if (options.encoding) {
        if (!StringDecoder)
          StringDecoder = require_string_decoder().StringDecoder;
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!(this instanceof Readable))
        return new Readable(options);
      this._readableState = new ReadableState(options, this);
      this.readable = true;
      if (options) {
        if (typeof options.read === "function")
          this._read = options.read;
        if (typeof options.destroy === "function")
          this._destroy = options.destroy;
      }
      Stream.call(this);
    }
    Object.defineProperty(Readable.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0) {
          return false;
        }
        return this._readableState.destroyed;
      },
      set: function(value) {
        if (!this._readableState) {
          return;
        }
        this._readableState.destroyed = value;
      }
    });
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function(err, cb) {
      this.push(null);
      cb(err);
    };
    Readable.prototype.push = function(chunk, encoding) {
      var state = this._readableState;
      var skipChunkCheck;
      if (!state.objectMode) {
        if (typeof chunk === "string") {
          encoding = encoding || state.defaultEncoding;
          if (encoding !== state.encoding) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = "";
          }
          skipChunkCheck = true;
        }
      } else {
        skipChunkCheck = true;
      }
      return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
    };
    Readable.prototype.unshift = function(chunk) {
      return readableAddChunk(this, chunk, null, true, false);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
      var state = stream._readableState;
      if (chunk === null) {
        state.reading = false;
        onEofChunk(stream, state);
      } else {
        var er;
        if (!skipChunkCheck)
          er = chunkInvalid(state, chunk);
        if (er) {
          stream.emit("error", er);
        } else if (state.objectMode || chunk && chunk.length > 0) {
          if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
            chunk = _uint8ArrayToBuffer(chunk);
          }
          if (addToFront) {
            if (state.endEmitted)
              stream.emit("error", new Error("stream.unshift() after end event"));
            else
              addChunk(stream, state, chunk, true);
          } else if (state.ended) {
            stream.emit("error", new Error("stream.push() after EOF"));
          } else {
            state.reading = false;
            if (state.decoder && !encoding) {
              chunk = state.decoder.write(chunk);
              if (state.objectMode || chunk.length !== 0)
                addChunk(stream, state, chunk, false);
              else
                maybeReadMore(stream, state);
            } else {
              addChunk(stream, state, chunk, false);
            }
          }
        } else if (!addToFront) {
          state.reading = false;
        }
      }
      return needMoreData(state);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit("data", chunk);
        stream.read(0);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront)
          state.buffer.unshift(chunk);
        else
          state.buffer.push(chunk);
        if (state.needReadable)
          emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    function chunkInvalid(state, chunk) {
      var er;
      if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      return er;
    }
    function needMoreData(state) {
      return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
    }
    Readable.prototype.isPaused = function() {
      return this._readableState.flowing === false;
    };
    Readable.prototype.setEncoding = function(enc) {
      if (!StringDecoder)
        StringDecoder = require_string_decoder().StringDecoder;
      this._readableState.decoder = new StringDecoder(enc);
      this._readableState.encoding = enc;
      return this;
    };
    var MAX_HWM = 8388608;
    function computeNewHighWaterMark(n) {
      if (n >= MAX_HWM) {
        n = MAX_HWM;
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || state.length === 0 && state.ended)
        return 0;
      if (state.objectMode)
        return 1;
      if (n !== n) {
        if (state.flowing && state.length)
          return state.buffer.head.data.length;
        else
          return state.length;
      }
      if (n > state.highWaterMark)
        state.highWaterMark = computeNewHighWaterMark(n);
      if (n <= state.length)
        return n;
      if (!state.ended) {
        state.needReadable = true;
        return 0;
      }
      return state.length;
    }
    Readable.prototype.read = function(n) {
      debug("read", n);
      n = parseInt(n, 10);
      var state = this._readableState;
      var nOrig = n;
      if (n !== 0)
        state.emittedReadable = false;
      if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
        debug("read: emitReadable", state.length, state.ended);
        if (state.length === 0 && state.ended)
          endReadable(this);
        else
          emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0)
          endReadable(this);
        return null;
      }
      var doRead = state.needReadable;
      debug("need readable", doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
      }
      if (state.ended || state.reading) {
        doRead = false;
        debug("reading or ended", doRead);
      } else if (doRead) {
        debug("do read");
        state.reading = true;
        state.sync = true;
        if (state.length === 0)
          state.needReadable = true;
        this._read(state.highWaterMark);
        state.sync = false;
        if (!state.reading)
          n = howMuchToRead(nOrig, state);
      }
      var ret;
      if (n > 0)
        ret = fromList(n, state);
      else
        ret = null;
      if (ret === null) {
        state.needReadable = true;
        n = 0;
      } else {
        state.length -= n;
      }
      if (state.length === 0) {
        if (!state.ended)
          state.needReadable = true;
        if (nOrig !== n && state.ended)
          endReadable(this);
      }
      if (ret !== null)
        this.emit("data", ret);
      return ret;
    };
    function onEofChunk(stream, state) {
      if (state.ended)
        return;
      if (state.decoder) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      emitReadable(stream);
    }
    function emitReadable(stream) {
      var state = stream._readableState;
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug("emitReadable", state.flowing);
        state.emittedReadable = true;
        if (state.sync)
          pna.nextTick(emitReadable_, stream);
        else
          emitReadable_(stream);
      }
    }
    function emitReadable_(stream) {
      debug("emit readable");
      stream.emit("readable");
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore) {
        state.readingMore = true;
        pna.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      var len = state.length;
      while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
        debug("maybeReadMore read 0");
        stream.read(0);
        if (len === state.length)
          break;
        else
          len = state.length;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function(n) {
      this.emit("error", new Error("_read() is not implemented"));
    };
    Readable.prototype.pipe = function(dest, pipeOpts) {
      var src = this;
      var state = this._readableState;
      switch (state.pipesCount) {
        case 0:
          state.pipes = dest;
          break;
        case 1:
          state.pipes = [state.pipes, dest];
          break;
        default:
          state.pipes.push(dest);
          break;
      }
      state.pipesCount += 1;
      debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
      var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
      var endFn = doEnd ? onend : unpipe;
      if (state.endEmitted)
        pna.nextTick(endFn);
      else
        src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug("onend");
        dest.end();
      }
      var ondrain = pipeOnDrain(src);
      dest.on("drain", ondrain);
      var cleanedUp = false;
      function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        dest.removeListener("drain", ondrain);
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
          ondrain();
      }
      var increasedAwaitDrain = false;
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        increasedAwaitDrain = false;
        var ret = dest.write(chunk);
        if (false === ret && !increasedAwaitDrain) {
          if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
            debug("false write response, pause", state.awaitDrain);
            state.awaitDrain++;
            increasedAwaitDrain = true;
          }
          src.pause();
        }
      }
      function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (EElistenerCount(dest, "error") === 0)
          dest.emit("error", er);
      }
      prependListener(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
      }
      dest.emit("pipe", src);
      if (!state.flowing) {
        debug("pipe resume");
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src) {
      return function() {
        var state = src._readableState;
        debug("pipeOnDrain", state.awaitDrain);
        if (state.awaitDrain)
          state.awaitDrain--;
        if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
          state.flowing = true;
          flow(src);
        }
      };
    }
    Readable.prototype.unpipe = function(dest) {
      var state = this._readableState;
      var unpipeInfo = { hasUnpiped: false };
      if (state.pipesCount === 0)
        return this;
      if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes)
          return this;
        if (!dest)
          dest = state.pipes;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        if (dest)
          dest.emit("unpipe", this, unpipeInfo);
        return this;
      }
      if (!dest) {
        var dests = state.pipes;
        var len = state.pipesCount;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        for (var i = 0; i < len; i++) {
          dests[i].emit("unpipe", this, { hasUnpiped: false });
        }
        return this;
      }
      var index = indexOf(state.pipes, dest);
      if (index === -1)
        return this;
      state.pipes.splice(index, 1);
      state.pipesCount -= 1;
      if (state.pipesCount === 1)
        state.pipes = state.pipes[0];
      dest.emit("unpipe", this, unpipeInfo);
      return this;
    };
    Readable.prototype.on = function(ev, fn) {
      var res = Stream.prototype.on.call(this, ev, fn);
      if (ev === "data") {
        if (this._readableState.flowing !== false)
          this.resume();
      } else if (ev === "readable") {
        var state = this._readableState;
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.emittedReadable = false;
          if (!state.reading) {
            pna.nextTick(nReadingNextTick, this);
          } else if (state.length) {
            emitReadable(this);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    function nReadingNextTick(self2) {
      debug("readable nexttick read 0");
      self2.read(0);
    }
    Readable.prototype.resume = function() {
      var state = this._readableState;
      if (!state.flowing) {
        debug("resume");
        state.flowing = true;
        resume(this, state);
      }
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        pna.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      if (!state.reading) {
        debug("resume read 0");
        stream.read(0);
      }
      state.resumeScheduled = false;
      state.awaitDrain = 0;
      stream.emit("resume");
      flow(stream);
      if (state.flowing && !state.reading)
        stream.read(0);
    }
    Readable.prototype.pause = function() {
      debug("call pause flowing=%j", this._readableState.flowing);
      if (false !== this._readableState.flowing) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
      }
      return this;
    };
    function flow(stream) {
      var state = stream._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream.read() !== null) {
      }
    }
    Readable.prototype.wrap = function(stream) {
      var _this = this;
      var state = this._readableState;
      var paused = false;
      stream.on("end", function() {
        debug("wrapped end");
        if (state.decoder && !state.ended) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length)
            _this.push(chunk);
        }
        _this.push(null);
      });
      stream.on("data", function(chunk) {
        debug("wrapped data");
        if (state.decoder)
          chunk = state.decoder.write(chunk);
        if (state.objectMode && (chunk === null || chunk === void 0))
          return;
        else if (!state.objectMode && (!chunk || !chunk.length))
          return;
        var ret = _this.push(chunk);
        if (!ret) {
          paused = true;
          stream.pause();
        }
      });
      for (var i in stream) {
        if (this[i] === void 0 && typeof stream[i] === "function") {
          this[i] = /* @__PURE__ */ function(method) {
            return function() {
              return stream[method].apply(stream, arguments);
            };
          }(i);
        }
      }
      for (var n = 0; n < kProxyEvents.length; n++) {
        stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
      }
      this._read = function(n2) {
        debug("wrapped _read", n2);
        if (paused) {
          paused = false;
          stream.resume();
        }
      };
      return this;
    };
    Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function() {
        return this._readableState.highWaterMark;
      }
    });
    Readable._fromList = fromList;
    function fromList(n, state) {
      if (state.length === 0)
        return null;
      var ret;
      if (state.objectMode)
        ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder)
          ret = state.buffer.join("");
        else if (state.buffer.length === 1)
          ret = state.buffer.head.data;
        else
          ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = fromListPartial(n, state.buffer, state.decoder);
      }
      return ret;
    }
    function fromListPartial(n, list, hasStrings) {
      var ret;
      if (n < list.head.data.length) {
        ret = list.head.data.slice(0, n);
        list.head.data = list.head.data.slice(n);
      } else if (n === list.head.data.length) {
        ret = list.shift();
      } else {
        ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
      }
      return ret;
    }
    function copyFromBufferString(n, list) {
      var p = list.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length)
          ret += str;
        else
          ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next)
              list.head = p.next;
            else
              list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function copyFromBuffer(n, list) {
      var ret = Buffer2.allocUnsafe(n);
      var p = list.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next)
              list.head = p.next;
            else
              list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function endReadable(stream) {
      var state = stream._readableState;
      if (state.length > 0)
        throw new Error('"endReadable()" called on non-empty stream');
      if (!state.endEmitted) {
        state.ended = true;
        pna.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit("end");
      }
    }
    function indexOf(xs, x) {
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x)
          return i;
      }
      return -1;
    }
  }
});

// node_modules/readable-stream/lib/_stream_transform.js
var require_stream_transform = __commonJS({
  "node_modules/readable-stream/lib/_stream_transform.js"(exports2, module2) {
    "use strict";
    module2.exports = Transform;
    var Duplex = require_stream_duplex();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(Transform, Duplex);
    function afterTransform(er, data) {
      var ts = this._transformState;
      ts.transforming = false;
      var cb = ts.writecb;
      if (!cb) {
        return this.emit("error", new Error("write callback called multiple times"));
      }
      ts.writechunk = null;
      ts.writecb = null;
      if (data != null)
        this.push(data);
      cb(er);
      var rs = this._readableState;
      rs.reading = false;
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark);
      }
    }
    function Transform(options) {
      if (!(this instanceof Transform))
        return new Transform(options);
      Duplex.call(this, options);
      this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null
      };
      this._readableState.needReadable = true;
      this._readableState.sync = false;
      if (options) {
        if (typeof options.transform === "function")
          this._transform = options.transform;
        if (typeof options.flush === "function")
          this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function prefinish() {
      var _this = this;
      if (typeof this._flush === "function") {
        this._flush(function(er, data) {
          done(_this, er, data);
        });
      } else {
        done(this, null, null);
      }
    }
    Transform.prototype.push = function(chunk, encoding) {
      this._transformState.needTransform = false;
      return Duplex.prototype.push.call(this, chunk, encoding);
    };
    Transform.prototype._transform = function(chunk, encoding, cb) {
      throw new Error("_transform() is not implemented");
    };
    Transform.prototype._write = function(chunk, encoding, cb) {
      var ts = this._transformState;
      ts.writecb = cb;
      ts.writechunk = chunk;
      ts.writeencoding = encoding;
      if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
          this._read(rs.highWaterMark);
      }
    };
    Transform.prototype._read = function(n) {
      var ts = this._transformState;
      if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
      } else {
        ts.needTransform = true;
      }
    };
    Transform.prototype._destroy = function(err, cb) {
      var _this2 = this;
      Duplex.prototype._destroy.call(this, err, function(err2) {
        cb(err2);
        _this2.emit("close");
      });
    };
    function done(stream, er, data) {
      if (er)
        return stream.emit("error", er);
      if (data != null)
        stream.push(data);
      if (stream._writableState.length)
        throw new Error("Calling transform done when ws.length != 0");
      if (stream._transformState.transforming)
        throw new Error("Calling transform done when still transforming");
      return stream.push(null);
    }
  }
});

// node_modules/readable-stream/lib/_stream_passthrough.js
var require_stream_passthrough = __commonJS({
  "node_modules/readable-stream/lib/_stream_passthrough.js"(exports2, module2) {
    "use strict";
    module2.exports = PassThrough;
    var Transform = require_stream_transform();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(PassThrough, Transform);
    function PassThrough(options) {
      if (!(this instanceof PassThrough))
        return new PassThrough(options);
      Transform.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  }
});

// node_modules/readable-stream/readable.js
var require_readable = __commonJS({
  "node_modules/readable-stream/readable.js"(exports2, module2) {
    var Stream = require("stream");
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module2.exports = Stream;
      exports2 = module2.exports = Stream.Readable;
      exports2.Readable = Stream.Readable;
      exports2.Writable = Stream.Writable;
      exports2.Duplex = Stream.Duplex;
      exports2.Transform = Stream.Transform;
      exports2.PassThrough = Stream.PassThrough;
      exports2.Stream = Stream;
    } else {
      exports2 = module2.exports = require_stream_readable();
      exports2.Stream = Stream || exports2;
      exports2.Readable = exports2;
      exports2.Writable = require_stream_writable();
      exports2.Duplex = require_stream_duplex();
      exports2.Transform = require_stream_transform();
      exports2.PassThrough = require_stream_passthrough();
    }
  }
});

// node_modules/jszip/lib/support.js
var require_support = __commonJS({
  "node_modules/jszip/lib/support.js"(exports2) {
    "use strict";
    exports2.base64 = true;
    exports2.array = true;
    exports2.string = true;
    exports2.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
    exports2.nodebuffer = typeof Buffer !== "undefined";
    exports2.uint8array = typeof Uint8Array !== "undefined";
    if (typeof ArrayBuffer === "undefined") {
      exports2.blob = false;
    } else {
      buffer = new ArrayBuffer(0);
      try {
        exports2.blob = new Blob([buffer], {
          type: "application/zip"
        }).size === 0;
      } catch (e) {
        try {
          Builder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder;
          builder = new Builder();
          builder.append(buffer);
          exports2.blob = builder.getBlob("application/zip").size === 0;
        } catch (e2) {
          exports2.blob = false;
        }
      }
    }
    var buffer;
    var Builder;
    var builder;
    try {
      exports2.nodestream = !!require_readable().Readable;
    } catch (e) {
      exports2.nodestream = false;
    }
  }
});

// node_modules/jszip/lib/base64.js
var require_base64 = __commonJS({
  "node_modules/jszip/lib/base64.js"(exports2) {
    "use strict";
    var utils = require_utils();
    var support = require_support();
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    exports2.encode = function(input) {
      var output = [];
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0, len = input.length, remainingBytes = len;
      var isArray = utils.getTypeOf(input) !== "string";
      while (i < input.length) {
        remainingBytes = len - i;
        if (!isArray) {
          chr1 = input.charCodeAt(i++);
          chr2 = i < len ? input.charCodeAt(i++) : 0;
          chr3 = i < len ? input.charCodeAt(i++) : 0;
        } else {
          chr1 = input[i++];
          chr2 = i < len ? input[i++] : 0;
          chr3 = i < len ? input[i++] : 0;
        }
        enc1 = chr1 >> 2;
        enc2 = (chr1 & 3) << 4 | chr2 >> 4;
        enc3 = remainingBytes > 1 ? (chr2 & 15) << 2 | chr3 >> 6 : 64;
        enc4 = remainingBytes > 2 ? chr3 & 63 : 64;
        output.push(_keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4));
      }
      return output.join("");
    };
    exports2.decode = function(input) {
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0, resultIndex = 0;
      var dataUrlPrefix = "data:";
      if (input.substr(0, dataUrlPrefix.length) === dataUrlPrefix) {
        throw new Error("Invalid base64 input, it looks like a data url.");
      }
      input = input.replace(/[^A-Za-z0-9+/=]/g, "");
      var totalLength = input.length * 3 / 4;
      if (input.charAt(input.length - 1) === _keyStr.charAt(64)) {
        totalLength--;
      }
      if (input.charAt(input.length - 2) === _keyStr.charAt(64)) {
        totalLength--;
      }
      if (totalLength % 1 !== 0) {
        throw new Error("Invalid base64 input, bad content length.");
      }
      var output;
      if (support.uint8array) {
        output = new Uint8Array(totalLength | 0);
      } else {
        output = new Array(totalLength | 0);
      }
      while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;
        output[resultIndex++] = chr1;
        if (enc3 !== 64) {
          output[resultIndex++] = chr2;
        }
        if (enc4 !== 64) {
          output[resultIndex++] = chr3;
        }
      }
      return output;
    };
  }
});

// node_modules/jszip/lib/nodejsUtils.js
var require_nodejsUtils = __commonJS({
  "node_modules/jszip/lib/nodejsUtils.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /**
       * True if this is running in Nodejs, will be undefined in a browser.
       * In a browser, browserify won't include this file and the whole module
       * will be resolved an empty object.
       */
      isNode: typeof Buffer !== "undefined",
      /**
       * Create a new nodejs Buffer from an existing content.
       * @param {Object} data the data to pass to the constructor.
       * @param {String} encoding the encoding to use.
       * @return {Buffer} a new Buffer.
       */
      newBufferFrom: function(data, encoding) {
        if (Buffer.from && Buffer.from !== Uint8Array.from) {
          return Buffer.from(data, encoding);
        } else {
          if (typeof data === "number") {
            throw new Error('The "data" argument must not be a number');
          }
          return new Buffer(data, encoding);
        }
      },
      /**
       * Create a new nodejs Buffer with the specified size.
       * @param {Integer} size the size of the buffer.
       * @return {Buffer} a new Buffer.
       */
      allocBuffer: function(size) {
        if (Buffer.alloc) {
          return Buffer.alloc(size);
        } else {
          var buf = new Buffer(size);
          buf.fill(0);
          return buf;
        }
      },
      /**
       * Find out if an object is a Buffer.
       * @param {Object} b the object to test.
       * @return {Boolean} true if the object is a Buffer, false otherwise.
       */
      isBuffer: function(b) {
        return Buffer.isBuffer(b);
      },
      isStream: function(obj) {
        return obj && typeof obj.on === "function" && typeof obj.pause === "function" && typeof obj.resume === "function";
      }
    };
  }
});

// node_modules/immediate/lib/index.js
var require_lib = __commonJS({
  "node_modules/immediate/lib/index.js"(exports2, module2) {
    "use strict";
    var Mutation = global.MutationObserver || global.WebKitMutationObserver;
    var scheduleDrain;
    if (process.browser) {
      if (Mutation) {
        called = 0;
        observer = new Mutation(nextTick);
        element = global.document.createTextNode("");
        observer.observe(element, {
          characterData: true
        });
        scheduleDrain = function() {
          element.data = called = ++called % 2;
        };
      } else if (!global.setImmediate && typeof global.MessageChannel !== "undefined") {
        channel = new global.MessageChannel();
        channel.port1.onmessage = nextTick;
        scheduleDrain = function() {
          channel.port2.postMessage(0);
        };
      } else if ("document" in global && "onreadystatechange" in global.document.createElement("script")) {
        scheduleDrain = function() {
          var scriptEl = global.document.createElement("script");
          scriptEl.onreadystatechange = function() {
            nextTick();
            scriptEl.onreadystatechange = null;
            scriptEl.parentNode.removeChild(scriptEl);
            scriptEl = null;
          };
          global.document.documentElement.appendChild(scriptEl);
        };
      } else {
        scheduleDrain = function() {
          setTimeout(nextTick, 0);
        };
      }
    } else {
      scheduleDrain = function() {
        process.nextTick(nextTick);
      };
    }
    var called;
    var observer;
    var element;
    var channel;
    var draining;
    var queue = [];
    function nextTick() {
      draining = true;
      var i, oldQueue;
      var len = queue.length;
      while (len) {
        oldQueue = queue;
        queue = [];
        i = -1;
        while (++i < len) {
          oldQueue[i]();
        }
        len = queue.length;
      }
      draining = false;
    }
    module2.exports = immediate;
    function immediate(task) {
      if (queue.push(task) === 1 && !draining) {
        scheduleDrain();
      }
    }
  }
});

// node_modules/lie/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/lie/lib/index.js"(exports2, module2) {
    "use strict";
    var immediate = require_lib();
    function INTERNAL() {
    }
    var handlers = {};
    var REJECTED = ["REJECTED"];
    var FULFILLED = ["FULFILLED"];
    var PENDING = ["PENDING"];
    if (!process.browser) {
      UNHANDLED = ["UNHANDLED"];
    }
    var UNHANDLED;
    module2.exports = Promise2;
    function Promise2(resolver) {
      if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function");
      }
      this.state = PENDING;
      this.queue = [];
      this.outcome = void 0;
      if (!process.browser) {
        this.handled = UNHANDLED;
      }
      if (resolver !== INTERNAL) {
        safelyResolveThenable(this, resolver);
      }
    }
    Promise2.prototype.finally = function(callback) {
      if (typeof callback !== "function") {
        return this;
      }
      var p = this.constructor;
      return this.then(resolve2, reject2);
      function resolve2(value) {
        function yes() {
          return value;
        }
        return p.resolve(callback()).then(yes);
      }
      function reject2(reason) {
        function no() {
          throw reason;
        }
        return p.resolve(callback()).then(no);
      }
    };
    Promise2.prototype.catch = function(onRejected) {
      return this.then(null, onRejected);
    };
    Promise2.prototype.then = function(onFulfilled, onRejected) {
      if (typeof onFulfilled !== "function" && this.state === FULFILLED || typeof onRejected !== "function" && this.state === REJECTED) {
        return this;
      }
      var promise = new this.constructor(INTERNAL);
      if (!process.browser) {
        if (this.handled === UNHANDLED) {
          this.handled = null;
        }
      }
      if (this.state !== PENDING) {
        var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
        unwrap(promise, resolver, this.outcome);
      } else {
        this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
      }
      return promise;
    };
    function QueueItem(promise, onFulfilled, onRejected) {
      this.promise = promise;
      if (typeof onFulfilled === "function") {
        this.onFulfilled = onFulfilled;
        this.callFulfilled = this.otherCallFulfilled;
      }
      if (typeof onRejected === "function") {
        this.onRejected = onRejected;
        this.callRejected = this.otherCallRejected;
      }
    }
    QueueItem.prototype.callFulfilled = function(value) {
      handlers.resolve(this.promise, value);
    };
    QueueItem.prototype.otherCallFulfilled = function(value) {
      unwrap(this.promise, this.onFulfilled, value);
    };
    QueueItem.prototype.callRejected = function(value) {
      handlers.reject(this.promise, value);
    };
    QueueItem.prototype.otherCallRejected = function(value) {
      unwrap(this.promise, this.onRejected, value);
    };
    function unwrap(promise, func, value) {
      immediate(function() {
        var returnValue;
        try {
          returnValue = func(value);
        } catch (e) {
          return handlers.reject(promise, e);
        }
        if (returnValue === promise) {
          handlers.reject(promise, new TypeError("Cannot resolve promise with itself"));
        } else {
          handlers.resolve(promise, returnValue);
        }
      });
    }
    handlers.resolve = function(self2, value) {
      var result = tryCatch(getThen, value);
      if (result.status === "error") {
        return handlers.reject(self2, result.value);
      }
      var thenable = result.value;
      if (thenable) {
        safelyResolveThenable(self2, thenable);
      } else {
        self2.state = FULFILLED;
        self2.outcome = value;
        var i = -1;
        var len = self2.queue.length;
        while (++i < len) {
          self2.queue[i].callFulfilled(value);
        }
      }
      return self2;
    };
    handlers.reject = function(self2, error) {
      self2.state = REJECTED;
      self2.outcome = error;
      if (!process.browser) {
        if (self2.handled === UNHANDLED) {
          immediate(function() {
            if (self2.handled === UNHANDLED) {
              process.emit("unhandledRejection", error, self2);
            }
          });
        }
      }
      var i = -1;
      var len = self2.queue.length;
      while (++i < len) {
        self2.queue[i].callRejected(error);
      }
      return self2;
    };
    function getThen(obj) {
      var then = obj && obj.then;
      if (obj && (typeof obj === "object" || typeof obj === "function") && typeof then === "function") {
        return function appyThen() {
          then.apply(obj, arguments);
        };
      }
    }
    function safelyResolveThenable(self2, thenable) {
      var called = false;
      function onError(value) {
        if (called) {
          return;
        }
        called = true;
        handlers.reject(self2, value);
      }
      function onSuccess(value) {
        if (called) {
          return;
        }
        called = true;
        handlers.resolve(self2, value);
      }
      function tryToUnwrap() {
        thenable(onSuccess, onError);
      }
      var result = tryCatch(tryToUnwrap);
      if (result.status === "error") {
        onError(result.value);
      }
    }
    function tryCatch(func, value) {
      var out = {};
      try {
        out.value = func(value);
        out.status = "success";
      } catch (e) {
        out.status = "error";
        out.value = e;
      }
      return out;
    }
    Promise2.resolve = resolve;
    function resolve(value) {
      if (value instanceof this) {
        return value;
      }
      return handlers.resolve(new this(INTERNAL), value);
    }
    Promise2.reject = reject;
    function reject(reason) {
      var promise = new this(INTERNAL);
      return handlers.reject(promise, reason);
    }
    Promise2.all = all;
    function all(iterable) {
      var self2 = this;
      if (Object.prototype.toString.call(iterable) !== "[object Array]") {
        return this.reject(new TypeError("must be an array"));
      }
      var len = iterable.length;
      var called = false;
      if (!len) {
        return this.resolve([]);
      }
      var values = new Array(len);
      var resolved = 0;
      var i = -1;
      var promise = new this(INTERNAL);
      while (++i < len) {
        allResolver(iterable[i], i);
      }
      return promise;
      function allResolver(value, i2) {
        self2.resolve(value).then(resolveFromAll, function(error) {
          if (!called) {
            called = true;
            handlers.reject(promise, error);
          }
        });
        function resolveFromAll(outValue) {
          values[i2] = outValue;
          if (++resolved === len && !called) {
            called = true;
            handlers.resolve(promise, values);
          }
        }
      }
    }
    Promise2.race = race;
    function race(iterable) {
      var self2 = this;
      if (Object.prototype.toString.call(iterable) !== "[object Array]") {
        return this.reject(new TypeError("must be an array"));
      }
      var len = iterable.length;
      var called = false;
      if (!len) {
        return this.resolve([]);
      }
      var i = -1;
      var promise = new this(INTERNAL);
      while (++i < len) {
        resolver(iterable[i]);
      }
      return promise;
      function resolver(value) {
        self2.resolve(value).then(function(response) {
          if (!called) {
            called = true;
            handlers.resolve(promise, response);
          }
        }, function(error) {
          if (!called) {
            called = true;
            handlers.reject(promise, error);
          }
        });
      }
    }
  }
});

// node_modules/jszip/lib/external.js
var require_external = __commonJS({
  "node_modules/jszip/lib/external.js"(exports2, module2) {
    "use strict";
    var ES6Promise = null;
    if (typeof Promise !== "undefined") {
      ES6Promise = Promise;
    } else {
      ES6Promise = require_lib2();
    }
    module2.exports = {
      Promise: ES6Promise
    };
  }
});

// node_modules/setimmediate/setImmediate.js
var require_setImmediate = __commonJS({
  "node_modules/setimmediate/setImmediate.js"(exports2) {
    (function(global2, undefined2) {
      "use strict";
      if (global2.setImmediate) {
        return;
      }
      var nextHandle = 1;
      var tasksByHandle = {};
      var currentlyRunningATask = false;
      var doc = global2.document;
      var registerImmediate;
      function setImmediate2(callback) {
        if (typeof callback !== "function") {
          callback = new Function("" + callback);
        }
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
        }
        var task = { callback, args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
      }
      function clearImmediate(handle) {
        delete tasksByHandle[handle];
      }
      function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
          case 0:
            callback();
            break;
          case 1:
            callback(args[0]);
            break;
          case 2:
            callback(args[0], args[1]);
            break;
          case 3:
            callback(args[0], args[1], args[2]);
            break;
          default:
            callback.apply(undefined2, args);
            break;
        }
      }
      function runIfPresent(handle) {
        if (currentlyRunningATask) {
          setTimeout(runIfPresent, 0, handle);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunningATask = true;
            try {
              run(task);
            } finally {
              clearImmediate(handle);
              currentlyRunningATask = false;
            }
          }
        }
      }
      function installNextTickImplementation() {
        registerImmediate = function(handle) {
          process.nextTick(function() {
            runIfPresent(handle);
          });
        };
      }
      function canUsePostMessage() {
        if (global2.postMessage && !global2.importScripts) {
          var postMessageIsAsynchronous = true;
          var oldOnMessage = global2.onmessage;
          global2.onmessage = function() {
            postMessageIsAsynchronous = false;
          };
          global2.postMessage("", "*");
          global2.onmessage = oldOnMessage;
          return postMessageIsAsynchronous;
        }
      }
      function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
          if (event.source === global2 && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
            runIfPresent(+event.data.slice(messagePrefix.length));
          }
        };
        if (global2.addEventListener) {
          global2.addEventListener("message", onGlobalMessage, false);
        } else {
          global2.attachEvent("onmessage", onGlobalMessage);
        }
        registerImmediate = function(handle) {
          global2.postMessage(messagePrefix + handle, "*");
        };
      }
      function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
          var handle = event.data;
          runIfPresent(handle);
        };
        registerImmediate = function(handle) {
          channel.port2.postMessage(handle);
        };
      }
      function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
          var script = doc.createElement("script");
          script.onreadystatechange = function() {
            runIfPresent(handle);
            script.onreadystatechange = null;
            html.removeChild(script);
            script = null;
          };
          html.appendChild(script);
        };
      }
      function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
          setTimeout(runIfPresent, 0, handle);
        };
      }
      var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global2);
      attachTo = attachTo && attachTo.setTimeout ? attachTo : global2;
      if ({}.toString.call(global2.process) === "[object process]") {
        installNextTickImplementation();
      } else if (canUsePostMessage()) {
        installPostMessageImplementation();
      } else if (global2.MessageChannel) {
        installMessageChannelImplementation();
      } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        installReadyStateChangeImplementation();
      } else {
        installSetTimeoutImplementation();
      }
      attachTo.setImmediate = setImmediate2;
      attachTo.clearImmediate = clearImmediate;
    })(typeof self === "undefined" ? typeof global === "undefined" ? exports2 : global : self);
  }
});

// node_modules/jszip/lib/utils.js
var require_utils = __commonJS({
  "node_modules/jszip/lib/utils.js"(exports2) {
    "use strict";
    var support = require_support();
    var base64 = require_base64();
    var nodejsUtils = require_nodejsUtils();
    var external = require_external();
    require_setImmediate();
    function string2binary(str) {
      var result = null;
      if (support.uint8array) {
        result = new Uint8Array(str.length);
      } else {
        result = new Array(str.length);
      }
      return stringToArrayLike(str, result);
    }
    exports2.newBlob = function(part, type) {
      exports2.checkSupport("blob");
      try {
        return new Blob([part], {
          type
        });
      } catch (e) {
        try {
          var Builder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder;
          var builder = new Builder();
          builder.append(part);
          return builder.getBlob(type);
        } catch (e2) {
          throw new Error("Bug : can't construct the Blob.");
        }
      }
    };
    function identity(input) {
      return input;
    }
    function stringToArrayLike(str, array) {
      for (var i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i) & 255;
      }
      return array;
    }
    var arrayToStringHelper = {
      /**
       * Transform an array of int into a string, chunk by chunk.
       * See the performances notes on arrayLikeToString.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @param {String} type the type of the array.
       * @param {Integer} chunk the chunk size.
       * @return {String} the resulting string.
       * @throws Error if the chunk is too big for the stack.
       */
      stringifyByChunk: function(array, type, chunk) {
        var result = [], k = 0, len = array.length;
        if (len <= chunk) {
          return String.fromCharCode.apply(null, array);
        }
        while (k < len) {
          if (type === "array" || type === "nodebuffer") {
            result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
          } else {
            result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
          }
          k += chunk;
        }
        return result.join("");
      },
      /**
       * Call String.fromCharCode on every item in the array.
       * This is the naive implementation, which generate A LOT of intermediate string.
       * This should be used when everything else fail.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @return {String} the result.
       */
      stringifyByChar: function(array) {
        var resultStr = "";
        for (var i = 0; i < array.length; i++) {
          resultStr += String.fromCharCode(array[i]);
        }
        return resultStr;
      },
      applyCanBeUsed: {
        /**
         * true if the browser accepts to use String.fromCharCode on Uint8Array
         */
        uint8array: function() {
          try {
            return support.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
          } catch (e) {
            return false;
          }
        }(),
        /**
         * true if the browser accepts to use String.fromCharCode on nodejs Buffer.
         */
        nodebuffer: function() {
          try {
            return support.nodebuffer && String.fromCharCode.apply(null, nodejsUtils.allocBuffer(1)).length === 1;
          } catch (e) {
            return false;
          }
        }()
      }
    };
    function arrayLikeToString(array) {
      var chunk = 65536, type = exports2.getTypeOf(array), canUseApply = true;
      if (type === "uint8array") {
        canUseApply = arrayToStringHelper.applyCanBeUsed.uint8array;
      } else if (type === "nodebuffer") {
        canUseApply = arrayToStringHelper.applyCanBeUsed.nodebuffer;
      }
      if (canUseApply) {
        while (chunk > 1) {
          try {
            return arrayToStringHelper.stringifyByChunk(array, type, chunk);
          } catch (e) {
            chunk = Math.floor(chunk / 2);
          }
        }
      }
      return arrayToStringHelper.stringifyByChar(array);
    }
    exports2.applyFromCharCode = arrayLikeToString;
    function arrayLikeToArrayLike(arrayFrom, arrayTo) {
      for (var i = 0; i < arrayFrom.length; i++) {
        arrayTo[i] = arrayFrom[i];
      }
      return arrayTo;
    }
    var transform = {};
    transform["string"] = {
      "string": identity,
      "array": function(input) {
        return stringToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return transform["string"]["uint8array"](input).buffer;
      },
      "uint8array": function(input) {
        return stringToArrayLike(input, new Uint8Array(input.length));
      },
      "nodebuffer": function(input) {
        return stringToArrayLike(input, nodejsUtils.allocBuffer(input.length));
      }
    };
    transform["array"] = {
      "string": arrayLikeToString,
      "array": identity,
      "arraybuffer": function(input) {
        return new Uint8Array(input).buffer;
      },
      "uint8array": function(input) {
        return new Uint8Array(input);
      },
      "nodebuffer": function(input) {
        return nodejsUtils.newBufferFrom(input);
      }
    };
    transform["arraybuffer"] = {
      "string": function(input) {
        return arrayLikeToString(new Uint8Array(input));
      },
      "array": function(input) {
        return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
      },
      "arraybuffer": identity,
      "uint8array": function(input) {
        return new Uint8Array(input);
      },
      "nodebuffer": function(input) {
        return nodejsUtils.newBufferFrom(new Uint8Array(input));
      }
    };
    transform["uint8array"] = {
      "string": arrayLikeToString,
      "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return input.buffer;
      },
      "uint8array": identity,
      "nodebuffer": function(input) {
        return nodejsUtils.newBufferFrom(input);
      }
    };
    transform["nodebuffer"] = {
      "string": arrayLikeToString,
      "array": function(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
      },
      "arraybuffer": function(input) {
        return transform["nodebuffer"]["uint8array"](input).buffer;
      },
      "uint8array": function(input) {
        return arrayLikeToArrayLike(input, new Uint8Array(input.length));
      },
      "nodebuffer": identity
    };
    exports2.transformTo = function(outputType, input) {
      if (!input) {
        input = "";
      }
      if (!outputType) {
        return input;
      }
      exports2.checkSupport(outputType);
      var inputType = exports2.getTypeOf(input);
      var result = transform[inputType][outputType](input);
      return result;
    };
    exports2.resolve = function(path4) {
      var parts = path4.split("/");
      var result = [];
      for (var index = 0; index < parts.length; index++) {
        var part = parts[index];
        if (part === "." || part === "" && index !== 0 && index !== parts.length - 1) {
          continue;
        } else if (part === "..") {
          result.pop();
        } else {
          result.push(part);
        }
      }
      return result.join("/");
    };
    exports2.getTypeOf = function(input) {
      if (typeof input === "string") {
        return "string";
      }
      if (Object.prototype.toString.call(input) === "[object Array]") {
        return "array";
      }
      if (support.nodebuffer && nodejsUtils.isBuffer(input)) {
        return "nodebuffer";
      }
      if (support.uint8array && input instanceof Uint8Array) {
        return "uint8array";
      }
      if (support.arraybuffer && input instanceof ArrayBuffer) {
        return "arraybuffer";
      }
    };
    exports2.checkSupport = function(type) {
      var supported = support[type.toLowerCase()];
      if (!supported) {
        throw new Error(type + " is not supported by this platform");
      }
    };
    exports2.MAX_VALUE_16BITS = 65535;
    exports2.MAX_VALUE_32BITS = -1;
    exports2.pretty = function(str) {
      var res = "", code, i;
      for (i = 0; i < (str || "").length; i++) {
        code = str.charCodeAt(i);
        res += "\\x" + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
      }
      return res;
    };
    exports2.delay = function(callback, args, self2) {
      setImmediate(function() {
        callback.apply(self2 || null, args || []);
      });
    };
    exports2.inherits = function(ctor, superCtor) {
      var Obj = function() {
      };
      Obj.prototype = superCtor.prototype;
      ctor.prototype = new Obj();
    };
    exports2.extend = function() {
      var result = {}, i, attr;
      for (i = 0; i < arguments.length; i++) {
        for (attr in arguments[i]) {
          if (Object.prototype.hasOwnProperty.call(arguments[i], attr) && typeof result[attr] === "undefined") {
            result[attr] = arguments[i][attr];
          }
        }
      }
      return result;
    };
    exports2.prepareContent = function(name, inputData, isBinary, isOptimizedBinaryString, isBase64) {
      var promise = external.Promise.resolve(inputData).then(function(data) {
        var isBlob = support.blob && (data instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(data)) !== -1);
        if (isBlob && typeof FileReader !== "undefined") {
          return new external.Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(e) {
              resolve(e.target.result);
            };
            reader.onerror = function(e) {
              reject(e.target.error);
            };
            reader.readAsArrayBuffer(data);
          });
        } else {
          return data;
        }
      });
      return promise.then(function(data) {
        var dataType = exports2.getTypeOf(data);
        if (!dataType) {
          return external.Promise.reject(
            new Error("Can't read the data of '" + name + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?")
          );
        }
        if (dataType === "arraybuffer") {
          data = exports2.transformTo("uint8array", data);
        } else if (dataType === "string") {
          if (isBase64) {
            data = base64.decode(data);
          } else if (isBinary) {
            if (isOptimizedBinaryString !== true) {
              data = string2binary(data);
            }
          }
        }
        return data;
      });
    };
  }
});

// node_modules/jszip/lib/stream/GenericWorker.js
var require_GenericWorker = __commonJS({
  "node_modules/jszip/lib/stream/GenericWorker.js"(exports2, module2) {
    "use strict";
    function GenericWorker(name) {
      this.name = name || "default";
      this.streamInfo = {};
      this.generatedError = null;
      this.extraStreamInfo = {};
      this.isPaused = true;
      this.isFinished = false;
      this.isLocked = false;
      this._listeners = {
        "data": [],
        "end": [],
        "error": []
      };
      this.previous = null;
    }
    GenericWorker.prototype = {
      /**
       * Push a chunk to the next workers.
       * @param {Object} chunk the chunk to push
       */
      push: function(chunk) {
        this.emit("data", chunk);
      },
      /**
       * End the stream.
       * @return {Boolean} true if this call ended the worker, false otherwise.
       */
      end: function() {
        if (this.isFinished) {
          return false;
        }
        this.flush();
        try {
          this.emit("end");
          this.cleanUp();
          this.isFinished = true;
        } catch (e) {
          this.emit("error", e);
        }
        return true;
      },
      /**
       * End the stream with an error.
       * @param {Error} e the error which caused the premature end.
       * @return {Boolean} true if this call ended the worker with an error, false otherwise.
       */
      error: function(e) {
        if (this.isFinished) {
          return false;
        }
        if (this.isPaused) {
          this.generatedError = e;
        } else {
          this.isFinished = true;
          this.emit("error", e);
          if (this.previous) {
            this.previous.error(e);
          }
          this.cleanUp();
        }
        return true;
      },
      /**
       * Add a callback on an event.
       * @param {String} name the name of the event (data, end, error)
       * @param {Function} listener the function to call when the event is triggered
       * @return {GenericWorker} the current object for chainability
       */
      on: function(name, listener) {
        this._listeners[name].push(listener);
        return this;
      },
      /**
       * Clean any references when a worker is ending.
       */
      cleanUp: function() {
        this.streamInfo = this.generatedError = this.extraStreamInfo = null;
        this._listeners = [];
      },
      /**
       * Trigger an event. This will call registered callback with the provided arg.
       * @param {String} name the name of the event (data, end, error)
       * @param {Object} arg the argument to call the callback with.
       */
      emit: function(name, arg) {
        if (this._listeners[name]) {
          for (var i = 0; i < this._listeners[name].length; i++) {
            this._listeners[name][i].call(this, arg);
          }
        }
      },
      /**
       * Chain a worker with an other.
       * @param {Worker} next the worker receiving events from the current one.
       * @return {worker} the next worker for chainability
       */
      pipe: function(next) {
        return next.registerPrevious(this);
      },
      /**
       * Same as `pipe` in the other direction.
       * Using an API with `pipe(next)` is very easy.
       * Implementing the API with the point of view of the next one registering
       * a source is easier, see the ZipFileWorker.
       * @param {Worker} previous the previous worker, sending events to this one
       * @return {Worker} the current worker for chainability
       */
      registerPrevious: function(previous) {
        if (this.isLocked) {
          throw new Error("The stream '" + this + "' has already been used.");
        }
        this.streamInfo = previous.streamInfo;
        this.mergeStreamInfo();
        this.previous = previous;
        var self2 = this;
        previous.on("data", function(chunk) {
          self2.processChunk(chunk);
        });
        previous.on("end", function() {
          self2.end();
        });
        previous.on("error", function(e) {
          self2.error(e);
        });
        return this;
      },
      /**
       * Pause the stream so it doesn't send events anymore.
       * @return {Boolean} true if this call paused the worker, false otherwise.
       */
      pause: function() {
        if (this.isPaused || this.isFinished) {
          return false;
        }
        this.isPaused = true;
        if (this.previous) {
          this.previous.pause();
        }
        return true;
      },
      /**
       * Resume a paused stream.
       * @return {Boolean} true if this call resumed the worker, false otherwise.
       */
      resume: function() {
        if (!this.isPaused || this.isFinished) {
          return false;
        }
        this.isPaused = false;
        var withError = false;
        if (this.generatedError) {
          this.error(this.generatedError);
          withError = true;
        }
        if (this.previous) {
          this.previous.resume();
        }
        return !withError;
      },
      /**
       * Flush any remaining bytes as the stream is ending.
       */
      flush: function() {
      },
      /**
       * Process a chunk. This is usually the method overridden.
       * @param {Object} chunk the chunk to process.
       */
      processChunk: function(chunk) {
        this.push(chunk);
      },
      /**
       * Add a key/value to be added in the workers chain streamInfo once activated.
       * @param {String} key the key to use
       * @param {Object} value the associated value
       * @return {Worker} the current worker for chainability
       */
      withStreamInfo: function(key, value) {
        this.extraStreamInfo[key] = value;
        this.mergeStreamInfo();
        return this;
      },
      /**
       * Merge this worker's streamInfo into the chain's streamInfo.
       */
      mergeStreamInfo: function() {
        for (var key in this.extraStreamInfo) {
          if (!Object.prototype.hasOwnProperty.call(this.extraStreamInfo, key)) {
            continue;
          }
          this.streamInfo[key] = this.extraStreamInfo[key];
        }
      },
      /**
       * Lock the stream to prevent further updates on the workers chain.
       * After calling this method, all calls to pipe will fail.
       */
      lock: function() {
        if (this.isLocked) {
          throw new Error("The stream '" + this + "' has already been used.");
        }
        this.isLocked = true;
        if (this.previous) {
          this.previous.lock();
        }
      },
      /**
       *
       * Pretty print the workers chain.
       */
      toString: function() {
        var me = "Worker " + this.name;
        if (this.previous) {
          return this.previous + " -> " + me;
        } else {
          return me;
        }
      }
    };
    module2.exports = GenericWorker;
  }
});

// node_modules/jszip/lib/utf8.js
var require_utf8 = __commonJS({
  "node_modules/jszip/lib/utf8.js"(exports2) {
    "use strict";
    var utils = require_utils();
    var support = require_support();
    var nodejsUtils = require_nodejsUtils();
    var GenericWorker = require_GenericWorker();
    var _utf8len = new Array(256);
    for (i = 0; i < 256; i++) {
      _utf8len[i] = i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1;
    }
    var i;
    _utf8len[254] = _utf8len[254] = 1;
    var string2buf = function(str) {
      var buf, c, c2, m_pos, i2, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      if (support.uint8array) {
        buf = new Uint8Array(buf_len);
      } else {
        buf = new Array(buf_len);
      }
      for (i2 = 0, m_pos = 0; i2 < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i2++] = c;
        } else if (c < 2048) {
          buf[i2++] = 192 | c >>> 6;
          buf[i2++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i2++] = 224 | c >>> 12;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        } else {
          buf[i2++] = 240 | c >>> 18;
          buf[i2++] = 128 | c >>> 12 & 63;
          buf[i2++] = 128 | c >>> 6 & 63;
          buf[i2++] = 128 | c & 63;
        }
      }
      return buf;
    };
    var utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len[buf[pos]] > max ? pos : max;
    };
    var buf2string = function(buf) {
      var i2, out, c, c_len;
      var len = buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i2 = 0; i2 < len; ) {
        c = buf[i2++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i2 += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i2 < len) {
          c = c << 6 | buf[i2++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      if (utf16buf.length !== out) {
        if (utf16buf.subarray) {
          utf16buf = utf16buf.subarray(0, out);
        } else {
          utf16buf.length = out;
        }
      }
      return utils.applyFromCharCode(utf16buf);
    };
    exports2.utf8encode = function utf8encode(str) {
      if (support.nodebuffer) {
        return nodejsUtils.newBufferFrom(str, "utf-8");
      }
      return string2buf(str);
    };
    exports2.utf8decode = function utf8decode(buf) {
      if (support.nodebuffer) {
        return utils.transformTo("nodebuffer", buf).toString("utf-8");
      }
      buf = utils.transformTo(support.uint8array ? "uint8array" : "array", buf);
      return buf2string(buf);
    };
    function Utf8DecodeWorker() {
      GenericWorker.call(this, "utf-8 decode");
      this.leftOver = null;
    }
    utils.inherits(Utf8DecodeWorker, GenericWorker);
    Utf8DecodeWorker.prototype.processChunk = function(chunk) {
      var data = utils.transformTo(support.uint8array ? "uint8array" : "array", chunk.data);
      if (this.leftOver && this.leftOver.length) {
        if (support.uint8array) {
          var previousData = data;
          data = new Uint8Array(previousData.length + this.leftOver.length);
          data.set(this.leftOver, 0);
          data.set(previousData, this.leftOver.length);
        } else {
          data = this.leftOver.concat(data);
        }
        this.leftOver = null;
      }
      var nextBoundary = utf8border(data);
      var usableData = data;
      if (nextBoundary !== data.length) {
        if (support.uint8array) {
          usableData = data.subarray(0, nextBoundary);
          this.leftOver = data.subarray(nextBoundary, data.length);
        } else {
          usableData = data.slice(0, nextBoundary);
          this.leftOver = data.slice(nextBoundary, data.length);
        }
      }
      this.push({
        data: exports2.utf8decode(usableData),
        meta: chunk.meta
      });
    };
    Utf8DecodeWorker.prototype.flush = function() {
      if (this.leftOver && this.leftOver.length) {
        this.push({
          data: exports2.utf8decode(this.leftOver),
          meta: {}
        });
        this.leftOver = null;
      }
    };
    exports2.Utf8DecodeWorker = Utf8DecodeWorker;
    function Utf8EncodeWorker() {
      GenericWorker.call(this, "utf-8 encode");
    }
    utils.inherits(Utf8EncodeWorker, GenericWorker);
    Utf8EncodeWorker.prototype.processChunk = function(chunk) {
      this.push({
        data: exports2.utf8encode(chunk.data),
        meta: chunk.meta
      });
    };
    exports2.Utf8EncodeWorker = Utf8EncodeWorker;
  }
});

// node_modules/jszip/lib/stream/ConvertWorker.js
var require_ConvertWorker = __commonJS({
  "node_modules/jszip/lib/stream/ConvertWorker.js"(exports2, module2) {
    "use strict";
    var GenericWorker = require_GenericWorker();
    var utils = require_utils();
    function ConvertWorker(destType) {
      GenericWorker.call(this, "ConvertWorker to " + destType);
      this.destType = destType;
    }
    utils.inherits(ConvertWorker, GenericWorker);
    ConvertWorker.prototype.processChunk = function(chunk) {
      this.push({
        data: utils.transformTo(this.destType, chunk.data),
        meta: chunk.meta
      });
    };
    module2.exports = ConvertWorker;
  }
});

// node_modules/jszip/lib/nodejs/NodejsStreamOutputAdapter.js
var require_NodejsStreamOutputAdapter = __commonJS({
  "node_modules/jszip/lib/nodejs/NodejsStreamOutputAdapter.js"(exports2, module2) {
    "use strict";
    var Readable = require_readable().Readable;
    var utils = require_utils();
    utils.inherits(NodejsStreamOutputAdapter, Readable);
    function NodejsStreamOutputAdapter(helper, options, updateCb) {
      Readable.call(this, options);
      this._helper = helper;
      var self2 = this;
      helper.on("data", function(data, meta) {
        if (!self2.push(data)) {
          self2._helper.pause();
        }
        if (updateCb) {
          updateCb(meta);
        }
      }).on("error", function(e) {
        self2.emit("error", e);
      }).on("end", function() {
        self2.push(null);
      });
    }
    NodejsStreamOutputAdapter.prototype._read = function() {
      this._helper.resume();
    };
    module2.exports = NodejsStreamOutputAdapter;
  }
});

// node_modules/jszip/lib/stream/StreamHelper.js
var require_StreamHelper = __commonJS({
  "node_modules/jszip/lib/stream/StreamHelper.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    var ConvertWorker = require_ConvertWorker();
    var GenericWorker = require_GenericWorker();
    var base64 = require_base64();
    var support = require_support();
    var external = require_external();
    var NodejsStreamOutputAdapter = null;
    if (support.nodestream) {
      try {
        NodejsStreamOutputAdapter = require_NodejsStreamOutputAdapter();
      } catch (e) {
      }
    }
    function transformZipOutput(type, content, mimeType) {
      switch (type) {
        case "blob":
          return utils.newBlob(utils.transformTo("arraybuffer", content), mimeType);
        case "base64":
          return base64.encode(content);
        default:
          return utils.transformTo(type, content);
      }
    }
    function concat(type, dataArray) {
      var i, index = 0, res = null, totalLength = 0;
      for (i = 0; i < dataArray.length; i++) {
        totalLength += dataArray[i].length;
      }
      switch (type) {
        case "string":
          return dataArray.join("");
        case "array":
          return Array.prototype.concat.apply([], dataArray);
        case "uint8array":
          res = new Uint8Array(totalLength);
          for (i = 0; i < dataArray.length; i++) {
            res.set(dataArray[i], index);
            index += dataArray[i].length;
          }
          return res;
        case "nodebuffer":
          return Buffer.concat(dataArray);
        default:
          throw new Error("concat : unsupported type '" + type + "'");
      }
    }
    function accumulate(helper, updateCallback) {
      return new external.Promise(function(resolve, reject) {
        var dataArray = [];
        var chunkType = helper._internalType, resultType = helper._outputType, mimeType = helper._mimeType;
        helper.on("data", function(data, meta) {
          dataArray.push(data);
          if (updateCallback) {
            updateCallback(meta);
          }
        }).on("error", function(err) {
          dataArray = [];
          reject(err);
        }).on("end", function() {
          try {
            var result = transformZipOutput(resultType, concat(chunkType, dataArray), mimeType);
            resolve(result);
          } catch (e) {
            reject(e);
          }
          dataArray = [];
        }).resume();
      });
    }
    function StreamHelper(worker, outputType, mimeType) {
      var internalType = outputType;
      switch (outputType) {
        case "blob":
        case "arraybuffer":
          internalType = "uint8array";
          break;
        case "base64":
          internalType = "string";
          break;
      }
      try {
        this._internalType = internalType;
        this._outputType = outputType;
        this._mimeType = mimeType;
        utils.checkSupport(internalType);
        this._worker = worker.pipe(new ConvertWorker(internalType));
        worker.lock();
      } catch (e) {
        this._worker = new GenericWorker("error");
        this._worker.error(e);
      }
    }
    StreamHelper.prototype = {
      /**
       * Listen a StreamHelper, accumulate its content and concatenate it into a
       * complete block.
       * @param {Function} updateCb the update callback.
       * @return Promise the promise for the accumulation.
       */
      accumulate: function(updateCb) {
        return accumulate(this, updateCb);
      },
      /**
       * Add a listener on an event triggered on a stream.
       * @param {String} evt the name of the event
       * @param {Function} fn the listener
       * @return {StreamHelper} the current helper.
       */
      on: function(evt, fn) {
        var self2 = this;
        if (evt === "data") {
          this._worker.on(evt, function(chunk) {
            fn.call(self2, chunk.data, chunk.meta);
          });
        } else {
          this._worker.on(evt, function() {
            utils.delay(fn, arguments, self2);
          });
        }
        return this;
      },
      /**
       * Resume the flow of chunks.
       * @return {StreamHelper} the current helper.
       */
      resume: function() {
        utils.delay(this._worker.resume, [], this._worker);
        return this;
      },
      /**
       * Pause the flow of chunks.
       * @return {StreamHelper} the current helper.
       */
      pause: function() {
        this._worker.pause();
        return this;
      },
      /**
       * Return a nodejs stream for this helper.
       * @param {Function} updateCb the update callback.
       * @return {NodejsStreamOutputAdapter} the nodejs stream.
       */
      toNodejsStream: function(updateCb) {
        utils.checkSupport("nodestream");
        if (this._outputType !== "nodebuffer") {
          throw new Error(this._outputType + " is not supported by this method");
        }
        return new NodejsStreamOutputAdapter(this, {
          objectMode: this._outputType !== "nodebuffer"
        }, updateCb);
      }
    };
    module2.exports = StreamHelper;
  }
});

// node_modules/jszip/lib/defaults.js
var require_defaults = __commonJS({
  "node_modules/jszip/lib/defaults.js"(exports2) {
    "use strict";
    exports2.base64 = false;
    exports2.binary = false;
    exports2.dir = false;
    exports2.createFolders = true;
    exports2.date = null;
    exports2.compression = null;
    exports2.compressionOptions = null;
    exports2.comment = null;
    exports2.unixPermissions = null;
    exports2.dosPermissions = null;
  }
});

// node_modules/jszip/lib/stream/DataWorker.js
var require_DataWorker = __commonJS({
  "node_modules/jszip/lib/stream/DataWorker.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var DEFAULT_BLOCK_SIZE = 16 * 1024;
    function DataWorker(dataP) {
      GenericWorker.call(this, "DataWorker");
      var self2 = this;
      this.dataIsReady = false;
      this.index = 0;
      this.max = 0;
      this.data = null;
      this.type = "";
      this._tickScheduled = false;
      dataP.then(function(data) {
        self2.dataIsReady = true;
        self2.data = data;
        self2.max = data && data.length || 0;
        self2.type = utils.getTypeOf(data);
        if (!self2.isPaused) {
          self2._tickAndRepeat();
        }
      }, function(e) {
        self2.error(e);
      });
    }
    utils.inherits(DataWorker, GenericWorker);
    DataWorker.prototype.cleanUp = function() {
      GenericWorker.prototype.cleanUp.call(this);
      this.data = null;
    };
    DataWorker.prototype.resume = function() {
      if (!GenericWorker.prototype.resume.call(this)) {
        return false;
      }
      if (!this._tickScheduled && this.dataIsReady) {
        this._tickScheduled = true;
        utils.delay(this._tickAndRepeat, [], this);
      }
      return true;
    };
    DataWorker.prototype._tickAndRepeat = function() {
      this._tickScheduled = false;
      if (this.isPaused || this.isFinished) {
        return;
      }
      this._tick();
      if (!this.isFinished) {
        utils.delay(this._tickAndRepeat, [], this);
        this._tickScheduled = true;
      }
    };
    DataWorker.prototype._tick = function() {
      if (this.isPaused || this.isFinished) {
        return false;
      }
      var size = DEFAULT_BLOCK_SIZE;
      var data = null, nextIndex = Math.min(this.max, this.index + size);
      if (this.index >= this.max) {
        return this.end();
      } else {
        switch (this.type) {
          case "string":
            data = this.data.substring(this.index, nextIndex);
            break;
          case "uint8array":
            data = this.data.subarray(this.index, nextIndex);
            break;
          case "array":
          case "nodebuffer":
            data = this.data.slice(this.index, nextIndex);
            break;
        }
        this.index = nextIndex;
        return this.push({
          data,
          meta: {
            percent: this.max ? this.index / this.max * 100 : 0
          }
        });
      }
    };
    module2.exports = DataWorker;
  }
});

// node_modules/jszip/lib/crc32.js
var require_crc32 = __commonJS({
  "node_modules/jszip/lib/crc32.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    function makeTable() {
      var c, table = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
      }
      return table;
    }
    var crcTable = makeTable();
    function crc32(crc, buf, len, pos) {
      var t3 = crcTable, end = pos + len;
      crc = crc ^ -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t3[(crc ^ buf[i]) & 255];
      }
      return crc ^ -1;
    }
    function crc32str(crc, str, len, pos) {
      var t3 = crcTable, end = pos + len;
      crc = crc ^ -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t3[(crc ^ str.charCodeAt(i)) & 255];
      }
      return crc ^ -1;
    }
    module2.exports = function crc32wrapper(input, crc) {
      if (typeof input === "undefined" || !input.length) {
        return 0;
      }
      var isArray = utils.getTypeOf(input) !== "string";
      if (isArray) {
        return crc32(crc | 0, input, input.length, 0);
      } else {
        return crc32str(crc | 0, input, input.length, 0);
      }
    };
  }
});

// node_modules/jszip/lib/stream/Crc32Probe.js
var require_Crc32Probe = __commonJS({
  "node_modules/jszip/lib/stream/Crc32Probe.js"(exports2, module2) {
    "use strict";
    var GenericWorker = require_GenericWorker();
    var crc32 = require_crc32();
    var utils = require_utils();
    function Crc32Probe() {
      GenericWorker.call(this, "Crc32Probe");
      this.withStreamInfo("crc32", 0);
    }
    utils.inherits(Crc32Probe, GenericWorker);
    Crc32Probe.prototype.processChunk = function(chunk) {
      this.streamInfo.crc32 = crc32(chunk.data, this.streamInfo.crc32 || 0);
      this.push(chunk);
    };
    module2.exports = Crc32Probe;
  }
});

// node_modules/jszip/lib/stream/DataLengthProbe.js
var require_DataLengthProbe = __commonJS({
  "node_modules/jszip/lib/stream/DataLengthProbe.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    function DataLengthProbe(propName) {
      GenericWorker.call(this, "DataLengthProbe for " + propName);
      this.propName = propName;
      this.withStreamInfo(propName, 0);
    }
    utils.inherits(DataLengthProbe, GenericWorker);
    DataLengthProbe.prototype.processChunk = function(chunk) {
      if (chunk) {
        var length = this.streamInfo[this.propName] || 0;
        this.streamInfo[this.propName] = length + chunk.data.length;
      }
      GenericWorker.prototype.processChunk.call(this, chunk);
    };
    module2.exports = DataLengthProbe;
  }
});

// node_modules/jszip/lib/compressedObject.js
var require_compressedObject = __commonJS({
  "node_modules/jszip/lib/compressedObject.js"(exports2, module2) {
    "use strict";
    var external = require_external();
    var DataWorker = require_DataWorker();
    var Crc32Probe = require_Crc32Probe();
    var DataLengthProbe = require_DataLengthProbe();
    function CompressedObject(compressedSize, uncompressedSize, crc32, compression, data) {
      this.compressedSize = compressedSize;
      this.uncompressedSize = uncompressedSize;
      this.crc32 = crc32;
      this.compression = compression;
      this.compressedContent = data;
    }
    CompressedObject.prototype = {
      /**
       * Create a worker to get the uncompressed content.
       * @return {GenericWorker} the worker.
       */
      getContentWorker: function() {
        var worker = new DataWorker(external.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new DataLengthProbe("data_length"));
        var that = this;
        worker.on("end", function() {
          if (this.streamInfo["data_length"] !== that.uncompressedSize) {
            throw new Error("Bug : uncompressed data size mismatch");
          }
        });
        return worker;
      },
      /**
       * Create a worker to get the compressed content.
       * @return {GenericWorker} the worker.
       */
      getCompressedWorker: function() {
        return new DataWorker(external.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
      }
    };
    CompressedObject.createWorkerFrom = function(uncompressedWorker, compression, compressionOptions) {
      return uncompressedWorker.pipe(new Crc32Probe()).pipe(new DataLengthProbe("uncompressedSize")).pipe(compression.compressWorker(compressionOptions)).pipe(new DataLengthProbe("compressedSize")).withStreamInfo("compression", compression);
    };
    module2.exports = CompressedObject;
  }
});

// node_modules/jszip/lib/zipObject.js
var require_zipObject = __commonJS({
  "node_modules/jszip/lib/zipObject.js"(exports2, module2) {
    "use strict";
    var StreamHelper = require_StreamHelper();
    var DataWorker = require_DataWorker();
    var utf8 = require_utf8();
    var CompressedObject = require_compressedObject();
    var GenericWorker = require_GenericWorker();
    var ZipObject = function(name, data, options) {
      this.name = name;
      this.dir = options.dir;
      this.date = options.date;
      this.comment = options.comment;
      this.unixPermissions = options.unixPermissions;
      this.dosPermissions = options.dosPermissions;
      this._data = data;
      this._dataBinary = options.binary;
      this.options = {
        compression: options.compression,
        compressionOptions: options.compressionOptions
      };
    };
    ZipObject.prototype = {
      /**
       * Create an internal stream for the content of this object.
       * @param {String} type the type of each chunk.
       * @return StreamHelper the stream.
       */
      internalStream: function(type) {
        var result = null, outputType = "string";
        try {
          if (!type) {
            throw new Error("No output type specified.");
          }
          outputType = type.toLowerCase();
          var askUnicodeString = outputType === "string" || outputType === "text";
          if (outputType === "binarystring" || outputType === "text") {
            outputType = "string";
          }
          result = this._decompressWorker();
          var isUnicodeString = !this._dataBinary;
          if (isUnicodeString && !askUnicodeString) {
            result = result.pipe(new utf8.Utf8EncodeWorker());
          }
          if (!isUnicodeString && askUnicodeString) {
            result = result.pipe(new utf8.Utf8DecodeWorker());
          }
        } catch (e) {
          result = new GenericWorker("error");
          result.error(e);
        }
        return new StreamHelper(result, outputType, "");
      },
      /**
       * Prepare the content in the asked type.
       * @param {String} type the type of the result.
       * @param {Function} onUpdate a function to call on each internal update.
       * @return Promise the promise of the result.
       */
      async: function(type, onUpdate) {
        return this.internalStream(type).accumulate(onUpdate);
      },
      /**
       * Prepare the content as a nodejs stream.
       * @param {String} type the type of each chunk.
       * @param {Function} onUpdate a function to call on each internal update.
       * @return Stream the stream.
       */
      nodeStream: function(type, onUpdate) {
        return this.internalStream(type || "nodebuffer").toNodejsStream(onUpdate);
      },
      /**
       * Return a worker for the compressed content.
       * @private
       * @param {Object} compression the compression object to use.
       * @param {Object} compressionOptions the options to use when compressing.
       * @return Worker the worker.
       */
      _compressWorker: function(compression, compressionOptions) {
        if (this._data instanceof CompressedObject && this._data.compression.magic === compression.magic) {
          return this._data.getCompressedWorker();
        } else {
          var result = this._decompressWorker();
          if (!this._dataBinary) {
            result = result.pipe(new utf8.Utf8EncodeWorker());
          }
          return CompressedObject.createWorkerFrom(result, compression, compressionOptions);
        }
      },
      /**
       * Return a worker for the decompressed content.
       * @private
       * @return Worker the worker.
       */
      _decompressWorker: function() {
        if (this._data instanceof CompressedObject) {
          return this._data.getContentWorker();
        } else if (this._data instanceof GenericWorker) {
          return this._data;
        } else {
          return new DataWorker(this._data);
        }
      }
    };
    var removedMethods = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"];
    var removedFn = function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    };
    for (i = 0; i < removedMethods.length; i++) {
      ZipObject.prototype[removedMethods[i]] = removedFn;
    }
    var i;
    module2.exports = ZipObject;
  }
});

// node_modules/pako/lib/utils/common.js
var require_common = __commonJS({
  "node_modules/pako/lib/utils/common.js"(exports2) {
    "use strict";
    var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
    function _has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    exports2.assign = function(obj) {
      var sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        var source = sources.shift();
        if (!source) {
          continue;
        }
        if (typeof source !== "object") {
          throw new TypeError(source + "must be non-object");
        }
        for (var p in source) {
          if (_has(source, p)) {
            obj[p] = source[p];
          }
        }
      }
      return obj;
    };
    exports2.shrinkBuf = function(buf, size) {
      if (buf.length === size) {
        return buf;
      }
      if (buf.subarray) {
        return buf.subarray(0, size);
      }
      buf.length = size;
      return buf;
    };
    var fnTyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
          return;
        }
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        var i, l, len, pos, chunk, result;
        len = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }
        result = new Uint8Array(len);
        pos = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      }
    };
    var fnUntyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        return [].concat.apply([], chunks);
      }
    };
    exports2.setTyped = function(on) {
      if (on) {
        exports2.Buf8 = Uint8Array;
        exports2.Buf16 = Uint16Array;
        exports2.Buf32 = Int32Array;
        exports2.assign(exports2, fnTyped);
      } else {
        exports2.Buf8 = Array;
        exports2.Buf16 = Array;
        exports2.Buf32 = Array;
        exports2.assign(exports2, fnUntyped);
      }
    };
    exports2.setTyped(TYPED_OK);
  }
});

// node_modules/pako/lib/zlib/trees.js
var require_trees = __commonJS({
  "node_modules/pako/lib/zlib/trees.js"(exports2) {
    "use strict";
    var utils = require_common();
    var Z_FIXED = 4;
    var Z_BINARY = 0;
    var Z_TEXT = 1;
    var Z_UNKNOWN = 2;
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    var STORED_BLOCK = 0;
    var STATIC_TREES = 1;
    var DYN_TREES = 2;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var Buf_size = 16;
    var MAX_BL_BITS = 7;
    var END_BLOCK = 256;
    var REP_3_6 = 16;
    var REPZ_3_10 = 17;
    var REPZ_11_138 = 18;
    var extra_lbits = (
      /* extra bits for each length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
    );
    var extra_dbits = (
      /* extra bits for each distance code */
      [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
    );
    var extra_blbits = (
      /* extra bits for each bit length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
    );
    var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var DIST_CODE_LEN = 512;
    var static_ltree = new Array((L_CODES + 2) * 2);
    zero(static_ltree);
    var static_dtree = new Array(D_CODES * 2);
    zero(static_dtree);
    var _dist_code = new Array(DIST_CODE_LEN);
    zero(_dist_code);
    var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
    zero(_length_code);
    var base_length = new Array(LENGTH_CODES);
    zero(base_length);
    var base_dist = new Array(D_CODES);
    zero(base_dist);
    function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
      this.static_tree = static_tree;
      this.extra_bits = extra_bits;
      this.extra_base = extra_base;
      this.elems = elems;
      this.max_length = max_length;
      this.has_stree = static_tree && static_tree.length;
    }
    var static_l_desc;
    var static_d_desc;
    var static_bl_desc;
    function TreeDesc(dyn_tree, stat_desc) {
      this.dyn_tree = dyn_tree;
      this.max_code = 0;
      this.stat_desc = stat_desc;
    }
    function d_code(dist) {
      return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
    }
    function put_short(s, w) {
      s.pending_buf[s.pending++] = w & 255;
      s.pending_buf[s.pending++] = w >>> 8 & 255;
    }
    function send_bits(s, value, length) {
      if (s.bi_valid > Buf_size - length) {
        s.bi_buf |= value << s.bi_valid & 65535;
        put_short(s, s.bi_buf);
        s.bi_buf = value >> Buf_size - s.bi_valid;
        s.bi_valid += length - Buf_size;
      } else {
        s.bi_buf |= value << s.bi_valid & 65535;
        s.bi_valid += length;
      }
    }
    function send_code(s, c, tree) {
      send_bits(
        s,
        tree[c * 2],
        tree[c * 2 + 1]
        /*.Len*/
      );
    }
    function bi_reverse(code, len) {
      var res = 0;
      do {
        res |= code & 1;
        code >>>= 1;
        res <<= 1;
      } while (--len > 0);
      return res >>> 1;
    }
    function bi_flush(s) {
      if (s.bi_valid === 16) {
        put_short(s, s.bi_buf);
        s.bi_buf = 0;
        s.bi_valid = 0;
      } else if (s.bi_valid >= 8) {
        s.pending_buf[s.pending++] = s.bi_buf & 255;
        s.bi_buf >>= 8;
        s.bi_valid -= 8;
      }
    }
    function gen_bitlen(s, desc) {
      var tree = desc.dyn_tree;
      var max_code = desc.max_code;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var extra = desc.stat_desc.extra_bits;
      var base = desc.stat_desc.extra_base;
      var max_length = desc.stat_desc.max_length;
      var h;
      var n, m;
      var bits;
      var xbits;
      var f;
      var overflow = 0;
      for (bits = 0; bits <= MAX_BITS; bits++) {
        s.bl_count[bits] = 0;
      }
      tree[s.heap[s.heap_max] * 2 + 1] = 0;
      for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1] = bits;
        if (n > max_code) {
          continue;
        }
        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) {
          xbits = extra[n - base];
        }
        f = tree[n * 2];
        s.opt_len += f * (bits + xbits);
        if (has_stree) {
          s.static_len += f * (stree[n * 2 + 1] + xbits);
        }
      }
      if (overflow === 0) {
        return;
      }
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] === 0) {
          bits--;
        }
        s.bl_count[bits]--;
        s.bl_count[bits + 1] += 2;
        s.bl_count[max_length]--;
        overflow -= 2;
      } while (overflow > 0);
      for (bits = max_length; bits !== 0; bits--) {
        n = s.bl_count[bits];
        while (n !== 0) {
          m = s.heap[--h];
          if (m > max_code) {
            continue;
          }
          if (tree[m * 2 + 1] !== bits) {
            s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
            tree[m * 2 + 1] = bits;
          }
          n--;
        }
      }
    }
    function gen_codes(tree, max_code, bl_count) {
      var next_code = new Array(MAX_BITS + 1);
      var code = 0;
      var bits;
      var n;
      for (bits = 1; bits <= MAX_BITS; bits++) {
        next_code[bits] = code = code + bl_count[bits - 1] << 1;
      }
      for (n = 0; n <= max_code; n++) {
        var len = tree[n * 2 + 1];
        if (len === 0) {
          continue;
        }
        tree[n * 2] = bi_reverse(next_code[len]++, len);
      }
    }
    function tr_static_init() {
      var n;
      var bits;
      var length;
      var code;
      var dist;
      var bl_count = new Array(MAX_BITS + 1);
      length = 0;
      for (code = 0; code < LENGTH_CODES - 1; code++) {
        base_length[code] = length;
        for (n = 0; n < 1 << extra_lbits[code]; n++) {
          _length_code[length++] = code;
        }
      }
      _length_code[length - 1] = code;
      dist = 0;
      for (code = 0; code < 16; code++) {
        base_dist[code] = dist;
        for (n = 0; n < 1 << extra_dbits[code]; n++) {
          _dist_code[dist++] = code;
        }
      }
      dist >>= 7;
      for (; code < D_CODES; code++) {
        base_dist[code] = dist << 7;
        for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
          _dist_code[256 + dist++] = code;
        }
      }
      for (bits = 0; bits <= MAX_BITS; bits++) {
        bl_count[bits] = 0;
      }
      n = 0;
      while (n <= 143) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      while (n <= 255) {
        static_ltree[n * 2 + 1] = 9;
        n++;
        bl_count[9]++;
      }
      while (n <= 279) {
        static_ltree[n * 2 + 1] = 7;
        n++;
        bl_count[7]++;
      }
      while (n <= 287) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      gen_codes(static_ltree, L_CODES + 1, bl_count);
      for (n = 0; n < D_CODES; n++) {
        static_dtree[n * 2 + 1] = 5;
        static_dtree[n * 2] = bi_reverse(n, 5);
      }
      static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
      static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
      static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
    }
    function init_block(s) {
      var n;
      for (n = 0; n < L_CODES; n++) {
        s.dyn_ltree[n * 2] = 0;
      }
      for (n = 0; n < D_CODES; n++) {
        s.dyn_dtree[n * 2] = 0;
      }
      for (n = 0; n < BL_CODES; n++) {
        s.bl_tree[n * 2] = 0;
      }
      s.dyn_ltree[END_BLOCK * 2] = 1;
      s.opt_len = s.static_len = 0;
      s.last_lit = s.matches = 0;
    }
    function bi_windup(s) {
      if (s.bi_valid > 8) {
        put_short(s, s.bi_buf);
      } else if (s.bi_valid > 0) {
        s.pending_buf[s.pending++] = s.bi_buf;
      }
      s.bi_buf = 0;
      s.bi_valid = 0;
    }
    function copy_block(s, buf, len, header) {
      bi_windup(s);
      if (header) {
        put_short(s, len);
        put_short(s, ~len);
      }
      utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
      s.pending += len;
    }
    function smaller(tree, n, m, depth) {
      var _n2 = n * 2;
      var _m2 = m * 2;
      return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
    }
    function pqdownheap(s, tree, k) {
      var v = s.heap[k];
      var j = k << 1;
      while (j <= s.heap_len) {
        if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
          j++;
        }
        if (smaller(tree, v, s.heap[j], s.depth)) {
          break;
        }
        s.heap[k] = s.heap[j];
        k = j;
        j <<= 1;
      }
      s.heap[k] = v;
    }
    function compress_block(s, ltree, dtree) {
      var dist;
      var lc;
      var lx = 0;
      var code;
      var extra;
      if (s.last_lit !== 0) {
        do {
          dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
          lc = s.pending_buf[s.l_buf + lx];
          lx++;
          if (dist === 0) {
            send_code(s, lc, ltree);
          } else {
            code = _length_code[lc];
            send_code(s, code + LITERALS + 1, ltree);
            extra = extra_lbits[code];
            if (extra !== 0) {
              lc -= base_length[code];
              send_bits(s, lc, extra);
            }
            dist--;
            code = d_code(dist);
            send_code(s, code, dtree);
            extra = extra_dbits[code];
            if (extra !== 0) {
              dist -= base_dist[code];
              send_bits(s, dist, extra);
            }
          }
        } while (lx < s.last_lit);
      }
      send_code(s, END_BLOCK, ltree);
    }
    function build_tree(s, desc) {
      var tree = desc.dyn_tree;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var elems = desc.stat_desc.elems;
      var n, m;
      var max_code = -1;
      var node;
      s.heap_len = 0;
      s.heap_max = HEAP_SIZE;
      for (n = 0; n < elems; n++) {
        if (tree[n * 2] !== 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;
        } else {
          tree[n * 2 + 1] = 0;
        }
      }
      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
        tree[node * 2] = 1;
        s.depth[node] = 0;
        s.opt_len--;
        if (has_stree) {
          s.static_len -= stree[node * 2 + 1];
        }
      }
      desc.max_code = max_code;
      for (n = s.heap_len >> 1; n >= 1; n--) {
        pqdownheap(s, tree, n);
      }
      node = elems;
      do {
        n = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[
          1
          /*SMALLEST*/
        ] = s.heap[s.heap_len--];
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
        m = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[--s.heap_max] = n;
        s.heap[--s.heap_max] = m;
        tree[node * 2] = tree[n * 2] + tree[m * 2];
        s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
        tree[n * 2 + 1] = tree[m * 2 + 1] = node;
        s.heap[
          1
          /*SMALLEST*/
        ] = node++;
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
      } while (s.heap_len >= 2);
      s.heap[--s.heap_max] = s.heap[
        1
        /*SMALLEST*/
      ];
      gen_bitlen(s, desc);
      gen_codes(tree, max_code, s.bl_count);
    }
    function scan_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      tree[(max_code + 1) * 2 + 1] = 65535;
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          s.bl_tree[curlen * 2] += count;
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            s.bl_tree[curlen * 2]++;
          }
          s.bl_tree[REP_3_6 * 2]++;
        } else if (count <= 10) {
          s.bl_tree[REPZ_3_10 * 2]++;
        } else {
          s.bl_tree[REPZ_11_138 * 2]++;
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function send_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          do {
            send_code(s, curlen, s.bl_tree);
          } while (--count !== 0);
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            send_code(s, curlen, s.bl_tree);
            count--;
          }
          send_code(s, REP_3_6, s.bl_tree);
          send_bits(s, count - 3, 2);
        } else if (count <= 10) {
          send_code(s, REPZ_3_10, s.bl_tree);
          send_bits(s, count - 3, 3);
        } else {
          send_code(s, REPZ_11_138, s.bl_tree);
          send_bits(s, count - 11, 7);
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function build_bl_tree(s) {
      var max_blindex;
      scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
      scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
      build_tree(s, s.bl_desc);
      for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
        if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
          break;
        }
      }
      s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
      return max_blindex;
    }
    function send_all_trees(s, lcodes, dcodes, blcodes) {
      var rank;
      send_bits(s, lcodes - 257, 5);
      send_bits(s, dcodes - 1, 5);
      send_bits(s, blcodes - 4, 4);
      for (rank = 0; rank < blcodes; rank++) {
        send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
      }
      send_tree(s, s.dyn_ltree, lcodes - 1);
      send_tree(s, s.dyn_dtree, dcodes - 1);
    }
    function detect_data_type(s) {
      var black_mask = 4093624447;
      var n;
      for (n = 0; n <= 31; n++, black_mask >>>= 1) {
        if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
          return Z_BINARY;
        }
      }
      if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
        return Z_TEXT;
      }
      for (n = 32; n < LITERALS; n++) {
        if (s.dyn_ltree[n * 2] !== 0) {
          return Z_TEXT;
        }
      }
      return Z_BINARY;
    }
    var static_init_done = false;
    function _tr_init(s) {
      if (!static_init_done) {
        tr_static_init();
        static_init_done = true;
      }
      s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
      s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
      s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
      s.bi_buf = 0;
      s.bi_valid = 0;
      init_block(s);
    }
    function _tr_stored_block(s, buf, stored_len, last) {
      send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
      copy_block(s, buf, stored_len, true);
    }
    function _tr_align(s) {
      send_bits(s, STATIC_TREES << 1, 3);
      send_code(s, END_BLOCK, static_ltree);
      bi_flush(s);
    }
    function _tr_flush_block(s, buf, stored_len, last) {
      var opt_lenb, static_lenb;
      var max_blindex = 0;
      if (s.level > 0) {
        if (s.strm.data_type === Z_UNKNOWN) {
          s.strm.data_type = detect_data_type(s);
        }
        build_tree(s, s.l_desc);
        build_tree(s, s.d_desc);
        max_blindex = build_bl_tree(s);
        opt_lenb = s.opt_len + 3 + 7 >>> 3;
        static_lenb = s.static_len + 3 + 7 >>> 3;
        if (static_lenb <= opt_lenb) {
          opt_lenb = static_lenb;
        }
      } else {
        opt_lenb = static_lenb = stored_len + 5;
      }
      if (stored_len + 4 <= opt_lenb && buf !== -1) {
        _tr_stored_block(s, buf, stored_len, last);
      } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
        send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
        compress_block(s, static_ltree, static_dtree);
      } else {
        send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
        send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
        compress_block(s, s.dyn_ltree, s.dyn_dtree);
      }
      init_block(s);
      if (last) {
        bi_windup(s);
      }
    }
    function _tr_tally(s, dist, lc) {
      s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
      s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
      s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
      s.last_lit++;
      if (dist === 0) {
        s.dyn_ltree[lc * 2]++;
      } else {
        s.matches++;
        dist--;
        s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
        s.dyn_dtree[d_code(dist) * 2]++;
      }
      return s.last_lit === s.lit_bufsize - 1;
    }
    exports2._tr_init = _tr_init;
    exports2._tr_stored_block = _tr_stored_block;
    exports2._tr_flush_block = _tr_flush_block;
    exports2._tr_tally = _tr_tally;
    exports2._tr_align = _tr_align;
  }
});

// node_modules/pako/lib/zlib/adler32.js
var require_adler32 = __commonJS({
  "node_modules/pako/lib/zlib/adler32.js"(exports2, module2) {
    "use strict";
    function adler32(adler, buf, len, pos) {
      var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
      while (len !== 0) {
        n = len > 2e3 ? 2e3 : len;
        len -= n;
        do {
          s1 = s1 + buf[pos++] | 0;
          s2 = s2 + s1 | 0;
        } while (--n);
        s1 %= 65521;
        s2 %= 65521;
      }
      return s1 | s2 << 16 | 0;
    }
    module2.exports = adler32;
  }
});

// node_modules/pako/lib/zlib/crc32.js
var require_crc322 = __commonJS({
  "node_modules/pako/lib/zlib/crc32.js"(exports2, module2) {
    "use strict";
    function makeTable() {
      var c, table = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
      }
      return table;
    }
    var crcTable = makeTable();
    function crc32(crc, buf, len, pos) {
      var t3 = crcTable, end = pos + len;
      crc ^= -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t3[(crc ^ buf[i]) & 255];
      }
      return crc ^ -1;
    }
    module2.exports = crc32;
  }
});

// node_modules/pako/lib/zlib/messages.js
var require_messages = __commonJS({
  "node_modules/pako/lib/zlib/messages.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      2: "need dictionary",
      /* Z_NEED_DICT       2  */
      1: "stream end",
      /* Z_STREAM_END      1  */
      0: "",
      /* Z_OK              0  */
      "-1": "file error",
      /* Z_ERRNO         (-1) */
      "-2": "stream error",
      /* Z_STREAM_ERROR  (-2) */
      "-3": "data error",
      /* Z_DATA_ERROR    (-3) */
      "-4": "insufficient memory",
      /* Z_MEM_ERROR     (-4) */
      "-5": "buffer error",
      /* Z_BUF_ERROR     (-5) */
      "-6": "incompatible version"
      /* Z_VERSION_ERROR (-6) */
    };
  }
});

// node_modules/pako/lib/zlib/deflate.js
var require_deflate = __commonJS({
  "node_modules/pako/lib/zlib/deflate.js"(exports2) {
    "use strict";
    var utils = require_common();
    var trees = require_trees();
    var adler32 = require_adler32();
    var crc32 = require_crc322();
    var msg = require_messages();
    var Z_NO_FLUSH = 0;
    var Z_PARTIAL_FLUSH = 1;
    var Z_FULL_FLUSH = 3;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_BUF_ERROR = -5;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_FILTERED = 1;
    var Z_HUFFMAN_ONLY = 2;
    var Z_RLE = 3;
    var Z_FIXED = 4;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_UNKNOWN = 2;
    var Z_DEFLATED = 8;
    var MAX_MEM_LEVEL = 9;
    var MAX_WBITS = 15;
    var DEF_MEM_LEVEL = 8;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
    var PRESET_DICT = 32;
    var INIT_STATE = 42;
    var EXTRA_STATE = 69;
    var NAME_STATE = 73;
    var COMMENT_STATE = 91;
    var HCRC_STATE = 103;
    var BUSY_STATE = 113;
    var FINISH_STATE = 666;
    var BS_NEED_MORE = 1;
    var BS_BLOCK_DONE = 2;
    var BS_FINISH_STARTED = 3;
    var BS_FINISH_DONE = 4;
    var OS_CODE = 3;
    function err(strm, errorCode) {
      strm.msg = msg[errorCode];
      return errorCode;
    }
    function rank(f) {
      return (f << 1) - (f > 4 ? 9 : 0);
    }
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    function flush_pending(strm) {
      var s = strm.state;
      var len = s.pending;
      if (len > strm.avail_out) {
        len = strm.avail_out;
      }
      if (len === 0) {
        return;
      }
      utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
      strm.next_out += len;
      s.pending_out += len;
      strm.total_out += len;
      strm.avail_out -= len;
      s.pending -= len;
      if (s.pending === 0) {
        s.pending_out = 0;
      }
    }
    function flush_block_only(s, last) {
      trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
      s.block_start = s.strstart;
      flush_pending(s.strm);
    }
    function put_byte(s, b) {
      s.pending_buf[s.pending++] = b;
    }
    function putShortMSB(s, b) {
      s.pending_buf[s.pending++] = b >>> 8 & 255;
      s.pending_buf[s.pending++] = b & 255;
    }
    function read_buf(strm, buf, start, size) {
      var len = strm.avail_in;
      if (len > size) {
        len = size;
      }
      if (len === 0) {
        return 0;
      }
      strm.avail_in -= len;
      utils.arraySet(buf, strm.input, strm.next_in, len, start);
      if (strm.state.wrap === 1) {
        strm.adler = adler32(strm.adler, buf, len, start);
      } else if (strm.state.wrap === 2) {
        strm.adler = crc32(strm.adler, buf, len, start);
      }
      strm.next_in += len;
      strm.total_in += len;
      return len;
    }
    function longest_match(s, cur_match) {
      var chain_length = s.max_chain_length;
      var scan = s.strstart;
      var match;
      var len;
      var best_len = s.prev_length;
      var nice_match = s.nice_match;
      var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
      var _win = s.window;
      var wmask = s.w_mask;
      var prev = s.prev;
      var strend = s.strstart + MAX_MATCH;
      var scan_end1 = _win[scan + best_len - 1];
      var scan_end = _win[scan + best_len];
      if (s.prev_length >= s.good_match) {
        chain_length >>= 2;
      }
      if (nice_match > s.lookahead) {
        nice_match = s.lookahead;
      }
      do {
        match = cur_match;
        if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
          continue;
        }
        scan += 2;
        match++;
        do {
        } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
        len = MAX_MATCH - (strend - scan);
        scan = strend - MAX_MATCH;
        if (len > best_len) {
          s.match_start = cur_match;
          best_len = len;
          if (len >= nice_match) {
            break;
          }
          scan_end1 = _win[scan + best_len - 1];
          scan_end = _win[scan + best_len];
        }
      } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
      if (best_len <= s.lookahead) {
        return best_len;
      }
      return s.lookahead;
    }
    function fill_window(s) {
      var _w_size = s.w_size;
      var p, n, m, more, str;
      do {
        more = s.window_size - s.lookahead - s.strstart;
        if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
          utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
          s.match_start -= _w_size;
          s.strstart -= _w_size;
          s.block_start -= _w_size;
          n = s.hash_size;
          p = n;
          do {
            m = s.head[--p];
            s.head[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          n = _w_size;
          p = n;
          do {
            m = s.prev[--p];
            s.prev[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          more += _w_size;
        }
        if (s.strm.avail_in === 0) {
          break;
        }
        n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
        s.lookahead += n;
        if (s.lookahead + s.insert >= MIN_MATCH) {
          str = s.strstart - s.insert;
          s.ins_h = s.window[str];
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
          while (s.insert) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
            s.insert--;
            if (s.lookahead + s.insert < MIN_MATCH) {
              break;
            }
          }
        }
      } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
    }
    function deflate_stored(s, flush) {
      var max_block_size = 65535;
      if (max_block_size > s.pending_buf_size - 5) {
        max_block_size = s.pending_buf_size - 5;
      }
      for (; ; ) {
        if (s.lookahead <= 1) {
          fill_window(s);
          if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.strstart += s.lookahead;
        s.lookahead = 0;
        var max_start = s.block_start + max_block_size;
        if (s.strstart === 0 || s.strstart >= max_start) {
          s.lookahead = s.strstart - max_start;
          s.strstart = max_start;
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.strstart > s.block_start) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_NEED_MORE;
    }
    function deflate_fast(s, flush) {
      var hash_head;
      var bflush;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
            s.match_length--;
            do {
              s.strstart++;
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            } while (--s.match_length !== 0);
            s.strstart++;
          } else {
            s.strstart += s.match_length;
            s.match_length = 0;
            s.ins_h = s.window[s.strstart];
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
          }
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_slow(s, flush) {
      var hash_head;
      var bflush;
      var max_insert;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        s.prev_length = s.match_length;
        s.prev_match = s.match_start;
        s.match_length = MIN_MATCH - 1;
        if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
          if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
            s.match_length = MIN_MATCH - 1;
          }
        }
        if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
          max_insert = s.strstart + s.lookahead - MIN_MATCH;
          bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
          s.lookahead -= s.prev_length - 1;
          s.prev_length -= 2;
          do {
            if (++s.strstart <= max_insert) {
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
          } while (--s.prev_length !== 0);
          s.match_available = 0;
          s.match_length = MIN_MATCH - 1;
          s.strstart++;
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        } else if (s.match_available) {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
          if (bflush) {
            flush_block_only(s, false);
          }
          s.strstart++;
          s.lookahead--;
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        } else {
          s.match_available = 1;
          s.strstart++;
          s.lookahead--;
        }
      }
      if (s.match_available) {
        bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
        s.match_available = 0;
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_rle(s, flush) {
      var bflush;
      var prev;
      var scan, strend;
      var _win = s.window;
      for (; ; ) {
        if (s.lookahead <= MAX_MATCH) {
          fill_window(s);
          if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.match_length = 0;
        if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
          scan = s.strstart - 1;
          prev = _win[scan];
          if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
            strend = s.strstart + MAX_MATCH;
            do {
            } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
            s.match_length = MAX_MATCH - (strend - scan);
            if (s.match_length > s.lookahead) {
              s.match_length = s.lookahead;
            }
          }
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          s.strstart += s.match_length;
          s.match_length = 0;
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_huff(s, flush) {
      var bflush;
      for (; ; ) {
        if (s.lookahead === 0) {
          fill_window(s);
          if (s.lookahead === 0) {
            if (flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            break;
          }
        }
        s.match_length = 0;
        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function Config(good_length, max_lazy, nice_length, max_chain, func) {
      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    }
    var configuration_table;
    configuration_table = [
      /*      good lazy nice chain */
      new Config(0, 0, 0, 0, deflate_stored),
      /* 0 store only */
      new Config(4, 4, 8, 4, deflate_fast),
      /* 1 max speed, no lazy matches */
      new Config(4, 5, 16, 8, deflate_fast),
      /* 2 */
      new Config(4, 6, 32, 32, deflate_fast),
      /* 3 */
      new Config(4, 4, 16, 16, deflate_slow),
      /* 4 lazy matches */
      new Config(8, 16, 32, 32, deflate_slow),
      /* 5 */
      new Config(8, 16, 128, 128, deflate_slow),
      /* 6 */
      new Config(8, 32, 128, 256, deflate_slow),
      /* 7 */
      new Config(32, 128, 258, 1024, deflate_slow),
      /* 8 */
      new Config(32, 258, 258, 4096, deflate_slow)
      /* 9 max compression */
    ];
    function lm_init(s) {
      s.window_size = 2 * s.w_size;
      zero(s.head);
      s.max_lazy_match = configuration_table[s.level].max_lazy;
      s.good_match = configuration_table[s.level].good_length;
      s.nice_match = configuration_table[s.level].nice_length;
      s.max_chain_length = configuration_table[s.level].max_chain;
      s.strstart = 0;
      s.block_start = 0;
      s.lookahead = 0;
      s.insert = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      s.ins_h = 0;
    }
    function DeflateState() {
      this.strm = null;
      this.status = 0;
      this.pending_buf = null;
      this.pending_buf_size = 0;
      this.pending_out = 0;
      this.pending = 0;
      this.wrap = 0;
      this.gzhead = null;
      this.gzindex = 0;
      this.method = Z_DEFLATED;
      this.last_flush = -1;
      this.w_size = 0;
      this.w_bits = 0;
      this.w_mask = 0;
      this.window = null;
      this.window_size = 0;
      this.prev = null;
      this.head = null;
      this.ins_h = 0;
      this.hash_size = 0;
      this.hash_bits = 0;
      this.hash_mask = 0;
      this.hash_shift = 0;
      this.block_start = 0;
      this.match_length = 0;
      this.prev_match = 0;
      this.match_available = 0;
      this.strstart = 0;
      this.match_start = 0;
      this.lookahead = 0;
      this.prev_length = 0;
      this.max_chain_length = 0;
      this.max_lazy_match = 0;
      this.level = 0;
      this.strategy = 0;
      this.good_match = 0;
      this.nice_match = 0;
      this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
      this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
      this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
      zero(this.dyn_ltree);
      zero(this.dyn_dtree);
      zero(this.bl_tree);
      this.l_desc = null;
      this.d_desc = null;
      this.bl_desc = null;
      this.bl_count = new utils.Buf16(MAX_BITS + 1);
      this.heap = new utils.Buf16(2 * L_CODES + 1);
      zero(this.heap);
      this.heap_len = 0;
      this.heap_max = 0;
      this.depth = new utils.Buf16(2 * L_CODES + 1);
      zero(this.depth);
      this.l_buf = 0;
      this.lit_bufsize = 0;
      this.last_lit = 0;
      this.d_buf = 0;
      this.opt_len = 0;
      this.static_len = 0;
      this.matches = 0;
      this.insert = 0;
      this.bi_buf = 0;
      this.bi_valid = 0;
    }
    function deflateResetKeep(strm) {
      var s;
      if (!strm || !strm.state) {
        return err(strm, Z_STREAM_ERROR);
      }
      strm.total_in = strm.total_out = 0;
      strm.data_type = Z_UNKNOWN;
      s = strm.state;
      s.pending = 0;
      s.pending_out = 0;
      if (s.wrap < 0) {
        s.wrap = -s.wrap;
      }
      s.status = s.wrap ? INIT_STATE : BUSY_STATE;
      strm.adler = s.wrap === 2 ? 0 : 1;
      s.last_flush = Z_NO_FLUSH;
      trees._tr_init(s);
      return Z_OK;
    }
    function deflateReset(strm) {
      var ret = deflateResetKeep(strm);
      if (ret === Z_OK) {
        lm_init(strm.state);
      }
      return ret;
    }
    function deflateSetHeader(strm, head) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      if (strm.state.wrap !== 2) {
        return Z_STREAM_ERROR;
      }
      strm.state.gzhead = head;
      return Z_OK;
    }
    function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      var wrap = 1;
      if (level === Z_DEFAULT_COMPRESSION) {
        level = 6;
      }
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else if (windowBits > 15) {
        wrap = 2;
        windowBits -= 16;
      }
      if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
        return err(strm, Z_STREAM_ERROR);
      }
      if (windowBits === 8) {
        windowBits = 9;
      }
      var s = new DeflateState();
      strm.state = s;
      s.strm = strm;
      s.wrap = wrap;
      s.gzhead = null;
      s.w_bits = windowBits;
      s.w_size = 1 << s.w_bits;
      s.w_mask = s.w_size - 1;
      s.hash_bits = memLevel + 7;
      s.hash_size = 1 << s.hash_bits;
      s.hash_mask = s.hash_size - 1;
      s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
      s.window = new utils.Buf8(s.w_size * 2);
      s.head = new utils.Buf16(s.hash_size);
      s.prev = new utils.Buf16(s.w_size);
      s.lit_bufsize = 1 << memLevel + 6;
      s.pending_buf_size = s.lit_bufsize * 4;
      s.pending_buf = new utils.Buf8(s.pending_buf_size);
      s.d_buf = 1 * s.lit_bufsize;
      s.l_buf = (1 + 2) * s.lit_bufsize;
      s.level = level;
      s.strategy = strategy;
      s.method = method;
      return deflateReset(strm);
    }
    function deflateInit(strm, level) {
      return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
    }
    function deflate(strm, flush) {
      var old_flush, s;
      var beg, val;
      if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
        return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
      }
      s = strm.state;
      if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
        return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
      }
      s.strm = strm;
      old_flush = s.last_flush;
      s.last_flush = flush;
      if (s.status === INIT_STATE) {
        if (s.wrap === 2) {
          strm.adler = 0;
          put_byte(s, 31);
          put_byte(s, 139);
          put_byte(s, 8);
          if (!s.gzhead) {
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, OS_CODE);
            s.status = BUSY_STATE;
          } else {
            put_byte(
              s,
              (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
            );
            put_byte(s, s.gzhead.time & 255);
            put_byte(s, s.gzhead.time >> 8 & 255);
            put_byte(s, s.gzhead.time >> 16 & 255);
            put_byte(s, s.gzhead.time >> 24 & 255);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, s.gzhead.os & 255);
            if (s.gzhead.extra && s.gzhead.extra.length) {
              put_byte(s, s.gzhead.extra.length & 255);
              put_byte(s, s.gzhead.extra.length >> 8 & 255);
            }
            if (s.gzhead.hcrc) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
            }
            s.gzindex = 0;
            s.status = EXTRA_STATE;
          }
        } else {
          var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
          var level_flags = -1;
          if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
            level_flags = 0;
          } else if (s.level < 6) {
            level_flags = 1;
          } else if (s.level === 6) {
            level_flags = 2;
          } else {
            level_flags = 3;
          }
          header |= level_flags << 6;
          if (s.strstart !== 0) {
            header |= PRESET_DICT;
          }
          header += 31 - header % 31;
          s.status = BUSY_STATE;
          putShortMSB(s, header);
          if (s.strstart !== 0) {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          strm.adler = 1;
        }
      }
      if (s.status === EXTRA_STATE) {
        if (s.gzhead.extra) {
          beg = s.pending;
          while (s.gzindex < (s.gzhead.extra.length & 65535)) {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                break;
              }
            }
            put_byte(s, s.gzhead.extra[s.gzindex] & 255);
            s.gzindex++;
          }
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (s.gzindex === s.gzhead.extra.length) {
            s.gzindex = 0;
            s.status = NAME_STATE;
          }
        } else {
          s.status = NAME_STATE;
        }
      }
      if (s.status === NAME_STATE) {
        if (s.gzhead.name) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.name.length) {
              val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.gzindex = 0;
            s.status = COMMENT_STATE;
          }
        } else {
          s.status = COMMENT_STATE;
        }
      }
      if (s.status === COMMENT_STATE) {
        if (s.gzhead.comment) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.comment.length) {
              val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.status = HCRC_STATE;
          }
        } else {
          s.status = HCRC_STATE;
        }
      }
      if (s.status === HCRC_STATE) {
        if (s.gzhead.hcrc) {
          if (s.pending + 2 > s.pending_buf_size) {
            flush_pending(strm);
          }
          if (s.pending + 2 <= s.pending_buf_size) {
            put_byte(s, strm.adler & 255);
            put_byte(s, strm.adler >> 8 & 255);
            strm.adler = 0;
            s.status = BUSY_STATE;
          }
        } else {
          s.status = BUSY_STATE;
        }
      }
      if (s.pending !== 0) {
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return Z_OK;
        }
      } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
        return err(strm, Z_BUF_ERROR);
      }
      if (s.status === FINISH_STATE && strm.avail_in !== 0) {
        return err(strm, Z_BUF_ERROR);
      }
      if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
        var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
        if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
          s.status = FINISH_STATE;
        }
        if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
          if (strm.avail_out === 0) {
            s.last_flush = -1;
          }
          return Z_OK;
        }
        if (bstate === BS_BLOCK_DONE) {
          if (flush === Z_PARTIAL_FLUSH) {
            trees._tr_align(s);
          } else if (flush !== Z_BLOCK) {
            trees._tr_stored_block(s, 0, 0, false);
            if (flush === Z_FULL_FLUSH) {
              zero(s.head);
              if (s.lookahead === 0) {
                s.strstart = 0;
                s.block_start = 0;
                s.insert = 0;
              }
            }
          }
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        }
      }
      if (flush !== Z_FINISH) {
        return Z_OK;
      }
      if (s.wrap <= 0) {
        return Z_STREAM_END;
      }
      if (s.wrap === 2) {
        put_byte(s, strm.adler & 255);
        put_byte(s, strm.adler >> 8 & 255);
        put_byte(s, strm.adler >> 16 & 255);
        put_byte(s, strm.adler >> 24 & 255);
        put_byte(s, strm.total_in & 255);
        put_byte(s, strm.total_in >> 8 & 255);
        put_byte(s, strm.total_in >> 16 & 255);
        put_byte(s, strm.total_in >> 24 & 255);
      } else {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 65535);
      }
      flush_pending(strm);
      if (s.wrap > 0) {
        s.wrap = -s.wrap;
      }
      return s.pending !== 0 ? Z_OK : Z_STREAM_END;
    }
    function deflateEnd(strm) {
      var status;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      status = strm.state.status;
      if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
        return err(strm, Z_STREAM_ERROR);
      }
      strm.state = null;
      return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
    }
    function deflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var s;
      var str, n;
      var wrap;
      var avail;
      var next;
      var input;
      var tmpDict;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      s = strm.state;
      wrap = s.wrap;
      if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
        return Z_STREAM_ERROR;
      }
      if (wrap === 1) {
        strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
      }
      s.wrap = 0;
      if (dictLength >= s.w_size) {
        if (wrap === 0) {
          zero(s.head);
          s.strstart = 0;
          s.block_start = 0;
          s.insert = 0;
        }
        tmpDict = new utils.Buf8(s.w_size);
        utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
        dictionary = tmpDict;
        dictLength = s.w_size;
      }
      avail = strm.avail_in;
      next = strm.next_in;
      input = strm.input;
      strm.avail_in = dictLength;
      strm.next_in = 0;
      strm.input = dictionary;
      fill_window(s);
      while (s.lookahead >= MIN_MATCH) {
        str = s.strstart;
        n = s.lookahead - (MIN_MATCH - 1);
        do {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
        } while (--n);
        s.strstart = str;
        s.lookahead = MIN_MATCH - 1;
        fill_window(s);
      }
      s.strstart += s.lookahead;
      s.block_start = s.strstart;
      s.insert = s.lookahead;
      s.lookahead = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      strm.next_in = next;
      strm.input = input;
      strm.avail_in = avail;
      s.wrap = wrap;
      return Z_OK;
    }
    exports2.deflateInit = deflateInit;
    exports2.deflateInit2 = deflateInit2;
    exports2.deflateReset = deflateReset;
    exports2.deflateResetKeep = deflateResetKeep;
    exports2.deflateSetHeader = deflateSetHeader;
    exports2.deflate = deflate;
    exports2.deflateEnd = deflateEnd;
    exports2.deflateSetDictionary = deflateSetDictionary;
    exports2.deflateInfo = "pako deflate (from Nodeca project)";
  }
});

// node_modules/pako/lib/utils/strings.js
var require_strings = __commonJS({
  "node_modules/pako/lib/utils/strings.js"(exports2) {
    "use strict";
    var utils = require_common();
    var STR_APPLY_OK = true;
    var STR_APPLY_UIA_OK = true;
    try {
      String.fromCharCode.apply(null, [0]);
    } catch (__) {
      STR_APPLY_OK = false;
    }
    try {
      String.fromCharCode.apply(null, new Uint8Array(1));
    } catch (__) {
      STR_APPLY_UIA_OK = false;
    }
    var _utf8len = new utils.Buf8(256);
    for (q = 0; q < 256; q++) {
      _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
    }
    var q;
    _utf8len[254] = _utf8len[254] = 1;
    exports2.string2buf = function(str) {
      var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      buf = new utils.Buf8(buf_len);
      for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i++] = c;
        } else if (c < 2048) {
          buf[i++] = 192 | c >>> 6;
          buf[i++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i++] = 224 | c >>> 12;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        } else {
          buf[i++] = 240 | c >>> 18;
          buf[i++] = 128 | c >>> 12 & 63;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        }
      }
      return buf;
    };
    function buf2binstring(buf, len) {
      if (len < 65534) {
        if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
          return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
        }
      }
      var result = "";
      for (var i = 0; i < len; i++) {
        result += String.fromCharCode(buf[i]);
      }
      return result;
    }
    exports2.buf2binstring = function(buf) {
      return buf2binstring(buf, buf.length);
    };
    exports2.binstring2buf = function(str) {
      var buf = new utils.Buf8(str.length);
      for (var i = 0, len = buf.length; i < len; i++) {
        buf[i] = str.charCodeAt(i);
      }
      return buf;
    };
    exports2.buf2string = function(buf, max) {
      var i, out, c, c_len;
      var len = max || buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i = 0; i < len; ) {
        c = buf[i++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i < len) {
          c = c << 6 | buf[i++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      return buf2binstring(utf16buf, out);
    };
    exports2.utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len[buf[pos]] > max ? pos : max;
    };
  }
});

// node_modules/pako/lib/zlib/zstream.js
var require_zstream = __commonJS({
  "node_modules/pako/lib/zlib/zstream.js"(exports2, module2) {
    "use strict";
    function ZStream() {
      this.input = null;
      this.next_in = 0;
      this.avail_in = 0;
      this.total_in = 0;
      this.output = null;
      this.next_out = 0;
      this.avail_out = 0;
      this.total_out = 0;
      this.msg = "";
      this.state = null;
      this.data_type = 2;
      this.adler = 0;
    }
    module2.exports = ZStream;
  }
});

// node_modules/pako/lib/deflate.js
var require_deflate2 = __commonJS({
  "node_modules/pako/lib/deflate.js"(exports2) {
    "use strict";
    var zlib_deflate = require_deflate();
    var utils = require_common();
    var strings = require_strings();
    var msg = require_messages();
    var ZStream = require_zstream();
    var toString = Object.prototype.toString;
    var Z_NO_FLUSH = 0;
    var Z_FINISH = 4;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_SYNC_FLUSH = 2;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_DEFLATED = 8;
    function Deflate(options) {
      if (!(this instanceof Deflate))
        return new Deflate(options);
      this.options = utils.assign({
        level: Z_DEFAULT_COMPRESSION,
        method: Z_DEFLATED,
        chunkSize: 16384,
        windowBits: 15,
        memLevel: 8,
        strategy: Z_DEFAULT_STRATEGY,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits > 0) {
        opt.windowBits = -opt.windowBits;
      } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
        opt.windowBits += 16;
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_deflate.deflateInit2(
        this.strm,
        opt.level,
        opt.method,
        opt.windowBits,
        opt.memLevel,
        opt.strategy
      );
      if (status !== Z_OK) {
        throw new Error(msg[status]);
      }
      if (opt.header) {
        zlib_deflate.deflateSetHeader(this.strm, opt.header);
      }
      if (opt.dictionary) {
        var dict;
        if (typeof opt.dictionary === "string") {
          dict = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          dict = new Uint8Array(opt.dictionary);
        } else {
          dict = opt.dictionary;
        }
        status = zlib_deflate.deflateSetDictionary(this.strm, dict);
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        this._dict_set = true;
      }
    }
    Deflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var status, _mode;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.string2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_deflate.deflate(strm, _mode);
        if (status !== Z_STREAM_END && status !== Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH)) {
          if (this.options.to === "string") {
            this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
          } else {
            this.onData(utils.shrinkBuf(strm.output, strm.next_out));
          }
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
      if (_mode === Z_FINISH) {
        status = zlib_deflate.deflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === Z_OK;
      }
      if (_mode === Z_SYNC_FLUSH) {
        this.onEnd(Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Deflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Deflate.prototype.onEnd = function(status) {
      if (status === Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function deflate(input, options) {
      var deflator = new Deflate(options);
      deflator.push(input, true);
      if (deflator.err) {
        throw deflator.msg || msg[deflator.err];
      }
      return deflator.result;
    }
    function deflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return deflate(input, options);
    }
    function gzip(input, options) {
      options = options || {};
      options.gzip = true;
      return deflate(input, options);
    }
    exports2.Deflate = Deflate;
    exports2.deflate = deflate;
    exports2.deflateRaw = deflateRaw;
    exports2.gzip = gzip;
  }
});

// node_modules/pako/lib/zlib/inffast.js
var require_inffast = __commonJS({
  "node_modules/pako/lib/zlib/inffast.js"(exports2, module2) {
    "use strict";
    var BAD = 30;
    var TYPE = 12;
    module2.exports = function inflate_fast(strm, start) {
      var state;
      var _in;
      var last;
      var _out;
      var beg;
      var end;
      var dmax;
      var wsize;
      var whave;
      var wnext;
      var s_window;
      var hold;
      var bits;
      var lcode;
      var dcode;
      var lmask;
      var dmask;
      var here;
      var op;
      var len;
      var dist;
      var from;
      var from_source;
      var input, output;
      state = strm.state;
      _in = strm.next_in;
      input = strm.input;
      last = _in + (strm.avail_in - 5);
      _out = strm.next_out;
      output = strm.output;
      beg = _out - (start - strm.avail_out);
      end = _out + (strm.avail_out - 257);
      dmax = state.dmax;
      wsize = state.wsize;
      whave = state.whave;
      wnext = state.wnext;
      s_window = state.window;
      hold = state.hold;
      bits = state.bits;
      lcode = state.lencode;
      dcode = state.distcode;
      lmask = (1 << state.lenbits) - 1;
      dmask = (1 << state.distbits) - 1;
      top:
        do {
          if (bits < 15) {
            hold += input[_in++] << bits;
            bits += 8;
            hold += input[_in++] << bits;
            bits += 8;
          }
          here = lcode[hold & lmask];
          dolen:
            for (; ; ) {
              op = here >>> 24;
              hold >>>= op;
              bits -= op;
              op = here >>> 16 & 255;
              if (op === 0) {
                output[_out++] = here & 65535;
              } else if (op & 16) {
                len = here & 65535;
                op &= 15;
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & (1 << op) - 1;
                  hold >>>= op;
                  bits -= op;
                }
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];
                dodist:
                  for (; ; ) {
                    op = here >>> 24;
                    hold >>>= op;
                    bits -= op;
                    op = here >>> 16 & 255;
                    if (op & 16) {
                      dist = here & 65535;
                      op &= 15;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                        }
                      }
                      dist += hold & (1 << op) - 1;
                      if (dist > dmax) {
                        strm.msg = "invalid distance too far back";
                        state.mode = BAD;
                        break top;
                      }
                      hold >>>= op;
                      bits -= op;
                      op = _out - beg;
                      if (dist > op) {
                        op = dist - op;
                        if (op > whave) {
                          if (state.sane) {
                            strm.msg = "invalid distance too far back";
                            state.mode = BAD;
                            break top;
                          }
                        }
                        from = 0;
                        from_source = s_window;
                        if (wnext === 0) {
                          from += wsize - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        } else if (wnext < op) {
                          from += wsize + wnext - op;
                          op -= wnext;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = 0;
                            if (wnext < len) {
                              op = wnext;
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          }
                        } else {
                          from += wnext - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                        while (len > 2) {
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          len -= 3;
                        }
                        if (len) {
                          output[_out++] = from_source[from++];
                          if (len > 1) {
                            output[_out++] = from_source[from++];
                          }
                        }
                      } else {
                        from = _out - dist;
                        do {
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          len -= 3;
                        } while (len > 2);
                        if (len) {
                          output[_out++] = output[from++];
                          if (len > 1) {
                            output[_out++] = output[from++];
                          }
                        }
                      }
                    } else if ((op & 64) === 0) {
                      here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                      continue dodist;
                    } else {
                      strm.msg = "invalid distance code";
                      state.mode = BAD;
                      break top;
                    }
                    break;
                  }
              } else if ((op & 64) === 0) {
                here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                continue dolen;
              } else if (op & 32) {
                state.mode = TYPE;
                break top;
              } else {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break top;
              }
              break;
            }
        } while (_in < last && _out < end);
      len = bits >> 3;
      _in -= len;
      bits -= len << 3;
      hold &= (1 << bits) - 1;
      strm.next_in = _in;
      strm.next_out = _out;
      strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
      strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
      state.hold = hold;
      state.bits = bits;
      return;
    };
  }
});

// node_modules/pako/lib/zlib/inftrees.js
var require_inftrees = __commonJS({
  "node_modules/pako/lib/zlib/inftrees.js"(exports2, module2) {
    "use strict";
    var utils = require_common();
    var MAXBITS = 15;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var lbase = [
      /* Length codes 257..285 base */
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      13,
      15,
      17,
      19,
      23,
      27,
      31,
      35,
      43,
      51,
      59,
      67,
      83,
      99,
      115,
      131,
      163,
      195,
      227,
      258,
      0,
      0
    ];
    var lext = [
      /* Length codes 257..285 extra */
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      17,
      17,
      17,
      17,
      18,
      18,
      18,
      18,
      19,
      19,
      19,
      19,
      20,
      20,
      20,
      20,
      21,
      21,
      21,
      21,
      16,
      72,
      78
    ];
    var dbase = [
      /* Distance codes 0..29 base */
      1,
      2,
      3,
      4,
      5,
      7,
      9,
      13,
      17,
      25,
      33,
      49,
      65,
      97,
      129,
      193,
      257,
      385,
      513,
      769,
      1025,
      1537,
      2049,
      3073,
      4097,
      6145,
      8193,
      12289,
      16385,
      24577,
      0,
      0
    ];
    var dext = [
      /* Distance codes 0..29 extra */
      16,
      16,
      16,
      16,
      17,
      17,
      18,
      18,
      19,
      19,
      20,
      20,
      21,
      21,
      22,
      22,
      23,
      23,
      24,
      24,
      25,
      25,
      26,
      26,
      27,
      27,
      28,
      28,
      29,
      29,
      64,
      64
    ];
    module2.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
      var bits = opts.bits;
      var len = 0;
      var sym = 0;
      var min = 0, max = 0;
      var root = 0;
      var curr = 0;
      var drop = 0;
      var left = 0;
      var used = 0;
      var huff = 0;
      var incr;
      var fill;
      var low;
      var mask;
      var next;
      var base = null;
      var base_index = 0;
      var end;
      var count = new utils.Buf16(MAXBITS + 1);
      var offs = new utils.Buf16(MAXBITS + 1);
      var extra = null;
      var extra_index = 0;
      var here_bits, here_op, here_val;
      for (len = 0; len <= MAXBITS; len++) {
        count[len] = 0;
      }
      for (sym = 0; sym < codes; sym++) {
        count[lens[lens_index + sym]]++;
      }
      root = bits;
      for (max = MAXBITS; max >= 1; max--) {
        if (count[max] !== 0) {
          break;
        }
      }
      if (root > max) {
        root = max;
      }
      if (max === 0) {
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        opts.bits = 1;
        return 0;
      }
      for (min = 1; min < max; min++) {
        if (count[min] !== 0) {
          break;
        }
      }
      if (root < min) {
        root = min;
      }
      left = 1;
      for (len = 1; len <= MAXBITS; len++) {
        left <<= 1;
        left -= count[len];
        if (left < 0) {
          return -1;
        }
      }
      if (left > 0 && (type === CODES || max !== 1)) {
        return -1;
      }
      offs[1] = 0;
      for (len = 1; len < MAXBITS; len++) {
        offs[len + 1] = offs[len] + count[len];
      }
      for (sym = 0; sym < codes; sym++) {
        if (lens[lens_index + sym] !== 0) {
          work[offs[lens[lens_index + sym]]++] = sym;
        }
      }
      if (type === CODES) {
        base = extra = work;
        end = 19;
      } else if (type === LENS) {
        base = lbase;
        base_index -= 257;
        extra = lext;
        extra_index -= 257;
        end = 256;
      } else {
        base = dbase;
        extra = dext;
        end = -1;
      }
      huff = 0;
      sym = 0;
      len = min;
      next = table_index;
      curr = root;
      drop = 0;
      low = -1;
      used = 1 << root;
      mask = used - 1;
      if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
        return 1;
      }
      for (; ; ) {
        here_bits = len - drop;
        if (work[sym] < end) {
          here_op = 0;
          here_val = work[sym];
        } else if (work[sym] > end) {
          here_op = extra[extra_index + work[sym]];
          here_val = base[base_index + work[sym]];
        } else {
          here_op = 32 + 64;
          here_val = 0;
        }
        incr = 1 << len - drop;
        fill = 1 << curr;
        min = fill;
        do {
          fill -= incr;
          table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
        } while (fill !== 0);
        incr = 1 << len - 1;
        while (huff & incr) {
          incr >>= 1;
        }
        if (incr !== 0) {
          huff &= incr - 1;
          huff += incr;
        } else {
          huff = 0;
        }
        sym++;
        if (--count[len] === 0) {
          if (len === max) {
            break;
          }
          len = lens[lens_index + work[sym]];
        }
        if (len > root && (huff & mask) !== low) {
          if (drop === 0) {
            drop = root;
          }
          next += min;
          curr = len - drop;
          left = 1 << curr;
          while (curr + drop < max) {
            left -= count[curr + drop];
            if (left <= 0) {
              break;
            }
            curr++;
            left <<= 1;
          }
          used += 1 << curr;
          if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
            return 1;
          }
          low = huff & mask;
          table[low] = root << 24 | curr << 16 | next - table_index | 0;
        }
      }
      if (huff !== 0) {
        table[next + huff] = len - drop << 24 | 64 << 16 | 0;
      }
      opts.bits = root;
      return 0;
    };
  }
});

// node_modules/pako/lib/zlib/inflate.js
var require_inflate = __commonJS({
  "node_modules/pako/lib/zlib/inflate.js"(exports2) {
    "use strict";
    var utils = require_common();
    var adler32 = require_adler32();
    var crc32 = require_crc322();
    var inflate_fast = require_inffast();
    var inflate_table = require_inftrees();
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_TREES = 6;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_NEED_DICT = 2;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_MEM_ERROR = -4;
    var Z_BUF_ERROR = -5;
    var Z_DEFLATED = 8;
    var HEAD = 1;
    var FLAGS = 2;
    var TIME = 3;
    var OS = 4;
    var EXLEN = 5;
    var EXTRA = 6;
    var NAME = 7;
    var COMMENT = 8;
    var HCRC = 9;
    var DICTID = 10;
    var DICT = 11;
    var TYPE = 12;
    var TYPEDO = 13;
    var STORED = 14;
    var COPY_ = 15;
    var COPY = 16;
    var TABLE = 17;
    var LENLENS = 18;
    var CODELENS = 19;
    var LEN_ = 20;
    var LEN = 21;
    var LENEXT = 22;
    var DIST = 23;
    var DISTEXT = 24;
    var MATCH = 25;
    var LIT = 26;
    var CHECK = 27;
    var LENGTH = 28;
    var DONE = 29;
    var BAD = 30;
    var MEM = 31;
    var SYNC = 32;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var MAX_WBITS = 15;
    var DEF_WBITS = MAX_WBITS;
    function zswap32(q) {
      return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
    }
    function InflateState() {
      this.mode = 0;
      this.last = false;
      this.wrap = 0;
      this.havedict = false;
      this.flags = 0;
      this.dmax = 0;
      this.check = 0;
      this.total = 0;
      this.head = null;
      this.wbits = 0;
      this.wsize = 0;
      this.whave = 0;
      this.wnext = 0;
      this.window = null;
      this.hold = 0;
      this.bits = 0;
      this.length = 0;
      this.offset = 0;
      this.extra = 0;
      this.lencode = null;
      this.distcode = null;
      this.lenbits = 0;
      this.distbits = 0;
      this.ncode = 0;
      this.nlen = 0;
      this.ndist = 0;
      this.have = 0;
      this.next = null;
      this.lens = new utils.Buf16(320);
      this.work = new utils.Buf16(288);
      this.lendyn = null;
      this.distdyn = null;
      this.sane = 0;
      this.back = 0;
      this.was = 0;
    }
    function inflateResetKeep(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      strm.total_in = strm.total_out = state.total = 0;
      strm.msg = "";
      if (state.wrap) {
        strm.adler = state.wrap & 1;
      }
      state.mode = HEAD;
      state.last = 0;
      state.havedict = 0;
      state.dmax = 32768;
      state.head = null;
      state.hold = 0;
      state.bits = 0;
      state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
      state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
      state.sane = 1;
      state.back = -1;
      return Z_OK;
    }
    function inflateReset(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      state.wsize = 0;
      state.whave = 0;
      state.wnext = 0;
      return inflateResetKeep(strm);
    }
    function inflateReset2(strm, windowBits) {
      var wrap;
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else {
        wrap = (windowBits >> 4) + 1;
        if (windowBits < 48) {
          windowBits &= 15;
        }
      }
      if (windowBits && (windowBits < 8 || windowBits > 15)) {
        return Z_STREAM_ERROR;
      }
      if (state.window !== null && state.wbits !== windowBits) {
        state.window = null;
      }
      state.wrap = wrap;
      state.wbits = windowBits;
      return inflateReset(strm);
    }
    function inflateInit2(strm, windowBits) {
      var ret;
      var state;
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      state = new InflateState();
      strm.state = state;
      state.window = null;
      ret = inflateReset2(strm, windowBits);
      if (ret !== Z_OK) {
        strm.state = null;
      }
      return ret;
    }
    function inflateInit(strm) {
      return inflateInit2(strm, DEF_WBITS);
    }
    var virgin = true;
    var lenfix;
    var distfix;
    function fixedtables(state) {
      if (virgin) {
        var sym;
        lenfix = new utils.Buf32(512);
        distfix = new utils.Buf32(32);
        sym = 0;
        while (sym < 144) {
          state.lens[sym++] = 8;
        }
        while (sym < 256) {
          state.lens[sym++] = 9;
        }
        while (sym < 280) {
          state.lens[sym++] = 7;
        }
        while (sym < 288) {
          state.lens[sym++] = 8;
        }
        inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
        sym = 0;
        while (sym < 32) {
          state.lens[sym++] = 5;
        }
        inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
        virgin = false;
      }
      state.lencode = lenfix;
      state.lenbits = 9;
      state.distcode = distfix;
      state.distbits = 5;
    }
    function updatewindow(strm, src, end, copy) {
      var dist;
      var state = strm.state;
      if (state.window === null) {
        state.wsize = 1 << state.wbits;
        state.wnext = 0;
        state.whave = 0;
        state.window = new utils.Buf8(state.wsize);
      }
      if (copy >= state.wsize) {
        utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
        state.wnext = 0;
        state.whave = state.wsize;
      } else {
        dist = state.wsize - state.wnext;
        if (dist > copy) {
          dist = copy;
        }
        utils.arraySet(state.window, src, end - copy, dist, state.wnext);
        copy -= dist;
        if (copy) {
          utils.arraySet(state.window, src, end - copy, copy, 0);
          state.wnext = copy;
          state.whave = state.wsize;
        } else {
          state.wnext += dist;
          if (state.wnext === state.wsize) {
            state.wnext = 0;
          }
          if (state.whave < state.wsize) {
            state.whave += dist;
          }
        }
      }
      return 0;
    }
    function inflate(strm, flush) {
      var state;
      var input, output;
      var next;
      var put;
      var have, left;
      var hold;
      var bits;
      var _in, _out;
      var copy;
      var from;
      var from_source;
      var here = 0;
      var here_bits, here_op, here_val;
      var last_bits, last_op, last_val;
      var len;
      var ret;
      var hbuf = new utils.Buf8(4);
      var opts;
      var n;
      var order = (
        /* permutation of code lengths */
        [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
      );
      if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.mode === TYPE) {
        state.mode = TYPEDO;
      }
      put = strm.next_out;
      output = strm.output;
      left = strm.avail_out;
      next = strm.next_in;
      input = strm.input;
      have = strm.avail_in;
      hold = state.hold;
      bits = state.bits;
      _in = have;
      _out = left;
      ret = Z_OK;
      inf_leave:
        for (; ; ) {
          switch (state.mode) {
            case HEAD:
              if (state.wrap === 0) {
                state.mode = TYPEDO;
                break;
              }
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.wrap & 2 && hold === 35615) {
                state.check = 0;
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
                hold = 0;
                bits = 0;
                state.mode = FLAGS;
                break;
              }
              state.flags = 0;
              if (state.head) {
                state.head.done = false;
              }
              if (!(state.wrap & 1) || /* check if zlib header allowed */
              (((hold & 255) << 8) + (hold >> 8)) % 31) {
                strm.msg = "incorrect header check";
                state.mode = BAD;
                break;
              }
              if ((hold & 15) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              hold >>>= 4;
              bits -= 4;
              len = (hold & 15) + 8;
              if (state.wbits === 0) {
                state.wbits = len;
              } else if (len > state.wbits) {
                strm.msg = "invalid window size";
                state.mode = BAD;
                break;
              }
              state.dmax = 1 << len;
              strm.adler = state.check = 1;
              state.mode = hold & 512 ? DICTID : TYPE;
              hold = 0;
              bits = 0;
              break;
            case FLAGS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.flags = hold;
              if ((state.flags & 255) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              if (state.flags & 57344) {
                strm.msg = "unknown header flags set";
                state.mode = BAD;
                break;
              }
              if (state.head) {
                state.head.text = hold >> 8 & 1;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = TIME;
            case TIME:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.time = hold;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                hbuf[2] = hold >>> 16 & 255;
                hbuf[3] = hold >>> 24 & 255;
                state.check = crc32(state.check, hbuf, 4, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = OS;
            case OS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.xflags = hold & 255;
                state.head.os = hold >> 8;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = EXLEN;
            case EXLEN:
              if (state.flags & 1024) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length = hold;
                if (state.head) {
                  state.head.extra_len = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
              } else if (state.head) {
                state.head.extra = null;
              }
              state.mode = EXTRA;
            case EXTRA:
              if (state.flags & 1024) {
                copy = state.length;
                if (copy > have) {
                  copy = have;
                }
                if (copy) {
                  if (state.head) {
                    len = state.head.extra_len - state.length;
                    if (!state.head.extra) {
                      state.head.extra = new Array(state.head.extra_len);
                    }
                    utils.arraySet(
                      state.head.extra,
                      input,
                      next,
                      // extra field is limited to 65536 bytes
                      // - no need for additional size check
                      copy,
                      /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                      len
                    );
                  }
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  state.length -= copy;
                }
                if (state.length) {
                  break inf_leave;
                }
              }
              state.length = 0;
              state.mode = NAME;
            case NAME:
              if (state.flags & 2048) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.name += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.name = null;
              }
              state.length = 0;
              state.mode = COMMENT;
            case COMMENT:
              if (state.flags & 4096) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.comment += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.comment = null;
              }
              state.mode = HCRC;
            case HCRC:
              if (state.flags & 512) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.check & 65535)) {
                  strm.msg = "header crc mismatch";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              if (state.head) {
                state.head.hcrc = state.flags >> 9 & 1;
                state.head.done = true;
              }
              strm.adler = state.check = 0;
              state.mode = TYPE;
              break;
            case DICTID:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              strm.adler = state.check = zswap32(hold);
              hold = 0;
              bits = 0;
              state.mode = DICT;
            case DICT:
              if (state.havedict === 0) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                return Z_NEED_DICT;
              }
              strm.adler = state.check = 1;
              state.mode = TYPE;
            case TYPE:
              if (flush === Z_BLOCK || flush === Z_TREES) {
                break inf_leave;
              }
            case TYPEDO:
              if (state.last) {
                hold >>>= bits & 7;
                bits -= bits & 7;
                state.mode = CHECK;
                break;
              }
              while (bits < 3) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.last = hold & 1;
              hold >>>= 1;
              bits -= 1;
              switch (hold & 3) {
                case 0:
                  state.mode = STORED;
                  break;
                case 1:
                  fixedtables(state);
                  state.mode = LEN_;
                  if (flush === Z_TREES) {
                    hold >>>= 2;
                    bits -= 2;
                    break inf_leave;
                  }
                  break;
                case 2:
                  state.mode = TABLE;
                  break;
                case 3:
                  strm.msg = "invalid block type";
                  state.mode = BAD;
              }
              hold >>>= 2;
              bits -= 2;
              break;
            case STORED:
              hold >>>= bits & 7;
              bits -= bits & 7;
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                strm.msg = "invalid stored block lengths";
                state.mode = BAD;
                break;
              }
              state.length = hold & 65535;
              hold = 0;
              bits = 0;
              state.mode = COPY_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            case COPY_:
              state.mode = COPY;
            case COPY:
              copy = state.length;
              if (copy) {
                if (copy > have) {
                  copy = have;
                }
                if (copy > left) {
                  copy = left;
                }
                if (copy === 0) {
                  break inf_leave;
                }
                utils.arraySet(output, input, next, copy, put);
                have -= copy;
                next += copy;
                left -= copy;
                put += copy;
                state.length -= copy;
                break;
              }
              state.mode = TYPE;
              break;
            case TABLE:
              while (bits < 14) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.nlen = (hold & 31) + 257;
              hold >>>= 5;
              bits -= 5;
              state.ndist = (hold & 31) + 1;
              hold >>>= 5;
              bits -= 5;
              state.ncode = (hold & 15) + 4;
              hold >>>= 4;
              bits -= 4;
              if (state.nlen > 286 || state.ndist > 30) {
                strm.msg = "too many length or distance symbols";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = LENLENS;
            case LENLENS:
              while (state.have < state.ncode) {
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.lens[order[state.have++]] = hold & 7;
                hold >>>= 3;
                bits -= 3;
              }
              while (state.have < 19) {
                state.lens[order[state.have++]] = 0;
              }
              state.lencode = state.lendyn;
              state.lenbits = 7;
              opts = { bits: state.lenbits };
              ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid code lengths set";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = CODELENS;
            case CODELENS:
              while (state.have < state.nlen + state.ndist) {
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_val < 16) {
                  hold >>>= here_bits;
                  bits -= here_bits;
                  state.lens[state.have++] = here_val;
                } else {
                  if (here_val === 16) {
                    n = here_bits + 2;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    if (state.have === 0) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    len = state.lens[state.have - 1];
                    copy = 3 + (hold & 3);
                    hold >>>= 2;
                    bits -= 2;
                  } else if (here_val === 17) {
                    n = here_bits + 3;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 3 + (hold & 7);
                    hold >>>= 3;
                    bits -= 3;
                  } else {
                    n = here_bits + 7;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 11 + (hold & 127);
                    hold >>>= 7;
                    bits -= 7;
                  }
                  if (state.have + copy > state.nlen + state.ndist) {
                    strm.msg = "invalid bit length repeat";
                    state.mode = BAD;
                    break;
                  }
                  while (copy--) {
                    state.lens[state.have++] = len;
                  }
                }
              }
              if (state.mode === BAD) {
                break;
              }
              if (state.lens[256] === 0) {
                strm.msg = "invalid code -- missing end-of-block";
                state.mode = BAD;
                break;
              }
              state.lenbits = 9;
              opts = { bits: state.lenbits };
              ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid literal/lengths set";
                state.mode = BAD;
                break;
              }
              state.distbits = 6;
              state.distcode = state.distdyn;
              opts = { bits: state.distbits };
              ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
              state.distbits = opts.bits;
              if (ret) {
                strm.msg = "invalid distances set";
                state.mode = BAD;
                break;
              }
              state.mode = LEN_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            case LEN_:
              state.mode = LEN;
            case LEN:
              if (have >= 6 && left >= 258) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                inflate_fast(strm, _out);
                put = strm.next_out;
                output = strm.output;
                left = strm.avail_out;
                next = strm.next_in;
                input = strm.input;
                have = strm.avail_in;
                hold = state.hold;
                bits = state.bits;
                if (state.mode === TYPE) {
                  state.back = -1;
                }
                break;
              }
              state.back = 0;
              for (; ; ) {
                here = state.lencode[hold & (1 << state.lenbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (here_op && (here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              state.length = here_val;
              if (here_op === 0) {
                state.mode = LIT;
                break;
              }
              if (here_op & 32) {
                state.back = -1;
                state.mode = TYPE;
                break;
              }
              if (here_op & 64) {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break;
              }
              state.extra = here_op & 15;
              state.mode = LENEXT;
            case LENEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              state.was = state.length;
              state.mode = DIST;
            case DIST:
              for (; ; ) {
                here = state.distcode[hold & (1 << state.distbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              if (here_op & 64) {
                strm.msg = "invalid distance code";
                state.mode = BAD;
                break;
              }
              state.offset = here_val;
              state.extra = here_op & 15;
              state.mode = DISTEXT;
            case DISTEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.offset += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              if (state.offset > state.dmax) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD;
                break;
              }
              state.mode = MATCH;
            case MATCH:
              if (left === 0) {
                break inf_leave;
              }
              copy = _out - left;
              if (state.offset > copy) {
                copy = state.offset - copy;
                if (copy > state.whave) {
                  if (state.sane) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD;
                    break;
                  }
                }
                if (copy > state.wnext) {
                  copy -= state.wnext;
                  from = state.wsize - copy;
                } else {
                  from = state.wnext - copy;
                }
                if (copy > state.length) {
                  copy = state.length;
                }
                from_source = state.window;
              } else {
                from_source = output;
                from = put - state.offset;
                copy = state.length;
              }
              if (copy > left) {
                copy = left;
              }
              left -= copy;
              state.length -= copy;
              do {
                output[put++] = from_source[from++];
              } while (--copy);
              if (state.length === 0) {
                state.mode = LEN;
              }
              break;
            case LIT:
              if (left === 0) {
                break inf_leave;
              }
              output[put++] = state.length;
              left--;
              state.mode = LEN;
              break;
            case CHECK:
              if (state.wrap) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold |= input[next++] << bits;
                  bits += 8;
                }
                _out -= left;
                strm.total_out += _out;
                state.total += _out;
                if (_out) {
                  strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                  state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
                }
                _out = left;
                if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                  strm.msg = "incorrect data check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = LENGTH;
            case LENGTH:
              if (state.wrap && state.flags) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.total & 4294967295)) {
                  strm.msg = "incorrect length check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = DONE;
            case DONE:
              ret = Z_STREAM_END;
              break inf_leave;
            case BAD:
              ret = Z_DATA_ERROR;
              break inf_leave;
            case MEM:
              return Z_MEM_ERROR;
            case SYNC:
            default:
              return Z_STREAM_ERROR;
          }
        }
      strm.next_out = put;
      strm.avail_out = left;
      strm.next_in = next;
      strm.avail_in = have;
      state.hold = hold;
      state.bits = bits;
      if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
        if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
          state.mode = MEM;
          return Z_MEM_ERROR;
        }
      }
      _in -= strm.avail_in;
      _out -= strm.avail_out;
      strm.total_in += _in;
      strm.total_out += _out;
      state.total += _out;
      if (state.wrap && _out) {
        strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
        state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
      }
      strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
      if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
        ret = Z_BUF_ERROR;
      }
      return ret;
    }
    function inflateEnd(strm) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      var state = strm.state;
      if (state.window) {
        state.window = null;
      }
      strm.state = null;
      return Z_OK;
    }
    function inflateGetHeader(strm, head) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if ((state.wrap & 2) === 0) {
        return Z_STREAM_ERROR;
      }
      state.head = head;
      head.done = false;
      return Z_OK;
    }
    function inflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var state;
      var dictid;
      var ret;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.wrap !== 0 && state.mode !== DICT) {
        return Z_STREAM_ERROR;
      }
      if (state.mode === DICT) {
        dictid = 1;
        dictid = adler32(dictid, dictionary, dictLength, 0);
        if (dictid !== state.check) {
          return Z_DATA_ERROR;
        }
      }
      ret = updatewindow(strm, dictionary, dictLength, dictLength);
      if (ret) {
        state.mode = MEM;
        return Z_MEM_ERROR;
      }
      state.havedict = 1;
      return Z_OK;
    }
    exports2.inflateReset = inflateReset;
    exports2.inflateReset2 = inflateReset2;
    exports2.inflateResetKeep = inflateResetKeep;
    exports2.inflateInit = inflateInit;
    exports2.inflateInit2 = inflateInit2;
    exports2.inflate = inflate;
    exports2.inflateEnd = inflateEnd;
    exports2.inflateGetHeader = inflateGetHeader;
    exports2.inflateSetDictionary = inflateSetDictionary;
    exports2.inflateInfo = "pako inflate (from Nodeca project)";
  }
});

// node_modules/pako/lib/zlib/constants.js
var require_constants = __commonJS({
  "node_modules/pako/lib/zlib/constants.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /* Allowed flush values; see deflate() and inflate() below for details */
      Z_NO_FLUSH: 0,
      Z_PARTIAL_FLUSH: 1,
      Z_SYNC_FLUSH: 2,
      Z_FULL_FLUSH: 3,
      Z_FINISH: 4,
      Z_BLOCK: 5,
      Z_TREES: 6,
      /* Return codes for the compression/decompression functions. Negative values
      * are errors, positive values are used for special but normal events.
      */
      Z_OK: 0,
      Z_STREAM_END: 1,
      Z_NEED_DICT: 2,
      Z_ERRNO: -1,
      Z_STREAM_ERROR: -2,
      Z_DATA_ERROR: -3,
      //Z_MEM_ERROR:     -4,
      Z_BUF_ERROR: -5,
      //Z_VERSION_ERROR: -6,
      /* compression levels */
      Z_NO_COMPRESSION: 0,
      Z_BEST_SPEED: 1,
      Z_BEST_COMPRESSION: 9,
      Z_DEFAULT_COMPRESSION: -1,
      Z_FILTERED: 1,
      Z_HUFFMAN_ONLY: 2,
      Z_RLE: 3,
      Z_FIXED: 4,
      Z_DEFAULT_STRATEGY: 0,
      /* Possible values of the data_type field (though see inflate()) */
      Z_BINARY: 0,
      Z_TEXT: 1,
      //Z_ASCII:                1, // = Z_TEXT (deprecated)
      Z_UNKNOWN: 2,
      /* The deflate compression method */
      Z_DEFLATED: 8
      //Z_NULL:                 null // Use -1 or null inline, depending on var type
    };
  }
});

// node_modules/pako/lib/zlib/gzheader.js
var require_gzheader = __commonJS({
  "node_modules/pako/lib/zlib/gzheader.js"(exports2, module2) {
    "use strict";
    function GZheader() {
      this.text = 0;
      this.time = 0;
      this.xflags = 0;
      this.os = 0;
      this.extra = null;
      this.extra_len = 0;
      this.name = "";
      this.comment = "";
      this.hcrc = 0;
      this.done = false;
    }
    module2.exports = GZheader;
  }
});

// node_modules/pako/lib/inflate.js
var require_inflate2 = __commonJS({
  "node_modules/pako/lib/inflate.js"(exports2) {
    "use strict";
    var zlib_inflate = require_inflate();
    var utils = require_common();
    var strings = require_strings();
    var c = require_constants();
    var msg = require_messages();
    var ZStream = require_zstream();
    var GZheader = require_gzheader();
    var toString = Object.prototype.toString;
    function Inflate(options) {
      if (!(this instanceof Inflate))
        return new Inflate(options);
      this.options = utils.assign({
        chunkSize: 16384,
        windowBits: 0,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
        opt.windowBits = -opt.windowBits;
        if (opt.windowBits === 0) {
          opt.windowBits = -15;
        }
      }
      if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
        opt.windowBits += 32;
      }
      if (opt.windowBits > 15 && opt.windowBits < 48) {
        if ((opt.windowBits & 15) === 0) {
          opt.windowBits |= 15;
        }
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_inflate.inflateInit2(
        this.strm,
        opt.windowBits
      );
      if (status !== c.Z_OK) {
        throw new Error(msg[status]);
      }
      this.header = new GZheader();
      zlib_inflate.inflateGetHeader(this.strm, this.header);
      if (opt.dictionary) {
        if (typeof opt.dictionary === "string") {
          opt.dictionary = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          opt.dictionary = new Uint8Array(opt.dictionary);
        }
        if (opt.raw) {
          status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
          if (status !== c.Z_OK) {
            throw new Error(msg[status]);
          }
        }
      }
    }
    Inflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var dictionary = this.options.dictionary;
      var status, _mode;
      var next_out_utf8, tail, utf8str;
      var allowBufError = false;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.binstring2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
        if (status === c.Z_NEED_DICT && dictionary) {
          status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
        }
        if (status === c.Z_BUF_ERROR && allowBufError === true) {
          status = c.Z_OK;
          allowBufError = false;
        }
        if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.next_out) {
          if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
            if (this.options.to === "string") {
              next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
              tail = strm.next_out - next_out_utf8;
              utf8str = strings.buf2string(strm.output, next_out_utf8);
              strm.next_out = tail;
              strm.avail_out = chunkSize - tail;
              if (tail) {
                utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
              }
              this.onData(utf8str);
            } else {
              this.onData(utils.shrinkBuf(strm.output, strm.next_out));
            }
          }
        }
        if (strm.avail_in === 0 && strm.avail_out === 0) {
          allowBufError = true;
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
      if (status === c.Z_STREAM_END) {
        _mode = c.Z_FINISH;
      }
      if (_mode === c.Z_FINISH) {
        status = zlib_inflate.inflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === c.Z_OK;
      }
      if (_mode === c.Z_SYNC_FLUSH) {
        this.onEnd(c.Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Inflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Inflate.prototype.onEnd = function(status) {
      if (status === c.Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function inflate(input, options) {
      var inflator = new Inflate(options);
      inflator.push(input, true);
      if (inflator.err) {
        throw inflator.msg || msg[inflator.err];
      }
      return inflator.result;
    }
    function inflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return inflate(input, options);
    }
    exports2.Inflate = Inflate;
    exports2.inflate = inflate;
    exports2.inflateRaw = inflateRaw;
    exports2.ungzip = inflate;
  }
});

// node_modules/pako/index.js
var require_pako = __commonJS({
  "node_modules/pako/index.js"(exports2, module2) {
    "use strict";
    var assign = require_common().assign;
    var deflate = require_deflate2();
    var inflate = require_inflate2();
    var constants = require_constants();
    var pako = {};
    assign(pako, deflate, inflate, constants);
    module2.exports = pako;
  }
});

// node_modules/jszip/lib/flate.js
var require_flate = __commonJS({
  "node_modules/jszip/lib/flate.js"(exports2) {
    "use strict";
    var USE_TYPEDARRAY = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Uint32Array !== "undefined";
    var pako = require_pako();
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var ARRAY_TYPE = USE_TYPEDARRAY ? "uint8array" : "array";
    exports2.magic = "\b\0";
    function FlateWorker(action, options) {
      GenericWorker.call(this, "FlateWorker/" + action);
      this._pako = null;
      this._pakoAction = action;
      this._pakoOptions = options;
      this.meta = {};
    }
    utils.inherits(FlateWorker, GenericWorker);
    FlateWorker.prototype.processChunk = function(chunk) {
      this.meta = chunk.meta;
      if (this._pako === null) {
        this._createPako();
      }
      this._pako.push(utils.transformTo(ARRAY_TYPE, chunk.data), false);
    };
    FlateWorker.prototype.flush = function() {
      GenericWorker.prototype.flush.call(this);
      if (this._pako === null) {
        this._createPako();
      }
      this._pako.push([], true);
    };
    FlateWorker.prototype.cleanUp = function() {
      GenericWorker.prototype.cleanUp.call(this);
      this._pako = null;
    };
    FlateWorker.prototype._createPako = function() {
      this._pako = new pako[this._pakoAction]({
        raw: true,
        level: this._pakoOptions.level || -1
        // default compression
      });
      var self2 = this;
      this._pako.onData = function(data) {
        self2.push({
          data,
          meta: self2.meta
        });
      };
    };
    exports2.compressWorker = function(compressionOptions) {
      return new FlateWorker("Deflate", compressionOptions);
    };
    exports2.uncompressWorker = function() {
      return new FlateWorker("Inflate", {});
    };
  }
});

// node_modules/jszip/lib/compressions.js
var require_compressions = __commonJS({
  "node_modules/jszip/lib/compressions.js"(exports2) {
    "use strict";
    var GenericWorker = require_GenericWorker();
    exports2.STORE = {
      magic: "\0\0",
      compressWorker: function() {
        return new GenericWorker("STORE compression");
      },
      uncompressWorker: function() {
        return new GenericWorker("STORE decompression");
      }
    };
    exports2.DEFLATE = require_flate();
  }
});

// node_modules/jszip/lib/signature.js
var require_signature = __commonJS({
  "node_modules/jszip/lib/signature.js"(exports2) {
    "use strict";
    exports2.LOCAL_FILE_HEADER = "PK";
    exports2.CENTRAL_FILE_HEADER = "PK";
    exports2.CENTRAL_DIRECTORY_END = "PK";
    exports2.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07";
    exports2.ZIP64_CENTRAL_DIRECTORY_END = "PK";
    exports2.DATA_DESCRIPTOR = "PK\x07\b";
  }
});

// node_modules/jszip/lib/generate/ZipFileWorker.js
var require_ZipFileWorker = __commonJS({
  "node_modules/jszip/lib/generate/ZipFileWorker.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var utf8 = require_utf8();
    var crc32 = require_crc32();
    var signature = require_signature();
    var decToHex = function(dec, bytes) {
      var hex = "", i;
      for (i = 0; i < bytes; i++) {
        hex += String.fromCharCode(dec & 255);
        dec = dec >>> 8;
      }
      return hex;
    };
    var generateUnixExternalFileAttr = function(unixPermissions, isDir) {
      var result = unixPermissions;
      if (!unixPermissions) {
        result = isDir ? 16893 : 33204;
      }
      return (result & 65535) << 16;
    };
    var generateDosExternalFileAttr = function(dosPermissions) {
      return (dosPermissions || 0) & 63;
    };
    var generateZipParts = function(streamInfo, streamedContent, streamingEnded, offset, platform, encodeFileName) {
      var file = streamInfo["file"], compression = streamInfo["compression"], useCustomEncoding = encodeFileName !== utf8.utf8encode, encodedFileName = utils.transformTo("string", encodeFileName(file.name)), utfEncodedFileName = utils.transformTo("string", utf8.utf8encode(file.name)), comment = file.comment, encodedComment = utils.transformTo("string", encodeFileName(comment)), utfEncodedComment = utils.transformTo("string", utf8.utf8encode(comment)), useUTF8ForFileName = utfEncodedFileName.length !== file.name.length, useUTF8ForComment = utfEncodedComment.length !== comment.length, dosTime, dosDate, extraFields = "", unicodePathExtraField = "", unicodeCommentExtraField = "", dir = file.dir, date = file.date;
      var dataInfo = {
        crc32: 0,
        compressedSize: 0,
        uncompressedSize: 0
      };
      if (!streamedContent || streamingEnded) {
        dataInfo.crc32 = streamInfo["crc32"];
        dataInfo.compressedSize = streamInfo["compressedSize"];
        dataInfo.uncompressedSize = streamInfo["uncompressedSize"];
      }
      var bitflag = 0;
      if (streamedContent) {
        bitflag |= 8;
      }
      if (!useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment)) {
        bitflag |= 2048;
      }
      var extFileAttr = 0;
      var versionMadeBy = 0;
      if (dir) {
        extFileAttr |= 16;
      }
      if (platform === "UNIX") {
        versionMadeBy = 798;
        extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);
      } else {
        versionMadeBy = 20;
        extFileAttr |= generateDosExternalFileAttr(file.dosPermissions, dir);
      }
      dosTime = date.getUTCHours();
      dosTime = dosTime << 6;
      dosTime = dosTime | date.getUTCMinutes();
      dosTime = dosTime << 5;
      dosTime = dosTime | date.getUTCSeconds() / 2;
      dosDate = date.getUTCFullYear() - 1980;
      dosDate = dosDate << 4;
      dosDate = dosDate | date.getUTCMonth() + 1;
      dosDate = dosDate << 5;
      dosDate = dosDate | date.getUTCDate();
      if (useUTF8ForFileName) {
        unicodePathExtraField = // Version
        decToHex(1, 1) + // NameCRC32
        decToHex(crc32(encodedFileName), 4) + // UnicodeName
        utfEncodedFileName;
        extraFields += // Info-ZIP Unicode Path Extra Field
        "up" + // size
        decToHex(unicodePathExtraField.length, 2) + // content
        unicodePathExtraField;
      }
      if (useUTF8ForComment) {
        unicodeCommentExtraField = // Version
        decToHex(1, 1) + // CommentCRC32
        decToHex(crc32(encodedComment), 4) + // UnicodeName
        utfEncodedComment;
        extraFields += // Info-ZIP Unicode Path Extra Field
        "uc" + // size
        decToHex(unicodeCommentExtraField.length, 2) + // content
        unicodeCommentExtraField;
      }
      var header = "";
      header += "\n\0";
      header += decToHex(bitflag, 2);
      header += compression.magic;
      header += decToHex(dosTime, 2);
      header += decToHex(dosDate, 2);
      header += decToHex(dataInfo.crc32, 4);
      header += decToHex(dataInfo.compressedSize, 4);
      header += decToHex(dataInfo.uncompressedSize, 4);
      header += decToHex(encodedFileName.length, 2);
      header += decToHex(extraFields.length, 2);
      var fileRecord = signature.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;
      var dirRecord = signature.CENTRAL_FILE_HEADER + // version made by (00: DOS)
      decToHex(versionMadeBy, 2) + // file header (common to file and central directory)
      header + // file comment length
      decToHex(encodedComment.length, 2) + // disk number start
      "\0\0\0\0" + // external file attributes
      decToHex(extFileAttr, 4) + // relative offset of local header
      decToHex(offset, 4) + // file name
      encodedFileName + // extra field
      extraFields + // file comment
      encodedComment;
      return {
        fileRecord,
        dirRecord
      };
    };
    var generateCentralDirectoryEnd = function(entriesCount, centralDirLength, localDirLength, comment, encodeFileName) {
      var dirEnd = "";
      var encodedComment = utils.transformTo("string", encodeFileName(comment));
      dirEnd = signature.CENTRAL_DIRECTORY_END + // number of this disk
      "\0\0\0\0" + // total number of entries in the central directory on this disk
      decToHex(entriesCount, 2) + // total number of entries in the central directory
      decToHex(entriesCount, 2) + // size of the central directory   4 bytes
      decToHex(centralDirLength, 4) + // offset of start of central directory with respect to the starting disk number
      decToHex(localDirLength, 4) + // .ZIP file comment length
      decToHex(encodedComment.length, 2) + // .ZIP file comment
      encodedComment;
      return dirEnd;
    };
    var generateDataDescriptors = function(streamInfo) {
      var descriptor = "";
      descriptor = signature.DATA_DESCRIPTOR + // crc-32                          4 bytes
      decToHex(streamInfo["crc32"], 4) + // compressed size                 4 bytes
      decToHex(streamInfo["compressedSize"], 4) + // uncompressed size               4 bytes
      decToHex(streamInfo["uncompressedSize"], 4);
      return descriptor;
    };
    function ZipFileWorker(streamFiles, comment, platform, encodeFileName) {
      GenericWorker.call(this, "ZipFileWorker");
      this.bytesWritten = 0;
      this.zipComment = comment;
      this.zipPlatform = platform;
      this.encodeFileName = encodeFileName;
      this.streamFiles = streamFiles;
      this.accumulate = false;
      this.contentBuffer = [];
      this.dirRecords = [];
      this.currentSourceOffset = 0;
      this.entriesCount = 0;
      this.currentFile = null;
      this._sources = [];
    }
    utils.inherits(ZipFileWorker, GenericWorker);
    ZipFileWorker.prototype.push = function(chunk) {
      var currentFilePercent = chunk.meta.percent || 0;
      var entriesCount = this.entriesCount;
      var remainingFiles = this._sources.length;
      if (this.accumulate) {
        this.contentBuffer.push(chunk);
      } else {
        this.bytesWritten += chunk.data.length;
        GenericWorker.prototype.push.call(this, {
          data: chunk.data,
          meta: {
            currentFile: this.currentFile,
            percent: entriesCount ? (currentFilePercent + 100 * (entriesCount - remainingFiles - 1)) / entriesCount : 100
          }
        });
      }
    };
    ZipFileWorker.prototype.openedSource = function(streamInfo) {
      this.currentSourceOffset = this.bytesWritten;
      this.currentFile = streamInfo["file"].name;
      var streamedContent = this.streamFiles && !streamInfo["file"].dir;
      if (streamedContent) {
        var record = generateZipParts(streamInfo, streamedContent, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
        this.push({
          data: record.fileRecord,
          meta: { percent: 0 }
        });
      } else {
        this.accumulate = true;
      }
    };
    ZipFileWorker.prototype.closedSource = function(streamInfo) {
      this.accumulate = false;
      var streamedContent = this.streamFiles && !streamInfo["file"].dir;
      var record = generateZipParts(streamInfo, streamedContent, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
      this.dirRecords.push(record.dirRecord);
      if (streamedContent) {
        this.push({
          data: generateDataDescriptors(streamInfo),
          meta: { percent: 100 }
        });
      } else {
        this.push({
          data: record.fileRecord,
          meta: { percent: 0 }
        });
        while (this.contentBuffer.length) {
          this.push(this.contentBuffer.shift());
        }
      }
      this.currentFile = null;
    };
    ZipFileWorker.prototype.flush = function() {
      var localDirLength = this.bytesWritten;
      for (var i = 0; i < this.dirRecords.length; i++) {
        this.push({
          data: this.dirRecords[i],
          meta: { percent: 100 }
        });
      }
      var centralDirLength = this.bytesWritten - localDirLength;
      var dirEnd = generateCentralDirectoryEnd(this.dirRecords.length, centralDirLength, localDirLength, this.zipComment, this.encodeFileName);
      this.push({
        data: dirEnd,
        meta: { percent: 100 }
      });
    };
    ZipFileWorker.prototype.prepareNextSource = function() {
      this.previous = this._sources.shift();
      this.openedSource(this.previous.streamInfo);
      if (this.isPaused) {
        this.previous.pause();
      } else {
        this.previous.resume();
      }
    };
    ZipFileWorker.prototype.registerPrevious = function(previous) {
      this._sources.push(previous);
      var self2 = this;
      previous.on("data", function(chunk) {
        self2.processChunk(chunk);
      });
      previous.on("end", function() {
        self2.closedSource(self2.previous.streamInfo);
        if (self2._sources.length) {
          self2.prepareNextSource();
        } else {
          self2.end();
        }
      });
      previous.on("error", function(e) {
        self2.error(e);
      });
      return this;
    };
    ZipFileWorker.prototype.resume = function() {
      if (!GenericWorker.prototype.resume.call(this)) {
        return false;
      }
      if (!this.previous && this._sources.length) {
        this.prepareNextSource();
        return true;
      }
      if (!this.previous && !this._sources.length && !this.generatedError) {
        this.end();
        return true;
      }
    };
    ZipFileWorker.prototype.error = function(e) {
      var sources = this._sources;
      if (!GenericWorker.prototype.error.call(this, e)) {
        return false;
      }
      for (var i = 0; i < sources.length; i++) {
        try {
          sources[i].error(e);
        } catch (e2) {
        }
      }
      return true;
    };
    ZipFileWorker.prototype.lock = function() {
      GenericWorker.prototype.lock.call(this);
      var sources = this._sources;
      for (var i = 0; i < sources.length; i++) {
        sources[i].lock();
      }
    };
    module2.exports = ZipFileWorker;
  }
});

// node_modules/jszip/lib/generate/index.js
var require_generate = __commonJS({
  "node_modules/jszip/lib/generate/index.js"(exports2) {
    "use strict";
    var compressions = require_compressions();
    var ZipFileWorker = require_ZipFileWorker();
    var getCompression = function(fileCompression, zipCompression) {
      var compressionName = fileCompression || zipCompression;
      var compression = compressions[compressionName];
      if (!compression) {
        throw new Error(compressionName + " is not a valid compression method !");
      }
      return compression;
    };
    exports2.generateWorker = function(zip, options, comment) {
      var zipFileWorker = new ZipFileWorker(options.streamFiles, comment, options.platform, options.encodeFileName);
      var entriesCount = 0;
      try {
        zip.forEach(function(relativePath, file) {
          entriesCount++;
          var compression = getCompression(file.options.compression, options.compression);
          var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};
          var dir = file.dir, date = file.date;
          file._compressWorker(compression, compressionOptions).withStreamInfo("file", {
            name: relativePath,
            dir,
            date,
            comment: file.comment || "",
            unixPermissions: file.unixPermissions,
            dosPermissions: file.dosPermissions
          }).pipe(zipFileWorker);
        });
        zipFileWorker.entriesCount = entriesCount;
      } catch (e) {
        zipFileWorker.error(e);
      }
      return zipFileWorker;
    };
  }
});

// node_modules/jszip/lib/nodejs/NodejsStreamInputAdapter.js
var require_NodejsStreamInputAdapter = __commonJS({
  "node_modules/jszip/lib/nodejs/NodejsStreamInputAdapter.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    function NodejsStreamInputAdapter(filename, stream) {
      GenericWorker.call(this, "Nodejs stream input adapter for " + filename);
      this._upstreamEnded = false;
      this._bindStream(stream);
    }
    utils.inherits(NodejsStreamInputAdapter, GenericWorker);
    NodejsStreamInputAdapter.prototype._bindStream = function(stream) {
      var self2 = this;
      this._stream = stream;
      stream.pause();
      stream.on("data", function(chunk) {
        self2.push({
          data: chunk,
          meta: {
            percent: 0
          }
        });
      }).on("error", function(e) {
        if (self2.isPaused) {
          this.generatedError = e;
        } else {
          self2.error(e);
        }
      }).on("end", function() {
        if (self2.isPaused) {
          self2._upstreamEnded = true;
        } else {
          self2.end();
        }
      });
    };
    NodejsStreamInputAdapter.prototype.pause = function() {
      if (!GenericWorker.prototype.pause.call(this)) {
        return false;
      }
      this._stream.pause();
      return true;
    };
    NodejsStreamInputAdapter.prototype.resume = function() {
      if (!GenericWorker.prototype.resume.call(this)) {
        return false;
      }
      if (this._upstreamEnded) {
        this.end();
      } else {
        this._stream.resume();
      }
      return true;
    };
    module2.exports = NodejsStreamInputAdapter;
  }
});

// node_modules/jszip/lib/object.js
var require_object = __commonJS({
  "node_modules/jszip/lib/object.js"(exports2, module2) {
    "use strict";
    var utf8 = require_utf8();
    var utils = require_utils();
    var GenericWorker = require_GenericWorker();
    var StreamHelper = require_StreamHelper();
    var defaults = require_defaults();
    var CompressedObject = require_compressedObject();
    var ZipObject = require_zipObject();
    var generate = require_generate();
    var nodejsUtils = require_nodejsUtils();
    var NodejsStreamInputAdapter = require_NodejsStreamInputAdapter();
    var fileAdd = function(name, data, originalOptions) {
      var dataType = utils.getTypeOf(data), parent;
      var o = utils.extend(originalOptions || {}, defaults);
      o.date = o.date || /* @__PURE__ */ new Date();
      if (o.compression !== null) {
        o.compression = o.compression.toUpperCase();
      }
      if (typeof o.unixPermissions === "string") {
        o.unixPermissions = parseInt(o.unixPermissions, 8);
      }
      if (o.unixPermissions && o.unixPermissions & 16384) {
        o.dir = true;
      }
      if (o.dosPermissions && o.dosPermissions & 16) {
        o.dir = true;
      }
      if (o.dir) {
        name = forceTrailingSlash(name);
      }
      if (o.createFolders && (parent = parentFolder(name))) {
        folderAdd.call(this, parent, true);
      }
      var isUnicodeString = dataType === "string" && o.binary === false && o.base64 === false;
      if (!originalOptions || typeof originalOptions.binary === "undefined") {
        o.binary = !isUnicodeString;
      }
      var isCompressedEmpty = data instanceof CompressedObject && data.uncompressedSize === 0;
      if (isCompressedEmpty || o.dir || !data || data.length === 0) {
        o.base64 = false;
        o.binary = true;
        data = "";
        o.compression = "STORE";
        dataType = "string";
      }
      var zipObjectContent = null;
      if (data instanceof CompressedObject || data instanceof GenericWorker) {
        zipObjectContent = data;
      } else if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
        zipObjectContent = new NodejsStreamInputAdapter(name, data);
      } else {
        zipObjectContent = utils.prepareContent(name, data, o.binary, o.optimizedBinaryString, o.base64);
      }
      var object = new ZipObject(name, zipObjectContent, o);
      this.files[name] = object;
    };
    var parentFolder = function(path4) {
      if (path4.slice(-1) === "/") {
        path4 = path4.substring(0, path4.length - 1);
      }
      var lastSlash = path4.lastIndexOf("/");
      return lastSlash > 0 ? path4.substring(0, lastSlash) : "";
    };
    var forceTrailingSlash = function(path4) {
      if (path4.slice(-1) !== "/") {
        path4 += "/";
      }
      return path4;
    };
    var folderAdd = function(name, createFolders) {
      createFolders = typeof createFolders !== "undefined" ? createFolders : defaults.createFolders;
      name = forceTrailingSlash(name);
      if (!this.files[name]) {
        fileAdd.call(this, name, null, {
          dir: true,
          createFolders
        });
      }
      return this.files[name];
    };
    function isRegExp(object) {
      return Object.prototype.toString.call(object) === "[object RegExp]";
    }
    var out = {
      /**
       * @see loadAsync
       */
      load: function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      },
      /**
       * Call a callback function for each entry at this folder level.
       * @param {Function} cb the callback function:
       * function (relativePath, file) {...}
       * It takes 2 arguments : the relative path and the file.
       */
      forEach: function(cb) {
        var filename, relativePath, file;
        for (filename in this.files) {
          file = this.files[filename];
          relativePath = filename.slice(this.root.length, filename.length);
          if (relativePath && filename.slice(0, this.root.length) === this.root) {
            cb(relativePath, file);
          }
        }
      },
      /**
       * Filter nested files/folders with the specified function.
       * @param {Function} search the predicate to use :
       * function (relativePath, file) {...}
       * It takes 2 arguments : the relative path and the file.
       * @return {Array} An array of matching elements.
       */
      filter: function(search) {
        var result = [];
        this.forEach(function(relativePath, entry) {
          if (search(relativePath, entry)) {
            result.push(entry);
          }
        });
        return result;
      },
      /**
       * Add a file to the zip file, or search a file.
       * @param   {string|RegExp} name The name of the file to add (if data is defined),
       * the name of the file to find (if no data) or a regex to match files.
       * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
       * @param   {Object} o     File options
       * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
       * a file (when searching by string) or an array of files (when searching by regex).
       */
      file: function(name, data, o) {
        if (arguments.length === 1) {
          if (isRegExp(name)) {
            var regexp = name;
            return this.filter(function(relativePath, file) {
              return !file.dir && regexp.test(relativePath);
            });
          } else {
            var obj = this.files[this.root + name];
            if (obj && !obj.dir) {
              return obj;
            } else {
              return null;
            }
          }
        } else {
          name = this.root + name;
          fileAdd.call(this, name, data, o);
        }
        return this;
      },
      /**
       * Add a directory to the zip file, or search.
       * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
       * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
       */
      folder: function(arg) {
        if (!arg) {
          return this;
        }
        if (isRegExp(arg)) {
          return this.filter(function(relativePath, file) {
            return file.dir && arg.test(relativePath);
          });
        }
        var name = this.root + arg;
        var newFolder = folderAdd.call(this, name);
        var ret = this.clone();
        ret.root = newFolder.name;
        return ret;
      },
      /**
       * Delete a file, or a directory and all sub-files, from the zip
       * @param {string} name the name of the file to delete
       * @return {JSZip} this JSZip object
       */
      remove: function(name) {
        name = this.root + name;
        var file = this.files[name];
        if (!file) {
          if (name.slice(-1) !== "/") {
            name += "/";
          }
          file = this.files[name];
        }
        if (file && !file.dir) {
          delete this.files[name];
        } else {
          var kids = this.filter(function(relativePath, file2) {
            return file2.name.slice(0, name.length) === name;
          });
          for (var i = 0; i < kids.length; i++) {
            delete this.files[kids[i].name];
          }
        }
        return this;
      },
      /**
       * @deprecated This method has been removed in JSZip 3.0, please check the upgrade guide.
       */
      generate: function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      },
      /**
       * Generate the complete zip file as an internal stream.
       * @param {Object} options the options to generate the zip file :
       * - compression, "STORE" by default.
       * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
       * @return {StreamHelper} the streamed zip file.
       */
      generateInternalStream: function(options) {
        var worker, opts = {};
        try {
          opts = utils.extend(options || {}, {
            streamFiles: false,
            compression: "STORE",
            compressionOptions: null,
            type: "",
            platform: "DOS",
            comment: null,
            mimeType: "application/zip",
            encodeFileName: utf8.utf8encode
          });
          opts.type = opts.type.toLowerCase();
          opts.compression = opts.compression.toUpperCase();
          if (opts.type === "binarystring") {
            opts.type = "string";
          }
          if (!opts.type) {
            throw new Error("No output type specified.");
          }
          utils.checkSupport(opts.type);
          if (opts.platform === "darwin" || opts.platform === "freebsd" || opts.platform === "linux" || opts.platform === "sunos") {
            opts.platform = "UNIX";
          }
          if (opts.platform === "win32") {
            opts.platform = "DOS";
          }
          var comment = opts.comment || this.comment || "";
          worker = generate.generateWorker(this, opts, comment);
        } catch (e) {
          worker = new GenericWorker("error");
          worker.error(e);
        }
        return new StreamHelper(worker, opts.type || "string", opts.mimeType);
      },
      /**
       * Generate the complete zip file asynchronously.
       * @see generateInternalStream
       */
      generateAsync: function(options, onUpdate) {
        return this.generateInternalStream(options).accumulate(onUpdate);
      },
      /**
       * Generate the complete zip file asynchronously.
       * @see generateInternalStream
       */
      generateNodeStream: function(options, onUpdate) {
        options = options || {};
        if (!options.type) {
          options.type = "nodebuffer";
        }
        return this.generateInternalStream(options).toNodejsStream(onUpdate);
      }
    };
    module2.exports = out;
  }
});

// node_modules/jszip/lib/reader/DataReader.js
var require_DataReader = __commonJS({
  "node_modules/jszip/lib/reader/DataReader.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    function DataReader(data) {
      this.data = data;
      this.length = data.length;
      this.index = 0;
      this.zero = 0;
    }
    DataReader.prototype = {
      /**
       * Check that the offset will not go too far.
       * @param {string} offset the additional offset to check.
       * @throws {Error} an Error if the offset is out of bounds.
       */
      checkOffset: function(offset) {
        this.checkIndex(this.index + offset);
      },
      /**
       * Check that the specified index will not be too far.
       * @param {string} newIndex the index to check.
       * @throws {Error} an Error if the index is out of bounds.
       */
      checkIndex: function(newIndex) {
        if (this.length < this.zero + newIndex || newIndex < 0) {
          throw new Error("End of data reached (data length = " + this.length + ", asked index = " + newIndex + "). Corrupted zip ?");
        }
      },
      /**
       * Change the index.
       * @param {number} newIndex The new index.
       * @throws {Error} if the new index is out of the data.
       */
      setIndex: function(newIndex) {
        this.checkIndex(newIndex);
        this.index = newIndex;
      },
      /**
       * Skip the next n bytes.
       * @param {number} n the number of bytes to skip.
       * @throws {Error} if the new index is out of the data.
       */
      skip: function(n) {
        this.setIndex(this.index + n);
      },
      /**
       * Get the byte at the specified index.
       * @param {number} i the index to use.
       * @return {number} a byte.
       */
      byteAt: function() {
      },
      /**
       * Get the next number with a given byte size.
       * @param {number} size the number of bytes to read.
       * @return {number} the corresponding number.
       */
      readInt: function(size) {
        var result = 0, i;
        this.checkOffset(size);
        for (i = this.index + size - 1; i >= this.index; i--) {
          result = (result << 8) + this.byteAt(i);
        }
        this.index += size;
        return result;
      },
      /**
       * Get the next string with a given byte size.
       * @param {number} size the number of bytes to read.
       * @return {string} the corresponding string.
       */
      readString: function(size) {
        return utils.transformTo("string", this.readData(size));
      },
      /**
       * Get raw data without conversion, <size> bytes.
       * @param {number} size the number of bytes to read.
       * @return {Object} the raw data, implementation specific.
       */
      readData: function() {
      },
      /**
       * Find the last occurrence of a zip signature (4 bytes).
       * @param {string} sig the signature to find.
       * @return {number} the index of the last occurrence, -1 if not found.
       */
      lastIndexOfSignature: function() {
      },
      /**
       * Read the signature (4 bytes) at the current position and compare it with sig.
       * @param {string} sig the expected signature
       * @return {boolean} true if the signature matches, false otherwise.
       */
      readAndCheckSignature: function() {
      },
      /**
       * Get the next date.
       * @return {Date} the date.
       */
      readDate: function() {
        var dostime = this.readInt(4);
        return new Date(Date.UTC(
          (dostime >> 25 & 127) + 1980,
          // year
          (dostime >> 21 & 15) - 1,
          // month
          dostime >> 16 & 31,
          // day
          dostime >> 11 & 31,
          // hour
          dostime >> 5 & 63,
          // minute
          (dostime & 31) << 1
        ));
      }
    };
    module2.exports = DataReader;
  }
});

// node_modules/jszip/lib/reader/ArrayReader.js
var require_ArrayReader = __commonJS({
  "node_modules/jszip/lib/reader/ArrayReader.js"(exports2, module2) {
    "use strict";
    var DataReader = require_DataReader();
    var utils = require_utils();
    function ArrayReader(data) {
      DataReader.call(this, data);
      for (var i = 0; i < this.data.length; i++) {
        data[i] = data[i] & 255;
      }
    }
    utils.inherits(ArrayReader, DataReader);
    ArrayReader.prototype.byteAt = function(i) {
      return this.data[this.zero + i];
    };
    ArrayReader.prototype.lastIndexOfSignature = function(sig) {
      var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3);
      for (var i = this.length - 4; i >= 0; --i) {
        if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
          return i - this.zero;
        }
      }
      return -1;
    };
    ArrayReader.prototype.readAndCheckSignature = function(sig) {
      var sig0 = sig.charCodeAt(0), sig1 = sig.charCodeAt(1), sig2 = sig.charCodeAt(2), sig3 = sig.charCodeAt(3), data = this.readData(4);
      return sig0 === data[0] && sig1 === data[1] && sig2 === data[2] && sig3 === data[3];
    };
    ArrayReader.prototype.readData = function(size) {
      this.checkOffset(size);
      if (size === 0) {
        return [];
      }
      var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module2.exports = ArrayReader;
  }
});

// node_modules/jszip/lib/reader/StringReader.js
var require_StringReader = __commonJS({
  "node_modules/jszip/lib/reader/StringReader.js"(exports2, module2) {
    "use strict";
    var DataReader = require_DataReader();
    var utils = require_utils();
    function StringReader(data) {
      DataReader.call(this, data);
    }
    utils.inherits(StringReader, DataReader);
    StringReader.prototype.byteAt = function(i) {
      return this.data.charCodeAt(this.zero + i);
    };
    StringReader.prototype.lastIndexOfSignature = function(sig) {
      return this.data.lastIndexOf(sig) - this.zero;
    };
    StringReader.prototype.readAndCheckSignature = function(sig) {
      var data = this.readData(4);
      return sig === data;
    };
    StringReader.prototype.readData = function(size) {
      this.checkOffset(size);
      var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module2.exports = StringReader;
  }
});

// node_modules/jszip/lib/reader/Uint8ArrayReader.js
var require_Uint8ArrayReader = __commonJS({
  "node_modules/jszip/lib/reader/Uint8ArrayReader.js"(exports2, module2) {
    "use strict";
    var ArrayReader = require_ArrayReader();
    var utils = require_utils();
    function Uint8ArrayReader(data) {
      ArrayReader.call(this, data);
    }
    utils.inherits(Uint8ArrayReader, ArrayReader);
    Uint8ArrayReader.prototype.readData = function(size) {
      this.checkOffset(size);
      if (size === 0) {
        return new Uint8Array(0);
      }
      var result = this.data.subarray(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module2.exports = Uint8ArrayReader;
  }
});

// node_modules/jszip/lib/reader/NodeBufferReader.js
var require_NodeBufferReader = __commonJS({
  "node_modules/jszip/lib/reader/NodeBufferReader.js"(exports2, module2) {
    "use strict";
    var Uint8ArrayReader = require_Uint8ArrayReader();
    var utils = require_utils();
    function NodeBufferReader(data) {
      Uint8ArrayReader.call(this, data);
    }
    utils.inherits(NodeBufferReader, Uint8ArrayReader);
    NodeBufferReader.prototype.readData = function(size) {
      this.checkOffset(size);
      var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
      this.index += size;
      return result;
    };
    module2.exports = NodeBufferReader;
  }
});

// node_modules/jszip/lib/reader/readerFor.js
var require_readerFor = __commonJS({
  "node_modules/jszip/lib/reader/readerFor.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    var support = require_support();
    var ArrayReader = require_ArrayReader();
    var StringReader = require_StringReader();
    var NodeBufferReader = require_NodeBufferReader();
    var Uint8ArrayReader = require_Uint8ArrayReader();
    module2.exports = function(data) {
      var type = utils.getTypeOf(data);
      utils.checkSupport(type);
      if (type === "string" && !support.uint8array) {
        return new StringReader(data);
      }
      if (type === "nodebuffer") {
        return new NodeBufferReader(data);
      }
      if (support.uint8array) {
        return new Uint8ArrayReader(utils.transformTo("uint8array", data));
      }
      return new ArrayReader(utils.transformTo("array", data));
    };
  }
});

// node_modules/jszip/lib/zipEntry.js
var require_zipEntry = __commonJS({
  "node_modules/jszip/lib/zipEntry.js"(exports2, module2) {
    "use strict";
    var readerFor = require_readerFor();
    var utils = require_utils();
    var CompressedObject = require_compressedObject();
    var crc32fn = require_crc32();
    var utf8 = require_utf8();
    var compressions = require_compressions();
    var support = require_support();
    var MADE_BY_DOS = 0;
    var MADE_BY_UNIX = 3;
    var findCompression = function(compressionMethod) {
      for (var method in compressions) {
        if (!Object.prototype.hasOwnProperty.call(compressions, method)) {
          continue;
        }
        if (compressions[method].magic === compressionMethod) {
          return compressions[method];
        }
      }
      return null;
    };
    function ZipEntry(options, loadOptions) {
      this.options = options;
      this.loadOptions = loadOptions;
    }
    ZipEntry.prototype = {
      /**
       * say if the file is encrypted.
       * @return {boolean} true if the file is encrypted, false otherwise.
       */
      isEncrypted: function() {
        return (this.bitFlag & 1) === 1;
      },
      /**
       * say if the file has utf-8 filename/comment.
       * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
       */
      useUTF8: function() {
        return (this.bitFlag & 2048) === 2048;
      },
      /**
       * Read the local part of a zip file and add the info in this object.
       * @param {DataReader} reader the reader to use.
       */
      readLocalPart: function(reader) {
        var compression, localExtraFieldsLength;
        reader.skip(22);
        this.fileNameLength = reader.readInt(2);
        localExtraFieldsLength = reader.readInt(2);
        this.fileName = reader.readData(this.fileNameLength);
        reader.skip(localExtraFieldsLength);
        if (this.compressedSize === -1 || this.uncompressedSize === -1) {
          throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
        }
        compression = findCompression(this.compressionMethod);
        if (compression === null) {
          throw new Error("Corrupted zip : compression " + utils.pretty(this.compressionMethod) + " unknown (inner file : " + utils.transformTo("string", this.fileName) + ")");
        }
        this.decompressed = new CompressedObject(this.compressedSize, this.uncompressedSize, this.crc32, compression, reader.readData(this.compressedSize));
      },
      /**
       * Read the central part of a zip file and add the info in this object.
       * @param {DataReader} reader the reader to use.
       */
      readCentralPart: function(reader) {
        this.versionMadeBy = reader.readInt(2);
        reader.skip(2);
        this.bitFlag = reader.readInt(2);
        this.compressionMethod = reader.readString(2);
        this.date = reader.readDate();
        this.crc32 = reader.readInt(4);
        this.compressedSize = reader.readInt(4);
        this.uncompressedSize = reader.readInt(4);
        var fileNameLength = reader.readInt(2);
        this.extraFieldsLength = reader.readInt(2);
        this.fileCommentLength = reader.readInt(2);
        this.diskNumberStart = reader.readInt(2);
        this.internalFileAttributes = reader.readInt(2);
        this.externalFileAttributes = reader.readInt(4);
        this.localHeaderOffset = reader.readInt(4);
        if (this.isEncrypted()) {
          throw new Error("Encrypted zip are not supported");
        }
        reader.skip(fileNameLength);
        this.readExtraFields(reader);
        this.parseZIP64ExtraField(reader);
        this.fileComment = reader.readData(this.fileCommentLength);
      },
      /**
       * Parse the external file attributes and get the unix/dos permissions.
       */
      processAttributes: function() {
        this.unixPermissions = null;
        this.dosPermissions = null;
        var madeBy = this.versionMadeBy >> 8;
        this.dir = this.externalFileAttributes & 16 ? true : false;
        if (madeBy === MADE_BY_DOS) {
          this.dosPermissions = this.externalFileAttributes & 63;
        }
        if (madeBy === MADE_BY_UNIX) {
          this.unixPermissions = this.externalFileAttributes >> 16 & 65535;
        }
        if (!this.dir && this.fileNameStr.slice(-1) === "/") {
          this.dir = true;
        }
      },
      /**
       * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
       * @param {DataReader} reader the reader to use.
       */
      parseZIP64ExtraField: function() {
        if (!this.extraFields[1]) {
          return;
        }
        var extraReader = readerFor(this.extraFields[1].value);
        if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
          this.uncompressedSize = extraReader.readInt(8);
        }
        if (this.compressedSize === utils.MAX_VALUE_32BITS) {
          this.compressedSize = extraReader.readInt(8);
        }
        if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
          this.localHeaderOffset = extraReader.readInt(8);
        }
        if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
          this.diskNumberStart = extraReader.readInt(4);
        }
      },
      /**
       * Read the central part of a zip file and add the info in this object.
       * @param {DataReader} reader the reader to use.
       */
      readExtraFields: function(reader) {
        var end = reader.index + this.extraFieldsLength, extraFieldId, extraFieldLength, extraFieldValue;
        if (!this.extraFields) {
          this.extraFields = {};
        }
        while (reader.index + 4 < end) {
          extraFieldId = reader.readInt(2);
          extraFieldLength = reader.readInt(2);
          extraFieldValue = reader.readData(extraFieldLength);
          this.extraFields[extraFieldId] = {
            id: extraFieldId,
            length: extraFieldLength,
            value: extraFieldValue
          };
        }
        reader.setIndex(end);
      },
      /**
       * Apply an UTF8 transformation if needed.
       */
      handleUTF8: function() {
        var decodeParamType = support.uint8array ? "uint8array" : "array";
        if (this.useUTF8()) {
          this.fileNameStr = utf8.utf8decode(this.fileName);
          this.fileCommentStr = utf8.utf8decode(this.fileComment);
        } else {
          var upath = this.findExtraFieldUnicodePath();
          if (upath !== null) {
            this.fileNameStr = upath;
          } else {
            var fileNameByteArray = utils.transformTo(decodeParamType, this.fileName);
            this.fileNameStr = this.loadOptions.decodeFileName(fileNameByteArray);
          }
          var ucomment = this.findExtraFieldUnicodeComment();
          if (ucomment !== null) {
            this.fileCommentStr = ucomment;
          } else {
            var commentByteArray = utils.transformTo(decodeParamType, this.fileComment);
            this.fileCommentStr = this.loadOptions.decodeFileName(commentByteArray);
          }
        }
      },
      /**
       * Find the unicode path declared in the extra field, if any.
       * @return {String} the unicode path, null otherwise.
       */
      findExtraFieldUnicodePath: function() {
        var upathField = this.extraFields[28789];
        if (upathField) {
          var extraReader = readerFor(upathField.value);
          if (extraReader.readInt(1) !== 1) {
            return null;
          }
          if (crc32fn(this.fileName) !== extraReader.readInt(4)) {
            return null;
          }
          return utf8.utf8decode(extraReader.readData(upathField.length - 5));
        }
        return null;
      },
      /**
       * Find the unicode comment declared in the extra field, if any.
       * @return {String} the unicode comment, null otherwise.
       */
      findExtraFieldUnicodeComment: function() {
        var ucommentField = this.extraFields[25461];
        if (ucommentField) {
          var extraReader = readerFor(ucommentField.value);
          if (extraReader.readInt(1) !== 1) {
            return null;
          }
          if (crc32fn(this.fileComment) !== extraReader.readInt(4)) {
            return null;
          }
          return utf8.utf8decode(extraReader.readData(ucommentField.length - 5));
        }
        return null;
      }
    };
    module2.exports = ZipEntry;
  }
});

// node_modules/jszip/lib/zipEntries.js
var require_zipEntries = __commonJS({
  "node_modules/jszip/lib/zipEntries.js"(exports2, module2) {
    "use strict";
    var readerFor = require_readerFor();
    var utils = require_utils();
    var sig = require_signature();
    var ZipEntry = require_zipEntry();
    var support = require_support();
    function ZipEntries(loadOptions) {
      this.files = [];
      this.loadOptions = loadOptions;
    }
    ZipEntries.prototype = {
      /**
       * Check that the reader is on the specified signature.
       * @param {string} expectedSignature the expected signature.
       * @throws {Error} if it is an other signature.
       */
      checkSignature: function(expectedSignature) {
        if (!this.reader.readAndCheckSignature(expectedSignature)) {
          this.reader.index -= 4;
          var signature = this.reader.readString(4);
          throw new Error("Corrupted zip or bug: unexpected signature (" + utils.pretty(signature) + ", expected " + utils.pretty(expectedSignature) + ")");
        }
      },
      /**
       * Check if the given signature is at the given index.
       * @param {number} askedIndex the index to check.
       * @param {string} expectedSignature the signature to expect.
       * @return {boolean} true if the signature is here, false otherwise.
       */
      isSignature: function(askedIndex, expectedSignature) {
        var currentIndex = this.reader.index;
        this.reader.setIndex(askedIndex);
        var signature = this.reader.readString(4);
        var result = signature === expectedSignature;
        this.reader.setIndex(currentIndex);
        return result;
      },
      /**
       * Read the end of the central directory.
       */
      readBlockEndOfCentral: function() {
        this.diskNumber = this.reader.readInt(2);
        this.diskWithCentralDirStart = this.reader.readInt(2);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
        this.centralDirRecords = this.reader.readInt(2);
        this.centralDirSize = this.reader.readInt(4);
        this.centralDirOffset = this.reader.readInt(4);
        this.zipCommentLength = this.reader.readInt(2);
        var zipComment = this.reader.readData(this.zipCommentLength);
        var decodeParamType = support.uint8array ? "uint8array" : "array";
        var decodeContent = utils.transformTo(decodeParamType, zipComment);
        this.zipComment = this.loadOptions.decodeFileName(decodeContent);
      },
      /**
       * Read the end of the Zip 64 central directory.
       * Not merged with the method readEndOfCentral :
       * The end of central can coexist with its Zip64 brother,
       * I don't want to read the wrong number of bytes !
       */
      readBlockZip64EndOfCentral: function() {
        this.zip64EndOfCentralSize = this.reader.readInt(8);
        this.reader.skip(4);
        this.diskNumber = this.reader.readInt(4);
        this.diskWithCentralDirStart = this.reader.readInt(4);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
        this.centralDirRecords = this.reader.readInt(8);
        this.centralDirSize = this.reader.readInt(8);
        this.centralDirOffset = this.reader.readInt(8);
        this.zip64ExtensibleData = {};
        var extraDataSize = this.zip64EndOfCentralSize - 44, index = 0, extraFieldId, extraFieldLength, extraFieldValue;
        while (index < extraDataSize) {
          extraFieldId = this.reader.readInt(2);
          extraFieldLength = this.reader.readInt(4);
          extraFieldValue = this.reader.readData(extraFieldLength);
          this.zip64ExtensibleData[extraFieldId] = {
            id: extraFieldId,
            length: extraFieldLength,
            value: extraFieldValue
          };
        }
      },
      /**
       * Read the end of the Zip 64 central directory locator.
       */
      readBlockZip64EndOfCentralLocator: function() {
        this.diskWithZip64CentralDirStart = this.reader.readInt(4);
        this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
        this.disksCount = this.reader.readInt(4);
        if (this.disksCount > 1) {
          throw new Error("Multi-volumes zip are not supported");
        }
      },
      /**
       * Read the local files, based on the offset read in the central part.
       */
      readLocalFiles: function() {
        var i, file;
        for (i = 0; i < this.files.length; i++) {
          file = this.files[i];
          this.reader.setIndex(file.localHeaderOffset);
          this.checkSignature(sig.LOCAL_FILE_HEADER);
          file.readLocalPart(this.reader);
          file.handleUTF8();
          file.processAttributes();
        }
      },
      /**
       * Read the central directory.
       */
      readCentralDir: function() {
        var file;
        this.reader.setIndex(this.centralDirOffset);
        while (this.reader.readAndCheckSignature(sig.CENTRAL_FILE_HEADER)) {
          file = new ZipEntry({
            zip64: this.zip64
          }, this.loadOptions);
          file.readCentralPart(this.reader);
          this.files.push(file);
        }
        if (this.centralDirRecords !== this.files.length) {
          if (this.centralDirRecords !== 0 && this.files.length === 0) {
            throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
          } else {
          }
        }
      },
      /**
       * Read the end of central directory.
       */
      readEndOfCentral: function() {
        var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
        if (offset < 0) {
          var isGarbage = !this.isSignature(0, sig.LOCAL_FILE_HEADER);
          if (isGarbage) {
            throw new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
          } else {
            throw new Error("Corrupted zip: can't find end of central directory");
          }
        }
        this.reader.setIndex(offset);
        var endOfCentralDirOffset = offset;
        this.checkSignature(sig.CENTRAL_DIRECTORY_END);
        this.readBlockEndOfCentral();
        if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {
          this.zip64 = true;
          offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
          if (offset < 0) {
            throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
          }
          this.reader.setIndex(offset);
          this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
          this.readBlockZip64EndOfCentralLocator();
          if (!this.isSignature(this.relativeOffsetEndOfZip64CentralDir, sig.ZIP64_CENTRAL_DIRECTORY_END)) {
            this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
            if (this.relativeOffsetEndOfZip64CentralDir < 0) {
              throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            }
          }
          this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
          this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
          this.readBlockZip64EndOfCentral();
        }
        var expectedEndOfCentralDirOffset = this.centralDirOffset + this.centralDirSize;
        if (this.zip64) {
          expectedEndOfCentralDirOffset += 20;
          expectedEndOfCentralDirOffset += 12 + this.zip64EndOfCentralSize;
        }
        var extraBytes = endOfCentralDirOffset - expectedEndOfCentralDirOffset;
        if (extraBytes > 0) {
          if (this.isSignature(endOfCentralDirOffset, sig.CENTRAL_FILE_HEADER)) {
          } else {
            this.reader.zero = extraBytes;
          }
        } else if (extraBytes < 0) {
          throw new Error("Corrupted zip: missing " + Math.abs(extraBytes) + " bytes.");
        }
      },
      prepareReader: function(data) {
        this.reader = readerFor(data);
      },
      /**
       * Read a zip file and create ZipEntries.
       * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
       */
      load: function(data) {
        this.prepareReader(data);
        this.readEndOfCentral();
        this.readCentralDir();
        this.readLocalFiles();
      }
    };
    module2.exports = ZipEntries;
  }
});

// node_modules/jszip/lib/load.js
var require_load = __commonJS({
  "node_modules/jszip/lib/load.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    var external = require_external();
    var utf8 = require_utf8();
    var ZipEntries = require_zipEntries();
    var Crc32Probe = require_Crc32Probe();
    var nodejsUtils = require_nodejsUtils();
    function checkEntryCRC32(zipEntry) {
      return new external.Promise(function(resolve, reject) {
        var worker = zipEntry.decompressed.getContentWorker().pipe(new Crc32Probe());
        worker.on("error", function(e) {
          reject(e);
        }).on("end", function() {
          if (worker.streamInfo.crc32 !== zipEntry.decompressed.crc32) {
            reject(new Error("Corrupted zip : CRC32 mismatch"));
          } else {
            resolve();
          }
        }).resume();
      });
    }
    module2.exports = function(data, options) {
      var zip = this;
      options = utils.extend(options || {}, {
        base64: false,
        checkCRC32: false,
        optimizedBinaryString: false,
        createFolders: false,
        decodeFileName: utf8.utf8decode
      });
      if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
        return external.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file."));
      }
      return utils.prepareContent("the loaded zip file", data, true, options.optimizedBinaryString, options.base64).then(function(data2) {
        var zipEntries = new ZipEntries(options);
        zipEntries.load(data2);
        return zipEntries;
      }).then(function checkCRC32(zipEntries) {
        var promises = [external.Promise.resolve(zipEntries)];
        var files = zipEntries.files;
        if (options.checkCRC32) {
          for (var i = 0; i < files.length; i++) {
            promises.push(checkEntryCRC32(files[i]));
          }
        }
        return external.Promise.all(promises);
      }).then(function addFiles(results) {
        var zipEntries = results.shift();
        var files = zipEntries.files;
        for (var i = 0; i < files.length; i++) {
          var input = files[i];
          var unsafeName = input.fileNameStr;
          var safeName = utils.resolve(input.fileNameStr);
          zip.file(safeName, input.decompressed, {
            binary: true,
            optimizedBinaryString: true,
            date: input.date,
            dir: input.dir,
            comment: input.fileCommentStr.length ? input.fileCommentStr : null,
            unixPermissions: input.unixPermissions,
            dosPermissions: input.dosPermissions,
            createFolders: options.createFolders
          });
          if (!input.dir) {
            zip.file(safeName).unsafeOriginalName = unsafeName;
          }
        }
        if (zipEntries.zipComment.length) {
          zip.comment = zipEntries.zipComment;
        }
        return zip;
      });
    };
  }
});

// node_modules/jszip/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/jszip/lib/index.js"(exports2, module2) {
    "use strict";
    function JSZip2() {
      if (!(this instanceof JSZip2)) {
        return new JSZip2();
      }
      if (arguments.length) {
        throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
      }
      this.files = /* @__PURE__ */ Object.create(null);
      this.comment = null;
      this.root = "";
      this.clone = function() {
        var newObj = new JSZip2();
        for (var i in this) {
          if (typeof this[i] !== "function") {
            newObj[i] = this[i];
          }
        }
        return newObj;
      };
    }
    JSZip2.prototype = require_object();
    JSZip2.prototype.loadAsync = require_load();
    JSZip2.support = require_support();
    JSZip2.defaults = require_defaults();
    JSZip2.version = "3.10.1";
    JSZip2.loadAsync = function(content, options) {
      return new JSZip2().loadAsync(content, options);
    };
    JSZip2.external = require_external();
    module2.exports = JSZip2;
  }
});

// src/ReferenceDocGenerator.ts
var ReferenceDocGenerator_exports = {};
__export(ReferenceDocGenerator_exports, {
  ReferenceDocGenerator: () => ReferenceDocGenerator
});
var JSZip, path, fs, os, ReferenceDocGenerator, CONTENT_TYPES, ROOT_RELS, DOCUMENT_RELS, DOCUMENT_XML, SETTINGS_XML, STYLES_XML;
var init_ReferenceDocGenerator = __esm({
  "src/ReferenceDocGenerator.ts"() {
    JSZip = require_lib3();
    path = require("path");
    fs = require("fs");
    os = require("os");
    ReferenceDocGenerator = class {
      static async generate() {
        const zip = new JSZip();
        zip.file("[Content_Types].xml", CONTENT_TYPES);
        zip.folder("_rels").file(".rels", ROOT_RELS);
        const word = zip.folder("word");
        word.file("document.xml", DOCUMENT_XML);
        word.file("styles.xml", STYLES_XML);
        word.file("settings.xml", SETTINGS_XML);
        word.folder("_rels").file("document.xml.rels", DOCUMENT_RELS);
        const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
        const out = path.join(os.tmpdir(), "zotero-reference-chinese-law.docx");
        fs.writeFileSync(out, buf);
        return out;
      }
    };
    CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml"   ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`;
    ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
    DOCUMENT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"   Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`;
    DOCUMENT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Normal"/></w:pPr></w:p>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1800" w:bottom="1440" w:left="1800"
               w:header="851" w:footer="992" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
    SETTINGS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="840"/>
  <w:compat>
    <w:spaceForUL/>
    <w:balanceSingleByteDoubleByteWidth/>
    <w:doNotLeaveBackslashAlone/>
    <w:ulTrailSpace/>
    <w:doNotExpandShiftReturn/>
    <w:adjustLineHeightInTable/>
  </w:compat>
</w:settings>`;
    STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">

  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"
                  w:eastAsia="\u5B8B\u4F53" w:cs="Times New Roman"/>
        <w:sz w:val="24"/><w:szCs w:val="24"/>
        <w:lang w:val="en-US" w:eastAsia="zh-CN" w:bidi="ar-SA"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto"/>
        <w:jc w:val="both"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:line="360" w:lineRule="auto"/>
      <w:jc w:val="both"/>
      <w:ind w:firstLine="480"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="\u5B8B\u4F53"/>
      <w:sz w:val="24"/><w:szCs w:val="24"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:outlineLvl w:val="0"/>
      <w:jc w:val="center"/>
      <w:spacing w:before="360" w:after="240" w:line="360" w:lineRule="auto"/>
      <w:ind w:firstLine="0"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="\u9ED1\u4F53"/>
      <w:b/><w:bCs/>
      <w:sz w:val="32"/><w:szCs w:val="32"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:outlineLvl w:val="1"/>
      <w:spacing w:before="240" w:after="120" w:line="360" w:lineRule="auto"/>
      <w:ind w:firstLine="0"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="\u9ED1\u4F53"/>
      <w:b/><w:bCs/>
      <w:sz w:val="28"/><w:szCs w:val="28"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:outlineLvl w:val="2"/>
      <w:spacing w:before="160" w:after="80" w:line="360" w:lineRule="auto"/>
      <w:ind w:firstLine="0"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="\u9ED1\u4F53"/>
      <w:b/><w:bCs/>
      <w:sz w:val="24"/><w:szCs w:val="24"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="FootnoteText">
    <w:name w:val="footnote text"/>
    <w:basedOn w:val="Normal"/>
    <w:semiHidden/>
    <w:pPr>
      <w:spacing w:line="240" w:lineRule="auto"/>
      <w:ind w:firstLine="0" w:left="0" w:right="0"/>
      <w:jc w:val="left"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="\u5B8B\u4F53"/>
      <w:sz w:val="18"/><w:szCs w:val="18"/>
    </w:rPr>
  </w:style>

  <w:style w:type="character" w:styleId="FootnoteReference">
    <w:name w:val="footnote reference"/>
    <w:semiHidden/>
    <w:rPr><w:vertAlign w:val="superscript"/></w:rPr>
  </w:style>

  <w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont">
    <w:name w:val="Default Paragraph Font"/>
    <w:semiHidden/><w:uiPriority w:val="1"/>
  </w:style>

  <w:style w:type="paragraph" w:styleId="BodyText">
    <w:name w:val="Body Text"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:line="360" w:lineRule="auto"/>
      <w:jc w:val="both"/>
      <w:ind w:firstLine="480"/>
    </w:pPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="FirstParagraph">
    <w:name w:val="First Paragraph"/>
    <w:basedOn w:val="Normal"/>
  </w:style>

  <w:style w:type="paragraph" w:styleId="BlockText">
    <w:name w:val="Block Text"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:ind w:left="0" w:right="0" w:firstLine="0"/>
      <w:jc w:val="both"/>
      <w:spacing w:line="360" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:sz w:val="22"/><w:szCs w:val="22"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="SourceCode">
    <w:name w:val="Source Code"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:ind w:left="720" w:firstLine="0"/>
      <w:spacing w:line="240" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:eastAsia="\u4EFF\u5B8B"/>
      <w:sz w:val="20"/><w:szCs w:val="20"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="ImageCaption">
    <w:name w:val="Image Caption"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:ind w:firstLine="0"/></w:pPr>
    <w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>
  </w:style>

  <w:style w:type="table" w:default="1" w:styleId="TableNormal">
    <w:name w:val="Normal Table"/>
    <w:semiHidden/>
    <w:tblPr>
      <w:tblCellMar>
        <w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/>
        <w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
  </w:style>

</w:styles>`;
  }
});

// src/ExportManager.ts
var ExportManager_exports = {};
__export(ExportManager_exports, {
  ExportError: () => ExportError,
  ExportManager: () => ExportManager,
  buildEnv: () => buildEnv,
  execAsync: () => execAsync
});
function buildEnv() {
  var _a;
  const extraPaths = [
    "/opt/homebrew/bin",
    "/opt/homebrew/sbin",
    "/usr/local/bin",
    "/usr/local/sbin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin"
  ].join(":");
  return {
    ...process.env,
    PATH: `${extraPaths}:${(_a = process.env.PATH) != null ? _a : ""}`
  };
}
var import_obsidian2, exec, path2, promisify, execAsync, ExportManager, ExportError;
var init_ExportManager = __esm({
  "src/ExportManager.ts"() {
    import_obsidian2 = require("obsidian");
    init_i18n();
    init_settings();
    ({ exec } = require("child_process"));
    path2 = require("path");
    ({ promisify } = require("util"));
    execAsync = promisify(exec);
    ExportManager = class _ExportManager {
      static async exportToWord(inputPath, outputPath, settings) {
        var _a, _b;
        const pandoc = settings.pandocPath.trim() || "pandoc";
        const extraFlags = settings.pandocFlags.trim();
        const { ReferenceDocGenerator: ReferenceDocGenerator2 } = await Promise.resolve().then(() => (init_ReferenceDocGenerator(), ReferenceDocGenerator_exports));
        const refDoc = await ReferenceDocGenerator2.generate();
        const cmd = [
          _ExportManager.q(pandoc),
          _ExportManager.q(inputPath),
          "-o",
          _ExportManager.q(outputPath),
          "-f",
          "markdown",
          "--to",
          "docx",
          "--wrap=none",
          `--reference-doc=${_ExportManager.q(refDoc)}`,
          extraFlags
        ].filter(Boolean).join(" ");
        try {
          await execAsync(cmd, { timeout: 12e4, env: buildEnv() });
        } catch (err) {
          throw new ExportError(t(settings, "export.pandocFailed", {
            error: (_b = (_a = err.stderr) != null ? _a : err.message) != null ? _b : String(err)
          }));
        }
      }
      static async showNativeSaveDialog(defaultPath, settings = DEFAULT_SETTINGS) {
        var _a, _b, _c;
        try {
          const electron = require("electron");
          const dialog = (_b = (_a = electron.remote) != null ? _a : electron) == null ? void 0 : _b.dialog;
          if (!(dialog == null ? void 0 : dialog.showSaveDialog))
            return void 0;
          const result = await dialog.showSaveDialog({
            title: t(settings, "export.dialogTitle"),
            defaultPath,
            filters: [{ name: t(settings, "export.filterName"), extensions: ["docx"] }],
            properties: ["createDirectory", "showOverwriteConfirmation"]
          });
          return result.canceled ? null : (_c = result.filePath) != null ? _c : void 0;
        } catch (e) {
          return void 0;
        }
      }
      static suggestOutputPath(inputPath, settings) {
        const dir = settings.useDefaultExportDir && settings.exportOutputDir.trim() ? settings.exportOutputDir.trim() : path2.dirname(inputPath);
        const base = path2.basename(inputPath, path2.extname(inputPath));
        return path2.join(dir, `${base}.docx`);
      }
      static async verifyAndNotify(settings) {
        const pandoc = settings.pandocPath.trim() || "pandoc";
        try {
          const { stdout } = await execAsync(`${_ExportManager.q(pandoc)} --version`, { timeout: 1e4, env: buildEnv() });
          new import_obsidian2.Notice(`\u2713 ${stdout.split("\n")[0].trim()}`, 4e3);
        } catch (e) {
          new import_obsidian2.Notice(t(settings, "export.pandocMissing", { pandoc }), 8e3);
        }
      }
      static q(s) {
        if (!s)
          return "";
        return process.platform === "win32" ? `"${s.replace(/"/g, '\\"')}"` : `'${s.replace(/'/g, "'\\''")}'`;
      }
    };
    ExportError = class extends Error {
      constructor(msg) {
        super(msg);
        this.name = "ExportError";
      }
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ZoteroCitations
});
module.exports = __toCommonJS(main_exports);
var obsidian = __toESM(require("obsidian"));
init_CitationManager();
init_ExportManager();

// src/extensions/FootnoteExtension.ts
var import_obsidian3 = require("obsidian");
var import_view = require("@codemirror/view");
init_i18n();
init_CitationManager();
var FnWidget = class extends import_view.WidgetType {
  constructor(num, preview, app, getSourcePath, identifier, domId, isHighlighted = false) {
    super();
    this.num = num;
    this.preview = preview;
    this.app = app;
    this.getSourcePath = getSourcePath;
    this.identifier = identifier;
    this.domId = domId;
    this.isHighlighted = isHighlighted;
  }
  eq(other) {
    var _a, _b;
    return this.num === other.num && this.preview.markdown === other.preview.markdown && this.preview.text === other.preview.text && this.identifier === other.identifier && this.domId === other.domId && this.isHighlighted === other.isHighlighted && ((_a = this.preview.edit) == null ? void 0 : _a.from) === ((_b = other.preview.edit) == null ? void 0 : _b.from);
  }
  toDOM() {
    const wrapper = document.createElement("span");
    wrapper.className = "zotero-fn-widget";
    const sup = document.createElement("sup");
    sup.className = "zotero-fn-num footnote-ref";
    sup.setAttribute("data-footnote-id", `fnref-${this.domId}`);
    const marker = document.createElement("span");
    marker.className = "footnote-link zotero-footnote-marker";
    marker.setAttribute("data-footref", this.identifier);
    marker.setAttribute("tabindex", "0");
    marker.textContent = `[${this.domId}]`;
    if (this.isHighlighted) {
      wrapper.classList.add("zotero-fn-highlighted", "cm-highlight");
    }
    const text = this.preview.text || appT(this.app, "footnote.fallback", { value: this.num });
    marker.addEventListener("mousedown", (event) => event.preventDefault());
    marker.addEventListener("click", (event) => event.preventDefault());
    attachRenderedPopover(marker, {
      app: this.app,
      getSourcePath: this.getSourcePath,
      markdown: this.preview.markdown,
      fallbackText: text,
      edit: this.preview.edit || void 0
    });
    sup.appendChild(marker);
    wrapper.appendChild(sup);
    return wrapper;
  }
  ignoreEvent(event) {
    return event.type === "mouseenter" || event.type === "mouseleave" || event.type === "mousemove" || event.type === "mouseover" || event.type === "mouseout" || event.type === "pointerenter" || event.type === "pointerleave" || event.type === "pointermove" || event.type === "pointerover" || event.type === "pointerout" || event.type === "mousedown" || event.type === "mouseup" || event.type === "click";
  }
};
function createFootnoteExtension(options) {
  return import_view.ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = buildDeco(view, options);
      }
      update(update) {
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
          this.decorations = buildDeco(update.view, options);
        }
      }
    },
    { decorations: (v) => v.decorations }
  );
}
function buildDeco(view, options) {
  var _a;
  if (!options.isEnabled())
    return import_view.Decoration.none;
  const doc = view.state.doc.toString();
  const sel = view.state.selection.main;
  const endnotePreviews = buildEndnotePreviewMap(doc, options.app);
  const hits = [];
  const tokenRe = /\^\[(?:[^\]\\]|\\.)*\]|\[\^([^\]\n]+)\](?!:)/g;
  let sequence = 0;
  let inlineSerial = 0;
  const refOrder = /* @__PURE__ */ new Map();
  const refUses = /* @__PURE__ */ new Map();
  let m;
  while ((m = tokenRe.exec(doc)) !== null) {
    const raw = m[0];
    if (raw.startsWith("^[")) {
      const preview = extractInlinePreview(raw, sequence, options.app);
      if (preview.edit) {
        preview.edit.from = m.index;
        preview.edit.to = m.index + raw.length;
      }
      sequence++;
      hits.push({
        start: m.index,
        end: m.index + raw.length,
        num: sequence,
        identifier: `[inline${inlineSerial}]`,
        domId: String(sequence),
        ...preview
      });
      inlineSerial++;
      continue;
    }
    const lineStart = doc.lastIndexOf("\n", m.index - 1) + 1;
    const before = doc.slice(lineStart, m.index);
    if (/^\s*$/.test(before))
      continue;
    const label = m[1].trim().toLowerCase();
    let ordinal = refOrder.get(label);
    if (ordinal == null) {
      sequence++;
      ordinal = sequence;
      refOrder.set(label, ordinal);
      refUses.set(label, 0);
    }
    const repeatCount = (_a = refUses.get(label)) != null ? _a : 0;
    refUses.set(label, repeatCount + 1);
    const endnotePreview = endnotePreviews.get(label);
    hits.push({
      start: m.index,
      end: m.index + raw.length,
      num: ordinal,
      identifier: label,
      domId: repeatCount > 0 ? `${ordinal}-${repeatCount}` : `${ordinal}`,
      ...endnotePreview != null ? endnotePreview : { markdown: "", text: appT(options.app, "footnote.fallback", { value: ordinal }) }
    });
  }
  hits.sort((a, b) => a.start - b.start);
  const ranges = [];
  let lastEnd = -1;
  for (const { start, end, num, markdown, text, identifier, domId, edit } of hits) {
    if (start < lastEnd)
      continue;
    if (sel.from <= end && sel.to >= start)
      continue;
    if (!inViewport(view, start, end))
      continue;
    ranges.push(
      import_view.Decoration.replace({
        widget: new FnWidget(
          num,
          { markdown, text, edit },
          options.app,
          options.getSourcePath,
          identifier,
          domId,
          isInsideHighlight(doc, start, end)
        )
      }).range(start, end)
    );
    lastEnd = end;
  }
  return import_view.Decoration.set(ranges);
}
function inViewport(view, from, to) {
  for (const vr of view.visibleRanges) {
    if (from <= vr.to && to >= vr.from)
      return true;
  }
  return false;
}
function isInsideHighlight(doc, from, to) {
  const lineStart = doc.lastIndexOf("\n", from - 1) + 1;
  let lineEnd = doc.indexOf("\n", to);
  if (lineEnd === -1)
    lineEnd = doc.length;
  const line = doc.slice(lineStart, lineEnd);
  const relFrom = from - lineStart;
  const relTo = to - lineStart;
  return countHighlightDelimiters(line.slice(0, relFrom)) % 2 === 1 && countHighlightDelimiters(line.slice(relTo)) % 2 === 1;
}
function countHighlightDelimiters(text) {
  let count = 0;
  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] === "\\") {
      i++;
      continue;
    }
    if (text[i] === "=" && text[i + 1] === "=") {
      count++;
      i++;
    }
  }
  return count;
}
function extractInlinePreview(rawMarker, num, app) {
  const body = rawMarker.slice(2, -1);
  const metadata = parseZoteroMetadata(body);
  const markdown = metadata.markdown.trim();
  const text = normalizeTooltipText(markdown);
  return {
    markdown,
    text: text || appT(app, "footnote.fallback", { value: num }),
    edit: metadata.key ? { kind: "inline", key: metadata.key, locator: metadata.locator, from: -1, to: -1 } : null
  };
}
function buildEndnotePreviewMap(doc, app) {
  const map = /* @__PURE__ */ new Map();
  const lines = doc.split("\n");
  const lineOffsets = [];
  let docOffset = 0;
  for (const line of lines) {
    lineOffsets.push(docOffset);
    docOffset += line.length + 1;
  }
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\[\^([^\]\n]+)\]:\s*(.*)$/);
    if (!match)
      continue;
    const label = match[1].trim().toLowerCase();
    const body = [match[2]];
    let next = i + 1;
    while (next < lines.length) {
      const line = lines[next];
      if (/^( {4}|\t)/.test(line)) {
        body.push(line.replace(/^( {4}|\t)/, ""));
        next++;
        continue;
      }
      if (line.trim() === "" && next + 1 < lines.length && /^( {4}|\t)/.test(lines[next + 1])) {
        body.push("");
        next++;
        continue;
      }
      break;
    }
    const metadata = parseZoteroMetadata(body.join("\n"));
    const markdown = metadata.markdown.trim();
    const endLine = next - 1;
    map.set(label, {
      markdown,
      text: normalizeTooltipText(markdown) || appT(app, "footnote.fallback", { value: label }),
      edit: metadata.key ? {
        kind: "endnote",
        key: metadata.key,
        locator: metadata.locator,
        label: match[1],
        from: lineOffsets[i],
        to: lineOffsets[endLine] + lines[endLine].length
      } : null
    });
    i = next - 1;
  }
  return map;
}
function parseZoteroMetadata(text) {
  const match = text.match(/^<!--\s*zotero:([^:>]+):([^ ]*)\s*-->\s*/);
  if (!match)
    return { key: "", locator: "", markdown: text };
  return { key: match[1], locator: decodeURIComponent(match[2] || ""), markdown: text.slice(match[0].length) };
}
function normalizeTooltipText(text) {
  return text.replace(/\s+/g, " ").trim();
}
var activePopover = null;
function attachRenderedPopover(target, spec) {
  const show = () => showRenderedPopover(target, spec);
  const scheduleHide = () => schedulePopoverHide(target);
  target.addEventListener("mouseenter", show);
  target.addEventListener("mouseleave", scheduleHide);
  target.addEventListener("mousemove", show);
  target.addEventListener("pointerenter", show);
  target.addEventListener("pointerleave", scheduleHide);
  target.addEventListener("pointermove", show);
  target.addEventListener("focus", show);
  target.addEventListener("blur", scheduleHide);
}
function showRenderedPopover(target, spec) {
  if (!spec.markdown && !spec.fallbackText)
    return;
  if ((activePopover == null ? void 0 : activePopover.target) === target) {
    cancelPopoverHide();
    activePopover.reposition();
    return;
  }
  destroyActivePopover();
  const popover = document.createElement("div");
  popover.className = "popover hover-popover zotero-footnote-popover";
  popover.style.position = "fixed";
  const embed = popover.createDiv({ cls: "markdown-embed", attr: { "data-type": "footnote" } });
  const embedContent = embed.createDiv({ cls: "markdown-embed-content" });
  const preview = embedContent.createDiv({ cls: "markdown-preview-view markdown-rendered" });
  preview.setText(spec.fallbackText);
  if (spec.edit) {
    mountLocatorEditor(embedContent, spec, target);
  }
  if (!spec.markdown.trim())
    embed.addClass("mod-empty");
  document.body.appendChild(popover);
  const component = new import_obsidian3.Component();
  const reposition = () => positionPopover(target, popover);
  const onPopoverEnter = () => cancelPopoverHide();
  const onPopoverLeave = () => schedulePopoverHide(target);
  popover.addEventListener("mouseenter", onPopoverEnter);
  popover.addEventListener("mouseleave", onPopoverLeave);
  window.addEventListener("scroll", reposition, true);
  window.addEventListener("resize", reposition);
  activePopover = { target, popover, component, hideTimer: null, reposition, onPopoverEnter, onPopoverLeave };
  reposition();
  requestAnimationFrame(reposition);
  if (spec.markdown.trim()) {
    void renderPopoverMarkdown(preview, spec, component, target, reposition);
  }
}
async function renderPopoverMarkdown(preview, spec, component, target, reposition) {
  var _a;
  try {
    preview.empty();
    await import_obsidian3.MarkdownRenderer.render(spec.app, spec.markdown, preview, spec.getSourcePath(), component);
    if ((activePopover == null ? void 0 : activePopover.target) !== target)
      return;
    reposition();
    requestAnimationFrame(reposition);
  } catch (e) {
    if (!((_a = preview.textContent) == null ? void 0 : _a.trim()))
      preview.setText(spec.fallbackText);
  }
}
function mountLocatorEditor(container, spec, target) {
  const wrap = container.createDiv({ cls: "zotero-footnote-locator-editor" });
  const input = wrap.createEl("input", { type: "text" });
  input.value = spec.edit.locator || "";
  input.placeholder = appT(spec.app, "footnote.locatorPlaceholder");
  const btnRow = wrap.createDiv();
  const saveBtn = btnRow.createEl("button", { text: appT(spec.app, "footnote.saveLocator"), cls: "mod-cta" });
  const save = async () => {
    saveBtn.disabled = true;
    const ok = await applyLocatorEdit(spec, input.value.trim());
    saveBtn.disabled = false;
    if (ok && (activePopover == null ? void 0 : activePopover.target) === target)
      destroyActivePopover();
  };
  saveBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    void save();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void save();
    }
  });
}
async function applyLocatorEdit(spec, locator) {
  const plugin = spec.app.plugins.plugins["zotero-citations"];
  const view = spec.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
  const editor = view == null ? void 0 : view.editor;
  if (!plugin || !editor) {
    new import_obsidian3.Notice(appT(spec.app, "footnote.noEditor"));
    return false;
  }
  const item = plugin.getCached(spec.edit.key) || await plugin.fetchAndCache(spec.edit.key);
  if (!item) {
    new import_obsidian3.Notice(appT(spec.app, "footnote.noItem"));
    return false;
  }
  const page = locator || void 0;
  const style = plugin.settings.cslStyle;
  if (spec.edit.kind === "inline") {
    const replacement = CitationManager.buildInlineFootnote(item, style, page);
    editor.replaceRange(replacement, editor.offsetToPos(spec.edit.from), editor.offsetToPos(spec.edit.to));
  } else {
    const replacement = CitationManager.buildEndnoteDef(spec.edit.label, item, style, page);
    editor.replaceRange(replacement, editor.offsetToPos(spec.edit.from), editor.offsetToPos(spec.edit.to));
  }
  new import_obsidian3.Notice(appT(spec.app, "footnote.updated"));
  return true;
}
function positionPopover(target, popover) {
  const margin = 8, gap = 10;
  const rect = target.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  let top = rect.top - popoverRect.height - gap;
  if (top < margin)
    top = rect.bottom + gap;
  top = Math.max(margin, Math.min(window.innerHeight - popoverRect.height - margin, top));
  const left = Math.min(
    window.innerWidth - popoverRect.width - margin,
    Math.max(margin, rect.left + rect.width / 2 - popoverRect.width / 2)
  );
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}
function schedulePopoverHide(target) {
  if (!activePopover || activePopover.target !== target)
    return;
  cancelPopoverHide();
  activePopover.hideTimer = window.setTimeout(() => {
    if ((activePopover == null ? void 0 : activePopover.target) === target)
      destroyActivePopover();
  }, 80);
}
function cancelPopoverHide() {
  if (!(activePopover == null ? void 0 : activePopover.hideTimer))
    return;
  window.clearTimeout(activePopover.hideTimer);
  activePopover.hideTimer = null;
}
function destroyActivePopover() {
  if (!activePopover)
    return;
  const { popover, component, reposition, onPopoverEnter, onPopoverLeave, hideTimer } = activePopover;
  if (hideTimer)
    window.clearTimeout(hideTimer);
  popover.removeEventListener("mouseenter", onPopoverEnter);
  popover.removeEventListener("mouseleave", onPopoverLeave);
  window.removeEventListener("scroll", reposition, true);
  window.removeEventListener("resize", reposition);
  component.unload();
  popover.remove();
  activePopover = null;
}

// src/main.ts
init_i18n();

// src/modals/ExportModal.ts
var import_obsidian4 = require("obsidian");
init_i18n();
var ExportModal = class extends import_obsidian4.Modal {
  constructor(app, suggestedPath, onConfirm) {
    super(app);
    this.suggestedPath = suggestedPath;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: appT(this.app, "export.chooseLocation") });
    contentEl.createEl("p", {
      text: appT(this.app, "export.pathHint"),
      cls: "zotero-export-hint"
    });
    this.input = contentEl.createEl("input", { type: "text" });
    this.input.value = this.suggestedPath;
    this.input.style.width = "100%";
    this.input.style.marginBottom = "12px";
    this.input.style.padding = "6px 10px";
    this.input.style.boxSizing = "border-box";
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        this.doConfirm();
      if (e.key === "Escape")
        this.close();
    });
    const btnRow = contentEl.createDiv({ cls: "zotero-btn-row" });
    btnRow.style.display = "flex";
    btnRow.style.justifyContent = "flex-end";
    btnRow.style.gap = "8px";
    const cancel = btnRow.createEl("button", { text: appT(this.app, "common.cancel") });
    cancel.addEventListener("click", () => this.close());
    const confirm = btnRow.createEl("button", { text: appT(this.app, "common.export"), cls: "mod-cta" });
    confirm.addEventListener("click", () => this.doConfirm());
    setTimeout(() => {
      this.input.focus();
      this.input.select();
    }, 50);
  }
  doConfirm() {
    const p = this.input.value.trim();
    if (!p)
      return;
    this.close();
    this.onConfirm(p);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modals/PreferencesModal.ts
var import_obsidian6 = require("obsidian");
init_i18n();

// src/ZoteroAPI.ts
var import_obsidian5 = require("obsidian");
var nodeHttp = __toESM(require("http"));
var fs2 = __toESM(require("fs"));
var os2 = __toESM(require("os"));
var path3 = __toESM(require("path"));
var LOCATOR_PREFIX = {
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
  volume: "vol."
};
function formatLocator(locator, label) {
  var _a;
  if (!locator)
    return "";
  const prefix = (_a = LOCATOR_PREFIX[label != null ? label : "page"]) != null ? _a : "";
  return prefix ? `${prefix} ${locator}` : locator;
}
var ZoteroConnectionError = class extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ZoteroConnectionError";
  }
};
var ZoteroPickerError = class extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ZoteroPickerError";
  }
};
var ZoteroAPI = class {
  constructor(port = 23119) {
    this.port = port;
    this.baseUrl = `http://127.0.0.1:${port}`;
  }
  async ping() {
    try {
      const r = await (0, import_obsidian5.requestUrl)({ url: `${this.baseUrl}/connector/ping`, method: "GET", throw: false });
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
  locateZoteroStylesDir() {
    const home = os2.homedir();
    const candidates = [];
    if (process.platform === "darwin") {
      candidates.push(path3.join(home, "Zotero", "styles"));
      candidates.push(path3.join(home, "Library", "Application Support", "Zotero", "Profiles"));
    } else if (process.platform === "win32") {
      const appdata = process.env.APPDATA || path3.join(home, "AppData", "Roaming");
      candidates.push(path3.join(appdata, "Zotero", "Zotero", "Profiles"));
      candidates.push(path3.join(home, "Zotero", "styles"));
    } else {
      candidates.push(path3.join(home, "Zotero", "styles"));
      candidates.push(path3.join(home, ".zotero", "zotero"));
    }
    for (const dir of candidates) {
      try {
        if (fs2.existsSync(dir) && fs2.statSync(dir).isDirectory()) {
          const files = fs2.readdirSync(dir);
          if (files.some((f) => f.endsWith(".csl")))
            return dir;
        }
      } catch (e) {
      }
    }
    for (const dir of candidates) {
      if (!dir.includes("Profiles"))
        continue;
      try {
        if (!fs2.existsSync(dir))
          continue;
        const profiles = fs2.readdirSync(dir);
        for (const profile of profiles) {
          const stylesDir = path3.join(dir, profile, "styles");
          if (fs2.existsSync(stylesDir) && fs2.statSync(stylesDir).isDirectory()) {
            return stylesDir;
          }
        }
      } catch (e) {
      }
    }
    return null;
  }
  /**
   * Read all installed CSL styles from Zotero's styles directory.
   * Parses each .csl file's <title> and <id> tags.
   */
  async getInstalledStyles() {
    const stylesDir = this.locateZoteroStylesDir();
    if (!stylesDir)
      return [];
    const results = [];
    try {
      const files = fs2.readdirSync(stylesDir).filter((f) => f.endsWith(".csl"));
      for (const file of files) {
        try {
          const content = fs2.readFileSync(path3.join(stylesDir, file), "utf-8");
          const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/);
          const idMatch = content.match(/<id[^>]*>([^<]+)<\/id>/);
          let id = file.replace(/\.csl$/, "");
          if (idMatch) {
            const urlId = idMatch[1];
            const lastSlash = urlId.lastIndexOf("/");
            if (lastSlash !== -1)
              id = urlId.slice(lastSlash + 1);
          }
          const title = titleMatch ? titleMatch[1].trim() : id;
          results.push({ id, title });
        } catch (e) {
        }
      }
    } catch (e) {
      return [];
    }
    results.sort((a, b) => a.title.localeCompare(b.title));
    return results;
  }
  // ════════════════════════════════════════════════════════════════════════════
  // CAYW picker
  // ════════════════════════════════════════════════════════════════════════════
  async openCAYW(onReturn) {
    const rawText = await this.httpGet(
      `http://127.0.0.1:${this.port}/better-bibtex/cayw?format=json`,
      6e5
      // 10 min
    );
    try {
      onReturn == null ? void 0 : onReturn();
    } catch (e) {
    }
    if (!rawText || rawText === "[]" || rawText === "null" || rawText === "{}")
      return [];
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      return [];
    }
    const rawItems = this.extractArray(parsed);
    if (!rawItems.length)
      return [];
    const result = [];
    for (const raw of rawItems) {
      const cayw = this.parseCaywItem(raw);
      if (!cayw)
        continue;
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
  async searchItems(query) {
    var _a;
    if (!query.trim())
      return [];
    try {
      const r = await (0, import_obsidian5.requestUrl)({
        url: `${this.baseUrl}/better-bibtex/json-rpc`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "item.search", params: [query], id: 1 }),
        throw: false
      });
      if (r.status !== 200)
        throw new Error(`HTTP ${r.status}`);
      const d = r.json;
      if (d.error)
        throw new Error(d.error.message);
      return ((_a = d.result) != null ? _a : []).map((i) => this.normalizeAny(i)).filter((i) => !!i.title);
    } catch (err) {
      throw new ZoteroConnectionError(String(err));
    }
  }
  async getCitationKeys(itemKeys) {
    const map = /* @__PURE__ */ new Map();
    if (!itemKeys.length)
      return map;
    try {
      const r = await (0, import_obsidian5.requestUrl)({
        url: `${this.baseUrl}/better-bibtex/json-rpc`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "item.citationkey", params: [itemKeys], id: 2 }),
        throw: false
      });
      if (r.status !== 200)
        return map;
      const d = r.json;
      if (d.error || !d.result || typeof d.result !== "object")
        return map;
      for (const [itemKey, citeKey] of Object.entries(d.result)) {
        if (typeof citeKey === "string" && citeKey.trim())
          map.set(itemKey, citeKey);
      }
    } catch (e) {
    }
    return map;
  }
  async getItemsByKeys(keys, libraryID = 1) {
    const map = /* @__PURE__ */ new Map();
    if (!keys.length)
      return map;
    try {
      const r = await (0, import_obsidian5.requestUrl)({
        url: `${this.baseUrl}/better-bibtex/json-rpc`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "item.export",
          params: [keys, "f4b52ab0-f878-4556-85a0-c7aeedd09dfc", libraryID],
          id: 3
        }),
        throw: false
      });
      if (r.status === 200) {
        const d = r.json;
        if (!(d == null ? void 0 : d.error) && (d == null ? void 0 : d.result)) {
          const items = JSON.parse(d.result);
          for (const it of items) {
            const item = this.normalizeAny(it);
            if (item.key && keys.includes(item.key))
              map.set(item.key, item);
          }
        }
      }
    } catch (e) {
    }
    const missing = keys.filter((k) => !map.has(k));
    if (!missing.length)
      return map;
    try {
      const citeKeyMap = await this.getCitationKeys(missing);
      const citeKeys = [];
      const reverse = /* @__PURE__ */ new Map();
      for (const itemKey of missing) {
        const citeKey = citeKeyMap.get(itemKey);
        if (!citeKey)
          continue;
        citeKeys.push(citeKey);
        reverse.set(citeKey, itemKey);
      }
      if (citeKeys.length) {
        const r = await (0, import_obsidian5.requestUrl)({
          url: `${this.baseUrl}/better-bibtex/json-rpc`,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "item.export",
            params: [citeKeys, "f4b52ab0-f878-4556-85a0-c7aeedd09dfc", libraryID],
            id: 4
          }),
          throw: false
        });
        const d = r.json;
        if (r.status === 200 && !d.error && d.result) {
          const items = JSON.parse(d.result);
          for (const it of items) {
            const item = this.normalizeAny(it);
            const found = item.key ? reverse.get(item.key) : void 0;
            if (found)
              map.set(found, { ...item, key: found });
          }
        }
      }
    } catch (e) {
    }
    const stillMissing = keys.filter((k) => !map.has(k));
    if (!stillMissing.length)
      return map;
    try {
      const dbItems = await this.getItemsFromLocalDB(stillMissing);
      for (const [k, v] of dbItems)
        map.set(k, v);
    } catch (e) {
    }
    return map;
  }
  async getItemsFromLocalDB(keys) {
    const map = /* @__PURE__ */ new Map();
    if (!keys.length)
      return map;
    const sqlite = await this.locateZoteroSQLite();
    if (!sqlite)
      return map;
    const tmpDir = path3.join(os2.tmpdir(), "zotero-citations-db");
    const tmpDb = path3.join(tmpDir, "zotero.sqlite");
    const tmpJournal = path3.join(tmpDir, "zotero.sqlite-journal");
    try {
      fs2.mkdirSync(tmpDir, { recursive: true });
      fs2.copyFileSync(sqlite, tmpDb);
      const journal = `${sqlite}-journal`;
      if (fs2.existsSync(journal))
        fs2.copyFileSync(journal, tmpJournal);
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
      const { execAsync: execAsync2, buildEnv: buildEnv2 } = await Promise.resolve().then(() => (init_ExportManager(), ExportManager_exports));
      const { stdout: fieldsRaw } = await execAsync2(`sqlite3 -json ${this.q(tmpDb)} ${this.q(fieldSql)}`, { timeout: 1e4, env: buildEnv2() });
      const { stdout: creatorsRaw } = await execAsync2(`sqlite3 -json ${this.q(tmpDb)} ${this.q(creatorSql)}`, { timeout: 1e4, env: buildEnv2() });
      const fieldRows = JSON.parse(fieldsRaw || "[]");
      const creatorRows = JSON.parse(creatorsRaw || "[]");
      const grouped = /* @__PURE__ */ new Map();
      for (const row of fieldRows) {
        if (!row.itemKey)
          continue;
        const cur = grouped.get(row.itemKey) || { key: row.itemKey, creators: [], fields: {}, itemType: row.itemType };
        if (row.itemType && !cur.itemType)
          cur.itemType = row.itemType;
        if (row.fieldName && row.value != null)
          cur.fields[row.fieldName] = String(row.value);
        grouped.set(row.itemKey, cur);
      }
      for (const row of creatorRows) {
        if (!row.itemKey)
          continue;
        const cur = grouped.get(row.itemKey) || { key: row.itemKey, creators: [], fields: {}, itemType: void 0 };
        cur.creators.push({
          firstName: row.firstName || "",
          lastName: row.lastName || "",
          creatorType: row.creatorType || "author"
        });
        grouped.set(row.itemKey, cur);
      }
      for (const [key, g] of grouped) {
        const f = g.fields;
        const item = {
          key,
          itemType: g.itemType === "case" ? "legal_case" : g.itemType || "",
          title: f.title || f.caseName || "",
          creators: g.creators,
          date: f.date || f.dateDecided || void 0,
          publicationTitle: f.publicationTitle || void 0,
          bookTitle: f.bookTitle || void 0,
          publisher: f.publisher || void 0,
          place: f.place || void 0,
          volume: f.volume || void 0,
          issue: f.issue || void 0,
          pages: f.pages || void 0,
          edition: f.edition || void 0,
          DOI: f.DOI || void 0,
          URL: f.url || void 0,
          ISBN: f.ISBN || void 0,
          thesisType: f.thesisType || void 0,
          university: f.university || void 0,
          conferenceName: f.conferenceName || void 0,
          authority: f.authority || f.court || void 0,
          court: f.court || f.authority || void 0,
          docketNumber: f.docketNumber || f.number || void 0,
          extra: f.extra || void 0
        };
        if (item.title)
          map.set(key, item);
      }
    } catch (e) {
    }
    return map;
  }
  async locateZoteroSQLite() {
    const home = os2.homedir();
    const candidates = [
      path3.join(home, "Zotero", "zotero.sqlite"),
      path3.join(home, "Library", "Application Support", "Zotero", "zotero.sqlite")
    ];
    for (const p of candidates) {
      try {
        if (fs2.existsSync(p))
          return p;
      } catch (e) {
      }
    }
    return null;
  }
  q(s) {
    return `"${String(s).replace(/(["\\$`\\\\])/g, "\\\\$1")}"`;
  }
  // ── Private helpers ────────────────────────────────────────────────────────
  async fetchFullItem(key, title) {
    var _a, _b;
    try {
      const byKey = await this.getItemsByKeys([key]);
      const item = byKey.get(key);
      if (item == null ? void 0 : item.title)
        return item;
    } catch (e) {
    }
    try {
      const byDb = await this.getItemsFromLocalDB([key]);
      const item = byDb.get(key);
      if (item == null ? void 0 : item.title)
        return item;
    } catch (e) {
    }
    try {
      const results = await this.searchItems(key);
      const match = (_a = results.find((r) => r.key === key)) != null ? _a : results.length ? results[0] : null;
      if (match == null ? void 0 : match.title)
        return match;
    } catch (e) {
    }
    if (title) {
      try {
        const results = await this.searchItems(title);
        const match = (_b = results.find((r) => r.title.toLowerCase() === title.toLowerCase())) != null ? _b : results[0];
        if (match == null ? void 0 : match.title)
          return match;
      } catch (e) {
      }
    }
    return null;
  }
  httpGet(url, timeoutMs = 3e4) {
    return new Promise((resolve, reject) => {
      const req = nodeHttp.get(url, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8").trim()));
        res.on("error", (e) => reject(new ZoteroConnectionError(e.message)));
      });
      req.on("error", (e) => reject(new ZoteroConnectionError(e.message)));
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        resolve("");
      });
    });
  }
  extractArray(data) {
    if (Array.isArray(data))
      return data;
    if (data && typeof data === "object") {
      for (const key of ["items", "citationItems", "citations"]) {
        if (Array.isArray(data[key]))
          return data[key];
      }
    }
    return [];
  }
  parseCaywItem(raw) {
    var _a, _b;
    const locator = raw.locator ? String(raw.locator) : void 0;
    const locatorLabel = raw.label ? String(raw.label) : "page";
    const itemSrc = raw.itemData && typeof raw.itemData === "object" ? raw.itemData : raw.item && typeof raw.item === "object" ? raw.item : raw;
    const preferParentKey = itemSrc.itemType === "attachment" && itemSrc.parentItem ? String(itemSrc.parentItem) : "";
    let key = "";
    if (preferParentKey)
      key = preferParentKey;
    for (const f of ["itemKey", "key", "citationKey", "citekey"]) {
      if (key)
        break;
      const v = (_a = itemSrc[f]) != null ? _a : raw[f];
      if (v && String(v).length >= 2) {
        key = String(v);
        break;
      }
    }
    if (!key) {
      for (const f of ["id"]) {
        const v = (_b = itemSrc[f]) != null ? _b : raw[f];
        if (v && String(v).length >= 2) {
          key = String(v);
          break;
        }
      }
    }
    const item = this.normalizeAny(itemSrc);
    if (key)
      item.key = key;
    if (!item.key)
      return null;
    return { item, locator, locatorLabel };
  }
  /**
   * Unified normalizer that handles BOTH native Zotero AND CSL-JSON formats.
   */
  normalizeAny(r) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V;
    let key = "";
    for (const f of ["itemKey", "key", "citationKey"]) {
      if (r[f]) {
        key = String(r[f]);
        break;
      }
    }
    if (!key && typeof r.id === "string") {
      const m = String(r.id).match(/\/items\/([A-Z0-9]{8})(?:$|[/?#])/i);
      if (m)
        key = m[1];
    }
    for (const f of ["citation-key", "citekey", "id"]) {
      if (key)
        break;
      if (r[f]) {
        key = String(r[f]);
        break;
      }
    }
    const cslTypeMap = {
      "article-journal": "journalArticle",
      "article-magazine": "magazineArticle",
      "article-newspaper": "newspaperArticle",
      "book": "book",
      "chapter": "bookSection",
      "thesis": "thesis",
      "paper-conference": "conferencePaper",
      "webpage": "webpage",
      "report": "report",
      "legal_case": "legal_case"
    };
    const rawType = String((_b = (_a = r.itemType) != null ? _a : r.type) != null ? _b : "");
    const itemType = (_c = cslTypeMap[rawType]) != null ? _c : rawType;
    const title = String((_e = (_d = r.title) != null ? _d : r.caseName) != null ? _e : "");
    const creators = [];
    if (Array.isArray(r.creators) && r.creators.length > 0) {
      for (const c of r.creators) {
        creators.push({
          firstName: String((_g = (_f = c.firstName) != null ? _f : c.given) != null ? _g : ""),
          lastName: String((_i = (_h = c.lastName) != null ? _h : c.family) != null ? _i : ""),
          name: ((_j = c.name) != null ? _j : c.literal) ? String((_k = c.name) != null ? _k : c.literal) : void 0,
          creatorType: String((_l = c.creatorType) != null ? _l : "author")
        });
      }
    } else {
      for (const [field, ctype] of [["author", "author"], ["editor", "editor"]]) {
        if (Array.isArray(r[field])) {
          for (const a of r[field]) {
            creators.push({
              firstName: String((_n = (_m = a.given) != null ? _m : a.firstName) != null ? _n : ""),
              lastName: String((_p = (_o = a.family) != null ? _o : a.lastName) != null ? _p : ""),
              name: ((_q = a.literal) != null ? _q : a.name) ? String((_r = a.literal) != null ? _r : a.name) : void 0,
              creatorType: ctype
            });
          }
        }
      }
    }
    let date;
    if (r.date) {
      const m = String(r.date).match(/\b(\d{4})\b/);
      date = m ? m[1] : String(r.date);
    } else {
      const issued = r.issued;
      const y = (_t = (_s = issued == null ? void 0 : issued["date-parts"]) == null ? void 0 : _s[0]) == null ? void 0 : _t[0];
      if (y)
        date = String(y);
    }
    const publicationTitle = String((_w = (_v = (_u = r.publicationTitle) != null ? _u : r["container-title"]) != null ? _v : r.journalAbbreviation) != null ? _w : "") || void 0;
    const authority = String((_y = (_x = r.authority) != null ? _x : r.court) != null ? _y : "") || void 0;
    return {
      key,
      itemType,
      title,
      creators,
      date,
      publicationTitle,
      bookTitle: String((_A = (_z = r.bookTitle) != null ? _z : r["collection-title"]) != null ? _A : "") || void 0,
      publisher: String((_B = r.publisher) != null ? _B : "") || void 0,
      place: String((_D = (_C = r.place) != null ? _C : r["publisher-place"]) != null ? _D : "") || void 0,
      volume: String((_E = r.volume) != null ? _E : "") || void 0,
      issue: String((_F = r.issue) != null ? _F : "") || void 0,
      pages: String((_H = (_G = r.pages) != null ? _G : r.page) != null ? _H : "") || void 0,
      edition: String((_I = r.edition) != null ? _I : "") || void 0,
      DOI: String((_J = r.DOI) != null ? _J : "") || void 0,
      URL: String((_L = (_K = r.url) != null ? _K : r.URL) != null ? _L : "") || void 0,
      ISBN: String((_M = r.ISBN) != null ? _M : "") || void 0,
      thesisType: String((_N = r.thesisType) != null ? _N : "") || void 0,
      university: String((_P = (_O = r.university) != null ? _O : r.school) != null ? _P : "") || void 0,
      conferenceName: String((_R = (_Q = r.conferenceName) != null ? _Q : r["event-title"]) != null ? _R : "") || void 0,
      authority,
      court: authority,
      docketNumber: ((_S = r.docketNumber) != null ? _S : r.number) ? String((_T = r.docketNumber) != null ? _T : r.number) : void 0,
      extra: ((_U = r.extra) != null ? _U : r.note) ? String((_V = r.extra) != null ? _V : r.note) : void 0
    };
  }
};

// src/modals/PreferencesModal.ts
init_CitationManager();
init_settings();
var PreferencesModal = class extends import_obsidian6.Modal {
  constructor(app, opts) {
    super(app);
    this.allStyles = [];
    this.opts = opts;
    this.selectedStyle = opts.currentStyle;
    this.selectedMode = opts.currentMode;
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zotero-prefs-modal");
    contentEl.createEl("h2", { text: appT(this.app, "prefs.title") });
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
      cls: "clickable-icon"
    });
    refreshBtn.style.fontSize = "0.85em";
    refreshBtn.addEventListener("click", () => this.loadStyles(true));
    this.styleSearchInput = styleWrap.createEl("input", {
      type: "text",
      placeholder: appT(this.app, "prefs.searchStylePlaceholder")
    });
    this.styleSearchInput.style.width = "100%";
    this.styleSearchInput.style.marginBottom = "6px";
    this.styleSearchInput.style.padding = "4px 8px";
    this.styleSearchInput.addEventListener("input", () => this.filterStyles());
    this.styleListEl = styleWrap.createDiv({ cls: "zotero-style-list" });
    this.styleListEl.style.maxHeight = "200px";
    this.styleListEl.style.overflowY = "auto";
    this.styleListEl.style.border = "1px solid var(--background-modifier-border)";
    this.styleListEl.style.borderRadius = "4px";
    this.styleListEl.style.padding = "4px";
    await this.loadStyles(false);
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
    const infoWrap = contentEl.createDiv({ cls: "zotero-prefs-info" });
    infoWrap.style.background = "var(--background-secondary)";
    infoWrap.style.padding = "10px";
    infoWrap.style.borderRadius = "4px";
    infoWrap.style.marginBottom = "16px";
    infoWrap.createEl("span", { text: appT(this.app, "prefs.citationCount") });
    this.citationsFoundEl = infoWrap.createEl("span", { text: "\u2013", cls: "zotero-citation-count" });
    this.citationsFoundEl.style.fontWeight = "600";
    this.updateCitationCount();
    const btnRow = contentEl.createDiv({ cls: "zotero-btn-row" });
    btnRow.style.display = "flex";
    btnRow.style.gap = "8px";
    btnRow.style.justifyContent = "flex-end";
    const cancelBtn = btnRow.createEl("button", { text: appT(this.app, "common.cancel") });
    cancelBtn.addEventListener("click", () => this.close());
    const applyBtn = btnRow.createEl("button", { text: appT(this.app, "prefs.apply"), cls: "mod-cta" });
    applyBtn.addEventListener("click", () => this.applyToDocument(applyBtn));
  }
  async loadStyles(showNotice) {
    const settings = getAppSettings(this.app) || DEFAULT_SETTINGS;
    const fallbackStyles = CSL_STYLES.map((s) => ({
      id: s.id,
      title: getStyleName(s.id, settings)
    }));
    let dynamicStyles = [];
    try {
      dynamicStyles = await this.opts.api.getInstalledStyles();
    } catch (e) {
    }
    if (dynamicStyles.length > 0) {
      const idSet = new Set(dynamicStyles.map((s) => s.id));
      this.allStyles = [
        ...dynamicStyles,
        ...fallbackStyles.filter((s) => !idSet.has(s.id))
      ];
      if (showNotice) {
        new import_obsidian6.Notice(appT(this.app, "prefs.stylesRefreshed", { count: dynamicStyles.length }));
      }
    } else {
      this.allStyles = fallbackStyles;
    }
    this.renderStyleList(this.allStyles);
  }
  filterStyles() {
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
  renderStyleList(styles) {
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
          this.styleSearchInput.value.trim() ? styles : this.allStyles
        );
        this.updateCitationCount();
      });
      item.addEventListener("mouseover", () => {
        if (style.id !== this.selectedStyle)
          item.style.background = "var(--background-modifier-hover)";
      });
      item.addEventListener("mouseout", () => {
        if (style.id !== this.selectedStyle)
          item.style.background = "";
      });
    }
  }
  updateCitationCount() {
    const editor = this.opts.getEditor();
    if (!editor) {
      this.citationsFoundEl.setText(appT(this.app, "prefs.noDocument"));
      return;
    }
    const citations = CitationManager.parseDocumentCitations(editor.getValue());
    this.citationsFoundEl.setText(String(citations.length));
  }
  async applyToDocument(btn) {
    const editor = this.opts.getEditor();
    if (!editor) {
      new import_obsidian6.Notice(appT(this.app, "prefs.noEditor"));
      return;
    }
    const citations = CitationManager.parseDocumentCitations(editor.getValue());
    if (!citations.length) {
      await this.opts.onStyleChange(this.selectedStyle);
      new import_obsidian6.Notice(appT(this.app, "prefs.noCitationsToReformat"));
      this.close();
      return;
    }
    btn.disabled = true;
    btn.setText(appT(this.app, "prefs.fetching"));
    try {
      const uniqueKeys = [...new Set(citations.map((c) => c.key))];
      const itemMap = /* @__PURE__ */ new Map();
      for (const key of uniqueKeys) {
        const cached = this.opts.getItemFromCache(key);
        if (cached) {
          itemMap.set(key, cached);
          continue;
        }
        const item = await this.opts.fetchAndCacheItem(key);
        if (item)
          itemMap.set(key, item);
      }
      const missing = uniqueKeys.filter((k) => !itemMap.has(k));
      if (missing.length) {
        new import_obsidian6.Notice(appT(this.app, "prefs.missingWarning", { count: missing.length }), 6e3);
      }
      btn.setText(appT(this.app, "prefs.updating"));
      await this.opts.onStyleChange(this.selectedStyle);
      await this.opts.onModeChange(this.selectedMode);
      const count = CitationManager.refreshDocument(editor, itemMap, this.selectedStyle, this.selectedMode);
      if (this.opts.refreshEditorExtension)
        this.opts.refreshEditorExtension();
      const modeName = getModeLabel(this.selectedMode, getAppSettings(this.app) || DEFAULT_SETTINGS, "label");
      new import_obsidian6.Notice(appT(this.app, "prefs.updated", {
        count,
        style: getStyleName(this.selectedStyle, getAppSettings(this.app) || DEFAULT_SETTINGS),
        mode: modeName
      }));
      this.close();
    } catch (err) {
      if (err instanceof ZoteroConnectionError) {
        new import_obsidian6.Notice(appT(this.app, "prefs.zoteroUnavailable"), 6e3);
      } else {
        new import_obsidian6.Notice(appT(this.app, "prefs.updateFailed", { error: String(err) }), 6e3);
      }
      btn.disabled = false;
      btn.setText(appT(this.app, "prefs.apply"));
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modals/SearchModal.ts
var import_obsidian7 = require("obsidian");
init_i18n();
init_CitationManager();
init_settings();
var SearchModal = class _SearchModal extends import_obsidian7.Modal {
  constructor(app, opts) {
    super(app);
    this.selectedItem = null;
    this.debounceTimer = null;
    this._pageChangeHandler = () => {
      if (!this.selectedItem)
        return;
      const previewEl = this.contentEl.querySelector(".zotero-preview");
      if (!previewEl)
        return;
      const preview = CitationManager.formatCitation(
        this.selectedItem,
        this.opts.style,
        this.pageInput.value.trim() || void 0
      );
      previewEl.setText(appT(this.app, "search.preview", { preview }));
    };
    this.opts = opts;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zotero-search-modal");
    contentEl.createEl("h2", { text: appT(this.app, "search.title") });
    const styleName = getStyleName(this.opts.style, getAppSettings(this.app) || DEFAULT_SETTINGS);
    contentEl.createEl("p", {
      text: appT(this.app, "search.currentStyle", { style: styleName }),
      cls: "zotero-style-hint"
    });
    const searchWrap = contentEl.createDiv({ cls: "zotero-search-wrap" });
    this.searchInput = searchWrap.createEl("input", {
      type: "text",
      placeholder: appT(this.app, "search.placeholder"),
      cls: "zotero-search-input"
    });
    this.searchInput.style.width = "100%";
    this.searchInput.addEventListener("input", () => this.onSearchInput());
    this.resultsEl = contentEl.createDiv({ cls: "zotero-results" });
    this.resultsEl.style.maxHeight = "300px";
    this.resultsEl.style.overflowY = "auto";
    this.resultsEl.style.margin = "8px 0";
    this.resultsEl.createEl("p", {
      text: appT(this.app, "search.enterQuery"),
      cls: "zotero-results-placeholder"
    });
    const pageWrap = contentEl.createDiv({ cls: "zotero-page-wrap" });
    pageWrap.style.display = "flex";
    pageWrap.style.alignItems = "center";
    pageWrap.style.gap = "8px";
    pageWrap.style.marginTop = "8px";
    pageWrap.createEl("label", { text: appT(this.app, "search.pageLabel") });
    this.pageInput = pageWrap.createEl("input", {
      type: "text",
      placeholder: appT(this.app, "search.pagePlaceholder"),
      cls: "zotero-page-input"
    });
    this.pageInput.style.flex = "1";
    if (this.opts.existingPage)
      this.pageInput.value = this.opts.existingPage;
    const btnRow = contentEl.createDiv({ cls: "zotero-btn-row" });
    btnRow.style.display = "flex";
    btnRow.style.justifyContent = "flex-end";
    btnRow.style.gap = "8px";
    btnRow.style.marginTop = "12px";
    const cancelBtn = btnRow.createEl("button", { text: appT(this.app, "common.cancel") });
    cancelBtn.addEventListener("click", () => this.close());
    this.confirmBtn = btnRow.createEl("button", { text: appT(this.app, "search.confirm"), cls: "mod-cta" });
    this.confirmBtn.disabled = true;
    this.confirmBtn.addEventListener("click", () => this.confirm());
    this.contentEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !this.confirmBtn.disabled)
        this.confirm();
      if (e.key === "Escape")
        this.close();
    });
    setTimeout(() => this.searchInput.focus(), 50);
  }
  onSearchInput() {
    if (this.debounceTimer)
      clearTimeout(this.debounceTimer);
    const q = this.searchInput.value.trim();
    if (!q) {
      this.resultsEl.empty();
      this.resultsEl.createEl("p", { text: appT(this.app, "search.enterQuery"), cls: "zotero-results-placeholder" });
      return;
    }
    this.debounceTimer = setTimeout(() => this.doSearch(q), 300);
  }
  async doSearch(query) {
    this.resultsEl.empty();
    const spinner = this.resultsEl.createEl("p", { text: appT(this.app, "search.searching"), cls: "zotero-spinner" });
    try {
      const items = await this.opts.api.searchItems(query);
      spinner.remove();
      if (!items.length) {
        this.resultsEl.createEl("p", { text: appT(this.app, "search.noResults"), cls: "zotero-results-placeholder" });
        return;
      }
      for (const item of items.slice(0, 50)) {
        this.renderResultItem(item);
      }
    } catch (err) {
      spinner.remove();
      if (err instanceof ZoteroConnectionError) {
        this.resultsEl.createEl("p", { text: appT(this.app, "search.connectionError"), cls: "zotero-error" });
      } else {
        this.resultsEl.createEl("p", { text: appT(this.app, "search.failed", { error: String(err) }), cls: "zotero-error" });
      }
    }
  }
  renderResultItem(item) {
    const row = this.resultsEl.createDiv({ cls: "zotero-result-row" });
    row.style.padding = "6px 8px";
    row.style.cursor = "pointer";
    row.style.borderRadius = "4px";
    const authors = item.creators.filter((c) => c.creatorType === "author").slice(0, 2).map((c) => {
      var _a, _b;
      return (_b = (_a = c.lastName) != null ? _a : c.name) != null ? _b : "";
    }).filter(Boolean).join(", ");
    const year = CitationManager.getYear(item);
    const typeLabel = _SearchModal.typeLabel(item.itemType, getAppSettings(this.app) || DEFAULT_SETTINGS);
    const titleDiv = row.createEl("div", { text: item.title, cls: "zotero-result-title" });
    titleDiv.style.fontWeight = "500";
    const metaDiv = row.createEl("div", {
      text: `${authors}${authors ? " \xB7 " : ""}${year} \xB7 ${typeLabel}`,
      cls: "zotero-result-meta"
    });
    metaDiv.style.color = "var(--text-muted)";
    row.addEventListener("click", () => this.selectItem(item, row));
    row.addEventListener("mouseover", () => {
      row.style.background = "var(--background-modifier-hover)";
    });
    row.addEventListener("mouseout", () => {
      var _a;
      if (((_a = this.selectedItem) == null ? void 0 : _a.key) !== item.key) {
        row.style.background = "";
      }
    });
  }
  selectItem(item, rowEl) {
    this.resultsEl.querySelectorAll(".zotero-result-row").forEach((el) => {
      el.style.background = "";
    });
    rowEl.style.background = "var(--background-modifier-active-hover)";
    this.selectedItem = item;
    this.confirmBtn.disabled = false;
    const preview = CitationManager.formatCitation(
      item,
      this.opts.style,
      this.pageInput.value.trim() || void 0
    );
    let previewEl = this.contentEl.querySelector(".zotero-preview");
    if (!previewEl) {
      previewEl = this.contentEl.createDiv({ cls: "zotero-preview" });
      previewEl.style.background = "var(--background-secondary)";
      previewEl.style.padding = "6px 10px";
      previewEl.style.borderRadius = "4px";
      previewEl.style.marginTop = "8px";
      previewEl.style.fontStyle = "italic";
    }
    previewEl.setText(appT(this.app, "search.preview", { preview }));
    const btnRow = this.contentEl.querySelector(".zotero-btn-row");
    if (btnRow)
      this.contentEl.insertBefore(previewEl, btnRow);
    this.pageInput.removeEventListener("input", this._pageChangeHandler);
    this.pageInput.addEventListener("input", this._pageChangeHandler);
  }
  confirm() {
    if (!this.selectedItem)
      return;
    this.opts.onConfirm(this.selectedItem, this.pageInput.value.trim());
    this.close();
  }
  onClose() {
    this.contentEl.empty();
    if (this.debounceTimer)
      clearTimeout(this.debounceTimer);
  }
  static typeLabel(itemType, settings = DEFAULT_SETTINGS) {
    const label = getItemTypeLabel(itemType, settings);
    return label === `itemType.${itemType}` ? itemType : label;
  }
};

// src/main.ts
init_settings();
var ZOTERO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="10" y="10" width="80" height="80" rx="10" fill="currentColor" opacity="0.12"/>
  <text x="50" y="70" font-size="58" text-anchor="middle" font-family="serif" fill="currentColor" font-weight="bold">Z</text>
</svg>`;
var ZOTERO_CITE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 8h5v5H7z"/>
  <path d="M12 8h5v5h-5z"/>
  <path d="M9.5 13v3a2 2 0 0 1-2 2H6"/>
  <path d="M16.5 13v3a2 2 0 0 1-2 2H13"/>
</svg>`;
var ZOTERO_WORD_DISPLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 18h8"/>
  <path d="M9 18V7.5l-2 1.7"/>
  <path d="M15.5 9.5l1.7-3.5"/>
  <path d="M19 9.5l-1.7-3.5"/>
  <path d="M16 7h2.5"/>
</svg>`;
var ZOTERO_STYLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 18h6"/>
  <path d="M4 12h10"/>
  <path d="M4 6h14"/>
  <path d="m16 17 2-10 2 10"/>
  <path d="M15.2 13h5.6"/>
</svg>`;
var ZOTERO_EXPORT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
  <path d="M14 3v5h5"/>
  <path d="M12 11v6"/>
  <path d="m9.5 14.5 2.5 2.5 2.5-2.5"/>
</svg>`;
var ZOTERO_REFRESH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 6v5h-5"/>
  <path d="M4 18v-5h5"/>
  <path d="M18.2 10A7 7 0 0 0 6 7.2L4 9"/>
  <path d="M5.8 14A7 7 0 0 0 18 16.8l2-1.8"/>
</svg>`;
var ZOTERO_UNLINK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 14 5 19"/>
  <path d="m14 10 5-5"/>
  <path d="m8.5 8.5 7 7"/>
  <path d="M7 14H5a3 3 0 0 1 0-6h3"/>
  <path d="M16 10h3a3 3 0 0 1 0 6h-3"/>
</svg>`;
var ZoteroCitations = class extends obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.itemCache = /* @__PURE__ */ new Map();
    // Reference to the registered editor extension so we can refresh it
    this.editorExtension = null;
    this.ribbonIconEl = null;
    this.titlebarActions = /* @__PURE__ */ new WeakMap();
    this.styleEl = null;
    this.focusBurstTimer = null;
    this.focusBurstStopTimer = null;
    this.focusBurstTopmostResetTimer = null;
  }
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
      getSourcePath: () => {
        var _a, _b;
        return (_b = (_a = this.app.workspace.getActiveFile()) == null ? void 0 : _a.path) != null ? _b : "";
      }
    });
    this.registerEditorExtension(this.editorExtension);
    this.registerMarkdownPostProcessor((el) => this.decorateRenderedFootnotes(el));
    const commandLabels = this.getCommandLabels();
    this.addCommand({
      id: "insert-edit-citation",
      name: commandLabels["insert-edit-citation"],
      editorCallback: (editor) => this.insertOrEditCitation(editor)
    });
    this.addCommand({
      id: "toggle-word-display",
      name: commandLabels["toggle-word-display"],
      callback: () => this.toggleWordDisplay()
    });
    this.addCommand({
      id: "toggle-toolbar",
      name: commandLabels["toggle-toolbar"],
      callback: () => this.toggleToolbar()
    });
    this.addCommand({
      id: "insert-bibliography",
      name: commandLabels["insert-bibliography"],
      editorCallback: async (editor) => this.insertBibliography(editor)
    });
    this.addCommand({
      id: "refresh-citations",
      name: commandLabels["refresh-citations"],
      editorCallback: async (editor) => this.refreshAll(editor)
    });
    this.addCommand({
      id: "export-to-word",
      name: commandLabels["export-to-word"],
      callback: () => this.exportToWord()
    });
    this.addCommand({
      id: "unlink-citations",
      name: commandLabels["unlink-citations"],
      editorCallback: (editor) => this.unlinkCitations(editor)
    });
    this.addCommand({
      id: "document-preferences",
      name: commandLabels["document-preferences"],
      callback: () => this.openPreferences()
    });
    this.addCommand({
      id: "check-pandoc",
      name: commandLabels["check-pandoc"],
      callback: () => ExportManager.verifyAndNotify(this.settings)
    });
    this.addSettingTab(new ZoteroSettingTab(this.app, this));
    this.injectStyles();
    this.applyLanguage();
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.refreshToolbars()));
    this.registerEvent(this.app.workspace.on("layout-change", () => this.refreshToolbars()));
    window.setTimeout(() => this.refreshToolbars(), 100);
  }
  onunload() {
    var _a;
    if (this.focusBurstTimer)
      window.clearInterval(this.focusBurstTimer);
    if (this.focusBurstStopTimer)
      window.clearTimeout(this.focusBurstStopTimer);
    if (this.focusBurstTopmostResetTimer)
      window.clearTimeout(this.focusBurstTopmostResetTimer);
    this.focusBurstTimer = null;
    this.focusBurstStopTimer = null;
    this.focusBurstTopmostResetTimer = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof obsidian.MarkdownView) {
        this.clearToolbar(leaf.view);
      }
    });
    (_a = this.styleEl) == null ? void 0 : _a.remove();
    this.styleEl = null;
  }
  // ══ Settings ══════════════════════════════════════════════════════════════
  async loadSettings() {
    var _a, _b;
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, (_a = data == null ? void 0 : data.settings) != null ? _a : {});
    this.settings.toolbarButtons = Object.assign({}, DEFAULT_SETTINGS.toolbarButtons, this.settings.toolbarButtons);
    this.itemCache = new Map(Object.entries((_b = data == null ? void 0 : data.itemCache) != null ? _b : {}));
  }
  async saveSettings() {
    await this.saveData({
      settings: this.settings,
      itemCache: Object.fromEntries(this.itemCache)
    });
  }
  t(key, vars) {
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
      "check-pandoc": prefix + this.t("command.checkPandoc")
    };
  }
  syncCommandLabels() {
    var _a, _b;
    const labels = this.getCommandLabels();
    const commands = (_b = (_a = this.app.commands) == null ? void 0 : _a.commands) != null ? _b : {};
    for (const [id, name] of Object.entries(labels)) {
      const fullId = `${this.manifest.id}:${id}`;
      if (commands[fullId])
        commands[fullId].name = name;
    }
  }
  syncRibbonLabel() {
    if (!this.ribbonIconEl)
      return;
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
    this.app.workspace.updateOptions();
    this.refreshMarkdownPreviews();
    this.refreshToolbars();
  }
  refreshMarkdownPreviews() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      var _a;
      if (leaf.view instanceof obsidian.MarkdownView) {
        (_a = leaf.view.previewMode) == null ? void 0 : _a.rerender(true);
      }
    });
  }
  // ══ Item cache ════════════════════════════════════════════════════════════
  cacheItem(item) {
    this.itemCache.set(item.key, item);
    void this.saveSettings();
  }
  getCached(key) {
    return this.itemCache.get(key);
  }
  async fetchAndCache(key) {
    var _a;
    try {
      const map = await this.api.getItemsByKeys([key]);
      const item = (_a = map.get(key)) != null ? _a : null;
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
  getEditor() {
    var _a, _b;
    return (_b = (_a = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView)) == null ? void 0 : _a.editor) != null ? _b : null;
  }
  getInputFilePath() {
    var _a, _b;
    const file = this.app.workspace.getActiveFile();
    if (!file)
      return null;
    const base = (_b = (_a = this.app.vault.adapter).getBasePath) == null ? void 0 : _b.call(_a);
    return base ? `${base}/${file.path}` : file.path;
  }
  captureEditorSelection(editor) {
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    return { from, to };
  }
  getEditorForInsertion(fallbackEditor, sourcePath) {
    var _a;
    const activeView = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
    const activeEditor = activeView == null ? void 0 : activeView.editor;
    const activePath = (_a = this.app.workspace.getActiveFile()) == null ? void 0 : _a.path;
    if (activeEditor && (!sourcePath || activePath === sourcePath))
      return activeEditor;
    return fallbackEditor;
  }
  restoreEditorSelection(editor, snapshot) {
    if (!snapshot)
      return;
    try {
      editor.setSelection(snapshot.from, snapshot.to);
    } catch (_e) {
      try {
        editor.setCursor(snapshot.to);
      } catch (_e2) {
      }
    }
  }
  refocusObsidianWindow(editor) {
    var _a, _b;
    const focusEditor = () => {
      var _a2, _b2, _c;
      try {
        (_a2 = editor == null ? void 0 : editor.focus) == null ? void 0 : _a2.call(editor);
      } catch (_e) {
      }
      try {
        (_c = (_b2 = editor == null ? void 0 : editor.cm) == null ? void 0 : _b2.focus) == null ? void 0 : _c.call(_b2);
      } catch (_e) {
      }
    };
    const attempt = () => {
      var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      try {
        const remote = require("@electron/remote");
        const win2 = (_a2 = remote == null ? void 0 : remote.getCurrentWindow) == null ? void 0 : _a2.call(remote);
        const appName = (_c = (_b2 = remote == null ? void 0 : remote.app) == null ? void 0 : _b2.getName) == null ? void 0 : _c.call(_b2);
        try {
          if ((_d = win2 == null ? void 0 : win2.isMinimized) == null ? void 0 : _d.call(win2))
            (_e = win2.restore) == null ? void 0 : _e.call(win2);
        } catch (_e2) {
        }
        try {
          (_f = win2 == null ? void 0 : win2.show) == null ? void 0 : _f.call(win2);
        } catch (_e2) {
        }
        try {
          (_g = win2 == null ? void 0 : win2.focus) == null ? void 0 : _g.call(win2);
        } catch (_e2) {
        }
        try {
          (_h = win2 == null ? void 0 : win2.moveTop) == null ? void 0 : _h.call(win2);
        } catch (_e2) {
        }
        try {
          (_j = (_i = remote == null ? void 0 : remote.app) == null ? void 0 : _i.focus) == null ? void 0 : _j.call(_i, { steal: true });
        } catch (_e2) {
          try {
            (_l = (_k = remote == null ? void 0 : remote.app) == null ? void 0 : _k.focus) == null ? void 0 : _l.call(_k);
          } catch (_e22) {
          }
        }
        try {
          if (process.platform === "darwin") {
            const { execFile } = require("child_process");
            execFile(
              "osascript",
              ["-e", `tell application "${String(appName || "Obsidian").replace(/"/g, '\\"')}" to activate`],
              () => {
              }
            );
          }
        } catch (_e2) {
        }
      } catch (_e2) {
        try {
          const electron = require("electron");
          const win2 = (_n = (_m = electron.remote) == null ? void 0 : _m.getCurrentWindow) == null ? void 0 : _n.call(_m);
          try {
            if ((_o = win2 == null ? void 0 : win2.isMinimized) == null ? void 0 : _o.call(win2))
              (_p = win2.restore) == null ? void 0 : _p.call(win2);
          } catch (_e22) {
          }
          try {
            (_q = win2 == null ? void 0 : win2.focus) == null ? void 0 : _q.call(win2);
          } catch (_e22) {
          }
        } catch (_e22) {
        }
      }
      try {
        window.focus();
      } catch (_e2) {
      }
      try {
        this.app.commands.executeCommandById("editor:focus");
      } catch (_e2) {
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
    let win = null;
    try {
      const remote = require("@electron/remote");
      win = (_a = remote == null ? void 0 : remote.getCurrentWindow) == null ? void 0 : _a.call(remote);
      try {
        (_b = win == null ? void 0 : win.setAlwaysOnTop) == null ? void 0 : _b.call(win, true);
      } catch (_e) {
      }
    } catch (_e) {
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
      var _a2;
      try {
        (_a2 = win == null ? void 0 : win.setAlwaysOnTop) == null ? void 0 : _a2.call(win, false);
      } catch (_e) {
      }
      this.focusBurstTopmostResetTimer = null;
    }, 1400);
  }
  // ── Insert / Edit citation (uses Zotero native CAYW picker) ──────────────
  async insertOrEditCitation(editor) {
    var _a;
    const content = editor.getValue();
    const pos = editor.posToOffset(editor.getCursor());
    const existingInline = CitationManager.isInsideInline(content, pos);
    const existingEndnote = CitationManager.isInsideEndnoteRef(content, pos);
    const sourcePath = ((_a = this.app.workspace.getActiveFile()) == null ? void 0 : _a.path) || null;
    const selectionSnapshot = this.captureEditorSelection(editor);
    const notice = new obsidian.Notice(this.t("notice.openPicker"), 0);
    let items;
    try {
      items = await this.api.openCAYW(() => this.refocusObsidianWindow(this.getEditorForInsertion(editor, sourcePath)));
    } catch (err) {
      notice.hide();
      this.refocusObsidianWindow(this.getEditorForInsertion(editor, sourcePath));
      if (err instanceof ZoteroConnectionError) {
        new obsidian.Notice(this.t("notice.connectZoteroFailed"), 6e3);
      } else if (err instanceof ZoteroPickerError) {
        new obsidian.Notice(this.t("notice.nativePickerFallback"), 5e3);
        this.openSearchFallback(
          editor,
          existingInline == null ? void 0 : existingInline.page,
          existingEndnote == null ? void 0 : existingEndnote.page,
          existingInline,
          existingEndnote
        );
      } else {
        new obsidian.Notice(this.t("notice.pickerError", { error: String(err) }), 6e3);
      }
      return;
    }
    notice.hide();
    const targetEditor = this.getEditorForInsertion(editor, sourcePath);
    if (!items.length) {
      this.refocusObsidianWindow(targetEditor);
      return;
    }
    for (const ci of items)
      this.cacheItem(ci.item);
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
      this.settings.showWordStyleFootnotes ? this.t("notice.wordDisplayOn") : this.t("notice.wordDisplayOff")
    );
  }
  // ── Insert bibliography ───────────────────────────────────────────────────
  async insertBibliography(editor) {
    const content = editor.getValue();
    const all = CitationManager.parseAllCitations(content);
    if (!all.length) {
      new obsidian.Notice(this.t("notice.noManagedCitations"));
      return;
    }
    const keys = [...new Set(all.map((c) => c.key))];
    const itemMap = await this.resolveItems(keys);
    if (!itemMap)
      return;
    const bib = CitationManager.generateBibliography(
      content,
      itemMap,
      this.settings.cslStyle,
      this.t("bibliography.heading")
    );
    if (!bib) {
      new obsidian.Notice(this.t("notice.noBibliography"));
      return;
    }
    CitationManager.insertOrReplaceBibliography(editor, bib);
    new obsidian.Notice(this.t("notice.bibliographyUpdated"));
  }
  // ── Refresh all ───────────────────────────────────────────────────────────
  async refreshAll(editor) {
    var _a;
    const removedOrphans = CitationManager.removeUnreferencedEndnotes(editor);
    const content = editor.getValue();
    const all = CitationManager.parseAllCitations(content);
    if (!all.length) {
      const removedBib = CitationManager.removeManagedBibliography(editor);
      if (removedOrphans || removedBib) {
        new obsidian.Notice(
          this.t("notice.cleanedOrphans", {
            count: removedOrphans,
            extra: removedBib ? this.t("notice.cleanedOrphans.extraBib") : ""
          })
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
      for (const [k, v] of fetched)
        this.cacheItem(v.key ? v : { ...v, key: k });
      const itemMap = /* @__PURE__ */ new Map();
      for (const key of keys) {
        const item = (_a = fetched.get(key)) != null ? _a : this.getCached(key);
        if (item)
          itemMap.set(key, item);
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
          existingHeading || this.t("bibliography.heading")
        );
        CitationManager.insertOrReplaceBibliography(editor, bib);
      }
      const extra = removedOrphans ? this.t("notice.refreshed.extraOrphans", { count: removedOrphans }) : "";
      new obsidian.Notice(this.t("notice.refreshed", { count, extra }));
    } catch (err) {
      notice.hide();
      if (err instanceof ZoteroConnectionError) {
        new obsidian.Notice(this.t("notice.zoteroUnavailable"), 5e3);
      } else {
        new obsidian.Notice(this.t("notice.refreshFailed", { error: String(err) }), 5e3);
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
      if (chosen === null)
        return;
      if (chosen) {
        await this.doExport(inputPath, chosen);
      } else {
        new ExportModal(this.app, suggested, async (outputPath) => {
          await this.doExport(inputPath, outputPath);
        }).open();
      }
    }
  }
  async doExport(inputPath, outputPath) {
    const notice = new obsidian.Notice(this.t("notice.exporting"), 0);
    try {
      await ExportManager.exportToWord(inputPath, outputPath, this.settings);
      notice.hide();
      new obsidian.Notice(this.t("notice.exportSuccess", { path: outputPath }), 8e3);
    } catch (err) {
      notice.hide();
      new obsidian.Notice(String(err), 1e4);
    }
  }
  // ── Unlink citations ──────────────────────────────────────────────────────
  unlinkCitations(editor) {
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
      "zotero-unlink-modal"
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
      fetchAndCacheItem: (k) => this.fetchAndCache(k)
    }).open();
  }
  openSearchFallback(editor, existingInlinePage, existingEndnotePage, existingInline = CitationManager.isInsideInline(
    editor.getValue(),
    editor.posToOffset(editor.getCursor())
  ), existingEndnote = CitationManager.isInsideEndnoteRef(
    editor.getValue(),
    editor.posToOffset(editor.getCursor())
  )) {
    const existingPage = existingInlinePage || existingEndnotePage;
    new SearchModal(this.app, {
      api: this.api,
      style: this.settings.cslStyle,
      existingPage: this.toEditableLocator(existingPage),
      onConfirm: (item, page) => {
        this.cacheItem(item);
        this.applySelectedCitations(
          editor,
          [{ item, locator: page || void 0, locatorLabel: "page" }],
          existingInline,
          existingEndnote
        );
      }
    }).open();
  }
  applySelectedCitations(editor, items, existingInline = CitationManager.isInsideInline(
    editor.getValue(),
    editor.posToOffset(editor.getCursor())
  ), existingEndnote = CitationManager.isInsideEndnoteRef(
    editor.getValue(),
    editor.posToOffset(editor.getCursor())
  )) {
    const style = this.settings.cslStyle;
    const mode = this.settings.citationMode;
    if (items.length === 1) {
      const ci = items[0];
      const page = formatLocator(ci.locator, ci.locatorLabel) || void 0;
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
      const page = formatLocator(ci.locator, ci.locatorLabel) || void 0;
      if (mode === "inline") {
        CitationManager.insertInline(editor, ci.item, style, page);
      } else {
        CitationManager.insertEndnote(editor, ci.item, style, page);
      }
    }
    new obsidian.Notice(this.t("notice.insertedCitations", { count: items.length }));
  }
  // ── Shared helper ─────────────────────────────────────────────────────────
  async resolveItems(keys) {
    const map = /* @__PURE__ */ new Map();
    const missing = [];
    for (const k of keys) {
      const c = this.getCached(k);
      if (c)
        map.set(k, c);
      else
        missing.push(k);
    }
    if (missing.length) {
      const n = new obsidian.Notice(this.t("notice.fetchingItems", { count: missing.length }), 0);
      try {
        for (const k of missing) {
          const item = await this.fetchAndCache(k);
          if (item)
            map.set(k, item);
        }
      } catch (err) {
        n.hide();
        if (err instanceof ZoteroConnectionError) {
          new obsidian.Notice(this.t("notice.zoteroUnavailable"), 5e3);
        } else {
          new obsidian.Notice(this.t("notice.fetchItemsFailed", { error: String(err) }), 5e3);
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
        this.syncToolbar(leaf.view);
      }
    });
  }
  toggleToolbar() {
    this.settings.showToolbar = !this.settings.showToolbar;
    void this.saveSettings();
    this.refreshToolbars();
    new obsidian.Notice(this.settings.showToolbar ? this.t("notice.toolbarShown") : this.t("notice.toolbarHidden"));
  }
  syncToolbar(view) {
    this.clearToolbar(view);
    if (!this.settings.showToolbar)
      return;
    const btns = this.settings.toolbarButtons || {};
    const actionEls = [];
    const action = (icon, title, cb, active = false) => {
      const el = view.addAction(icon, title, (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        cb();
      });
      el.classList.add("zotero-titlebar-action");
      if (active)
        el.classList.add("is-active");
      actionEls.push(el);
    };
    if (btns.export !== false)
      action("zotero-export", this.t("toolbar.export"), () => this.exportToWord());
    if (btns.unlink !== false)
      action("zotero-unlink", this.t("toolbar.unlink"), () => {
        const ed = view.editor;
        if (ed)
          this.unlinkCitations(ed);
      });
    if (btns.changeStyle !== false)
      action("zotero-style", this.t("toolbar.changeStyle"), () => this.openPreferences());
    if (btns.refresh !== false)
      action("zotero-refresh", this.t("toolbar.refresh"), () => {
        const ed = view.editor;
        if (ed)
          this.refreshAll(ed);
      });
    if (btns.wordDisplay !== false) {
      action(
        "zotero-word-display",
        this.t("toolbar.wordDisplay"),
        () => this.toggleWordDisplay(),
        this.settings.showWordStyleFootnotes
      );
    }
    if (btns.insertCitation !== false)
      action("zotero-cite", this.t("toolbar.insertCitation"), () => {
        const ed = view.editor;
        if (ed)
          this.insertOrEditCitation(ed);
      });
    this.titlebarActions.set(view, actionEls);
  }
  clearToolbar(view) {
    view.contentEl.querySelectorAll(".zotero-toolbar").forEach((el) => el.remove());
    const actionEls = this.titlebarActions.get(view);
    if (!actionEls)
      return;
    for (const el of actionEls)
      el.remove();
    this.titlebarActions.delete(view);
  }
  decorateRenderedFootnotes(root) {
    if (!this.settings.showWordStyleFootnotes)
      return;
    const refs = root.querySelectorAll("a.footnote-ref, a[data-footnote-ref]");
    refs.forEach((refEl) => {
      var _a;
      const ref = refEl;
      const marker = this.getRenderedFootnoteMarker(ref);
      if (marker)
        ref.textContent = marker;
      ref.classList.add("zotero-rendered-footnote-ref");
      (_a = ref.parentElement) == null ? void 0 : _a.classList.add("zotero-rendered-footnote-sup");
      const tooltip = this.getRenderedFootnoteTooltip(ref, root);
      ref.removeAttribute("title");
      if (!tooltip)
        return;
      ref.removeAttribute("aria-label");
    });
  }
  getRenderedFootnoteMarker(ref) {
    var _a, _b, _c, _d, _e, _f;
    const text = (_b = (_a = ref.textContent) == null ? void 0 : _a.trim()) != null ? _b : "";
    const fromText = (_c = text.match(/\d+/)) == null ? void 0 : _c[0];
    if (fromText)
      return fromText;
    const href = (_d = ref.getAttribute("href")) != null ? _d : "";
    return (_f = (_e = href.match(/\d+/)) == null ? void 0 : _e[0]) != null ? _f : text.replace(/^\[|\]$/g, "");
  }
  getRenderedFootnoteTooltip(ref, root) {
    var _a, _b, _c;
    const href = ref.getAttribute("href");
    if (!(href == null ? void 0 : href.startsWith("#")))
      return "";
    const targetId = decodeURIComponent(href.slice(1));
    const noteEl = (_b = this.findById(root, targetId)) != null ? _b : (_a = ref.ownerDocument) == null ? void 0 : _a.getElementById(targetId);
    if (!noteEl)
      return "";
    const cloned = noteEl.cloneNode(true);
    cloned.querySelectorAll('a.footnote-backref, a[data-footnote-backref], a[href^="#fnref"]').forEach((el) => el.remove());
    return this.normalizeFootnoteText((_c = cloned.textContent) != null ? _c : "");
  }
  findById(root, id) {
    if (!id)
      return null;
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return root.querySelector(`#${CSS.escape(id)}`);
    }
    return root.querySelector(`[id="${id.replace(/"/g, '\\"')}"]`);
  }
  normalizeFootnoteText(text) {
    return text.replace(/\s+/g, " ").trim();
  }
  toEditableLocator(locator) {
    if (!locator)
      return locator;
    return locator.replace(/^(p\.|para\.|sec\.|ch\.|fig\.|table|v\.|l\.|n\.|col\.|no\.|vol\.)\s+/i, "");
  }
  // ── CSS ───────────────────────────────────────────────────────────────────
  injectStyles() {
    var _a;
    (_a = this.styleEl) == null ? void 0 : _a.remove();
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
};
var ConfirmModal = class extends obsidian.Modal {
  constructor(app, title, msg, cb, cls) {
    super(app);
    this.title = title;
    this.msg = msg;
    this.cb = cb;
    this.cls = cls;
  }
  onOpen() {
    if (this.cls)
      this.contentEl.addClass(this.cls);
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
};
