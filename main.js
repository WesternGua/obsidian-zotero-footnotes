var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/jszip/dist/jszip.min.js
var require_jszip_min = __commonJS({
  "node_modules/jszip/dist/jszip.min.js"(exports, module2) {
    !function(e) {
      if ("object" == typeof exports && "undefined" != typeof module2) module2.exports = e();
      else if ("function" == typeof define && define.amd) define([], e);
      else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
      }
    }(function() {
      return function s(a, o, h) {
        function u(r, e2) {
          if (!o[r]) {
            if (!a[r]) {
              var t = "function" == typeof require && require;
              if (!e2 && t) return t(r, true);
              if (l) return l(r, true);
              var n = new Error("Cannot find module '" + r + "'");
              throw n.code = "MODULE_NOT_FOUND", n;
            }
            var i = o[r] = { exports: {} };
            a[r][0].call(i.exports, function(e3) {
              var t2 = a[r][1][e3];
              return u(t2 || e3);
            }, i, i.exports, s, a, o, h);
          }
          return o[r].exports;
        }
        for (var l = "function" == typeof require && require, e = 0; e < h.length; e++) u(h[e]);
        return u;
      }({ 1: [function(e, t, r) {
        "use strict";
        var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        r.encode = function(e2) {
          for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
          return h.join("");
        }, r.decode = function(e2) {
          var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
          if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
          var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
          if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
          for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
          return l;
        };
      }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
        "use strict";
        var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
        function o(e2, t2, r2, n2, i2) {
          this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
        }
        o.prototype = { getContentWorker: function() {
          var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
          return e2.on("end", function() {
            if (this.streamInfo.data_length !== t2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
          }), e2;
        }, getCompressedWorker: function() {
          return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        } }, o.createWorkerFrom = function(e2, t2, r2) {
          return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
        }, t.exports = o;
      }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
        "use strict";
        var n = e("./stream/GenericWorker");
        r.STORE = { magic: "\0\0", compressWorker: function() {
          return new n("STORE compression");
        }, uncompressWorker: function() {
          return new n("STORE decompression");
        } }, r.DEFLATE = e("./flate");
      }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
        "use strict";
        var n = e("./utils");
        var o = function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        }();
        t.exports = function(e2, t2) {
          return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
            return -1 ^ e3;
          }(0 | t2, e2, e2.length, 0) : function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
            return -1 ^ e3;
          }(0 | t2, e2, e2.length, 0) : 0;
        };
      }, { "./utils": 32 }], 5: [function(e, t, r) {
        "use strict";
        r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
      }, {}], 6: [function(e, t, r) {
        "use strict";
        var n = null;
        n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
      }, { lie: 37 }], 7: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
        function h(e2, t2) {
          a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
        }
        r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
          this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
        }, h.prototype.flush = function() {
          a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
        }, h.prototype.cleanUp = function() {
          a.prototype.cleanUp.call(this), this._pako = null;
        }, h.prototype._createPako = function() {
          this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
          var t2 = this;
          this._pako.onData = function(e2) {
            t2.push({ data: e2, meta: t2.meta });
          };
        }, r.compressWorker = function(e2) {
          return new h("Deflate", e2);
        }, r.uncompressWorker = function() {
          return new h("Inflate", {});
        };
      }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
        "use strict";
        function A(e2, t2) {
          var r2, n2 = "";
          for (r2 = 0; r2 < t2; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
          return n2;
        }
        function n(e2, t2, r2, n2, i2, s2) {
          var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
          t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
          var S = 0;
          t2 && (S |= 8), l || !_ && !g || (S |= 2048);
          var z = 0, C = 0;
          w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= function(e3, t3) {
            var r3 = e3;
            return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
          }(h.unixPermissions, w)) : (C = 20, z |= function(e3) {
            return 63 & (e3 || 0);
          }(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
          var E = "";
          return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
        }
        var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
        function s(e2, t2, r2, n2) {
          i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
        }
        I.inherits(s, i), s.prototype.push = function(e2) {
          var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
          this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
        }, s.prototype.openedSource = function(e2) {
          this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
          var t2 = this.streamFiles && !e2.file.dir;
          if (t2) {
            var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({ data: r2.fileRecord, meta: { percent: 0 } });
          } else this.accumulate = true;
        }, s.prototype.closedSource = function(e2) {
          this.accumulate = false;
          var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          if (this.dirRecords.push(r2.dirRecord), t2) this.push({ data: function(e3) {
            return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
          }(e2), meta: { percent: 100 } });
          else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
          this.currentFile = null;
        }, s.prototype.flush = function() {
          for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++) this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
          var r2 = this.bytesWritten - e2, n2 = function(e3, t3, r3, n3, i2) {
            var s2 = I.transformTo("string", i2(n3));
            return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
          }(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
          this.push({ data: n2, meta: { percent: 100 } });
        }, s.prototype.prepareNextSource = function() {
          this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
        }, s.prototype.registerPrevious = function(e2) {
          this._sources.push(e2);
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
        }, s.prototype.error = function(e2) {
          var t2 = this._sources;
          if (!i.prototype.error.call(this, e2)) return false;
          for (var r2 = 0; r2 < t2.length; r2++) try {
            t2[r2].error(e2);
          } catch (e3) {
          }
          return true;
        }, s.prototype.lock = function() {
          i.prototype.lock.call(this);
          for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++) e2[t2].lock();
        }, t.exports = s;
      }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
        "use strict";
        var u = e("../compressions"), n = e("./ZipFileWorker");
        r.generateWorker = function(e2, a, t2) {
          var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
          try {
            e2.forEach(function(e3, t3) {
              h++;
              var r2 = function(e4, t4) {
                var r3 = e4 || t4, n3 = u[r3];
                if (!n3) throw new Error(r3 + " is not a valid compression method !");
                return n3;
              }(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
              t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
            }), o.entriesCount = h;
          } catch (e3) {
            o.error(e3);
          }
          return o;
        };
      }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
        "use strict";
        function n() {
          if (!(this instanceof n)) return new n();
          if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
          this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
            var e2 = new n();
            for (var t2 in this) "function" != typeof this[t2] && (e2[t2] = this[t2]);
            return e2;
          };
        }
        (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
          return new n().loadAsync(e2, t2);
        }, n.external = e("./external"), t.exports = n;
      }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
        "use strict";
        var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
        function f(n2) {
          return new i.Promise(function(e2, t2) {
            var r2 = n2.decompressed.getContentWorker().pipe(new a());
            r2.on("error", function(e3) {
              t2(e3);
            }).on("end", function() {
              r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
            }).resume();
          });
        }
        t.exports = function(e2, o) {
          var h = this;
          return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
            var t2 = new s(o);
            return t2.load(e3), t2;
          }).then(function(e3) {
            var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
            if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t2.push(f(r2[n2]));
            return i.Promise.all(t2);
          }).then(function(e3) {
            for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
              var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
              h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
            }
            return t2.zipComment.length && (h.comment = t2.zipComment), h;
          });
        };
      }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../stream/GenericWorker");
        function s(e2, t2) {
          i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
        }
        n.inherits(s, i), s.prototype._bindStream = function(e2) {
          var t2 = this;
          (this._stream = e2).pause(), e2.on("data", function(e3) {
            t2.push({ data: e3, meta: { percent: 0 } });
          }).on("error", function(e3) {
            t2.isPaused ? this.generatedError = e3 : t2.error(e3);
          }).on("end", function() {
            t2.isPaused ? t2._upstreamEnded = true : t2.end();
          });
        }, s.prototype.pause = function() {
          return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
        }, t.exports = s;
      }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
        "use strict";
        var i = e("readable-stream").Readable;
        function n(e2, t2, r2) {
          i.call(this, t2), this._helper = e2;
          var n2 = this;
          e2.on("data", function(e3, t3) {
            n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
          }).on("error", function(e3) {
            n2.emit("error", e3);
          }).on("end", function() {
            n2.push(null);
          });
        }
        e("../utils").inherits(n, i), n.prototype._read = function() {
          this._helper.resume();
        }, t.exports = n;
      }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
        "use strict";
        t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
          if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t2);
          if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
          return new Buffer(e2, t2);
        }, allocBuffer: function(e2) {
          if (Buffer.alloc) return Buffer.alloc(e2);
          var t2 = new Buffer(e2);
          return t2.fill(0), t2;
        }, isBuffer: function(e2) {
          return Buffer.isBuffer(e2);
        }, isStream: function(e2) {
          return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
        } };
      }, {}], 15: [function(e, t, r) {
        "use strict";
        function s(e2, t2, r2) {
          var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
          s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
          var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
          r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
          var o2 = null;
          o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
          var h2 = new d(e2, o2, s2);
          this.files[e2] = h2;
        }
        var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
          "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
          var t2 = e2.lastIndexOf("/");
          return 0 < t2 ? e2.substring(0, t2) : "";
        }, g = function(e2) {
          return "/" !== e2.slice(-1) && (e2 += "/"), e2;
        }, b = function(e2, t2) {
          return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
        };
        function h(e2) {
          return "[object RegExp]" === Object.prototype.toString.call(e2);
        }
        var n = { load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, forEach: function(e2) {
          var t2, r2, n2;
          for (t2 in this.files) n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
        }, filter: function(r2) {
          var n2 = [];
          return this.forEach(function(e2, t2) {
            r2(e2, t2) && n2.push(t2);
          }), n2;
        }, file: function(e2, t2, r2) {
          if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
          if (h(e2)) {
            var n2 = e2;
            return this.filter(function(e3, t3) {
              return !t3.dir && n2.test(e3);
            });
          }
          var i2 = this.files[this.root + e2];
          return i2 && !i2.dir ? i2 : null;
        }, folder: function(r2) {
          if (!r2) return this;
          if (h(r2)) return this.filter(function(e3, t3) {
            return t3.dir && r2.test(e3);
          });
          var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
          return n2.root = t2.name, n2;
        }, remove: function(r2) {
          r2 = this.root + r2;
          var e2 = this.files[r2];
          if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
          else for (var t2 = this.filter(function(e3, t3) {
            return t3.name.slice(0, r2.length) === r2;
          }), n2 = 0; n2 < t2.length; n2++) delete this.files[t2[n2].name];
          return this;
        }, generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, generateInternalStream: function(e2) {
          var t2, r2 = {};
          try {
            if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
            u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
            var n2 = r2.comment || this.comment || "";
            t2 = o.generateWorker(this, r2, n2);
          } catch (e3) {
            (t2 = new l("error")).error(e3);
          }
          return new a(t2, r2.type || "string", r2.mimeType);
        }, generateAsync: function(e2, t2) {
          return this.generateInternalStream(e2).accumulate(t2);
        }, generateNodeStream: function(e2, t2) {
          return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
        } };
        t.exports = n;
      }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
        "use strict";
        t.exports = e("stream");
      }, { stream: void 0 }], 17: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
          for (var t2 = 0; t2 < this.data.length; t2++) e2[t2] = 255 & e2[t2];
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data[this.zero + e2];
        }, i.prototype.lastIndexOfSignature = function(e2) {
          for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
          return -1;
        }, i.prototype.readAndCheckSignature = function(e2) {
          var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
          return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
        }, i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return [];
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
        "use strict";
        var n = e("../utils");
        function i(e2) {
          this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
        }
        i.prototype = { checkOffset: function(e2) {
          this.checkIndex(this.index + e2);
        }, checkIndex: function(e2) {
          if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
        }, setIndex: function(e2) {
          this.checkIndex(e2), this.index = e2;
        }, skip: function(e2) {
          this.setIndex(this.index + e2);
        }, byteAt: function() {
        }, readInt: function(e2) {
          var t2, r2 = 0;
          for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--) r2 = (r2 << 8) + this.byteAt(t2);
          return this.index += e2, r2;
        }, readString: function(e2) {
          return n.transformTo("string", this.readData(e2));
        }, readData: function() {
        }, lastIndexOfSignature: function() {
        }, readAndCheckSignature: function() {
        }, readDate: function() {
          var e2 = this.readInt(4);
          return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
        } }, t.exports = i;
      }, { "../utils": 32 }], 19: [function(e, t, r) {
        "use strict";
        var n = e("./Uint8ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data.charCodeAt(this.zero + e2);
        }, i.prototype.lastIndexOfSignature = function(e2) {
          return this.data.lastIndexOf(e2) - this.zero;
        }, i.prototype.readAndCheckSignature = function(e2) {
          return e2 === this.readData(4);
        }, i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
        "use strict";
        var n = e("./ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
          var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
        t.exports = function(e2) {
          var t2 = n.getTypeOf(e2);
          return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
        };
      }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
        "use strict";
        r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
      }, {}], 24: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../utils");
        function s(e2) {
          n.call(this, "ConvertWorker to " + e2), this.destType = e2;
        }
        i.inherits(s, n), s.prototype.processChunk = function(e2) {
          this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../crc32");
        function s() {
          n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
        }
        e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
          this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
        }, t.exports = s;
      }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
        }
        n.inherits(s, i), s.prototype.processChunk = function(e2) {
          if (e2) {
            var t2 = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = t2 + e2.data.length;
          }
          i.prototype.processChunk.call(this, e2);
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataWorker");
          var t2 = this;
          this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
            t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
          }, function(e3) {
            t2.error(e3);
          });
        }
        n.inherits(s, i), s.prototype.cleanUp = function() {
          i.prototype.cleanUp.call(this), this.data = null;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
        }, s.prototype._tickAndRepeat = function() {
          this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
        }, s.prototype._tick = function() {
          if (this.isPaused || this.isFinished) return false;
          var e2 = null, t2 = Math.min(this.max, this.index + 16384);
          if (this.index >= this.max) return this.end();
          switch (this.type) {
            case "string":
              e2 = this.data.substring(this.index, t2);
              break;
            case "uint8array":
              e2 = this.data.subarray(this.index, t2);
              break;
            case "array":
            case "nodebuffer":
              e2 = this.data.slice(this.index, t2);
          }
          return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
        "use strict";
        function n(e2) {
          this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
        }
        n.prototype = { push: function(e2) {
          this.emit("data", e2);
        }, end: function() {
          if (this.isFinished) return false;
          this.flush();
          try {
            this.emit("end"), this.cleanUp(), this.isFinished = true;
          } catch (e2) {
            this.emit("error", e2);
          }
          return true;
        }, error: function(e2) {
          return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
        }, on: function(e2, t2) {
          return this._listeners[e2].push(t2), this;
        }, cleanUp: function() {
          this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
        }, emit: function(e2, t2) {
          if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t2);
        }, pipe: function(e2) {
          return e2.registerPrevious(this);
        }, registerPrevious: function(e2) {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, pause: function() {
          return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
        }, resume: function() {
          if (!this.isPaused || this.isFinished) return false;
          var e2 = this.isPaused = false;
          return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
        }, flush: function() {
        }, processChunk: function(e2) {
          this.push(e2);
        }, withStreamInfo: function(e2, t2) {
          return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
        }, mergeStreamInfo: function() {
          for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
        }, lock: function() {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.isLocked = true, this.previous && this.previous.lock();
        }, toString: function() {
          var e2 = "Worker " + this.name;
          return this.previous ? this.previous + " -> " + e2 : e2;
        } }, t.exports = n;
      }, {}], 29: [function(e, t, r) {
        "use strict";
        var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
        if (n.nodestream) try {
          o = e("../nodejs/NodejsStreamOutputAdapter");
        } catch (e2) {
        }
        function l(e2, o2) {
          return new a.Promise(function(t2, r2) {
            var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
            e2.on("data", function(e3, t3) {
              n2.push(e3), o2 && o2(t3);
            }).on("error", function(e3) {
              n2 = [], r2(e3);
            }).on("end", function() {
              try {
                var e3 = function(e4, t3, r3) {
                  switch (e4) {
                    case "blob":
                      return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                    case "base64":
                      return u.encode(t3);
                    default:
                      return h.transformTo(e4, t3);
                  }
                }(s2, function(e4, t3) {
                  var r3, n3 = 0, i3 = null, s3 = 0;
                  for (r3 = 0; r3 < t3.length; r3++) s3 += t3[r3].length;
                  switch (e4) {
                    case "string":
                      return t3.join("");
                    case "array":
                      return Array.prototype.concat.apply([], t3);
                    case "uint8array":
                      for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++) i3.set(t3[r3], n3), n3 += t3[r3].length;
                      return i3;
                    case "nodebuffer":
                      return Buffer.concat(t3);
                    default:
                      throw new Error("concat : unsupported type '" + e4 + "'");
                  }
                }(i2, n2), a2);
                t2(e3);
              } catch (e4) {
                r2(e4);
              }
              n2 = [];
            }).resume();
          });
        }
        function f(e2, t2, r2) {
          var n2 = t2;
          switch (t2) {
            case "blob":
            case "arraybuffer":
              n2 = "uint8array";
              break;
            case "base64":
              n2 = "string";
          }
          try {
            this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
          } catch (e3) {
            this._worker = new s("error"), this._worker.error(e3);
          }
        }
        f.prototype = { accumulate: function(e2) {
          return l(this, e2);
        }, on: function(e2, t2) {
          var r2 = this;
          return "data" === e2 ? this._worker.on(e2, function(e3) {
            t2.call(r2, e3.data, e3.meta);
          }) : this._worker.on(e2, function() {
            h.delay(t2, arguments, r2);
          }), this;
        }, resume: function() {
          return h.delay(this._worker.resume, [], this._worker), this;
        }, pause: function() {
          return this._worker.pause(), this;
        }, toNodejsStream: function(e2) {
          if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
          return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
        } }, t.exports = f;
      }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
        "use strict";
        if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
        else {
          var n = new ArrayBuffer(0);
          try {
            r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
          } catch (e2) {
            try {
              var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
            } catch (e3) {
              r.blob = false;
            }
          }
        }
        try {
          r.nodestream = !!e("readable-stream").Readable;
        } catch (e2) {
          r.nodestream = false;
        }
      }, { "readable-stream": 16 }], 31: [function(e, t, s) {
        "use strict";
        for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
        u[254] = u[254] = 1;
        function a() {
          n.call(this, "utf-8 decode"), this.leftOver = null;
        }
        function l() {
          n.call(this, "utf-8 encode");
        }
        s.utf8encode = function(e2) {
          return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : function(e3) {
            var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
            for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
            for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
            return t2;
          }(e2);
        }, s.utf8decode = function(e2) {
          return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : function(e3) {
            var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
            for (t2 = r2 = 0; t2 < s2; ) if ((n2 = e3[t2++]) < 128) a2[r2++] = n2;
            else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t2 += i2 - 1;
            else {
              for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; ) n2 = n2 << 6 | 63 & e3[t2++], i2--;
              1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
            }
            return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
          }(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
        }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
          var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
          if (this.leftOver && this.leftOver.length) {
            if (h.uint8array) {
              var r2 = t2;
              (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
            } else t2 = this.leftOver.concat(t2);
            this.leftOver = null;
          }
          var n2 = function(e3, t3) {
            var r3;
            for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
            return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
          }(t2), i2 = t2;
          n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
        }, a.prototype.flush = function() {
          this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
        }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
          this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
        }, s.Utf8EncodeWorker = l;
      }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
        "use strict";
        var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
        function n(e2) {
          return e2;
        }
        function l(e2, t2) {
          for (var r2 = 0; r2 < e2.length; ++r2) t2[r2] = 255 & e2.charCodeAt(r2);
          return t2;
        }
        e("setimmediate"), a.newBlob = function(t2, r2) {
          a.checkSupport("blob");
          try {
            return new Blob([t2], { type: r2 });
          } catch (e2) {
            try {
              var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              return n2.append(t2), n2.getBlob(r2);
            } catch (e3) {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        var i = { stringifyByChunk: function(e2, t2, r2) {
          var n2 = [], i2 = 0, s2 = e2.length;
          if (s2 <= r2) return String.fromCharCode.apply(null, e2);
          for (; i2 < s2; ) "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
          return n2.join("");
        }, stringifyByChar: function(e2) {
          for (var t2 = "", r2 = 0; r2 < e2.length; r2++) t2 += String.fromCharCode(e2[r2]);
          return t2;
        }, applyCanBeUsed: { uint8array: function() {
          try {
            return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
          } catch (e2) {
            return false;
          }
        }(), nodebuffer: function() {
          try {
            return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
          } catch (e2) {
            return false;
          }
        }() } };
        function s(e2) {
          var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
          if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t2; ) try {
            return i.stringifyByChunk(e2, r2, t2);
          } catch (e3) {
            t2 = Math.floor(t2 / 2);
          }
          return i.stringifyByChar(e2);
        }
        function f(e2, t2) {
          for (var r2 = 0; r2 < e2.length; r2++) t2[r2] = e2[r2];
          return t2;
        }
        a.applyFromCharCode = s;
        var c = {};
        c.string = { string: n, array: function(e2) {
          return l(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.string.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return l(e2, new Uint8Array(e2.length));
        }, nodebuffer: function(e2) {
          return l(e2, r.allocBuffer(e2.length));
        } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
          return new Uint8Array(e2).buffer;
        }, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.arraybuffer = { string: function(e2) {
          return s(new Uint8Array(e2));
        }, array: function(e2) {
          return f(new Uint8Array(e2), new Array(e2.byteLength));
        }, arraybuffer: n, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(new Uint8Array(e2));
        } }, c.uint8array = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return e2.buffer;
        }, uint8array: n, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.nodebuffer = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.nodebuffer.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return f(e2, new Uint8Array(e2.length));
        }, nodebuffer: n }, a.transformTo = function(e2, t2) {
          if (t2 = t2 || "", !e2) return t2;
          a.checkSupport(e2);
          var r2 = a.getTypeOf(t2);
          return c[r2][e2](t2);
        }, a.resolve = function(e2) {
          for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
            var i2 = t2[n2];
            "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
          }
          return r2.join("/");
        }, a.getTypeOf = function(e2) {
          return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
        }, a.checkSupport = function(e2) {
          if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
        }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
          var t2, r2, n2 = "";
          for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
          return n2;
        }, a.delay = function(e2, t2, r2) {
          setImmediate(function() {
            e2.apply(r2 || null, t2 || []);
          });
        }, a.inherits = function(e2, t2) {
          function r2() {
          }
          r2.prototype = t2.prototype, e2.prototype = new r2();
        }, a.extend = function() {
          var e2, t2, r2 = {};
          for (e2 = 0; e2 < arguments.length; e2++) for (t2 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
          return r2;
        }, a.prepareContent = function(r2, e2, n2, i2, s2) {
          return u.Promise.resolve(e2).then(function(n3) {
            return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
              var e3 = new FileReader();
              e3.onload = function(e4) {
                t2(e4.target.result);
              }, e3.onerror = function(e4) {
                r3(e4.target.error);
              }, e3.readAsArrayBuffer(n3);
            }) : n3;
          }).then(function(e3) {
            var t2 = a.getTypeOf(e3);
            return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = function(e4) {
              return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
            }(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
          });
        };
      }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
        function h(e2) {
          this.files = [], this.loadOptions = e2;
        }
        h.prototype = { checkSignature: function(e2) {
          if (!this.reader.readAndCheckSignature(e2)) {
            this.reader.index -= 4;
            var t2 = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
          }
        }, isSignature: function(e2, t2) {
          var r2 = this.reader.index;
          this.reader.setIndex(e2);
          var n2 = this.reader.readString(4) === t2;
          return this.reader.setIndex(r2), n2;
        }, readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
          var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
          this.zipComment = this.loadOptions.decodeFileName(r2);
        }, readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
          for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
        }, readBlockZip64EndOfCentralLocator: function() {
          if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
        }, readLocalFiles: function() {
          var e2, t2;
          for (e2 = 0; e2 < this.files.length; e2++) t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
        }, readCentralDir: function() {
          var e2;
          for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
          if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }, readEndOfCentral: function() {
          var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
          if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
          this.reader.setIndex(e2);
          var t2 = e2;
          if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
            if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
          }
          var r2 = this.centralDirOffset + this.centralDirSize;
          this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
          var n2 = t2 - r2;
          if (0 < n2) this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
          else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
        }, prepareReader: function(e2) {
          this.reader = n(e2);
        }, load: function(e2) {
          this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
        } }, t.exports = h;
      }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
        function l(e2, t2) {
          this.options = e2, this.loadOptions = t2;
        }
        l.prototype = { isEncrypted: function() {
          return 1 == (1 & this.bitFlag);
        }, useUTF8: function() {
          return 2048 == (2048 & this.bitFlag);
        }, readLocalPart: function(e2) {
          var t2, r2;
          if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          if (null === (t2 = function(e3) {
            for (var t3 in h) if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3) return h[t3];
            return null;
          }(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
          this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
        }, readCentralPart: function(e2) {
          this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
          var t2 = e2.readInt(2);
          if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
          e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
        }, processAttributes: function() {
          this.unixPermissions = null, this.dosPermissions = null;
          var e2 = this.versionMadeBy >> 8;
          this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
        }, parseZIP64ExtraField: function() {
          if (this.extraFields[1]) {
            var e2 = n(this.extraFields[1].value);
            this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
          }
        }, readExtraFields: function(e2) {
          var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
          for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
          e2.setIndex(i2);
        }, handleUTF8: function() {
          var e2 = u.uint8array ? "uint8array" : "array";
          if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
          else {
            var t2 = this.findExtraFieldUnicodePath();
            if (null !== t2) this.fileNameStr = t2;
            else {
              var r2 = s.transformTo(e2, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(r2);
            }
            var n2 = this.findExtraFieldUnicodeComment();
            if (null !== n2) this.fileCommentStr = n2;
            else {
              var i2 = s.transformTo(e2, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(i2);
            }
          }
        }, findExtraFieldUnicodePath: function() {
          var e2 = this.extraFields[28789];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        }, findExtraFieldUnicodeComment: function() {
          var e2 = this.extraFields[25461];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        } }, t.exports = l;
      }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
        "use strict";
        function n(e2, t2, r2) {
          this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
        }
        var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
        n.prototype = { internalStream: function(e2) {
          var t2 = null, r2 = "string";
          try {
            if (!e2) throw new Error("No output type specified.");
            var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
            "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
            var i2 = !this._dataBinary;
            i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
          } catch (e3) {
            (t2 = new h("error")).error(e3);
          }
          return new s(t2, r2, "");
        }, async: function(e2, t2) {
          return this.internalStream(e2).accumulate(t2);
        }, nodeStream: function(e2, t2) {
          return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
        }, _compressWorker: function(e2, t2) {
          if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
          var r2 = this._decompressWorker();
          return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
        }, _decompressWorker: function() {
          return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
        } };
        for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
        t.exports = n;
      }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
        (function(t2) {
          "use strict";
          var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
          if (e2) {
            var i = 0, s = new e2(u), a = t2.document.createTextNode("");
            s.observe(a, { characterData: true }), r = function() {
              a.data = i = ++i % 2;
            };
          } else if (t2.setImmediate || void 0 === t2.MessageChannel) r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
            var e3 = t2.document.createElement("script");
            e3.onreadystatechange = function() {
              u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
            }, t2.document.documentElement.appendChild(e3);
          } : function() {
            setTimeout(u, 0);
          };
          else {
            var o = new t2.MessageChannel();
            o.port1.onmessage = u, r = function() {
              o.port2.postMessage(0);
            };
          }
          var h = [];
          function u() {
            var e3, t3;
            n = true;
            for (var r2 = h.length; r2; ) {
              for (t3 = h, h = [], e3 = -1; ++e3 < r2; ) t3[e3]();
              r2 = h.length;
            }
            n = false;
          }
          l.exports = function(e3) {
            1 !== h.push(e3) || n || r();
          };
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}], 37: [function(e, t, r) {
        "use strict";
        var i = e("immediate");
        function u() {
        }
        var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
        function o(e2) {
          if ("function" != typeof e2) throw new TypeError("resolver must be a function");
          this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
        }
        function h(e2, t2, r2) {
          this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
        }
        function f(t2, r2, n2) {
          i(function() {
            var e2;
            try {
              e2 = r2(n2);
            } catch (e3) {
              return l.reject(t2, e3);
            }
            e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
          });
        }
        function c(e2) {
          var t2 = e2 && e2.then;
          if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2) return function() {
            t2.apply(e2, arguments);
          };
        }
        function d(t2, e2) {
          var r2 = false;
          function n2(e3) {
            r2 || (r2 = true, l.reject(t2, e3));
          }
          function i2(e3) {
            r2 || (r2 = true, l.resolve(t2, e3));
          }
          var s2 = p(function() {
            e2(i2, n2);
          });
          "error" === s2.status && n2(s2.value);
        }
        function p(e2, t2) {
          var r2 = {};
          try {
            r2.value = e2(t2), r2.status = "success";
          } catch (e3) {
            r2.status = "error", r2.value = e3;
          }
          return r2;
        }
        (t.exports = o).prototype.finally = function(t2) {
          if ("function" != typeof t2) return this;
          var r2 = this.constructor;
          return this.then(function(e2) {
            return r2.resolve(t2()).then(function() {
              return e2;
            });
          }, function(e2) {
            return r2.resolve(t2()).then(function() {
              throw e2;
            });
          });
        }, o.prototype.catch = function(e2) {
          return this.then(null, e2);
        }, o.prototype.then = function(e2, t2) {
          if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s) return this;
          var r2 = new this.constructor(u);
          this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
          return r2;
        }, h.prototype.callFulfilled = function(e2) {
          l.resolve(this.promise, e2);
        }, h.prototype.otherCallFulfilled = function(e2) {
          f(this.promise, this.onFulfilled, e2);
        }, h.prototype.callRejected = function(e2) {
          l.reject(this.promise, e2);
        }, h.prototype.otherCallRejected = function(e2) {
          f(this.promise, this.onRejected, e2);
        }, l.resolve = function(e2, t2) {
          var r2 = p(c, t2);
          if ("error" === r2.status) return l.reject(e2, r2.value);
          var n2 = r2.value;
          if (n2) d(e2, n2);
          else {
            e2.state = a, e2.outcome = t2;
            for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t2);
          }
          return e2;
        }, l.reject = function(e2, t2) {
          e2.state = s, e2.outcome = t2;
          for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t2);
          return e2;
        }, o.resolve = function(e2) {
          if (e2 instanceof this) return e2;
          return l.resolve(new this(u), e2);
        }, o.reject = function(e2) {
          var t2 = new this(u);
          return l.reject(t2, e2);
        }, o.all = function(e2) {
          var r2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var n2 = e2.length, i2 = false;
          if (!n2) return this.resolve([]);
          var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
          for (; ++t2 < n2; ) h2(e2[t2], t2);
          return o2;
          function h2(e3, t3) {
            r2.resolve(e3).then(function(e4) {
              s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
            }, function(e4) {
              i2 || (i2 = true, l.reject(o2, e4));
            });
          }
        }, o.race = function(e2) {
          var t2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var r2 = e2.length, n2 = false;
          if (!r2) return this.resolve([]);
          var i2 = -1, s2 = new this(u);
          for (; ++i2 < r2; ) a2 = e2[i2], t2.resolve(a2).then(function(e3) {
            n2 || (n2 = true, l.resolve(s2, e3));
          }, function(e3) {
            n2 || (n2 = true, l.reject(s2, e3));
          });
          var a2;
          return s2;
        };
      }, { immediate: 36 }], 38: [function(e, t, r) {
        "use strict";
        var n = {};
        (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
      }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
        "use strict";
        var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
        function p(e2) {
          if (!(this instanceof p)) return new p(e2);
          this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
          var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
          if (r2 !== l) throw new Error(i[r2]);
          if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
            var n2;
            if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
            this._dict_set = true;
          }
        }
        function n(e2, t2) {
          var r2 = new p(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
          return r2.result;
        }
        p.prototype.push = function(e2, t2) {
          var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
          do {
            if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
            0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
          } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
          return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
        }, p.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, p.prototype.onEnd = function(e2) {
          e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, n(e2, t2);
        }, r.gzip = function(e2, t2) {
          return (t2 = t2 || {}).gzip = true, n(e2, t2);
        };
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
        "use strict";
        var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
        function a(e2) {
          if (!(this instanceof a)) return new a(e2);
          this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
          var r2 = c.inflateInit2(this.strm, t2.windowBits);
          if (r2 !== m.Z_OK) throw new Error(n[r2]);
          this.header = new s(), c.inflateGetHeader(this.strm, this.header);
        }
        function o(e2, t2) {
          var r2 = new a(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
          return r2.result;
        }
        a.prototype.push = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
          do {
            if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
            h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
          } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
          return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
        }, a.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, a.prototype.onEnd = function(e2) {
          e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, o(e2, t2);
        }, r.ungzip = o;
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
        r.assign = function(e2) {
          for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
            var r2 = t2.shift();
            if (r2) {
              if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
              for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
            }
          }
          return e2;
        }, r.shrinkBuf = function(e2, t2) {
          return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
        };
        var i = { arraySet: function(e2, t2, r2, n2, i2) {
          if (t2.subarray && e2.subarray) e2.set(t2.subarray(r2, r2 + n2), i2);
          else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          var t2, r2, n2, i2, s2, a;
          for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++) n2 += e2[t2].length;
          for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++) s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
          return a;
        } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
          for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          return [].concat.apply([], e2);
        } };
        r.setTyped = function(e2) {
          e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
        }, r.setTyped(n);
      }, {}], 42: [function(e, t, r) {
        "use strict";
        var h = e("./common"), i = true, s = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (e2) {
          i = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (e2) {
          s = false;
        }
        for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
        function l(e2, t2) {
          if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
          for (var r2 = "", n2 = 0; n2 < t2; n2++) r2 += String.fromCharCode(e2[n2]);
          return r2;
        }
        u[254] = u[254] = 1, r.string2buf = function(e2) {
          var t2, r2, n2, i2, s2, a = e2.length, o = 0;
          for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
          for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
          return t2;
        }, r.buf2binstring = function(e2) {
          return l(e2, e2.length);
        }, r.binstring2buf = function(e2) {
          for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++) t2[r2] = e2.charCodeAt(r2);
          return t2;
        }, r.buf2string = function(e2, t2) {
          var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
          for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
          else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
          else {
            for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
            1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
          }
          return l(o, n2);
        }, r.utf8border = function(e2, t2) {
          var r2;
          for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
          return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
        };
      }, { "./common": 41 }], 43: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2, r2, n) {
          for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
            for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; ) ;
            i %= 65521, s %= 65521;
          }
          return i | s << 16 | 0;
        };
      }, {}], 44: [function(e, t, r) {
        "use strict";
        t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
      }, {}], 45: [function(e, t, r) {
        "use strict";
        var o = function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        }();
        t.exports = function(e2, t2, r2, n) {
          var i = o, s = n + r2;
          e2 ^= -1;
          for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
          return -1 ^ e2;
        };
      }, {}], 46: [function(e, t, r) {
        "use strict";
        var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
        function R(e2, t2) {
          return e2.msg = n[t2], t2;
        }
        function T(e2) {
          return (e2 << 1) - (4 < e2 ? 9 : 0);
        }
        function D(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        function F(e2) {
          var t2 = e2.state, r2 = t2.pending;
          r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
        }
        function N(e2, t2) {
          u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = t2;
        }
        function P(e2, t2) {
          e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
        }
        function L(e2, t2) {
          var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
          e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
          do {
            if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
              s2 += 2, r2++;
              do {
              } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
              if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                if (e2.match_start = t2, o2 <= (a2 = n2)) break;
                d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
              }
            }
          } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
          return a2 <= e2.lookahead ? a2 : e2.lookahead;
        }
        function j(e2) {
          var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
          do {
            if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
              for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              i2 += f2;
            }
            if (0 === e2.strm.avail_in) break;
            if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
          } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
        }
        function Z(e2, t2) {
          for (var r2, n2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
              for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
              e2.strstart++;
            } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
            else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
            if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function W(e2, t2) {
          for (var r2, n2, i2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
              for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
              if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            } else if (e2.match_available) {
              if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
            } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
          }
          return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function M(e2, t2, r2, n2, i2) {
          this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
        }
        function H() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        function G(e2) {
          var t2;
          return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
        }
        function K(e2) {
          var t2 = G(e2);
          return t2 === m && function(e3) {
            e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
          }(e2.state), t2;
        }
        function Y(e2, t2, r2, n2, i2, s2) {
          if (!e2) return _;
          var a2 = 1;
          if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2) return R(e2, _);
          8 === n2 && (n2 = 9);
          var o2 = new H();
          return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
        }
        h = [new M(0, 0, 0, 0, function(e2, t2) {
          var r2 = 65535;
          for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
            if (e2.lookahead <= 1) {
              if (j(e2), 0 === e2.lookahead && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            e2.strstart += e2.lookahead, e2.lookahead = 0;
            var n2 = e2.block_start + r2;
            if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
            if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
        }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
          return Y(e2, t2, v, 15, 8, 0);
        }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
          return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
        }, r.deflate = function(e2, t2) {
          var r2, n2, i2, s2;
          if (!e2 || !e2.state || 5 < t2 || t2 < 0) return e2 ? R(e2, _) : _;
          if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
          if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
          else {
            var a2 = v + (n2.w_bits - 8 << 4) << 8;
            a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
          }
          if (69 === n2.status) if (n2.gzhead.extra) {
            for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
          } else n2.status = 73;
          if (73 === n2.status) if (n2.gzhead.name) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
          } else n2.status = 91;
          if (91 === n2.status) if (n2.gzhead.comment) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
          } else n2.status = 103;
          if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
            if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
          } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f) return R(e2, -5);
          if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
          if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
            var o2 = 2 === n2.strategy ? function(e3, t3) {
              for (var r3; ; ) {
                if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                  if (t3 === l) return A;
                  break;
                }
                if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            }(n2, t2) : 3 === n2.strategy ? function(e3, t3) {
              for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                if (e3.lookahead <= S) {
                  if (j(e3), e3.lookahead <= S && t3 === l) return A;
                  if (0 === e3.lookahead) break;
                }
                if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                  s3 = e3.strstart + S;
                  do {
                  } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                  e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                }
                if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            }(n2, t2) : h[n2.level].func(n2, t2);
            if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
            if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
          }
          return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
        }, r.deflateEnd = function(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
        }, r.deflateSetDictionary = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
          if (!e2 || !e2.state) return _;
          if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
          for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
            for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
            r2.strstart = n2, r2.lookahead = x - 1, j(r2);
          }
          return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
        }, r.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
        };
      }, {}], 48: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2) {
          var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
          r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
          e: do {
            p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
            t: for (; ; ) {
              if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
              else {
                if (!(16 & y)) {
                  if (0 == (64 & y)) {
                    v = m[(65535 & v) + (d & (1 << y) - 1)];
                    continue t;
                  }
                  if (32 & y) {
                    r2.mode = 12;
                    break e;
                  }
                  e2.msg = "invalid literal/length code", r2.mode = 30;
                  break e;
                }
                w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                r: for (; ; ) {
                  if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                    if (0 == (64 & y)) {
                      v = _[(65535 & v) + (d & (1 << y) - 1)];
                      continue r;
                    }
                    e2.msg = "invalid distance code", r2.mode = 30;
                    break e;
                  }
                  if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break e;
                  }
                  if (d >>>= y, p -= y, (y = s - a) < k) {
                    if (l < (y = k - y) && r2.sane) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break e;
                    }
                    if (S = c, (x = 0) === f) {
                      if (x += u - y, y < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        x = s - k, S = C;
                      }
                    } else if (f < y) {
                      if (x += u + f - y, (y -= f) < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        if (x = 0, f < w) {
                          for (w -= y = f; C[s++] = c[x++], --y; ) ;
                          x = s - k, S = C;
                        }
                      }
                    } else if (x += f - y, y < w) {
                      for (w -= y; C[s++] = c[x++], --y; ) ;
                      x = s - k, S = C;
                    }
                    for (; 2 < w; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                    w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                  } else {
                    for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                    w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                  }
                  break;
                }
              }
              break;
            }
          } while (n < i && s < o);
          n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
        };
      }, {}], 49: [function(e, t, r) {
        "use strict";
        var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
        function L(e2) {
          return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
        }
        function s() {
          this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        function a(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
        }
        function o(e2) {
          var t2;
          return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
        }
        function h(e2, t2) {
          var r2, n2;
          return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
        }
        function u(e2, t2) {
          var r2, n2;
          return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
        }
        var l, f, c = true;
        function j(e2) {
          if (c) {
            var t2;
            for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; ) e2.lens[t2++] = 8;
            for (; t2 < 256; ) e2.lens[t2++] = 9;
            for (; t2 < 280; ) e2.lens[t2++] = 7;
            for (; t2 < 288; ) e2.lens[t2++] = 8;
            for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
            T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
          }
          e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
        }
        function Z(e2, t2, r2, n2) {
          var i2, s2 = e2.state;
          return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
        }
        r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
          return u(e2, 15);
        }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
          12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
          e: for (; ; ) switch (r2.mode) {
            case P:
              if (0 === r2.wrap) {
                r2.mode = 13;
                break;
              }
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (2 & r2.wrap && 35615 === u2) {
                E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                break;
              }
              if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                e2.msg = "incorrect header check", r2.mode = 30;
                break;
              }
              if (8 != (15 & u2)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
              else if (k > r2.wbits) {
                e2.msg = "invalid window size", r2.mode = 30;
                break;
              }
              r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
              break;
            case 2:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.flags = u2, 8 != (255 & r2.flags)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (57344 & r2.flags) {
                e2.msg = "unknown header flags set", r2.mode = 30;
                break;
              }
              r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
            case 3:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
            case 4:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
            case 5:
              if (1024 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
              } else r2.head && (r2.head.extra = null);
              r2.mode = 6;
            case 6:
              if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
              r2.length = 0, r2.mode = 7;
            case 7:
              if (2048 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.name = null);
              r2.length = 0, r2.mode = 8;
            case 8:
              if (4096 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.comment = null);
              r2.mode = 9;
            case 9:
              if (512 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (65535 & r2.check)) {
                  e2.msg = "header crc mismatch", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
              break;
            case 10:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
            case 11:
              if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
              e2.adler = r2.check = 1, r2.mode = 12;
            case 12:
              if (5 === t2 || 6 === t2) break e;
            case 13:
              if (r2.last) {
                u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                break;
              }
              for (; l2 < 3; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                case 0:
                  r2.mode = 14;
                  break;
                case 1:
                  if (j(r2), r2.mode = 20, 6 !== t2) break;
                  u2 >>>= 2, l2 -= 2;
                  break e;
                case 2:
                  r2.mode = 17;
                  break;
                case 3:
                  e2.msg = "invalid block type", r2.mode = 30;
              }
              u2 >>>= 2, l2 -= 2;
              break;
            case 14:
              for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                e2.msg = "invalid stored block lengths", r2.mode = 30;
                break;
              }
              if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2) break e;
            case 15:
              r2.mode = 16;
            case 16:
              if (d = r2.length) {
                if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
                I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                break;
              }
              r2.mode = 12;
              break;
            case 17:
              for (; l2 < 14; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                e2.msg = "too many length or distance symbols", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 18;
            case 18:
              for (; r2.have < r2.ncode; ) {
                for (; l2 < 3; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
              }
              for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
              if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid code lengths set", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 19;
            case 19:
              for (; r2.have < r2.nlen + r2.ndist; ) {
                for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                else {
                  if (16 === b) {
                    for (z = _ + 2; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                      e2.msg = "invalid bit length repeat", r2.mode = 30;
                      break;
                    }
                    k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                  } else if (17 === b) {
                    for (z = _ + 3; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                  } else {
                    for (z = _ + 7; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                  }
                  if (r2.have + d > r2.nlen + r2.ndist) {
                    e2.msg = "invalid bit length repeat", r2.mode = 30;
                    break;
                  }
                  for (; d--; ) r2.lens[r2.have++] = k;
                }
              }
              if (30 === r2.mode) break;
              if (0 === r2.lens[256]) {
                e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                break;
              }
              if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid literal/lengths set", r2.mode = 30;
                break;
              }
              if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                e2.msg = "invalid distances set", r2.mode = 30;
                break;
              }
              if (r2.mode = 20, 6 === t2) break e;
            case 20:
              r2.mode = 21;
            case 21:
              if (6 <= o2 && 258 <= h2) {
                e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                break;
              }
              for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (g && 0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                r2.mode = 26;
                break;
              }
              if (32 & g) {
                r2.back = -1, r2.mode = 12;
                break;
              }
              if (64 & g) {
                e2.msg = "invalid literal/length code", r2.mode = 30;
                break;
              }
              r2.extra = 15 & g, r2.mode = 22;
            case 22:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              r2.was = r2.length, r2.mode = 23;
            case 23:
              for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                e2.msg = "invalid distance code", r2.mode = 30;
                break;
              }
              r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
            case 24:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              if (r2.offset > r2.dmax) {
                e2.msg = "invalid distance too far back", r2.mode = 30;
                break;
              }
              r2.mode = 25;
            case 25:
              if (0 === h2) break e;
              if (d = c2 - h2, r2.offset > d) {
                if ((d = r2.offset - d) > r2.whave && r2.sane) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break;
                }
                p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
              } else m = i2, p = a2 - r2.offset, d = r2.length;
              for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
              0 === r2.length && (r2.mode = 21);
              break;
            case 26:
              if (0 === h2) break e;
              i2[a2++] = r2.length, h2--, r2.mode = 21;
              break;
            case 27:
              if (r2.wrap) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 |= n2[s2++] << l2, l2 += 8;
                }
                if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                  e2.msg = "incorrect data check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 28;
            case 28:
              if (r2.wrap && r2.flags) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (4294967295 & r2.total)) {
                  e2.msg = "incorrect length check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 29;
            case 29:
              x = 1;
              break e;
            case 30:
              x = -3;
              break e;
            case 31:
              return -4;
            case 32:
            default:
              return U;
          }
          return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
        }, r.inflateEnd = function(e2) {
          if (!e2 || !e2.state) return U;
          var t2 = e2.state;
          return t2.window && (t2.window = null), e2.state = null, N;
        }, r.inflateGetHeader = function(e2, t2) {
          var r2;
          return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
        }, r.inflateSetDictionary = function(e2, t2) {
          var r2, n2 = t2.length;
          return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
        }, r.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
        "use strict";
        var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
        t.exports = function(e2, t2, r2, n, i, s, a, o) {
          var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
          for (b = 0; b <= 15; b++) O[b] = 0;
          for (v = 0; v < n; v++) O[t2[r2 + v]]++;
          for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
          if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
          for (y = 1; y < w && 0 === O[y]; y++) ;
          for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
          if (0 < z && (0 === e2 || 1 !== w)) return -1;
          for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
          for (v = 0; v < n; v++) 0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
          if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
          for (; ; ) {
            for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
            for (h = 1 << b - 1; E & h; ) h >>= 1;
            if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
              if (b === w) break;
              b = t2[r2 + a[v]];
            }
            if (k < b && (E & f) !== l) {
              for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
              if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
              i[l = E & f] = k << 24 | x << 16 | c - s | 0;
            }
          }
          return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
        };
      }, { "../utils/common": 41 }], 51: [function(e, t, r) {
        "use strict";
        t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
      }, {}], 52: [function(e, t, r) {
        "use strict";
        var i = e("../utils/common"), o = 0, h = 1;
        function n(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
        n(z);
        var C = new Array(2 * f);
        n(C);
        var E = new Array(512);
        n(E);
        var A = new Array(256);
        n(A);
        var I = new Array(a);
        n(I);
        var O, B, R, T = new Array(f);
        function D(e2, t2, r2, n2, i2) {
          this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
        }
        function F(e2, t2) {
          this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
        }
        function N(e2) {
          return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
        }
        function P(e2, t2, r2) {
          e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
        }
        function L(e2, t2, r2) {
          P(e2, r2[2 * t2], r2[2 * t2 + 1]);
        }
        function j(e2, t2) {
          for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; ) ;
          return r2 >>> 1;
        }
        function Z(e2, t2, r2) {
          var n2, i2, s2 = new Array(g + 1), a2 = 0;
          for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
          for (i2 = 0; i2 <= t2; i2++) {
            var o2 = e2[2 * i2 + 1];
            0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
          }
        }
        function W(e2) {
          var t2;
          for (t2 = 0; t2 < l; t2++) e2.dyn_ltree[2 * t2] = 0;
          for (t2 = 0; t2 < f; t2++) e2.dyn_dtree[2 * t2] = 0;
          for (t2 = 0; t2 < c; t2++) e2.bl_tree[2 * t2] = 0;
          e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
        }
        function M(e2) {
          8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
        }
        function H(e2, t2, r2, n2) {
          var i2 = 2 * t2, s2 = 2 * r2;
          return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
        }
        function G(e2, t2, r2) {
          for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
          e2.heap[r2] = n2;
        }
        function K(e2, t2, r2) {
          var n2, i2, s2, a2, o2 = 0;
          if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
          L(e2, m, t2);
        }
        function Y(e2, t2) {
          var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
          for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
          for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
          for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
          for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
          e2.heap[--e2.heap_max] = e2.heap[1], function(e3, t3) {
            var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
            for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
            for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
            if (0 !== m2) {
              do {
                for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
                e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
              } while (0 < m2);
              for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
            }
          }(e2, t2), Z(s2, u2, e2.bl_count);
        }
        function X(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
        }
        function V(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
            if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
            else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
            s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
          }
        }
        n(T);
        var q = false;
        function J(e2, t2, r2, n2) {
          P(e2, (s << 1) + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
            M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
          }(e2, t2, r2, true);
        }
        r._tr_init = function(e2) {
          q || (function() {
            var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
            for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
            for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
            for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
            for (t2 = 0; t2 <= g; t2++) s2[t2] = 0;
            for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
            for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
            for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
            O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
          }(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
        }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
          var i2, s2, a2 = 0;
          0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = function(e3) {
            var t3, r3 = 4093624447;
            for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3]) return o;
            if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
            for (t3 = 32; t3 < u; t3++) if (0 !== e3.dyn_ltree[2 * t3]) return h;
            return o;
          }(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = function(e3) {
            var t3;
            for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--) ;
            return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
          }(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
            var i3;
            for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
            V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
          }(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
        }, r._tr_tally = function(e2, t2, r2) {
          return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
        }, r._tr_align = function(e2) {
          P(e2, 2, 3), L(e2, m, z), function(e3) {
            16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
          }(e2);
        };
      }, { "../utils/common": 41 }], 53: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
      }, {}], 54: [function(e, t, r) {
        (function(e2) {
          !function(r2, n) {
            "use strict";
            if (!r2.setImmediate) {
              var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
              e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                process.nextTick(function() {
                  c(e4);
                });
              } : function() {
                if (r2.postMessage && !r2.importScripts) {
                  var e4 = true, t3 = r2.onmessage;
                  return r2.onmessage = function() {
                    e4 = false;
                  }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
                }
              }() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                r2.postMessage(a + e4, "*");
              }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
                c(e4.data);
              }, function(e4) {
                t2.port2.postMessage(e4);
              }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                var t3 = l.createElement("script");
                t3.onreadystatechange = function() {
                  c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
                }, s.appendChild(t3);
              }) : function(e4) {
                setTimeout(c, 0, e4);
              }, e3.setImmediate = function(e4) {
                "function" != typeof e4 && (e4 = new Function("" + e4));
                for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++) t3[r3] = arguments[r3 + 1];
                var n2 = { callback: e4, args: t3 };
                return h[o] = n2, i(o), o++;
              }, e3.clearImmediate = f;
            }
            function f(e4) {
              delete h[e4];
            }
            function c(e4) {
              if (u) setTimeout(c, 0, e4);
              else {
                var t3 = h[e4];
                if (t3) {
                  u = true;
                  try {
                    !function(e5) {
                      var t4 = e5.callback, r3 = e5.args;
                      switch (r3.length) {
                        case 0:
                          t4();
                          break;
                        case 1:
                          t4(r3[0]);
                          break;
                        case 2:
                          t4(r3[0], r3[1]);
                          break;
                        case 3:
                          t4(r3[0], r3[1], r3[2]);
                          break;
                        default:
                          t4.apply(n, r3);
                      }
                    }(t3);
                  } finally {
                    f(e4), u = false;
                  }
                }
              }
            }
            function d(e4) {
              e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
            }
          }("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}] }, {}, [10])(10);
    });
  }
});

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ZoteroFootnotes
});
module.exports = __toCommonJS(main_exports);
var import_obsidian8 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var CSL_STYLES = [
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
var DEFAULT_SETTINGS = {
  cslStyle: "chicago-note-bibliography",
  citationMode: "endnote",
  showWordStyleFootnotes: true,
  showToolbar: true,
  pandocPath: "pandoc",
  pandocFlags: "",
  useDefaultExportDir: false,
  exportOutputDir: "",
  zoteroPort: 23119,
  language: "zh"
};
var I18N = {
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
    "export.pandocMissing": "\u627E\u4E0D\u5230 Pandoc\uFF08\"{pandoc}\"\uFF09\u3002\n\u8BF7\u5B89\u88C5 Pandoc \u6216\u5728\u8BBE\u7F6E\u4E2D\u586B\u5199\u5B8C\u6574\u8DEF\u5F84\uFF0C\u4F8B\u5982 /opt/homebrew/bin/pandoc",
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
    "prefs.updated": "\u5DF2\u5C06 {count} \u4E2A\u5F15\u7528\u66F4\u65B0\u4E3A\"{style}\"\u683C\u5F0F\uFF0C\u5E76\u5207\u6362\u4E3A{mode}\u3002",
    "prefs.zoteroUnavailable": "Zotero \u672A\u8FD0\u884C\u6216\u65E0\u6CD5\u8FDE\u63A5\uFF0C\u8BF7\u786E\u4FDD Zotero \u5DF2\u542F\u52A8\u3002",
    "prefs.updateFailed": "\u66F4\u65B0\u5931\u8D25\uFF1A{error}",
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
    "export.pandocMissing": "Pandoc (\"{pandoc}\") was not found.\nInstall Pandoc or set the full executable path in settings, for example /opt/homebrew/bin/pandoc",
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
    "prefs.updated": "Updated {count} citations to \"{style}\" and switched to {mode}.",
    "prefs.zoteroUnavailable": "Zotero is not running or could not be reached. Make sure Zotero is open.",
    "prefs.updateFailed": "Update failed: {error}",
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
  return (_c = (_b = (_a = app == null ? void 0 : app.plugins) == null ? void 0 : _a.plugins) == null ? void 0 : _b["zotero-footnotes"]) == null ? void 0 : _c.settings;
}
function appT(app, key, vars) {
  return t(getAppSettings(app) || DEFAULT_SETTINGS, key, vars);
}
function getStyleName(styleId, settingsOrLang) {
  const lang = typeof settingsOrLang === "string" ? settingsOrLang : getLanguage(settingsOrLang);
  const style = CSL_STYLES.find((s) => s.id === styleId);
  if (!style) return styleId;
  return lang === "en" ? style.en : style.zh;
}
function getModeLabel(mode, settingsOrLang, variant = "option") {
  return t(settingsOrLang, `mode.${mode}.${variant}`);
}
function getItemTypeLabel(itemType, settingsOrLang) {
  return t(settingsOrLang, `itemType.${itemType}`);
}
var ZoteroSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Zotero Footnotes" });
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
      for (const s of CSL_STYLES) dd.addOption(s.id, getStyleName(s.id, this.plugin.settings));
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
      });
    });
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
    const cmds = Object.values(this.plugin.getCommandLabels()).map((label) => `Zotero: ${label}`);
    const ul = containerEl.createEl("ul");
    for (const c of cmds) ul.createEl("li", { text: c }).style.color = "var(--text-muted)";
  }
  async checkConnection() {
    this.statusDot.className = "zotero-status-dot zotero-status-unknown";
    this.statusText.textContent = t(this.plugin.settings, "settings.checking");
    try {
      const r = await (0, import_obsidian.requestUrl)({ url: `http://127.0.0.1:${this.plugin.settings.zoteroPort}/connector/ping`, method: "GET", throw: false });
      if (r.status === 200) {
        this.statusDot.className = "zotero-status-dot zotero-status-ok";
        this.statusText.textContent = t(this.plugin.settings, "status.connected");
      } else throw new Error();
    } catch (e) {
      this.statusDot.className = "zotero-status-dot zotero-status-err";
      this.statusText.textContent = t(this.plugin.settings, "status.disconnected");
    }
  }
};

