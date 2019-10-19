Number.prototype.pad = function(size) {
    let s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

//stolen from https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php.
Date.prototype.getWeekNumber = function(){
    let d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    let dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

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

function task(update_worked_minutes, initial_state = {}) {
    let task = document.createElement("div");
    task.className = "task";

    let top_row = document.createElement("div");
    top_row.className = "top_row";
    task.appendChild(top_row);

    let comment = document.createElement("input");
    comment.className = "comment";
    comment.type = "text";
    comment.onchange = update_worked_minutes;
    if("comment" in initial_state)
        comment.value = initial_state.comment;
    top_row.appendChild(comment);
    
    let close_button = document.createElement("button");
    close_button.className = "close_button";
    close_button.innerText = "⨯";
    close_button.onclick = function () {
        task.parentElement.removeChild(task);
        update_worked_minutes();
    };
    top_row.appendChild(close_button);

    let bottom_row = document.createElement("div");
    bottom_row.className = "bottom_row";
    task.appendChild(bottom_row);

    let start_time = document.createElement("input");
    start_time.className = "start_time";
    start_time.type = "time";
    start_time.onchange = update_worked_minutes;
    if("start_time" in initial_state)
        start_time.value = initial_state.start_time;
    bottom_row.appendChild(start_time);

    let stop_time = document.createElement("input");
    stop_time.className = "stop_time";
    stop_time.type = "time";
    stop_time.onchange = update_worked_minutes;
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

function day(dayName, update_required_minutes, initial_state = {}) {
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
        if(minutes <= 0) {
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
        tasks.appendChild(task(update_worked_minutes, initial_state));
        update_worked_minutes();
    };
    if("tasks" in initial_state) {
        for(let state of initial_state.tasks) {
            tasks.appendChild(task(update_worked_minutes, state));
        }
        update_worked_minutes();
    }
    day.appendChild(add_task_button);

    function update_worked_minutes() {
        minutes = 0;
        for (let task of tasks.getElementsByClassName("task")) {
            minutes += task.get_minutes();
        }

        update_required_minutes();
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
            week.appendChild(day(dayNames[index], update_required_minutes, initial_state.days[index]));
        }
    }
    else {
        for (let dayName of dayNames) {
            week.appendChild(day(dayName, update_required_minutes));
        }
    }
    update_required_minutes();

    function  update_required_minutes() {
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

initialize_state();

function initialize_state() {
    let initial_state = JSON.parse(localStorage.getItem("state"));
    if(initial_state == null)
        initial_state = {};
    document.getElementById("task_window").appendChild(week(initial_state));
}

function save_state() {
    let anchor = document.createElement("a");

    //we need to append the anchor to the body, otherwise it doesn't work in firefox.
    document.getElementsByTagName("body")[0].appendChild(anchor);
    //give a unique id so we can easily remove it after use.
    anchor.id = "temporary_anchor";

    let the_week = document.getElementById("task_window").children[0];
    let state = JSON.stringify(the_week.get_state());
    anchor.href = 'data:text/plain;charset=utf-u,'+encodeURIComponent(state);
    let today = new Date();
    anchor.download = "working_hours_"
                      + today.getUTCFullYear()
                      + "_week_"
                      + today.getWeekNumber()
                      + ".json";
    anchor.click();

    document.getElementsByTagName("body")[0].removeChild(document.getElementById("temporary_anchor"));
}

function load_state() {
    //because of security reasons there seems to be now other way
    //than to click a hidden browse button and let its handler do
    //all the work.
    let browser = document.createElement("input");
    browser.type = "file";
    browser.onchange = load_state_handler;
    browser.click();
}

function load_state_handler(event) {
    let reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = function () {
        let state = JSON.parse(reader.result);
        let task_window = document.getElementById("task_window");
        if(task_window.hasChildNodes())
            task_window.removeChild(task_window.children[0]);
        task_window.appendChild(week(state));
    }
}

function clear_state() {
    let task_window = document.getElementById("task_window");
    if(task_window.hasChildNodes())
        task_window.removeChild(task_window.children[0]);
    task_window.appendChild(week());
}