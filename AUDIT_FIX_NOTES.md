# v0.6.6 多语种增强说明

本版本在 v0.6.5 的基础上增加多语种能力，目标是让控件可以继续保持轻量，同时适合机场行业项目中的中文、英文、法文、德文、泰文等多语种页面。

## 新增能力

### 1. 新增 locale 配置

```js
$('#ganttChart').ganttView(data, {
  locale: 'zh-CN' // zh-CN / en-US / fr-FR / de-DE / th-TH
});
```

支持别名：`zh`、`en`、`fr`、`de`、`th` 等。

### 2. 内置五种语言

- `zh-CN`：中文
- `en-US`：英文
- `fr-FR`：法文
- `de-DE`：德文
- `th-TH`：泰文

覆盖内容包括：

- 月份、星期、季度；
- 默认表头：Name / Task 等；
- 自动图例：资源、状态、时间；
- 行窗口信息；
- 任务条横向拖动后的时间输入 prompt；
- duration 文本：分钟 / 小时 / 天；
- resourceType / status / timeSource 枚举标签。

### 3. 增加运行时切换语言

```js
gantt.ganttView.setLocale('en-US', true);
```

第二个参数控制是否保持当前横向视口；默认保持。

如果页面中有业务自定义表头，例如“机位 / 航班”，建议用 reloadGantts 同时传入：

```js
gantt.ganttView.reloadGantts(null, {
  locale: 'en-US',
  vtHeaderName: 'Gate',
  vtHeaderSubName: 'Flight',
  preserveScrollOnReload: true
});
```

### 4. 支持项目自定义语言包

```js
$.fn.ganttView.addLanguage('es-ES', {
  calendar: {
    monthNameShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    dayOfWeekNames: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  },
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

也可以在单个控件实例中传入 `i18n` 覆盖内置翻译。

## 示例更新

更新/新增：

- `example/index.html`：增加语种切换下拉框；
- `example/index2.html`：增加语种切换下拉框；
- `example/airport-resources.html`：增加语种切换下拉框；
- `example/i18n.html`：新增独立多语种示例。

## 边界说明

控件本身会本地化控件内置文本、时间标题、图例和 prompt。业务数据中的 `cName / sName / tName` 不会被自动翻译，因为它们属于业务数据，例如航班号、资源名、航空公司名。若需要翻译业务字段，应由业务系统提供对应语种的数据。

## 检查结果

- `node --check gantt-view-v2.js` 通过。
- ZIP 完整性检查通过。
