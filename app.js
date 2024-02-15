const taskInput = document.querySelector(".form input"),
    btnTodoAdd = document.querySelector(".btn-add"),
    tasksList = document.querySelector("#tasksList"),
    form = document.querySelector(".form"),
    btnDeleteAll = document.querySelector(".btn-delete-all");

let tasks = [];

if (localStorage.getItem("tasks")) {
    tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks.forEach((task) => renderTask(task));
}

form.addEventListener("submit", (e) => e.preventDefault());

btnTodoAdd.addEventListener("click", addTodoTask);

tasksList.addEventListener("click", deleteTask);

tasksList.addEventListener("click", startEditTask);

tasksList.addEventListener("click", closeEditTask);

tasksList.addEventListener("click", doneTask);

btnDeleteAll.addEventListener("click", deleteAllTasks);

function addTodoTask() {
    const taskText = taskInput.value;
    if (!taskInput.value.trim()) return taskInput.focus();
    const newTask = {
        id: Date.now(),
        text: taskText,
        done: false,
    };

    tasks.push(newTask);
    saveToLocalStorage();

    renderTask(newTask);
    taskInput.value = "";
    taskInput.focus();
}
function deleteTask(event) {
    if (event.target.dataset.action !== "delete") return;
    const parentNode = event.target.closest(".list-group-item");
    const id = +parentNode.id;

    tasks = tasks.filter((task) => task.id !== id);
    saveToLocalStorage();

    parentNode.remove();
}
function startEditTask(event) {
    if (event.target.dataset.action !== "edit") return;
    const parentNode = event.target.closest(".list-group-item");
    const editText = parentNode.querySelector(".task-item-title p");
    const btnDelete = parentNode.querySelector(".btn-delete");
    const btnAccept = parentNode.querySelector(".btn-accept");
    event.target.classList.add("none");
    btnDelete.classList.add("none");
    btnAccept.classList.add("block");
    editText.setAttribute("contenteditable", "true");
    editText.focus();
}
function closeEditTask(event) {
    if (event.target.dataset.action !== "accept") return;
    const parentNode = event.target.closest(".list-group-item");
    const editText = parentNode.querySelector(".task-item-title p");
    const btnDelete = parentNode.querySelector(".btn-delete");
    const btnEdit = parentNode.querySelector(".btn-edit");
    event.target.classList.remove("block");
    btnDelete.classList.remove("none");
    btnEdit.classList.remove("none");
    editText.setAttribute("contenteditable", "false");
    const id = +parentNode.id;
    const task = tasks.find((task) => task.id === id);
    task.text = editText.textContent;
    saveToLocalStorage();
}
function doneTask(event) {
    if (event.target.getAttribute("type", "checkbox")) {
        const parentNode = event.target.closest(".list-group-item");

        const id = +parentNode.id;
        const task = tasks.find((task) => task.id === id);
        task.done = !task.done;
        saveToLocalStorage();

        const btnEdit = parentNode.querySelector(".btn-edit");
        btnEdit.classList.toggle("none");
    }
}
function deleteAllTasks() {
    tasks = [];
    saveToLocalStorage();
    tasksList.innerHTML = "";
}
function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function renderTask(task) {
    const isDone = task.done ? "checked" : "";
    const cssClass = task.done ? "task-btn btn-edit none" : "task-btn btn-edit";

    const taskHTML = `<li id="${task.id}" class="list-group-item">
        <div class="task-item-title">
            <input type="checkbox" ${isDone}/>
            <p>${task.text}</p>
        </div>
        <div class="task-item-buttons">
            <button
                class="${cssClass}"
                data-action="edit">
                    <img src="icons/edit.svg" alt="edit" />
            </button>
            <button
                class="task-btn btn-delete"
                data-action="delete">
                    <img src="icons/delete.svg" alt="delete" />
            </button>
            <button
                class="task-btn btn-accept"
                data-action="accept">
                    <img src="icons/accept.svg" alt="accept" />
            </button>
        </div>
    </li>`;

    tasksList.insertAdjacentHTML("beforeend", taskHTML);
}
