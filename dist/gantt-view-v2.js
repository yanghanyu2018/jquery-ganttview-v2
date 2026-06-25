/*
    Original from jQuery.ganttView v.0.8.8
    Copyright (c) 2010 JC Grubbs - jc.grubbs@devmynd.com
    MIT License Applies

    Current Version: v0.6.7-airport-resource-timeline-docs
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
     showNowTimeline: boolean   // 显示当前时间线
     scrollToNowOnLoad: boolean // 加载/刷新后横向视口直接定位到当前时间，不使用页面滚动
     nowViewportPosition: string // center/left/right，当前时间点在初始视口中的位置
     highlightConflicts: boolean // 是否高亮同一资源/序列内的时间重叠
     preserveScrollOnReload: boolean // 刷新时优先保持当前横向视口；false时按scrollToNowOnLoad定位
     visibleStart/visibleEnd: Date|string // 可选，固定/裁剪显示时间窗口，适合机场当日/滚动窗口
     timeFieldMode: string // auto/start/planned/estimated/actual，机场计划/预计/实际时间字段选择
     useBufferTime: boolean // 是否使用 bufferBeforeMinutes/bufferAfterMinutes 扩展占用显示范围
     minBlockWidth: number // 短任务最小显示宽度，避免15分钟任务过窄
     statusClasses: boolean // 根据 task.status 添加状态样式 planned/active/delayed/completed/cancelled/maintenance
     showLegend: boolean // 自动显示资源类型/状态/时间来源图例
     showTimeLayers: boolean // 同一任务同时显示 planned/estimated/actual 多层时间条
     timeLayers: Array<string> // 多层时间条显示顺序
     editableTimeSource: string|null // 多层模式下允许编辑的时间来源
     rowWindowStart/rowWindowSize: number // 大资源量时的轻量行窗口裁剪
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
    const CONST_CELL_HGT_RESERVED = 8; // 保留兼容旧逻辑，v0.6.1之后实际条高由 blockHeight 控制
    const CONST_DAY_LEFT_MARGIN = 4;
    const CONST_CELL_TOP_MARGIN = 2;
    const CONST_VTHEADER_ROWS_NORMAL = 2;

    const GANTT_I18N = {
        "zh-CN": {
            calendar: {
                dayNameShort: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                dayNameFull: ["01日", "02日", "03日", "04日", "05日", "06日", "07日", "08日", "09日", "10日", "11日", "12日", "13日", "14日", "15日", "16日", "17日", "18日", "19日", "20日", "21日", "22日", "23日", "24日", "25日", "26日", "27日", "28日", "29日", "30日", "31日"],
                monthNameShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
                monthNameFull: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                dayOfWeekNames: ["日", "一", "二", "三", "四", "五", "六"],
                dayOfWeekNamesFull: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
                quarterNames: ["第一季度", "第二季度", "第三季度", "第四季度"],
                yearSuffix: "年",
                monthDayFormat: "{year}年{month}{day}日 {week}"
            },
            text: {
                headerName: "名称",
                headerSubName: "任务",
                noTask: "暂无任务",
                dayUnit: "天",
                hourUnit: "小时",
                minuteUnit: "分钟",
                legendResource: "资源",
                legendStatus: "状态",
                legendTime: "时间",
                rowWindow: "行窗口：{start}-{end} / {total}",
                timeLabel: "时间",
                displayLayer: "显示层",
                promptTask: "任务",
                promptDefaultTime: "拖动后的默认时间",
                promptCrossRowDefaultTime: "跨行拖动后的默认时间",
                promptInstruction: "请输入新的时间，留空则按拖动位置对齐日期/时间格。",
                promptFormatHelp: "支持格式：09:15-10:30，或只输入 09:15（保持原时长）。",
                promptCrossDayHelp: "跨日时也可输入完整时间：2026/06/25 23:30-2026/06/26 00:20",
                promptInvalidTime: "时间格式无法识别，已按拖动位置默认对齐。",
                currentTask: "当前任务"
            },
            labels: {
                resourceTypes: { gate: "机位", checkin: "值机柜台", belt: "行李转盘", stand: "停机位", bus: "摆渡车", crew: "机组", maintenance: "维护", security: "安检", boarding: "登机口" },
                statuses: { planned: "计划", active: "进行中", estimated: "预计", delayed: "延误", completed: "完成", cancelled: "取消", maintenance: "维护" },
                timeSources: { start: "默认", planned: "计划", estimated: "预计", actual: "实际" }
            }
        },
        "en-US": {
            calendar: {
                dayNameShort: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                dayNameFull: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th", "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"],
                monthNameShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                monthNameFull: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                dayOfWeekNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                dayOfWeekNamesFull: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                quarterNames: ["Q1", "Q2", "Q3", "Q4"],
                yearSuffix: "",
                monthDayFormat: "{month} {day}, {year} {week}"
            },
            text: {
                headerName: "Name",
                headerSubName: "Task",
                noTask: "No tasks",
                dayUnit: "d",
                hourUnit: "h",
                minuteUnit: "min",
                legendResource: "Resource",
                legendStatus: "Status",
                legendTime: "Time",
                rowWindow: "Rows: {start}-{end} / {total}",
                timeLabel: "Time",
                displayLayer: "display layer",
                promptTask: "Task",
                promptDefaultTime: "Default time after drag",
                promptCrossRowDefaultTime: "Default time after cross-row drag",
                promptInstruction: "Enter the exact time, or leave blank to align to the dragged date/time grid.",
                promptFormatHelp: "Supported: 09:15-10:30, or only 09:15 to keep the original duration.",
                promptCrossDayHelp: "For cross-day changes, use a full time: 2026/06/25 23:30-2026/06/26 00:20",
                promptInvalidTime: "Time format was not recognized. The block was aligned to the dragged position.",
                currentTask: "Current task"
            },
            labels: {
                resourceTypes: { gate: "Gate", checkin: "Check-in", belt: "Baggage belt", stand: "Stand", bus: "Bus", crew: "Crew", maintenance: "Maintenance", security: "Security", boarding: "Boarding gate" },
                statuses: { planned: "Planned", active: "Active", estimated: "Estimated", delayed: "Delayed", completed: "Completed", cancelled: "Cancelled", maintenance: "Maintenance" },
                timeSources: { start: "Default", planned: "Planned", estimated: "Estimated", actual: "Actual" }
            }
        },
        "fr-FR": {
            calendar: {
                dayNameShort: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                dayNameFull: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                monthNameShort: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
                monthNameFull: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
                dayOfWeekNames: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
                dayOfWeekNamesFull: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
                quarterNames: ["T1", "T2", "T3", "T4"],
                yearSuffix: "",
                monthDayFormat: "{day} {month} {year} {week}"
            },
            text: {
                headerName: "Nom",
                headerSubName: "Tâche",
                noTask: "Aucune tâche",
                dayUnit: "j",
                hourUnit: "h",
                minuteUnit: "min",
                legendResource: "Ressource",
                legendStatus: "Statut",
                legendTime: "Temps",
                rowWindow: "Lignes : {start}-{end} / {total}",
                timeLabel: "Temps",
                displayLayer: "couche d'affichage",
                promptTask: "Tâche",
                promptDefaultTime: "Heure par défaut après déplacement",
                promptCrossRowDefaultTime: "Heure par défaut après déplacement de ligne",
                promptInstruction: "Saisissez l'heure exacte, ou laissez vide pour aligner sur la grille.",
                promptFormatHelp: "Formats acceptés : 09:15-10:30, ou seulement 09:15 pour garder la durée.",
                promptCrossDayHelp: "Pour un changement sur deux jours : 2026/06/25 23:30-2026/06/26 00:20",
                promptInvalidTime: "Format d'heure non reconnu. Alignement sur la position déplacée.",
                currentTask: "Tâche courante"
            },
            labels: {
                resourceTypes: { gate: "Porte", checkin: "Enregistrement", belt: "Tapis bagages", stand: "Poste", bus: "Bus", crew: "Équipage", maintenance: "Maintenance", security: "Sûreté", boarding: "Porte d'embarquement" },
                statuses: { planned: "Planifié", active: "Actif", estimated: "Estimé", delayed: "Retardé", completed: "Terminé", cancelled: "Annulé", maintenance: "Maintenance" },
                timeSources: { start: "Défaut", planned: "Planifié", estimated: "Estimé", actual: "Réel" }
            }
        },
        "de-DE": {
            calendar: {
                dayNameShort: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                dayNameFull: ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10.", "11.", "12.", "13.", "14.", "15.", "16.", "17.", "18.", "19.", "20.", "21.", "22.", "23.", "24.", "25.", "26.", "27.", "28.", "29.", "30.", "31."],
                monthNameShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
                monthNameFull: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                dayOfWeekNames: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                dayOfWeekNamesFull: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                quarterNames: ["Q1", "Q2", "Q3", "Q4"],
                yearSuffix: "",
                monthDayFormat: "{day}. {month} {year} {week}"
            },
            text: {
                headerName: "Name",
                headerSubName: "Aufgabe",
                noTask: "Keine Aufgaben",
                dayUnit: "T",
                hourUnit: "Std",
                minuteUnit: "Min",
                legendResource: "Ressource",
                legendStatus: "Status",
                legendTime: "Zeit",
                rowWindow: "Zeilen: {start}-{end} / {total}",
                timeLabel: "Zeit",
                displayLayer: "Anzeigeebene",
                promptTask: "Aufgabe",
                promptDefaultTime: "Standardzeit nach dem Verschieben",
                promptCrossRowDefaultTime: "Standardzeit nach Zeilenwechsel",
                promptInstruction: "Geben Sie die genaue Zeit ein oder lassen Sie das Feld leer, um am Raster auszurichten.",
                promptFormatHelp: "Unterstützt: 09:15-10:30 oder nur 09:15, um die Dauer beizubehalten.",
                promptCrossDayHelp: "Bei Tageswechsel: 2026/06/25 23:30-2026/06/26 00:20",
                promptInvalidTime: "Zeitformat nicht erkannt. Ausrichtung an der verschobenen Position.",
                currentTask: "Aktuelle Aufgabe"
            },
            labels: {
                resourceTypes: { gate: "Gate", checkin: "Check-in", belt: "Gepäckband", stand: "Standplatz", bus: "Bus", crew: "Crew", maintenance: "Wartung", security: "Sicherheit", boarding: "Boarding-Gate" },
                statuses: { planned: "Geplant", active: "Aktiv", estimated: "Geschätzt", delayed: "Verspätet", completed: "Abgeschlossen", cancelled: "Storniert", maintenance: "Wartung" },
                timeSources: { start: "Standard", planned: "Geplant", estimated: "Geschätzt", actual: "Ist" }
            }
        },
        "th-TH": {
            calendar: {
                dayNameShort: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                dayNameFull: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                monthNameShort: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
                monthNameFull: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
                dayOfWeekNames: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
                dayOfWeekNamesFull: ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"],
                quarterNames: ["ไตรมาส 1", "ไตรมาส 2", "ไตรมาส 3", "ไตรมาส 4"],
                yearSuffix: "",
                monthDayFormat: "{day} {month} {year} {week}"
            },
            text: {
                headerName: "ชื่อ",
                headerSubName: "งาน",
                noTask: "ไม่มีงาน",
                dayUnit: "วัน",
                hourUnit: "ชม.",
                minuteUnit: "นาที",
                legendResource: "ทรัพยากร",
                legendStatus: "สถานะ",
                legendTime: "เวลา",
                rowWindow: "แถว: {start}-{end} / {total}",
                timeLabel: "เวลา",
                displayLayer: "ชั้นแสดงผล",
                promptTask: "งาน",
                promptDefaultTime: "เวลาเริ่มต้นหลังลาก",
                promptCrossRowDefaultTime: "เวลาเริ่มต้นหลังลากข้ามแถว",
                promptInstruction: "ป้อนเวลาที่แน่นอน หรือเว้นว่างเพื่อจัดตามช่องเวลา",
                promptFormatHelp: "รองรับ: 09:15-10:30 หรือใส่เฉพาะ 09:15 เพื่อคงระยะเวลาเดิม",
                promptCrossDayHelp: "กรณีข้ามวัน ใช้เวลาเต็ม: 2026/06/25 23:30-2026/06/26 00:20",
                promptInvalidTime: "ไม่รู้จักรูปแบบเวลา จัดตามตำแหน่งที่ลากแทน",
                currentTask: "งานปัจจุบัน"
            },
            labels: {
                resourceTypes: { gate: "ประตู", checkin: "เช็กอิน", belt: "สายพานกระเป๋า", stand: "หลุมจอด", bus: "รถบัส", crew: "ลูกเรือ", maintenance: "บำรุงรักษา", security: "ความปลอดภัย", boarding: "ประตูขึ้นเครื่อง" },
                statuses: { planned: "แผน", active: "กำลังดำเนินการ", estimated: "ประมาณการ", delayed: "ล่าช้า", completed: "เสร็จสิ้น", cancelled: "ยกเลิก", maintenance: "บำรุงรักษา" },
                timeSources: { start: "ค่าเริ่มต้น", planned: "แผน", estimated: "ประมาณการ", actual: "จริง" }
            }
        }
    };

    const GANTT_I18N_ALIASES = {
        "zh": "zh-CN", "zh-cn": "zh-CN", "cn": "zh-CN", "中文": "zh-CN",
        "en": "en-US", "en-us": "en-US", "english": "en-US",
        "fr": "fr-FR", "fr-fr": "fr-FR", "french": "fr-FR",
        "de": "de-DE", "de-de": "de-DE", "german": "de-DE",
        "th": "th-TH", "th-th": "th-TH", "thai": "th-TH"
    };

    const currentLanguage = GANTT_I18N["zh-CN"].calendar;

    function ganttDeepMerge(target, source) {
        target = target || {};
        if (!source) return target;
        for (let key in source) {
            if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
            let value = source[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                target[key] = ganttDeepMerge(target[key] || {}, value);
            } else {
                target[key] = value;
            }
        }
        return target;
    }

    function normalizeLocaleName(locale) {
        let raw = String(locale || 'zh-CN');
        let key = raw.trim().toLowerCase().replace('_', '-');
        return GANTT_I18N_ALIASES[key] || raw || 'zh-CN';
    }

    function getGanttI18n(_opts) {
        let locale = normalizeLocaleName((_opts && (_opts.locale || _opts.lang || _opts.language)) || 'zh-CN');
        let base = GANTT_I18N[locale] || GANTT_I18N['zh-CN'];
        let merged = ganttDeepMerge({}, base);
        if (_opts && _opts.i18n) merged = ganttDeepMerge(merged, _opts.i18n);
        return merged;
    }

    function t(_opts, key, vars) {
        let pack = getGanttI18n(_opts);
        let text = (pack.text && pack.text[key]) || (GANTT_I18N['zh-CN'].text && GANTT_I18N['zh-CN'].text[key]) || key;
        if (vars) {
            for (let k in vars) text = String(text).replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
        }
        return text;
    }

    function localizeLabel(_opts, group, value) {
        if (value === null || typeof value === 'undefined' || value === '') return value;
        if (_opts && _opts.localizeDataLabels === false) return value;
        let key = String(value).toLowerCase();
        let pack = getGanttI18n(_opts);
        let map = pack.labels && pack.labels[group];
        return (map && map[key]) || value;
    }

    function formatLocalizedDateHeader(date, _opts) {
        let d = new Date(date);
        let pack = getGanttI18n(_opts);
        let cal = pack.calendar || currentLanguage;
        let template = cal.monthDayFormat || "{year}年{month}{day}日 {week}";
        return template
            .replace(/\{year\}/g, d.getFullYear())
            .replace(/\{month\}/g, cal.monthNameShort[d.getMonth()] || (d.getMonth() + 1))
            .replace(/\{day\}/g, d.getDate())
            .replace(/\{week\}/g, (_opts && _opts.showDayOfWeek) ? (cal.dayOfWeekNamesFull[d.getDay()] || '') : '')
            .trim();
    }

    let defaults = {
        locale: 'zh-CN',        // 多语种：zh-CN / en-US / fr-FR / de-DE / th-TH；可传 lang/language 别名
        i18n: null,             // 自定义翻译覆盖 { calendar, text, labels }
        localizeDataLabels: true, // 对 resourceType/status/timeSource 等枚举做本地化显示，不改变原始数据
        viewMode: 'day',         // hour, day
        multiGantt: false,       // true: 一行多任务,  false: 一行单任务
        showWeekends: true,
        showNowTimeline: false,
        scrollToNowOnLoad: true, // 加载/刷新后直接把横向视口定位到当前时间点，不使用scrollIntoView滚动页面
        nowViewportPosition: 'center', // 当前时间点在初始视口中的位置: center / left / right
        highlightConflicts: true,     // 是否高亮同一资源/序列内的时间重叠
        preserveScrollOnReload: false,// reloadGantts后是否保持原横向视口；false则按scrollToNowOnLoad定位
        allowTimeMove: true,      // 是否允许甘特条左右拖动以调整开始/结束时间
        allowResourceMove: true,  // 是否允许甘特条上下拖动以切换资源行
        allowTimeResize: true,    // 是否允许通过左右边缘动态调整开始/结束时间
        allowCrossRowTimeMove: true, // 跨资源行拖动时是否同时保留横向时间变化；false则只换资源不改时间
        conflictColor: 'rgba(220, 53, 69, .92)', // 冲突任务条强制高亮颜色，覆盖自定义options.color
        timeSnapMinutes: 15,      // hour模式下左右拖动/缩放的时间吸附粒度；机场资源常用 5/10/15/30 分钟
        promptTimeOnHorizontalMove: true, // 横向拖动后弹出时间输入框；留空则按拖动位置对齐日期/时间格
        timeMovePromptEnabledForHour: true, // hour模式横向拖动后是否提示输入精确时间
        timeMovePromptEnabledForDay: true,  // day模式横向拖动后是否提示输入日内时间
        timeMovePromptAllowCancelAsDefault: true, // prompt取消时是否按拖动位置默认对齐；false则回退到原位置
        visibleStart: null,       // 固定显示窗口开始时间；设置后不会被数据边界自动覆盖
        visibleEnd: null,         // 固定显示窗口结束时间；设置后超出窗口的任务会被裁剪/隐藏
        timeFieldMode: 'auto',    // auto/start/planned/estimated/actual，兼容机场计划/预计/实际时间字段
        useBufferTime: true,      // 是否使用 bufferBeforeMinutes/bufferAfterMinutes 扩展资源占用显示
        minBlockWidth: 4,         // 短任务最小像素宽度，避免机场小时视图中 5/10/15 分钟任务不可见
        statusClasses: true,      // 根据 task.status/state 自动增加状态class
        showLegend: true,        // 显示机场资源/状态/时间来源图例
        showTimeLayers: false,   // 同一任务可同时显示 planned/estimated/actual 多层时间条
        timeLayers: ['planned', 'estimated', 'actual'], // showTimeLayers启用时的显示顺序
        editableTimeSource: null, // 多层显示时，允许拖拽/缩放的时间层；null表示当前timeFieldMode选中的主时间层
        rowWindowStart: 0,       // 行窗口开始序号，适合大资源量页面做轻量行级裁剪
        rowWindowSize: null,     // 行窗口大小；null表示全部渲染
        showRowWindowInfo: true, // 行窗口裁剪时在图例中显示当前渲染行数
        baseToday: false,        // 时间是否包括当日
        showDayOfWeek: true,     // 显示星期，仅在day模式下有效
        cellWidth: 40,           // 单元格宽度
        cellHeight: 40,          // 资源行高度；机场资源条需要比普通项目甘特图更高
        headerCellHeight: 30,    // 时间标题每一层高度，独立于资源行高度，避免标题区与资源区错位
        blockHeight: 24,         // 普通甘特条高度
        timeLayerHeight: 10,     // planned/estimated/actual 多层条高度
        timeLayerGap: 4,         // 多层条之间的间距
        timeLayerTopPadding: 5,  // 多层条距离行顶部的距离
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
            if (!_options || typeof _options.vtHeaderName === 'undefined') opts.vtHeaderName = t(opts, 'headerName');
            if (!_options || typeof _options.vtHeaderSubName === 'undefined') opts.vtHeaderSubName = t(opts, 'headerSubName');
            opts._instanceId = opts._instanceId || ('gv' + Date.now() + '-' + Math.floor(Math.random() * 1000000));
            _ganttOpts = opts;

            if (_data) {
                _ganttDataset = _data;
                _init_(_ganttDataset, opts);
                _renderWithDataset(_ganttDataset, opts);
            } else if (opts.dataUrl) {
                // dataUrl 是异步加载，必须等数据返回后再初始化和渲染。
                $.getJSON(opts.dataUrl, function (data) {
                    _ganttDataset = Array.isArray(data) ? data : [];
                    _init_(_ganttDataset, opts);
                    _renderWithDataset(_ganttDataset, opts);
                    _syncPublicState();
                });
            } else {
                _ganttDataset = [];
                _init_(_ganttDataset, opts);
                _renderWithDataset(_ganttDataset, opts);
            }
        } // _build_ 结束

        function _syncPublicState() {
            if (_ganttView.ganttView) {
                _ganttView.ganttView.ganttOpts = _ganttOpts;
                _ganttView.ganttView.ganttDataset = _ganttDataset;
                _ganttView.ganttView.ganttChart = _ganttChart;
                _ganttView.ganttView.ganttBehavior = _ganttBehavior;
            }
        }

        function _getRenderableDataset(_data, opts) {
            _data = Array.isArray(_data) ? _data : [];
            let rows = [];
            for (let category of _data) {
                for (let serie of (category.series || [])) {
                    rows.push({ category: category, serie: serie });
                }
            }

            let totalRows = rows.length;
            let requestedStart = Math.max(parseInt(opts.rowWindowStart || 0, 10), 0);
            let requestedSize = opts.rowWindowSize;
            let useWindow = requestedSize !== null && typeof requestedSize !== 'undefined' && parseInt(requestedSize, 10) > 0;

            if (!useWindow) {
                opts._rowWindowInfo = { enabled: false, totalRows: totalRows, start: 0, end: totalRows, renderedRows: totalRows };
                return _data;
            }

            let size = Math.max(parseInt(requestedSize, 10), 1);
            let start = Math.min(requestedStart, Math.max(totalRows - 1, 0));
            let end = Math.min(start + size, totalRows);
            let selectedRows = rows.slice(start, end);

            let grouped = [];
            let byCategory = {};
            for (let row of selectedRows) {
                let key = String(row.category.cId);
                if (!byCategory[key]) {
                    let categoryView = {};
                    $.extend(categoryView, row.category);
                    categoryView.series = [];
                    byCategory[key] = categoryView;
                    grouped.push(categoryView);
                }
                // series 保留原对象引用，拖拽/更新仍写回完整数据集。
                byCategory[key].series.push(row.serie);
            }

            opts._rowWindowInfo = {
                enabled: true,
                totalRows: totalRows,
                start: start,
                end: end,
                renderedRows: selectedRows.length,
                size: size
            };
            return grouped;
        }

        function _renderWithDataset(_data, opts) {
            _data = Array.isArray(_data) ? _data : [];
            let minDays = (opts.viewMode === 'hour') ?
                Math.floor(((_ganttView.outerWidth() - opts.vtHeaderWidth) / (opts.cellWidth * 24)) + 1) :
                Math.floor(((_ganttView.outerWidth() - opts.vtHeaderWidth) / opts.cellWidth) + 15);
            let startEnd = getBoundaryDatesFromData(_data, minDays, opts);

            // 设置gantt图的整体时间范围
            opts.start = startEnd[0]; // 起始时间
            opts.end = startEnd[1];   // 截止时间
            let $div = $("<div>", {"class": "ganttview"});
            let renderData = _getRenderableDataset(_data, opts);

            _ganttChart = new Chart(_ganttView, $div, renderData, opts);
            _ganttChart.render();

            _ganttView.append($div);
            _ganttChart.scrollToNowOnLoad();

            _ganttBehavior = new Behavior(_ganttView, _ganttChart, _data, opts);
            _ganttBehavior.apply();
        }

        // 对数据进行初始化处理
        function _init_(_data, _opts) {
            if (!Array.isArray(_data)) return;

            function _normalizeDate(value) {
                if (!value) return null;
                let date = (value instanceof Date) ? new Date(value) : new Date(value);
                return isNaN(date.getTime()) ? null : date;
            }

            function _ensureStartBeforeEnd(obj) {
                if (!obj || !obj.start || !obj.end) return;
                if (obj.start.getTime() > obj.end.getTime()) {
                    let tmp = obj.start;
                    obj.start = obj.end;
                    obj.end = tmp;
                    obj._timeAutoSwapped = true;
                }
            }

            function _pickTimePair(obj) {
                if (!obj) return {start: null, end: null, source: null};
                let mode = (_opts.timeFieldMode || 'auto').toLowerCase();
                let pairs;
                if (mode === 'planned') {
                    pairs = [['plannedStart', 'plannedEnd', 'planned'], ['start', 'end', 'start']];
                } else if (mode === 'estimated') {
                    pairs = [['estimatedStart', 'estimatedEnd', 'estimated'], ['plannedStart', 'plannedEnd', 'planned'], ['start', 'end', 'start']];
                } else if (mode === 'actual') {
                    pairs = [['actualStart', 'actualEnd', 'actual'], ['estimatedStart', 'estimatedEnd', 'estimated'], ['plannedStart', 'plannedEnd', 'planned'], ['start', 'end', 'start']];
                } else if (mode === 'start') {
                    pairs = [['start', 'end', 'start']];
                } else {
                    // auto 模式优先兼容旧数据 start/end；机场数据可额外使用 planned/estimated/actual。
                    pairs = [['start', 'end', 'start'], ['actualStart', 'actualEnd', 'actual'], ['estimatedStart', 'estimatedEnd', 'estimated'], ['plannedStart', 'plannedEnd', 'planned']];
                }
                for (let pair of pairs) {
                    let st = _normalizeDate(obj[pair[0]]);
                    let ed = _normalizeDate(obj[pair[1]]);
                    if (st && ed) return {start: st, end: ed, source: pair[2]};
                }
                return {start: null, end: null, source: null};
            }

            function _collectTimePairs(obj) {
                let result = {};
                if (!obj) return result;
                let fieldPairs = [
                    ['start', 'start', 'end'],
                    ['planned', 'plannedStart', 'plannedEnd'],
                    ['estimated', 'estimatedStart', 'estimatedEnd'],
                    ['actual', 'actualStart', 'actualEnd']
                ];
                for (let pair of fieldPairs) {
                    let st = _normalizeDate(obj[pair[1]]);
                    let ed = _normalizeDate(obj[pair[2]]);
                    if (!st || !ed) continue;
                    if (st.getTime() > ed.getTime()) {
                        let tmp = st;
                        st = ed;
                        ed = tmp;
                    }
                    result[pair[0]] = { start: st, end: ed, source: pair[0] };
                }
                return result;
            }

            function _normalizeAirportSemantics(category, serie, task) {
                let resourceType = (task && (task.resourceType || task.type)) ||
                    (serie && (serie.resourceType || serie.type)) ||
                    (category && (category.resourceType || category.type)) || 'resource';
                let status = (task && (task.status || task.state || task.flightStatus)) ||
                    (serie && (serie.status || serie.state)) || '';
                if (category) category.resourceType = category.resourceType || category.type || resourceType;
                if (serie) serie.resourceType = serie.resourceType || serie.type || resourceType;
                if (task) {
                    task.resourceType = task.resourceType || resourceType;
                    if (status && !task.status) task.status = status;
                }
            }

            function _normalizeTask(category, serie, task, defaultIsTask) {
                task.sId = serie.sId;
                task.cId = category.cId;
                task._timePairs = _collectTimePairs(task);
                let pickedTime = _pickTimePair(task);
                task.start = pickedTime.start;
                task.end = pickedTime.end;
                task._timeSource = pickedTime.source;
                _ensureStartBeforeEnd(task);
                if (typeof task.isTask === 'undefined') task.isTask = defaultIsTask;
                _normalizeAirportSemantics(category, serie, task);

                let opts = {};
                $.extend(opts, serie.options || {}, task.options || {});
                task.options = opts;
                return task;
            }

            function _syncSerieBoundary(serie) {
                let minStart = null, maxEnd = null;
                for (let task of (serie.tasks || [])) {
                    if (!task.start || !task.end) continue;
                    if (!minStart || task.start.getTime() < minStart.getTime()) minStart = new Date(task.start);
                    if (!maxEnd || task.end.getTime() > maxEnd.getTime()) maxEnd = new Date(task.end);
                }
                if (minStart && maxEnd) {
                    serie.start = minStart;
                    serie.end = maxEnd;
                }
            }

            for (let category of _data) {
                category.resourceType = category.resourceType || category.type || 'resource';
                if (!category.series || category.series.length === 0) {
                    // 没有任务则加一条稳定的空行。机场资源显示中，空资源是正常状态。
                    category.series = [{
                        cId: category.cId,
                        sId: "__empty_" + category.cId,
                        sName: t(_opts, 'noTask'),
                        tip: t(_opts, 'noTask'),
                        resourceType: category.resourceType,
                        _empty: true,
                        tasks: [],
                    }];
                    continue;
                }

                for (let serie of category.series) {
                    if (!serie.sId) serie.sId = Math.floor((Math.random() + 1) * 10e6);
                    serie.cId = category.cId;
                    serie.resourceType = serie.resourceType || serie.type || category.resourceType;
                    serie.tasks = serie.tasks || [];

                    if (serie.tasks.length > 0) {
                        if (typeof serie.isTask !== 'undefined') delete serie.isTask;
                        for (let task of serie.tasks) {
                            _normalizeTask(category, serie, task, true);
                        }
                        serie._empty = false;
                        _syncSerieBoundary(serie);
                    } else if (!!serie.start && !!serie.end) {
                        // series 自身有 start/end 时，也应显示为一个条。
                        // isTask 只表示是否可作为可拖拽任务，不应决定是否显示。
                        serie._timePairs = _collectTimePairs(serie);
                        let pickedTime = _pickTimePair(serie);
                        serie.start = pickedTime.start;
                        serie.end = pickedTime.end;
                        serie._timeSource = pickedTime.source;
                        _ensureStartBeforeEnd(serie);
                        _normalizeAirportSemantics(category, serie, null);
                        let task = {
                            tId: serie.tId || serie.sId,
                            sId: serie.sId,
                            cId: category.cId,
                            tName: serie.sName,
                            tip: serie.tip,
                            start: serie.start,
                            end: serie.end,
                            isTask: !!serie.isTask,
                            status: serie.status || serie.state || '',
                            resourceType: serie.resourceType || category.resourceType,
                            _timeSource: serie._timeSource,
                            _timePairs: serie._timePairs || {},
                        };
                        let opts = {};
                        $.extend(opts, serie.options || {}, task.options || {});
                        task.options = opts;

                        delete serie.isTask;
                        serie.tasks.push(task);
                        serie._empty = false;
                    } else {
                        serie._empty = true;
                        serie.tasks = [];
                    }
                }
            }
            // console.log("初始化数据结束", JSON.stringify(_data))
        } // _init_ 结束

        // 刷新甘特图
        function reloadGantts(_data, _opts) {
            var that = this

            if (that.ganttChart && that.ganttChart.cleanup) that.ganttChart.cleanup()
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

            let previousScrollLeft = 0;
            if (_opts.preserveScrollOnReload) {
                let $oldSlide = $("div.ganttview-slide-container", that.$ganttView);
                previousScrollLeft = $oldSlide.length ? ($oldSlide.scrollLeft() || 0) : 0;
            }

            that.$ganttView.children().remove();  // 清除所有对象

            let minDays = (_opts.viewMode === 'hour') ?
                Math.floor(((_ganttView.outerWidth() - _opts.vtHeaderWidth) / (_opts.cellWidth * 24)) + 1) :
                Math.floor(((_ganttView.outerWidth() - _opts.vtHeaderWidth) / _opts.cellWidth) + 15);
            let startEnd = getBoundaryDatesFromData(_data, minDays, _opts);

            // 设置gantt图的整体时间范围
            _opts.start = startEnd[0]; // 起始时间
            _opts.end = startEnd[1];   // 截止时间
            let $div = $("<div>", {"class": "ganttview"});
            let renderData = _getRenderableDataset(_data, _opts);

            that.ganttChart = new Chart(that.$ganttView, $div, renderData, _opts);
            that.ganttChart.render();

            that.$ganttView.append($div);
            if (_opts.preserveScrollOnReload) {
                $("div.ganttview-slide-container", that.$ganttView).scrollLeft(previousScrollLeft);
            } else {
                that.ganttChart.scrollToNowOnLoad();
            }

            that.ganttBehavior = new Behavior(that.$ganttView, that.ganttChart, _data, _opts);
            that.ganttBehavior.apply();
            _ganttChart = that.ganttChart;
            _ganttBehavior = that.ganttBehavior;
            _ganttOpts = that.ganttOpts;
            _ganttDataset = that.ganttDataset;
            _syncPublicState();
        }

        function parseSafeDate(value) {
            if (!value) return null;
            let date = (value instanceof Date) ? new Date(value) : new Date(value);
            return isNaN(date.getTime()) ? null : date;
        }

        // hour模式，取最小日期的零点作为起始日期
        // day模式，取最小日期-15天作为起始日期
        // 当baseToday为true时，以当前的时间为基点
        function getBoundaryDatesFromData(categories, minDays, optsOrMode, baseTodayParam) {
            categories = Array.isArray(categories) ? categories : [];
            minDays = Math.max(parseInt(minDays || 0, 10), 1);

            let mode = (typeof optsOrMode === 'object' && optsOrMode !== null) ? optsOrMode.viewMode : optsOrMode;
            let baseToday = (typeof optsOrMode === 'object' && optsOrMode !== null) ? optsOrMode.baseToday : baseTodayParam;
            let visibleStart = (typeof optsOrMode === 'object' && optsOrMode !== null) ? parseSafeDate(optsOrMode.visibleStart) : null;
            let visibleEnd = (typeof optsOrMode === 'object' && optsOrMode !== null) ? parseSafeDate(optsOrMode.visibleEnd) : null;
            let minStart = null, maxEnd = null;
            let _now = new Date();

            // 机场运行看板常用固定窗口，例如当日 00:00-24:00 或滚动 12 小时窗口。
            // 如果调用方明确给了 visibleStart/visibleEnd，则优先使用它，不再被数据边界扩展。
            if (visibleStart && visibleEnd) {
                if (visibleStart.getTime() > visibleEnd.getTime()) {
                    let tmp = visibleStart;
                    visibleStart = visibleEnd;
                    visibleEnd = tmp;
                }
                if (mode === 'hour') {
                    return [visibleStart, visibleEnd];
                }
                return [visibleStart, visibleEnd];
            }

            if (baseToday) {
                // baseToday 的语义是“时间范围包含今天/当前时刻”。
                // 旧实现把 maxEnd 设置为初始化那一瞬间的 _now，按钮稍后调用 gotoNow() 时，
                // 新的当前时间可能已经晚于 opts.end 几秒/几分钟，导致 getDateOffsetLeft() 返回 null。
                // 因此这里把边界扩展到当天结束，保证“定位当前时间范围”在页面加载后仍然有效。
                let todayStart = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 0, 0, 0, 0);
                let todayEnd = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 23, 59, 59, 999);
                maxEnd = todayEnd;
                if (mode === 'hour') {
                    minStart = DateUtils.addDays(todayStart, -1);
                } else {
                    minStart = DateUtils.addDays(todayStart, -15);
                }
            }

            for (let category of categories) {
                for (let serie of (category.series || [])) {
                    for (let task of (serie.tasks || [])) {
                        if (!task.start || !task.end) continue;

                        let start = new Date(task.start);
                        let end = new Date(task.end);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

                        if (!minStart || minStart.getTime() > start.getTime()) minStart = new Date(start);
                        if (!maxEnd || maxEnd.getTime() < end.getTime()) maxEnd = new Date(end);
                    }
                }
            }

            // 全部资源都为空时，仍然要给出可显示的时间窗口。
            if (!minStart || !maxEnd) {
                if (mode === 'hour') {
                    minStart = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 0, 0, 0, 0);
                    maxEnd = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 23, 59, 59, 999);
                } else {
                    minStart = baseToday ? DateUtils.addDays(_now, -15) : new Date(_now.getFullYear(), _now.getMonth(), _now.getDate());
                    maxEnd = DateUtils.addDays(minStart, minDays);
                }
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
            let cId = (typeof _cat == "object" ? _cat.cId : _cat)
            if (typeof serie !== "object") {
                serie = that.findSerie(cId, serie);
            }
            if (!serie) return null

            // 把serie当成任务进行处理，需要把这个添加入任务
            let taskStart = (start instanceof Date) ? new Date(start) : new Date(start);
            let taskEnd = (end instanceof Date) ? new Date(end) : new Date(end);
            if (isNaN(taskStart.getTime()) || isNaN(taskEnd.getTime())) return null;
            if (taskStart.getTime() > taskEnd.getTime()) {
                let tmp = taskStart;
                taskStart = taskEnd;
                taskEnd = tmp;
            }

            let task = {
                tId: Math.floor((Math.random() + 1) * 10e6),
                sId: serie.sId,
                cId: cId,
                tName: title, // 随机名称
                tip: tip || '',
                start: taskStart,
                end: taskEnd,
                isTask: true, // 确定任务
                status: (options && (options.status || options.state)) || '',
                resourceType: serie.resourceType || (_cat && _cat.resourceType) || 'resource',
                _timeSource: 'start',
            }
            let opts = {}
            $.extend(opts, serie.options || {}, options || {});
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
            if (!_cat) return null;

            let task = null;
            let serie = that.findSerie(_cat, sId);
            if (serie) {
                task = _add_task.call(that, cId, serie, title, start, end, tip, options)
            } else {
                let _newSerie = {
                    sId: sId,
                    sName: "No Name",
                    cId: _cat.cId,
                    tasks: [],
                }
                task = _add_task.call(that, cId, _newSerie, title, start, end, tip, options)
                that.addSerie(_cat, _newSerie)
            }

            // 新增条后统一刷新，确保新增行、事件绑定、拖拽/缩放行为全部同步。
            that.reloadGantts();
            return task;
        }

        function deleteGantt(cId, sId, tId) {
            let that = this
            if (typeof cId === 'undefined' && typeof sId === 'undefined') {
                if (that.ganttChart && that.ganttChart.selectedBlock) {
                    that.ganttChart.deleteGanttBlock(that.ganttChart.selectedBlock);
                }
                return true;
            }

            let category = that.findCategory(cId);
            let serie = that.findSerie(category, sId);
            if (!serie) return false;

            if (typeof tId === 'undefined') {
                if ((serie.tasks || []).length === 1) {
                    tId = serie.tasks[0].tId;
                } else {
                    _empty_serie_(serie);
                    that.reloadGantts();
                    return true;
                }
            }

            let task = that.findTask(category, serie, tId);
            if (!task) return false;
            that.deleteTask(category, serie, task);
            if (!serie.tasks || serie.tasks.length === 0) _empty_serie_(serie);
            that.reloadGantts();
            return true;
        }

        function _empty_serie_(serie) {
            serie.sName = t(_ganttOpts || defaults, 'noTask')
            serie.tip = t(_ganttOpts || defaults, 'noTask')
            serie._empty = true
            serie.tasks = []
        }

        // 清空甘特图
        function clearGantts() {
            let that = this
            for (let category of that.ganttDataset) {
                for (let serie of (category.series || [])) {
                    serie.tasks = []
                    _empty_serie_(serie)
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
            } else {
                sId = _serie
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
            if (!_serie) return null;

            let that = this
            let obj = null;
            let tId = ''
            if (typeof _task === "object") {
                tId = _task.tId || ''
            } else {
                tId = _task
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
                let tId = (typeof _task === "object") ? _task.tId : _task;
                if ( _serie.tasks[i].tId == tId) {
                    found = i;
                    break;
                }
            }
            if (found>=0) {
                _serie.tasks.splice(found, 1)
            }
        }
        //-----------------------------------------END:对数据的操作-------------------------------------------------------

        function gotoNow(position) {
            if (this.ganttChart && this.ganttChart.gotoNow) {
                this.ganttChart.gotoNow(position)
            }
        }

        function gotoDate(date, position) {
            if (this.ganttChart && this.ganttChart.gotoDate) {
                this.ganttChart.gotoDate(date, position)
            }
        }

        function gotoTask(cId, sId, tId, position) {
            let category = this.findCategory(cId);
            let serie = this.findSerie(category, sId);
            let task = this.findTask(category, serie, tId);
            if (!task || !task.start) return false;
            this.gotoDate(task.start, position || 'center');
            return true;
        }

        function setVisibleWindow(start, end, preserveScroll) {
            let startDate = parseSafeDate(start);
            let endDate = parseSafeDate(end);
            if (!startDate || !endDate) return false;
            this.reloadGantts(null, {
                visibleStart: startDate,
                visibleEnd: endDate,
                preserveScrollOnReload: !!preserveScroll
            });
            return true;
        }

        function setRollingWindow(hoursBefore, hoursAfter, preserveScroll) {
            let before = parseFloat(hoursBefore);
            let after = parseFloat(hoursAfter);
            if (isNaN(before)) before = 2;
            if (isNaN(after)) after = 10;
            let now = new Date();
            let start = DateUtils.add(now, -before, 'hour');
            let end = DateUtils.add(now, after, 'hour');
            return this.setVisibleWindow(start, end, preserveScroll);
        }

        function setRowWindow(rowStart, rowSize, preserveScroll) {
            let start = Math.max(parseInt(rowStart || 0, 10), 0);
            let size = parseInt(rowSize || 0, 10);
            if (isNaN(size) || size <= 0) return false;
            this.reloadGantts(null, {
                rowWindowStart: start,
                rowWindowSize: size,
                preserveScrollOnReload: !!preserveScroll
            });
            return true;
        }

        function clearRowWindow(preserveScroll) {
            this.reloadGantts(null, {
                rowWindowStart: 0,
                rowWindowSize: null,
                preserveScrollOnReload: !!preserveScroll
            });
            return true;
        }

        function updateTaskTime(cId, sId, tId, start, end, extra) {
            let category = this.findCategory(cId);
            let serie = this.findSerie(category, sId);
            let task = this.findTask(category, serie, tId);
            let startDate = parseSafeDate(start);
            let endDate = parseSafeDate(end);
            if (!task || !startDate || !endDate) return false;
            if (startDate.getTime() > endDate.getTime()) {
                let tmp = startDate;
                startDate = endDate;
                endDate = tmp;
            }
            task.start = startDate;
            task.end = endDate;
            let source = (extra && extra.timeSource) || task._timeSource || this.ganttOpts.editableTimeSource || this.ganttOpts.timeFieldMode || 'start';
            if (source === 'planned') {
                task.plannedStart = new Date(startDate);
                task.plannedEnd = new Date(endDate);
            } else if (source === 'estimated') {
                task.estimatedStart = new Date(startDate);
                task.estimatedEnd = new Date(endDate);
            } else if (source === 'actual') {
                task.actualStart = new Date(startDate);
                task.actualEnd = new Date(endDate);
            }
            if (extra && typeof extra === 'object') $.extend(task, extra);
            this.reloadGantts(null, { preserveScrollOnReload: true });
            return true;
        }

        function setLocale(locale, preserveScroll, i18nOverride) {
            let patch = { locale: locale, preserveScrollOnReload: preserveScroll !== false };
            if (i18nOverride) patch.i18n = i18nOverride;
            this.reloadGantts(null, patch);
            return true;
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
            gotoDate: gotoDate,
            gotoTask: gotoTask,
            setVisibleWindow: setVisibleWindow,
            setRollingWindow: setRollingWindow,
            setRowWindow: setRowWindow,
            clearRowWindow: clearRowWindow,
            updateTaskTime: updateTaskTime,
            setLocale: setLocale,

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

        // DOM id 需要实例隔离。机场资源页面可能同时显示机位、柜台、行李转盘等多个甘特图，
        // 且资源ID/任务ID可能重复；不能再依赖全局裸 id。
        function makeDomId(prefix, id) {
            let safeId = String(id == null ? '' : id).replace(/[^A-Za-z0-9_-]/g, '_');
            return prefix + '-' + opts._instanceId + '-' + safeId;
        }

        function findByData(selector, attr, value, scope) {
            return $(selector, scope || container).filter(function () {
                return String($(this).attr(attr)) === String(value);
            });
        }

        function findVtHeaderItemName(cId) {
            return findByData('div.ganttview-vtheader-item-name', 'data-cid', cId, container);
        }

        function findVtHeaderSerieName(sId) {
            return findByData('div.ganttview-vtheader-series-name', 'data-sid', sId, container);
        }

        function findGridRowBySerie(sId) {
            return findByData('div.ganttview-grid-row', 'data-sid', sId, container);
        }

        function findBlockByTask(tId) {
            return findByData('div.ganttview-block', 'data-tid', tId, container);
        }

        function findBlocksForSourceTask(tId) {
            let $blocks = findByData('div.ganttview-block', 'data-source-tid', tId, container);
            return $blocks.length ? $blocks : findBlockByTask(tId);
        }

        function normalizeClassToken(value, fallback) {
            let token = String(value || fallback || '').toLowerCase().trim();
            token = token.replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
            return token || fallback || 'unknown';
        }

        function parseChartDate(value) {
            if (!value) return null;
            let date = (value instanceof Date) ? new Date(value) : new Date(value);
            return isNaN(date.getTime()) ? null : date;
        }

        function getMinutesValue(value, fallback) {
            let n = parseFloat(value);
            return isNaN(n) ? (fallback || 0) : n;
        }

        function getTaskRenderRange(task) {
            if (!task || !task.start || !task.end) return null;
            let rawStart = parseChartDate(task.start);
            let rawEnd = parseChartDate(task.end);
            if (!rawStart || !rawEnd) return null;
            if (rawStart.getTime() > rawEnd.getTime()) {
                let tmp = rawStart;
                rawStart = rawEnd;
                rawEnd = tmp;
            }

            let renderStart = new Date(rawStart);
            let renderEnd = new Date(rawEnd);
            if (opts.useBufferTime !== false) {
                let before = getMinutesValue(task.bufferBeforeMinutes || task.bufferBefore, 0);
                let after = getMinutesValue(task.bufferAfterMinutes || task.bufferAfter, 0);
                if (before) renderStart = DateUtils.add(renderStart, -before, 'minute');
                if (after) renderEnd = DateUtils.add(renderEnd, after, 'minute');
            }

            // 固定显示窗口或控件边界存在时，只渲染窗口内的部分。这样机场当日窗口不会被远期数据拖大。
            let rangeStart = parseChartDate(opts.start);
            let rangeEnd = parseChartDate(opts.end);
            if (rangeStart && renderEnd.getTime() < rangeStart.getTime()) return null;
            if (rangeEnd && renderStart.getTime() > rangeEnd.getTime()) return null;
            if (rangeStart && renderStart.getTime() < rangeStart.getTime()) renderStart = new Date(rangeStart);
            if (rangeEnd && renderEnd.getTime() > rangeEnd.getTime()) renderEnd = new Date(rangeEnd);
            if (renderEnd.getTime() < renderStart.getTime()) return null;

            return { start: renderStart, end: renderEnd, rawStart: rawStart, rawEnd: rawEnd };
        }

        function getTaskStatus(task) {
            return (task && (task.status || task.state || task.flightStatus)) || '';
        }

        function applySemanticClasses($el, category, serie, task) {
            let resourceType = (task && task.resourceType) || (serie && serie.resourceType) || (category && category.resourceType) || 'resource';
            let rt = normalizeClassToken(resourceType, 'resource');
            $el.addClass('ganttview-resource-' + rt);
            $el.attr('data-resource-type', resourceType);

            if (opts.statusClasses !== false && task) {
                let status = getTaskStatus(task);
                if (status) {
                    let st = normalizeClassToken(status, 'unknown');
                    $el.addClass('ganttview-status-' + st);
                    $el.attr('data-status', status);
                }
                if (task._timeSource) {
                    $el.addClass('ganttview-time-' + normalizeClassToken(task._timeSource, 'start'));
                    $el.attr('data-time-source', task._timeSource);
                }
            }
        }

        function getTaskRenderEntries(task) {
            if (!task) return [];
            if (opts.showTimeLayers !== true) return [task];

            let layers = Array.isArray(opts.timeLayers) && opts.timeLayers.length ? opts.timeLayers : ['planned', 'estimated', 'actual'];
            let pairs = task._timePairs || {};
            let entries = [];
            let editableSource = opts.editableTimeSource || task._timeSource || 'start';
            let seen = {};

            for (let layer of layers) {
                let source = String(layer || '').toLowerCase();
                let pair = pairs[source];
                if (!pair || !pair.start || !pair.end) continue;
                seen[source] = true;

                if (source === task._timeSource) {
                    task._layerSource = source;
                    task._layerGhost = false;
                    entries.push(task);
                } else {
                    let layerTask = {};
                    $.extend(true, layerTask, task);
                    layerTask.tId = String(task.tId) + '__' + source;
                    layerTask.start = new Date(pair.start);
                    layerTask.end = new Date(pair.end);
                    layerTask._timeSource = source;
                    layerTask._layerSource = source;
                    layerTask._layerGhost = true;
                    layerTask._sourceTask = task;
                    layerTask.isTask = false;
                    layerTask.options = {};
                    $.extend(layerTask.options, task.options || {}, { draggable: false, resizable: false });
                    entries.push(layerTask);
                }
            }

            if (entries.length === 0) return [task];

            // 如果主显示层不在timeLayers中，仍保留主层，避免开启多层后任务消失。
            if (task._timeSource && !seen[task._timeSource]) {
                task._layerSource = task._timeSource;
                task._layerGhost = false;
                entries.push(task);
            }
            return entries;
        }

        function getLayerOrder(source) {
            let layers = Array.isArray(opts.timeLayers) ? opts.timeLayers : ['planned', 'estimated', 'actual'];
            let idx = layers.map(function (item) { return String(item).toLowerCase(); }).indexOf(String(source || '').toLowerCase());
            return idx < 0 ? layers.length : idx;
        }

        function applyLayerClasses($el, task) {
            if (!task) return;
            let layer = task._layerSource || task._timeSource || 'start';
            $el.addClass('ganttview-layer-' + normalizeClassToken(layer, 'start'));
            $el.attr('data-layer-source', layer);
            if (task._layerGhost) $el.addClass('ganttview-layer-ghost');
            if (opts.showTimeLayers === true) {
                $el.css('z-index', 2 + getLayerOrder(layer));
            }
        }

        function getTaskText(task, minutesOrDays, mode) {
            if (typeof opts.taskLabelFormatter === 'function') {
                return opts.taskLabelFormatter(task, minutesOrDays, mode);
            }
            if (task && task.label) return task.label;
            if (task && task.tName) return task.tName;
            return mode === 'hour' ? DateUtils.getTagFromMinutes(minutesOrDays, opts) : (minutesOrDays + t(opts, 'dayUnit'));
        }

        function buildTaskTitle(category, serie, task, range) {
            if (task && task.tip) return task.tip;
            let name = [category ? category.cName : '', serie ? serie.sName : '', task ? task.tName : ''].filter(Boolean).join(': ');
            let status = getTaskStatus(task);
            let source = task && task._timeSource ? (' / ' + localizeLabel(opts, 'timeSources', task._timeSource)) : '';
            if (task && task._layerGhost) source += ' / ' + t(opts, 'displayLayer');
            let statusText = status ? (' / ' + localizeLabel(opts, 'statuses', status)) : '';
            let start = range ? range.rawStart : (task ? task.start : null);
            let end = range ? range.rawEnd : (task ? task.end : null);
            return `${name}${statusText}${source}  ${t(opts, 'timeLabel')}: [${DateUtils.formatDateToString("%m-%d %H:%i", start, opts)} -- ${DateUtils.formatDateToString("%m-%d %H:%i", end, opts)}]`;
        }

        function syncSerieBoundary(serie) {
            if (!serie || !Array.isArray(serie.tasks) || serie.tasks.length === 0) {
                if (serie) {
                    serie.start = null;
                    serie.end = null;
                }
                return;
            }
            let minStart = null, maxEnd = null;
            for (let task of serie.tasks) {
                if (!task || !task.start || !task.end) continue;
                let start = new Date(task.start);
                let end = new Date(task.end);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
                if (!minStart || start.getTime() < minStart.getTime()) minStart = new Date(start);
                if (!maxEnd || end.getTime() > maxEnd.getTime()) maxEnd = new Date(end);
            }
            serie.start = minStart;
            serie.end = maxEnd;
        }

        function cleanup() {
            let that = this
            if (that.timeHandler) clearInterval(that.timeHandler);
            that.timeHandler = null

            _selectedBlockOld = null
            _selectedBlock = null
        }

        function render() {
            let that = this
            addLegend(container, categories, opts);
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

        // 直接定位到当前时间。
        // 不使用 scrollIntoView()，避免页面整体跳动；只设置甘特图内部横向滚动条的位置。
        function gotoNow(position) {
            gotoDate(new Date(), position || opts.nowViewportPosition);
        }

        function gotoDate(date, position) {
            setHorizontalViewToDate(date, position || opts.nowViewportPosition);
        }

        // 初始化/刷新后直接显示当前时间点。
        function scrollToNowOnLoad() {
            if (!opts.scrollToNowOnLoad) return;
            setHorizontalViewToDate(new Date(), opts.nowViewportPosition);
        }

        function setHorizontalViewToDate(date, position) {
            let offset = getDateOffsetLeft(date);
            if (offset === null) return;

            let $slide = $("div.ganttview-slide-container", container);
            if (!$slide || $slide.length === 0) return;

            let viewportWidth = $slide.innerWidth() || $slide.width() || 0;
            let scrollWidth = $slide[0].scrollWidth || 0;
            let targetLeft = offset;

            if (position === 'left') {
                targetLeft = offset - opts.cellWidth;
            } else if (position === 'right') {
                targetLeft = offset - viewportWidth + opts.cellWidth * 2;
            } else {
                targetLeft = offset - viewportWidth / 2;
            }

            targetLeft = Math.max(0, Math.floor(targetLeft));
            if (scrollWidth > viewportWidth) {
                targetLeft = Math.min(targetLeft, scrollWidth - viewportWidth);
            }

            $slide.scrollLeft(targetLeft);
        }

        function getDateOffsetLeft(date) {
            let target = new Date(date);
            if (isNaN(target.getTime()) || !opts.start || !opts.end) {
                return null;
            }

            // 当目标时间略微超出当前图的时间边界时，不直接 no-op，
            // 而是夹到最近边界。这样按钮/外部 API 在“当前时间刚好超过初始化边界”时仍然可用。
            if (target < opts.start) target = new Date(opts.start);
            if (target > opts.end) target = new Date(opts.end);

            if (opts.viewMode === 'hour') {
                let pixelPerMinute = opts.cellWidth / 60;
                return Math.floor(DateUtils.minutesBetween(opts.start, target) * pixelPerMinute);
            }

            let dayOffset = DateUtils.daysBetween(opts.start, target, true);
            let intraDayOffset = (target.getHours() * 60 + target.getMinutes()) / (24 * 60);
            return Math.floor((dayOffset + intraDayOffset) * opts.cellWidth);
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

                $('div.ganttview-hzheader-hours', container).each(function () {
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

                $('div.ganttview-grid-row', container).each(function () {
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

                $('div.ganttview-hzheader-days', container).each(function () {
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
                    $('div.ganttview-hzheader-dayofweeks', container).each(function () {
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

                $('div.ganttview-grid-row', container).each(function () {
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
        function addLegend(container, _categories, _opts) {
            if (_opts.showLegend === false) return;

            let resourceTypes = {};
            let statuses = {};
            let timeSources = {};
            for (let category of (_categories || [])) {
                if (category.resourceType) resourceTypes[category.resourceType] = true;
                for (let serie of (category.series || [])) {
                    if (serie.resourceType) resourceTypes[serie.resourceType] = true;
                    for (let task of (serie.tasks || [])) {
                        if (task.resourceType) resourceTypes[task.resourceType] = true;
                        let st = getTaskStatus(task);
                        if (st) statuses[st] = true;
                        if (task._timeSource) timeSources[task._timeSource] = true;
                        if (_opts.showTimeLayers === true && task._timePairs) {
                            for (let key in task._timePairs) timeSources[key] = true;
                        }
                    }
                }
            }

            let $legend = $("<div>", { "class": "ganttview-legend clearfix" });
            function addGroup(title, values, prefix, labelGroup) {
                let keys = Object.keys(values || {});
                if (keys.length === 0) return;
                let $group = $("<div>", { "class": "ganttview-legend-group" });
                $group.append($("<span>", { "class": "ganttview-legend-title" }).text(title));
                for (let value of keys.sort()) {
                    let token = normalizeClassToken(value, 'unknown');
                    let $item = $("<span>", { "class": "ganttview-legend-item " + prefix + token });
                    $item.append($("<span>", { "class": "ganttview-legend-swatch" }));
                    $item.append($("<span>", { "class": "ganttview-legend-label" }).text(localizeLabel(_opts, labelGroup, value)));
                    $group.append($item);
                }
                $legend.append($group);
            }

            addGroup(t(_opts, 'legendResource'), resourceTypes, 'ganttview-resource-', 'resourceTypes');
            addGroup(t(_opts, 'legendStatus'), statuses, 'ganttview-status-', 'statuses');
            addGroup(t(_opts, 'legendTime'), timeSources, 'ganttview-time-', 'timeSources');

            if (_opts.showRowWindowInfo !== false && _opts._rowWindowInfo && _opts._rowWindowInfo.enabled) {
                let info = _opts._rowWindowInfo;
                let text = t(_opts, 'rowWindow', { start: info.start + 1, end: info.end, total: info.totalRows });
                $legend.append($("<div>", { "class": "ganttview-legend-group ganttview-row-window-info" }).text(text));
            }

            if ($legend.children().length > 0) container.append($legend);
        }

        function getHeaderCellHeight(_opts) {
            let h = parseInt(_opts.headerCellHeight, 10);
            if (isNaN(h) || h <= 0) h = 30;
            return h;
        }

        function getHeaderRows(_opts) {
            let rows = CONST_VTHEADER_ROWS_NORMAL;
            if (_opts.viewMode === 'day' && _opts.showDayOfWeek) rows = CONST_VTHEADER_ROWS_NORMAL + 1;
            return rows;
        }

        function getHeaderHeight(_opts) {
            // 与右侧时间标题高度绑定，不能再使用 cellHeight；否则提高资源行高度时，左标题和右侧标题会错位。
            return getHeaderCellHeight(_opts) * getHeaderRows(_opts);
        }

        function getNormalizedTimeLayers(_opts) {
            let layers = Array.isArray(_opts.timeLayers) && _opts.timeLayers.length ? _opts.timeLayers : ['planned', 'estimated', 'actual'];
            return layers.map(function (item) { return String(item || '').toLowerCase(); });
        }

        function getLayerSourceForLayout(_opts, task) {
            let layers = getNormalizedTimeLayers(_opts);
            let source = task && (task._layerSource || task._timeSource);
            source = String(source || '').toLowerCase();
            if (layers.indexOf(source) >= 0) return source;

            // v0.6.2: 在多层时间条模式中，旧数据 start/end 也要进入同一套层布局，
            // 否则会出现 start 条比 planned/estimated/actual 条高一倍的情况。
            let preferred = String(_opts.editableTimeSource || _opts.timeFieldMode || '').toLowerCase();
            if (layers.indexOf(preferred) >= 0) return preferred;
            if (layers.indexOf('actual') >= 0) return 'actual';
            return layers.length ? layers[layers.length - 1] : 'actual';
        }

        function getBlockHeight(_opts, task) {
            let h;
            if (_opts.showTimeLayers === true && task && (task._layerSource || task._timeSource || task._layerGhost)) {
                h = parseInt(_opts.timeLayerHeight, 10);
            } else {
                h = parseInt(_opts.blockHeight, 10);
            }
            if (isNaN(h) || h <= 0) h = Math.max(12, (_opts.cellHeight || 40) - CONST_CELL_HGT_RESERVED);
            return Math.min(h, Math.max(4, (_opts.cellHeight || 40) - 2));
        }

        function getBlockTop(_opts, task) {
            let rowHeight = parseInt(_opts.cellHeight, 10) || 40;
            if (_opts.showTimeLayers === true && task && (task._layerSource || task._timeSource || task._layerGhost)) {
                let normalized = getNormalizedTimeLayers(_opts);
                let source = getLayerSourceForLayout(_opts, task);
                let idx = normalized.indexOf(source);
                if (idx < 0) idx = normalized.length > 0 ? normalized.length - 1 : 0;
                let topPad = parseInt(_opts.timeLayerTopPadding, 10);
                let gap = parseInt(_opts.timeLayerGap, 10);
                let h = getBlockHeight(_opts, task);
                if (isNaN(topPad) || topPad < 0) topPad = 4;
                if (isNaN(gap) || gap < 0) gap = 3;
                let top = topPad + idx * (h + gap);
                return Math.max(0, Math.min(top, Math.max(0, rowHeight - h)));
            }
            let h = getBlockHeight(_opts, task);
            return Math.max(0, Math.floor((rowHeight - h) / 2));
        }

        function getBlockLayout(_opts, task) {
            return {
                top: getBlockTop(_opts, task),
                height: getBlockHeight(_opts, task)
            };
        }

        function getTaskBufferMinutesForChart(task, key1, key2, _opts) {
            if (!task || _opts.useBufferTime === false) return 0;
            let v = task[key1];
            if (typeof v === 'undefined') v = task[key2];
            let n = parseFloat(v);
            return isNaN(n) ? 0 : n;
        }

        function syncTaskTimeFieldsForChart(task, start, end, _opts) {
            if (!task) return;
            let source = task._timeSource || _opts.editableTimeSource || _opts.timeFieldMode || 'start';
            source = String(source || 'start').toLowerCase();
            let st = new Date(start);
            let ed = new Date(end);
            task.start = st;
            task.end = ed;
            if (source === 'planned') {
                task.plannedStart = new Date(st);
                task.plannedEnd = new Date(ed);
            } else if (source === 'estimated') {
                task.estimatedStart = new Date(st);
                task.estimatedEnd = new Date(ed);
            } else if (source === 'actual') {
                task.actualStart = new Date(st);
                task.actualEnd = new Date(ed);
            }
            if (!task._timePairs) task._timePairs = {};
            task._timePairs[source] = { start: new Date(st), end: new Date(ed), source: source };
            syncSerieBoundary(task._serie || null);
        }

        function getDropOffsetFromSlide($helper) {
            let $slide = $("div.ganttview-slide-container", container);
            if (!$slide.length || !$helper || !$helper.length) return 0;
            let scroll = $slide.scrollLeft() || 0;
            let offset = $helper.offset().left - $slide.offset().left - 1 + scroll;
            let maxOffset = (($slide[0] && $slide[0].scrollWidth) ? $slide[0].scrollWidth : 0) - $helper.outerWidth();
            if (!isNaN(maxOffset) && maxOffset > 0) offset = Math.min(offset, maxOffset);
            return Math.max(0, Math.floor(offset));
        }

        function hasCrossRowHorizontalMove($helper, _opts) {
            if (!_helperSafe($helper)) return false;
            if (_opts.promptTimeOnHorizontalMove === false) return false;
            if (_opts.viewMode === 'hour' && _opts.timeMovePromptEnabledForHour === false) return false;
            if (_opts.viewMode !== 'hour' && _opts.timeMovePromptEnabledForDay === false) return false;
            let startOffset = parseFloat($helper.data("gantt-drag-start-offset"));
            if (isNaN(startOffset)) return true;
            let currentOffset = getDropOffsetFromSlide($helper);
            let snapPx = (_opts.viewMode === 'hour') ? Math.max(1, Math.round((_opts.cellWidth / 60) * (parseFloat(_opts.timeSnapMinutes) || 15))) : _opts.cellWidth;
            return Math.abs(currentOffset - startOffset) >= Math.max(1, Math.floor(snapPx / 2));
        }

        function _helperSafe($helper) {
            return !!($helper && $helper.length);
        }

        function formatChartDateTime(date, _opts) {
            return DateUtils.formatDateToString("%Y/%m/%d %H:%i", new Date(date), _opts || _ganttOpts || defaults);
        }

        function parseChartDatePrefix(text) {
            let m = String(text || '').match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+/);
            if (!m) return null;
            return { year: parseInt(m[1], 10), month: parseInt(m[2], 10), day: parseInt(m[3], 10) };
        }

        function combineChartDateAndTime(baseDate, token) {
            let text = String(token || '').trim();
            let d = parseChartDatePrefix(text);
            let m = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
            if (!m) return null;
            let base = new Date(baseDate);
            let y = d ? d.year : base.getFullYear();
            let mo = d ? d.month - 1 : base.getMonth();
            let day = d ? d.day : base.getDate();
            let hh = parseInt(m[1], 10), mi = parseInt(m[2], 10), ss = m[3] ? parseInt(m[3], 10) : 0;
            if (isNaN(hh) || isNaN(mi) || hh < 0 || hh > 23 || mi < 0 || mi > 59 || ss < 0 || ss > 59) return null;
            return new Date(y, mo, day, hh, mi, ss, 0);
        }

        function parseChartTimeMoveInput(input, candidateStart, candidateEnd) {
            let text = String(input || '').trim();
            if (!text) return { start: new Date(candidateStart), end: new Date(candidateEnd) };
            text = text.replace(/[，,;；至到~～]/g, ' ').replace(/\s*-\s*/g, ' ');
            let tokens = [];
            let re = /(?:\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\s+)?\d{1,2}:\d{2}(?::\d{2})?/g;
            let m;
            while ((m = re.exec(text)) !== null) tokens.push(m[0]);
            if (!tokens.length) return null;
            let duration = Math.max(1, DateUtils.minutesBetween(candidateStart, candidateEnd));
            let start = combineChartDateAndTime(candidateStart, tokens[0]);
            if (!start) return null;
            let end;
            if (tokens.length >= 2) {
                end = combineChartDateAndTime(parseChartDatePrefix(tokens[1]) ? candidateEnd : candidateStart, tokens[1]);
                if (!end) return null;
                if (end.getTime() <= start.getTime()) end = DateUtils.add(end, 1, 'day');
            } else {
                end = DateUtils.add(new Date(start), duration, 'minute');
            }
            return { start: start, end: end };
        }

        function askChartTimeForCrossRowMove($helper, task, candidateStart, candidateEnd, _opts) {
            if (!hasCrossRowHorizontalMove($helper, _opts)) return { start: new Date(candidateStart), end: new Date(candidateEnd) };
            if (typeof window === 'undefined' || typeof window.prompt !== 'function') return { start: new Date(candidateStart), end: new Date(candidateEnd) };
            let taskName = task && (task.tName || task.sName || task.name) ? (task.tName || task.sName || task.name) : t(_opts, 'currentTask');
            let msg = t(_opts, 'promptTask') + "：" + taskName + "\n" +
                t(_opts, 'promptCrossRowDefaultTime') + "：" + formatChartDateTime(candidateStart, _opts) + " - " + formatChartDateTime(candidateEnd, _opts) + "\n\n" +
                t(_opts, 'promptInstruction') + "\n" +
                t(_opts, 'promptFormatHelp');
            let value = window.prompt(msg, "");
            if (value === null || String(value).trim() === '') return { start: new Date(candidateStart), end: new Date(candidateEnd) };
            let parsed = parseChartTimeMoveInput(value, candidateStart, candidateEnd);
            if (!parsed) {
                if (typeof window.alert === 'function') window.alert(t(_opts, 'promptInvalidTime'));
                return { start: new Date(candidateStart), end: new Date(candidateEnd) };
            }
            return parsed;
        }

        function updateTaskTimeFromDroppedBlock($helper, task, _opts) {
            if (_opts.allowCrossRowTimeMove === false) return;
            if (!task || !task.start || !task.end) return;
            let offset = getDropOffsetFromSlide($helper);
            if (_opts.viewMode === 'hour') {
                let pixelPerMinute = _opts.cellWidth / 60;
                let snap = parseFloat(_opts.timeSnapMinutes);
                if (isNaN(snap) || snap <= 0) snap = 15;
                let minutesFromStart = Math.max(0, Math.round((offset / pixelPerMinute) / snap) * snap);
                let renderStart = DateUtils.add(new Date(_opts.start), minutesFromStart, 'minute');
                let renderMinutes = Math.max(snap, Math.round(($helper.outerWidth() / pixelPerMinute) / snap) * snap);
                let renderEnd = DateUtils.add(new Date(renderStart), renderMinutes, 'minute');
                let before = getTaskBufferMinutesForChart(task, 'bufferBeforeMinutes', 'bufferBefore', _opts);
                let after = getTaskBufferMinutesForChart(task, 'bufferAfterMinutes', 'bufferAfter', _opts);
                let newStart = DateUtils.add(renderStart, before, 'minute');
                let newEnd = DateUtils.add(renderEnd, -after, 'minute');
                if (newEnd.getTime() < newStart.getTime()) newEnd = DateUtils.add(new Date(newStart), snap, 'minute');
                let confirmed = askChartTimeForCrossRowMove($helper, task, newStart, newEnd, _opts);
                newStart = confirmed.start;
                newEnd = confirmed.end;
                syncTaskTimeFieldsForChart(task, newStart, newEnd, _opts);
            } else {
                let daysFromStart = Math.max(0, Math.floor(offset / _opts.cellWidth));
                let renderStart = DateUtils.addDays(new Date(_opts.start), daysFromStart);
                let numberOfDays = Math.max(0, Math.floor($helper.outerWidth() / _opts.cellWidth));
                let renderEnd = DateUtils.addDays(new Date(renderStart), numberOfDays);
                let before = getTaskBufferMinutesForChart(task, 'bufferBeforeMinutes', 'bufferBefore', _opts);
                let after = getTaskBufferMinutesForChart(task, 'bufferAfterMinutes', 'bufferAfter', _opts);
                let newStart = DateUtils.add(renderStart, before, 'minute');
                let newEnd = DateUtils.add(renderEnd, -after, 'minute');
                if (newEnd.getTime() < newStart.getTime()) newEnd = new Date(newStart);
                let confirmed = askChartTimeForCrossRowMove($helper, task, newStart, newEnd, _opts);
                newStart = confirmed.start;
                newEnd = confirmed.end;
                syncTaskTimeFieldsForChart(task, newStart, newEnd, _opts);
            }
        }

        function addVtHeader(container, _categories, _opts) {
            // 修改左边标题栏宽度
            let $headerDiv = $("<div>", {
                "class": "ganttview-vtheader",
                "css": {"width": _opts.vtHeaderWidth + "px"}
            });

            // 修改左边标题栏高度：标题区高度与右侧时间标题绑定，不能跟随资源行高度变化。
            let headerHeight = getHeaderHeight(_opts);

            let $headerTitleDiv = $("<div>", {
                "class": "ganttview-vtheader-title",
                "css": {"width": _opts.vtHeaderWidth + "px", "height": headerHeight + "px"}
            });

            // 修改左边标题栏
            $headerTitleDiv.append($("<div>", {
                "class": "ganttview-vtheader-title-name",
                "css": {"height": "100%", "line-height": headerHeight + "px", "width": "80px"}
            }).append(_opts.vtHeaderName));

            $headerTitleDiv.append($("<div>", {
                "class": "ganttview-vtheader-title-name",
                "css": {
                    "height": "100%",
                    "line-height": headerHeight + "px",
                    "width": "calc(100% - 81px)"
                }
            }).append(_opts.vtHeaderSubName));

            $headerDiv.append($headerTitleDiv);
            for (let category of _categories) {
                // 左边标题栏项目
                let $itemDiv = $("<div>", {
                    "id": makeDomId("ganttview-vtheader-item", category.cId),
                    "data-cid": category.cId,
                    "title": (category.tip || category.cName),
                    "class": "ganttview-vtheader-item ganttview-resource-" + normalizeClassToken(category.resourceType || category.type, 'resource'),
                    "css": {"height": (category.series.length * _opts.cellHeight) + "px"}
                });

                // 左边标题栏项目名称
                $itemDiv.append($("<div>", {
                    "id": makeDomId("ganttview-vtheader-item-name", category.cId),
                    "data-cid": category.cId,
                    "class": "ganttview-vtheader-item-name ganttview-resource-" + normalizeClassToken(category.resourceType || category.type, 'resource'),
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
                        "id": makeDomId("ganttview-vtheader-series-name", serie.sId),
                        "data-cid": category.cId,
                        "data-sid": serie.sId,
                        "class": "ganttview-vtheader-series-name ganttview-resource-" + normalizeClassToken(serie.resourceType || category.resourceType, 'resource'),
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
            let headerCellHeight = getHeaderCellHeight(_opts);
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
                    let monthTitle = (normalizeLocaleName(_opts.locale || _opts.lang || _opts.language || 'zh-CN') === 'zh-CN')
                        ? (y + (getGanttI18n(_opts).calendar.yearSuffix || '年') + DateUtils.getMonthNames(m, _opts))
                        : (DateUtils.getMonthNames(m, _opts) + ' ' + y);
                    $monthsDiv.append($("<div>", {
                        "class": "ganttview-hzheader-month",
                        "css": {"width": w + "px", "height": headerCellHeight + "px", "line-height": headerCellHeight + "px"}
                    }).append(monthTitle)); // 显示标题

                    // 显示日期
                    for (let d in _dates[y][m]) {
                        let _date = _dates[y][m][d];
                        let dayDiv = $("<div>", {
                            "class": "ganttview-hzheader-day",
                            "css": {"width": _opts.cellWidth + "px", "height": headerCellHeight + "px", "line-height": headerCellHeight + "px"}
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
                                "css": {"width": _opts.cellWidth + "px", "height": headerCellHeight + "px", "line-height": headerCellHeight + "px"}
                            });

                            $dowDiv.append(DateUtils.getWeekName(_date.getDay(), _opts));

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
            let headerCellHeight = getHeaderCellHeight(_opts);
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
                            weekName = DateUtils.getWeekFullName(_date.getDay(), _opts)
                        }

                        totalW = totalW + w;
                        let $dayDiv = $("<div>", {
                            "class": "ganttview-hzheader-day",
                            "css": {"width": w + "px", "height": headerCellHeight + "px", "line-height": headerCellHeight + "px"}
                        }).append(formatLocalizedDateHeader(_date, _opts)); // 显示标题

                        // 周末的处理
                        if (DateUtils.isWeekend(_date) && _opts.showWeekends) {
                            if (DateUtils.isSaturday(_date)) $dayDiv.addClass("ganttview-saturday");
                            if (DateUtils.isSunday(_date)) $dayDiv.addClass("ganttview-sunday");
                        }
                        $daysDiv.append($dayDiv);

                        // 显示小时
                        for (let h = 0; h < hours.length; h++) {
                            let $hourDiv = $("<div>", {
                                "class": "ganttview-hzheader-hour",
                                "css": {"width": _opts.cellWidth + "px", "height": headerCellHeight + "px", "line-height": headerCellHeight + "px"}
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
                    $cloneRowDiv.addClass("ganttview-resource-" + normalizeClassToken(serie.resourceType || category.resourceType, 'resource'));
                    $cloneRowDiv.attr("id", makeDomId("ganttview-grid-row", serie.sId));
                    $cloneRowDiv.attr("data-sid", serie.sId);
                    $cloneRowDiv.attr("data-cid", category.cId);
                    $cloneRowDiv.attr("cId", category.cId);

                    // 每行都可以接受拖放的任务
                    (typeof $cloneRowDiv.droppable === "function") && $cloneRowDiv.droppable({
                        accept: '.ganttview-task', // 只接受的类型
                        hoverClass: "gantt-drag-hover",
                        drop: function (e, ui) {
                            let $block = $(this)
                            let _sId = $block.attr("data-sid");
                            let _cId = $block.attr("data-cid") || $block.attr("cId");
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
                                // 同一资源行内拖动时，不应阻断 draggable.stop；后续由 updateDataAndPosition 同步左右时间。
                                return;
                            }

                            let i = _findTaskIdx(oldSerie.tasks, task.cId, task.sId, task.tId);
                            if (i >= 0) {
                                // v0.6.2: 跨行拖动时，允许“换资源 + 改时间”一次完成。
                                // 如需保留旧行为，可设置 allowCrossRowTimeMove:false，此时跨行只改变资源，不改变时间。
                                updateTaskTimeFromDroppedBlock(ui.helper, task, _opts);
                                ui.helper.data("gantt-cross-row-drop", true);

                                removeTaskBlock(oldSerie, _block_data._task)

                                newSerie._empty = false;
                                let newCategory = _findCategory(newSerie.cId)

                                task.cId = newCategory.cId;
                                task.sId = newSerie.sId;
                                if (newSerie.sName === t(_opts, 'noTask') && task.tName) {
                                    newSerie.sName = task.tName;
                                    newSerie.tip = task.tip;
                                }

                                newSerie.tasks = newSerie.tasks || []
                                newSerie.tasks.push(task);
                                syncSerieBoundary(oldSerie);
                                syncSerieBoundary(newSerie);
                                updateBlockData($block, category, newSerie, task);

                                if (!_opts.multiGantt) {
                                    // TODO：删除oldSerie

                                } else {
                                    // TODO：修改newSerie的时间
                                }

                                e.preventDefault();
                                e.stopImmediatePropagation()

                                // debugger
                                $view.ganttView.reloadGantts(null, $.extend(true, {}, opts, { preserveScrollOnReload: true }));

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
            let gridWidth = $("div.ganttview-grid", container).outerWidth() || 0;
            let rowCount = 0;
            for (let category of _categories) rowCount += (category.series || []).length;
            $blocksDiv.css({
                "width": (gridWidth > 0 ? gridWidth + "px" : "100%"),
                "height": (rowCount * _opts.cellHeight) + "px",
                "top": getHeaderHeight(_opts) + "px"
            });
            for (let category of _categories) {
                for (let serie of category.series) {
                    // 每个series中的一个元素，作为单独一行。v0.6.1之后甘特条在行内绝对定位，避免负margin导致上沿错位和条形进入标题区。
                    let $containerDiv = $("<div>", {
                        "id": makeDomId("ganttview-block-container", serie.sId),
                        "data-sid": serie.sId,
                        "data-cid": category.cId,
                        "class": "ganttview-block-container ganttview-resource-" + normalizeClassToken(serie.resourceType || category.resourceType, 'resource'),
                        "css": {
                            "height": _opts.cellHeight + "px",
                            "width": (gridWidth > 0 ? gridWidth + "px" : "100%")
                        }
                    });
                    $containerDiv.attr('data-cId', category.cId)
                    $blocksDiv.append($containerDiv);
                }
            }
            container.append($blocksDiv);
        }

        function findBlockContainers(serie) {
            return findByData("div.ganttview-block-container", "data-sid", serie.sId, container)
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

                    // 对每个gantt条数据进行处理。冲突先按序列统一计算，避免每个任务重复 O(n^2) 扫描。
                    let conflictTaskIds = (_opts.highlightConflicts === false) ? {} : detectConflictedTaskIds(serie);
                    let _count = 0
                    for (let task of (serie.tasks || [])) {
                        if (!task || !task.start || !task.end) continue;
                        let renderEntries = getTaskRenderEntries(task);
                        for (let renderTask of renderEntries) {
                            if (!renderTask || !renderTask.start || !renderTask.end) continue;
                            _count++;

                            if (_opts.viewMode === 'hour') {
                                // hour模式
                                let range = getTaskRenderRange(renderTask);
                                if (!range) continue;
                                let task_minutes = DateUtils.minutesBetween(range.start, range.end);
                                let size = Math.max(_opts.minBlockWidth || 1, Math.floor(task_minutes * pixel_per_minutes) + 1);
                                let offset = Math.floor(DateUtils.minutesBetween(_opts.start, range.start) * pixel_per_minutes) + 1;
                                let blockLayout = getBlockLayout(_opts, renderTask);

                                let $block = $("<div>", {
                                    "id": makeDomId("ganttview-block", renderTask.tId),
                                    "data-tid": renderTask.tId,
                                    "data-source-tid": task.tId,
                                    "data-sid": serie.sId,
                                    "data-cid": category.cId,
                                    "class": "ganttview-block",
                                    "title": buildTaskTitle(category, serie, renderTask, range),
                                "css": {
                                    "width": size + "px", // 甘特条宽度, hour模式按分钟定位
                                    "height": blockLayout.height + "px",
                                    "left": offset + "px",
                                    "top": blockLayout.top + "px",
                                    "margin-left": "0px",
                                    "margin-top": "0px"
                                }
                            });
                            $block.attr("data-layout-top", blockLayout.top).attr("data-layout-height", blockLayout.height);
                            applySemanticClasses($block, category, serie, renderTask);
                                applyLayerClasses($block, renderTask);

                            if (renderTask.isTask) $block.addClass("ganttview-task"); // 对于任务类型的处理
                            if (conflictTaskIds[String(task.tId)] || conflictTaskIds[String(renderTask.tId)]) {
                                $block.addClass("ganttview-block-conflict");
                            }

                            updateBlockData($block, category, serie, renderTask);

                            // 有其他背景色的要求。冲突色优先级最高。
                            rememberBlockOptionColor($block, renderTask);
                            if (!!renderTask.options && renderTask.options.color) {
                                $block.css("background-color", renderTask.options.color);
                            }
                            setBlockConflictVisual($block, !!(conflictTaskIds[String(task.tId)] || conflictTaskIds[String(renderTask.tId)]));

                            // 放置文本位置
                            $block.append($("<div>", {
                                "id": makeDomId("ganttview-block-text", task.tId),
                                "class": "ganttview-block-text",
                                "css": {
                                    "height": blockLayout.height + "px",
                                    "line-height": blockLayout.height + "px"
                                },
                            }).text(getTaskText(renderTask, task_minutes, 'hour')));

                            $(rows[rowIdx]).append($block);

                        } else {
                            // day 模式
                            let range = getTaskRenderRange(renderTask);
                            if (!range) continue;
                            let size = DateUtils.daysBetween(range.start, range.end) + 1;
                            let offset = DateUtils.daysBetween(_opts.start, range.start, true);
                            let blockWidth = Math.max(_opts.minBlockWidth || 1, (size * _opts.cellWidth) - CONST_CELL_HGT_RESERVED);
                            let blockLayout = getBlockLayout(_opts, renderTask);

                            let $block = $("<div>", {
                                "id": makeDomId("ganttview-block", renderTask.tId),
                                "data-tid": renderTask.tId,
                                "data-source-tid": task.tId,
                                "data-sid": serie.sId,
                                "data-cid": category.cId,
                                "class": "ganttview-block",
                                "title": buildTaskTitle(category, serie, renderTask, range),
                                "css": {
                                    "width": blockWidth + "px", // 甘特条宽度
                                    "height": blockLayout.height + "px",
                                    "left": ((offset * _opts.cellWidth) + CONST_DAY_LEFT_MARGIN) + "px",
                                    "top": blockLayout.top + "px",
                                    "margin-left": "0px",
                                    "margin-top": "0px"
                                }
                            });
                            $block.attr("data-layout-top", blockLayout.top).attr("data-layout-height", blockLayout.height);
                            applySemanticClasses($block, category, serie, renderTask);
                                applyLayerClasses($block, renderTask);

                            if (renderTask.isTask) $block.addClass("ganttview-task"); // 对于任务类型的处理
                            // 冲突检查
                            if (conflictTaskIds[String(task.tId)] || conflictTaskIds[String(renderTask.tId)]) {
                                $block.addClass("ganttview-block-conflict");
                            }

                            updateBlockData($block, category, serie, renderTask);

                            // 有其他背景色的要求。冲突色优先级最高。
                            rememberBlockOptionColor($block, renderTask);
                            if (!!renderTask.options && renderTask.options.color) {
                                $block.css("background-color", renderTask.options.color);
                            }
                            setBlockConflictVisual($block, !!(conflictTaskIds[String(task.tId)] || conflictTaskIds[String(renderTask.tId)]));

                            // 放置文本位置
                            $block.append($("<div>", {
                                "id": makeDomId("ganttview-block-text", task.tId),
                                "class": "ganttview-block-text",
                                "css": {
                                    "height": blockLayout.height + "px",
                                    "line-height": blockLayout.height + "px"
                                },
                            }).text(getTaskText(renderTask, size, 'day')));

                            $(rows[rowIdx]).append($block);
                        }

                            if (!_opts.multiGantt) break; // 单任务模式，则退出
                        }
                        if (!_opts.multiGantt && _count > 0) break;
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
            $.extend(blockCategory, _category || {});
            delete blockCategory.series;
            delete blockCategory.options;
            $.extend(blockSerie, _serie || {});
            delete blockSerie.tasks;
            delete blockSerie.options;
            $.extend(blockTask, _task || {});
            delete blockTask.options;

            $.extend(options, (_serie ? (_serie.options || {}) : {}), (_task ? (_task.options || {}) : {}));
            $.extend(blockData, blockCategory, blockSerie, blockTask);

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
            serie.sName = t(opts, 'noTask');
            serie.tip = t(opts, 'noTask');
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
                serie.sName = t(opts, 'noTask');
                serie.tip = t(opts, 'noTask');
                serie.start = null;
                serie.end = null;
            }
            return true;
        }

        // 批量检查同一资源/序列内的时间冲突。按开始时间排序后线性扫描，避免大量资源时重复计算。
        function detectConflictedTaskIds(serie) {
            let conflicted = {};
            if (!serie || !Array.isArray(serie.tasks) || serie.tasks.length <= 1) return conflicted;

            let intervals = [];
            for (let task of serie.tasks) {
                if (!task || !task.start || !task.end) continue;
                let start = new Date(task.start).getTime();
                let end = new Date(task.end).getTime();
                if (isNaN(start) || isNaN(end) || start >= end) continue;
                intervals.push({id: String(task.tId), start: start, end: end});
            }
            intervals.sort(function (a, b) {
                return a.start - b.start || a.end - b.end;
            });

            let active = [];
            for (let item of intervals) {
                active = active.filter(function (prev) { return prev.end > item.start; });
                if (active.length > 0) {
                    conflicted[item.id] = true;
                    for (let prev of active) conflicted[prev.id] = true;
                }
                active.push(item);
            }
            return conflicted;
        }

        // 检查同一资源/序列内的时间冲突。机场机位/柜台/转盘资源不能同一时间被重复占用。
        function checkTaskConflict(serie, task) {
            if (!serie || !task || !task.start || !task.end) return false;
            let start = new Date(task.start).getTime();
            let end = new Date(task.end).getTime();
            if (isNaN(start) || isNaN(end)) return false;

            for (let other of (serie.tasks || [])) {
                if (other === task || other.tId === task.tId) continue;
                if (!other.start || !other.end) continue;
                let otherStart = new Date(other.start).getTime();
                let otherEnd = new Date(other.end).getTime();
                if (isNaN(otherStart) || isNaN(otherEnd)) continue;
                if (start < otherEnd && otherStart < end) return true;
            }
            return false;
        }
        function getConflictColor() {
            return opts.conflictColor || 'rgba(220, 53, 69, .92)';
        }

        function rememberBlockOptionColor($block, task) {
            let color = task && task.options ? task.options.color : null;
            if (color) $block.attr('data-option-color', color);
        }

        function setBlockConflictVisual($block, isConflict) {
            if (!$block || !$block.length) return;
            if (isConflict) {
                $block.addClass('ganttview-block-conflict');
                // 明确写入inline颜色，避免 options.color 的inline background 覆盖冲突高亮。
                $block.css('background-color', getConflictColor());
            } else {
                $block.removeClass('ganttview-block-conflict');
                let color = $block.attr('data-option-color');
                if (color) $block.css('background-color', color);
                else $block.css('background-color', '');
            }
        }


        function refreshConflictClassesForSerie(serie) {
            if (!serie || !Array.isArray(serie.tasks)) return;
            let conflicted = (opts.highlightConflicts === false) ? {} : detectConflictedTaskIds(serie);
            for (let task of serie.tasks) {
                let $blocks = findBlocksForSourceTask(task.tId);
                if (!$blocks.length) continue;
                $blocks.each(function () {
                    setBlockConflictVisual($(this), !!conflicted[String(task.tId)]);
                });
            }
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
        function _findTaskIdx(tasks, cId, sId, tId) {
            let i = 0;
            for (let task of (tasks || [])) {
                let sameTask = (typeof tId === 'undefined' || tId === null) ? true : (task.tId == tId);
                if (sameTask && task.sId == sId && task.cId == cId) {
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
            } else {
                sId = _serie
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
            } else {
                sId = _serie
            }

            if (typeof _cat !== "object") {
                _cat = _findCategory(_cat)
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
            if (found >= 0) {
                _cat.series.splice(found, 1)
            }
        }

        function _findTask(cId, sId, tId) {
            let obj = null;
            for (let category of (categories || [])) {
                if (category.cId == cId) {
                    for (let serie of category.series) {
                        if (serie.sId == sId) {
                            for (let task of (serie.tasks || [])) {
                                if (task.tId == tId) {
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
            } else {
                tId = _task
            }

            if (typeof _serie !== "object") {
                _serie = _findCategory(_serie)
                if (!_serie) return;
            }

            let found = -1;
            for (let i = 0; i < _serie.tasks.length; i++) {
                if (_serie.tasks[i].tId == tId) {
                    found = i;
                    break;
                }
            }
            if (found >= 0) {
                _serie.tasks.splice(found, 1)
            }
        }
        //-----------End: 内部使用的函数----------------------------------------------------------

        function refreshGanttBlock(block) {
            let data = block.data('block-data');
            if (!data) return;

            findVtHeaderItemName(data.cId).text(data.cName);
            findVtHeaderSerieName(data.sId).text(data.sName);
            let $blockDiv = findBlockByTask(data.tId);

            let range = getTaskRenderRange(data._task || data);
            if (!range) return;

            if (opts.viewMode === 'hour') {
                // hour模式
                let pixel_per_minutes = opts.cellWidth / 60;
                let task_minutes = DateUtils.minutesBetween(range.start, range.end);
                let size = Math.max(opts.minBlockWidth || 1, Math.floor(task_minutes * pixel_per_minutes) + 1);
                let offset = Math.floor(DateUtils.minutesBetween(opts.start, range.start) * pixel_per_minutes) + 1;
                let blockLayout = getBlockLayout(opts, data._task || data);

                $blockDiv.css({
                    "width": size + "px", // 甘特条宽度
                    "height": blockLayout.height + "px",
                    "left": offset + "px",
                    "top": blockLayout.top + "px",
                    "margin-left": "0px",
                    "margin-top": "0px"
                });
                $blockDiv.attr("title", buildTaskTitle(data._category, data._serie, data._task, range));
                $("div.ganttview-block-text", $blockDiv).text(getTaskText(data._task, task_minutes, 'hour'));
            } else {
                let size = DateUtils.daysBetween(range.start, range.end) + 1;
                let offset = DateUtils.daysBetween(opts.start, range.start, true);
                let blockWidth = Math.max(opts.minBlockWidth || 1, (size * opts.cellWidth) - CONST_CELL_HGT_RESERVED);
                let blockLayout = getBlockLayout(opts, data._task || data);

                $blockDiv.css({
                    "width": blockWidth + "px",
                    "height": blockLayout.height + "px",
                    "left": ((offset * opts.cellWidth) + CONST_DAY_LEFT_MARGIN) + "px",
                    "top": blockLayout.top + "px",
                    "margin-left": "0px",
                    "margin-top": "0px"
                });

                $blockDiv.attr("title", buildTaskTitle(data._category, data._serie, data._task, range));
                $("div.ganttview-block-text", $blockDiv).text(getTaskText(data._task, size, 'day'));
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
                if (!block_data._serie.tasks || block_data._serie.tasks.length === 0) {
                    serieDeleted = removeSerieBlock(block_data._category, block_data._serie)
                }
            }

            if (taskDeleted === false) return;

            let tId = block_data.tId;
            let sId = block_data.sId;
            let cId = block_data.cId;

            if (opts.viewMode === 'hour') {
                findBlockByTask(tId).remove();
            } else {
                findBlockByTask(tId).remove();
                if (serieDeleted) {
                    findGridRowBySerie(sId).remove();
                    findBlockContainers({sId: sId}).remove();
                    findVtHeaderSerieName(sId).remove();

                    let $itemDiv = findVtHeaderItemName(cId);
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
                let range = getTaskRenderRange(task);
                if (!range) return;
                let task_minutes = DateUtils.minutesBetween(range.start, range.end);
                let size = Math.max(opts.minBlockWidth || 1, Math.floor(task_minutes * pixel_per_minutes) + 1);
                let offset = Math.floor(DateUtils.minutesBetween(opts.start, range.start) * pixel_per_minutes) + 1;
                let blockLayout = getBlockLayout(opts, task);

                let $block = $("<div>", {
                    "id": makeDomId("ganttview-block", task.tId),
                    "data-tid": task.tId,
                    "data-source-tid": task.tId,
                    "data-sid": serie.sId,
                    "data-cid": category.cId,
                    "class": "ganttview-block",
                    "title": buildTaskTitle(category, serie, task, range),
                    "css": {
                        "width": size + "px", // 甘特条宽度, hour模式按分钟定位
                        "height": blockLayout.height + "px",
                        "left": offset + "px",
                        "top": blockLayout.top + "px",
                        "margin-left": "0px",
                        "margin-top": "0px"
                    }
                });
                $block.attr("data-layout-top", blockLayout.top).attr("data-layout-height", blockLayout.height);
                applySemanticClasses($block, category, serie, task);

                if (task.isTask) $block.addClass("ganttview-task"); // 对于任务类型的处理
                if (opts.highlightConflicts !== false && checkTaskConflict(serie, task)) {
                    $block.addClass("ganttview-block-conflict");
                }

                updateBlockData($block, category, serie, task);

                // 有其他背景色的要求。冲突色优先级最高。
                rememberBlockOptionColor($block, task);
                if (!!task.options && task.options.color) {
                    $block.css("background-color", task.options.color);
                }
                setBlockConflictVisual($block, opts.highlightConflicts !== false && checkTaskConflict(serie, task));

                // 放置文本位置
                $block.append($("<div>", {
                    "id": makeDomId("ganttview-block-text", task.tId),
                    "class": "ganttview-block-text",
                    "css": {
                        "height": blockLayout.height + "px",
                        "line-height": blockLayout.height + "px"
                    },
                }).text(getTaskText(task, task_minutes, 'hour')));

                $container.append($block)
            } else {
                // day 模式
                let range = getTaskRenderRange(task);
                if (!range) return;
                let size = DateUtils.daysBetween(range.start, range.end) + 1;
                let offset = DateUtils.daysBetween(opts.start, range.start, true);
                let blockWidth = Math.max(opts.minBlockWidth || 1, (size * opts.cellWidth) - CONST_CELL_HGT_RESERVED);
                let blockLayout = getBlockLayout(opts, task);

                let $block = $("<div>", {
                    "id": makeDomId("ganttview-block", task.tId),
                    "data-tid": task.tId,
                    "data-source-tid": task.tId,
                    "data-sid": serie.sId,
                    "data-cid": category.cId,
                    "class": "ganttview-block",
                    "title": buildTaskTitle(category, serie, task, range),
                    "css": {
                        "width": blockWidth + "px", // 甘特条宽度
                        "height": blockLayout.height + "px",
                        "left": ((offset * opts.cellWidth) + CONST_DAY_LEFT_MARGIN) + "px",
                        "top": blockLayout.top + "px",
                        "margin-left": "0px",
                        "margin-top": "0px"
                    }
                });
                $block.attr("data-layout-top", blockLayout.top).attr("data-layout-height", blockLayout.height);
                applySemanticClasses($block, category, serie, task);

                if (task.isTask) $block.addClass("ganttview-task"); // 对于任务类型的处理
                if (opts.highlightConflicts !== false && checkTaskConflict(serie, task)) {
                    $block.addClass("ganttview-block-conflict");
                }

                updateBlockData($block, category, serie, task);

                // 有其他背景色的要求。冲突色优先级最高。
                rememberBlockOptionColor($block, task);
                if (!!task.options && task.options.color) {
                    $block.css("background-color", task.options.color);
                }
                setBlockConflictVisual($block, opts.highlightConflicts !== false && checkTaskConflict(serie, task));

                // 放置文本位置
                $block.append($("<div>", {
                    "id": makeDomId("ganttview-block-text", task.tId),
                    "class": "ganttview-block-text",
                    "css": {
                        "height": blockLayout.height + "px",
                        "line-height": blockLayout.height + "px"
                    },
                }).text(getTaskText(task, size, 'day')));

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
            refreshConflictClassesForSerie: refreshConflictClassesForSerie,
            render: render,
            gotoNow: gotoNow,
            gotoDate: gotoDate,
            scrollToNowOnLoad: scrollToNowOnLoad,
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
                    $block.addClass("ganttview-block-selected")
                    if ($blockOld)
                        $blockOld.removeClass("ganttview-block-selected")
                }

                if (callback) {
                    callback($block.data("block-data"));
                }
            });
        }

        // 甘特图改变大小事件：用于动态调整任务开始/结束时间。
        function bindBlockResize(_container, _chart, cellWidth, startDate, callback) {
            if (opts.allowTimeResize === false) return;

            $("div.ganttview-block", _container).each(function () {
                let $block = $(this);
                let block_data = $block.data("block-data");

                if (block_data && block_data.options && block_data.options.resizable) {
                    let snapPx = (opts.viewMode === 'hour') ? getHourSnapPx(cellWidth) : cellWidth;
                    (typeof $block.resizable === "function") && $block.resizable({
                        grid: [snapPx, 0],
                        handles: "e,w",
                        minWidth: Math.max(opts.minBlockWidth || 1, snapPx),
                        containment: 'parent.parent',
                        start: function () {
                            let $__block = $(this);
                            $__block.data("gantt-drag-start-offset", getBlockOffsetFromSlide(_container, $__block));
                            $__block.css("z-index", 10).addClass("ganttview-block-adjusting");
                        },
                        stop: function () {
                            let $__block = $(this);
                            $__block.css("z-index", 2).removeClass("ganttview-block-adjusting");
                            updateDataAndPosition(_container, $__block, cellWidth, startDate);
                            if (_chart.refreshConflictClassesForSerie && block_data && block_data._serie) {
                                _chart.refreshConflictClassesForSerie(block_data._serie);
                            }
                            if (callback) callback(block_data);
                        }
                    });
                }
            });
        }

        // 甘特图拖拽事件：支持左右移动时间，也支持上下切换资源。
        function bindBlockDrag(_container, _chart, cellWidth, cellHeight, startDate, callback) {
            let axis = getDragAxis();
            if (axis === null) return;

            $("div.ganttview-block", _container).each(function () {
                let $block = $(this);
                let block_data = $block.data("block-data");

                if (block_data && block_data.options && block_data.options.draggable && (typeof $block.draggable === "function")) {
                    let snapPx = (opts.viewMode === 'hour') ? getHourSnapPx(cellWidth) : cellWidth;
                    let dragOptions = {
                        grid: [snapPx, cellHeight],
                        containment: 'parent.parent',
                        start: function () {
                            $(this).css("z-index", 10).addClass("ganttview-block-adjusting");
                        },
                        stop: function () {
                            let $__block = $(this);
                            $__block.css("z-index", 2).removeClass("ganttview-block-adjusting");
                            if ($__block.data("gantt-cross-row-drop")) {
                                $__block.removeData("gantt-cross-row-drop");
                                return;
                            }
                            let __block_data = $__block.data("block-data");
                            if (!__block_data) return;

                            updateDataAndPosition(_container, $__block, cellWidth, startDate);
                            if (_chart.refreshConflictClassesForSerie && __block_data && __block_data._serie) {
                                _chart.refreshConflictClassesForSerie(__block_data._serie);
                            }
                            if (callback) callback(__block_data);
                        }
                    };
                    if (axis) dragOptions.axis = axis;
                    $block.draggable(dragOptions);
                }
            });
        }

        function getDragAxis() {
            let allowX = opts.allowTimeMove !== false;
            let allowY = opts.allowResourceMove !== false;
            if (!allowX && !allowY) return null;
            if (allowX && allowY) return false;
            return allowX ? 'x' : 'y';
        }

        function getTimeSnapMinutes() {
            let minutes = parseFloat(opts.timeSnapMinutes);
            if (isNaN(minutes) || minutes <= 0) minutes = 15;
            return minutes;
        }

        function getHourSnapPx(cellWidth) {
            return Math.max(1, Math.round((cellWidth / 60) * getTimeSnapMinutes()));
        }

        function getBlockOffsetFromSlide(container, block) {
            let $slide = $("div.ganttview-slide-container", container);
            if (!$slide.length) return 0;
            let scroll = $slide.scrollLeft() || 0;
            let offset = block.offset().left - $slide.offset().left - 1 + scroll;
            let maxOffset = (($slide[0] && $slide[0].scrollWidth) ? $slide[0].scrollWidth : 0) - block.outerWidth();
            if (!isNaN(maxOffset) && maxOffset > 0) offset = Math.min(offset, maxOffset);
            return Math.max(0, Math.floor(offset));
        }

        function getStoredBlockLayout(block) {
            let top = parseInt(block.attr('data-layout-top'), 10);
            let height = parseInt(block.attr('data-layout-height'), 10);
            if (isNaN(top)) top = parseInt(block.css('top'), 10);
            if (isNaN(height)) height = block.outerHeight() || Math.max(12, (opts.blockHeight || opts.cellHeight - CONST_CELL_HGT_RESERVED));
            if (isNaN(top)) top = 0;
            return { top: top, height: height };
        }

        function getRawTask(block_data) {
            if (!block_data) return null;
            let task = block_data._task || block_data;
            if (task && task._sourceTask) task = task._sourceTask;
            return task;
        }

        function getBufferMinutes(task, key1, key2) {
            if (!task || opts.useBufferTime === false) return 0;
            let v = task[key1];
            if (typeof v === 'undefined') v = task[key2];
            let n = parseFloat(v);
            return isNaN(n) ? 0 : n;
        }

        function syncTaskTimeFields(task, start, end) {
            if (!task) return;
            let source = task._timeSource || task._layerSource || opts.editableTimeSource || 'start';
            let st = new Date(start);
            let ed = new Date(end);
            task.start = st;
            task.end = ed;
            if (source === 'planned') {
                task.plannedStart = new Date(st);
                task.plannedEnd = new Date(ed);
            } else if (source === 'estimated') {
                task.estimatedStart = new Date(st);
                task.estimatedEnd = new Date(ed);
            } else if (source === 'actual') {
                task.actualStart = new Date(st);
                task.actualEnd = new Date(ed);
            }
            if (!task._timePairs) task._timePairs = {};
            task._timePairs[source] = { start: new Date(st), end: new Date(ed), source: source };
        }

        function syncBlockDataTime(block_data, rawStart, rawEnd) {
            let task = getRawTask(block_data);
            if (!task) return;
            syncTaskTimeFields(task, rawStart, rawEnd);
            block_data.start = new Date(rawStart);
            block_data.end = new Date(rawEnd);
            if (block_data._task) {
                block_data._task.start = new Date(rawStart);
                block_data._task.end = new Date(rawEnd);
            }
            syncSerieBoundaryLocal(block_data._serie);
        }

        function formatDateTimeForInput(date) {
            return DateUtils.formatDateToString("%Y/%m/%d %H:%i", new Date(date), opts);
        }

        function formatTimeRangeForPrompt(start, end) {
            return DateUtils.formatDateToString("%H:%i", new Date(start), opts) + "-" + DateUtils.formatDateToString("%H:%i", new Date(end), opts);
        }

        function getDragStartOffset(block) {
            let v = block.data("gantt-drag-start-offset");
            let n = parseFloat(v);
            return isNaN(n) ? null : n;
        }

        function hasHorizontalMove(container, block) {
            if (!block || !block.length) return false;
            let startOffset = getDragStartOffset(block);
            if (startOffset === null) return true;
            let currentOffset = getBlockOffsetFromSlide(container, block);
            let snap = (opts.viewMode === 'hour') ? getHourSnapPx(opts.cellWidth) : opts.cellWidth;
            let threshold = Math.max(1, Math.floor((snap || 1) / 2));
            return Math.abs(currentOffset - startOffset) >= threshold;
        }

        function shouldPromptTimeOnHorizontalMove(container, block) {
            if (opts.promptTimeOnHorizontalMove === false) return false;
            if (opts.viewMode === 'hour' && opts.timeMovePromptEnabledForHour === false) return false;
            if (opts.viewMode !== 'hour' && opts.timeMovePromptEnabledForDay === false) return false;
            if (typeof window === 'undefined' || typeof window.prompt !== 'function') return false;
            return hasHorizontalMove(container, block);
        }

        function parseDatePrefix(text) {
            if (!text) return null;
            let m = String(text).match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+/);
            if (!m) return null;
            return {
                year: parseInt(m[1], 10),
                month: parseInt(m[2], 10),
                day: parseInt(m[3], 10)
            };
        }

        function combineDateAndTime(baseDate, token) {
            let text = String(token || '').trim();
            let datePrefix = parseDatePrefix(text);
            let timeMatch = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
            if (!timeMatch) return null;
            let base = new Date(baseDate);
            let y = base.getFullYear(), m = base.getMonth(), d = base.getDate();
            if (datePrefix) {
                y = datePrefix.year;
                m = datePrefix.month - 1;
                d = datePrefix.day;
            }
            let hh = parseInt(timeMatch[1], 10);
            let mi = parseInt(timeMatch[2], 10);
            let ss = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
            if (isNaN(hh) || isNaN(mi) || hh < 0 || hh > 23 || mi < 0 || mi > 59 || ss < 0 || ss > 59) return null;
            return new Date(y, m, d, hh, mi, ss, 0);
        }

        function parseTimeMoveInput(input, candidateStart, candidateEnd) {
            let text = String(input || '').trim();
            if (!text) return { start: new Date(candidateStart), end: new Date(candidateEnd), usedInput: false };

            text = text.replace(/[，,;；至到~～]/g, ' ').replace(/\s*-\s*/g, ' ');
            let tokens = [];
            let re = /(?:\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\s+)?\d{1,2}:\d{2}(?::\d{2})?/g;
            let match;
            while ((match = re.exec(text)) !== null) tokens.push(match[0]);
            if (tokens.length === 0) return null;

            let durationMinutes = Math.max(1, DateUtils.minutesBetween(candidateStart, candidateEnd));
            let start = combineDateAndTime(candidateStart, tokens[0]);
            if (!start) return null;
            let end;
            if (tokens.length >= 2) {
                let endBase = (parseDatePrefix(tokens[1]) ? candidateEnd : candidateStart);
                end = combineDateAndTime(endBase, tokens[1]);
                if (!end) return null;
                if (end.getTime() <= start.getTime()) end = DateUtils.add(end, 1, 'day');
            } else {
                end = DateUtils.add(new Date(start), durationMinutes, 'minute');
            }
            return { start: start, end: end, usedInput: true };
        }

        function askTimeForHorizontalMove(container, block, candidateStart, candidateEnd, rawTask) {
            if (!shouldPromptTimeOnHorizontalMove(container, block)) {
                return { start: new Date(candidateStart), end: new Date(candidateEnd), usedInput: false, prompted: false };
            }
            let taskName = rawTask && (rawTask.tName || rawTask.sName || rawTask.name) ? (rawTask.tName || rawTask.sName || rawTask.name) : t(opts, 'currentTask');
            let msg = t(opts, 'promptTask') + "：" + taskName + "\n" +
                t(opts, 'promptDefaultTime') + "：" + formatDateTimeForInput(candidateStart) + " - " + formatDateTimeForInput(candidateEnd) + "\n\n" +
                t(opts, 'promptInstruction') + "\n" +
                t(opts, 'promptFormatHelp') + "\n" +
                t(opts, 'promptCrossDayHelp');
            let value = window.prompt(msg, "");
            if (value === null) {
                if (opts.timeMovePromptAllowCancelAsDefault === false) return { cancelled: true };
                return { start: new Date(candidateStart), end: new Date(candidateEnd), usedInput: false, prompted: true };
            }
            let parsed = parseTimeMoveInput(value, candidateStart, candidateEnd);
            if (!parsed) {
                if (typeof window.alert === 'function') {
                    window.alert(t(opts, 'promptInvalidTime'));
                }
                return { start: new Date(candidateStart), end: new Date(candidateEnd), usedInput: false, prompted: true, invalidInput: true };
            }
            parsed.prompted = true;
            return parsed;
        }

        function syncSerieBoundaryLocal(serie) {
            if (!serie || !Array.isArray(serie.tasks) || serie.tasks.length === 0) return;
            let minStart = null, maxEnd = null;
            for (let task of serie.tasks) {
                if (!task || !task.start || !task.end) continue;
                let st = new Date(task.start);
                let ed = new Date(task.end);
                if (isNaN(st.getTime()) || isNaN(ed.getTime())) continue;
                if (!minStart || st.getTime() < minStart.getTime()) minStart = new Date(st);
                if (!maxEnd || ed.getTime() > maxEnd.getTime()) maxEnd = new Date(ed);
            }
            if (minStart && maxEnd) {
                serie.start = minStart;
                serie.end = maxEnd;
            }
        }

        // 拖拽或缩放后，按新的横向位置同步任务时间。
        function updateDataAndPosition(container, block, cellWidth, startDate) {
            let block_data = block.data("block-data");
            if (typeof block_data === 'undefined') return;

            let rawTask = getRawTask(block_data);
            if (!rawTask) return;

            if (opts.viewMode === 'hour') {
                let pixel_per_minutes = opts.cellWidth / 60;
                let offset = getBlockOffsetFromSlide(container, block);
                let snap = getTimeSnapMinutes();
                let minutesFromStart = Math.max(0, Math.round((offset / pixel_per_minutes) / snap) * snap);
                let renderStart = DateUtils.add(new Date(startDate), minutesFromStart, 'minute');
                let renderMinutes = Math.max(snap, Math.round((block.outerWidth() / pixel_per_minutes) / snap) * snap);
                let renderEnd = DateUtils.add(new Date(renderStart), renderMinutes, 'minute');

                let before = getBufferMinutes(rawTask, 'bufferBeforeMinutes', 'bufferBefore');
                let after = getBufferMinutes(rawTask, 'bufferAfterMinutes', 'bufferAfter');
                let newStart = DateUtils.add(renderStart, before, 'minute');
                let newEnd = DateUtils.add(renderEnd, -after, 'minute');
                if (newEnd.getTime() < newStart.getTime()) {
                    newEnd = DateUtils.add(new Date(newStart), snap, 'minute');
                    renderEnd = DateUtils.add(new Date(newEnd), after, 'minute');
                }

                let confirmed = askTimeForHorizontalMove(container, block, newStart, newEnd, rawTask);
                if (confirmed && confirmed.cancelled) {
                    reloadGantts(data, { preserveScrollOnReload: true });
                    return;
                }
                if (confirmed) {
                    newStart = confirmed.start;
                    newEnd = confirmed.end;
                    renderStart = DateUtils.add(new Date(newStart), -before, 'minute');
                    renderEnd = DateUtils.add(new Date(newEnd), after, 'minute');
                }

                syncBlockDataTime(block_data, newStart, newEnd);
                let visibleMinutes = Math.max(snap, DateUtils.minutesBetween(renderStart, renderEnd));
                let size = Math.max(opts.minBlockWidth || 1, Math.floor(visibleMinutes * pixel_per_minutes) + 1);
                let newOffset = Math.floor(DateUtils.minutesBetween(opts.start, renderStart) * pixel_per_minutes) + 1;

                let layout = getStoredBlockLayout(block);
                $("div.ganttview-block-text", block).text(DateUtils.getTagFromMinutes(DateUtils.minutesBetween(newStart, newEnd), opts));
                block.css({
                    "position": "absolute",
                    "width": size + "px",
                    "height": layout.height + "px",
                    "left": newOffset + "px",
                    "top": layout.top + "px",
                    "margin-left": "0px",
                    "margin-top": "0px"
                });
            } else {
                let offset = getBlockOffsetFromSlide(container, block);
                let daysFromStart = Math.max(0, Math.floor(offset / cellWidth));
                let renderStart = DateUtils.addDays(new Date(startDate), daysFromStart);
                let width = block.outerWidth();
                let numberOfDays = Math.max(0, Math.floor(width / cellWidth));
                let renderEnd = DateUtils.addDays(new Date(renderStart), numberOfDays);

                let before = getBufferMinutes(rawTask, 'bufferBeforeMinutes', 'bufferBefore');
                let after = getBufferMinutes(rawTask, 'bufferAfterMinutes', 'bufferAfter');
                let newStart = DateUtils.add(renderStart, before, 'minute');
                let newEnd = DateUtils.add(renderEnd, -after, 'minute');
                if (newEnd.getTime() < newStart.getTime()) newEnd = new Date(newStart);

                let confirmed = askTimeForHorizontalMove(container, block, newStart, newEnd, rawTask);
                if (confirmed && confirmed.cancelled) {
                    reloadGantts(data, { preserveScrollOnReload: true });
                    return;
                }
                if (confirmed) {
                    newStart = confirmed.start;
                    newEnd = confirmed.end;
                }

                syncBlockDataTime(block_data, newStart, newEnd);
                let layout = getStoredBlockLayout(block);
                $("div.ganttview-block-text", block).text(numberOfDays + 1 + "天");
                block.css({
                    "position": "absolute",
                    "height": layout.height + "px",
                    "left": ((daysFromStart * cellWidth) + CONST_DAY_LEFT_MARGIN) + "px",
                    "top": layout.top + "px",
                    "margin-left": "0px",
                    "margin-top": "0px"
                });
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
                    let headerSelector = (_opts.viewMode === 'hour') ? '.ganttview-hzheader-hour' : '.ganttview-hzheader-day';
                    $(headerSelector, _container).eq(indexCount).addClass('ganttview-grid-row-cell-hover')
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
                    let headerSelector = (_opts.viewMode === 'hour') ? '.ganttview-hzheader-hour' : '.ganttview-hzheader-day';
                    $(headerSelector, _container).eq(indexCount).removeClass('ganttview-grid-row-cell-hover')
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

        getMonthNames: function (m, _opts) {
            let cal = getGanttI18n(_opts).calendar || currentLanguage;
            return cal.monthNameShort[m]
        },

        getWeekName: function (w, _opts) {
            let cal = getGanttI18n(_opts).calendar || currentLanguage;
            return cal.dayOfWeekNames[w]
        },

        getWeekFullName: function (w, _opts) {
            let cal = getGanttI18n(_opts).calendar || currentLanguage;
            return cal.dayOfWeekNamesFull[w]
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

        // 返回两个日期所在自然日之间的间隔天数。
        // 旧实现通过 while 逐日累加，长时间窗口会非常慢；这里改为按午夜时间戳直接计算。
        // no_include_end 参数保留用于兼容旧调用，但不再人为 -1；否则条形 offset 会提前一天。
        daysBetween: function (start, end, no_include_end) {
            if (!start || !end) return 0;
            let s = new Date(start);
            let e = new Date(end);
            if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
            if (s.getFullYear() === 1901 || e.getFullYear() === 8099) return 0;

            let s0 = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
            let e0 = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
            return Math.max(0, Math.round((e0 - s0) / (24 * 60 * 60 * 1000)));
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

        getTagFromMinutes: function (_minutes, _opts) {
            if (_minutes < 60) {
                return "" + _minutes.toFixed(1) + t(_opts, 'minuteUnit');
            }
            if (_minutes < 60 * 24) {
                return "" + (_minutes / 60).toFixed(1) + t(_opts, 'hourUnit');
            }
            return "" + (_minutes / (60 * 24)).toFixed(1) + t(_opts, 'dayUnit');
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
                    date.getDate() - Math.abs(date.getDay() - defaults.weekStart)
                )
            );
            const end = new Date(
                date.setDate(
                    date.getDate() - date.getDay() + (6 + defaults.weekStart)
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

        getQuarterOfDate: function(date, _opts) {
            let m = Math.floor(date.getMonth() / 3)
            let cal = getGanttI18n(_opts).calendar || currentLanguage;
            return cal.quarterNames[m]
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
        formatDateToString: function (format, date, _opts) {
            let dateFormat = (getGanttI18n(_opts).calendar || currentLanguage);
            date = new Date(date);
            let that = this;
            return format.replace(/%[a-zA-Z]/g, function (format) {
                switch (format) {
                    case "%d":
                        return _toFixed(date.getDate());
                    case "%m":
                        return _toFixed(date.getMonth() + 1);
                    case "%q":
                        return that.getQuarterOfDate(date, _opts);
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
            return name + ", " + distance + t(defaults, 'dayUnit');
        },
    };

    // Public i18n helpers. They keep the control lightweight while allowing projects
    // to add languages without changing the core file.
    $.fn.ganttView.i18n = GANTT_I18N;
    $.fn.ganttView.addLanguage = function (locale, languagePack) {
        if (!locale || !languagePack) return false;
        let name = normalizeLocaleName(locale);
        GANTT_I18N[name] = ganttDeepMerge(GANTT_I18N[name] || {}, languagePack);
        return true;
    };
})(jQuery);
