# Release Checklist / 发布检查清单

## GitHub

- [ ] Update `manifest.json` version
- [ ] Update CHANGELOG / 更新更新日志
- [ ] Test the unpacked extension in Edge / 在 Edge 中测试解压缩扩展
- [ ] Test add/edit/delete/reorder shortcuts / 测试快捷方式增删改与拖动
- [ ] Test background color/image behavior / 测试背景颜色与图片
- [ ] Test import/export / 测试导入导出
- [ ] Test optional history permission / 测试可选历史权限
- [ ] Test Edge sync when applicable / 适用时测试 Edge 同步
- [ ] Create a GitHub Release
- [ ] Attach the release ZIP if desired

## Microsoft Edge Add-ons

- [ ] Build the store ZIP with `manifest.json` at the ZIP root
- [ ] Confirm version is higher than the currently published version
- [ ] Confirm privacy policy matches current behavior
- [ ] Confirm permission descriptions are accurate
- [ ] Prepare/update store screenshots and icon assets
- [ ] Submit the new package in Partner Center
