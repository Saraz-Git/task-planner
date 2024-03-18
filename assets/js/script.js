//Grab references to the elements
const taskFormEl = $('#task-form');
const taskTitleInputEl = $('#task-title');
const taskDateInputEl = $('#task-duedate');
const taskDescriptionInputEl = $('#task-description');

//Retrive task array
function readTasksFromStorage() {
  let taskArr = JSON.parse(localStorage.getItem("tasks"));
  if (!taskArr) {
    taskArr = [];
  };
  return taskArr;
};

//Accept an array of task objects, stringify them and save to localStorage
function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Create a function to generate a unique task id
function generateTaskId() {
  const uniqueId = crypto.randomUUID();
  return uniqueId;
};

// Create a function to create a task card
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card task-card project-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(dayjs(task.dueDate).format('DD/MM/YYYY'));
  const cardDelBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);
  cardDelBtn.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDue = task.dueDate;
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

// Create a function to render the task list and make cards draggable
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

  // Use JQuery UI to make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    // This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
    helper: function (e) {
      // Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      // Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
};

// Create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const taskTitle = taskTitleInputEl.val().trim();
  const taskDate = taskDateInputEl.val();
  const taskDescription = taskDescriptionInputEl.val().trim();

  const newTask = {
    id: generateTaskId(),
    title: taskTitle,
    dueDate: taskDate,
    description: taskDescription,
    status: 'to-do',
  };
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

// Create a function to handle deleting a task
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

// Create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // Read projects from localStorage
  let toDropTasks = readTasksFromStorage();

  // Get the project id from the event
  const taskId = ui.draggable[0].dataset.taskId;

  // Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let toDropTask of toDropTasks) {
    // Find the project card by the `id` and update the project status.
    if (toDropTask.id === taskId) {
      toDropTask.status = newStatus;
    };
  };
  // Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem('tasks', JSON.stringify(toDropTasks));
  renderTaskList();
};

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  taskFormEl.on('submit', handleAddTask);

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
