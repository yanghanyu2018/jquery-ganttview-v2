/*
Original from jQuery.ganttView v.0.8.8
Copyright (c) 2010 JC Grubbs - jc.grubbs@devmynd.com
MIT License Applies

Modified by: Jack Yang, 2024.1
Modified:
1) TODO:　Change to support stacked tasks.
2) TODO: Support now-time line
3) TODO: Support month/week/day mode
4) Support JQuery 3.0+ and need jquery-ui-1.13+ to implement drag functions
5)
*/

/*
Options
-----------------
showWeekends: boolean  // 显示周末
showNowTimeline: boolean   // 显示当期时间线
ganttScale: string     // month/week/day

data: object
    data格式：[
        {
            id: 2, name: "资源A", series: [
                {
                    taskId: 1,
                    name: "任务1",
                    start: '2018/01/05', // 总任务开始，时间格式
                    end: '2018/01/20',   // 总任务结束，时间格式
                    options:{
                        resizable?:boolean, // default:true
                        draggable?:boolean, // default:true
                        color?: string
                    }
                 }
            ]
        }]

ganttMode: string, // hour, day, week, month
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
	draggable: boolean, // 如果不需要drag/resize此功能，则可以不用加载jquery-ui-*
	resizable: boolean,
	onClick: function,
	onDrag: function,
	onResize: function
}
*/

