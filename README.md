# jquery-ganttview-v2

**Lightweight HTML/CSS jQuery GanttView for airport resource timeline visualization.**  
**轻量级 HTML/CSS jQuery 甘特图 / 机场资源时间轴控件。**

This project is based on an old jQuery GanttView-style HTML implementation. It keeps the original lightweight idea, but has been refactored and enhanced for practical airport resource display scenarios such as gates, check-in counters, baggage belts, boarding gates, ground handling tasks and other time-based resource usage views.

本项目源自较早期的 jQuery GanttView 风格 HTML 实现。当前版本保留了“完全用 HTML/CSS 表达甘特图”的轻量思路，并围绕机场资源展示场景做了大量修复与增强，可用于机位、值机柜台、行李转盘、登机口、保障任务等资源占用时间轴展示。

> Scope boundary / 边界说明：this is a **timeline display and light adjustment control**, not a full resource scheduling engine.  
> 本控件负责资源占用展示、当前时间定位、冲突提示和轻量调整；不承担机位分配、柜台优化、行李转盘自动调度等复杂业务规则。

---

## Why this control / 设计价值

Many modern Gantt controls are SVG/Canvas based and relatively heavy. This control intentionally stays with HTML/CSS DOM elements so it can be embedded easily into legacy systems, jQuery pages, airport operation dashboards and mixed front-end/back-end applications.

很多现代甘特图采用 SVG/Canvas，功能强但也更重。本控件坚持 HTML/CSS DOM 实现，优点是轻量、易嵌入、易改样式、易绑定业务事件，特别适合机场老系统、运行看板和资源占用展示页面。

Key airport-oriented changes include:

- `hour` view mode, in addition to the old `day/month` style timeline idea;
- a three-level data model: `Categories -> Series -> Tasks`;
- multi-instance isolation on the same page;
- current-time navigation;
- horizontal time move, vertical resource move and resize;
- optional prompt for exact time after horizontal drag;
- conflict highlighting;
- planned / estimated / actual time fields;
- multi-language UI text.

---

## Requirements / 运行要求

- jQuery 3.x+
- jQuery UI 1.13.x+
- Modern Chrome / Edge / Firefox

No SVG/Canvas framework is required.

---

## Quick start / 快速使用

```html
<link rel="stylesheet" href="lib/jquery-ui-1.13.0.css">
<link rel="stylesheet" href="gantt-view-v2.css">

<div id="ganttChart"></div>

<script src="example/js/jquery.min.js"></script>
<script src="lib/jquery-ui-1.13.0.js"></script>
<script src="gantt-view-v2.js"></script>
```

```js
var ganttData = [{
  cId: 'gate-area-a',
  cName: 'Gate Area A',
  resourceType: 'gate',
  series: [{
    sId: 'A01',
    sName: 'A01',
    tasks: [{
      tId: 'MU5101',
      tName: 'MU5101',
      plannedStart: '2026/06/25 08:20',
      plannedEnd: '2026/06/25 10:10',
      estimatedStart: '2026/06/25 08:35',
      estimatedEnd: '2026/06/25 10:25',
      status: 'delayed',
      bufferBeforeMinutes: 10,
      bufferAfterMinutes: 15,
      isTask: true
    }]
  }]
}];

var gantt = $('#ganttChart').ganttView(ganttData, {
  locale: 'en-US',
  viewMode: 'hour',
  multiGantt: true,
  showNowTimeline: true,
  scrollToNowOnLoad: true,
  nowViewportPosition: 'center',
  highlightConflicts: true,
  allowTimeMove: true,
  allowResourceMove: true,
  allowTimeResize: true,
  allowCrossRowTimeMove: true,
  promptTimeOnHorizontalMove: true,
  timeSnapMinutes: 15,
  vtHeaderName: 'Gate',
  vtHeaderSubName: 'Flight'
});
```

---

## Core data model / 核心数据模型

The project uses a three-level model:

```text
Categories -> Series -> Tasks
```

Airport mapping example:

```text
Category = resource group / terminal area / resource type
Series   = resource row / gate / counter group / baggage belt
Task     = flight occupation / service window / handling job
```

Example:

