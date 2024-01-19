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
		<div>id="ganttChart"</div>
	</body>
	...
	</html>



在`<script>`中设置


  	var ganttData = [
		// 按数据格式设置数据
	];

	var gantt = $("#ganttChart").ganttView(ganttData, {
		viewMode: 'day',
		showWeekends: true,
		showNowTimeline: true,
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

## 修改说明  


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
