const taskInput = document.querySelector(".form input"),
    btnTodoAdd = document.querySelector("#btn-todo-add"),
    btnGroupAdd = document.querySelector("#btn-group-add"),
    tasksList = document.querySelector("#tasksList"),
    form = document.querySelector(".form"),
    btnDeleteAll = document.querySelector(".btn-delete-all");

let tasks = [];
if (localStorage.getItem("tasks")) {
    tasks = JSON.parse(localStorage.getItem("tasks"));

    tasks.forEach((task) => {
        if (task.items) {
            if (task.open) {
                btnGroupAdd.classList.add("none");
            }
            renderInitialGroup(task);
        } else renderTask(getTask(task), tasksList);
    });
    dragNDrop();
}

form.addEventListener("submit", (e) => e.preventDefault());

btnTodoAdd.addEventListener("click", addTodoTask);
btnGroupAdd.addEventListener("click", addGroupTasks);

tasksList.addEventListener("click", deleteTask);

tasksList.addEventListener("click", startEditTask);

tasksList.addEventListener("click", closeEditTask);

tasksList.addEventListener("click", doneTask);

btnDeleteAll.addEventListener("click", deleteAllTasks);

tasksList.addEventListener("click", openGroup);

function addTodoTask() {
    const taskText = taskInput.value;
    if (!taskInput.value.trim()) return taskInput.focus();
    const newTask = {
        id: Date.now(),
        text: taskText,
        done: false,
    };

    const openGroup = tasks.find((task) => {
        return task.open;
    });

    if (openGroup) {
        openGroup.items.push(newTask);
        renderTaskInGroup(newTask, openGroup);
    } else {
        tasks.push(newTask);

        renderTask(getTask(newTask), tasksList);
    }

    saveToLocalStorage();
    dragNDrop();
    taskInput.value = "";
    taskInput.focus();
}
function addGroupTasks() {
    const groupText = taskInput.value;
    if (!taskInput.value.trim()) return taskInput.focus();
    const newGroup = {
        id: Date.now(),
        text: groupText,
        open: false,
        items: [],
    };

    tasks.push(newGroup);
    saveToLocalStorage();

    renderGroup(newGroup);
    dragNDrop();
    taskInput.value = "";
    taskInput.focus();
}

function deleteTask(event) {
    if (event.target.dataset.action !== "delete") return;
    const parentNode = event.target.closest("li");
    const parentList = parentNode.closest("ul");

    const id = Number(parentNode.id);

    if (parentList.classList.contains("group-list-tasks")) {
        const parentNode = parentList.closest("li");
        const idParent = Number(parentNode.id);
        tasks.find((task) => {
            if (task.id === idParent) {
                task.items = task.items.filter((task) => task.id !== id);
            }
        });
    } else {
        tasks = tasks.filter((task) => task.id !== id);
    }

    // tasks = tasks.filter((task) => task.id !== id);
    saveToLocalStorage();

    parentNode.remove();
    dragNDrop();
}
function deleteAllTasks() {
    tasks = [];
    saveToLocalStorage();
    tasksList.innerHTML = "";
    dragNDrop();
}

