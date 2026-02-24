# 用 www.hukun.work/mogu 访问「孕期数胎动」— 步骤说明

用 **Vercel** 免费托管，并绑定你的域名 **www.hukun.work**，访问地址：**https://www.hukun.work/mogu**

---

## 一、在 Vercel 部署项目

1. **打开 Vercel**  
   浏览器访问：https://vercel.com ，用 GitHub 账号登录。

2. **导入仓库**  
   - 点 **「Add New…」→「Project」**  
   - 在列表里找到 **hkcarrot-lgtm/fetal_movement_for_mogu**，点 **Import**

3. **配置构建（不要改域名）**  
   - **Framework Preset**：选 **Vite**（或保持默认）  
   - **Build Command**：`npm run build`  
   - **Output Directory**：填 **`dist`**（重要：因为构建产物在 `dist/mogu`，Vercel 会以 `dist` 为根，这样线上会有 `/mogu/` 路径）  
   - **Install Command**：留空或 `npm install`  
   - 点 **Deploy**，等部署完成。

4. **确认子路径可访问**  
   部署完成后会得到一个地址，如 `xxx.vercel.app`。  
   在浏览器打开：**`https://xxx.vercel.app/mogu/`**  
   能正常打开页面说明子路径部署成功。

---

## 二、绑定域名 www.hukun.work

1. **在 Vercel 里添加域名**  
   - 打开你的项目 → 顶部 **Settings** → 左侧 **Domains**  
   - 在输入框填：**www.hukun.work**，点 **Add**  
   - Vercel 会提示你要在域名服务商那里添加 DNS 记录。

2. **在阿里云添加 DNS 解析**  
   - 登录 阿里云控制台 → **域名** → **云解析 DNS** → 选择 **hukun.work**  
   - 添加一条 **解析记录**：  
     - **记录类型**：`CNAME`  
     - **主机记录**：`www`（表示 www.hukun.work）  
     - **记录值**：Vercel 里 Domains 页面显示的 CNAME，一般是 **`cname.vercel-dns.com`**  
     - **TTL**：10 分钟或默认  
   - 保存。

3. **等 DNS 生效**  
   通常几分钟到几十分钟。在 Vercel 的 Domains 里会显示该域名是否验证通过（出现勾）。

---

## 三、访问地址

- **主地址**：**https://www.hukun.work/mogu/**  
- 若暂时用 Vercel 默认域名：**https://你的项目名.vercel.app/mogu/**

---

## 四、之后更新内容

代码推送到 GitHub 的 **main** 分支后，Vercel 会自动重新构建和部署，无需再手动上传。

```bash
cd "/Users/mogu/我的cursor编程/孕期数胎动"
git add .
git commit -m "更新说明"
git push origin main
```

---

## 常见问题

- **打开 www.hukun.work 没有 /mogu 页面**  
  请确认访问的是 **https://www.hukun.work/mogu/**（末尾斜杠可加可不加），不要只打开 https://www.hukun.work/ 。

- **提示「找不到页面」**  
  在 Vercel 项目里确认 **Output Directory** 是 **dist**，且构建日志里没有报错。

- **域名一直不生效**  
  检查阿里云解析里 **主机记录** 是 `www`，**记录值** 是 Vercel 给的 CNAME（如 `cname.vercel-dns.com`）。
