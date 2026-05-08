# 产品规划

## 产品定位

Pinbead 是一个面向英文用户的拼豆图纸工具站。

核心价值：

- Turn any image into a printable pin bead pattern.
- Browse free printable bead patterns for beginners and craft projects.
- Generate bead counts, color lists, and clean pattern previews.

建议避免把站点品牌绑定到某个商标词，例如 Perler。Perler 是具体品牌，站点主品牌更适合使用 pin bead、fuse bead、pixel bead、bead pattern 等泛化词。页面里可以表达支持 Perler、Hama、Artkal、MARD 等色卡。

## 目标用户

- Craft makers：把宠物、头像、插画转成拼豆图纸。
- Parents and teachers：寻找简单、可打印、适合课堂或亲子活动的图案。
- Hobby creators：收藏、下载、后期分享自己的像素拼豆作品。
- SEO users：通过 `image to bead pattern`、`perler bead pattern generator`、`free printable bead patterns` 等关键词进入站点。

## MVP 核心流程

### 私人生成流程

```text
Upload image
-> Crop and resize in browser
-> Pixelate image
-> Match bead palette colors
-> Preview as pixels or round beads
-> Export PNG/PDF/color list
```

默认不上传用户原图。这样可以减少存储成本、版权风险和隐私压力。

### 公开图纸库流程

```text
Curated original pattern
-> Pattern detail page
-> Preview image
-> Bead count and color list
-> Printable download
-> Related patterns
-> AdSense placement after approval
```

公开图纸库是前期 SEO 和 AdSense 的主要承载页面。

### 用户分享流程

```text
Generated pattern
-> User clicks Share
-> Login
-> Confirm ownership and public license
-> Submit to moderation queue
-> Admin approval
-> Public gallery page
```

这个流程不建议第一版上线。等站点有自然流量、有人愿意保存和分享后再做。

## 内容来源

前期公开图库的内容来源建议按优先级排序：

1. 自己原创的简单像素图纸。
2. AI 辅助生成的原创图标，再人工调整为拼豆图纸。
3. Public Domain / CC0 素材转制，并记录来源和许可证。
4. 设计师授权投稿。
5. 用户投稿，必须审核后公开。

不建议公开收录高风险 IP 内容，例如 Disney、Nintendo、Pokemon、Marvel、Sanrio、明星照片、影视剧角色、动漫角色等。

## 前期不做

流量没起来之前，以下功能可以延后：

- 用户注册、个人主页、作品流。
- 点赞、评论、关注、站内通知。
- 在线多图层高级编辑器。
- 服务器端图片处理和背景移除。
- AI 自动审核。
- 付费会员、订阅、积分系统。
- 移动 App。
- 多语言全量内容。

前期做这些会增加审核、运维和产品复杂度，但对 SEO 起量和 AdSense 审核帮助有限。

## 第一批页面建议

- `/`：首页，首屏就是工具，不做空泛营销页。
- `/image-to-bead-pattern`：图片转拼豆图纸工具页。
- `/patterns`：免费图纸库。
- `/patterns/animals`
- `/patterns/food`
- `/patterns/holidays`
- `/patterns/cute-icons`
- `/patterns/letters-numbers`
- `/guides/how-to-turn-a-photo-into-a-bead-pattern`
- `/guides/beginner-pin-bead-tips`
- `/guides/bead-color-chart`
- `/privacy-policy`
- `/terms`
- `/contact`
- `/copyright`

