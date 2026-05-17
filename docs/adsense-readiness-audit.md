# AdSense 上线前体检

最后更新：2026-05-17

## 结论

当前站点结构已经接近可以准备 AdSense，但暂时不建议提交审核。

主要原因不是技术框架，而是公开内容量和内容厚度还不够。Pinbead 现在已经有编辑器、转换器、图纸库、教程、后台、合规页面、robots 和 sitemap 的基础骨架；下一步的关键是发布足够多的高质量图纸详情页和教程页，避免站点被判断为内容不足、未完成或薄页面。

## 参考依据

本体检按 Google 官方 AdSense / Publisher 文档整理：

- Google Publisher Policies：要求遵守内容政策、行为政策、隐私相关政策，并避免版权侵权、误导性内容等问题。
- Google Required content：隐私政策需要披露 Google 和第三方广告 cookies、个性化广告用途和退出方式。
- Google Ad placement policies：广告不能诱导点击，不能靠近导航、下载、应用控件等容易误点的位置。
- Google Best practices for ad placement：广告应服务用户体验，内容要容易找到，广告和内容要容易区分。

官方链接：

- https://support.google.com/adsense/answer/10502938
- https://support.google.com/adsense/answer/1348695
- https://support.google.com/adsense/answer/1346295
- https://support.google.com/adsense/answer/1282097

## 当前通过项

| 项目 | 状态 | 说明 |
| --- | --- | --- |
| 基础页面矩阵 | 通过 | 已有首页、编辑器、转换器、图纸库、分类、图纸详情、教程列表、教程详情。 |
| 后台发布能力 | 通过 | 已有图纸、分类和教程的后台管理与发布状态。 |
| 合规页面 | 通过 | 已有 Privacy Policy、Terms、Contact、Copyright / DMCA。 |
| 隐私披露 | 通过 | 隐私页已说明浏览器端图片处理、Analytics、AdSense、cookies 和广告个性化。 |
| 后台 noindex | 通过 | `/admin` layout 设置 `robots: { index: false, follow: false }`。 |
| robots | 通过 | 已新增 `/robots.txt`，禁止 `/admin/` 和 `/uploads/`。 |
| sitemap | 通过 | 已新增 `/sitemap.xml`，包含核心页面和已发布内容。 |
| 首页公开链接 | 通过 | 首页已改为只展示已发布分类、图纸和教程，避免硬编码内容造成 404。 |
| 广告代码 | 通过 | 当前未接入广告代码，不存在误点广告位。 |

## 当前阻塞项

| 项目 | 状态 | 处理建议 |
| --- | --- | --- |
| 高质量图纸详情页数量 | 阻塞 | 上线审核前建议至少 30-50 个已发布图纸详情页。 |
| 教程数量 | 阻塞 | 上线审核前建议至少 3-5 篇已发布教程。 |
| 图纸详情页内容厚度 | 待确认 | 每个详情页应有独立英文说明、预览、尺寸、难度、颜色数量、用豆统计、制作提示和相关图纸。 |
| 内容版权 | 待确认 | 每个图纸需要明确来源：原创、授权、公共领域或可安全使用的自制图案。 |
| 下载资源 | 待确认 | 下载文件必须和页面图纸一致，不能是占位、损坏或第三方未授权资源。 |
| 站点实测索引数据 | 待确认 | 需要上线域名后接入 Search Console，再观察收录和页面质量。 |

本地没有可用的 `DATABASE_URL`，所以这次没有直接读取数据库中的已发布内容数量。上线服务器上可以用后台列表或数据库查询确认：

```sql
select count(*) from patterns where status = 'published';
select count(*) from guides where status = 'published';
select count(*) from categories where status = 'published';
```

## 页面级广告策略

第一版不要追求广告密度，优先避免误点和影响工具使用。

| 页面 | 是否放广告 | 建议 |
| --- | --- | --- |
| `/` | 暂缓 | 首页先用于分流，不急着放广告。 |
| `/editor` | 不放 | 编辑器是高频操作界面，广告容易干扰画布、工具栏和导出按钮。 |
| `/convert` | 暂缓 | 上传、生成、导出附近不放广告；流量稳定后只考虑正文说明区。 |
| `/patterns` | 可放 | 图纸列表之间可放 1 个自然广告位，但不要挤压筛选和导航。 |
| `/categories/[slug]` | 可放 | 列表中段或底部可放广告，保持与卡片和导航区分。 |
| `/pattern/[slug]` | 推荐 | 正文说明中部、制作提示之后可以放广告；不要贴近下载、Open editor 按钮。 |
| `/guides/[slug]` | 推荐 | 教程正文中段和底部可放广告，标签只用 `Advertisements` 或 `Sponsored links`。 |
| 合规页面 | 不放 | Privacy、Terms、Contact、Copyright 页面不需要广告。 |
| `/admin` | 不放 | 后台不索引、不展示 AdSense。 |

## 内容发布验收标准

每个图纸发布前至少确认：

- 标题是自然英文，不是关键词堆砌。
- slug 简短、唯一、可读。
- 有 1 张清晰预览图或可读的网格预览。
- 有尺寸、难度、颜色数量、总用豆数。
- 有 200-400 英文词的独立说明和制作提示。
- 有 SEO title 和 SEO description。
- 有明确分类。
- 下载资源可用，并且与页面内容一致。
- 图案来源安全，不使用明显未授权角色、商标、logo 或真人肖像。
- 相关图纸链接不为空，或者暂时隐藏相关区块。

每篇教程发布前至少确认：

- 有明确搜索意图，例如 `how to make a bead pattern`。
- 有独立 H1、SEO title、SEO description。
- 有步骤化正文，不只是几段泛泛介绍。
- 自然链接到 `/editor`、`/convert` 和 `/patterns`。
- 后续最好加入截图、示例图纸或操作图，降低纯文字薄页面风险。

## 上线前必做清单

- [ ] 发布 30-50 个高质量图纸详情页。
- [ ] 发布 3-5 篇教程。
- [ ] 确认首页、图库、分类页、教程页没有 404 内链。
- [ ] 确认 `/privacy`、`/terms`、`/contact`、`/copyright` 可访问。
- [ ] 确认 `/robots.txt` 可访问，并禁止后台和上传目录。
- [ ] 确认 `/sitemap.xml` 可访问，并只包含公开可索引页面。
- [ ] 接入 Search Console。
- [ ] 生产环境跑一次 `npm run build`。
- [ ] 手动检查移动端首屏，避免广告或占位挤压主要内容。
- [ ] 接入 AdSense 后，广告只先放在内容页，不放在编辑器、上传区、下载按钮旁边。

## 本次代码调整

- 首页改为读取已发布分类、图纸和教程，避免未发布示例链接造成 404。
- 新增 `/robots.txt`，禁止 `/admin/` 和 `/uploads/`。
- 新增 `/sitemap.xml`，包含核心页面和已发布内容。
- 将 `6.2 AdSense 前站点体检` 标为 `[~]`，因为技术检查已推进，但内容量尚未达标。
