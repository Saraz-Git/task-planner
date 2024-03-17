// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

////Grab references to the elements
const taskFormEl = $('#task-form');
const taskTitleInputEl = $('#task-title');
const taskDateInputEl = $('#task-duedate');
const taskDescriptionInputEl = $('#task-description');
////Initialize task array
function readTasksFromStorage() {
  const taskArr = JSON.parse(localStorage.getItem("tasks"));
  if (!taskArr) {
    taskArr = [];
  };
  return taskArr;
};

////Accept an array of task objects, stringify them and save to localStorage
function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Todo: create a function to generate a unique task id
function generateTaskId() {
  const taskId = crypto.randomUUID();

}


// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card task-card project-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDelBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);
  cardDelBtn.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDue = dayjs(task.dueDate, 'DD/MM/YYYY');
    if (now.isSame(taskDue, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDue)) {
      taskCard.addClass('bg-danger text-white');
      cardDelBtn.addClass('border-light');
    };
  };
  cardBody.append(cardDescription, cardDueDate, cardDelBtn);
  taskCard.append(cardHeader, cardBody);
  return taskCard;
};

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const toRenderTasks = readTasksFromStorage();
  const todoList = $('#todo-cards');
  todoList.empty();
  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();
  const doneList = $('#done-cards');
  doneList.empty();
  for (let toRenderTask of toRenderTasks) {
    if (toRenderTask.status === 'to-do') {
      todoList.append(createTaskCard(toRenderTask));
    } else if (toRenderTask.status === 'in-progress') {
      inProgressList.append(createTaskCard(toRenderTask));
    } else if (toRenderTask.status === 'done') {
      doneList.append(createTaskCard(toRenderTask));
    };
  };
};

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const taskTitle = taskTitleInputEl.val().trim();
  const taskDate = taskDateInputEl.val(); //yyyy-mm-dd format
  const taskDescription = taskDescriptionInputEl.val().trim();

  const newTask = {
    id: crypto.randomUUID(),
    title: taskTitle,
    dueDate: taskDate,
    description: taskDescription,
    status: 'to-do',
  };
  console.log(newTask);
  const tasks = readTasksFromStorage();
  //Pull the tasks from localStorage and push the new task to the array
  tasks.push(newTask);
  saveTasksToStorage(tasks);
  renderTaskList();
  //Clear the form inputs
  taskTitleInputEl.val('');
  taskDateInputEl.val('');
  taskDescriptionInputEl.val('');
};

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const selectedId = $(this).attr('data-task-id');
  const allTasks = readTasksFromStorage();
  allTasks.forEach((toDeleteTask) => {
    if (toDeleteTask.id === selectedId) {
      allTasks.splice(allTasks.indexOf(toDeleteTask), 1);
    };
  });
  saveTasksToStorage(allTasks);
  renderTaskList();
};

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {


};

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  // ? Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });
  // Datepicker widget
  $('#task-duedate').datepicker({
    changeMonth: true,
    changeYear: true,
  });

});







taskFormEl.on('submit', handleAddTask);
