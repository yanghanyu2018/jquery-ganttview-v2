/*
    Original from jQuery.ganttView v.0.8.8
    Copyright (c) 2010 JC Grubbs - jc.grubbs@devmynd.com
    MIT License Applies

    Current Version: v0.3.2
    Modified by: Jack Yang, 2024.1
    Modified:
    1) Change to support stacked tasks.
    2) Support now-time line
    3) Support day/hour mode
    4) Support JQuery 3.0+ and need jquery-ui-1.13+ to implement drag functions
*/


/***********************************************************************************************************************
 // 数据三级名称：
 // categories (cId) 分类
 // series (sId)     序列
 // tasks (tId)      任务
 // 例如：机场的登机门/当前航班/航班任务，构成三级

 data: object
 格式：
 [
    {
        cId: 2, cName: "资源A", tip:"显示信息", series: [
            {
                sId: 1,
                sName: "任务1",
                tip: "显示任务1的提示",
                start: '2018/01/05', // 总任务开始，时间格式
                end: '2018/01/20',   // 总任务结束，时间格式
                isTask: true,        // 是否任务，如果是任务的话，则可以拖拽
                tasks: [ // 任务集，如果没有此项，则认为这不是多个任务。
                    {
                        tId: 11,           // 子任务id
                        sId: 1,           // 应与上级sId相同
                        tName: "任务1-1",
                        tip: "显示任务1-1",
                        start: '2018/01/05', // 时间格式
                        end: '2018/01/20',   // 时间格式
                        isTask: true,        // 是否是任务
                        options: { // 为这条任务的配置
                            resizable: boolean, // default:true
                            draggable: boolean, // default:true
                            color: string
                        }
                    },
                    // 其它子任务
                    // ...
                ],
                options:{ // 如果使用此总bar，则以下有效
                    resizable:boolean, // default:true
                    draggable:boolean, // default:true
                    color: string
                }
            },

            // 任务2
            // ...
        ],
    },
]

Example:

var ganttData = [
    {
        cId: 1, cName: "GATE1",
        series: [
        ]
    },
    {
        cId: 2, cName: "GATE2", series: [
            { sId:21, sName: "计划", start: '2023/01/05', end: '2023/01/20', tasks:[
                    {tId: 211, tName: "计划A", sId:21, start: '2023/01/05', end: '2023/01/07',  options:{draggable:false,resizable:false, color: 'rgba(255, 204, 51, .8)'}},
                    {tId: 212, tName: "计划B", sId:21, start: '2023/01/09', end: '2023/01/10',  options:{}},
                    {tId: 213, tName: "计划C", sId:21, start: '2023/01/11', end: '2023/01/16',  options:{}},
                    {tId: 214, tName: "计划D", sId:21, start: '2023/02/11', end: '2023/02/16',  options:{}},
                    {tId: 215, tName: "计划E", sId:21, start: '2023/03/11', end: '2023/03/16',  options:{}},
                    {tId: 216, tName: "计划F", sId:21, start: '2023/04/11', end: '2023/04/16',  options:{}},
                ] },
            { sId:22, sName: "实际", start: '2023/01/06', end: '2023/01/17', isTask: true }
        ]
    },
    {
        cId: 3, cName: "GATE3", series: [
            { sId:31, sName: "CA 1234", start: '2023/01/11', end: '2023/01/15',  options: {draggable: false, resizable: false, color: 'rgba(153, 204, 51, .8)'}}
        ]
    },
    {
        cId: 4, cName: "GATE4", series: [
            { sId:41, sName: "CA 2344A/FM 3876/MU 3132", start: '2023/01/01', end: '2023/01/03', isTask: true }
        ]
    },
    {
        cId: 5, cName: "GATE5", series: [
            { sId:51, sName: "任务5", start: '2023/01/16', end: '2023/01/24', isTask: true }
        ]
    },
];

 Options
 -----------------
     showWeekends: boolean  // 显示周末
     showNowTimeline: boolean   // 显示当期时间线
     viewMode: string     // month/week/day
     multiGantt: true,  // true: 一行多任务,  false: 一行单任务
     dataUrl: string, // json数据url
     cellWidth: number, default: 30
     cellHeight: number, default: 30
     vtHeaderWidth: number, default: 100,
     vtHeaderName: string, default: "名称",
     vtHeaderSubName: string, default: "任务"
     gridHoverV: true,//是否鼠标移入效果(列)
     gridHoverH: true,//是否鼠标移入效果(行)

     behavior: { // 整体配置， 如果整体设置不能拖拽、改变大小，则单条配置会失效
     clickable: boolean,
     draggable: boolean,
     resizable: boolean,
     onClick: function,
     onDrag: function,
     onResize: function
 }
 ***********************************************************************************************************************/

