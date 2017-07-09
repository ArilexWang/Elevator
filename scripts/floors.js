var UP = 1
var DOWN = -1
var scheduler = new Scheduler();

function outButtonClick(event) {
    var t = $(event.target)
    // t ==> span
    var floor = t.data('id')
    var direction = t.attr('class') === 'down' ? DOWN : UP
    
    //按钮变亮
    t.addClass("active");
    t.attr('disabled', true);

    //回调函数，重制按钮状态
    function callB(){
        t.removeClass("active")
        t.attr('disabled',false);
    }

    var task = new OutsideTask(floor,direction)

    task.callB = callB

    scheduler.send(task,elevators)

}

function inButtonClick(event){
     var t = $(event.target)
     var floor = t.data('id')
     
     t.addClass("active");
     t.attr('disabled', true);

     var task = new InsideTask(floor)

     function callB(){
        t.removeClass("active")
        t.attr('disabled',false);
    }

    task.callB = callB 

    targetId = t.parent().data('id')

    elevators[targetId].recieveTaskFromScheduler(task)

    console.log(elevators[targetId])
}

function alertClick(event){
    var t = $(event.target)

    t.addClass("active");
    t.attr('disabled', true);

    function callB(){
        t.removeClass("active")
        t.attr('disabled',false);
    }

    var task = new Task()
    task.callB = callB

    targetId = t.parent().data('id')

    elevators[targetId].recieveAlertTask(task)
}

$(document).ready(function(){
    $('.up').click(outButtonClick);
    $('.down').click(outButtonClick);
    
    $('.insideNumbutton').click(inButtonClick);
    
    $('.alert').click(alertClick);


    
})



