<p align="center">
  <img src="assets/icons/logo.png" width="160" alt="Minimal New Tab Logo">
</p>

<h1 align="center">Minimal New Tab</h1>

<p align="center">
  一个本地优先、极简且可自定义的 Microsoft Edge 新标签页扩展。
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

Minimal New Tab 是一个以本地优先为核心的 Microsoft Edge 新标签页扩展，目标是提供干净、可控、不会自动塞入资讯或推荐内容的新标签页。

> **源码公开，禁止商业使用。** 个人使用、学习、修改及非商业分发均可依据 PolyForm Noncommercial License 1.0.0 进行；商业使用需要获得作者单独授权。

## 功能

- 自行添加、编辑、删除快捷方式，并支持拖动排序。
- 可选择 1–3 行快捷方式，每行最多 8 个。
- 提供“大 / 小”两种快捷方式布局尺寸。
- 使用 Chromium 内建 favicon 机制显示网站图标，不调用第三方 favicon 服务。
- 可选半透明图标方框，在复杂背景下提高辨识度。
- 6 个可编辑纯色预设位 + 自定义调色盘。
- 支持本地自定义背景图片。
- 搜索框获得焦点时，背景图片会轻微变暗并毛玻璃化。
- 搜索框支持“窄 / 中 / 宽”三种宽度。
- 支持 Bing / Google / 百度。
- 可选本地浏览历史建议，并可设置建议条数。
- 支持 JSON 导入 / 导出完整备份，其中可包含本地背景图片。
- 可选 Edge 账户同步，用于同步快捷方式和普通设置。

## 隐私设计

Minimal New Tab 不包含广告、第三方分析，也没有作者自建遥测服务器。

可选的 `history` 权限只会在用户主动开启“浏览历史智能建议”后申请。历史记录仅在本机查询，用于生成建议，不会发送到作者自建服务器。

自定义背景图片始终保存在当前设备本机。Edge 同步通过浏览器提供的 `chrome.storage.sync` 完成，不同步背景图片，也不同步浏览器权限授权。

完整说明请查看 [PRIVACY.zh-CN.md](PRIVACY.zh-CN.md)。

## 会同步的设置

开启扩展内的 Edge 账户同步后，同一扩展在不同设备间可以同步：

- 快捷方式、网址和排序
- 快捷方式行数
- 快捷方式尺寸
- 搜索引擎
- 搜索框宽度
- 自动聚焦设置
- favicon 显示设置
- 图标半透明方框设置
- 当前纯色背景
- 6 个颜色储存位及当前选中位置
- 历史建议开关偏好
- 历史建议条数

不会同步：

- 实际的自定义背景图片
- `history` 等浏览器权限授权

如果“历史建议开启”的偏好同步到另一台设备，仍然需要用户在那台设备上单独授权 `history` 权限。

## 安装

### Microsoft Edge Add-ons

正式上架后，会在这里补充商店链接。

### 开发人员模式

1. 下载或 Clone 本仓库。
2. 打开 `edge://extensions`。
3. 开启 **开发人员模式**。
4. 点击 **加载解压缩的扩展**。
5. 选择包含 `manifest.json` 的项目文件夹。

## 更新开发人员模式版本

为了让本机 unpacked 扩展继续使用原有本地身份，建议一直使用同一个扩展文件夹。

1. 用新版本覆盖运行文件。
2. 打开 `edge://extensions`。
3. 找到 Minimal New Tab，点击 **重新加载**。

## 权限说明

必需权限：

- `favicon` —— 使用 Chromium 内建机制显示网站图标。
- `storage` —— 保存配置，并支持浏览器提供的同步存储。

可选权限：

- `history` —— 只有用户主动开启本地浏览历史建议时才申请。

扩展不会申请大范围网站访问权限。

## 导入与导出

内置 JSON 备份可用于手动迁移和完整备份。与账户同步不同，导出文件可以包含用户本地选择的背景图片。

## 仓库结构

```text
.
├── manifest.json
├── newtab.html
├── style.css
├── script.js
├── README.md
├── README.zh-CN.md
├── PRIVACY.md
├── PRIVACY.zh-CN.md
├── CHANGELOG.md
├── CHANGELOG.zh-CN.md
├── CONTRIBUTING.md
├── CONTRIBUTING.zh-CN.md
├── SECURITY.md
├── LICENSE
├── NOTICE
└── assets/
```

## 参与贡献

欢迎非商业性质的贡献。提交 Pull Request 前请先阅读 [CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md)。

## 许可证

本项目属于 **source-available（源码公开）**，不是 OSI 定义下的开源软件。

项目采用 [PolyForm Noncommercial License 1.0.0](LICENSE)。

允许的典型用途包括：个人使用、学习、实验、修改、爱好项目，以及非商业分发。商业使用、销售、收费分发，或将本项目作为商业产品 / 服务的一部分使用，需要获得作者单独授权。

Required Notice：

> Copyright © 2026 Haowei Wang

具有法律效力的完整条款以英文 [LICENSE](LICENSE) 为准。
