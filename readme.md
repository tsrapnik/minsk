# 4: minsk

## author
tsrapnik

## description

web application which allows to keep track of working hours on a weekly basis.

## notes

* the app will automatically set the start time of the next task equal to the stop time of the previous task. however afterwards there is no restriction for the user to leave a time gap between tasks, let tasks overlap or order them not chronologically.

* the app will split or crop any task interfering with lunch time. however when loading an app state from a file, there is no such check. only when changing some task value that task in particular will get rechecked for lunch interference.