(function ($) {
    'use strict';

    if (typeof $.fn.ganttView !== 'undefined') {
        return;
    }

    const CONST_INTERVAL = 15000; // 15秒刷新当前时间线
    const CONST_CELL_HGT_RESERVED = 8; // gantt条的预留高度
    const CONST_DAY_LEFT_MARGIN = 4;
    const CONST_CELL_TOP_MARGIN = 2;
    const CONST_VTHEADER_ROWS_NORMAL = 2;

    const currentLanguage = {       // 当前语种设置
        dayNameShort: [
            "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
            "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24",
            "25", "26", "27", "28", "29", "30", "31"
        ],
        dayNameFull: [
            "01日", "02日", "03日", "04日", "05日", "06日", "07日", "08日", "09日", "10日", "11日", "12日",
            "13日", "14日", "15日", "16日", "17日", "18日", "19日", "20日", "21日", "22日", "23日", "24日",
            "25日", "26日", "27日", "28日", "29日", "30日", "31日"
        ],
        monthNameShort: [
            "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
        ],
        monthNameFull: [
            "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
        ],
        dayOfWeekNames: [
            "日", "一", "二", "三", "四", "五", "六"
        ],
        dayOfWeekNamesFull: [
            "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"
        ],

        quarterNames: ["第一季度", "第二季度", "第三季度", "第四季度"],
    }

    let defaults = {
        viewMode: 'day',         // hour, day
        multiGantt: false,       // true: 一行多任务,  false: 一行单任务
        showWeekends: true,
        showNowTimeline: false,
        baseToday: false,        // 时间是否包括当日
        showDayOfWeek: true,     // 显示星期，仅在day模式下有效
        cellWidth: 40,           // 单元格宽度
        cellHeight: 30,          // 单元格高度
        vtHeaderWidth: 240,      // 标题栏宽度
        vtHeaderName: "名称",     // 标题栏1名称
        vtHeaderSubName: "任务",  // 标题栏2名称
        dataUrl: null,           // 数据url
        gridHoverV: true,        // 是否鼠标移入效果(列)
        gridHoverH: false,       // 是否鼠标移入效果(行)
        weekStart: 1,            // 星期开始，0--星期天, 1-6 星期1~6
        behavior: {
            clickable: true,
            draggable: true,
            resizable: true
        }
    };

    // 定义jQuery对象上的功能
    $.fn.ganttView = function (data, options) {
        let _ganttView = this;

        // 选项和数据
        let _ganttOpts = {};
        let _ganttDataset = [];

        // 内部对象
        let _ganttChart = null;
        let _ganttBehavior = null;

        // 进行初始化，第一个对象为数据，第二个为options
        _build_(data, options);

        // 内部调用
        function _build_(_data, _options) {
            let opts = $.extend(true, {}, defaults, _options);
            _ganttOpts = opts;
            if (_data) {
                _ganttDataset = _data
            } else if (opts.dataUrl) {
                $.getJSON(opts.dataUrl, function (data) {
                    _ganttDataset = data
                });
            }
            _init_(_ganttDataset, opts);

            let minDays = (opts.viewMode === 'hour') ?
                Math.floor(((_ganttView.outerWidth() - opts.vtHeaderWidth) / (opts.cellWidth * 24)) + 1) :
                Math.floor(((_ganttView.outerWidth() - opts.vtHeaderWidth) / opts.cellWidth) + 15);
            let startEnd = getBoundaryDatesFromData(_data, minDays, opts.viewMode, opts.baseToday);

            // 设置gantt图的整体时间范围
            opts.start = startEnd[0]; // 起始时间
            opts.end = startEnd[1];   // 截止时间
            let $div = $("<div>", {"class": "ganttview"});

            _ganttChart = new Chart(_ganttView, $div, _data, opts);
            _ganttChart.render();

            _ganttView.append($div);

            _ganttBehavior = new Behavior(_ganttView, _ganttChart, _data, opts);
            _ganttBehavior.apply();

        } // _build_ 结束

        // 对数据进行初始化处理
        function _init_(_data, _opts) {
            for (let category of _data) {
                if (!category.series || category.series.length === 0) {
                    // 没有任务则加一条空的任务
                    category.series = [{
                        cId: category.cId,
                        sId: Math.floor((Math.random() + 1) * 10e6),
                        sName: '暂无任务',
                        tip: 'Empty Tasks',
                        _empty: true,
                        tasks: [],
                    }];
                    continue;
                }

                for (let serie of category.series) {
                    if (!serie.sId) serie.sId = Math.floor((Math.random() + 1) * 10e6);
                    serie.cId = category.cId;

                    if (!!serie.start && !!serie.end) {
                        if (typeof (serie.start) !== "object") serie.start = new Date(serie.start);  // 修改为日期格式
                        if (typeof (serie.end) !== "object") serie.end = new Date(serie.end);

                        if (!serie.tasks) serie.tasks = [];
                        if (serie.isTask && serie.tasks.length === 0) {
                            // 把serie当成任务进行处理，需要把这个添加入任务
                            let task = {
                                tId: serie.sId,
                                sId: serie.sId,
                                cId: category.cId,
                                tName: serie.sName + Math.floor((Math.random() + 1) * 1000), // 随机名称
                                tip: serie.tip,
                                start: serie.start,
                                end: serie.end,
                                isTask: true, // 确定任务
                            }
                            let opts = {}
                            $.extend(opts, serie.options, task.options);
                            task.options = opts;

                            delete serie.isTask;  // !!!必须取消此项
                            serie.tasks.push(task);
                        } else if (serie.tasks.length > 0) {
                            if (typeof serie.isTask !== 'undefined')
                                delete serie.isTask;  // !!!必须取消此项
                            for (let task of serie.tasks) {
                                task.sId = serie.sId;
                                task.cId = category.cId;
                                if (typeof (task.start) !== 'object') task.start = new Date(task.start);  // 修改为日期格式
                                if (typeof (task.end) !== 'object') task.end = new Date(task.end);
                                if (typeof task.isTask === 'undefined') task.isTask = true; // 缺省为任务

                                let opts = {}
                                $.extend(opts, serie.options, task.options);
                                task.options = opts;
                            }
                        } else {
                            serie._empty = true;
                        }
                    }
                }
            }
            // console.log("初始化数据结束", JSON.stringify(_data))
        } // _init_ 结束

        // 刷新甘特图
        function reloadGantts(_data, _opts) {
            var that = this

            that.ganttChart.cleanup()
            that.ganttChart = null
            that.ganttBehavior = null

            if (_opts) {
                _opts = $.extend(true, {}, that.ganttOpts, _opts)
                that.ganttOpts = _opts
            } else {
                _opts = that.ganttOpts
            }
            if (_data) {
                that.ganttDataset = _data
                _init_(_data, _opts);
            } else {
                _data = that.ganttDataset
            }

            that.$ganttView.children().remove();  // 清除所有对象

            let minDays = (_opts.viewMode === 'hour') ?
                Math.floor(((_ganttView.outerWidth() - _opts.vtHeaderWidth) / (_opts.cellWidth * 24)) + 1) :
                Math.floor(((_ganttView.outerWidth() - _opts.vtHeaderWidth) / _opts.cellWidth) + 15);
            let startEnd = getBoundaryDatesFromData(_data, minDays, _opts.viewMode, _opts.baseToday);

            // 设置gantt图的整体时间范围
            _opts.start = startEnd[0]; // 起始时间
            _opts.end = startEnd[1];   // 截止时间
            let $div = $("<div>", {"class": "ganttview"});

            that.ganttChart = new Chart(that.$ganttView, $div, _data, _opts);
            that.ganttChart.render();

            that.$ganttView.append($div);

            that.ganttBehavior = new Behavior(that.$ganttView, that.ganttChart, _data, _opts);
            that.ganttBehavior.apply();
        }

        // hour模式，取最小日期的零点作为起始日期
        // day模式，取最小日期-15天作为起始日期
        // 当baseToday为true时，以当前的时间为基点
        function getBoundaryDatesFromData(categories, minDays, mode, baseToday) {
            let minStart = null, maxEnd = null;
            let _now = new Date()

            if (baseToday) {
                maxEnd = _now;
                if (mode === 'hour') {
                    minStart = DateUtils.addDays(_now, -1);
                } else {
                    minStart = DateUtils.addDays(_now, -15);
                }
            }

            let i = 0, j = 0;
            for (let category of categories) {
                for (let serie of (category.series || [])) {
                    for (let task of (serie.tasks || [])) {
                        if (!task.start || !task.end) {
                            continue;
                        }

                        let start = new Date(task.start);
                        let end = new Date(task.end);
                        if (!minStart) minStart = start
                        if (!maxEnd) maxEnd = end;

                        if (minStart.getTime() > start.getTime()) {
                            minStart = new Date(start);
                        }
                        if (maxEnd.getTime() < end.getTime()) {
                            maxEnd = new Date(end);
                        }
                    }
                    j++;
                }
                i++;
            }

            if (DateUtils.daysBetween(minStart, maxEnd) < minDays) {
                maxEnd = DateUtils.addDays(minStart, minDays);
            }

            if (mode === 'hour') {
                return [
                    new Date(minStart.getFullYear(), minStart.getMonth(), minStart.getDate(), 0, 0, 0, 0),
                    new Date(maxEnd.getFullYear(), maxEnd.getMonth(), maxEnd.getDate(), 23, 59, 59, 999)
                ];
            } else {
                return [minStart, maxEnd];
            }
        }

        function _add_task(_cat, serie, title, start, end, tip, options) {
            let that = this
            if (typeof serie !== "object") {
                serie = that.findSerie(cId, serie);
            }
            if (!serie) return null

            let cId = (typeof _cat == "object"?_cat.cId: _cat)

            // 把serie当成任务进行处理，需要把这个添加入任务
            let task = {
                tId: Math.floor((Math.random() + 1) * 10e6),
                sId: serie.sId,
                cId: cId,
                tName: title, // 随机名称
                tip: tip || '',
                start: start,
                end: end,
                isTask: true, // 确定任务
            }
            let opts = {}
            $.extend(opts, serie.options, options);
            task.options = opts;

            delete serie.isTask;  // !!!必须取消此项
            serie.tasks = serie.tasks || []
            serie.tasks.push(task);

            serie._empty = !(serie.tasks.length>0);
            if (serie.tasks.length === 1) {
                serie.sName = task.tName
            }
            return task
        }

        // 新增甘特图
        function addGantt(cId, sId, title, start, end, tip, options) {
            let that = this
            let _cat  = that.findCategory(cId)
            if (!_cat) return;

            let serie = that.findSerie(_cat, sId);
            if (serie) {
                let task = _add_task(cId, serie, title, start, end, tip, options)
                that.ganttChart.addGanttBlock(_cat, serie, task);
            } else {
                let _newSerie = {
                    sId: sId,
                    sName: "No Name",
                    cId: _cat.cId,
                }
                let task = _add_task(cId, _newSerie, title, start, end, tip, options)

                that.addSerie(_cat, _newSerie)

                that.ganttChart.addGanttBlock(_cat, _newSerie, task);
            }
        }

        function deleteGantt(cId, sId) {
            let that = this
            if (!cId && !sId) {
                if (that.ganttChart.selectedBlock) {
                    that.ganttChart.deleteGanttBlock(that.ganttChart.selectedBlock);
                }
                return
            }
            let gantt = that.ganttChart.findSerie(cId, sId)
            if (gantt) {
                that.ganttChart.deleteGanttBlock(gantt);
            }
        }

        function _emtpy_serie_(serie) {
            serie.sName = '暂无任务'
            serie.tip = 'Empty Tasks'
            serie._empty = true
            serie.tasks = []
        }

        // 清空甘特图
        function clearGantts() {
            let that = this
            for (let category of that.ganttDataset) {
                for (let serie of (category.series || [])) {
                    serie.tasks = []
                    _emtpy_serie_(serie)
                }
            }
            that.reloadGantts()
        }

        //----------------------------------------对数据的操作-----------------------------------------------------------
        // 对数据的操作
        function findCategory(cId) {
            let that = this
            for (let category of that.ganttDataset) {
                if (category.cId == cId) {
                    return category
                }
            }
            return null
        }

        function deleteCategory(cId) {
            let that = this
            let found = -1;
            for (let i = 0; i < that.ganttDataset.length; i++) {
                if (that.ganttDataset[i] && that.ganttDataset[i].cId == cId) {
                    found = i
                    break;
                }
            }
            if (found>=0) that.ganttDataset.splice(found, 1)
        }

        function addCategory(cId, cName) {
            let that = this
            let _cat = that.findCategory(cId);
            if (!_cat) {
                _cat = {
                    cId: cId,
                    cName: cName || "No Name",
                    tip: 'No Name',
                    series: [],
                }
                that.ganttDataset.push(_cat);
            } else {
                _cat.cName = cName
            }
        }

        function findSerie(_cat, _serie) {
            let that = this
            let sId = ''
            if (typeof _serie === "object") {
                sId = _serie.sId || ''
            } else {
                sId = _serie
            }

            if (typeof _cat !== "object") {
                let cId = _cat
                _cat = null
                for (let category of that.ganttDataset) {
                    if (category.cId == cId) {
                        _cat = category
                        break
                    }
                }
                if (!_cat) return null
            }

            let obj = null;
            _cat.series = _cat.series || []
            for (let serie of (_cat.series || [])) {
                if (serie.sId == sId) {
                    obj = serie;
                    break;
                }
            }
            return obj;
        }

        function addSerie(_cat, _serie) {
            let that = this

            if (!_cat) return;
            if (typeof _cat !== "object") {
                _cat = that.findCategory(_cat)
                if (!_cat) return;
            }
            _cat.series = _cat.series || []
            _cat.series.push(_serie)
        }

        function deleteSerie(_cat, _serie) {
            let that = this
            let sId = ''
            if (typeof _serie === "object") {
                sId = _serie.sId || ''
            }

            if (typeof _cat !== "object") {
                _cat = that.findCategory(_cat)
                if (!_cat) return;
            }

            let found = -1;
            _cat.series = _cat.series || []
            for (let i = 0; i < _cat.series.length; i++) {
                if (_cat.series[i].sId == sId) {
                    found = i;
                    break;
                }
            }
            if (found>=0) {
                _cat.series.splice(found, 1)
            }
        }

        // 寻找Task，如果_serie是对象，则直接从_serie中找
        function findTask(_cat, _serie, _task) {
            if (!_serie) return;

            let that = this
            let obj = null;
            let tId = ''
            if (typeof _task === "object") {
                tId = _task.sId || ''
            }

            if (typeof _serie !== "object") {
                _serie = that.findSerie(_cat, _serie)
                if (!_serie) return null;
            }

            for (let task of (_serie.tasks || [])) {
                if (task.tId == tId) {
                    obj = task;
                    break;
                }
            }
            return obj;
        }

        // 增加Task，如果_serie是对象，则直接增加到_serie中
        function addTask(_cat, _serie, _task) {
            let that = this

            if (!_serie) return null;

            if (typeof _serie !== "object") {
                _serie = that.findSerie(_cat, _serie)
                if (!_serie) return null;
            }
            _serie.tasks = _serie.tasks || []
            _serie.tasks.push(_task)
            return _task
        }

        // 删除Task，如果_serie是对象，则直接从_serie中删除
        function deleteTask(_cat, _serie, _task) {
            if (!_serie) return null;

            let that = this
            if (typeof _serie !== "object") {
                _serie = that.findSerie(_cat, _serie)
                if (!_serie) return null;
            }

            let found = -1;
            _serie.tasks =  _serie.tasks || []
            for (let i = 0; i <  _serie.tasks.length; i++) {
                if ( _serie.tasks[i].tId == _task.tId) {
                    found = i;
                    break;
                }
            }
            if (found>=0) {
                _serie.tasks.splice(found, 1)
            }
        }
        //-----------------------------------------END:对数据的操作-------------------------------------------------------

        function gotoNow() {
            this.ganttChart.gotoNow()
        }

        _ganttView.ganttView = {
            $ganttView: _ganttView,
            ganttOpts: _ganttOpts,
            ganttDataset: _ganttDataset,
            ganttChart: _ganttChart,
            ganttBehavior: _ganttBehavior,

            clearGantts: clearGantts,
            reloadGantts: reloadGantts,
            addGantt: addGantt,
            deleteGantt: deleteGantt,
            gotoNow: gotoNow,

            findCategory: findCategory,
            addCategory: addCategory,
            deleteCategory: deleteCategory,

            findSerie: findSerie,
            addSerie: addSerie,
            deleteSerie: deleteSerie,

            findTask: findTask,
            addTask: addTask,
            deleteTask: deleteTask,
        }

        return _ganttView;
    };  // end of ganttView

    // 甘特图的处理
    var Chart = function ($view, container, categories, opts) {
        let _timeHandler = null;       // 时钟句柄

        let _selectedBlockOld = null  // 保存老的选择
        let _selectedBlock = null     // 当前选择

        function cleanup() {
            let that = this
            if (that.timeHandler) clearInterval(that.timeHandler);
            that.timeHandler = null

            _selectedBlockOld = null
            _selectedBlock = null
        }

        function render() {
            let that = this
            addVtHeader(container, categories, opts);
            let $slideDiv = $("<div>", {
                "class": "ganttview-slide-container",
            });

            let dates = getDates(opts.start, opts.end);

            if (opts.viewMode === 'hour') {
                addHzHeader_Hour($slideDiv, dates, opts);
            } else {
                addHzHeader_Day($slideDiv, dates, opts);
            }

            addGrid($slideDiv, categories, dates, opts);

            if (opts.viewMode === 'hour') {
                addBlockContainers($slideDiv, categories, opts);
                addBlocks($slideDiv, categories, opts);
            } else {
                addBlockContainers($slideDiv, categories, opts);
                addBlocks($slideDiv, categories, opts);
            }

            container.append($slideDiv);
            applyLastClass(container.parent());

            if (opts.showNowTimeline) {
                if (that.timeHandler) clearInterval(that.timeHandler);
                that.timeHandler = setInterval(function () {
                    showNowTimeLineInCell();
                }, CONST_INTERVAL);
            }
        }

        // 滚动到当前时间
        function gotoNow() {
            let __scrollTopFound = function (tdObj, showTop) {
                if (tdObj) {
                    if (typeof showTop !== "undefined") {
                        tdObj.scrollIntoView(showTop)
                    } else {
                        tdObj.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                            inline: "center",
                        })
                    }
                }
            }

            let $obj = null;

            if (opts.viewMode === 'hour') {
                $obj = $(".ganttview-hzheader-hour-now")
            } else {
                $obj = $(".ganttview-hzheader-day-now")
            }

            if ($obj && $obj.length > 0) {
                __scrollTopFound($obj[0])
            }
        }

        // 显示当前时间线
        function showNowTimeLineInCell() {
            let _now = new Date()
            if (_now < opts.start || _now > opts.end) {
                return
            }

            if (opts.viewMode === 'hour') {
                let minutes = DateUtils.minutesBetween(opts.start, _now, true);
                let offset = Math.floor(minutes / 60);

                $('div.ganttview-hzheader-hours', $view).each(function () {
                    $('div.ganttview-hzheader-hour', $(this)).each(function (_i) {
                        let $dayDiv = $(this);
                        if (_i === offset - 1) {
                            $dayDiv.children().remove();
                        } else if (_i === offset) {
                            $dayDiv.children().remove();
                            let nowMinutes = _now.getMinutes();
                            let tmLine = Math.max(Math.floor((nowMinutes / 60) * opts.cellWidth), 1);
                            $dayDiv.prepend(`<span class="ganttview-hzheader-hour-now" style="left:${tmLine}px!important;"></span>`)
                        }
                    });
                });

                $('div.ganttview-grid-row', $view).each(function () {
                    $('div.ganttview-grid-row-cell', $(this)).each(function (_i) {
                        let $cellDiv = $(this);
                        if (_i === offset - 1) {
                            $cellDiv.children().remove();
                        } else if (_i === offset) {
                            $cellDiv.children().remove();
                            let nowMinutes = _now.getMinutes();
                            let tmLine = Math.max(Math.floor((nowMinutes / 60) * opts.cellWidth), 1);
                            $cellDiv.prepend(`<span class="ganttview-grid-row-cell-now" style="left:${tmLine}px!important;"></span>`)
                        }
                    });
                });
            } else {
                let offset = DateUtils.daysBetween(opts.start, _now, true);

                $('div.ganttview-hzheader-days', $view).each(function () {
                    $('div.ganttview-hzheader-day', $(this)).each(function (_i) {
                        let $dayDiv = $(this);
                        if (_i === offset - 1) {
                            $dayDiv.children().remove();
                        } else if (_i === offset) {
                            $dayDiv.children().remove();

                            let nowHour = _now.getHours();
                            let tmLine = Math.max((nowHour / 24) * opts.cellWidth, 1);

                            $dayDiv.prepend(`<span class="ganttview-hzheader-day-now" style="left:${tmLine}px!important;"></span>`)
                        }
                    });
                });

                if (opts.showDayOfWeek) {
                    $('div.ganttview-hzheader-dayofweeks', $view).each(function () {
                        $('div.ganttview-hzheader-dayofweek', $(this)).each(function (_i) {
                            let $dowDiv = $(this);
                            if (_i === offset - 1) {
                                $dowDiv.children().remove();
                            } else if (_i === offset) {
                                $dowDiv.children().remove();

                                let nowHour = _now.getHours();
                                let tmLine = Math.max((nowHour / 24) * opts.cellWidth, 1);

                                $dowDiv.prepend(`<span class="ganttview-hzheader-day-now" style="left:${tmLine}px!important;"></span>`)
                            }
                        });
                    });
                }

                $('div.ganttview-grid-row', $view).each(function () {
                    $('div.ganttview-grid-row-cell', $(this)).each(function (_i) {
                        let $cellDiv = $(this);
                        if (_i === offset - 1) {
                            $cellDiv.children().remove();
                        } else if (_i === offset) {
                            let $dowDiv = $(this);
                            if (_i === offset - 1) {
                                $dowDiv.children().remove();
                            } else if (_i === offset) {
                                $dowDiv.children().remove();

                                let nowHour = _now.getHours();
                                let tmLine = Math.max((nowHour / 24) * opts.cellWidth, 1);

                                $dowDiv.prepend(`<span class="ganttview-hzheader-day-now" style="left:${tmLine}px!important;"></span>`)
                            }
                        }
                    });
                });
            }
        }

        // 表格头部处理
        function addVtHeader(container, _categories, _opts) {
            // 修改左边标题栏宽度
            let $headerDiv = $("<div>", {
                "class": "ganttview-vtheader",
                "css": {"width": _opts.vtHeaderWidth + "px"}
            });

            // 修改左边标题栏高度
            let vtheaderRows = CONST_VTHEADER_ROWS_NORMAL;
            if (_opts.viewMode === 'day' && _opts.showDayOfWeek) vtheaderRows = CONST_VTHEADER_ROWS_NORMAL + 1;

            let $headerTitleDiv = $("<div>", {
                "class": "ganttview-vtheader-title",
                "css": {"width": _opts.vtHeaderWidth + "px", "height": (_opts.cellHeight + 1) * vtheaderRows - 1 + "px"}
            });

            // 修改左边标题栏
            $headerTitleDiv.append($("<div>", {
                "class": "ganttview-vtheader-title-name",
                "css": {"height": "100%", "line-height": (_opts.cellHeight + 1) * vtheaderRows + "px", "width": "80px"}
            }).append(_opts.vtHeaderName));

            $headerTitleDiv.append($("<div>", {
                "class": "ganttview-vtheader-title-name",
                "css": {
                    "height": "100%",
                    "line-height": (_opts.cellHeight + 1) * vtheaderRows + "px",
                    "width": "calc(100% - 81px)"
                }
            }).append(_opts.vtHeaderSubName));

            $headerDiv.append($headerTitleDiv);
            for (let category of _categories) {
                // 左边标题栏项目
                let $itemDiv = $("<div>", {
                    "id": "ganttview-vtheader-item-" + category.cId,
                    "title": (category.tip || category.cName),
                    "class": "ganttview-vtheader-item",
                    "css": {"height": (category.series.length * _opts.cellHeight) + "px"}
                });

                // 左边标题栏项目名称
                $itemDiv.append($("<div>", {
                    "id": "ganttview-vtheader-item-name-" + category.cId,
                    "class": "ganttview-vtheader-item-name",
                    "css": {
                        "height": (category.series.length * _opts.cellHeight) + "px",
                        "line-height": (category.series.length * _opts.cellHeight - 6) + "px"
                    }
                }).append(category.cName));

                // 左边任务序列名称
                let $seriesDiv = $("<div>", {"class": "ganttview-vtheader-series"});
                for (let serie of category.series) {
                    // 每个series中的一个元素，作为单独一行
                    $seriesDiv.append($("<div>", {
                        "id": "ganttview-vtheader-series-name-" + serie.sId,
                        "class": "ganttview-vtheader-series-name",
                        "title": (serie.tip || serie.sName),
                        "css": {"height": _opts.cellHeight + "px", "line-height": _opts.cellHeight - 6 + "px"}
                    }).append(serie.sName));
                }

                // 添加名称+任务名称
                $itemDiv.append($seriesDiv);
                $headerDiv.append($itemDiv);
            }

            container.append($headerDiv);
        }

        // 根据日期进行分割
        function addHzHeader_Day(container, _dates, _opts) {
            let $headerDiv = $("<div>", {"class": "ganttview-hzheader"});
            let $monthsDiv = $("<div>", {"class": "ganttview-hzheader-months clearfix"});
            let $daysDiv = $("<div>", {"class": "ganttview-hzheader-days clearfix"});
            let $dayOfWeeksDiv = $("<div>", {"class": "ganttview-hzheader-dayofweeks clearfix"});

            let totalW = 0;

            for (let y in _dates) {
                for (let m in _dates[y]) {
                    // 显示月份
                    let w = _dates[y][m].length * _opts.cellWidth;
                    totalW = totalW + w;
                    $monthsDiv.append($("<div>", {
                        "class": "ganttview-hzheader-month",
                        "css": {"width": w + "px"}
                    }).append(y + "年" + DateUtils.getMonthNames(m))); // 显示标题

                    // 显示日期
                    for (let d in _dates[y][m]) {
                        let _date = _dates[y][m][d];
                        let dayDiv = $("<div>", {
                            "class": "ganttview-hzheader-day",
                            "css": {"width": _opts.cellWidth + "px"}
                        });

                        dayDiv.append(_date.getDate());

                        // 周末的处理
                        if (DateUtils.isWeekend(_date) && _opts.showWeekends) {
                            // dayDiv.addClass("ganttview-weekend");
                            if (DateUtils.isSaturday(_date)) dayDiv.addClass("ganttview-saturday");
                            if (DateUtils.isSunday(_date)) dayDiv.addClass("ganttview-sunday");
                        }

                        if (_opts.showNowTimeline) {
                            if (DateUtils.isShowDayLine(_date)) {
                                let nowHour = new Date().getHours();
                                let tmLine = Math.max((nowHour / 24) * _opts.cellWidth, 1);

                                dayDiv.prepend(`<span class="ganttview-hzheader-day-now" style="left:${tmLine}px!important;"></span>`)
                            }
                        }

                        $daysDiv.append(dayDiv);
                    }

                    // 显示星期
                    if (_opts.viewMode === 'day' && _opts.showDayOfWeek) {
                        for (let d in _dates[y][m]) {
                            let _date = _dates[y][m][d];
                            let $dowDiv = $("<div>", {
                                "class": "ganttview-hzheader-dayofweek",
                                "css": {"width": _opts.cellWidth + "px"}
                            });

                            $dowDiv.append(DateUtils.getWeekName(_date.getDay()));

                            // 周末的处理
                            if (DateUtils.isWeekend(_date) && _opts.showWeekends) {
                                // dayDiv.addClass("ganttview-weekend");
                                if (DateUtils.isSaturday(_date)) $dowDiv.addClass("ganttview-saturday");
                                if (DateUtils.isSunday(_date)) $dowDiv.addClass("ganttview-sunday");
                            }

                            if (_opts.showNowTimeline) {
                                if (DateUtils.isShowDayLine(_date)) {
                                    let nowHour = new Date().getHours();
                                    let tmLine = Math.max((nowHour / 24) * _opts.cellWidth, 1);

                                    $dowDiv.prepend(`<span class="ganttview-hzheader-day-now" style="left:${tmLine}px!important;"></span>`)
                                }
                            }

                            $dayOfWeeksDiv.append($dowDiv);
                        }
                    }
                }
            }

            $monthsDiv.css("width", totalW + "px");
            $daysDiv.css("width", totalW + "px");
            $headerDiv.append($monthsDiv).append($daysDiv);

            if (_opts.viewMode === 'day' && _opts.showDayOfWeek) {
                $dayOfWeeksDiv.css("width", totalW + "px");
                $headerDiv.append($dayOfWeeksDiv)
            }

            container.append($headerDiv);
        }

        // 根据小时进行分割
        function addHzHeader_Hour(container, _dates, _opts) {
            let $headerDiv = $("<div>", {"class": "ganttview-hzheader"});
            let $daysDiv = $("<div>", {"class": "ganttview-hzheader-days clearfix"});
            let $hoursDiv = $("<div>", {"class": "ganttview-hzheader-hours clearfix"});
            let totalW = 0;
            let hours = DateUtils.getHours(); // 取24小时

            for (let y in _dates) {
                for (let m in _dates[y]) {
                    for (let d in _dates[y][m]) {
                        // 显示日期
                        let _date = _dates[y][m][d];
                        let w = 24 * _opts.cellWidth;
                        let weekName = ''
                        if (_opts.showDayOfWeek) {
                            weekName = DateUtils.getWeekFullName(_date.getDay())
                        }

                        totalW = totalW + w;
                        $daysDiv.append($("<div>", {
                            "class": "ganttview-hzheader-day",
                            "css": {"width": w + "px"}
                        }).append(`${y}年${DateUtils.getMonthNames(m)}月${_date.getDate()}日  ${weekName}`)); // 显示标题`

                        // 周末的处理
                        if (DateUtils.isWeekend(_date) && _opts.showWeekends) {
                            // dayDiv.addClass("ganttview-weekend");
                            if (DateUtils.isSaturday(_date)) $daysDiv.addClass("ganttview-saturday");
                            if (DateUtils.isSunday(_date)) $daysDiv.addClass("ganttview-sunday");
                        }

                        // 显示小时
                        for (let h = 0; h < hours.length; h++) {
                            let $hourDiv = $("<div>", {
                                "class": "ganttview-hzheader-hour",
                                "css": {"width": _opts.cellWidth + "px"}
                            });

                            if (_opts.showNowTimeline) {
                                if (DateUtils.isShowHourLine(_date, h)) {
                                    let nowMinutes = new Date().getMinutes();
                                    let tmLine = Math.max((nowMinutes / 60) * _opts.cellWidth, 1);

                                    $hourDiv.prepend(`<span class="ganttview-hzheader-hour-now" style="left:${tmLine}px!important;"></span>`)
                                }
                            }

                            $hourDiv.append(hours[h]);
                            $hoursDiv.append($hourDiv);
                        }
                    }
                }
            }

            $daysDiv.css("width", totalW + "px");
            $hoursDiv.css("width", totalW + "px");
            $headerDiv.append($daysDiv).append($hoursDiv);

            container.append($headerDiv);
        }

        // 增加day/hour模式下的网格线及网格单元
        function addGrid(container, _categories, _dates, _opts) {
            let $gridDiv = $("<div>", {"class": "ganttview-grid"});
            let $rowDiv = $("<div>", {"class": "ganttview-grid-row clearfix"});
            let hours = DateUtils.getHours(); // 取24小时

            if (_opts.viewMode === 'hour') {
                // 按日期形成网格线及网格单元
                for (let y in _dates) {
                    for (let m in _dates[y]) {
                        for (let d in _dates[y][m]) {
                            let _date = _dates[y][m][d];
                            let shoWeekends = DateUtils.isWeekend(_date) && _opts.showWeekends;
                            for (let h = 0; h < hours.length; h++) {
                                let $cellDiv = $("<div>", {
                                    "class": "ganttview-grid-row-cell",
                                    "css": {"width": _opts.cellWidth + "px", "height": _opts.cellHeight + "px"}
                                });

                                if (shoWeekends) {
                                    $cellDiv.addClass("ganttview-weekend");
                                }

                                if (_opts.showNowTimeline) {
                                    if (DateUtils.isShowHourLine(_date, h)) {
                                        let nowMinutes = new Date().getMinutes();
                                        let tmLine = Math.max((nowMinutes / 60) * _opts.cellWidth, 1);

                                        $cellDiv.prepend(`<span class="ganttview-grid-row-cell-now" style="left:${tmLine}px!important;"></span>`)
                                    }
                                }
                                $rowDiv.append($cellDiv);
                            }
                        }
                    }
                }
            } else {
                // 按日期形成网格线及网格单元
                for (let y in _dates) {
                    for (let m in _dates[y]) {
                        for (let d in _dates[y][m]) {
                            let _date = _dates[y][m][d];
                            let $cellDiv = $("<div>", {
                                "class": "ganttview-grid-row-cell",
                                "css": {"width": _opts.cellWidth + "px", "height": _opts.cellHeight + "px"}
                            });
                            if (DateUtils.isWeekend(_date) && _opts.showWeekends) {
                                // cellDiv.addClass("ganttview-weekend");
                                if (DateUtils.isSaturday(_date)) $cellDiv.addClass("ganttview-saturday");
                                if (DateUtils.isSunday(_date)) $cellDiv.addClass("ganttview-sunday");
                            }
                            if (_opts.showNowTimeline) {
                                if (DateUtils.isShowDayLine(_date)) {
                                    let nowHour = new Date().getHours();
                                    let tmLine = Math.max((nowHour / 24) * _opts.cellWidth, 1);

                                    $cellDiv.prepend(`<span class="ganttview-grid-row-cell-now" style="left:${tmLine}px!important;"></span>`)
                                }
                            }
                            $rowDiv.append($cellDiv);
                        }
                    }
                }
            }

            // 对grid单元进行处理
            let w = $("div.ganttview-grid-row-cell", $rowDiv).length * _opts.cellWidth;
            $rowDiv.css("width", w + "px");
            $gridDiv.css("width", w + "px");
            for (let category of _categories) {
                // 第一项：作为名称
                for (let serie of category.series) {
                    // 第二项：每一个序列定义了一行
                    let $cloneRowDiv = $rowDiv.clone(); // 复制每一行
                    $cloneRowDiv.attr("id", "ganttview-grid-row-" + serie.sId);
                    $cloneRowDiv.attr("cId", category.cId);

                    // 每行都可以接受拖放的任务
                    (typeof $cloneRowDiv.droppable === "function") && $cloneRowDiv.droppable({
                        accept: '.ganttview-task', // 只接受的类型
                        hoverClass: "gantt-drag-hover",
                        drop: function (e, ui) {
                            let $block = $(this)
                            let _sId = (this.id) ? this.id.replace("ganttview-grid-row-", '') : '';
                            let _cId = $block.attr("cId");
                            let _block_data = ui.helper.data("block-data");
                            let task = _findTask(_block_data.cId, _block_data.sId, _block_data.tId)
                            if (!task) return false;

                            // 拖拽任务条结束
                            // 1) 先找到新行的位置。
                            // 2）如果是与原所在行相同，则返回，进入后续的修改位置处理。注：hour模式放弃此功能，因为需要精准控制时间，使用拖拽不合适。
                            // 3）如果是与原所在行不相同，则进行如下处理：
                            // 3.1）单任务模式
                            // -- 如果serie没有任务，则在新Serie增加一个任务，删除原来Serie所在行的数据
                            // -- 如果serie已经有任务，则把原Serie改到newSerie之后，并修改为相同的category
                            // 3.2）多任务模式
                            // -- 在新Serie增加一个任务，同时修改serie的时间信息
                            // -- 在旧Serie删除一个任务，如果为空，则对serie标题进行修改，并清空start和end属性。
                            let newSerie = _findSerie(_cId, _sId)
                            if (!newSerie) return false;

                            let oldSerie = _findSerie(task.cId, task.sId);
                            if (newSerie === oldSerie) {
                                _block_data._noChange = true
                                return;
                            }

                            let i = _findTaskIdx(oldSerie.tasks, task.cId, task.sId);
                            if (i >= 0) {
                                removeTaskBlock(oldSerie, _block_data._task)

                                newSerie._empty = false;
                                let newCategory = _findCategory(newSerie.cId)

                                task.cId = newCategory.cId;
                                task.sId = newSerie.sId;
                                if (newSerie.sName === "暂无任务" && task.tName) {
                                    newSerie.sName = task.tName;
                                    newSerie.tip = task.tip;
                                }

                                newSerie.tasks = newSerie.tasks || []
                                newSerie.tasks.push(task);
                                updateBlockData($block, category, newSerie, task);

                                if (!_opts.multiGantt) {
                                    // TODO：删除oldSerie

                                } else {
                                    // TODO：修改newSerie的时间
                                }

                                e.preventDefault();
                                e.stopImmediatePropagation()

                                // debugger
                                $view.ganttView.reloadGantts(categories, opts);

                                return false;
                            }
                        }
                    });

                    // 添加这一新行
                    $gridDiv.append($cloneRowDiv);
                }
            }
            container.append($gridDiv);
        }

        function addBlockContainers(container, _categories, _opts) {
            let $blocksDiv = $("<div>", {"class": "ganttview-blocks"});
            for (let category of _categories) {
                for (let serie of category.series) {
                    // 每个series中的一个元素，作为单独一行
                    let $containerDiv = $("<div>", {
                        "id": "ganttview-block-container-" + serie.sId,
                        "class": "ganttview-block-container",
                        "css": {"height": _opts.cellHeight + "px"} // 注：gantt bar要比这个小，预留空间为其它用途
                    });
                    $containerDiv.attr('data-cId', category.cId)
                    $blocksDiv.append($containerDiv);
                }
            }
            container.append($blocksDiv);
        }

        function findBlockContainers(serie) {
            return $("#ganttview-block-container-" + serie.sId,)
        }

        function addBlocks(container, _categories, _opts) {
            let rows = $("div.ganttview-blocks div.ganttview-block-container", container);
            let pixel_per_minutes = _opts.cellWidth / 60;  // 每分钟的宽度

            let rowIdx = 0;
            for (let category of _categories) {
                for (let serie of category.series) {
                    if (serie._empty) {
                        rowIdx++;
                        continue;
                    }

                    // 对每个gantt条数据进行处理
                    let _count = 0
                    for (let task of (serie.tasks || [])) {
                        _count++;

                        if (_opts.viewMode === 'hour') {
                            // hour模式
                            let task_minutes = DateUtils.minutesBetween(task.start, task.end);
                            let size = Math.floor(task_minutes * pixel_per_minutes) + 1;
                            let offset = Math.floor(DateUtils.minutesBetween(_opts.start, task.start) * pixel_per_minutes) + 1;

                            let $block = $("<div>", {
                                "id": "ganttview-block-" + task.tId,
                                "class": "ganttview-block",
                                "title": (task.tip ? task.tip : `${category.cName}: ${serie.sName}: ${task.tName}  任务时间: [${task.start.format("dd HH:mm")} -- ${task.end.format("dd HH:mm")}]`),
                                "css": {
                                    "width": size + "px", // 甘特条宽度, 显示整天时，不精确定位小时
                                    "height": _opts.cellHeight - CONST_CELL_HGT_RESERVED + "px",  // 甘特条高度
                                    "margin-left": offset + "px", // 左边距
                                    "margin-top": CONST_CELL_TOP_MARGIN + "px",
                                }
                            });

                            if (task.isTask) $block.addClass("ganttview-task"); // 对于任务类型的处理
                            if (_count > 1) {
                                $block.removeClass("ganttview-block-conflict")
                                if (checkTaskConflict(serie, task))
                                    $block.addClass("ganttview-block-conflict");
                            }

                            updateBlockData($block, category, serie, task);

                            // 有其他背景色的要求
                            if (!!task.options && task.options.color) {
                                $block.css("background-color", task.options.color);
                            }

                            // 放置文本位置
                            $block.append($("<div>", {
                                "id": "ganttview-block-text-" + task.tId,
                                "class": "ganttview-block-text",
                                "css": {
                                    "height": _opts.cellHeight - CONST_CELL_HGT_RESERVED + "px",
                                    "line-height": _opts.cellHeight - CONST_CELL_HGT_RESERVED + "px"
                                },
                                "margin-top": CONST_CELL_TOP_MARGIN + "px",
                            }).text(DateUtils.getTagFromMinutes(task_minutes)));

                            $(rows[rowIdx]).append($block);

                        } else {
                            // day 模式
                            let size = DateUtils.daysBetween(task.start, task.end) + 1;
                            let offset = DateUtils.daysBetween(_opts.start, task.start, true);

                            let $block = $("<div>", {
                                "id": "ganttview-block-" + task.tId,
                                "class": "ganttview-block",
                                "title": (task.tip ? task.tip :
                                    `${category.cName}: ${serie.sName}: ${task.tName}  任务时间: [${task.start.format("dd HH:mm")} -- ${task.end.format("dd HH:mm")}]`),
                                "css": {
                                    "width": ((size * _opts.cellWidth) - CONST_CELL_HGT_RESERVED) + "px", // 甘特条宽度, 显示整天时，不精确定位小时
                                    "height": _opts.cellHeight - CONST_CELL_HGT_RESERVED + "px",  // 甘特条高度
                                    "margin-left": ((offset * _opts.cellWidth) + CONST_DAY_LEFT_MARGIN) + "px", // 左边距，4为gantt条的左边所在单元的边距
                                    "margin-top": CONST_CELL_TOP_MARGIN + "px",
                                }
                            });

                            if (task.isTask) $block.addClass("ganttview-task"); // 对于任务类型的处理
                            // 冲突检查
                            if (_count > 1) {
                                $block.removeClass("ganttview-block-conflict")
                                if (checkTaskConflict(serie, task))
                                    $block.addClass("ganttview-block-conflict");
                            }

                            updateBlockData($block, category, serie, task);

                            // 有其他背景色的要求
                            if (!!task.options && task.options.color) {
                                $block.css("background-color", task.options.color);
                            }

                            // 放置文本位置
                            $block.append($("<div>", {
                                "id": "ganttview-block-text-" + task.tId,
                                "class": "ganttview-block-text",
                                "css": {
                                    "height": _opts.cellHeight - CONST_CELL_HGT_RESERVED + "px",
                                    "line-height": _opts.cellHeight - CONST_CELL_HGT_RESERVED + "px"
                                },
                                "margin-top": CONST_CELL_TOP_MARGIN + "px",
                            }).text(size + "天"));

                            $(rows[rowIdx]).append($block);
                        }

                        if (!_opts.multiGantt) break; // 单任务模式，则退出
                    }
                    rowIdx = rowIdx + 1;
                }
            }
        }

        // 修改甘特条的数据内容
        function updateBlockData(block, _category, _serie, _task) {
            let options = {draggable: true, resizable: true};

            let blockData = {
                cId: _category ? _category.cId : null,
                sId: _serie ? _serie.sId : null,
                tId: _task ? _task.tId : null,
                _category: _category,
                _serie: _serie,
                _task: _task,
            };
            let blockCategory = {}, blockSerie = {}, blockTask = {};
            $.extend(blockCategory, _category);
            delete blockCategory.series;
            delete blockCategory.options;
            $.extend(blockSerie, _serie);
            delete blockSerie.tasks;
            delete blockSerie.options;
            $.extend(blockSerie, _task);
            delete blockTask.options;

            $.extend(options, (_serie ? _serie.options : {}), (_task ? _task.options : {}));
            $.extend(blockData, blockCategory, blockSerie, blockSerie);

            blockData.options = options;
            block.data("block-data", blockData);
        }

        // 移开Serie对象，当Series长度为1时，做清空处理
        function removeSerieBlock(category, serie) {
            if (!category || !category.series || category.series.length === 0)
                return false

            let idx = category.series.indexOf(serie);
            if (idx < 0) return false;

            if (category.series.length > 1) {
                category.series.splice(idx, 1);
                return true
            }

            serie.tasks = []
            serie._empty = true;
            serie.sName = "暂无任务";
            serie.tip = "暂无任务";
            serie.start = null;
            serie.end = null;
            return false;
        }

        // 移开Task对象，并对Serie进行处理，当无任务书时，显示无任务
        function removeTaskBlock(serie, task) {
            if (!serie || !serie.tasks || serie.tasks.length === 0)
                return false
            let idx = serie.tasks.indexOf(task);
            if (idx < 0) return false;

            serie.tasks.splice(idx, 1);

            serie._empty = (serie.tasks.length <= 0);
            if (serie._empty) {
                serie.sName = "暂无任务";
                serie.tip = "暂无任务";
                serie.start = null;
                serie.end = null;
            }
            return true;
        }

        // TODO: 检查冲突
        function checkTaskConflict(serie, task) {
            return false
        }

        // 对布局方格的最后一个对象需要特殊处理
        function applyLastClass(container) {
            $("div.ganttview-grid-row div.ganttview-grid-row-cell:last-child", container).addClass("last");
            $("div.ganttview-hzheader-days div.ganttview-hzheader-day:last-child", container).addClass("last");
            $("div.ganttview-hzheader-months div.ganttview-hzheader-month:last-child", container).addClass("last");
        }

        // Creates a 3-dimensional array [year][month][day] of every day
        // between the given start and end dates
        // 生成一个 year X month X day 的3D数组
        function getDates(start, end) {
            let dates = [];

            dates[start.getFullYear()] = [];
            dates[start.getFullYear()][start.getMonth()] = [start];
            let last = start;
            while (last.getTime() < end.getTime()) {
                let next = DateUtils.addDays(new Date(last), 1);
                if (!dates[next.getFullYear()]) {
                    dates[next.getFullYear()] = [];
                }
                if (!dates[next.getFullYear()][next.getMonth()]) {
                    dates[next.getFullYear()][next.getMonth()] = [];
                }
                dates[next.getFullYear()][next.getMonth()].push(next);
                last = next;
            }

            return dates;
        }

        //-----------Begin: 内部使用的函数----------------------------------------------------------
        function _findTaskIdx(tasks, cId, sId) {
            let i = 0;
            for (let task of (tasks || [])) {
                if (task.sId == sId && task.cId == cId) {
                    return i;
                }
                i++;
            }
            return -1
        }

        function _findCategory(cId) {
            let obj = null;
            for (let category of (categories || [])) {
                if (category.cId == cId) {
                    obj = category;
                    break;
                }
            }
            return obj;
        }

        function _findSerie(_cat, _serie) {
            let obj = null;
            let sId = ''
            if (typeof _serie === "object") {
                sId = _serie.sId || ''
            }

            if (typeof _cat === "object") {
                for (let serie of (_cat.series || [])) {
                    if (serie.sId == sId) {
                        obj = serie;
                        break;
                    }
                }
            } else {
                for (let category of categories) {
                    if (category.cId == _cat) {
                        for (let serie of category.series) {
                            if (serie.sId == sId) {
                                obj = serie;
                                break;
                            }
                        }
                    }
                }
            }
            return obj;
        }

        function _addSerie(_cat, _serie) {
            if (!_cat) return;
            if (typeof _cat !== "object") {
                _cat = _findCategory(_cat)
                if (!_cat) return;
            }
            _cat.series = _cat.series || []
            _cat.series.push(_serie)
        }

        function _deleteSerie(_cat, _serie) {
            let sId = ''
            if (typeof _serie === "object") {
                sId = _serie.sId || ''
            }

            if (typeof _cat !== "object") {
                _cat = _findCategory(_cat)
                if (!_cat) return;
            }

            let found;
            _cat.series = _cat.series || []
            for (let i = 0; i < _cat.series.length; i++) {
                if (_cat.series[i].sId == sId) {
                    found = i;
                    break;
                }
            }
            if (found) {
                _cat.series.splice(found, 1)
            }
        }

        function _findTask(cId, sId, tId) {
            let obj = null;
            for (let category of (categories || [])) {
                if (category.cId === cId) {
                    for (let serie of category.series) {
                        if (serie.sId === sId) {
                            for (let task of (serie.tasks || [])) {
                                if (task.tId === tId) {
                                    obj = task;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            return obj;
        }

        // 加入Task到Serie中
        function _addTask(serie, _task) {
            if (!serie) return null;
            if (typeof serie !== "object") {
                serie = _findSerie(serie)
                if (!serie) return null;
            }

            if (!serie.tasks) serie.tasks = [];
            serie.tasks.push(_task)

            return _task
        }

        function _deleteTask(_serie, _task) {
            let tId = ''
            if (typeof _task === "object") {
                tId = _task.tId || ''
            }

            if (typeof _serie !== "object") {
                _serie = _findCategory(_serie)
                if (!_serie) return;
            }

            let found;
            for (let i = 0; i < _serie.tasks.length; i++) {
                if (_serie.tasks[i].tId == tId) {
                    found = i;
                    break;
                }
            }
            if (found) {
                _serie.tasks.splice(found, 1)
            }
        }
        //-----------End: 内部使用的函数----------------------------------------------------------

        function refreshGanttBlock(block) {
            let data = block.data('block-data');

            $("div#ganttview-vtheader-item-name-" + data.cId).text(data.cName);
            $("div#ganttview-vtheader-series-name-" + data.sId).text(data.sName);
            let $blockDiv = $("div#ganttview-block-" + data.sId);

            if (opts.viewMode === 'hour') {
                // hour模式
                let pixel_per_minutes = opts.cellWidth / 60;
                let task_minutes = DateUtils.minutesBetween(opts.start, data._task.end);
                let size = Math.floor(task_minutes * pixel_per_minutes) + 1;
                let offset = Math.floor(DateUtils.minutesBetween(opts.start, data._task.start) * pixel_per_minutes) + 1;

                $blockDiv.css({
                    "width": size + "px", // 甘特条宽度, 显示整天时，不精确定位小时
                    "height": opts.cellHeight - CONST_CELL_HGT_RESERVED + "px",  // 甘特条高度
                    "margin-left": offset + "px", // 左边距
                    "margin-top": CONST_CELL_TOP_MARGIN + "px",
                });
                $blockDiv.attr("title", DateUtils.getTagFromMinutes(task_minutes));
            } else {
                let size = DateUtils.daysBetween(data.start, data.end, false, false);
                let offset = DateUtils.daysBetween(opts.start, data.start, false, false);

                $blockDiv.css({
                    "width": ((size * opts.cellWidth) - CONST_CELL_HGT_RESERVED) + "px",
                    "margin-left": ((offset * opts.cellWidth) + CONST_DAY_LEFT_MARGIN) + "px",
                });

                $blockDiv.attr("title", Utils.getTitle((data.tip || data.sName), data.count));
            }
        }

        // 删除甘特条
        // 单任务模式: 需要把相应的serie，但category中至少保留一个serie
        // 多任务模式：删除task
        function deleteGanttBlock(block) {
            let block_data = block.data("block-data")
            if (!block || !block_data) return;

            let taskDeleted = false;
            let serieDeleted = false;

            if (block_data._serie) {
                taskDeleted = removeTaskBlock(block_data._serie, block_data._task)
            }

            if (!opts.multiGantt) {
                if (block_data._serie.length === 0) {
                    serieDeleted = removeSerieBlock(block_data._category, block_data._serie)
                }
            }

            if (taskDeleted === false) return;

            let tId = block_data.tId;
            let sId = block_data.sId;
            let cId = block_data.cId;

            if (opts.viewMode === 'hour') {
                $("div#ganttview-block-" + tId).remove();
            } else {
                $("div#ganttview-block-" + tId).remove();
                if (serieDeleted) {
                    $("div#ganttview-grid-row-" + sId).remove();
                    $("div#ganttview-block-container-" + sId).remove();
                    $("div#ganttview-vtheader-series-name-" + sId).remove();

                    let $itemDiv = $("div#ganttview-vtheader-item-name-" + cId);
                    $itemDiv.removeClass("ganttview-vtheader-item-name-selected");
                    let m = $itemDiv.css("height").replace(/px/, "");
                    let n = parseInt(m) - opts.cellHeight;
                    $itemDiv.css("height", n + "px");
                }
            }

            if (this.selectedBlock === block)
                this.selectedBlock = null;
        }

        // 添加甘特图
        function addGanttBlock(category, serie, task) {
            let $container = findBlockContainers(serie)
            if (!$container.length) return

            if (opts.viewMode === 'hour') {
                // hour模式
                let pixel_per_minutes = opts.cellWidth / 60;  // 每分钟的宽度
                let task_minutes = DateUtils.minutesBetween(task.start, task.end);
                let size = Math.floor(task_minutes * pixel_per_minutes) + 1;
                let offset = Math.floor(DateUtils.minutesBetween(opts.start, task.start) * pixel_per_minutes) + 1;

                let $block = $("<div>", {
                    "id": "ganttview-block-" + task.tId,
                    "class": "ganttview-block",
                    "title": (task.tip ? task.tip :
                        `${category.cName}: ${serie.sName}: ${task.tName}  任务时间: [${task.start.format("dd HH:mm")} -- ${task.end.format("dd HH:mm")}]`),
                    "css": {
                        "width": size + "px", // 甘特条宽度, 显示整天时，不精确定位小时
                        "height": opts.cellHeight - CONST_CELL_HGT_RESERVED + "px",  // 甘特条高度
                        "margin-left": offset + "px", // 左边距
                        "margin-top": CONST_CELL_TOP_MARGIN + "px",
                    }
                });

                if (task.isTask) $block.addClass("ganttview-task"); // 对于任务类型的处理
                if (serie.tasks.length > 1) {
                    $block.removeClass("ganttview-block-conflict")
                    if (checkTaskConflict(serie, task))
                        $block.addClass("ganttview-block-conflict");
                }

                updateBlockData($block, category, serie, task);

                // 有其他背景色的要求
                if (!!task.options && task.options.color) {
                    $block.css("background-color", task.options.color);
                }

                // 放置文本位置
                $block.append($("<div>", {
                    "id": "ganttview-block-text-" + task.tId,
                    "class": "ganttview-block-text",
                    "css": {
                        "height": opts.cellHeight - CONST_CELL_HGT_RESERVED + "px",
                        "line-height": opts.cellHeight - CONST_CELL_HGT_RESERVED + "px"
                    },
                    "margin-top": CONST_CELL_TOP_MARGIN + "px",
                }).text(DateUtils.getTagFromMinutes(task_minutes)));

                $container.append($block)
            } else {
                // day 模式
                let size = DateUtils.daysBetween(task.start, task.end) + 1;
                let offset = DateUtils.daysBetween(opts.start, task.start, true);

                let $block = $("<div>", {
                    "id": "ganttview-block-" + task.tId,
                    "class": "ganttview-block",
                    "title": (task.tip ? task.tip :
                        `${category.cName}: ${serie.sName}: ${task.tName}  任务时间: [${task.start.format("dd HH:mm")} -- ${task.end.format("dd HH:mm")}]`),
                    "css": {
                        "width": ((size * opts.cellWidth) - CONST_CELL_HGT_RESERVED) + "px", // 甘特条宽度, 显示整天时，不精确定位小时
                        "height": opts.cellHeight - CONST_CELL_HGT_RESERVED + "px",  // 甘特条高度
                        "margin-left": ((offset * opts.cellWidth) + CONST_DAY_LEFT_MARGIN) + "px", // 左边距，4为gantt条的左边所在单元的边距
                        "margin-top": CONST_CELL_TOP_MARGIN + "px",
                    }
                });

                if (task.isTask) $block.addClass("ganttview-task"); // 对于任务类型的处理
                if (serie.tasks.length > 1) {
                    $block.removeClass("ganttview-block-conflict")
                    if (checkTaskConflict(serie, task))
                        $block.addClass("ganttview-block-conflict");
                }

                updateBlockData($block, category, serie, task);

                // 有其他背景色的要求
                if (!!task.options && task.options.color) {
                    $block.css("background-color", task.options.color);
                }

                // 放置文本位置
                $block.append($("<div>", {
                    "id": "ganttview-block-text-" + task.tId,
                    "class": "ganttview-block-text",
                    "css": {
                        "height": opts.cellHeight - CONST_CELL_HGT_RESERVED + "px",
                        "line-height": opts.cellHeight - CONST_CELL_HGT_RESERVED + "px"
                    },
                    "margin-top": CONST_CELL_TOP_MARGIN + "px",
                }).text(size + "天"));

                $container.append($block)
            }
        }

        return {
            timeHandler: _timeHandler,
            selectedBlock: _selectedBlock,
            selectedBlockOld: _selectedBlockOld,

            cleanup: cleanup,
            refreshGanttBlock: refreshGanttBlock,
            deleteGanttBlock: deleteGanttBlock,
            addGanttBlock: addGanttBlock,
            render: render,
            gotoNow: gotoNow,
        };
    }

    var Behavior = function ($view, chart, categories, opts) {

        function apply() {
            if (opts.behavior.clickable) {
                bindBlockClick($view, chart, opts.behavior.onClick);
            }

            if (opts.behavior.resizable) {
                bindBlockResize($view, chart, opts.cellWidth, opts.start, opts.behavior.onResize);
            }

            if (opts.behavior.draggable) {
                bindBlockDrag($view, chart, opts.cellWidth, opts.cellHeight, opts.start, opts.behavior.onDrag);
            }

            if (opts.gridHoverV || opts.gridHoverH) {
                mouseHoverHandler($view, chart, opts);
            }
        }

        // 甘特条点击事件
        function bindBlockClick(_container, _chart, callback) {
            $("div.ganttview-block", _container).on("click", function () {
                let $block = $(this);
                let $blockOld = _chart.selectedBlock
                _chart.selectedBlockOld = $blockOld
                _chart.selectedBlock = $block

                let newTask = $block.data("block-data")._task;
                let oldTask = ($blockOld) ? ($blockOld.data("block-data") ? $blockOld.data("block-data")._task : null) : null;

                if (newTask !== oldTask) {
                    $block.addClass("gannttview-block-selected")
                    if ($blockOld)
                        $blockOld.removeClass("gannttview-block-selected")
                }

                if (callback) {
                    callback($block.data("block-data"));
                }
            });
        }

        // 甘特图改变大小事件
        function bindBlockResize(_container, _chart, cellWidth, startDate, callback) {
            if (opts.viewMode === 'hour') return;  // 禁止改变

            $("div.ganttview-block", _container).each(function () {
                let $block = $(this);
                let block_data = $block.data("block-data");

                if (block_data && block_data.options && block_data.options.resizable) {
                    (typeof $block.resizable === "function") && $block.resizable({
                        grid: [cellWidth, 0],
                        handles: "e,w",
                        stop: function () {
                            updateDataAndPosition(_container, $block, cellWidth, startDate);
                            if (callback) {
                                callback(block_data);
                            }
                        }
                    });
                }
            });
        }

        // 甘特图拖拽事件
        function bindBlockDrag(_container, _chart, cellWidth, cellHeight, startDate, callback) {
            $("div.ganttview-block", _container).each(function () {
                // 对每一个甘特条，进行处理
                let $block = $(this);
                let block_data = $block.data("block-data");

                if (block_data && block_data.options && block_data.options.draggable && (typeof $block.draggable === "function")) {
                    if (opts.viewMode === 'hour') {
                        $block.draggable({
                            axis: "y",
                            grid: [cellWidth, cellHeight],
                            containment: 'parent.parent',
                            start: function (e, ui) {
                                $(this).css("z-index", 10);
                            },
                            stop: function (e, ui) {
                                let $__block = $(this);
                                $__block.css("z-index", 2);

                                let __block_data = $__block.data("block-data");
                                if (!__block_data) return;
                                if (__block_data._noChange) {
                                    delete __block_data._noChange;
                                    return;
                                }

                                updateDataAndPosition(_container, $__block, cellWidth, startDate);
                                if (callback) {
                                    callback(__block_data);
                                }
                            }
                        });
                    } else {
                        $block.draggable({
                            grid: [cellWidth, cellHeight],
                            containment: 'parent.parent',
                            start: function (e, ui) {
                                $(this).css("z-index", 10);
                            },
                            stop: function (e, ui) {
                                let $__block = $(this);
                                $__block.css("z-index", 2);
                                let __block_data = $__block.data("block-data");

                                if (!__block_data) return;
                                if (__block_data._noChange) {
                                    delete __block_data._noChange;
                                    return;
                                }

                                updateDataAndPosition(_container, $__block, cellWidth, startDate);
                                if (callback) {
                                    callback(__block_data);
                                }
                            }
                        });
                    }
                }
            });
        }

        // 拖拽后放下，更改gantt条
        function updateDataAndPosition(container, block, cellWidth, startDate) {
            let block_data = block.data("block-data");
            if (typeof block_data === 'undefined') return;

            if (opts.viewMode === 'hour') {
                // hour模式
                // 保持原来的位置不变。
                let pixel_per_minutes = opts.cellWidth / 60;
                let offset = Math.floor(DateUtils.minutesBetween(opts.start, block_data.start) * pixel_per_minutes) + 1;

                // Remove top and left properties to avoid incorrect block positioning,
                // set position to relative to keep blocks relative to scrollbar when scrolling
                block.css("top", "").css("left", "")
                    .css("position", "relative").css("margin-left", offset + "px");

            } else {
                let $_container_ = $("div.ganttview-slide-container", container);
                let scroll = $_container_.scrollLeft();
                let offset = block.offset().left - $_container_.offset().left - 1 + scroll;

                // Set new start date
                let daysFromStart = Math.floor(offset / cellWidth);
                let newStart = DateUtils.addDays(new Date(startDate), daysFromStart);

                // Set new end date
                let width = block.outerWidth();
                let numberOfDays = Math.floor(width / cellWidth);
                let newEnd = DateUtils.addDays(new Date(newStart), numberOfDays);

                $("div.ganttview-block-text", block).text(numberOfDays + 1 + "天");

                block_data.start = newStart;
                block_data.end = newEnd;

                // Remove top and left properties to avoid incorrect block positioning,
                // set position to relative to keep blocks relative to scrollbar when scrolling
                block.css("top", "").css("left", "")
                    .css("position", "relative").css("margin-left", offset + "px");
            }
        }

        //鼠标移入效果处理
        function mouseHoverHandler(_container, _chart, _opts) {
            $("div.ganttview-grid-row-cell", _container).mouseover(function () {
                let $this = $(this)
                if (_opts.gridHoverV) {
                    $this.addClass('ganttview-grid-row-cell-hover')
                    let indexCount = $this.index()
                    $('.ganttview-grid-row', _container).each(function (index, item) {
                        $(item).find('.ganttview-grid-row-cell').eq(indexCount).addClass('ganttview-grid-row-cell-hover')
                    })
                    $('.ganttview-hzheader-day', _container).eq(indexCount).addClass('ganttview-grid-row-cell-hover')
                }
                if (_opts.gridHoverH) {
                    $this.siblings().addClass('ganttview-grid-row-row-hover')
                }
            }).mouseout(function () {
                let $this = $(this)
                if (_opts.gridHoverV) {
                    $this.removeClass('ganttview-grid-row-cell-hover')
                    let indexCount = $(this).index()
                    $('.ganttview-grid-row', _container).each(function (index, item) {
                        $(item).find('.ganttview-grid-row-cell').eq(indexCount).removeClass('ganttview-grid-row-cell-hover')
                    })
                    $('.ganttview-hzheader-day', _container).eq(indexCount).removeClass('ganttview-grid-row-cell-hover')
                }
                if (_opts.gridHoverH) {
                    $this.siblings().removeClass('ganttview-grid-row-row-hover')
                }
            });
        }

        return {
            apply: apply
        };
    }

    var ArrayUtils = {
        contains: function (arr, obj) {
            let has = false;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === obj) {
                    has = true;
                }
            }
            return has;
        }
    };

    // 日期工具
    var DateUtils = {
        // date1 < data2 返回-1， 相等 0， 大于 1
        compareDate: function (date1, date2) {
            if (isNaN(date1) || isNaN(date2)) {
                throw new Error(date1 + " - " + date2);
            } else if (date1 instanceof Date && date2 instanceof Date) {
                return (date1 < date2) ? -1 : (date1 > date2) ? 1 : 0;
            } else {
                throw new TypeError(date1 + " - " + date2);
            }
        },

        getMonthNames: function (m) {
            return currentLanguage.monthNameShort[m]
        },

        getWeekName: function (w) {
            return currentLanguage.dayOfWeekNames[w]
        },

        getWeekFullName: function (w) {
            return currentLanguage.dayOfWeekNames[w]
        },

        //获取一天内24小时
        getHours: function () {
            let hours = [];
            for (let i = 0; i < 24; i++) {
                if (i < 10) {
                    i = '0' + i
                }
                hours.push(`${i}:00`)
            }
            return hours;
        },

        addDays: function (date, number) {
            if (typeof date === "string") {
                date = new Date(date)
            }
            return new Date(date.getTime() + 24 * 60 * 60 * 1000 * number);
        },

        // no_include_end: 不包含最后一天
        daysBetween: function (start, end, no_include_end) {
            if (!start || !end) {
                return 0;
            }
            if (new Date(start).getFullYear() === 1901 || new Date(end).getFullYear() === 8099) {
                return 0;
            }
            let count = 0, date = new Date(start);
            while (date.getTime() < new Date(end).getTime()) {
                count = count + 1;
                date = DateUtils.addDays(date, 1);
            }
            if (no_include_end && count>0) count --;
            return count;
        },

        minutesBetween: function (_start, _end) {
            if (!_start || !_end) {
                return 0;
            }
            let start = new Date(_start);
            let end = new Date(_end);
            if (start.getFullYear() === 1901 || end.getFullYear() === 8099) {
                return 0;
            }

            return (end.getTime() - start.getTime()) / (1000 * 60);
        },

        getTagFromMinutes: function (_minutes) {
            if (_minutes < 60) {
                return "" + _minutes.toFixed(1) + '分钟';
            }
            if (_minutes < 60 * 24) {
                return "" + (_minutes / 60).toFixed(1) + '小时';
            }
            return "" + (_minutes / (60 * 24)).toFixed(1) + '天';
        },

        isWeekend: function (date) {
            return date.getDay() % 6 === 0;
        },

        isSaturday: function (date) {
            return date.getDay() === 6;
        },

        isSunday: function (date) {
            return date.getDay() === 0;
        },

        // get week startDate and endDate
        getWeekStartEndDate: function (weekDate) {
            const date = new Date(weekDate);
            const start = new Date(
                date.setDate(
                    date.getDate() - Math.abs(date.getDay() - this.options.weekStart)
                )
            );
            const end = new Date(
                date.setDate(
                    date.getDate() - date.getDay() + (6 + this.options.weekStart)
                )
            );

            // Return the start and end dates
            return {
                start: start,
                end: end,
            };
        },

        // get month start and end date of a date
        getMonthStartEndDate: function (date) {
            date = new Date(date); // date for which we find month start and month end
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Add 1 because getMonth() returns 0-indexed months
            const firstDayOfMonth = new Date(year, month - 1, 1);
            const lastDayOfMonth = new Date(year, month, 0);
            return {
                start: firstDayOfMonth,
                end: lastDayOfMonth,
            };
        },

        // get quarter start and end date of a date
        getQuarterStartEndDate: function (date) {
            const year = date.getFullYear();
            const month = date.getMonth();

            const quarterStartMonth = Math.floor(month / 3) * 3;
            const quarterStartDate = new Date(year, quarterStartMonth, 1);
            const quarterEndDate = new Date(year, quarterStartMonth + 3, 0);

            return {
                start: quarterStartDate,
                end: quarterEndDate,
            };
        },

        getQuarterOfDate: function(date) {
            let m = math.round((date.getMonth() + 1) / 4)
            return currentLanguage.quarterNames[m]
        },

        //是否为当前小时
        isShowHourLine: function (date, hour) {
            let y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
            let _now = new Date();
            let _y = _now.getFullYear(), _m = _now.getMonth(), _d = _now.getDate(), _h = _now.getHours();

            return (_h === hour) && (_d === d) && (_m === m) && (_y === y);
        },

        isShowDayLine: function (date) {
            let y = date.getFullYear(), m = date.getMonth(), d = date.getDate()
            let _now = new Date();
            let _y = _now.getFullYear(), _m = _now.getMonth(), _d = _now.getDate()

            return (_d === d) && (_m === m) && (_y === y);
        },

        // format date into given format
        formatDateToString: function (format, date) {
            let dateFormat = currentLanguage;
            date = new Date(date);
            let that = this;
            return format.replace(/%[a-zA-Z]/g, function (format) {
                switch (format) {
                    case "%d":
                        return _toFixed(date.getDate());
                    case "%m":
                        return _toFixed(date.getMonth() + 1);
                    case "%q":
                        return that.getQuarterOfDate(date);
                    case "%j":
                        return date.getDate();
                    case "%n":
                        return date.getMonth() + 1;
                    case "%y":
                        return _toFixed(date.getFullYear() % 100);
                    case "%Y":
                        return date.getFullYear();
                    case "%D":
                        return dateFormat.dayNameShort[date.getDay()];
                    case "%l":
                        return dateFormat.dayNameFull[date.getDay()];
                    case "%M":
                        return dateFormat.monthNameShort[date.getMonth()];
                    case "%F":
                        return dateFormat.monthNameFull[date.getMonth()];
                    case "%h":
                        return _toFixed(((date.getHours() + 11) % 12) + 1);
                    case "%g":
                        return ((date.getHours() + 11) % 12) + 1;
                    case "%G":
                        return date.getHours();
                    case "%H":
                        return _toFixed(date.getHours());
                    case "%i":
                        return _toFixed(date.getMinutes());
                    case "%a":
                        return date.getHours() > 11 ? "pm" : "am";
                    case "%A":
                        return date.getHours() > 11 ? "PM" : "AM";
                    case "%s":
                        return _toFixed(date.getSeconds());
                    case "%W":
                        return _toFixed(_getWeekNumber(date));
                    default:
                        return format;
                }
            });

            function _toFixed(t) {
                return t < 10 ? "0" + t : t;
            }

            // get week number
            function _getWeekNumber(t) {
                if (!t) return !1;
                let n = t.getDay();
                0 === n && (n = 7);
                let i = new Date(t.valueOf());
                i.setDate(t.getDate() + (4 - n));
                let r = i.getFullYear(),
                    a = Math.round((i.getTime() - new Date(r, 0, 1).getTime()) / 864e5);
                return 1 + Math.floor(a / 7);
            }
        },

        // add days in date
        add: function (t, e, n) {
            let i = new Date(t.valueOf());
            switch (n) {
                case "day":
                    i = this._add_days(i, e, t);
                    break;
                case "week":
                    i = this._add_days(i, 7 * e, t);
                    break;
                case "month":
                    i.setMonth(i.getMonth() + e);
                    break;
                case "year":
                    i.setFullYear(i.getFullYear() + e);
                    break;
                case "hour":
                    i.setTime(i.getTime() + 60 * e * 60 * 1e3);
                    break;
                case "minute":
                    i.setTime(i.getTime() + 60 * e * 1e3);
                    break;
                default:
                    return this["add_" + n](t, e, n);
            }
            return i;
        },

        // add days in date
        _add_days: function (t, e, n) {
            t.setDate(t.getDate() + e);
            let i = e >= 0,
                r = !n.getHours() && t.getHours(),
                a =
                    t.getDate() <= n.getDate() ||
                    t.getMonth() < n.getMonth() ||
                    t.getFullYear() < n.getFullYear();
            return (
                i && r && a && t.setTime(t.getTime() + 36e5 * (24 - t.getHours())), t
            );
        },

    };

    var Utils = {
        getTitle: function (name, distance) {
            return name + ", " + distance + '天';
        },
    };
})(jQuery);