```js
{
  cId: 'checkin-zone-c',
  cName: 'Check-in Zone C',
  resourceType: 'checkin',
  series: [{
    sId: 'C01-C04',
    sName: 'C01-C04',
    tasks: [{
      tId: 'CA-OPEN-001',
      tName: 'CA Counter Open',
      start: '2026/06/25 06:00',
      end: '2026/06/25 10:30',
      status: 'active',
      isTask: true
    }]
  }]
}
```

More details: [docs/DATA_MODEL.md](docs/DATA_MODEL.md)

---

## Main options / 常用配置

```js
{
  locale: 'zh-CN',                 // zh-CN / en-US / fr-FR / de-DE / th-TH
  viewMode: 'hour',                // hour / day / month-like legacy usage
  multiGantt: true,

  showNowTimeline: true,
  scrollToNowOnLoad: true,
  nowViewportPosition: 'center',

  visibleStart: null,
  visibleEnd: null,
  timeFieldMode: 'auto',           // auto / start / planned / estimated / actual
  useBufferTime: true,
  minBlockWidth: 4,

  allowTimeMove: true,
  allowResourceMove: true,
  allowTimeResize: true,
  allowCrossRowTimeMove: true,
  promptTimeOnHorizontalMove: true,
  timeSnapMinutes: 15,

  highlightConflicts: true,
  conflictColor: 'rgba(220, 53, 69, .92)',

  showLegend: true,
  showTimeLayers: false,
  timeLayers: ['planned', 'estimated', 'actual'],

  rowWindowStart: 0,
  rowWindowSize: null,

  vtHeaderName: '名称',
  vtHeaderSubName: '任务'
}
```

Full API: [docs/API.md](docs/API.md)

---

## Public APIs / 常用 API

```js
gantt.ganttView.gotoNow('center');
gantt.ganttView.gotoDate(new Date(), 'center');
gantt.ganttView.gotoTask(cId, sId, tId, 'center');

gantt.ganttView.setVisibleWindow(start, end, true);
gantt.ganttView.setRollingWindow(2, 10, true);

gantt.ganttView.setRowWindow(0, 20, true);
gantt.ganttView.clearRowWindow(true);

gantt.ganttView.updateTaskTime(cId, sId, tId, start, end, { status: 'delayed' });
gantt.ganttView.setLocale('fr-FR', true);
gantt.ganttView.reloadGantts(null, { preserveScrollOnReload: true });
```

---

## Internationalization / 多语种

Built-in locales:

```text
zh-CN, en-US, fr-FR, de-DE, th-TH
```

Runtime switch:

```js
gantt.ganttView.setLocale('de-DE', true);
```

Custom language pack:

```js
$.fn.ganttView.addLanguage('es-ES', {
  text: {
    legendResource: 'Recurso',
    legendStatus: 'Estado',
    legendTime: 'Tiempo'
  },
  labels: {
    statuses: { planned: 'Planificado', delayed: 'Retrasado' }
  }
});
```

More details: [docs/I18N.md](docs/I18N.md)

---

## Examples / 示例

Open these files directly in a browser:

- `example/index.html` — legacy day/hour examples with current-time buttons and locale selector.
- `example/index2.html` — multi-task example with locale selector.
- `example/airport-resources.html` — airport resource timeline demo: gates, check-in counters, belts, conflicts, time layers, row window and rolling window.
- `example/i18n.html` — focused i18n switching demo.

More details: [docs/EXAMPLES.md](docs/EXAMPLES.md)

---

## Project structure / 项目结构

```text
gantt-view-v2.js           Core plugin / 控件核心
gantt-view-v2.css          Core styles / 控件样式
lib/                       jQuery UI dependency used by examples
example/                   Runnable demo pages
docs/                      API, data model, i18n and airport usage docs
dist/                      Same JS/CSS copy for release packaging
CHANGELOG.md               Version history
VERSION                    Current version marker
```

---

## Version / 当前整理版本

Current cleanup version:

```text
v0.6.7-airport-resource-timeline-docs
```

This release mainly organizes README, examples, API documentation and GitHub-facing package structure. It does not intentionally change runtime behavior from v0.6.6 i18n.

---

## License / 许可

The original jQuery GanttView-style code declares MIT License. This project keeps the same license file in the repository.

