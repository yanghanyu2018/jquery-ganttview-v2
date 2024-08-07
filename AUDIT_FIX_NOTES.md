# jquery-ganttview-v2 audit fix notes

本修复版基于上传包做最小化修复，目标是保持轻量级控件定位，同时解决机场资源进度显示中会高频触发的问题。

## 已修复重点

1. 空资源显示：全部资源为空、某些资源无任务时，不再因为 `minStart/maxEnd` 为空而报错。
2. series 直接显示：`series` 自身包含 `start/end` 时，即使未设置 `isTask` 也会作为只显示条渲染；`isTask` 仅表示是否为可拖拽任务。
3. 子任务数据：`series.tasks` 不再依赖父级 `series.start/end` 才初始化，适合机场资源行 + 多任务条的数据模型。
4. dataUrl：异步 JSON 加载完成后再初始化和渲染。
5. 动态新增：`addGantt()` 后统一刷新，确保新增行、块、点击、拖拽、缩放行为一致。
6. 动态删除：修复 `deleteGantt()` 调用不存在的 `chart.findSerie()` 问题，并支持按选中块或 `cId/sId/tId` 删除。
7. 多图隔离：多个甘特图同时在一个页面时，关键选择器限定在当前控件容器内。
8. 冲突检查：实现同一序列内基础时间重叠检测，重叠块增加 `ganttview-block-conflict`。
9. 日期显示：控件内部 tooltip 不再依赖 example 中扩展的 `Date.prototype.format`。
10. DateUtils：修复 `math.round`、`this.options.weekStart`、星期全称、hour 标题“月月”等问题。

## 仍建议后续处理

1. DOM ID 最好加入实例前缀，例如 `gv-{instanceId}-block-{tId}`，彻底避免多图同 ID。
2. airport 场景应增加资源类型字段，例如 `resourceType: gate/checkin/belt`，由样式层决定颜色和图标。
3. 如果 day 模式用于“整日占用”，冲突判断可改为 end-inclusive；如果用于机场实际时间，应保持当前 half-open `[start, end)` 判断。
4. 建议新增自动化测试：空资源、series-only、tasks-without-parent-start、两个图同 sId/tId、add/delete、hour 模式、冲突检测。
