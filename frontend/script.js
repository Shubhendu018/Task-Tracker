let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingTaskId = null;

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const tasksList = document.getElementById('tasksList');
const searchInput = document.getElementById('searchInput');
const tabs = document.querySelectorAll('.tab');

// Initialize
renderTasks();
updateStats();

// Add/Edit Task
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;

    if (!taskText) return;

    if (editingTaskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
        tasks[taskIndex].text = taskText;
        tasks[taskIndex].priority = priority;
        editingTaskId = null;
        document.querySelector('.btn-primary').textContent = 'Add Task';
    } else {
        // Add new task
        const task = {
            id: Date.now(),
            text: taskText,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.unshift(task);
    }

    saveTasks();
    renderTasks();
    updateStats();
    taskForm.reset();
    prioritySelect.value = 'medium';
});

// Filter Tabs
tabs.forEach(tab => {
    tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderTasks();
    });
});

// Search
searchInput.addEventListener('input', function() {
    renderTasks();
});

function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    let filteredTasks = tasks;

    // Apply search filter
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm)
        );
    }

    // Apply category filter
    switch(currentFilter) {
        case 'pending':
            filteredTasks = filteredTasks.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTasks = filteredTasks.filter(t => t.completed);
            break;
        case 'high':
            filteredTasks = filteredTasks.filter(t => t.priority === 'high');
            break;
    }

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found!</h3>
                <p>${searchTerm ? 'Try a different search term' : 'Add your first task to get started 🚀'}</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${task.text}</span>
            <span class="task-priority priority-${task.priority}">
                ${task.priority.toUpperCase()}
            </span>
            <div class="task-actions">
                <button class="btn-icon btn-edit" onclick="editTask(${task.id})" title="Edit">
                    ✏️
                </button>
                <button class="btn-icon btn-delete" onclick="deleteTask(${task.id})" title="Delete">
                    🗑️
                </button>
            </div>
        </li>
    `).join('');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    taskInput.value = task.text;
    prioritySelect.value = task.priority;
    editingTaskId = id;
    document.querySelector('.btn-primary').textContent = 'Update Task';
    taskInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});