# Zotero Citations v0.2.1

## 官方规范对齐 / Compliance

- **命令与文档同步** — 命令面板名称、README 与发布说明不再保留错误的手工前缀说法
- **样式合规化** — 静态内联样式迁移到 `styles.css`，状态色改为 Obsidian 主题变量
- **构建与发布同步** — 生产构建改为压缩输出，Release 资产说明补充 `styles.css`

## 披露与仓库整理

- **README 披露补全** — 补充回环网络、临时文件、本地 `pandoc` / `sqlite3` / `osascript` 调用说明
- **仓库结构更标准** — `main.js` 继续作为本地运行产物存在，但不再纳入 Git 跟踪
- **开发文档同步** — `docs/DEVELOPMENT.md` 与当前目录结构、Release 流程保持一致

## 代码修复

- 改用 Obsidian `Platform` / `FileSystemAdapter` API，减少与官方规范不符的实现
- 清理剩余静态内联样式，设置页与各模态窗口样式统一交给 `styles.css`

---

**完整更新日志**: [CHANGELOG.md](./CHANGELOG.md)
