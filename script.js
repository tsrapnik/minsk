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
    const max_minutes = 99 * 60 + 59;
    if(!(minutes <= max_minutes))
        //only return values from 00:00 to 99:59, all other cases (also nan) return a default string.
        return "--:--";
    let hours = Math.floor(minutes / 60);
    minutes %= 60;
    return hours.pad(2) + ":" + minutes.pad(2);
}

function task(update_parent, initial_state = {}) {
    let task = document.createElement("div");
    task.className = "task";

    let top_row = document.createElement("div");
    top_row.className = "top_row";
    task.appendChild(top_row);

    let comment = document.createElement("input");
    comment.className = "comment";
    comment.type = "text";
    if("comment" in initial_state)
        comment.value = initial_state.comment;
    top_row.appendChild(comment);
    
    let close_button = document.createElement("button");
    close_button.className = "close_button";
    close_button.innerText = "⨯";
    close_button.onclick = function () {
        task.parentElement.removeChild(task);
        update_parent();
    };
    top_row.appendChild(close_button);

    let bottom_row = document.createElement("div");
    bottom_row.className = "bottom_row";
    task.appendChild(bottom_row);

    let start_time = document.createElement("input");
    start_time.className = "start_time";
    start_time.type = "time";
    start_time.onchange = update_parent;
    if("start_time" in initial_state)
        start_time.value = initial_state.start_time;
    bottom_row.appendChild(start_time);

    let stop_time = document.createElement("input");
    stop_time.className = "stop_time";
    stop_time.type = "time";
    stop_time.onchange = update_parent;
    if("stop_time" in initial_state)
        stop_time.value = initial_state.stop_time;
    bottom_row.appendChild(stop_time);

    task.get_minutes = function () {
        let minutes = string_to_minutes(stop_time.value) - string_to_minutes(start_time.value);
        if(minutes >= 0)
            return minutes;
        else
            return NaN;
    }

    task.get_state = function () {
        return {
            comment: comment.value,
            start_time: start_time.value,
            stop_time: stop_time.value
        }
    };

    task.get_stop_time = () => stop_time.value;

    return task;
}

function day(dayName, update_parent, initial_state = {}) {
    let day = document.createElement("div");
    day.innerText = dayName;
    day.className = "day";
    let minutes = 0;
    day.get_minutes = () => minutes;

    let tasks = document.createElement("div");
    tasks.className = "tasks";
    day.appendChild(tasks);

    let required_minutes = document.createElement("time");
    required_minutes.className = "required_minutes";
    day.appendChild(required_minutes);
    day.set_required_minutes = function (minutes) {
        required_minutes.innerText = minutes_to_string(minutes);
        if(minutes < 0) {
            required_minutes.style.color = "rgba(120, 255, 120, 0.4)";
        }
        else {
            required_minutes.style.color = "rgba(255, 120, 120, 0.6)";
        }
    }

    let add_task_button = document.createElement("button");
    add_task_button.className = "add_task_button";
    add_task_button.innerText = "add task";
    add_task_button.onclick = function () {
        let initial_state = {};
        if(tasks.lastChild != null)
            initial_state.start_time = tasks.lastChild.get_stop_time();
        tasks.appendChild(task(update, initial_state));
    };
    if("tasks" in initial_state) {
        for(let state of initial_state.tasks) {
            tasks.appendChild(task(update, state));
        }
        update();
    }
    day.appendChild(add_task_button);

    function update() {
        minutes = 0;
        for (let task of tasks.getElementsByClassName("task")) {
            minutes += task.get_minutes();
        }

        update_parent();
    }

    day.get_state = function () {
        let state = {tasks: []};
        for(let task of tasks.getElementsByClassName("task")) {
            state.tasks.push(task.get_state());
        }
        return state;
    }

    return day;
}

function week(initial_state = {}) {
    let week = document.createElement("div");
    week.className = "week";

    let dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    
    if("days" in initial_state) {
        for (let index = 0; index < dayNames.length; index++) {
            week.appendChild(day(dayNames[index], update, initial_state.days[index]));
        }
    }
    else {
        for (let dayName of dayNames) {
            week.appendChild(day(dayName, update));
        }
    }
    update();

    function  update() {
        let required_minutes = 0; //gets accumulated for the whole week. if negative you worked more than needed.
        const daily_required_minutes = 8 * 60;

        for (let day of week.children) {
            required_minutes += daily_required_minutes - day.get_minutes(); 
            day.set_required_minutes(required_minutes);
        }

        localStorage.setItem("state", JSON.stringify(get_state()));
    }
    
    week.get_state = get_state;

    function get_state() {
        let state = {days: []};
        for(let day of week.children) {
            state.days.push(day.get_state());
        }
        return state;
    }

    return week;
}

let initial_state = JSON.parse(localStorage.getItem("state"));
if(initial_state == null)
    initial_state = {};

let root = document.getElementById("root");
root.appendChild(week(initial_state));