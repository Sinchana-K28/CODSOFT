// API base
const API_URL = "http://127.0.0.1:5000/tasks";

const taskListUL = document.getElementById("taskList");
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const filterButtons = document.querySelectorAll(".filter");
const metaCount = document.getElementById("metaCount");

let allTasks = [];
let activeFilter = 'all';

// fetch + render
async function fetchTasks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to load");
    allTasks = await res.json();
    renderTasks(activeFilter);
  } catch (err) {
    taskListUL.innerHTML = `<li class="task"><div class="title small">Unable to load tasks</div></li>`;
    console.error(err);
  }
}

function renderTasks(filter='all') {
  taskListUL.innerHTML = '';
  const tasks = allTasks.filter(t => {
    if (filter === 'completed') return t.done;
    if (filter === 'pending') return !t.done;
    return true;
  });

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="title">${escapeHtml(task.title)}</div>
      <div class="actions">
        <button class="icon-btn icon-check" title="Toggle done"><i class="fa-solid fa-check"></i></button>
        <button class="icon-btn icon-del" title="Delete"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `;

    // event bindings
    const checkBtn = li.querySelector('.icon-check');
    const delBtn = li.querySelector('.icon-del');

    checkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTask(task.id, li);
    });

    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id, li);
    });

    // click on whole item toggles done (friendly UX)
    li.addEventListener('click', () => toggleTask(task.id, li));

    taskListUL.appendChild(li);
  });

  metaCount.textContent = `${allTasks.length} task${allTasks.length !== 1 ? 's' : ''}`;
}

// escape to avoid HTML injection
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// add
async function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error('Add failed');
    taskInput.value = '';
    await fetchTasks();
  } catch (err) {
    alert('Unable to add task');
    console.error(err);
  }
}

// toggle (with small local animation)
async function toggleTask(id, liEl) {
  // optimistic UI: flip immediately for snappy feel
  if (liEl) liEl.classList.toggle('done');
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "PUT" });
    if (!res.ok) throw new Error('Toggle failed');
    await fetchTasks();
  } catch (err) {
    console.error(err);
    await fetchTasks(); // refresh to correct state
    alert('Could not update task');
  }
}

// delete with fade-out
async function deleteTask(id, liEl) {
  if (!confirm('Delete this task?')) return;
  if (liEl) {
    liEl.classList.add('dead');
    // wait for animation then delete
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error('Delete failed');
        await fetchTasks();
      } catch (err) {
        alert('Could not delete task');
        console.error(err);
        fetchTasks();
      }
    }, 260);
  } else {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchTasks();
    } catch {
      alert('Could not delete task');
    }
  }
}

// clear all
async function clearAllTasks() {
  if (!confirm('Clear all tasks?')) return;
  try {
    const res = await fetch(API_URL, { method: "DELETE" });
    if (!res.ok) throw new Error('Clear failed');
    await fetchTasks();
  } catch {
    alert('Unable to clear tasks');
  }
}

// filters - add active state
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderTasks(activeFilter);
  });
});

// bindings
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
clearAllBtn.addEventListener('click', clearAllTasks);

// initial load
window.addEventListener('DOMContentLoaded', fetchTasks);
