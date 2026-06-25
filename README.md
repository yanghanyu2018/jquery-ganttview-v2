# jquery-ganttview-v2

**基于jQuery的甘特图（GanttView based on jQuery)。**  

## 技术要求  

1. jQuery 3.0+;
2. jQuery-ui-1.8+;
3. 高版本的google chrome, firefox, opera, Microsoft edge 

## 软件示例截图

1. 一行显示一条
![](https://github.com/yanghanyu2018/jquery-ganttview-v2/blob/main/example/截图1.png)

2. 一行显示多条
![](https://github.com/yanghanyu2018/jquery-ganttview-v2/blob/main/example/截图2.png)

3. 多种模式：day模式+hour模式
![](https://github.com/yanghanyu2018/jquery-ganttview-v2/blob/main/example/截图3.png)


## 如何使用
在html中，设置`<div>`


	<html>
	...
    <body>
    	...
		<div id="ganttChart"></div>
	</body>
	...
	</html>



在`<script>`中设置


  	var ganttData = [
		// 按数据格式设置数据
	];

	var gantt = $("#ganttChart").ganttView(ganttData, {
		locale: 'zh-CN',              // 多语种：zh-CN / en-US / fr-FR / de-DE / th-TH
		viewMode: 'day',
		showWeekends: true,
		showNowTimeline: true,
		scrollToNowOnLoad: true,
		nowViewportPosition: 'center',
		highlightConflicts: true,
		preserveScrollOnReload: false,
		allowTimeMove: true,           // 允许左右拖动任务条，动态调整开始/结束时间
		allowResourceMove: true,       // 允许上下拖动任务条，切换资源行
		allowTimeResize: true,         // 允许拖动左右边缘缩放任务时间
		allowCrossRowTimeMove: true,   // 跨资源行拖动时，同时保留横向时间变化
		conflictColor: 'rgba(220, 53, 69, .92)', // 冲突高亮颜色，覆盖自定义任务颜色
		timeSnapMinutes: 15,           // hour模式时间吸附粒度，常用 5/10/15/30 分钟
		promptTimeOnHorizontalMove: true, // 横向拖动后弹出时间输入框；留空则按拖动位置对齐
		timeMovePromptEnabledForHour: true, // hour模式启用横向拖动时间输入
		timeMovePromptEnabledForDay: true,  // day模式启用横向拖动时间输入
		visibleStart: new Date(),       // 可选：固定显示窗口开始
		visibleEnd: new Date(),         // 可选：固定显示窗口结束
		timeFieldMode: 'auto',          // auto/start/planned/estimated/actual
		useBufferTime: true,            // 使用 bufferBeforeMinutes/bufferAfterMinutes 扩展占用显示
		minBlockWidth: 8,               // 短任务最小显示宽度
		statusClasses: true,            // 根据 task.status 增加状态样式
		showLegend: true,              // 显示资源/状态/时间来源图例
		showTimeLayers: false,         // 同一任务显示 planned/estimated/actual 多层时间条
		timeLayers: ['planned', 'estimated', 'actual'],
		rowWindowStart: 0,             // 大资源量时的行窗口起始行
		rowWindowSize: null,           // 大资源量时的行窗口大小，null表示全部渲染
		multiGantt: true,
		vtHeaderName: "机位",
		vtHeaderSubName: "航班",
		gridHoverV: true,
		gridHoverH: false,
		behavior: {
			clickable: true,
			draggable: true,
			resizable: true,
			onClick: function (data) {
				// var msg = "click事件:" + JSON.stringify(data);
				// console.log(msg);
			},
			onResize: function (data) {
				// var msg = "resize事件:" + JSON.stringify(data);
				// console.log(msg);
			},
			onDrag: function (data) {
				// var msg = "drag事件:" + JSON.stringify(data);
				// console.log(msg);
			}
		}
	});

	function refreshMyGanttChart() {
		gantt.ganttView.reloadGantts();
	}


## 新增机场资源示例

本版本新增：

```text
example/airport-resources.html
```

该示例使用当前日期动态生成机位、值机柜台、行李转盘资源数据，用于验证资源类型语义、任务状态样式、计划/预计/实际时间字段、多层时间条、图例、缓冲时间、短任务最小宽度、当前时间定位、滚动时间窗口、行窗口裁剪、空资源、冲突高亮和同页多甘特图隔离。

## 数据格式

data的格式如下：



	var ganttData = [
       {
        cId: 2, cName: "资源A", series: [
            {
                sId: 1,
                sName: "任务1",
                start: '2018/01/05', // 总任务开始，时间格式
                end: '2018/01/20',   // 总任务结束，时间格式
                isTask: true,        // 是否任务，如果是任务的话，则可以拖拽
                tasks: [ // 任务集，如果没有此项，则认为这不是多个任务。
                    {
                        tId: 11,           // 子任务id
                        sId: 1,           // 应与上级sId相同
                        tName: "任务1-1",
                        start: '2018/01/05', // 时间格式
                        end: '2018/01/20',   // 时间格式
                        isTask: true,        // 是否是任务
                        options:{ // 为这条任务的配置
                            resizable?:boolean, // default:true
                            draggable?:boolean, // default:true
                            color?: string
                        }
                    },
                    // 其它子任务
                    ...
                ],
                options:{ // 如果使用此总bar，则以下有效
                    resizable?:boolean, // default:true
                    draggable?:boolean, // default:true
                    color?: string
                }
             },
            // 任务2
             ...
        	]
    	},
		...
		// 下一条category
	]


## 机场资源增强字段

本控件仍保持轻量定位，不做资源调度，只增强显示和轻量调整能力。机场资源数据可以继续使用原来的 `start/end`，也可以使用更贴近运行系统的数据字段：

```js
{
    cId: 'GATE-A01',
    cName: 'A01',
    resourceType: 'gate',        // gate/checkin/belt/stand/bus/crew/maintenance 等
    series: [{
        sId: 'plan',
        sName: '计划',
        tasks: [{
            tId: 'MU5101',
            tName: 'MU5101',
            plannedStart: '2026/06/25 08:20',
            plannedEnd: '2026/06/25 10:10',
            estimatedStart: '2026/06/25 08:35',
            estimatedEnd: '2026/06/25 10:25',
            actualStart: null,
            actualEnd: null,
            status: 'delayed',           // planned/active/estimated/delayed/completed/cancelled/maintenance
            bufferBeforeMinutes: 10,     // 可选：前置缓冲
            bufferAfterMinutes: 15       // 可选：后置缓冲
        }]
    }]
}
```

新增配置：

```js
{
    visibleStart: '2026/06/25 00:00',  // 固定显示窗口开始；适合当日/班次/滚动窗口
    visibleEnd: '2026/06/25 23:59',    // 固定显示窗口结束；窗口外任务不渲染，跨窗口任务会裁剪显示
    timeFieldMode: 'auto',             // auto/start/planned/estimated/actual
    useBufferTime: true,               // 任务显示范围是否包含 bufferBeforeMinutes/bufferAfterMinutes
    minBlockWidth: 8,                  // 小时模式下 5/10/15 分钟短任务仍可见
    statusClasses: true,               // 自动添加 ganttview-status-* 状态样式
    allowTimeMove: true,             // 左右拖动调整时间
    allowResourceMove: true,         // 上下拖动切换资源
    allowTimeResize: true,           // 左右边缘缩放调整时间
    allowCrossRowTimeMove: true,      // 跨行拖动时同时调整资源和时间；false则只换资源
    conflictColor: 'rgba(220, 53, 69, .92)', // 冲突颜色，优先于 options.color
    timeSnapMinutes: 15,             // 小时模式下按15分钟吸附
    promptTimeOnHorizontalMove: true,// 横向拖动后弹出时间输入框；留空则按默认日期/时间格对齐
    timeMovePromptEnabledForHour: true,
    timeMovePromptEnabledForDay: true
}
```

交互说明：

```text
左右拖动：整体平移任务时间，保持时长不变；默认会弹出时间输入框，用于输入精确开始/结束时间。
拖动左右边缘：动态调整开始或结束时间。
上下拖动：切换资源行，例如从 A01 机位移到 A02 机位。
跨行拖动：默认同时保留横向时间变化，即一次完成“换资源 + 改时间”；设置 allowCrossRowTimeMove:false 时只换资源不改时间。
hour 模式按 timeSnapMinutes 吸附；day 模式按天吸附。弹框留空时，按拖动后的日期/时间格默认对齐；输入 `09:15-10:30` 时，使用用户输入的精确时间。
```

新增 API：

```js
gantt.ganttView.gotoTask(cId, sId, tId, 'center');
gantt.ganttView.setVisibleWindow(start, end, preserveScroll);
gantt.ganttView.updateTaskTime(cId, sId, tId, start, end, { status: 'delayed' });
```

## 修改说明  





### v0.6.0-airport-resource-timeline, 时间：2026.06.25

主要修改：

1. 解除 hour 模式只能上下拖动的限制，支持任务条左右拖动以动态调整开始/结束时间。
2. hour 模式支持左右边缘缩放，适合机场资源占用时间的快速微调。
3. 新增 `allowTimeMove / allowResourceMove / allowTimeResize / timeSnapMinutes` 配置，可分别控制横向调时、纵向换资源、边缘缩放和时间吸附粒度。
4. 拖动/缩放后会同步更新原始 task 对象，并根据 `_timeSource` 同步 `plannedStart/plannedEnd`、`estimatedStart/estimatedEnd` 或 `actualStart/actualEnd`。
5. 修正同一资源行内拖动被 droppable 误判为 `_noChange` 的问题，确保左右拖动能够正常触发时间更新。
6. 修正跨资源拖动时任务定位索引不精确的问题，降低同一资源多任务场景中移动错任务的风险。
7. 为 blocks 容器补齐横向宽度，提升左右拖动和缩放的边界稳定性。

### v0.5.0-airport-resource-timeline, 时间：2026.06.25

主要修改：

1. 新增 `showLegend`，自动生成资源类型、任务状态、时间来源图例，减少业务页面重复手工维护图例。
2. 新增 `showTimeLayers` 与 `timeLayers`，支持同一任务同时显示 `planned / estimated / actual` 三层时间条，用于计划、预计、实际占用对比。
3. 新增 `rowWindowStart / rowWindowSize`，提供轻量级行窗口裁剪。大资源量页面可先渲染一部分资源行，避免一次性渲染全部 DOM。
4. 新增 `setRowWindow(rowStart, rowSize, preserveScroll)` 与 `clearRowWindow(preserveScroll)` API，用于切换资源行窗口。
5. 新增 `setRollingWindow(hoursBefore, hoursAfter, preserveScroll)` API，用于机场运行常见的“当前前 N 小时 + 后 M 小时”滚动窗口。
6. 多层时间条默认只允许主时间层编辑，非主层作为显示层，避免计划/预计/实际被误拖动。
7. 更新 `example/airport-resources.html`，加入行窗口、多层时间条、滚动窗口、更多机位资源行验证。

新增 API 示例：

```js
// 显示当前前2小时、后10小时窗口
gantt.ganttView.setRollingWindow(2, 10, false);

// 仅渲染第1-20行资源
gantt.ganttView.setRowWindow(0, 20, true);

// 恢复全部资源行
gantt.ganttView.clearRowWindow(true);
```

### v0.4.0-airport-resource-timeline, 时间：2026.06.25

主要修改：

1. 强化机场资源语义：支持 `resourceType`，并在 DOM 上增加 `ganttview-resource-*` 和 `data-resource-type`，便于区分机位、柜台、转盘等资源。
2. 增加任务状态样式：支持 `status/state/flightStatus`，自动生成 `ganttview-status-*`，内置 planned/active/estimated/delayed/completed/cancelled/maintenance 等基础样式。
3. 兼容机场运行时间字段：支持 `plannedStart/plannedEnd`、`estimatedStart/estimatedEnd`、`actualStart/actualEnd`，通过 `timeFieldMode` 控制采用哪组时间。
4. 增加固定时间窗口 `visibleStart/visibleEnd`：适合机场当日、班次、滚动窗口显示；窗口外任务不渲染，跨窗口任务会裁剪显示。
5. 增加缓冲时间显示：`bufferBeforeMinutes/bufferAfterMinutes` 可扩展资源占用范围，用于机位清洁、拖车、柜台准备等前后缓冲。
6. 增加短任务最小宽度 `minBlockWidth`，提升小时视图下 5/10/15 分钟任务的可见性。
7. 增加 `gotoTask()`、`setVisibleWindow()`、`updateTaskTime()` API，便于机场页面从航班列表、资源列表、告警列表直接联动甘特图。
8. 更新 `example/airport-resources.html`，覆盖资源类型、任务状态、计划/预计/实际时间、缓冲、短任务、窗口裁剪和定位 API。

### v0.3.5-airport-processing-opt, 时间：2026.06.25

主要修改：

1. 增加 DOM 实例隔离：内部 DOM id 自动带实例前缀，并增加 `data-cid/data-sid/data-tid`，降低同页多个甘特图、相同资源ID/任务ID互相影响的风险。
2. 优化日期计算：`DateUtils.daysBetween()` 从逐日循环改为按自然日时间戳直接计算，长时间窗口下性能更稳定，并修复 day 模式条形 offset 可能提前一天的问题。
3. 优化冲突识别：同一资源/序列内冲突从“每个任务重复扫描”改为排序后批量计算，适合机场机位、柜台、行李转盘大量任务显示。
4. 增加 `highlightConflicts` 配置，可关闭同资源时间重叠高亮。
5. 增加 `preserveScrollOnReload` 配置，刷新时可保持当前横向视口，避免操作后回跳。
6. 增加 `gotoDate(date, position)`，除 `gotoNow()` 外，也可直接定位到指定航班/资源时间点。
7. 修复拖拽/缩放后只修改 block-data、未同步回原始 task 对象的问题，保证回调、刷新、冲突判断使用同一份数据。
8. 增强日期输入处理：无效日期不参与渲染，开始/结束时间反向时自动纠正顺序。

### v0.3.4-auditfix, 时间：2026.06.25

主要修改：

1. 新增 `scrollToNowOnLoad: true`，加载或刷新后直接把甘特图横向视口定位到当前时间点。
2. 新增 `nowViewportPosition: 'center'`，可配置当前时间点显示在视口 center/left/right。
3. `gotoNow()` 改为设置控件内部 `.ganttview-slide-container` 的 `scrollLeft`，不再使用 `scrollIntoView()`，避免页面整体滚动跳转。

### v0.3.3-auditfix, 时间：2026.06.25

主要修改：

1. 修复空资源数据导致时间边界为空时报错的问题。
2. 修复 series 自身有 start/end 但未设置 isTask 时不显示的问题。
3. 修复 dataUrl 异步加载在数据返回前提前渲染的问题。
4. 修复动态 add/delete 后 DOM 行、事件绑定、数据状态不同步的问题。
5. 修复多个甘特图同时存在时部分选择器未限定在当前控件内的问题。
6. 增加同一资源/序列内任务时间冲突的基础检查。
7. 去除主控件对 example/js/dateTime.js 中 Date.prototype.format 的隐式依赖。


### v0.3.2, 时间：2024.08.08


主要修改：

1. 修改了bugs
2. 修改了部分处理逻辑


### v0.3.0, 时间：2024.01.20  


  主要修改：  

1. 增加了hour模式。
2. 在一个页面可以显示多个甘特图。
3. 两个gantt图之间完全独立。


### v0.2.0, 时间：2024.01.19  

  这个版本就是面向实际项目的 α 版本。  

  目前，支持三级模式。我们把三级模式定义为：categories(分类), series(序列）、tasks(任务)，标识分别用cId/cName,sId/sName,tId/tName表示。   

  主要修改：  

1. 重新写了ganttView的数据结构。
2. 在加载时，把数据和options区分开来。
3. 增加了拖拽功能。
4. 增加了对于多任务模式的支持。
5. 增加了对甘特图的刷新。
6. 对css进行了部分增加。



### v0.1.0, 时间：2024.01.16  

  基于网上的ganttView进行修改。可以作为一个简单的版本进行学习。  

  主要原因是：网上发现的几个gantt图工具，都太复杂。比较中意这ganttView，但原来版本是14年前的东西（估计那个时候还在兼容IE6），现在已经不支持高版本的jquery和jquery-ui，无法在现在的工程项目中使用。

  ganttView是一个非常轻量级的甘特图程序，但在网上找了几个版本，要么非常复杂，要么错误百出。于是下决心在原ganttView基础上重新整理一个新的版本，并在原版本上增加了一些功能。


1. 目前的版本，仅支持day的方式显示，后续会修改。
2. 准备在此基础上，增加一个多任务条的版本。
3. 目前，对于当前时间线的显示，还仅是静态方式。
4. 作为一个基础版本，仅几百行程序，注解都有，大家可以根据需要进行修改。


## 技术联系
Jack Yang <jackyhy@263.net>


## 许可

MIT

### v0.6.1 行内布局稳定性修复

v0.6.1 重点修复机场资源时间轴在多任务、多层时间条显示时的行内布局问题。

新增/强化配置：

```js
{
  cellHeight: 40,          // 资源行高度
  headerCellHeight: 30,    // 时间标题每层高度，独立于资源行高度
  blockHeight: 24,         // 普通任务条高度
  timeLayerHeight: 9,      // planned / estimated / actual 多层条高度
  timeLayerGap: 4,         // 多层条间距
  timeLayerTopPadding: 5   // 多层条距离行顶部的距离
}
```

修复内容：

- 同一资源行内多个甘特条上沿统一。
- 同一资源行内甘特条高度统一。
- 甘特条默认高度加大，更适合机场资源看板。
- 移除旧的 negative margin 叠放方式，避免任务条进入时间标题区域。
- 甘特条层现在覆盖在 grid 区域之上，但从时间标题区下方开始渲染。

建议：如果页面需要更紧凑，可以将 `cellHeight` 调整到 34~36；如果用于运行大屏或调度席位，建议保持 40 或更高。


## v0.6.2 修复说明

本版本针对实际截图继续修复了三类控件层问题：

1. 冲突高亮优先级提升：当任务设置了 `options.color` 时，冲突状态仍会强制使用 `conflictColor`，避免交叠任务没有变红。
2. 多层时间条高度统一：`showTimeLayers:true` 时，planned / estimated / actual / start 旧数据都会进入同一套层布局，不再出现同一行内粗细不一致。
3. 跨行横向拖动修复：默认允许跨行拖动时同时修改资源和时间；如需限制为只换资源，可配置 `allowCrossRowTimeMove:false`。

这仍然是显示与轻量交互层修复，不包含自动资源调度。

## v0.6.4 当前时间范围按钮修复

本版本修复 `example/index.html` 和 `example/index2.html` 中“定位当前时间范围”按钮点击后无明显效果的问题。

主要调整：

```js
// day 模式：显示当前日前后 15 天，并定位当前时间
var now = new Date();
var start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15, 0, 0, 0, 0);
var end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 23, 59, 59, 999);
gantt.ganttView.setVisibleWindow(start, end, false);
gantt.ganttView.gotoNow('center');

// hour 模式：显示当前时间前后 12 小时，并定位当前时间
gantt2.ganttView.setRollingWindow(12, 12, false);
gantt2.ganttView.gotoNow('center');
```

同时修复了控件内部一个边界问题：`baseToday:true` 时，时间轴结束时间会扩展到当天结束，避免页面加载后稍晚点击 `gotoNow()` 时因为当前时间已经超过初始化时的 `opts.end` 而无效。


## v0.6.6 多语种支持

本版本增加轻量级多语种能力。控件内置支持：

```text
zh-CN / en-US / fr-FR / de-DE / th-TH
```

基本用法：

```js
var gantt = $("#ganttChart").ganttView(ganttData, {
    locale: 'en-US',
    viewMode: 'hour',
    multiGantt: true
});
```

运行时切换语言：

```js
gantt.ganttView.setLocale('fr-FR', true);
```

如果业务页面中的表头也需要切换，例如“机位 / 航班”，可同时传入表头：

```js
gantt.ganttView.reloadGantts(null, {
    locale: 'en-US',
    vtHeaderName: 'Gate',
    vtHeaderSubName: 'Flight',
    preserveScrollOnReload: true
});
```

支持自定义语言包：

```js
$.fn.ganttView.addLanguage('es-ES', {
    text: {
        legendResource: 'Recurso',
        legendStatus: 'Estado',
        legendTime: 'Tiempo'
    },
    labels: {
        statuses: {
            planned: 'Planificado',
            delayed: 'Retrasado'
        }
    }
});
```

多语种覆盖范围：月份、星期、季度、默认表头、自动图例、状态/资源/时间来源标签、行窗口信息、任务条横向拖动后的时间输入 prompt、分钟/小时/天 duration 文本。

业务数据中的 `cName / sName / tName` 不自动翻译，因为这些是业务数据，例如机位号、航班号、航司名称。需要翻译时，应由业务系统提供不同语种数据。

新增示例：

```text
example/i18n.html
```
