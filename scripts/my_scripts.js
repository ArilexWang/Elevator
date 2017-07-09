//父类请求
function Task () {
	this.state = 0,   			// 0 表示未发送未完成，1表示完成，-1表示已发送未完成
	this.count = 0,   			// 分配数，记录共分配给几个进程
	this.Max_count = 5 			//最大分配数
	this.alert = 0				//报警
	this.callB 					//回调函数
}
Task.prototype = {
	constructor: Task
}

//外部请求
function OutsideTask(floor,state){
	Task.call(this);
	this.targetFloor = floor,		//请求所在楼层
	this.targetMove = state			//请求目标：-1 表示下行，1表示上行
}
OutsideTask.prototype = {
	constructor: OutsideTask
}

//内部请求
function InsideTask(target){
	Task.call(this);
	this.targetFloor = target		//请求目标楼层
}
InsideTask.prototype = {
	constructor: InsideTask
}



//电梯外部按钮
function OutsideButton(){
	this.id = 0				//与电梯id保持一致
	this.floor = 0, 		//按钮所在楼层
	this.action = 0			//-1表示下行按钮，1表示上行按钮
}
OutsideButton.prototype = {
	constructor: OutsideButton
}

//电梯内部按钮
function InsideButton(){
	this.floorNum = 0,			//表示楼层数
	this.state = 0				//0表示未点亮，1表示点亮
}
InsideButton.prototype = {
	constructor: InsideButton
}

//调度器
function Scheduler() {
	//调度器只有一个，确保单例
	if(typeof Scheduler.instance === 'object'){
		return Scheduler.instance;
	}
	Scheduler.instance = this;

	this.unsolved_task = [], 	//存储未完成请求
	this.priority = []
	
	//计算优先级
	this.calculatePriority = function(outsideTask,elevators){
		var maxId = -1;
		var maxNum = -30;
		
		for(var i = 1;i <= 5;i++){
			this.priority[i] = Math.abs(outsideTask.targetFloor - elevators[i].currentFloor)
			//电梯停止，优先级取倒
			if(elevators[i].state === 0){	
				this.priority[i] = 1/this.priority[i]
			}
			//若请求行为与电梯行为同向
			else if(outsideTask.targetMove * elevators[i].state){
				//若请求方向为下行
				if(outsideTask.targetMove < 0){
					//若电梯所在楼层比请求所在楼层低，优先级取反
					if(elevators[i].currentFloor < outsideTask.targetFloor){
						this.priority[i] = -this.priority[i];
					}
				}
				//若请求方向为上行
				if(outsideTask.targetMove > 0){
					//若电梯所在楼层比请求所在楼层高，优先级取反
					if(elevators[i].currentFloor > outsideTask.targetFloor){
						this.priority[i] = -this.priority[i];
					}
				}
			} 
			//若请求行为与电梯行为不同向，优先级取反
			else{
				this.priority[i] = -this.priority[i];
			}
		}
		//取优先级为0或者优先级最高的进程
		for(var i = 1;i <= 5;i++){
			if(this.priority[i] === 0){
				maxId = i;
				return maxId;
				break;
			}
			else if(this.priority[i] > maxNum){
				maxId = i;
				maxNum = this.priority[i];
			}
		}
		return maxId;
	}

	//发送外部请求到目标进程（电梯）
	this.send = function(task,elevators){
		var targetId = this.calculatePriority(task,elevators)
		let e = elevators[targetId]
		e.recieveTaskFromScheduler(task);
	}
}

Scheduler.prototype = {
	constructor: Scheduler
}

function Elevator(){
	this.id = 0,
	this.state = 0,					//电梯状态：0表示无趋势停止，-1表示停止且趋势下行，-2表示下行
									//		  +1表示停止且趋势上行，+2表示上行
	this.currentFloor = 1, 			//现在所在楼层
	
	this.misson = 0, 				//当前正在处理任务数
	this.taskList = [],				//请求列表
	this.buttonList = []			//电梯按钮




	//接受报警信号
	this.recieveAlertTask = function(alertTask){
		alertTask.alert = 1;
		this.taskList.push(alertTask);
	}




	//接收外部请求
	this.recieveTaskFromScheduler = function(tempTask){  
		
		this.taskList.push(tempTask);
		
		if(this.state === 0){
			this.handleTask();
		}
		else{
		}

	}


	//接受内部请求
	this.recieveTaskFromInside = function(tempTask){
		
		this.taskList.push(tempTask);
		if(this.state === 0){
			this.handleTask();
		}

	}

	//单次运动
	this.singleMove = function(direction){
		var eDom = $('.Elevator').filter('[data-id=' + this.id +']')
        	//往下运行
        	if(direction === DOWN){
        		eDom.css({top:"+=102"});
        		this.currentFloor--;				
        	}
        	else if(direction === 0){
        
        	}
        	//往上运行
        	else{
        		eDom.css({top:"-=102"});
        		
        		this.currentFloor++;
        	}
	}

	//获取运动方向
	this.getDirection = function(){
		var temptask = this.taskList[0];
        var target = temptask.targetFloor;
		var floor = target - this.currentFloor;
        var direction = 0;
        //上行
        if(floor > 0) {
        	direction = 1;
        }
        //保持不动，开门
        else if (floor == 0){
        }
        //下行 
        else{		
        	direction = -1;
        	floor = -floor;
        }
		return direction;
	}

	this.handleTask = function(){
		var temptask = this.taskList[0];
        var target = temptask.targetFloor;
		//电梯运行
		this.state = 1;
        var direction = this.getDirection() 
        var timer = setInterval(function() {
		
		for(var i = 0; i < this.taskList.length; i++){
			if(this.taskList[i].alert === 1){
				var len = this.taskList.length
				for(var j = 0;j < len;j++){
					if(j != i){
						this.taskList[j].callB();
					}
				}
				this.taskList[i].callB()

				clearInterval(timer) 
				this.state = 0
				
				for(var j = 0;j < len;j++){
					this.taskList.pop()
				}
				break

			}
		}

		this.singleMove(direction)

			//找最值
		for(var i = 0; i < this.taskList.length; i++){
			//上行时,找最大值
			if(direction === 1){
				if(this.taskList[i].targetFloor > target){
					target = this.taskList[i].targetFloor
				}
				//排序，目标楼层为升序
				this.taskList.sort(function(s,t){
					var a = s.targetFloor
					var b = t.targetFloor
					return a - b;
				})
			}
			//下行时，找最小值
			else{
				if(this.taskList[i].targetFloor < target){
					target = this.taskList[i].targetFloor
				}
				this.taskList.sort(function(s,t){
					var a = s.targetFloor
					var b = t.targetFloor
					return b - a;
				})

			}

		}
		

		
		//完成任务
		for(var i = 0; i < this.taskList.length; i++){
			if(this.currentFloor === this.taskList[i].targetFloor){
				this.taskList[i].callB();
				this.taskList.splice(i,1);
			}
		}

	
		if (this.currentFloor === target) {
			clearInterval(timer) 
			this.state = 0
		}

    }.bind(this), 2000);
        
	}
}


Elevator.prototype = {
	constructor: Elevator
}



elevators = [];
for(var i = 0;i < 5;i++){
	var tempElevator = new Elevator();
	tempElevator.id = i+1;
	for(var j = 1;j <= 20;j++){
		tempButton = new InsideButton();
		tempButton.floorNum = j;
		tempElevator.buttonList.push(tempButton);
	}
	elevators[i+1] = tempElevator;		
	
}