function startEditTask(event) {
    if (event.target.dataset.action !== "edit") return;

    const parentNode = event.target.closest("li");
    const id = Number(parentNode.id);
    // const parentList = parentNode.closest("ul");

    const editText = parentNode.querySelector(`.text-task`);
    const btnDelete = parentNode.querySelectorAll(`.btn-delete`);
    const btnAccept = parentNode.querySelectorAll(`.btn-accept`);
    btnDelete.forEach((btn) => {
        if (btn.closest("li") === parentNode) {
            btn.classList.add("none");
        }
    });
    btnAccept.forEach((btn) => {
        if (btn.closest("li") === parentNode) {
            btn.classList.add("block");
        }
    });

    event.target.classList.add("none");
    // btnDelete.classList.add("none");
    // btnAccept.classList.add("block");

    editText.setAttribute("contenteditable", "true");
    editText.focus();
}
function closeEditTask(event) {
    if (event.target.dataset.action !== "accept") return;
    const parentNode = event.target.closest("li");
    const parentList = parentNode.closest("ul");

    const editText = parentNode.querySelector(".text-task");
    const btnDelete = parentNode.querySelectorAll(".btn-delete");
    const btnEdit = parentNode.querySelectorAll(".btn-edit");
    event.target.classList.remove("block");
    // btnDelete.classList.remove("none");
    // btnEdit.classList.remove("none");
    editText.setAttribute("contenteditable", "false");

    btnDelete.forEach((btn) => {
        if (btn.closest("li") === parentNode) {
            btn.classList.remove("none");
        }
    });
    btnEdit.forEach((btn) => {
        if (btn.closest("li") === parentNode) {
            btn.classList.remove("none");
        }
    });

    const id = Number(parentNode.id);
    let editTask = null;

    if (parentList.classList.contains("group-list-tasks")) {
        const parentNode = parentList.closest("li");
        const idParent = Number(parentNode.id);
        tasks.find((task) => {
            if (task.id === idParent) {
                editTask = task.items.find((task) => task.id === id);
            }
        });
    } else {
        editTask = tasks.find((task) => task.id === id);
    }

    // const task = tasks.find((task) => task.id === id);
    // task.text = editText.textContent;
    editTask.text = editText.textContent;
    saveToLocalStorage();
}

function doneTask(event) {
    if (event.target.getAttribute("type") === "checkbox") {
        const parentNode = event.target.closest("li");
        const parentList = parentNode.closest("ul");

        const id = Number(parentNode.id);
        let taskDone = null;

        if (parentList.classList.contains("group-list-tasks")) {
            const parentNode = parentList.closest("li");
            const idParent = Number(parentNode.id);

            tasks.find((task) => {
                if (task.id === idParent) {
                    taskDone = task.items.find((task) => task.id === id);
                }
            });
        } else {
            taskDone = tasks.find((task) => task.id === id);
        }

        taskDone.done = !taskDone.done;

        saveToLocalStorage();

        const btnEdit = parentNode.querySelector(".btn-edit");
        btnEdit.classList.toggle("none");
    }
}