// src/ZoteroAPI.ts
var import_obsidian2 = require("obsidian");
var nodeHttp = require("http");
var fs2 = require("fs");
var os2 = require("os");
var path3 = require("path");
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
  if (!locator) return "";
  const prefix = (_a = LOCATOR_PREFIX[label != null ? label : "page"]) != null ? _a : "";
  return prefix ? `${prefix} ${locator}` : locator;
}
var ZoteroAPI = class {
  constructor(port = 23119) {
    this.port = port;
    this.baseUrl = `http://127.0.0.1:${port}`;
  }
  async ping() {
    try {
      const r = await (0, import_obsidian2.requestUrl)({ url: `${this.baseUrl}/connector/ping`, method: "GET", throw: false });
      return r.status === 200;
    } catch (e) {
      return false;
    }
  }
  /**
   * Open Zotero's native CAYW citation picker via Better BibTeX.
   * Uses Node.js http directly to avoid Electron renderer CORS issues.
   * Blocks until user confirms selection in Zotero's own UI.
   */
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
    if (!rawText || rawText === "[]" || rawText === "null" || rawText === "{}") return [];
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      return [];
    }
    const rawItems = this.extractArray(parsed);
    if (!rawItems.length) return [];
    const result = [];
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
  async searchItems(query) {
    var _a;
    if (!query.trim()) return [];
    try {
      const r = await (0, import_obsidian2.requestUrl)({
        url: `${this.baseUrl}/better-bibtex/json-rpc`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "item.search", params: [query], id: 1 }),
        throw: false
      });
      if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
      const d = r.json;
      if (d.error) throw new Error(d.error.message);
      return ((_a = d.result) != null ? _a : []).map(this.normalizeAny.bind(this)).filter((i) => !!i.title);
    } catch (err) {
      throw new ZoteroConnectionError(String(err));
    }
  }
  async getCitationKeys(itemKeys) {
    const map = /* @__PURE__ */ new Map();
    if (!itemKeys.length) return map;
    try {
      const r = await (0, import_obsidian2.requestUrl)({
        url: `${this.baseUrl}/better-bibtex/json-rpc`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "item.citationkey",
          params: [itemKeys],
          id: 2
        }),
        throw: false
      });
      if (r.status !== 200) return map;
      const d = r.json;
      if (d.error || !d.result || typeof d.result !== "object") return map;
      for (const [itemKey, citeKey] of Object.entries(d.result)) {
        if (typeof citeKey === "string" && citeKey.trim()) map.set(itemKey, citeKey);
      }
    } catch (e) {
    }
    return map;
  }
  async getItemsByKeys(keys, libraryID = 1) {
    const map = /* @__PURE__ */ new Map();
    if (!keys.length) return map;
    try {
      const r = await (0, import_obsidian2.requestUrl)({
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
            if (item.key && keys.includes(item.key)) map.set(item.key, item);
          }
        }
      }
    } catch (e) {
    }
    const missing = keys.filter((k) => !map.has(k));
    if (!missing.length) return map;
    try {
      const citeKeyMap = await this.getCitationKeys(missing);
      const citeKeys = [];
      const reverse = /* @__PURE__ */ new Map();
      for (const itemKey of missing) {
        const citeKey = citeKeyMap.get(itemKey);
        if (!citeKey) continue;
        citeKeys.push(citeKey);
        reverse.set(citeKey, itemKey);
      }
      if (!citeKeys.length) return map;
      const r = await (0, import_obsidian2.requestUrl)({
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
      if (r.status !== 200 || d.error || !d.result) return map;
      const items = JSON.parse(d.result);
      for (const it of items) {
        const item = this.normalizeAny(it);
        const found = item.key ? reverse.get(item.key) : void 0;
        if (found) map.set(found, { ...item, key: found });
      }
    } catch (e) {
    }
    const stillMissing = keys.filter((k) => !map.has(k));
    if (!stillMissing.length) return map;
    try {
      const dbItems = await this.getItemsFromLocalDB(stillMissing);
      for (const [k, v] of dbItems) {
        map.set(k, v);
      }
    } catch (e) {
    }
    return map;
  }
  async getItemsFromLocalDB(keys) {
    const map = /* @__PURE__ */ new Map();
    if (!keys.length) return map;
    const sqlite = await this.locateZoteroSQLite();
    if (!sqlite) return map;
    const tmpDir = path3.join(os2.tmpdir(), "zotero-footnotes-db");
    const tmpDb = path3.join(tmpDir, "zotero.sqlite");
    const tmpJournal = path3.join(tmpDir, "zotero.sqlite-journal");
    try {
      fs2.mkdirSync(tmpDir, { recursive: true });
      fs2.copyFileSync(sqlite, tmpDb);
      const journal = `${sqlite}-journal`;
      if (fs2.existsSync(journal)) fs2.copyFileSync(journal, tmpJournal);
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
      const { stdout: fieldsRaw } = await execAsync(`sqlite3 -json ${this.q(tmpDb)} ${this.q(fieldSql)}`, { timeout: 1e4, env: buildEnv() });
      const { stdout: creatorsRaw } = await execAsync(`sqlite3 -json ${this.q(tmpDb)} ${this.q(creatorSql)}`, { timeout: 1e4, env: buildEnv() });
      const fieldRows = JSON.parse(fieldsRaw || "[]");
      const creatorRows = JSON.parse(creatorsRaw || "[]");
      const grouped = /* @__PURE__ */ new Map();
      for (const row of fieldRows) {
        if (!row.itemKey) continue;
        const cur = grouped.get(row.itemKey) || { key: row.itemKey, creators: [], fields: {}, itemType: row.itemType };
        if (row.itemType && !cur.itemType) cur.itemType = row.itemType;
        if (row.fieldName && row.value != null) cur.fields[row.fieldName] = String(row.value);
        grouped.set(row.itemKey, cur);
      }
      for (const row of creatorRows) {
        if (!row.itemKey) continue;
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
          itemType: g.itemType === "case" ? "legal_case" : g.itemType,
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
        if (item.title) map.set(key, item);
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
        if (fs2.existsSync(p)) return p;
      } catch (e) {
      }
    }
    return null;
  }
  q(s) {
    return `"${String(s).replace(/(["\\$`\\\\])/g, "\\\\$1")}"`;
  }
  // ── Private helpers ────────────────────────────────────────────────────────
  /** Fetch full item data by key or search by title as fallback. */
  async fetchFullItem(key, title) {
    var _a, _b;
    try {
      const byKey = await this.getItemsByKeys([key]);
      const item = byKey.get(key);
      if (item == null ? void 0 : item.title) return item;
    } catch (e) {
    }
    try {
      const byDb = await this.getItemsFromLocalDB([key]);
      const item = byDb.get(key);
      if (item == null ? void 0 : item.title) return item;
    } catch (e) {
    }
    try {
      const results = await this.searchItems(key);
      const match = (_a = results.find((r) => r.key === key)) != null ? _a : results.length ? results[0] : null;
      if (match == null ? void 0 : match.title) return match;
    } catch (e) {
    }
    if (title) {
      try {
        const results = await this.searchItems(title);
        const match = (_b = results.find((r) => r.title.toLowerCase() === title.toLowerCase())) != null ? _b : results[0];
        if (match == null ? void 0 : match.title) return match;
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
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      const obj = data;
      for (const key of ["items", "citationItems", "citations"]) {
        if (Array.isArray(obj[key])) return obj[key];
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
    if (preferParentKey) key = preferParentKey;
    for (const f of ["itemKey", "key", "citationKey", "citekey"]) {
      if (key) break;
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
    if (key) item.key = key;
    if (!item.key) return null;
    return { item, locator, locatorLabel };
  }
  /**
   * Unified normalizer that handles BOTH native Zotero AND CSL-JSON formats.
   * Tries every known field name so it works regardless of what BBT returns.
   */
  normalizeAny(r) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q;
    let key = "";
    for (const f of ["itemKey", "key", "citationKey"]) {
      if (r[f]) {
        key = String(r[f]);
        break;
      }
    }
    if (!key && typeof r.id === "string") {
      const m = String(r.id).match(/\/items\/([A-Z0-9]{8})(?:$|[/?#])/i);
      if (m) key = m[1];
    }
    for (const f of ["citation-key", "citekey", "id"]) {
      if (key) break;
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
      if (y) date = String(y);
    }
    const publicationTitle = String(
      (_w = (_v = (_u = r.publicationTitle) != null ? _u : r["container-title"]) != null ? _v : r.journalAbbreviation) != null ? _w : ""
    ) || void 0;
    const authority = String((_Q = (_P = r.authority) != null ? _P : r.court) != null ? _Q : "") || void 0;
    const docketSource = (_a = r.docketNumber) != null ? _a : r.number;
    const extraSource = (_b = r.extra) != null ? _b : r.note;
    const docketNumber = docketSource == null ? void 0 : String(docketSource);
    const extra = extraSource == null ? void 0 : String(extraSource);
    return {
      key,
      itemType,
      title,
      creators,
      date,
      publicationTitle,
      bookTitle: String((_y = (_x = r.bookTitle) != null ? _x : r["collection-title"]) != null ? _y : "") || void 0,
      publisher: String((_z = r.publisher) != null ? _z : "") || void 0,
      place: String((_B = (_A = r.place) != null ? _A : r["publisher-place"]) != null ? _B : "") || void 0,
      volume: String((_C = r.volume) != null ? _C : "") || void 0,
      issue: String((_D = r.issue) != null ? _D : "") || void 0,
      pages: String((_F = (_E = r.pages) != null ? _E : r.page) != null ? _F : "") || void 0,
      edition: String((_G = r.edition) != null ? _G : "") || void 0,
      DOI: String((_H = r.DOI) != null ? _H : "") || void 0,
      URL: String((_J = (_I = r.url) != null ? _I : r.URL) != null ? _J : "") || void 0,
      ISBN: String((_K = r.ISBN) != null ? _K : "") || void 0,
      thesisType: String((_L = r.thesisType) != null ? _L : "") || void 0,
      university: String((_N = (_M = r.university) != null ? _M : r.school) != null ? _N : "") || void 0,
      conferenceName: String((_P = (_O = r.conferenceName) != null ? _O : r["event-title"]) != null ? _P : "") || void 0,
      authority,
      court: authority,
      docketNumber,
      extra
    };
  }
};
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

// src/CitationManager.ts
var KEY_PAT = "[A-Za-z0-9_:.-]+";
var INLINE_RE_SRC = `\\^\\[<!-- zotero:(${KEY_PAT}):([^ ]*) --> ([\\s\\S]*?)\\]`;
var ENDNOTE_DEF_RE_SRC = `^\\[\\^(\\d+)\\]: <!-- zotero:(${KEY_PAT}):([^ ]*) --> (.+)$`;
var BIBLIOGRAPHY_START = "<!-- zotero-bibliography-start -->";
var BIBLIOGRAPHY_END = "<!-- zotero-bibliography-end -->";
var CitationManager = class _CitationManager {
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
        if (ch === "\\\\") {
          pos += 2;
          continue;
        }
        if (ch === "[") {
          depth++;
          pos++;
          continue;
        }
        if (ch === "]") {
          if (depth === 0) break;
          depth--;
          pos++;
          continue;
        }
        pos++;
      }
      if (pos >= content.length) break;
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
    const defs = new Map(_CitationManager.parseEndnoteDefs(content).map((d) => [d.label, d]));
    const refs = [];
    const re = /\[\^([^\]\n]+)\]/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      if (content[m.index + m[0].length] === ":") continue;
      const def = defs.get(m[1]);
      if (!def) continue;
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
      if (pos > c.index && pos < c.index + c.fullMatch.length) return c;
    }
    return null;
  }
  static isInsideEndnoteRef(content, pos) {
    var _a;
    const defs = new Map(_CitationManager.parseEndnoteDefs(content).map((d) => [d.label, d]));
    const re = /\[\^(\d+)\]/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      if (content[m.index + m[0].length] === ":") continue;
      if (pos >= m.index && pos <= m.index + m[0].length) return (_a = defs.get(m[1])) != null ? _a : null;
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
    while ((m = re.exec(content)) !== null) max = Math.max(max, parseInt(m[1]));
    const label = String(max + 1);
    editor.replaceSelection(`[^${label}]`);
    const updated = editor.getValue();
    const def = _CitationManager.buildEndnoteDef(label, item, style, page);
    const bibStart = updated.indexOf(BIBLIOGRAPHY_START);
    if (bibStart !== -1) {
      let ins = bibStart;
      while (ins > 0 && updated[ins - 1] === "\n") ins--;
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
      if (!item) continue;
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
      if (!item) continue;
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
      if (referencedLabels.has(d.label)) continue;
      let start = d.defIndex;
      while (start >= 2 && content[start - 1] === "\n" && content[start - 2] === "\n") start--;
      const end = d.defIndex + d.fullMatch.length;
      content = content.slice(0, start) + content.slice(end);
      count++;
    }
    if (count) editor.setValue(content);
    return count;
  }
  static removeManagedBibliography(editor) {
    const content = editor.getValue();
    const startIdx = content.indexOf(BIBLIOGRAPHY_START);
    const endIdx = content.indexOf(BIBLIOGRAPHY_END);
    if (startIdx === -1 || endIdx === -1) return false;
    let start = startIdx;
    while (start >= 2 && content[start - 1] === "\n" && content[start - 2] === "\n") start--;
    let end = endIdx + BIBLIOGRAPHY_END.length;
    while (end < content.length && content[end] === "\n") end++;
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
      if (!item) continue;
      content = content.slice(0, ref.index) + _CitationManager.buildInlineFootnote(item, style, ref.page || void 0) + content.slice(ref.index + ref.fullMatch.length);
      count++;
    }
    const defs = _CitationManager.parseEndnoteDefs(content);
    for (let i = defs.length - 1; i >= 0; i--) {
      const d = defs[i];
      let end = d.defIndex + d.fullMatch.length;
      while (end < content.length && content[end] === "\n") end++;
      content = content.slice(0, d.defIndex) + content.slice(end);
    }
    editor.setValue(content);
    return count;
  }
  static convertInlineToEndnotes(editor, itemMap, style) {
    let content = editor.getValue();
    const inlines = _CitationManager.parseInlineCitations(content);
    if (!inlines.length) return 0;
    let max = 0;
    const re = /\[\^(\d+)\]/g;
    let m;
    while ((m = re.exec(content)) !== null) max = Math.max(max, parseInt(m[1]));
    const labels = inlines.map((_, idx) => String(max + idx + 1));
    for (let i = inlines.length - 1; i >= 0; i--) {
      const c = inlines[i];
      content = content.slice(0, c.index) + `[^${labels[i]}]` + content.slice(c.index + c.fullMatch.length);
    }
    const defs = [];
    for (let i = 0; i < inlines.length; i++) {
      const c = inlines[i];
      const item = itemMap.get(c.key);
      if (!item) continue;
      defs.push(_CitationManager.buildEndnoteDef(labels[i], item, style, c.page || void 0));
    }
    if (defs.length) {
      const bibStart = content.indexOf(BIBLIOGRAPHY_START);
      if (bibStart !== -1) {
        let ins = bibStart;
        while (ins > 0 && content[ins - 1] === "\n") ins--;
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
  static generateBibliography(content, itemMap, style) {
    const all = _CitationManager.parseAllCitations(content);
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    for (const c of all) {
      if (!seen.has(c.key)) {
        seen.add(c.key);
        const it = itemMap.get(c.key);
        if (it) items.push(it);
      }
    }
    if (!items.length) return "";
    const entries = items.map((it, i) => _CitationManager.formatBibEntry(it, style, i + 1));
    return BIBLIOGRAPHY_START + "\n\n" + entries.join("\n\n") + "\n\n" + BIBLIOGRAPHY_END;
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
    if (!item.date) return "n.d.";
    return (_b = (_a = item.date.match(/\b(\d{4})\b/)) == null ? void 0 : _a[1]) != null ? _b : item.date;
  }
  static getAuthors(item, type = "author") {
    return item.creators.filter((c) => c.creatorType === type);
  }
  static nameNormal(c) {
    if (c.name) return c.name;
    return [c.firstName, c.lastName].filter(Boolean).join(" ");
  }
  static nameInverted(c) {
    var _a, _b;
    if (c.name) return c.name;
    const f = (_a = c.firstName) != null ? _a : "", l = (_b = c.lastName) != null ? _b : "";
    return l ? `${l}${f ? ", " + f : ""}` : f;
  }
  static authorStr(item, max = 3, inverted = false) {
    const a = _CitationManager.getAuthors(item);
    if (!a.length) return "Anonymous";
    const names = a.map((x, i) => i === 0 && inverted ? _CitationManager.nameInverted(x) : _CitationManager.nameNormal(x));
    if (names.length > max) return names[0] + " et al.";
    if (names.length === 1) return names[0];
    return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
  }
  static initials(item, max = 6) {
    const a = _CitationManager.getAuthors(item);
    if (!a.length) return "Anon";
    const names = a.map((x) => {
      var _a, _b;
      if (x.name) return x.name;
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
    var _a, _b, _c, _d;
    const a = _CitationManager.authorStr(item), y = _CitationManager.getYear(item), p = page ? `, ${page}` : "";
    switch (item.itemType) {
      case "legal_case": {
        const court = (_a = item.court) != null ? _a : item.authority;
        return `${_CitationManager.it(item.title)} [${y}]${court ? " " + court : ""}${item.docketNumber ? " " + item.docketNumber : ""}${p}.`;
      }
      case "book":
        return `${a}, ${_CitationManager.it(item.title)} (${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y})${p}.`;
      case "bookSection": {
        const eds = _CitationManager.getAuthors(item, "editor").map((e) => _CitationManager.nameNormal(e)).join(", ");
        return `${a}, "${item.title}," in ${_CitationManager.it((_a = item.bookTitle) != null ? _a : "Unknown")}${eds ? ", ed. " + eds : ""} (${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y})${p}.`;
      }
      case "journalArticle":
        return `${a}, "${item.title}," ${_CitationManager.it((_b = item.publicationTitle) != null ? _b : "Journal")}${item.volume ? " " + item.volume : ""}${item.issue ? ", no. " + item.issue : ""} (${y})${item.pages ? ": " + item.pages : ""}${p}.`;
      case "thesis":
        return `${a}, "${item.title}" (${(_c = item.thesisType) != null ? _c : "PhD diss."}, ${(_d = item.university) != null ? _d : "n.p."}, ${y})${p}.`;
      default:
        return `${a}, "${item.title}" (${y})${p}.`;
    }
  }
  static bibChicago(item) {
    var _a, _b, _c, _d;
    const a = _CitationManager.authorStr(item, 3, true), y = _CitationManager.getYear(item);
    switch (item.itemType) {
      case "legal_case": {
        const court = (_a = item.court) != null ? _a : item.authority;
        return `${_CitationManager.it(item.title)}. ${court ? court + ". " : ""}${item.docketNumber ? item.docketNumber + ". " : ""}${y}.`;
      }
      case "book":
        return `${a}. ${_CitationManager.it(item.title)}. ${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y}.`;
      case "bookSection": {
        const eds = _CitationManager.getAuthors(item, "editor").map((e) => _CitationManager.nameNormal(e)).join(", ");
        return `${a}. "${item.title}." In ${_CitationManager.it((_a = item.bookTitle) != null ? _a : "Unknown")}${eds ? ", edited by " + eds : ""}. ${[item.place, item.publisher].filter(Boolean).join(": ") || "n.p."}, ${y}.`;
      }
      case "journalArticle":
        return `${a}. "${item.title}." ${_CitationManager.it((_b = item.publicationTitle) != null ? _b : "Journal")}${item.volume ? " " + item.volume : ""}${item.issue ? ", no. " + item.issue : ""} (${y})${item.pages ? ": " + item.pages : ""}.${item.DOI ? " https://doi.org/" + item.DOI : ""}`;
      case "thesis":
        return `${a}. "${item.title}." ${(_c = item.thesisType) != null ? _c : "PhD diss."}, ${(_d = item.university) != null ? _d : "n.p."}, ${y}.`;
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
      if (x.name) return x.name;
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
    const a = _CitationManager.initials(item), y = _CitationManager.getYear(item);
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
    const a = _CitationManager.authorStr(item), y = _CitationManager.getYear(item), p = page ? " " + page : "";
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
    const a = _CitationManager.initials(item), y = _CitationManager.getYear(item);
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

// src/ExportManager.ts
var import_obsidian3 = require("obsidian");

// src/ReferenceDocGenerator.ts
var JSZip = require_jszip_min();
var path = require("path");
var fs = require("fs");
var os = require("os");
var ReferenceDocGenerator = class {
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
var CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml"   ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`;
var ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
var DOCUMENT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"   Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`;
var DOCUMENT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
var SETTINGS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
var STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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

  <!-- Normal / \u6B63\u6587 -->
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

  <!-- Heading 1 / \u4E00\u7EA7\u6807\u9898: \u9ED1\u4F53\u4E09\u53F7(16pt) \u5C45\u4E2D -->
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

  <!-- Heading 2 / \u4E8C\u7EA7\u6807\u9898: \u9ED1\u4F53\u56DB\u53F7(14pt) \u5DE6\u5BF9\u9F50 -->
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

  <!-- Heading 3 / \u4E09\u7EA7\u6807\u9898: \u9ED1\u4F53\u5C0F\u56DB(12pt) \u5DE6\u5BF9\u9F50 -->
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

  <!-- Footnote Text / \u811A\u6CE8\u6B63\u6587: \u5B8B\u4F53\u5C0F\u4E94(9pt) \u5355\u500D\u884C\u8DDD -->
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

  <!-- Footnote Reference (character) -->
  <w:style w:type="character" w:styleId="FootnoteReference">
    <w:name w:val="footnote reference"/>
    <w:semiHidden/>
    <w:rPr><w:vertAlign w:val="superscript"/></w:rPr>
  </w:style>

  <!-- Default Paragraph Font -->
  <w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont">
    <w:name w:val="Default Paragraph Font"/>
    <w:semiHidden/><w:uiPriority w:val="1"/>
  </w:style>

  <!-- Body Text (Pandoc uses this) -->
  <w:style w:type="paragraph" w:styleId="BodyText">
    <w:name w:val="Body Text"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:line="360" w:lineRule="auto"/>
      <w:jc w:val="both"/>
      <w:ind w:firstLine="480"/>
    </w:pPr>
  </w:style>

  <!-- First Paragraph (Pandoc) -->
  <w:style w:type="paragraph" w:styleId="FirstParagraph">
    <w:name w:val="First Paragraph"/>
    <w:basedOn w:val="Normal"/>
  </w:style>

  <!-- Block Text / \u5F15\u7528\u5757 -->
  <w:style w:type="paragraph" w:styleId="BlockText">
    <w:name w:val="Block Text"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:ind w:left="720" w:right="720" w:firstLine="0"/>
      <w:spacing w:line="360" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:sz w:val="22"/><w:szCs w:val="22"/>
    </w:rPr>
  </w:style>

  <!-- Source Code -->
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

  <!-- Image Caption -->
  <w:style w:type="paragraph" w:styleId="ImageCaption">
    <w:name w:val="Image Caption"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:ind w:firstLine="0"/></w:pPr>
    <w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>
  </w:style>

  <!-- Table Normal -->
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

// src/ExportManager.ts
var { exec } = require("child_process");
var path2 = require("path");
var { promisify } = require("util");
var execAsync = promisify(exec);
function buildEnv() {
  var _a;
  const extraPaths = [
    "/opt/homebrew/bin",
    // Apple Silicon Homebrew
    "/opt/homebrew/sbin",
    "/usr/local/bin",
    // Intel Homebrew / manual installs
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
var ExportManager = class _ExportManager {
  static async exportToWord(inputPath, outputPath, settings) {
    var _a, _b;
    const pandoc = settings.pandocPath.trim() || "pandoc";
    const extraFlags = settings.pandocFlags.trim();
    const refDoc = await ReferenceDocGenerator.generate();
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
      const e = err;
      throw new ExportError(t(settings, "export.pandocFailed", {
        error: (_b = (_a = e.stderr) != null ? _a : e.message) != null ? _b : String(err)
      }));
    }
  }
  /** Try native Electron save dialog. Returns chosen path, null=cancelled, undefined=unavailable. */
  static async showNativeSaveDialog(defaultPath, settings = DEFAULT_SETTINGS) {
    var _a, _b, _c;
    try {
      const electron = require("electron");
      const dialog = (_b = (_a = electron.remote) != null ? _a : electron) == null ? void 0 : _b.dialog;
      if (!(dialog == null ? void 0 : dialog.showSaveDialog)) return void 0;
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
      new import_obsidian3.Notice(`\u2713 ${stdout.split("\n")[0].trim()}`, 4e3);
    } catch (e) {
      new import_obsidian3.Notice(t(settings, "export.pandocMissing", { pandoc }), 8e3);
    }
  }
  static q(s) {
    if (!s) return "";
    return process.platform === "win32" ? `"${s.replace(/"/g, '\\"')}"` : `'${s.replace(/'/g, "'\\''")}'`;
  }
};
var ExportError = class extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ExportError";
  }
};

// src/modals/ExportModal.ts
var import_obsidian4 = require("obsidian");
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
      if (e.key === "Enter") this.doConfirm();
      if (e.key === "Escape") this.close();
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
    if (!p) return;
    this.close();
    this.onConfirm(p);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/extensions/FootnoteExtension.ts
var import_obsidian5 = require("obsidian");
var import_view = require("@codemirror/view");
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
      edit: this.preview.edit
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
  var _a, _b;
  if (!options.isEnabled()) return import_view.Decoration.none;
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
      const preview = extractInlinePreview(raw, sequence);
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
    if (/^\s*$/.test(before)) continue;
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
    hits.push({
      start: m.index,
      end: m.index + raw.length,
      num: ordinal,
      identifier: label,
      domId: repeatCount > 0 ? `${ordinal}-${repeatCount}` : `${ordinal}`,
      ...(_b = endnotePreviews.get(label)) != null ? _b : {
        markdown: "",
        text: appT(options.app, "footnote.fallback", { value: ordinal })
      }
    });
  }
  hits.sort((a, b) => a.start - b.start);
  const ranges = [];
  let lastEnd = -1;
  for (const { start, end, num, markdown, text, identifier, domId, edit } of hits) {
    if (start < lastEnd) continue;
    if (sel.from <= end && sel.to >= start) continue;
    if (!inViewport(view, start, end)) continue;
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
    if (from <= vr.to && to >= vr.from) return true;
  }
  return false;
}
function isInsideHighlight(doc, from, to) {
  const lineStart = doc.lastIndexOf("\n", from - 1) + 1;
  let lineEnd = doc.indexOf("\n", to);
  if (lineEnd === -1) lineEnd = doc.length;
  const line = doc.slice(lineStart, lineEnd);
  const relFrom = from - lineStart;
  const relTo = to - lineStart;
  const before = line.slice(0, relFrom);
  const after = line.slice(relTo);
  return countHighlightDelimiters(before) % 2 === 1 && countHighlightDelimiters(after) % 2 === 1;
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
function extractInlinePreview(rawMarker, num) {
  const body = rawMarker.slice(2, -1);
  const metadata = parseZoteroMetadata(body);
  const markdown = metadata.markdown.trim();
  const text = normalizeTooltipText(markdown);
  return {
    markdown,
    text: text || appT(options.app, "footnote.fallback", { value: num }),
    edit: metadata.key ? { kind: "inline", key: metadata.key, locator: metadata.locator, from: -1, to: -1 } : null
  };
}
function buildEndnotePreviewMap(doc, app = null) {
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
    if (!match) continue;
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
function stripZoteroMetadata(text) {
  return text.replace(/^<!--\s*zotero:[^>]+-->\s*/, "");
}
function parseZoteroMetadata(text) {
  const match = text.match(/^<!--\s*zotero:([^:>]+):([^ ]*)\s*-->\s*/);
  if (!match) return { key: "", locator: "", markdown: text };
  return {
    key: match[1],
    locator: decodeURIComponent(match[2] || ""),
    markdown: text.slice(match[0].length)
  };
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
  if (!spec.markdown && !spec.fallbackText) return;
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
  if (!spec.markdown.trim()) {
    embed.addClass("mod-empty");
  }
  document.body.appendChild(popover);
  const component = new import_obsidian5.Component();
  const reposition = () => positionPopover(target, popover);
  const onPopoverEnter = () => cancelPopoverHide();
  const onPopoverLeave = () => schedulePopoverHide(target);
  popover.addEventListener("mouseenter", onPopoverEnter);
  popover.addEventListener("mouseleave", onPopoverLeave);
  window.addEventListener("scroll", reposition, true);
  window.addEventListener("resize", reposition);
  activePopover = {
    target,
    popover,
    component,
    hideTimer: null,
    reposition,
    onPopoverEnter,
    onPopoverLeave
  };
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
    await import_obsidian5.MarkdownRenderer.render(spec.app, spec.markdown, preview, spec.getSourcePath(), component);
    if ((activePopover == null ? void 0 : activePopover.target) !== target) return;
    reposition();
    requestAnimationFrame(reposition);
  } catch (e) {
    if (!((_a = preview.textContent) == null ? void 0 : _a.trim())) preview.setText(spec.fallbackText);
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
    if (ok && (activePopover == null ? void 0 : activePopover.target) === target) {
      destroyActivePopover();
    }
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
  const plugin = spec.app.plugins.plugins["zotero-footnotes"];
  const view = spec.app.workspace.getActiveViewOfType(import_obsidian5.MarkdownView);
  const editor = view == null ? void 0 : view.editor;
  if (!plugin || !editor) {
    new import_obsidian5.Notice(appT(spec.app, "footnote.noEditor"));
    return false;
  }
  const item = plugin.getCached(spec.edit.key) || await plugin.fetchAndCache(spec.edit.key);
  if (!item) {
    new import_obsidian5.Notice(appT(spec.app, "footnote.noItem"));
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
  new import_obsidian5.Notice(appT(spec.app, "footnote.updated"));
  return true;
}
function positionPopover(target, popover) {
  const margin = 8;
  const gap = 10;
  const rect = target.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  let top = rect.top - popoverRect.height - gap;
  if (top < margin) {
    top = rect.bottom + gap;
  }
  top = Math.max(margin, Math.min(window.innerHeight - popoverRect.height - margin, top));
  const left = Math.min(
    window.innerWidth - popoverRect.width - margin,
    Math.max(margin, rect.left + rect.width / 2 - popoverRect.width / 2)
  );
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}
function schedulePopoverHide(target) {
  if (!activePopover || activePopover.target !== target) return;
  cancelPopoverHide();
  activePopover.hideTimer = window.setTimeout(() => {
    if ((activePopover == null ? void 0 : activePopover.target) === target) destroyActivePopover();
  }, 80);
}
function cancelPopoverHide() {
  if (!(activePopover == null ? void 0 : activePopover.hideTimer)) return;
  window.clearTimeout(activePopover.hideTimer);
  activePopover.hideTimer = null;
}
function destroyActivePopover() {
  if (!activePopover) return;
  const { popover, component, reposition, onPopoverEnter, onPopoverLeave, hideTimer } = activePopover;
  if (hideTimer) window.clearTimeout(hideTimer);
  popover.removeEventListener("mouseenter", onPopoverEnter);
  popover.removeEventListener("mouseleave", onPopoverLeave);
  window.removeEventListener("scroll", reposition, true);
  window.removeEventListener("resize", reposition);
  component.unload();
  popover.remove();
  activePopover = null;
}

// src/modals/PreferencesModal.ts
var import_obsidian6 = require("obsidian");
var PreferencesModal = class extends import_obsidian6.Modal {
  constructor(app, opts) {
    super(app);
    this.opts = opts;
    this.selectedStyle = opts.currentStyle;
    this.selectedMode = opts.currentMode;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zotero-prefs-modal");
    contentEl.createEl("h2", { text: appT(this.app, "prefs.title") });
    const styleWrap = contentEl.createDiv();
    styleWrap.style.marginBottom = "16px";
    styleWrap.createEl("label", { text: appT(this.app, "prefs.styleLabel") }).style.display = "block";
    const select = styleWrap.createEl("select");
    select.style.width = "100%";
    select.style.marginTop = "6px";
    for (const s of CSL_STYLES) {
      const opt = select.createEl("option", { text: getStyleName(s.id, getAppSettings(this.app) || DEFAULT_SETTINGS), value: s.id });
      if (s.id === this.selectedStyle) opt.selected = true;
    }
    select.addEventListener("change", () => {
      this.selectedStyle = select.value;
      this.updateCitationCount();
    });
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
    this.citationsFoundEl = infoWrap.createEl("span", {
      text: "\u2013",
      cls: "zotero-citation-count"
    });
    this.citationsFoundEl.style.fontWeight = "600";
    this.updateCitationCount();
    const btnRow = contentEl.createDiv({ cls: "zotero-btn-row" });
    btnRow.style.display = "flex";
    btnRow.style.gap = "8px";
    btnRow.style.justifyContent = "flex-end";
    const cancelBtn = btnRow.createEl("button", { text: appT(this.app, "common.cancel") });
    cancelBtn.addEventListener("click", () => this.close());
    const applyBtn = btnRow.createEl("button", {
      text: appT(this.app, "prefs.apply"),
      cls: "mod-cta"
    });
    applyBtn.addEventListener("click", () => this.applyToDocument(applyBtn));
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
        if (item) itemMap.set(key, item);
      }
      const missing = uniqueKeys.filter((k) => !itemMap.has(k));
      if (missing.length) {
        new import_obsidian6.Notice(appT(this.app, "prefs.missingWarning", { count: missing.length }), 6e3);
      }
      btn.setText(appT(this.app, "prefs.updating"));
      await this.opts.onStyleChange(this.selectedStyle);
      await this.opts.onModeChange(this.selectedMode);
      const count = CitationManager.refreshDocument(editor, itemMap, this.selectedStyle, this.selectedMode);
      if (this.opts.refreshEditorExtension) this.opts.refreshEditorExtension();
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
var SearchModal = class _SearchModal extends import_obsidian7.Modal {
  constructor(app, opts) {
    super(app);
    this.selectedItem = null;
    this.debounceTimer = null;
    this._pageChangeHandler = () => {
      if (!this.selectedItem) return;
      const previewEl = this.contentEl.querySelector(".zotero-preview");
      if (!previewEl) return;
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
    if (this.opts.existingPage) this.pageInput.value = this.opts.existingPage;
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
      if (e.key === "Enter" && !this.confirmBtn.disabled) this.confirm();
      if (e.key === "Escape") this.close();
    });
    setTimeout(() => this.searchInput.focus(), 50);
  }
  onSearchInput() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
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
        this.resultsEl.createEl("p", {
          text: appT(this.app, "search.connectionError"),
          cls: "zotero-error"
        });
      } else {
        this.resultsEl.createEl("p", {
          text: appT(this.app, "search.failed", { error: String(err) }),
          cls: "zotero-error"
        });
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
    row.createEl("div", {
      text: item.title,
      cls: "zotero-result-title"
    }).style.fontWeight = "500";
    row.createEl("div", {
      text: `${authors}${authors ? " \xB7 " : ""}${year} \xB7 ${typeLabel}`,
      cls: "zotero-result-meta"
    }).style.color = "var(--text-muted)";
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
    if (btnRow) this.contentEl.insertBefore(previewEl, btnRow);
    this.pageInput.removeEventListener("input", this._pageChangeHandler);
    this.pageInput.addEventListener("input", this._pageChangeHandler);
  }
  confirm() {
    if (!this.selectedItem) return;
    this.opts.onConfirm(this.selectedItem, this.pageInput.value.trim());
    this.close();
  }
  onClose() {
    this.contentEl.empty();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }
  static typeLabel(itemType, settings = DEFAULT_SETTINGS) {
    const label = getItemTypeLabel(itemType, settings);
    return label === `itemType.${itemType}` ? itemType : label;
  }
};

// main.ts
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
var ZoteroFootnotes = class extends import_obsidian8.Plugin {
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
    (0, import_obsidian8.addIcon)("zotero-z", ZOTERO_ICON);
    (0, import_obsidian8.addIcon)("zotero-cite", ZOTERO_CITE_ICON);
    (0, import_obsidian8.addIcon)("zotero-word-display", ZOTERO_WORD_DISPLAY_ICON);
    (0, import_obsidian8.addIcon)("zotero-style", ZOTERO_STYLE_ICON);
    (0, import_obsidian8.addIcon)("zotero-export", ZOTERO_EXPORT_ICON);
    (0, import_obsidian8.addIcon)("zotero-refresh", ZOTERO_REFRESH_ICON);
    (0, import_obsidian8.addIcon)("zotero-unlink", ZOTERO_UNLINK_ICON);
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
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.refreshToolbars())
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => this.refreshToolbars())
    );
    setTimeout(() => this.refreshToolbars(), 100);
  }
  onunload() {
    var _a;
    if (this.focusBurstTimer) window.clearInterval(this.focusBurstTimer);
    if (this.focusBurstStopTimer) window.clearTimeout(this.focusBurstStopTimer);
    if (this.focusBurstTopmostResetTimer) window.clearTimeout(this.focusBurstTopmostResetTimer);
    this.focusBurstTimer = null;
    this.focusBurstStopTimer = null;
    this.focusBurstTopmostResetTimer = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof import_obsidian8.MarkdownView) {
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
    this.itemCache = new Map(Object.entries((_b = data == null ? void 0 : data.itemCache) != null ? _b : {}));
  }
  async saveSettings() {
    await this.saveData({ settings: this.settings, itemCache: Object.fromEntries(this.itemCache) });
  }
  t(key, vars) {
    return t(this.settings, key, vars);
  }
  getCommandLabels() {
    return {
      "insert-edit-citation": this.t("command.insertCitation"),
      "toggle-word-display": this.t("command.toggleWordDisplay"),
      "toggle-toolbar": this.t("command.toggleToolbar"),
      "insert-bibliography": this.t("command.insertBibliography"),
      "refresh-citations": this.t("command.refreshCitations"),
      "export-to-word": this.t("command.exportToWord"),
      "unlink-citations": this.t("command.unlinkCitations"),
      "document-preferences": this.t("command.documentPreferences"),
      "check-pandoc": this.t("command.checkPandoc")
    };
  }
  syncCommandLabels() {
    const labels = this.getCommandLabels();
    const commands = this.app.commands && this.app.commands.commands ? this.app.commands.commands : {};
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
    this.app.workspace.updateOptions();
    this.refreshMarkdownPreviews();
    this.refreshToolbars();
  }
  refreshMarkdownPreviews() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof import_obsidian8.MarkdownView) {
        leaf.view.previewMode.rerender(true);
      }
    });
  }
  // ══ Item cache ════════════════════════════════════════════════════════════
  cacheItem(item) {
    this.itemCache.set(item.key, item);
    this.saveSettings();
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
    } catch (e) {
      return null;
    }
  }
  // ══ Commands ══════════════════════════════════════════════════════════════
  getEditor() {
    var _a, _b;
    return (_b = (_a = this.app.workspace.getActiveViewOfType(import_obsidian8.MarkdownView)) == null ? void 0 : _a.editor) != null ? _b : null;
  }
  getInputFilePath() {
    const file = this.app.workspace.getActiveFile();
    if (!file) return null;
    const base = this.app.vault.adapter.getBasePath();
    return `${base}/${file.path}`;
  }
  captureEditorSelection(editor) {
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    return { from, to };
  }
  getEditorForInsertion(fallbackEditor, sourcePath) {
    var _a;
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian8.MarkdownView);
    const activeEditor = activeView == null ? void 0 : activeView.editor;
    const activePath = (_a = this.app.workspace.getActiveFile()) == null ? void 0 : _a.path;
    if (activeEditor && (!sourcePath || activePath === sourcePath)) return activeEditor;
    return fallbackEditor;
  }
  restoreEditorSelection(editor, snapshot) {
    if (!snapshot) return;
    try {
      editor.setSelection(snapshot.from, snapshot.to);
    } catch (e) {
      try {
        editor.setCursor(snapshot.to);
      } catch (e2) {
      }
    }
  }
  refocusObsidianWindow(editor) {
    const focusEditor = () => {
      try {
        editor == null ? void 0 : editor.focus();
      } catch (e) {
      }
      try {
        var _a;
        (_a = editor == null ? void 0 : editor.cm) == null ? void 0 : _a.focus();
      } catch (e) {
      }
    };
    const attempt = () => {
      try {
        const remote = require("@electron/remote");
        const win = remote == null ? void 0 : remote.getCurrentWindow?.();
        const appName = remote == null ? void 0 : remote.app?.getName?.();
        try {
          if (win != null && win.isMinimized?.()) win.restore?.();
        } catch (e) {
        }
        try {
          win == null ? void 0 : win.show?.();
        } catch (e) {
        }
        try {
          win == null ? void 0 : win.focus?.();
        } catch (e) {
        }
        try {
          win == null ? void 0 : win.moveTop?.();
        } catch (e) {
        }
        try {
          remote == null ? void 0 : remote.app?.focus?.({ steal: true });
        } catch (e) {
          try {
            remote == null ? void 0 : remote.app?.focus?.();
          } catch (e2) {
          }
        }
        try {
          if (process.platform === "darwin") {
            const { execFile } = require("child_process");
            execFile("osascript", ["-e", `tell application "${String(appName || "Obsidian").replace(/"/g, '\\"')}" to activate`], () => {
            });
          }
        } catch (e) {
        }
      } catch (e) {
        try {
          const electron = require("electron");
          const win = electron.remote == null ? void 0 : electron.remote.getCurrentWindow?.();
          try {
            if (win != null && win.isMinimized?.()) win.restore?.();
          } catch (e2) {
          }
          try {
            win == null ? void 0 : win.focus?.();
          } catch (e2) {
          }
        } catch (e2) {
        }
      }
      try {
        window.focus();
      } catch (e) {
      }
      try {
        this.app.commands.executeCommandById("editor:focus");
      } catch (e) {
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
      win = remote == null ? void 0 : remote.getCurrentWindow?.();
      try {
        win == null ? void 0 : win.setAlwaysOnTop?.(true);
      } catch (e) {
      }
    } catch (e) {
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
        win == null ? void 0 : win.setAlwaysOnTop?.(false);
      } catch (e) {
      }
      this.focusBurstTopmostResetTimer = null;
    }, 1400);
  }
  // ── Insert / Edit citation (uses Zotero native CAYW picker) ──────────────
  async insertOrEditCitation(editor) {
    const content = editor.getValue();
    const pos = editor.posToOffset(editor.getCursor());
    const existingInline = CitationManager.isInsideInline(content, pos);
    const existingEndnote = CitationManager.isInsideEndnoteRef(content, pos);
    const sourcePath = this.app.workspace.getActiveFile()?.path || null;
    const selectionSnapshot = this.captureEditorSelection(editor);
    const notice = new import_obsidian8.Notice(this.t("notice.openPicker"), 0);
    let items;
    try {
      items = await this.api.openCAYW(() => this.refocusObsidianWindow(this.getEditorForInsertion(editor, sourcePath)));
    } catch (err) {
      notice.hide();
      this.refocusObsidianWindow(this.getEditorForInsertion(editor, sourcePath));
      if (err instanceof ZoteroConnectionError) {
        new import_obsidian8.Notice(this.t("notice.connectZoteroFailed"), 6e3);
      } else if (err instanceof ZoteroPickerError) {
        new import_obsidian8.Notice(this.t("notice.nativePickerFallback"), 5e3);
        this.openSearchFallback(editor, existingInline == null ? void 0 : existingInline.page, existingEndnote == null ? void 0 : existingEndnote.page, existingInline, existingEndnote);
      } else {
        new import_obsidian8.Notice(this.t("notice.pickerError", { error: String(err) }), 6e3);
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
    new import_obsidian8.Notice(this.settings.showWordStyleFootnotes ? this.t("notice.wordDisplayOn") : this.t("notice.wordDisplayOff"));
  }
  // ── Insert bibliography ───────────────────────────────────────────────────
  async insertBibliography(editor) {
    const content = editor.getValue();
    const all = CitationManager.parseAllCitations(content);
    if (!all.length) {
      new import_obsidian8.Notice(this.t("notice.noManagedCitations"));
      return;
    }
    const keys = [...new Set(all.map((c) => c.key))];
    const itemMap = await this.resolveItems(keys);
    if (!itemMap) return;
    const bib = CitationManager.generateBibliography(content, itemMap, this.settings.cslStyle);
    if (!bib) {
      new import_obsidian8.Notice(this.t("notice.noBibliography"));
      return;
    }
    CitationManager.insertOrReplaceBibliography(editor, bib);
    new import_obsidian8.Notice(this.t("notice.bibliographyUpdated"));
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
        new import_obsidian8.Notice(this.t("notice.cleanedOrphans", {
          count: removedOrphans,
          extra: removedBib ? this.t("notice.cleanedOrphans.extraBib") : ""
        }));
      } else {
        new import_obsidian8.Notice(this.t("notice.noManagedCitations"));
      }
      return;
    }
    const notice = new import_obsidian8.Notice(this.t("notice.refreshing"), 0);
    try {
      const keys = [...new Set(all.map((c) => c.key))];
      const fetched = await this.api.getItemsByKeys(keys);
      for (const [k, v] of fetched) this.cacheItem(v.key ? v : { ...v, key: k });
      const itemMap = /* @__PURE__ */ new Map();
      for (const key of keys) {
        const item = (_a = fetched.get(key)) != null ? _a : this.getCached(key);
        if (item) itemMap.set(key, item);
      }
      notice.hide();
      const style = this.settings.cslStyle;
      let count = 0;
      count += CitationManager.refreshInline(editor, itemMap, style);
      count += CitationManager.refreshEndnotes(editor, itemMap, style);
      const newContent = editor.getValue();
      if (newContent.includes("<!-- zotero-bibliography-start -->")) {
        const bib = CitationManager.generateBibliography(newContent, itemMap, style);
        CitationManager.insertOrReplaceBibliography(editor, bib);
      }
      const extra = removedOrphans ? this.t("notice.refreshed.extraOrphans", { count: removedOrphans }) : "";
      new import_obsidian8.Notice(this.t("notice.refreshed", { count, extra }));
    } catch (err) {
      notice.hide();
      if (err instanceof ZoteroConnectionError) {
        new import_obsidian8.Notice(this.t("notice.zoteroUnavailable"), 5e3);
      } else new import_obsidian8.Notice(this.t("notice.refreshFailed", { error: String(err) }), 5e3);
    }
  }
  // ── Export to Word ────────────────────────────────────────────────────────
  async exportToWord() {
    const inputPath = this.getInputFilePath();
    if (!inputPath) {
      new import_obsidian8.Notice(this.t("notice.openFileBeforeExport"));
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
  async doExport(inputPath, outputPath) {
    const notice = new import_obsidian8.Notice(this.t("notice.exporting"), 0);
    try {
      await ExportManager.exportToWord(inputPath, outputPath, this.settings);
      notice.hide();
      new import_obsidian8.Notice(this.t("notice.exportSuccess", { path: outputPath }), 8e3);
    } catch (err) {
      notice.hide();
      new import_obsidian8.Notice(String(err), 1e4);
    }
  }
  // ── Unlink citations ──────────────────────────────────────────────────────
  unlinkCitations(editor) {
    const inlines = CitationManager.parseInlineCitations(editor.getValue()).length;
    const endnotes = CitationManager.parseEndnoteDefs(editor.getValue()).length;
    const total = inlines + endnotes;
    if (!total) {
      new import_obsidian8.Notice(this.t("notice.noManagedCitations"));
      return;
    }
    new ConfirmModal(
      this.app,
      this.t("unlink.title"),
      this.t("unlink.message", { total, inline: inlines, endnote: endnotes }),
      () => {
        const count = CitationManager.unlinkAll(editor);
        new import_obsidian8.Notice(this.t("unlink.done", { count }));
      }
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
  openSearchFallback(editor, existingInlinePage, existingEndnotePage, existingInline = CitationManager.isInsideInline(editor.getValue(), editor.posToOffset(editor.getCursor())), existingEndnote = CitationManager.isInsideEndnoteRef(editor.getValue(), editor.posToOffset(editor.getCursor()))) {
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
  applySelectedCitations(editor, items, existingInline = CitationManager.isInsideInline(editor.getValue(), editor.posToOffset(editor.getCursor())), existingEndnote = CitationManager.isInsideEndnoteRef(editor.getValue(), editor.posToOffset(editor.getCursor()))) {
    const style = this.settings.cslStyle;
    const mode = this.settings.citationMode;
    if (items.length === 1) {
      const ci = items[0];
      const page = formatLocator(ci.locator, ci.locatorLabel) || void 0;
      if (existingInline) {
        CitationManager.replaceInline(editor, existingInline, ci.item, style, page);
        new import_obsidian8.Notice(this.t("notice.citationUpdated"));
        return;
      }
      if (existingEndnote) {
        CitationManager.replaceEndnoteDef(editor, existingEndnote, ci.item, style, page);
        new import_obsidian8.Notice(this.t("notice.citationUpdated"));
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
    new import_obsidian8.Notice(this.t("notice.insertedCitations", { count: items.length }));
  }
  // ── Shared helper ─────────────────────────────────────────────────────────
  async resolveItems(keys) {
    const map = /* @__PURE__ */ new Map();
    const missing = [];
    for (const k of keys) {
      const c = this.getCached(k);
      if (c) map.set(k, c);
      else missing.push(k);
    }
    if (missing.length) {
      const n = new import_obsidian8.Notice(this.t("notice.fetchingItems", { count: missing.length }), 0);
      try {
        for (const k of missing) {
          const item = await this.fetchAndCache(k);
          if (item) map.set(k, item);
        }
      } catch (err) {
        n.hide();
        if (err instanceof ZoteroConnectionError) new import_obsidian8.Notice(this.t("notice.zoteroUnavailable"), 5e3);
        else new import_obsidian8.Notice(this.t("notice.fetchItemsFailed", { error: String(err) }), 5e3);
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
      if (leaf.view instanceof import_obsidian8.MarkdownView) {
        this.syncToolbar(leaf.view);
      }
    });
  }
  toggleToolbar() {
    this.settings.showToolbar = !this.settings.showToolbar;
    void this.saveSettings();
    this.refreshToolbars();
    new import_obsidian8.Notice(this.settings.showToolbar ? this.t("notice.toolbarShown") : this.t("notice.toolbarHidden"));
  }
  syncToolbar(view) {
    this.clearToolbar(view);
    if (!this.settings.showToolbar) return;
    const actionEls = [];
    const action = (icon, title, cb, active = false) => {
      const el = view.addAction(icon, title, (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        cb();
      });
      el.classList.add("zotero-titlebar-action");
      if (active) el.classList.add("is-active");
      actionEls.push(el);
    };
    action("zotero-export", this.t("toolbar.export"), () => this.exportToWord());
    action("zotero-unlink", this.t("toolbar.unlink"), () => {
      const ed = view.editor;
      if (ed) this.unlinkCitations(ed);
    });
    action("zotero-style", this.t("toolbar.changeStyle"), () => this.openPreferences());
    action("zotero-refresh", this.t("toolbar.refresh"), () => {
      const ed = view.editor;
      if (ed) this.refreshAll(ed);
    });
    action("zotero-word-display", this.t("toolbar.wordDisplay"), () => this.toggleWordDisplay(), this.settings.showWordStyleFootnotes);
    action("zotero-cite", this.t("toolbar.insertCitation"), () => {
      const ed = view.editor;
      if (ed) this.insertOrEditCitation(ed);
    });
    this.titlebarActions.set(view, actionEls);
  }
  clearToolbar(view) {
    view.contentEl.querySelectorAll(".zotero-toolbar").forEach((el) => el.remove());
    const actionEls = this.titlebarActions.get(view);
    if (!actionEls) return;
    for (const el of actionEls) el.remove();
    this.titlebarActions.delete(view);
  }
  decorateRenderedFootnotes(root) {
    if (!this.settings.showWordStyleFootnotes) return;
    const refs = root.querySelectorAll("a.footnote-ref, a[data-footnote-ref]");
    refs.forEach((ref) => {
      var _a;
      const marker = this.getRenderedFootnoteMarker(ref);
      if (marker) ref.textContent = marker;
      ref.classList.add("zotero-rendered-footnote-ref");
      (_a = ref.parentElement) == null ? void 0 : _a.classList.add("zotero-rendered-footnote-sup");
      const tooltip = this.getRenderedFootnoteTooltip(ref, root);
      ref.removeAttribute("title");
      if (!tooltip) return;
      ref.removeAttribute("aria-label");
    });
  }
  getRenderedFootnoteMarker(ref) {
    var _a, _b, _c, _d, _e, _f;
    const text = (_b = (_a = ref.textContent) == null ? void 0 : _a.trim()) != null ? _b : "";
    const fromText = (_c = text.match(/\d+/)) == null ? void 0 : _c[0];
    if (fromText) return fromText;
    const href = (_d = ref.getAttribute("href")) != null ? _d : "";
    return (_f = (_e = href.match(/\d+/)) == null ? void 0 : _e[0]) != null ? _f : text.replace(/^\[|\]$/g, "");
  }
  getRenderedFootnoteTooltip(ref, root) {
    var _a, _b, _c;
    const href = ref.getAttribute("href");
    if (!(href == null ? void 0 : href.startsWith("#"))) return "";
    const targetId = decodeURIComponent(href.slice(1));
    const noteEl = (_b = this.findById(root, targetId)) != null ? _b : (_a = ref.ownerDocument) == null ? void 0 : _a.getElementById(targetId);
    if (!noteEl) return "";
    const cloned = noteEl.cloneNode(true);
    cloned.querySelectorAll('a.footnote-backref, a[data-footnote-backref], a[href^="#fnref"]').forEach((el) => el.remove());
    return this.normalizeFootnoteText((_c = cloned.textContent) != null ? _c : "");
  }
  findById(root, id) {
    if (!id) return null;
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return root.querySelector(`#${CSS.escape(id)}`);
    }
    return root.querySelector(`[id="${id.replace(/"/g, '\\"')}"]`);
  }
  normalizeFootnoteText(text) {
    return text.replace(/\s+/g, " ").trim();
  }
  toEditableLocator(locator) {
    if (!locator) return locator;
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
    `;
    document.head.appendChild(s);
    this.styleEl = s;
  }
};
var ConfirmModal = class extends import_obsidian8.Modal {
  constructor(app, title, msg, cb) {
    super(app);
    this.title = title;
    this.msg = msg;
    this.cb = cb;
  }
  onOpen() {
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
/*! Bundled license information:

jszip/dist/jszip.min.js:
  (*!
  
  JSZip v3.10.1 - A JavaScript class for generating and reading zip files
  <http://stuartk.com/jszip>
  
  (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
  Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.
  
  JSZip uses the library pako released under the MIT license :
  https://github.com/nodeca/pako/blob/main/LICENSE
  *)
*/
