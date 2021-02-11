const electron = require("electron");
const { ipcRenderer } = electron;

const todoContentContainer = document.getElementById("todo-list");
const noTodoTextEl = document.createElement("h3");
const noTodoText = document.createTextNode("No items");
const todosList = document.createElement("ul");

// Handle the input from the user
const form = document.querySelector("form");
const closeModalBtn = document.querySelector(
  ".btn-close[data-bs-dismiss=modal]"
);
const todoItemInput = document.getElementById("todoItem");

const submitForm = (e) => {
  e.preventDefault();

  ipcRenderer.send("todo:add", { item: todoItemInput.value, completed: false });

  // Close the modal
  closeModalBtn.click();
  todoItemInput.value = "";
};

form.addEventListener("submit", submitForm);

// Function to render the items in the list
const addTodoItem = (item) => {
  const li = document.createElement("li");
  const itemDiv = document.createElement("div");
  const iconDiv = document.createElement("div");
  const iconEl = document.createElement("i");
  const checkbox = document.createElement("input");
  const todoText = document.createTextNode(item.item);

  checkbox.classList.add("form-check-input", "me-1");
  checkbox.setAttribute("type", "checkbox");
  checkbox.checked = item.completed;
  checkbox.setAttribute("data-id", item._id);

  if (item.completed) {
    li.classList.add("checked");
  } else {
    li.classList.remove("checked");
  }

  checkbox.addEventListener("change", (e) => {
    const currentCheckbox = e.target;
    const checkBoxId = currentCheckbox.getAttribute("data-id");
    const checkBoxItem = currentCheckbox.parentElement.innerText;

    if (currentCheckbox.checked) {
      li.classList.add("checked");
    } else {
      li.classList.remove("checked");
    }

    ipcRenderer.send("todo:checked-item", {
      id: checkBoxId,
      item: checkBoxItem,
      status: currentCheckbox.checked,
    });
  });

  itemDiv.appendChild(checkbox);
  itemDiv.appendChild(todoText);

  iconEl.classList.add("bi-trash");
  iconEl.style.color = "red";

  iconEl.addEventListener("click", (e) => {
    const currentTodoItemRow = e.target.parentElement.parentElement;
    const todoId = currentTodoItemRow.getAttribute("data-id");
    ipcRenderer.send("todo:remove-item", todoId);
    currentTodoItemRow.remove();
  });

  iconDiv.appendChild(iconEl);

  li.classList.add("list-group-item", "d-flex", "justify-content-between");
  li.setAttribute("data-id", item._id);
  li.appendChild(itemDiv);
  li.appendChild(iconDiv);
  todosList.appendChild(li);

  todoContentContainer.innerHTML = "";
  todoContentContainer.appendChild(todosList);
};

// Rendering elements into the list
todosList.classList.add("list-group");

noTodoTextEl.classList.add("text-center");
noTodoTextEl.appendChild(noTodoText);

if (todoContentContainer.innerHTML === "") {
  todoContentContainer.appendChild(noTodoTextEl);
}

window.addEventListener("DOMContentLoaded", (e) => {
  ipcRenderer.send("todo:db:existing");
});

ipcRenderer.on("todo:all-docs", (e, items) => {
  items.forEach((item) => addTodoItem(item));
});

ipcRenderer.on("todo:adding", (e, item) => {
  addTodoItem(item);
});
