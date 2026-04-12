const STORAGE_KEY = "know-agent-todos";

/** @typedef {{ id: string, text: string, done: boolean }} Todo */

/** @returns {Todo[]} */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.filter((t) => t && typeof t.text === "string") : [];
  } catch {
    return [];
  }
}

/** @param {Todo[]} todos */
function save(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const listEl = document.getElementById("list");
const formEl = document.getElementById("form-add");
const inputEl = document.getElementById("input-new");
const countEl = document.getElementById("count");
const btnClear = document.getElementById("btn-clear");
const filterBtns = document.querySelectorAll(".filter");

/** @type {Todo[]} */
let todos = load();
/** @type {'all' | 'active' | 'completed'} */
let filter = "all";

function visibleTodos() {
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "completed") return todos.filter((t) => t.done);
  return todos;
}

function render() {
  listEl.innerHTML = "";
  const items = visibleTodos();
  listEl.removeAttribute("data-filter-empty");
  if (items.length === 0 && todos.length > 0) {
    listEl.setAttribute("data-filter-empty", "true");
    const hint = document.createElement("li");
    hint.className = "list-hint";
    hint.textContent =
      filter === "completed"
        ? "还没有已完成的任务"
        : filter === "active"
          ? "太棒了，没有未完成任务"
          : "";
    if (hint.textContent) listEl.appendChild(hint);
  }
  for (const todo of items) {
    const li = document.createElement("li");
    li.className = `item${todo.done ? " done" : ""}`;
    li.dataset.id = todo.id;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "item-toggle";
    toggle.setAttribute("aria-label", todo.done ? "标记为未完成" : "标记为已完成");

    const text = document.createElement("span");
    text.className = "item-text";
    text.textContent = todo.text;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "item-delete";
    del.textContent = "删除";
    del.setAttribute("aria-label", `删除：${todo.text}`);

    toggle.addEventListener("click", () => {
      todo.done = !todo.done;
      persistAndRender();
    });
    del.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      persistAndRender();
    });

    li.append(toggle, text, del);
    listEl.appendChild(li);
  }

  const active = todos.filter((t) => !t.done).length;
  const total = todos.length;
  countEl.innerHTML =
    total === 0
      ? "暂无任务"
      : `共 <strong>${total}</strong> 项，未完成 <strong>${active}</strong> 项`;

  btnClear.disabled = !todos.some((t) => t.done);
}

function persistAndRender() {
  save(todos);
  render();
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  todos.unshift({ id: uid(), text, done: false });
  inputEl.value = "";
  persistAndRender();
  inputEl.focus();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = /** @type {'all'|'active'|'completed'} */ (btn.dataset.filter);
    filter = f;
    filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

btnClear.addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  persistAndRender();
});

render();
inputEl.focus();
