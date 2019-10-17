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

function task(update_parent, initial_values = {}) {
    let task = document.createElement("div");
    task.className = "task";

    let comment = document.createElement("input");
    comment.className = "comment";
    comment.type = "text";
    if("comment" in initial_values)
        comment.value = initial_values.comment;
    task.appendChild(comment);

    let start_time = document.createElement("input");
    start_time.className = "start_time";
    start_time.type = "time";
    start_time.onchange = update_parent;
    if("start_time" in initial_values)
        start_time.value = initial_values.start_time;
    task.appendChild(start_time);

    let stop_time = document.createElement("input");
    stop_time.className = "stop_time";
    stop_time.type = "time";
    stop_time.onchange = update_parent;
    if("stop_time" in initial_values)
        stop_time.value = initial_values.stop_time;
    task.appendChild(stop_time);

    task.get_minutes = function () {
        let minutes = string_to_minutes(stop_time.value) - string_to_minutes(start_time.value);
        if(minutes >= 0)
            return minutes;
        else
            return NaN;
    }

    task.get_values = function () {
        return {
            comment: comment.value,
            start_time: start_time.value,
            stop_time: stop_time.value
        }
    };

    return task;
}

function day(dayName, update_parent, initial_values = {}) {
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
    if("tasks" in initial_values) {
        for(let values of initial_values.tasks) {
            tasks.appendChild(task(update, values));
        }
    }
    day.appendChild(add_task_button);

    function update() {
        minutes = 0;
        for (let task of tasks.getElementsByClassName("task")) {
            minutes += task.get_minutes();
        }

        update_parent();
    }

    day.get_values = function () {
        let values = {tasks: []};
        for(let task of tasks.getElementsByClassName("task")) {
            values.tasks.push(task.get_values());
        }
        return values;
    }

    return day;
}

function week(initial_values = {}) {
    let week = document.createElement("div");
    week.className = "week";

    let dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    
    if("days" in initial_values) {
        for (let index = 0; index < dayNames.length; index++) {
            week.appendChild(day(dayNames[index], update, initial_values.days[index]));
        }
    }
    else {
        for (let dayName of dayNames) {
            week.appendChild(day(dayName, update));
        }
    }

    function  update() {
        let required_minutes = 0; //gets accumulated for the whole week. if negative you worked more than needed.
        const daily_required_minutes = 8 * 60;

        for (let day of week.children) {
            required_minutes += daily_required_minutes - day.get_minutes(); 
            day.set_required_minutes(required_minutes);
        }
    }

    week.get_values = function () {
        let values = {days: []};
        for(let day of week.children) {
            values.days.push(day.get_values());
        }
        return values;
    }

    return week;
}

//TODO: Remove.
let initial_values = {
    days: [
        {
            tasks: [
                {
                    comment: "hello",
                    start_time: "08:10",
                    stop_time: "10:00"
                }
            ]
        }
    ]
}

let root = document.getElementById("root");
root.appendChild(week(initial_values));

//TODO: Remove and remove associated button.
function TODO() {
    console.log(root.getElementsByClassName("week")[0].get_values());
}