(function (jQuery) {
    var ganttOpts = {};
    var ganttView = null;

    jQuery.fn.ganttView = function () {

        var args = Array.prototype.slice.call(arguments);

        if (args.length === 1 && typeof (args[0]) === "object") {
            ganttView = this;
            build.call(ganttView, args[0]);
        } else if (args.length >= 1 && typeof (args[0] === "string")) {
            handleMethod.call(ganttView, args);
        }
    };

    function build(options) {
        var container = this;
        container.children().remove();

        var defaults = {
            ganttMode: 'day', // hour, day, week, month
            showWeekends: true,
            showNowTimeline: false,
            cellWidth: 40,
            cellHeight: 30,
            vtHeaderWidth: 240,
            vtHeaderName: "名称",
            vtHeaderSubName: "任务",
            data: [],           // 数据
            dataUrl: null,      // 数据url
            gridHoverV: true,   //是否鼠标移入效果(列)
            gridHoverH: false,  //是否鼠标移入效果(行)
            behavior: {
                clickable: true,
                draggable: true,
                resizable: true
            }
        };

        var opts = jQuery.extend(true, defaults, options);
        jQuery.extend(ganttOpts, opts);
        if (opts.data) {
            build();
        } else if (opts.dataUrl) {
            jQuery.getJSON(opts.dataUrl, function (data) {
                opts.data = data;
                jQuery.extend(ganttOpts, opts);
                build();
            });
        }

        function build() {
            for (var i = 0; i < opts.data.length; i++) {
                for (var j = 0; j < opts.data[i].series.length; j++) {
                    var serie = opts.data[i].series[j];
                    if (!!serie.start && !!serie.end) {
                        serie.start = new Date(serie.start);
                        serie.end = new Date(serie.end);
                    }
                }
            }

            var minDays = Math.floor(((ganttView.outerWidth() - opts.vtHeaderWidth) / opts.cellWidth) + 15);
            var startEnd = DateUtils.getBoundaryDatesFromData(opts.data, minDays);

            // 设置gantt图的整体时间范围
            opts.start = startEnd[0]; // 起始时间
            opts.end = startEnd[1];   // 截止时间

            var $container = jQuery(container);
            var div = jQuery("<div>", {"class": "ganttview"});
            new Chart(div, opts).render();
            $container.append(div);

            new Behavior($container, opts).apply();
        }
    }


    // 处理参数
    function handleMethod(args) {
        if (args.length > 1) {
            if (args[0] === "getDatas" && typeof (args[1]) === "function") {
                var datas = [];
                ganttOpts.data.forEach(function (value) {
                    var data = {};
                    jQuery.extend(data, value);
                    data.series = value.series.filter(function (v) {
                        return !v._empty;
                    });
                    datas.push(data);
                })
                args[1](datas);
            }
        }
    }

    // 甘特图的处理
    var Chart = function (div, opts) {

        function render() {
            addVtHeader(div, opts);
            var slideDiv = jQuery("<div>", {
                "class": "ganttview-slide-container",
            });

            var dates = getDates(opts.start, opts.end);
            addHzHeader(slideDiv, dates, opts);
            addGrid(slideDiv, opts.data, dates, opts);
            addBlockContainers(slideDiv, opts.data, opts);
            addBlocks(slideDiv, opts.data, opts);

            div.append(slideDiv);
            applyLastClass(div.parent());
        }

        // Creates a 3-dimensional array [year][month][day] of every day
        // between the given start and end dates
        function getDates(start, end) {
            var dates = [];
            dates[start.getFullYear()] = [];
            dates[start.getFullYear()][start.getMonth()] = [start];
            var last = start;
            while (last.getTime() < end.getTime()) {
                var next = DateUtils.addDays(new Date(last), 1);
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
        function addVtHeader(div, opts) {
            let data = opts.data;

            // 修改左边标题栏宽度
            var headerDiv = jQuery("<div>", {
                "class": "ganttview-vtheader",
                "css": {"width": opts.vtHeaderWidth + "px"}
            });

            // 修改左边标题栏高度
            var headerTitleDiv = jQuery("<div>", {
                "class": "ganttview-vtheader-title",
                "css": {"width": opts.vtHeaderWidth + "px", "height": opts.cellHeight * 2 + 1 + "px"}
            });

            // 修改左边标题栏
            headerTitleDiv.append(jQuery("<div>", {
                "class": "ganttview-vtheader-title-name",
                "css": {"height": "100%", "line-height": opts.cellHeight * 2 + 1 + "px", "width": "80px"}
            }).append(opts.vtHeaderName));

            headerTitleDiv.append(jQuery("<div>", {
                "class": "ganttview-vtheader-title-name",
                "css": {"height": "100%", "line-height": opts.cellHeight * 2 + 1 + "px", "width": "calc(100% - 81px)"}
            }).append(opts.vtHeaderSubName));

            headerDiv.append(headerTitleDiv);
            for (var i = 0; i < data.length; i++) {
                // 初始化任务，注意：这个任务是显示在左边栏的数据
                if (!data[i].series || data[i].series.length === 0) { // 没有任务则加一条空的任务
                    data[i].series = [{id: null, name: '暂无任务', _empty: true}];
                }

                // 左边标题栏项目
                var itemDiv = jQuery("<div>", {
                    "class": "ganttview-vtheader-item",
                    "css": {"height": (data[i].series.length * opts.cellHeight) + "px"}
                });

                // 左边标题栏项目名称
                itemDiv.append(jQuery("<div>", {
                    "class": "ganttview-vtheader-item-name",
                    "css": {
                        "height": (data[i].series.length * opts.cellHeight) + "px",
                        "line-height": (data[i].series.length * opts.cellHeight - 6) + "px"
                    }
                }).append(data[i].name));

                // 左边任务序列名称
                var seriesDiv = jQuery("<div>", {"class": "ganttview-vtheader-series"});
                for (var j = 0; j < data[i].series.length; j++) {
                    // 每个series中的一个元素，作为单独一行
                    seriesDiv.append(jQuery("<div>", {
                        "class": "ganttview-vtheader-series-name",
                        "css": {"height": opts.cellHeight + "px", "line-height": opts.cellHeight - 6 + "px"}
                    })
                        .append(data[i].series[j].name));
                }

                // 添加名称+任务名称
                itemDiv.append(seriesDiv);
                headerDiv.append(itemDiv);
            }

            div.append(headerDiv);
        }

        // 根据日期进行分割
        function addHzHeader(div, dates, opts) {
            var headerDiv = jQuery("<div>", {"class": "ganttview-hzheader"});
            var monthsDiv = jQuery("<div>", {"class": "ganttview-hzheader-months clearfix"});
            var daysDiv = jQuery("<div>", {"class": "ganttview-hzheader-days clearfix"});
            var totalW = 0;

            for (var y in dates) {
                // 显示月份
                for (var m in dates[y]) {
                    var w = dates[y][m].length * opts.cellWidth;
                    totalW = totalW + w;
                    monthsDiv.append(jQuery("<div>", {
                        "class": "ganttview-hzheader-month",
                        "css": {"width": w + "px"}
                    }).append(y + "年" + DateUtils.getMonthNames(m))); // 显示标题

                    // 显示日期
                    for (var d in dates[y][m]) {
                        var dayDiv = jQuery("<div>", {
                            "class": "ganttview-hzheader-day",
                            "css": {"width": opts.cellWidth + "px"}
                        });
                        dayDiv.append(dates[y][m][d].getDate());

                        // 周末的处理
                        if (DateUtils.isWeekend(dates[y][m][d]) && opts.showWeekends) {
                            // dayDiv.addClass("ganttview-weekend");
                            if (DateUtils.isSaturday(dates[y][m][d])) dayDiv.addClass("ganttview-saturday");
                            if (DateUtils.isSunday(dates[y][m][d])) dayDiv.addClass("ganttview-sunday");
                        }

                        daysDiv.append(dayDiv);
                    }
                }
            }

            monthsDiv.css("width", totalW + "px");
            daysDiv.css("width", totalW + "px");
            headerDiv.append(monthsDiv).append(daysDiv);

            div.append(headerDiv);
        }

        // 增加网格线
        function addGrid(div, data, dates, opts) {
            var gridDiv = jQuery("<div>", {"class": "ganttview-grid"});
            var rowDiv = jQuery("<div>", {"class": "ganttview-grid-row clearfix"});

            // 按日期形成网格线
            for (var y in dates) {
                for (var m in dates[y]) {
                    for (var d in dates[y][m]) {
                        var cellDiv = jQuery("<div>", {
                            "class": "ganttview-grid-row-cell",
                            "css": {"width": opts.cellWidth + "px", "height": opts.cellHeight + "px"}
                        });
                        if (DateUtils.isWeekend(dates[y][m][d]) && opts.showWeekends) {
                            // cellDiv.addClass("ganttview-weekend");
                            if (DateUtils.isSaturday(dates[y][m][d])) cellDiv.addClass("ganttview-saturday");
                            if (DateUtils.isSunday(dates[y][m][d])) cellDiv.addClass("ganttview-sunday");
                        }
                        if (opts.showNowTimeline) {
                            if (DateUtils.isShowDayLine(dates[y][m][d])) {
                                cellDiv.append('<span class="ganttview-hzheader-day-now"></span>')
                            }
                        }
                        rowDiv.append(cellDiv);
                    }
                }
            }

            // 对显示grid单元进行处理
            var w = jQuery("div.ganttview-grid-row-cell", rowDiv).length * opts.cellWidth;
            rowDiv.css("width", w + "px");
            gridDiv.css("width", w + "px");
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].series.length; j++) {
                    // 每个series中的一个元素，作为单独一行
                    var cloneRowDiv = rowDiv.clone();
                    gridDiv.append(cloneRowDiv);
                }
            }
            div.append(gridDiv);
        }

        function addBlockContainers(div, data, opts) {
            var blocksDiv = jQuery("<div>", {"class": "ganttview-blocks"});
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].series.length; j++) {
                    // 每个series中的一个元素，作为单独一行
                    blocksDiv.append(jQuery("<div>", {
                        "class": "ganttview-block-container",
                        "css": {"height": opts.cellHeight - 0 + "px"} //8
                    }));
                }
            }
            div.append(blocksDiv);
        }

        function addBlocks(div, data, opts) {
            var rows = jQuery("div.ganttview-blocks div.ganttview-block-container", div);
            var rowIdx = 0;
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].series.length; j++) {
                    // 每个series中的一个元素，作为单独一行
                    // 对每个gantt条数据进行处理
                    var series = data[i].series[j];
                    var size = 0;
                    if (!series._empty) {
                        size = DateUtils.daysBetween(series.start, series.end) + 1;

                        var offset = DateUtils.daysBetween(opts.start, series.start);
                        var block = jQuery("<div>", {
                            "class": "ganttview-block",
                            "title": series.name + "： " + size + " 天",
                            "css": {
                                "width": ((size * opts.cellWidth) - 8) + "px", // 甘特条宽度, 显示整天时，不精确定位小时
                                "height": opts.cellHeight - 8 + "px",  // 甘特条高度
                                "margin-left": ((offset * opts.cellWidth) + 4) + "px" // 左边距
                            }
                        });
                        addBlockData(block, data[i], series);

                        // 有其他背景色的要求
                        if (!!data[i].series[j].options && data[i].series[j].options.color) {
                            block.css("background-color", data[i].series[j].options.color);
                        }

                        // 放置文本位置
                        block.append(jQuery("<div>", {
                            "class": "ganttview-block-text",
                            "css": {"height": opts.cellHeight - 8 + "px", "line-height": opts.cellHeight - 8 + "px"}
                        }).text(size + "天"));

                        jQuery(rows[rowIdx]).append(block);
                    }
                    rowIdx = rowIdx + 1;
                }
            }
        }

        function addBlockData(block, data, series) {
            var options = {draggable: true, resizable: true};
            var blockData = {id: data.id, taskId: null, name: data.name};
            if (!!series.options) {
                jQuery.extend(options, series.options);
            }
            jQuery.extend(blockData, series);
            blockData.options = options;

            block.data("block-data", blockData);
        }

        function applyLastClass(div) {
            jQuery("div.ganttview-grid-row div.ganttview-grid-row-cell:last-child", div).addClass("last");
            jQuery("div.ganttview-hzheader-days div.ganttview-hzheader-day:last-child", div).addClass("last");
            jQuery("div.ganttview-hzheader-months div.ganttview-hzheader-month:last-child", div).addClass("last");
        }

        return {
            render: render
        };
    }

    var Behavior = function (div, opts) {

        function apply() {
            if (opts.behavior.clickable) {
                bindBlockClick(div, opts.behavior.onClick);
            }

            if (opts.behavior.resizable) {
                bindBlockResize(div, opts.cellWidth, opts.start, opts.behavior.onResize);
            }

            if (opts.behavior.draggable) {
                bindBlockDrag(div, opts.cellWidth, opts.start, opts.behavior.onDrag);
            }

            if (opts.gridHoverV || opts.gridHoverH) {
                mouseHoverHandler(opts)
            }
        }

        // 甘特条点击事件
        function bindBlockClick(div, callback) {
            jQuery("div.ganttview-block", div).on("click", function () {
                if (callback) {
                    callback(jQuery(this).data("block-data"));
                }
            });
        }

        // 甘特图改变大小事件
        function bindBlockResize(div, cellWidth, startDate, callback) {
            jQuery("div.ganttview-block", div).each(function () {
                var $block = jQuery(this);
                var block_data = $block.data("block-data");

                if (block_data && block_data.options.resizable) {
                    (typeof $block.resizable === "function") && $block.resizable({
                        grid: [cellWidth, 0],
                        handles: "e,w",
                        stop: function () {
                            updateDataAndPosition(div, $block, cellWidth, startDate);
                            if (callback) {
                                callback(block_data);
                            }
                        }
                    });
                }
            });
        }

        // 甘特图拖拽事件
        function bindBlockDrag(div, cellWidth, startDate, callback) {
            jQuery("div.ganttview-block", div).each(function () {
                // 对每一个甘特条，进行处理
                var $block = jQuery(this);
                var block_data = $block.data("block-data");

                if (block_data && block_data.options.draggable) {
                    (typeof $block.draggable === "function") && $block.draggable({
                        axis: "x",
                        grid: [cellWidth, 0],
                        stop: function (event, ui) {
                            updateDataAndPosition(div, $block, cellWidth, startDate);
                            if (callback) {
                                callback(block_data);
                            }
                        }
                    });
                }
            });
        }

        //鼠标移入效果处理
        function mouseHoverHandler() {
            jQuery("div.ganttview-grid-row-cell").mouseover(function () {
                var $this = jQuery(this)
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
                var $this = jQuery(this)
                if (opts.gridHoverV) {
                    $this.removeClass('ganttview-grid-row-cell-hover')
                    let indexcount = $(this).index()
                    jQuery('.ganttview-grid-row').each( function(index, item) {
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
        function updateDataAndPosition(div, block, cellWidth, startDate) {
            var container = jQuery("div.ganttview-slide-container", div);
            var scroll = container.scrollLeft();
            var offset = block.offset().left - container.offset().left - 1 + scroll;

            // Set new start date
            var daysFromStart = Math.floor(offset / cellWidth);
            var newStart = DateUtils.addDays(new Date(startDate), daysFromStart);
            block.data("block-data").start = newStart;

            // Set new end date
            var width = block.outerWidth();
            var numberOfDays = Math.floor(width / cellWidth);
            var newEnd = DateUtils.addDays(new Date(newStart), numberOfDays);
            block.data("block-data").end = newEnd;
            jQuery("div.ganttview-block-text", block).text(numberOfDays + 1 + "天");

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
            var has = false;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == obj) {
                    has = true;
                }
            }
            return has;
        }
    };

    // 日期工具
    var DateUtils = {
        getMonthNames: function(m) {
            var monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
            return monthNames[m]
        },

        getWeekName: function(w) {
            var dayOfWeekNames = ["日", "一", "二", "三", "四", "五", "六"];
            return dayOfWeekNames[w]
        },

        //获取月份的每一天日期
        getMonths:function (start, end) {
            var start = Date.parse(start);
            var end = Date.parse(end);
            var months = [];
            months[start.getMonth()] = [start];
            var last = start;
            while (last.compareTo(end) == -1) {
                var next = last.clone().addDays(1);
                if (!months[next.getMonth()]) {
                    months[next.getMonth()] = [];
                }
                months[next.getMonth()].push(next);
                last = next;
            }
            return months;
        },

        //获取一天内24小时
        getHours:function()  {
            var hours = [];
            for (var i = 0; i <= 24; i++) {
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
            var adjustDate = new Date(date.getTime() + 24 * 60 * 60 * 1000 * number);
            return adjustDate;
        },

        daysBetween: function (start, end) {
            if (!start || !end) {
                return 0;
            }
            if (new Date(start).getFullYear() === 1901 || new Date(end).getFullYear() === 8099) {
                return 0;
            }
            var count = 0, date = new Date(start);
            while (date.getTime() < new Date(end).getTime()) {
                count = count + 1;
                date = DateUtils.addDays(date, 1);
            }
            return count;
        },

        isWeekend: function (date) {
            return date.getDay() % 6 == 0;
        },

        isSaturday: function (date) {
            return date.getDay() == 6;
        },

        isSunday: function (date) {
            return date.getDay() == 0;
        },

        getBoundaryDatesFromData: function (data, minDays) {
            var minStart = DateUtils.addDays(new Date(), -15);
            var maxEnd = new Date();
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].series.length; j++) {
                    if (!data[i].series[j].start || !data[i].series[j].end) {
                        continue;
                    }
                    // series.start = new Date()
                    var start = new Date(data[i].series[j].start);
                    var end = new Date(data[i].series[j].end);
                    if (i == 0 && j == 0) {
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
            var y = date.getYear(), m = date.getMonth(), d = date.getDate()
            var _now = new Date();
            var _y = _now.getYear(), _m = _now.getMonth(), _d = _now.getDate()

            return ( _d === d) && (_m === m) && ( _y === y);
        },

    };

    var Utils = {
        getTitle: function (name, distance) {
            return name + ", " + distance + '天';
        }
    };

})(jQuery);