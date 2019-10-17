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
    const max_minutes = 23 * 60 + 59;
    if(!(minutes <= max_minutes))
        //only return values from 00:00 to 23:59, all other cases (also nan) return an empty string.
        return "";
    let hours = Math.floor(minutes / 60);
    minutes %= 60;
    return hours.pad(2) + ":" + minutes.pad(2);
}

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

    task.get_minutes = function () {
        let minutes = string_to_minutes(stop_time.value) - string_to_minutes(start_time.value);
        if(minutes >= 0)
            return minutes;
        else
            return NaN;
    }

    return task;
}

function day(dayName, update_parent) {
    let day = document.createElement("div");
    day.innerText = dayName;
    day.className = "day";
    let minutes = 0;
    day.get_minutes = () => minutes;

    let tasks = document.createElement("div");
    tasks.className = "tasks";
    day.appendChild(tasks);

    let required_minutes = document.createElement("input");
    required_minutes.className = "required_minutes";
    required_minutes.type = "time";
    required_minutes.readOnly = true;
    day.appendChild(required_minutes);
    day.set_required_minutes = function (minutes) {
        required_minutes.value = minutes_to_string(minutes);
        if(minutes > 0) {
            required_minutes.style.color = "rgba(255, 100, 100, 1.0)";
        }
        else if(minutes <= 0) {
            required_minutes.style.color = "rgba(255, 255, 255, 0.55)";
        }
    }

    let add_task_button = document.createElement("button");
    add_task_button.className = "add_task_button";
    add_task_button.innerText = "add task";
    add_task_button.onclick = function () {
        tasks.appendChild(task(update));
    };
    day.appendChild(add_task_button);

    function update() {
        minutes = 0;
        for (let task of tasks.getElementsByClassName("task")) {
            minutes += task.get_minutes();
        }

        update_parent();
    }

    return day;
}

function week() {
    let week = document.createElement("div");
    week.className = "week";

    let dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    for (let dayName of dayNames) {
        week.appendChild(day(dayName, update));
    }

    return week;

    function  update() {
        let required_minutes = 0; //gets accumulated for the whole week. if negative you worked more than needed.
        const daily_required_minutes = 8 * 60;

        for (let day of week.children) {
            required_minutes += daily_required_minutes - day.get_minutes(); 
            day.set_required_minutes(required_minutes);
        }
    }
}

let root = document.getElementById("root");
root.appendChild(week());