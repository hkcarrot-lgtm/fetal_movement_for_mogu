# 孕期数胎动（本地版）

基于 [BabyCare](https://github.com/CaliCastle/babycare) 的本地孕期助手，数据仅存本机，无账号、无后端。

## 功能

- **数胎动** — Cardiff Count-to-10 方法，可配置合并窗口（3/5/10 分钟）与目标次数，数据存于 IndexedDB
- **设置** — 预产期、目标次数、合并窗口、深色模式（跟随系统/手动）
- **PWA** — 可安装到主屏，支持离线使用

## 技术栈

- React 19 + TypeScript + Vite 7
- Tailwind CSS 4
- Dexie.js (IndexedDB)
- vite-plugin-pwa (Workbox)

## 开发

```bash
# 需要先安装 pnpm：npm i -g pnpm
pnpm install
pnpm dev       # 启动开发服务器（默认 http://localhost:5173）
pnpm build     # 生产构建
pnpm preview   # 预览构建结果
```

若使用 npm，请执行 `npm install` 后用 `npm run dev` / `npm run build`。

## 获取完整 BabyCare 源码

若你网络可访问 GitHub，可在项目目录执行（需先临时关闭或配置好代理）：

```bash
# 方式一：克隆到当前目录（当前目录需为空）
git clone https://github.com/CaliCastle/babycare.git .

# 方式二：克隆到子目录再拷贝需要的文件
git clone https://github.com/CaliCastle/babycare.git babycare-upstream
# 然后可对比或复制 babycare-upstream/src 下的页面与组件到本项目的 src
```

完整版 BabyCare 还包含：宫缩计时、待产包清单、喂奶记录、历史趋势图、数据导出/导入等，可按需从上游仓库拷贝对应模块。

## 许可证

MIT（上游 BabyCare 为 MIT）
