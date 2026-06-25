# API Reference / API 说明

This document summarizes the main configuration options and public methods of `jquery-ganttview-v2`.

## Initialization

```js
var gantt = $('#ganttChart').ganttView(ganttData, options);
```

The returned jQuery object has a `ganttView` property:

```js
gantt.ganttView.gotoNow('center');
```

## Main options

### Locale and text

```js
locale: 'zh-CN',
i18n: null,
localizeDataLabels: true,
vtHeaderName: '名称',
vtHeaderSubName: '任务'
```

### View mode

```js
viewMode: 'hour', // hour / day / legacy month-style usage
multiGantt: true
```

`hour` mode is important for airport operations because many resources are managed by hour/minute windows rather than by day.

### Current time and visible window

```js
showNowTimeline: true,
scrollToNowOnLoad: true,
nowViewportPosition: 'center',
visibleStart: null,
visibleEnd: null
```

`visibleStart/visibleEnd` are useful for daily operation windows, shifts and rolling windows.

### Time source

```js
timeFieldMode: 'auto', // auto / start / planned / estimated / actual
useBufferTime: true,
minBlockWidth: 4
```

### Drag, drop and resize

```js
allowTimeMove: true,
allowResourceMove: true,
allowTimeResize: true,
allowCrossRowTimeMove: true,
promptTimeOnHorizontalMove: true,
timeMovePromptEnabledForHour: true,
timeMovePromptEnabledForDay: true,
timeMovePromptAllowCancelAsDefault: true,
timeSnapMinutes: 15
```

Recommended airport behavior:

```text
Drag horizontally -> align to time grid -> optionally enter exact time.
Drag vertically   -> change resource row.
Resize edge       -> adjust start/end time.
```

### Conflict and status

```js
highlightConflicts: true,
conflictColor: 'rgba(220, 53, 69, .92)',
statusClasses: true
```

### Layers and row window

```js
showLegend: true,
showTimeLayers: false,
timeLayers: ['planned', 'estimated', 'actual'],
editableTimeSource: null,
rowWindowStart: 0,
rowWindowSize: null,
showRowWindowInfo: true
```

Row window is a lightweight way to display large resource lists without rendering every row at once.

## Public methods

### Reload

```js
gantt.ganttView.reloadGantts(data, options);
```

- `data`: optional new dataset.
- `options`: optional option patch.

Example:

```js
gantt.ganttView.reloadGantts(null, {
  preserveScrollOnReload: true
});
```

### Current time navigation

```js
gantt.ganttView.gotoNow('center');
```

Position can be:

```text
center, left, right
```

### Date navigation

```js
gantt.ganttView.gotoDate(new Date('2026/06/25 10:00'), 'center');
```

### Task navigation

```js
gantt.ganttView.gotoTask(cId, sId, tId, 'center');
```

Useful for locating the resource block from a flight list.

### Visible window

```js
gantt.ganttView.setVisibleWindow(start, end, preserveScroll);
```

Example:

```js
gantt.ganttView.setVisibleWindow('2026/06/25 00:00', '2026/06/25 23:59', false);
```

### Rolling operation window

```js
gantt.ganttView.setRollingWindow(hoursBefore, hoursAfter, preserveScroll);
```

Example:

```js
gantt.ganttView.setRollingWindow(2, 10, false);
```

This displays a window from now - 2 hours to now + 10 hours.

### Row window

```js
gantt.ganttView.setRowWindow(0, 20, true);
gantt.ganttView.clearRowWindow(true);
```

### Update task time

```js
gantt.ganttView.updateTaskTime(cId, sId, tId, start, end, extra);
```

Example:

```js
gantt.ganttView.updateTaskTime('gate-area-a', 'A01', 'MU5101',
  '2026/06/25 09:00',
  '2026/06/25 10:40',
  { status: 'delayed' }
);
```

### Locale switch

```js
gantt.ganttView.setLocale('fr-FR', true);
```

### Data modification helpers

The control also exposes basic helpers:

```js
findCategory(cId)
addCategory(cId, cName)
deleteCategory(cId)

findSerie(cId, sId)
addSerie(category, serie)
deleteSerie(category, serie)

findTask(cId, sId, tId)
addTask(category, serie, task)
deleteTask(category, serie, task)

addGantt(cId, sId, title, start, end, tip, options)
deleteGantt(cId, sId, tId)
```

For project code, prefer updating your own data source first, then call `reloadGantts()`. Use the helper methods for small local interactions or examples.

## Event callbacks

```js
behavior: {
  clickable: true,
  draggable: true,
  resizable: true,
  onClick: function (data) {},
  onDrag: function (data) {},
  onResize: function (data) {}
}
```

Callback payloads are generated from the selected block/task and should be treated as UI interaction results. Persisting changes to a backend should be handled by application code.
