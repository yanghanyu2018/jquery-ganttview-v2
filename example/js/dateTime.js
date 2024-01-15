/*对Date的扩展，将 Date 转化为指定格式的String
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * 例子：
* (new Date()).format("yyyy-MM-dd HH:mm:ss.S") ==> 2019-01-02 10:19:04.423
* (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2019-1-2 10:19:4.18
*/
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //12小时
        "H+": this.getHours(), //24小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    var week = {
        "0": "/u65e5",
        "1": "/u4e00",
        "2": "/u4e8c",
        "3": "/u4e09",
        "4": "/u56db",
        "5": "/u4e94",
        "6": "/u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

//扩展获取日期的方法
Date.prototype.getNewDate = function (count) {

    this.setDate(this.getDate() + count);
    var year = this.getFullYear();
    var month = this.getMonth() + 1;
    var day = this.getDate();
    if (month < 10) {
        month = "0" + month
    }
    if (day < 10) {
        day = "0" + day
    }
    return year + "-" + month + "-" + day;
};

function getDateRangeLength(startTime, endTime, diffType, span) {
    if (typeof span === "undefined")
        span = 1;

    //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
    startTime = startTime.replace(/\-/g, "/");
    endTime = endTime.replace(/\-/g, "/");

    //将计算间隔类性字符转换为小写
    diffType = diffType.toLowerCase();
    var sTime = new Date(startTime); //开始时间
    var eTime = new Date(endTime); //结束时间

    //作为除数的数字
    var timeType = 1;
    switch (diffType) {
        case"second":
            timeType = 1000;
            break;
        case"minute":
            timeType = 1000 * 60;
            break;
        case"hour":
            timeType = 1000 * 3600;
            break;
        case"day":
            timeType = 1000 * 3600 * 24;
            break;
        default:
            break;
    }

    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(timeType * span));
}

// 按日期
function getDateRangeArray(startDate, endDate, diffType, span) {
    if (typeof span === "undefined")
        span = 1;

    var length = getDateRangeLength(startDate, endDate, diffType, span);
    var dateArray = [];

    for (var i = 1; i <= length; i++) {
        dateArray.push(new Date(endDate).getNewDate(-i));
    }

    return dateArray.sort();
}

function timeYMD_Frame(start, end) {
    // time 类型 是newDate()的 Sun Apr 08 2018 08:00:00 GMT+0800 (中国标准时间) 格式
    function __format(time) {
        let year = time.getFullYear(); //获取年份。
        let mouth = time.getMonth() + 1; //获取月份。
        let day = time.getDate(); //获取天
        return {
            year,
            mouth,
            day
        }
    }

    //获取开始时间和结束时间的时间戳
    var startTime = new Date(start).getTime()
    var endTime = new Date(end).getTime()
    var dateArr = [] // 存放区间数据的数组
    var stamp;
    var oneDay = 24 * 60 * 60 * 1000;
    for (stamp = startTime; stamp <= endTime;) {
        dateArr.push(__format(new Date(stamp)))
        stamp += oneDay
    }

    //此时的dateArr 格式为[{year: 2020, mouth: 10, day: 1},{year: 2020, mouth: 10, day: 2},....]  可以在这里打印下看看
    var listArr = [] // 存放转换后的数组  把扁平化的数据转换为 层级结构的
    dateArr.forEach((item, index) => {
        if (index === 0) {
            listArr.push({
                year: item.year,
                mouthArr: [{
                    yearItem: item.year,
                    mouth: item.mouth,
                    dayArr: [item.day]
                }]
            })
        } else {
            // 不是第一次,就需要两个数组对比如果有一样的就再对比
            //some()函数  用于检测数组中的元素是否满足指定条件.

            // 如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测
            var yearFlag = listArr.some((listItem, listIndex) => {
                // 如果年份相等,就要循环月份数组
                if (listItem.year == item.year) {
                    // 如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测
                    var mouthFlag = listItem.mouthArr.some((mouthItem, mouthIndex) => {
                        // 如果月份相等,就把天push进去,return true
                        if (mouthItem.mouth == item.mouth) {
                            mouthItem.dayArr.push(item.day)
                            return true;
                        }
                    })
                    //  如果月开关是fasle 就代表月份没有一样的 push就行了
                    if (!mouthFlag) {
                        listItem.mouthArr.push({
                            yearItem: item.year,
                            mouth: item.mouth,
                            dayArr: [item.day]
                        })
                    }
                    return true
                }
            })

            //  如果年开关是fasle 就代表年份没有一样的 push就行了
            if (!yearFlag) {
                // 如果年份不相等,年份数组push
                listArr.push({
                    year: item.year,
                    mouthArr: [{
                        yearItem: item.year,
                        mouth: item.mouth,
                        dayArr: [item.day]
                    }]
                })
            }
        }
    })
    return listArr
}

