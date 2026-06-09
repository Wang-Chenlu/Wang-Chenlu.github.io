# Chenlu Wang 学术主页

这个仓库用于维护 Chenlu Wang 的个人学术主页：

https://wang-chenlu.github.io/

网站基于 Next.js 构建，并以静态文件形式发布到 GitHub Pages。

## 本地开发

安装依赖：

```bash
npm install
```

启动本地预览：

```bash
npm run dev
```

构建静态网站：

```bash
npm run build
```

## 内容维护

- 个人信息、导航和页面设置在 `content/` 与 `content_zh/` 中维护。
- 论文数据在 `content/publications.bib` 中维护。
- 论文图片存放在 `public/images/publications/` 下。
- 页面组件和样式代码位于 `src/`。

## 发布说明

GitHub Pages 当前发布仓库根目录的静态文件。每次重新构建后，需要将 `out/` 中生成的内容同步到仓库根目录，再提交并推送。

根目录的 `.nojekyll` 文件需要保留，它可以防止 GitHub Pages 将网站误按 Jekyll 项目处理。
