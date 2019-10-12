function task(update_parent) {
    let task = document.createElement("div");
    task.className = "task";

    let comment = document.createElement("input");
    comment.className = "comment";
    comment.type = "text";
    task.appendChild(comment);

    let start_time = document.createElement("input");
    start_time.className = "start_time";
    start_time.type = "time";
    start_time.onchange = update_parent;
    task.appendChild(start_time);

    let stop_time = document.createElement("input");
    stop_time.className = "stop_time";
    stop_time.type = "time";
    stop_time.onchange = update_parent;
    task.appendChild(stop_time);

    return task;
}

function time_progress() {
    let time_progress = document.createElement("div");
    time_progress.className = "time_progress";

    let time_not_done = document.createElement("input");
    time_not_done.className = "time_not_done";
    time_not_done.type = "time";
    time_not_done.readOnly = true;
    time_not_done.value = "08:00"; //todo: provide const.

    time_progress.appendChild(time_not_done);

    return time_progress;
}

Number.prototype.pad = function(size) {
    let s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

//time_string should be of the format "hh:mm".
function string_to_minutes(time_string) {
    if ((time_string.length != 5) || (time_string[2] != ":"))
        return NaN;
    let hours =  parseInt(time_string.slice(0, 2));
    let minutes = parseInt(time_string.slice(3, 5));
    return hours * 60 + minutes;
}

//returns string in "hh:mm" format of the absolute value of the input.
function minutes_to_string(minutes) {
    minutes = Math.abs(minutes);
    let hours = Math.floor(minutes / 60);
    minutes %= 60;
    return hours.pad(2) + ":" + minutes.pad(2);
}

function day(dayName) {
    let day = document.createElement("div");
    day.innerText = dayName;
    day.className = "day";

    let tasks = document.createElement("div");
    tasks.className = "tasks";
    day.appendChild(tasks);

    day.appendChild(time_progress());

    let add_task_button = document.createElement("button");
    add_task_button.className = "add_task_button";
    add_task_button.innerText = "add task";
    add_task_button.onclick = function () {
        tasks.appendChild(task(update));
    };
    day.appendChild(add_task_button);

    function update() {
        let total_time = 0;
        for (let task of tasks.getElementsByClassName("task")) {
            let start_time = string_to_minutes(task.getElementsByClassName("start_time")[0].value);
            let stop_time = string_to_minutes(task.getElementsByClassName("stop_time")[0].value);
            total_time += stop_time - start_time;
        }
        let time_progress = day.getElementsByClassName("time_progress")[0];
        let time_not_done = time_progress.getElementsByClassName("time_not_done")[0];
        time_not_done.value = minutes_to_string(8 * 60 - total_time); //todo: provide const.

        console.log(total_time);
        if(8 * 60 - total_time > 0) { //todo: provide const.
            time_not_done.style.color = "rgba(255, 100, 100, 1.0)";
        }
        else if(8 * 60 - total_time <= 0) {
            time_not_done.style.color = "rgba(255, 255, 255, 0.55)";
        }
        //todo: move logic for time to task?
    }
    return day;
}

function week() {
    let week = document.createElement("div");
    week.className = "week";

    let dayNames = ["monday", "tuesday", "wednesday", "thirsday", "friday"];

    for (let index = 0; index < dayNames.length; index++) {
        week.appendChild(day(dayNames[index]));
    }

    return week;
}

let root = document.getElementById("root");
root.appendChild(week());