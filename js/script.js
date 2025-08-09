tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
}

let todos = [];
let currentFilter = "all";
let editingId = null;
let deleteId = null;

document.addEventListener("DOMContentLoaded", () => {
  const phrases = ["Let's Plan Your Day ✨", "What's Your Task Today? ✨", "Ready to Be Productive? ✨"];
  let currentIndex = 0;
  
  const titleElement = document.getElementById("title");
  
  function typeText() {
    const currentPhrase = phrases[currentIndex];
    let charIndex = 0;
    
    titleElement.textContent = "";
    
    function type() {
      if (charIndex < currentPhrase.length) {
        titleElement.textContent += currentPhrase.charAt(charIndex);
        charIndex++;
        setTimeout(type, 100);
      } else {
        setTimeout(() => {
          eraseText();
        }, 2000);
      }
    }
    
    function eraseText() {
      const text = titleElement.textContent;
      if (text.length > 0) {
        titleElement.textContent = text.slice(0, -1);
        setTimeout(eraseText, 50);
      } else {
        currentIndex = (currentIndex + 1) % phrases.length;
        setTimeout(typeText, 500);
      }
    }
    
    type();
  }
  
  typeText();
});

document.getElementById("dateInput").valueAsDate = new Date();

const todoInput = document.getElementById("todoInput");
const dateInput = document.getElementById("dateInput");
const errorMsg = document.getElementById("errorMsg");
const todoList = document.getElementById("todoList");
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

// Add task
document.getElementById("addBtn").addEventListener("click", addTodo);
todoInput.addEventListener("keypress", e => { if (e.key === "Enter") addTodo(); });

function addTodo() {
  const text = todoInput.value.trim();
  const date = dateInput.value;

  if (!text) {
    errorMsg.classList.remove("hidden");
    return;
  }
  errorMsg.classList.add("hidden");

  const todo = {
    id: Date.now(),
    text,
    date: date || new Date().toISOString().split("T")[0],
    completed: false
  };

  todos.unshift(todo);
  todoInput.value = "";
  dateInput.valueAsDate = new Date();
  renderTodos();
}

function showDeleteModal(id) {
  deleteId = id;
  deleteModal.classList.remove("hidden");
}

confirmDeleteBtn.addEventListener("click", () => {
  todos = todos.filter(todo => todo.id !== deleteId);
  deleteModal.classList.add("hidden");
  renderTodos();
});

cancelDeleteBtn.addEventListener("click", () => {
  deleteId = null;
  deleteModal.classList.add("hidden");
});

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    renderTodos();
  }
}

function startEdit(id) {
  editingId = id;
  renderTodos();
}

function saveEdit(id) {
  const editInput = document.querySelector(`#edit-${id}`);
  const dateEdit = document.querySelector(`#date-${id}`);

  if (editInput.value.trim()) {
    const todo = todos.find(t => t.id === id);
    todo.text = editInput.value.trim();
    todo.date = dateEdit.value;
  }
  editingId = null;
  renderTodos();
}

function cancelEdit() {
  editingId = null;
  renderTodos();
}

// Filter
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

function getFilteredTodos() {
  switch (currentFilter) {
    case "pending": return todos.filter(todo => !todo.completed);
    case "completed": return todos.filter(todo => todo.completed);
    default: return todos;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function renderTodos() {
  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
      <div class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <p class="text-center text-white/80 text-lg font-medium">
          ${currentFilter === "all" ? "🎯 No tasks yet. Add your first task!" :
            currentFilter === "pending" ? "✅ No pending tasks!" :
            "📝 No completed tasks yet."}
        </p>
      </div>`;
    return;
  }

  todoList.innerHTML = filteredTodos.map(todo => {
    if (editingId === todo.id) {
      return `
        <div class="bg-white/10 backdrop-blur-xl p-4 rounded-xl shadow-lg hover-lift fade-in flex flex-col md:flex-row gap-3 items-center border border-purple-300/20">
          <input type="checkbox" ${todo.completed ? "checked" : ""} onchange="toggleTodo(${todo.id})" />
          <input id="edit-${todo.id}" type="text" value="${todo.text}" maxlength="100"
            class="flex-1 bg-white/20 border-2 border-purple-300/30 rounded-lg p-2 focus:outline-none focus:border-purple-400 text-white" />
          <input id="date-${todo.id}" type="date" value="${todo.date}" 
            class="bg-white/20 border-2 border-purple-300/30 rounded-lg p-2 focus:outline-none focus:border-purple-400 text-white" />
          <div class="flex gap-2">
            <button onclick="saveEdit(${todo.id})" 
              class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition duration-300 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">save</span>
            </button>
            <button onclick="cancelEdit()" 
              class="bg-gradient-to-r from-gray-500 to-slate-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-gray-500/30 hover:scale-105 transition duration-300 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="bg-white/10 backdrop-blur-xl p-4 rounded-xl shadow-lg hover-lift fade-in flex flex-col md:flex-row justify-between items-center gap-3 border border-purple-300/20 ${todo.completed ? 'bg-white/5' : ''}">
        <div class="flex items-center gap-3 w-full md:w-auto">
          <input type="checkbox" ${todo.completed ? "checked" : ""} onchange="toggleTodo(${todo.id})" />
          <div class="w-full md:w-auto">
            <p class="font-medium text-white ${todo.completed ? 'line-through opacity-70' : ''}">${todo.text}</p>
            <p class="text-sm text-purple-200/70">📅 ${formatDate(todo.date)}</p>
          </div>
        </div>
        <div class="flex gap-2 w-full md:w-auto justify-end">
          <button onclick="startEdit(${todo.id})" 
            class="text-white/80 hover:text-white px-3 py-1 rounded-lg hover:bg-white/10 hover:scale-105 transition duration-300 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">edit</span> 
          </button>
          <button onclick="showDeleteModal(${todo.id})" 
            class="text-white/80 hover:text-white px-3 py-1 rounded-lg hover:bg-white/10 hover:scale-105 transition duration-300 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">delete</span> 
          </button>
        </div>
      </div>
    `;
  }).join("");
}

renderTodos();
