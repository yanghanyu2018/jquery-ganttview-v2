/*
Original from jQuery.ganttView v.0.8.8
Copyright (c) 2010 JC Grubbs - jc.grubbs@devmynd.com
MIT License Applies

Modified by: Jack Yang, 2024.1
Modified:
1) Change to support stacked tasks.
2) Support now-time line
3) Support month/week/day mode
4) Support JQuery 3.0+ and need jquery-ui-1.13+ to implement drag functions
5)
*/

/*

//
data ：数据三级名称：categories (cId) , series (sId), tasks (tId)
data格式如下
 -----------------
    [
        {
            cId: 2, cName: "资源A", series: [
                {
                    sId: 1,
                    sName: "任务1",
                    start: '2018/01/05', // 总任务开始，时间格式
                    end: '2018/01/20',   // 总任务结束，时间格式
                    isTask: true,        // 是否任务。如果是任务的话，则可以拖拽
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
                        // 下一个task
                        ...
                    ],
                    options:{ // 如果使用此总bar，则以下有效
                        resizable?:boolean, // default:true
                        draggable?:boolean, // default:true
                        color?: string
                    }
                 },

                // 下一个serie
                 ...
            ]
        },
        // 下一个category
    ]

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
*/

(function (jQuery) {
    var defaults = {
        viewMode: 'day',         // hour, day, week, month
        multiGantt: false,       // true: 一行多任务,  false: 一行单任务
        showWeekends: true,
        showNowTimeline: false,
        cellWidth: 40,           // 单元格宽度
        cellHeight: 30,          // 单元格高度
        vtHeaderWidth: 240,
        vtHeaderName: "名称",
        vtHeaderSubName: "任务",
        data: [],                // 数据
        dataUrl: null,           // 数据url
        gridHoverV: true,        // 是否鼠标移入效果(列)
        gridHoverH: false,       // 是否鼠标移入效果(行)
        behavior: {
            clickable: true,
            draggable: true,
            resizable: true
        }
    };

    // 选项和数据
    var ganttOpts = {};
    var ganttDataset = [];

    jQuery.fn.ganttView = function () {
        var ganttView = null;
        var ganttChart = null;
        var ganttBehavior = null;

        let args = Array.prototype.slice.call(arguments);

        if (args.length === 2 && typeof (args[0]) === "object" && typeof (args[1]) === "object") {
            ganttView = this;
            // 第一个对象为数据，第二个为options
            build.call(ganttView, false, args[0], args[1]);
        } else if (args.length >= 1 && typeof (args[0] === "string")) {
            handleMethod.call(ganttView, args);
        } else{
            ganttView = this;
        }

        function build(skip, _data, _options) {
            if (skip) {
                if (_options)  ganttOpts = _options;
                if (_data) ganttDataset = _data;
                _init_(ganttDataset, ganttOpts);
            } else {
                let opts = jQuery.extend(true, defaults, _options);
                if (_data) {
                    ganttOpts = opts;
                    ganttDataset = _data
                    _init_(_data, opts);
                } else if (opts.dataUrl) {
                    jQuery.getJSON(opts.dataUrl, function (data) {
                        ganttDataset = data
                        jQuery.extend(true, ganttOpts, opts);
                        _init_(data, ganttOpts);
                    });
                }
            }

            // 对数据进行初始化处理
            function _init_(_data, _opts) {
                for (let category of _data) {
                    if (!category.series || category.series.length === 0) {
                        // 没有任务则加一条空的任务
                        category.series = [{
                            cId: category.cId,
                            sId: Math.floor((Math.random() + 1) * 1000000),
                            sName: '暂无任务',
                            _empty: true,
                            tasks: [],
                        }];
                        continue;
                    }

                    for (let serie of category.series) {
                        if (!serie.sId) serie.sId = Math.floor((Math.random() + 1) * 1000000);
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
                                    start: serie.start,
                                    end: serie.end,
                                    isTask: true, // 确定任务
                                }
                                let opts = {}
                                jQuery.extend(opts, serie.options, task.options);
                                task.options = opts;

                                delete serie.isTask;  // !!!必须取消此项
                                serie.tasks.push(task);
                            } else if (serie.tasks.length>0) {
                                if (typeof serie.isTask !== 'undefined')
                                    delete serie.isTask;  // !!!必须取消此项
                                for (let task of serie.tasks) {
                                    task.sId = serie.sId;
                                    task.cId = category.cId;
                                    if (typeof (task.start) !== 'object') task.start = new Date(task.start);  // 修改为日期格式
                                    if (typeof (task.end) !== 'object') task.end = new Date(task.end);
                                    if (typeof task.isTask === 'undefined') task.isTask = true; // 缺省为任务

                                    let opts = {}
                                    jQuery.extend(opts, serie.options, task.options);
                                    task.options = opts;
                                }
                            }  else {
                                serie._empty = true;
                            }
                        }
                    }
                }

                let minDays = Math.floor(((ganttView.outerWidth() - _opts.vtHeaderWidth) / _opts.cellWidth) + 15);
                let startEnd = DateUtils.getBoundaryDatesFromData(_data, minDays);

                // 设置gantt图的整体时间范围
                _opts.start = startEnd[0]; // 起始时间
                _opts.end = startEnd[1];   // 截止时间

                // 可以针对多个
                let div = jQuery("<div>", {"class": "ganttview"});
                ganttChart = new Chart(ganttView, div, _data, _opts).render();
                ganttView.append(div);
                ganttBehavior = new Behavior(ganttView, _data, _opts).apply();
            }
        }

        // 调用方式：
        // $("#ganttChart").ganttView("refresh");
        // $("#ganttChart").ganttView("getDataset", function(set){});
        // $("#ganttChart").ganttView("setSlideWidth", 600);
        function handleMethod(args) {
            if (args.length > 1) {
                if (args[0] === "setSlideWidth") {
                    let div = $("div.ganttview", this);
                    div.each(function () {
                        let vtWidth = $("div.ganttview-vtheader", div).outerWidth();
                        $(div).width(vtWidth + value + 1);
                        $("div.ganttview-slide-container", this).width(value);
                    });
                }
            } else {
                if (args[0] === "refresh") {
                    refreshGantt.call(ganttView, [], {});
                }
            }
        }

        // 刷新甘特图
        function refreshGantt( _data, _options) {
            if (ganttView) {
                ganttView.children().remove();
                build(true,  _data, _options);
            }
        }

        return {
            refreshGantt: refreshGantt,
            build: build,
            handleMethod: handleMethod,
        }
    };  // end of ganttView

    // 甘特图的处理
    var Chart = function (view, container, categories, opts) {
        var _this = this;
        var _thisView = view

        var ganttTimeHandler = null;
        var ganttOldGridCell = null;
        var ganttNowGridCell = null;

        var ganttSelectedBlock = null; // 选中Block

        function render() {
            addVtHeader(container, categories, opts);
            let slideDiv = jQuery("<div>", {
                "class": "ganttview-slide-container",
            });

            let dates = getDates(opts.start, opts.end);
            addHzHeader(slideDiv, dates, opts);
            addGrid(slideDiv, categories, dates, opts);
            addBlockContainers(slideDiv, categories, opts);
            addBlocks(slideDiv, categories, opts);

            container.append(slideDiv);
            applyLastClass(container.parent());

            if (opts.showNowTimeline) {
                if (ganttTimeHandler) clearInterval(ganttTimeHandler);
                ganttTimeHandler = setInterval(function () {
                    // TODO: do something
                }, 5000);
            }
        }

        // Creates a 3-dimensional array [year][month][day] of every day
        // between the given start and end dates
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

        // 表格头部处理
        function addVtHeader(container, _categories, _opts) {
            // 修改左边标题栏宽度
            let headerDiv = jQuery("<div>", {
                "class": "ganttview-vtheader",
                "css": {"width": _opts.vtHeaderWidth + "px"}
            });

            // 修改左边标题栏高度
            let headerTitleDiv = jQuery("<div>", {
                "class": "ganttview-vtheader-title",
                "css": {"width": _opts.vtHeaderWidth + "px", "height": _opts.cellHeight * 2 + 1 + "px"}
            });

            // 修改左边标题栏
            headerTitleDiv.append(jQuery("<div>", {
                "class": "ganttview-vtheader-title-name",
                "css": {"height": "100%", "line-height": _opts.cellHeight * 2 + 1 + "px", "width": "80px"}
            }).append(_opts.vtHeaderName));

            headerTitleDiv.append(jQuery("<div>", {
                "class": "ganttview-vtheader-title-name",
                "css": {"height": "100%", "line-height": _opts.cellHeight * 2 + 1 + "px", "width": "calc(100% - 81px)"}
            }).append(_opts.vtHeaderSubName));

            headerDiv.append(headerTitleDiv);
            for (let category of _categories) {
                // 左边标题栏项目
                let itemDiv = jQuery("<div>", {
                    "id": "ganttview-vtheader-item-" + category.cId,
                    "title": category.cName,
                    "class": "ganttview-vtheader-item",
                    "css": {"height": (category.series.length * _opts.cellHeight) + "px"}
                });

                // 左边标题栏项目名称
                itemDiv.append(jQuery("<div>", {
                    "id": "ganttview-vtheader-item-name-" + category.cId,
                    "class": "ganttview-vtheader-item-name",
                    "css": {
                        "height": (category.series.length * _opts.cellHeight) + "px",
                        "line-height": (category.series.length * _opts.cellHeight - 6) + "px"
                    }
                }).append(category.cName));

                // 左边任务序列名称
                let seriesDiv = jQuery("<div>", {"class": "ganttview-vtheader-series"});
                for (let serie of category.series) {
                    // 每个series中的一个元素，作为单独一行
                    seriesDiv.append(jQuery("<div>", {
                        "id": "ganttview-vtheader-series-name-" + serie.sId,
                        "class": "ganttview-vtheader-series-name",
                        "title": serie.sName,
                        "css": {"height": _opts.cellHeight + "px", "line-height": _opts.cellHeight - 6 + "px"}
                    }).append(serie.sName));
                }

                // 添加名称+任务名称
                itemDiv.append(seriesDiv);
                headerDiv.append(itemDiv);
            }

            container.append(headerDiv);
        }

        // 根据日期进行分割
        function addHzHeader(container, _categories, _opts) {
            let headerDiv = jQuery("<div>", {"class": "ganttview-hzheader"});
            let monthsDiv = jQuery("<div>", {"class": "ganttview-hzheader-months clearfix"});
            let daysDiv = jQuery("<div>", {"class": "ganttview-hzheader-days clearfix"});
            let totalW = 0;

            for (let y in _categories) {
                // 显示月份
                for (let m in _categories[y]) {
                    let w = _categories[y][m].length * _opts.cellWidth;
                    totalW = totalW + w;
                    monthsDiv.append(jQuery("<div>", {
                        "class": "ganttview-hzheader-month",
                        "css": {"width": w + "px"}
                    }).append(y + "年" + DateUtils.getMonthNames(m))); // 显示标题

                    // 显示日期
                    for (let d in _categories[y][m]) {
                        let dayDiv = jQuery("<div>", {
                            "class": "ganttview-hzheader-day",
                            "css": {"width": _opts.cellWidth + "px"}
                        });
                        dayDiv.append(_categories[y][m][d].getDate());

                        // 周末的处理
                        if (DateUtils.isWeekend(_categories[y][m][d]) && _opts.showWeekends) {
                            // dayDiv.addClass("ganttview-weekend");
                            if (DateUtils.isSaturday(_categories[y][m][d])) dayDiv.addClass("ganttview-saturday");
                            if (DateUtils.isSunday(_categories[y][m][d])) dayDiv.addClass("ganttview-sunday");
                        }

                        if (_opts.showNowTimeline) {
                            if (DateUtils.isShowDayLine(_categories[y][m][d])) {
                                // TODO：加载以后会造成界面混乱，暂缓处理
                                // dayDiv.append('<span class="ganttview-hzheader-day-now"></span>')
                            }
                        }
                        daysDiv.append(dayDiv);
                    }
                }
            }

            monthsDiv.css("width", totalW + "px");
            daysDiv.css("width", totalW + "px");
            headerDiv.append(monthsDiv).append(daysDiv);

            container.append(headerDiv);
        }

        // 增加网格线及网格单元
        function addGrid(container, _categories, _dates, _opts) {
            let gridDiv = jQuery("<div>", {"class": "ganttview-grid"});
            let rowDiv = jQuery("<div>", {"class": "ganttview-grid-row clearfix"});

            // 按日期形成网格线及网格单元
            for (let y in _dates) {
                for (let m in _dates[y]) {
                    for (let d in _dates[y][m]) {
                        let cellDiv = jQuery("<div>", {
                            "class": "ganttview-grid-row-cell",
                            "css": {"width": _opts.cellWidth + "px", "height": _opts.cellHeight + "px"}
                        });
                        if (DateUtils.isWeekend(_dates[y][m][d]) && _opts.showWeekends) {
                            // cellDiv.addClass("ganttview-weekend");
                            if (DateUtils.isSaturday(_dates[y][m][d])) cellDiv.addClass("ganttview-saturday");
                            if (DateUtils.isSunday(_dates[y][m][d])) cellDiv.addClass("ganttview-sunday");
                        }
                        if (_opts.showNowTimeline) {
                            if (DateUtils.isShowDayLine(_dates[y][m][d])) {
                                let nowHour = new Date().getHours();
                                let tmLine = Math.max((nowHour / 24) * _opts.cellWidth, 1);

                                cellDiv.append(`<span class="ganttview-hzheader-day-now" style="width:${tmLine}px!important;"></span>`)
                            }
                        }
                        rowDiv.append(cellDiv);
                    }
                }
            }

            // 对grid单元进行处理
            let w = jQuery("div.ganttview-grid-row-cell", rowDiv).length * _opts.cellWidth;
            rowDiv.css("width", w + "px");
            gridDiv.css("width", w + "px");
            for (let category of _categories) {
                // 第一项：作为名称
                for (let serie of category.series) {
                    // 第二项：每一个序列定义了一行
                    let cloneRowDiv = rowDiv.clone(); // 复制每一行
                    cloneRowDiv.attr("id", "ganttview-grid-row-" + serie.sId);
                    cloneRowDiv.attr("cId", category.cId);

                    // 每行都可以接受拖放的任务
                    (typeof cloneRowDiv.droppable === "function") && cloneRowDiv.droppable({
                        accept: '.ganttview-task', // 只接受的类型
                        hoverClass: "gantt-drag-hover",
                        drop: function (e, ui) {
                            let _sId = (this.id) ? this.id.replace("ganttview-grid-row-", '') : '';
                            let _cId = $(this).attr("cId");
                            let _task = ui.helper.data("block-data");
                            let task = findTask(_task.cId, _task.sId, _task.tId)

                            // 拖拽任务条结束
                            // 1) 先找到新行的位置。
                            // 2）如果是与原所在行相同，则返回，进入后续的修改位置处理
                            // 3）如果是与原所在行不相同，则进行如下处理：
                            // 3.1）单任务模式
                            // -- 如果serie没有任务，则在新Serie增加一个任务，删除原来Serie所在行的数据
                            // -- 如果serie已经有任务，则把原Serie改到newSerie之后，并修改为相同的category
                            // 3.2）多任务模式
                            // -- 在新Serie增加一个任务，同时修改serie的时间信息
                            // -- 在旧Serie删除一个任务，如果为空，则对serie标题进行修改，并清空start和end属性。
                            let newSerie = findSerie(_cId, _sId)
                            if (!newSerie) return;

                            let oldSerie = findSerie(task.cId, task.sId);
                            if (newSerie === oldSerie) return;

                            let i = findTaskIdx(oldSerie.tasks, task.cId, task.sId);
                            if (i >= 0) {
                                oldSerie.tasks.splice(i, 1);

                                oldSerie._empty = (oldSerie.tasks.length <= 0);
                                if (oldSerie._empty) {
                                    oldSerie.sName = "暂无任务";
                                    oldSerie.start = null;
                                    oldSerie.end = null;
                                }

                                newSerie._empty = false;
                                let newCategory = findCategory(newSerie.cId)

                                task.cId = newCategory.cId;
                                task.sId = newSerie.sId;
                                if (newSerie.sName === "暂无任务" && task.tName)
                                    newSerie.sName = task.tName;

                                newSerie.tasks.push(task);
                                if (!_opts.multiGantt) {
                                    // TODO：删除oldSerie
                                } else {
                                    // TODO：修改newSerie的时间
                                }

                                _thisView.ganttView().refreshGantt.call(_this, ganttDataset, ganttOpts);
                            }
                        }
                    });

                    // 添加这一新行
                    gridDiv.append(cloneRowDiv);
                }
            }
            container.append(gridDiv);
        }

        function addBlockContainers(container, _categories, _opts) {
            let blocksDiv = jQuery("<div>", {"class": "ganttview-blocks"});
            for (let category of _categories) {
                for (let serie of category.series) {
                    // 每个series中的一个元素，作为单独一行
                    let containerDiv = jQuery("<div>", {
                        "id": "ganttview-block-container-" + serie.sId,
                        "class": "ganttview-block-container",
                        "css": {"height": _opts.cellHeight + "px"} // 注：gantt bar要比这个小，预留空间为其它用途
                    });
                    containerDiv.attr('data-cId', category.cId)
                    blocksDiv.append(containerDiv);
                }
            }
            container.append(blocksDiv);
        }

        function addBlocks(container, _categories, _opts) {
            let rows = jQuery("div.ganttview-blocks div.ganttview-block-container", container);

            let rowIdx = 0;
            for (let category of _categories) {
                for (let serie of category.series) {
                    if (serie._empty) {
                        rowIdx++;
                        continue;
                    }

                    // 对每个gantt条数据进行处理
                    let _count = 0;
                    for (let task of serie.tasks) {
                        _count++;
                        let size = DateUtils.daysBetween(task.start, task.end) + 1;

                        let offset = DateUtils.daysBetween(_opts.start, task.start);

                        let block = jQuery("<div>", {
                            "id": "ganttview-block-" + task.tId,
                            "class": "ganttview-block",
                            "title": category.cName + ": " + serie.sName + ": " + task.tName + "： " + size + " 天",
                            "css": {
                                "width": ((size * _opts.cellWidth) - 8) + "px", // 甘特条宽度, 显示整天时，不精确定位小时
                                "height": _opts.cellHeight - 8 + "px",  // 甘特条高度
                                "margin-left": ((offset * _opts.cellWidth) + 4) + "px", // 左边距，4为gantt条的左边所在单元的边距
                                "margin-top": 2 + "px",
                            }
                        });

                        if (task.isTask) block.addClass("ganttview-task"); // 对于任务类型的处理
                        if (_count > 1 && _opts.multiGantt) block.addClass("ganttview-block-more");

                        addBlockData(block, category, serie, task);

                        // 有其他背景色的要求
                        if (!!task.options && task.options.color) {
                            block.css("background-color", task.options.color);
                        }

                        // 放置文本位置
                        block.append(jQuery("<div>", {
                            "id": "ganttview-block-text-" + task.tId,
                            "class": "ganttview-block-text",
                            "css": {"height": _opts.cellHeight - 8 + "px", "line-height": _opts.cellHeight - 8 + "px"},
                            "margin-top": 2 + "px",
                        }).text(size + "天"));

                        jQuery(rows[rowIdx]).append(block);

                        if (!_opts.multiGantt) break;
                    }
                    rowIdx = rowIdx + 1;
                }
            }
        }

        // 修改甘特条的数据内容
        function addBlockData(block, _category, _serie, _task) {
            let options = {draggable: true, resizable: true};

            let blockData = {cId: _category.cId, sId: null, tId: null};
            let blockCategory = {}, blockSerie = {}, blockTask = {};
            jQuery.extend(blockCategory, _category); delete blockCategory.series; delete blockCategory.options;
            jQuery.extend(blockSerie, _serie); delete blockSerie.tasks;  delete blockSerie.options;
            jQuery.extend(blockSerie, _task); delete blockTask.options;

            jQuery.extend(options, (_serie ? _serie.options : {}), (_task ? _task.options : {}));
            jQuery.extend(blockData, blockCategory, blockSerie, blockSerie);

            blockData.options = options;
            block.data("block-data", blockData);
        }

        function applyLastClass(container) {
            jQuery("div.ganttview-grid-row div.ganttview-grid-row-cell:last-child", container).addClass("last");
            jQuery("div.ganttview-hzheader-days div.ganttview-hzheader-day:last-child", container).addClass("last");
            jQuery("div.ganttview-hzheader-months div.ganttview-hzheader-month:last-child", container).addClass("last");
        }

        function findTaskIdx(tasks, cId, sId) {
            let i = 0;
            for (let task of tasks) {
                if (task.sId == sId && task.cId == cId) {
                    return i;
                }
                i++;
            }
            return -1
        }

        function findCategory(cId) {
            let obj = null;
            for (let category of categories) {
                if (category.cId == cId) {
                    obj = category;
                    break;
                }
            }
            return obj;
        }

        function findSerie(cId, sId) {
            let obj = null;
            for (let category of categories) {
                if (category.cId == cId) {
                    for (let serie of category.series) {
                        if (serie.sId == sId) {
                            obj = serie;
                            break;
                        }
                    }
                }
            }
            return obj;
        }

        function findTask(cId, sId, tId) {
            let obj = null;
            for (let category of categories) {
                if (category.cId === cId) {
                    for (let serie of category.series) {
                        if (serie.sId === sId) {
                            for (let task of serie.tasks) {
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

        return {
            render: render
        };
    }

    var Behavior = function (container, _categories, opts) {

        function apply() {
            if (opts.behavior.clickable) {
                bindBlockClick(container, opts.behavior.onClick);
            }

            if (opts.behavior.resizable) {
                bindBlockResize(container, opts.cellWidth, opts.start, opts.behavior.onResize);
            }

            if (opts.behavior.draggable) {
                bindBlockDrag(container, opts.cellWidth, opts.cellHeight, opts.start, opts.behavior.onDrag);
            }

            if (opts.gridHoverV || opts.gridHoverH) {
                mouseHoverHandler(opts);
            }
        }

        // 甘特条点击事件
        function bindBlockClick(container, callback) {
            jQuery("div.ganttview-block", container).on("click", function () {
                if (callback) {
                    callback(jQuery(this).data("block-data"));
                }
            });
        }

        // 甘特图改变大小事件
        function bindBlockResize(container, cellWidth, startDate, callback) {
            jQuery("div.ganttview-block", container).each(function () {
                let $block = jQuery(this);
                let block_data = $block.data("block-data");

                if (block_data && block_data.options && block_data.options.resizable) {
                    (typeof $block.resizable === "function") && $block.resizable({
                        grid: [cellWidth, 0],
                        handles: "e,w",
                        stop: function () {
                            updateDataAndPosition(container, $block, cellWidth, startDate);
                            if (callback) {
                                callback(block_data);
                            }
                        }
                    });
                }
            });
        }

        // 甘特图拖拽事件
        function bindBlockDrag(container, cellWidth, cellHeight, startDate, callback) {
            jQuery("div.ganttview-block", container).each(function () {
                // 对每一个甘特条，进行处理
                let $block = jQuery(this);
                let block_data = $block.data("block-data");

                if (block_data && block_data.options && block_data.options.draggable) {
                    (typeof $block.draggable === "function") && $block.draggable({
                        // axis: "x",
                        grid: [cellWidth, cellHeight],
                        containment: 'parent.parent',
                        start: function (e, ui) {
                            jQuery(this).css("z-index", 10);
                        },
                        drag: function (e, ui) {
                            // TODO: 不让越界
                        },
                        stop: function (e, ui) {
                            let $__block = jQuery(this);
                            $__block.css("z-index", 2);
                            let __block_data = $__block.data("block-data");

                            // 目前，甘特条以日为单位，未来需要精准一些
                            // let distance = (ui.position.left) / cellWidth;
                            // let s = DateUtils.addDays(block_data.start, distance);
                            // let e = DateUtils.addDays(block_data.end, distance);
                            // let n = DateUtils.daysBetween(startDate, s, false, false) * cellWidth + 3;
                            //
                            // $__block.css("margin-left", n + "px");
                            // $__block.css("left", "0px");

                            updateDataAndPosition(container, $__block, cellWidth, startDate);
                            if (callback) {
                                callback(__block_data);
                            }
                        }
                    });
                }
            });
        }

        //鼠标移入效果处理
        function mouseHoverHandler(opts) {
            jQuery("div.ganttview-grid-row-cell").mouseover(function () {
                let $this = jQuery(this)
                if (opts.gridHoverV) {
                    $this.addClass('ganttview-grid-row-cell-hover')
                    let indexcount = $this.index()
                    jQuery('.ganttview-grid-row').each(function (index, item) {
                        $(item).find('.ganttview-grid-row-cell').eq(indexcount).addClass('ganttview-grid-row-cell-hover')
                    })
                    jQuery('.ganttview-hzheader-day').eq(indexcount).addClass('ganttview-grid-row-cell-hover')
                }
                if (opts.gridHoverH) {
                    $this.siblings().addClass('ganttview-grid-row-row-hover')
                }
            }).mouseout(function () {
                let $this = jQuery(this)
                if (opts.gridHoverV) {
                    $this.removeClass('ganttview-grid-row-cell-hover')
                    let indexcount = $(this).index()
                    jQuery('.ganttview-grid-row').each(function (index, item) {
                        $(item).find('.ganttview-grid-row-cell').eq(indexcount).removeClass('ganttview-grid-row-cell-hover')
                    })
                    jQuery('.ganttview-hzheader-day').eq(indexcount).removeClass('ganttview-grid-row-cell-hover')
                }
                if (opts.gridHoverH) {
                    $this.siblings().removeClass('ganttview-grid-row-row-hover')
                }
            });
        }

        // 拖拽后放下，更改gantt条
        function updateDataAndPosition(container, block, cellWidth, startDate) {
            if (typeof block.data("block-data") === 'undefined') return;

            let _container = jQuery("div.ganttview-slide-container", container);
            let scroll = _container.scrollLeft();
            let offset = block.offset().left - _container.offset().left - 1 + scroll;

            // Set new start date
            let daysFromStart = Math.floor(offset / cellWidth);
            let newStart = DateUtils.addDays(new Date(startDate), daysFromStart);

            // Set new end date
            let width = block.outerWidth();
            let numberOfDays = Math.floor(width / cellWidth);
            let newEnd = DateUtils.addDays(new Date(newStart), numberOfDays);

            jQuery("div.ganttview-block-text", block).text(numberOfDays + 1 + "天");

            block.data("block-data").start = newStart;
            block.data("block-data").end = newEnd;

            // Remove top and left properties to avoid incorrect block positioning,
            // set position to relative to keep blocks relative to scrollbar when scrolling
            block.css("top", "").css("left", "")
                .css("position", "relative").css("margin-left", offset + "px");
        }

        return {
            apply: apply
        };
    }

    var ArrayUtils = {
        contains: function (arr, obj) {
            let has = false;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] == obj) {
                    has = true;
                }
            }
            return has;
        }
    };

    // 日期工具
    var DateUtils = {
        getMonthNames: function (m) {
            let monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
            return monthNames[m]
        },

        getWeekName: function (w) {
            let dayOfWeekNames = ["日", "一", "二", "三", "四", "五", "六"];
            return dayOfWeekNames[w]
        },

        //获取月份的每一天日期
        getMonths: function (_start, _end) {
            let start = Date.parse(_start);
            let end = Date.parse(_end);
            let months = [];
            months[start.getMonth()] = [start];
            let last = start;
            while (last.compareTo(end) == -1) {
                let next = last.clone().addDays(1);
                if (!months[next.getMonth()]) {
                    months[next.getMonth()] = [];
                }
                months[next.getMonth()].push(next);
                last = next;
            }
            return months;
        },

        //获取一天内24小时
        getHours: function () {
            let hours = [];
            for (let i = 0; i <= 24; i++) {
                if (i < 10) {
                    i = '0' + i
                }
                hours.push(`${i}`)
            }
            return hours;
        },

        addDays: function (date, number) {
            if (typeof date === "string") {
                date = new Date(date)
            }
            return new Date(date.getTime() + 24 * 60 * 60 * 1000 * number);
        },

        daysBetween: function (start, end) {
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
            return count;
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

        getBoundaryDatesFromData: function (data, minDays) {
            let minStart = DateUtils.addDays(new Date(), -15);
            let maxEnd = new Date();
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].series.length; j++) {
                    if (!data[i].series[j].start || !data[i].series[j].end) {
                        continue;
                    }
                    // series.start = new Date()
                    let start = new Date(data[i].series[j].start);
                    let end = new Date(data[i].series[j].end);
                    if (i === 0 && j === 0) {
                        minStart = new Date(start);
                        maxEnd = new Date(end);
                    }
                    if (minStart.getTime() > start.getTime()) {
                        minStart = new Date(start);
                    }
                    if (maxEnd.getTime() < end.getTime()) {
                        maxEnd = new Date(end);
                    }
                }
            }
            if (DateUtils.daysBetween(minStart, maxEnd) < minDays) {
                maxEnd = DateUtils.addDays(minStart, minDays);
            }

            return [minStart, maxEnd];
        },

        //是否为当前小时
        isShowHourLine: function (date) {
            return date.getHours() === new Date().getHours();
        },

        isShowDayLine: function (date) {
            let y = date.getYear(), m = date.getMonth(), d = date.getDate()
            let _now = new Date();
            let _y = _now.getYear(), _m = _now.getMonth(), _d = _now.getDate()

            return (_d === d) && (_m === m) && (_y === y);
        },

    };

    var Utils = {
        getTitle: function (name, distance) {
            return name + ", " + distance + '天';
        },
    };
})(jQuery);