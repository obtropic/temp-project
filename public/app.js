const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const dateInput = document.getElementById("todo-date");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  return due < today;
}

function render() {
  const todos = loadTodos();
  list.innerHTML = "";
  emptyState.style.display = todos.length === 0 ? "block" : "none";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleComplete(todo.id));

    const content = document.createElement("div");
    content.className = "todo-content";

    const text = document.createElement("div");
    text.className = "todo-text";
    text.textContent = todo.text;
    content.appendChild(text);

    if (todo.dueDate) {
      const badge = document.createElement("div");
      badge.className = "todo-date-badge" + (isOverdue(todo.dueDate) && !todo.completed ? " overdue" : "");
      badge.textContent = formatDate(todo.dueDate);
      content.appendChild(badge);
    }

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon";
    editBtn.innerHTML = "&#9998;";
    editBtn.title = "Edit";
    editBtn.addEventListener("click", () => startEdit(todo.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-icon delete";
    deleteBtn.innerHTML = "&#10005;";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

function addTodo(text, dueDate) {
  const todos = loadTodos();
  todos.push({
    id: Date.now().toString(),
    text: text.trim(),
    dueDate: dueDate || null,
    completed: false,
  });
  saveTodos(todos);
  render();
}

function deleteTodo(id) {
  const todos = loadTodos().filter((t) => t.id !== id);
  saveTodos(todos);
  render();
}

function toggleComplete(id) {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos(todos);
  render();
}

function startEdit(id) {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const li = list.querySelector(`[data-id="${id}"]`);
  li.classList.add("editing");

  const content = li.querySelector(".todo-content");
  const actions = li.querySelector(".todo-actions");
  content.style.display = "none";
  actions.style.display = "none";

  const editRow = document.createElement("div");
  editRow.className = "edit-row";

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = todo.text;

  const editDate = document.createElement("input");
  editDate.type = "date";
  editDate.value = todo.dueDate || "";

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-save";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn btn-cancel";
  cancelBtn.textContent = "Cancel";

  function save() {
    const newText = editInput.value.trim();
    if (!newText) return;
    const updated = loadTodos().map((t) =>
      t.id === id ? { ...t, text: newText, dueDate: editDate.value || null } : t
    );
    saveTodos(updated);
    render();
  }

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") render();
  });

  saveBtn.addEventListener("click", save);
  cancelBtn.addEventListener("click", () => render());

  editRow.appendChild(editInput);
  editRow.appendChild(editDate);
  editRow.appendChild(saveBtn);
  editRow.appendChild(cancelBtn);
  li.appendChild(editRow);

  editInput.focus();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;
  addTodo(input.value, dateInput.value);
  input.value = "";
  dateInput.value = "";
  input.focus();
});

render();
