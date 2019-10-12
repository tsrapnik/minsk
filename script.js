function task() {
    let task = document.createElement("div");
    task.className = "task";

    let comment = document.createElement("input");
    comment.className = "comment";
    comment.type = "text";
    task.appendChild(comment);

    let start_time = document.createElement("input");
    start_time.className = "start_time";
    start_time.type = "time";
    task.appendChild(start_time);

    let stop_time = document.createElement("input");
    stop_time.className = "stop_time";
    stop_time.type = "time";
    task.appendChild(stop_time);

    return task;
}

function time_progress(time_required) {
    let time_progress = document.createElement("div");
    time_progress.className = "time_progress";

    let time_done = document.createElement("input");
    time_done.className = "time_done";
    time_done.type = "time";
    time_done.readOnly = true;
    time_progress.appendChild(time_done);

    let time_not_done = document.createElement("input");
    time_not_done.className = "time_not_done";
    time_not_done.type = "time";
    time_not_done.readOnly = true;
    time_progress.appendChild(time_not_done);

    return time_progress;
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
    add_task_button.onclick = () => {
        tasks.appendChild(task());
    };
    day.appendChild(add_task_button);

    function updateDay() {

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
root.appendChild(week());0