function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTask(task) {
    const isDone = task.done ? "checked" : "";
    const cssClass = task.done ? "task-btn btn-edit none" : "task-btn btn-edit";

    const taskHTML = `<li id="${task.id}" draggable="true" class="list-group-item draggable">
        <div class="task-item-title">
            <input type="checkbox" ${isDone}/>
            <p class="text-task">${task.text}</p>
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

    return taskHTML;
}

function openGroup(event) {
    if (event.target.dataset.action !== "open") return;
    const parentNode = event.target.closest(".list-group-task");
    const groupOpen = parentNode.querySelector(".group-open");
    const btn = parentNode.querySelector(".btn-accordion img");

    const groupTask = tasks.find((task) => task.open);

    const id = Number(parentNode.id);
    if (groupTask && groupTask.id !== id) {
        const openId = document.getElementById(groupTask.id);
        const openBlock = openId.querySelector(".group-open");
        const openBtn = openId.querySelector(".btn-accordion img");
        openBtn.src = "icons/down.svg";
        openBlock.classList.remove("block");
        groupTask.open = false;
    }
    const group = tasks.find((task) => task.id === id);
    group.open = !group.open;
    group.open ? (btn.src = "icons/up.svg") : (btn.src = "icons/down.svg");
    group.open
        ? btnGroupAdd.classList.add("none")
        : btnGroupAdd.classList.remove("none");
    groupOpen.classList.toggle("block");
    saveToLocalStorage();
}

function renderGroup(group) {
    const groupItem = tasksList.querySelector(".list-group-task");
    const isOpen = group.open ? "group-open block" : "group-open";
    const svg = group.open ? "icons/up.svg" : "icons/down.svg";

    const groupHTML = `<li id="${group.id}" class="list-group-task">
    <div class="list-group-task-inner">
        <div class="group-item-title">
            <p class="text-task">${group.text}</p>
        </div>
        <div class="task-item-accordion">
            <button
                type="button"
                class="btn-accordion"
                data-action="open"
            >
                <img src="${svg}" alt="down" />
            </button>
        </div>
    </div>
    <div class="${isOpen}">
        <ul
            
            class="group-list-tasks drag-container"
        >
        </ul>
        <div class="group-item-buttons">
            <button
                class="group-btn btn-edit"
                data-action="edit"
            >
                <img src="icons/edit.svg" alt="edit" />
            </button>
            <button
                class="group-btn btn-delete"
                data-action="delete"
            >
                <img
                    src="icons/delete.svg"
                    alt="delete"
                />
            </button>
            <button
                class="group-btn btn-accept"
                data-action="accept"
            >
                <img
                    src="icons/accept.svg"
                    alt="accept"
                />
            </button>
        </div>
    </div>
</li>`;
    groupItem
        ? groupItem.insertAdjacentHTML("afterend", groupHTML)
        : tasksList.insertAdjacentHTML("afterbegin", groupHTML);
}
function renderTaskInGroup(task, group) {
    const id = document.getElementById(group.id);
    const groupElement = id.querySelector(".group-list-tasks");

    renderTask(getTask(task), groupElement);
}

function renderTask(task, placeholder) {
    placeholder.insertAdjacentHTML("beforeend", task);
}
function renderInitialGroup(group) {
    renderGroup(group);

    group.items.forEach((task) => {
        renderTaskInGroup(task, group);
    });
}

function dragNDrop() {
    const draggables = document.querySelectorAll(".draggable");
    const containers = document.querySelectorAll(".drag-container");
    const list = document.querySelectorAll("#tasksList > li");

    draggables.forEach((draggable) => {
        draggable.addEventListener("dragstart", () => {
            draggable.classList.add("dragging");
        });
        draggable.addEventListener("dragend", () => {
            draggable.classList.remove("dragging");
            dragEnd();
        });
    });

    tasksList.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (tasksList.querySelectorAll(".list-group-item").length === 0) {
            const dragging = document.querySelector(".dragging");
            tasksList.appendChild(dragging);
        }
    });

    list.forEach((listItem) => {
        listItem.addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const currentTarget = e.currentTarget;

            const dragging = document.querySelector(".dragging");

            if (currentTarget.classList.contains("list-group-task")) {
                const groupList =
                    currentTarget.querySelector(".group-list-tasks");
                groupList.appendChild(dragging);
            } else {
                currentTarget.parentNode.insertBefore(dragging, currentTarget);
            }
        });
    });

    containers.forEach((container) => {
        container.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dragging = document.querySelector(".dragging");
            const dropTarget = getDropPosition(container, e.clientY);
            if (dropTarget) {
                container.insertBefore(dragging, dropTarget);
            } else {
                container.appendChild(dragging);
            }
        });
    });

    function getDropPosition(container, y) {
        const draggableElements = [
            ...container.querySelectorAll(".draggable:not(.dragging)"),
        ];

        for (const draggable of draggableElements) {
            const pos = draggable.getBoundingClientRect();
            if (y < pos.bottom) {
                return draggable;
            }
        }
        return null;
    }
}

function dragEnd() {
    const newTasks = [];
    const items = tasksList.querySelectorAll("#tasksList > li");
    items.forEach((item) => {
        let id = Number(item.id);
        let text = item.querySelector(".text-task").textContent;

        if (item.getAttribute("class") === "list-group-task") {
            let groupItems = item.querySelectorAll(".group-list-tasks li");
            let open = item
                .querySelector(".group-open")
                .classList.contains("block");
            let items = [];
            groupItems.forEach((item) => {
                let id = Number(item.id);
                let text = item.querySelector(".text-task").textContent;
                let done = item.querySelector("input").checked;
                items.push({ id, text, done });
            });
            newTasks.push({ id, open, text, items });
        } else {
            let done = item.querySelector("input").checked;
            newTasks.push({ id, text, done });
        }
    });
    localStorage.setItem("tasks", JSON.stringify(newTasks));
}