function getHourList(startDate, endDate, bInclude) {
    const dateList = []
    let sd = new Date(startDate)
    dateList.push(sd.format("yyyy-MM-dd HH"))

    let ed = new Date(endDate)
    while (true) {
        sd.setHours(sd.getHours() + 1)

        if (sd.getTime() < ed.getTime()) {
            dateList.push(sd.format("yyyy-MM-dd HH"))
        } else {
            break
        }
    }

    if (bInclude)
        dateList.push(ed.format("yyyy-MM-dd HH"))
    return dateList
}

function getDateList(startDate, endDate, bInclude) {
    const dateList = []
    let sd = new Date(startDate)
    dateList.push(sd.format("yyyy-MM-dd"))

    let ed = new Date(endDate)
    while (true) {
        sd.setDate(sd.getDate() + 1)

        if (sd.getTime() < ed.getTime()) {
            dateList.push(sd.format("yyyy-MM-dd"))
        } else {
            break
        }
    }

    if (bInclude)
        dateList.push(ed.format("yyyy-MM-dd"))
    return dateList
}

function getMonthList(startDate, endDate, bInclude) {
    const monthList = []

    // 避免跨月的产生
    let d = new Date(startDate).setDate(1)
    let sd = new Date(d)
    monthList.push(sd.format("yyyy-MM"))

    let ed = new Date(endDate)
    while (true) {
        sd.setMonth(sd.getMonth() + 1)

        if (sd.getTime() < ed.getTime()) {
            monthList.push(new Date(sd).format("yyyy-MM"))
        } else {
            break
        }
    }

    if (bInclude)
        monthList.push(ed.format("yyyy-MM"))
    return monthList
}

function time14_hhmm(time14) {
    if (!time14)
        return ""
    return time14.substr(8, 4)
}

function getDaysBetween(startDate, enDate) {
    const sDate = Date.parse(startDate)
    const eDate = Date.parse(enDate)

    if (sDate === eDate) {
        return 0
    }

    const days = (eDate - sDate) / (1 * 24 * 60 * 60 * 1000)
    return days
}

function time14_hhmm_base(time14, base_time14) {
    if (!time14) return ""
    if (!base_time14) base_time = time14

    let time_short = time14.substr(8, 4)
    let time_date = time14.substr(0,4) +'-' + time14.substr(4,2) +'-' + time14.substr(6,2)
    let base_date = base_time14.substr(0,4) +'-' + base_time14.substr(4,2) +'-' + base_time14.substr(6,2)
    let d = getDaysBetween(time_date, base_date)
    if (d>0) {
        if (d>9)
            time_short = time_short + '+*'
        else
            time_short = time_short + '+' + d
    }  else if (d <0) {
        if (d<-9)
            time_short = time_short + '-*'
        else
            time_short = time_short + '-' + d
    }
    return time_short
}

function time14_datetime_str(time14) {
    if (!time14)
        return ""
    return time14.substr(0,4) +'-' + time14.substr(4,2) +'-' + time14.substr(6,2) + ' '
        + time14.substr(8,2) + ':' + time14.substr(10,2) + ':' + time14.substr(12,2)
}

function datetime_time14_str(dt) {
    if (!dt)
        return ""
    try {
        let sDate = new Date(Date.parse(dt))

        return sDate.format("yyyyMMddHHmmss")
    } catch (e) {
        return ""
    }
}

function now_time14() {
    let sDate = new Date()
    return sDate.format("yyyyMMddHHmmss")
}

function time14_datetime(time14) {
    try {
        return (new Date(Date.parse(time14_datetime_str(time14))))
    } catch (e) {
        return null
    }
}