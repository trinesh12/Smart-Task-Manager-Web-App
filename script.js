// Smart Task Manager JavaScript
// This code is written to be beginner-friendly with explanatory comments

// --- 1. DOM Elements Selection ---
// Selecting all the necessary elements from the HTML page
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const prioritySelect = document.getElementById('priority-select');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const totalTasksElem = document.getElementById('total-tasks');
const completedTasksElem = document.getElementById('completed-tasks');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

// Date and time elements
const currentDateElem = document.getElementById('current-date');
const currentTimeElem = document.getElementById('current-time');

// --- 2. State Management ---
// Array to hold our tasks. We try to load existing tasks from localStorage first.
// If none exist, we start with an empty array [].
let tasks = JSON.parse(localStorage.getItem('smartTasks')) || [];
let currentFilter = 'All'; // Keeps track of current active filter

// --- 3. Date and Time Functions ---
// Function to update the date and time at the top of the app
function updateDateTime() {
    const now = new Date();
    
    // Format date: e.g., "Monday, October 23"
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    currentDateElem.textContent = now.toLocaleDateString('en-US', options);
    
    // Format time: e.g., "10:30 AM"
    currentTimeElem.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Update time immediately, then every minute (60000 ms)
updateDateTime();
setInterval(updateDateTime, 60000);

// --- 4. Task Management Functions ---

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('smartTasks', JSON.stringify(tasks));
    updateStats();
}

// Function to update the counts (total and completed)
function updateStats() {
    totalTasksElem.textContent = tasks.length;
    
    // Count how many tasks have completed === true
    const completedCount = tasks.filter(task => task.completed).length;
    completedTasksElem.textContent = completedCount;
    
    // Show or hide the "No tasks available" message
    if (tasks.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
    }
}

// Function to add a new task
function addTask() {
    const text = taskInput.value.trim(); // Remove extra spaces
    
    // Don't add if the input is empty
    if (text === '') {
        alert('Please enter a task!');
        return;
    }
    
    // Create a new task object
    const newTask = {
        id: Date.now(), // Generate a unique ID using current timestamp
        text: text,
        category: categorySelect.value,
        priority: prioritySelect.value,
        completed: false
    };
    
    // Add to our tasks array
    tasks.push(newTask);
    
    // Save to local storage
    saveTasks();
    
    // Clear the input field
    taskInput.value = '';
    
    // Re-render the list
    renderTasks();
}

// Function to toggle task completion status
// This needs to be accessible globally so our inline onclick handlers work
window.toggleTask = function(id) {
    // Find the task and flip its completed status
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
};

// Function to delete a task
window.deleteTask = function(id) {
    // Filter out the task with the given ID
    tasks = tasks.filter(task => task.id !== id);
    
    saveTasks();
    renderTasks();
};

// Function to edit a task
window.editTask = function(id) {
    // Find the task we want to edit
    const taskToEdit = tasks.find(task => task.id === id);
    if (!taskToEdit) return;
    
    // Prompt the user for new text
    const newText = prompt('Edit your task:', taskToEdit.text);
    
    // If they clicked OK and didn't leave it blank, update the task
    if (newText !== null && newText.trim() !== '') {
        taskToEdit.text = newText.trim();
        saveTasks();
        renderTasks();
    }
};

// Function to clear all completed tasks
function clearCompleted() {
    // Keep only tasks that are NOT completed
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Function to set the active filter
function setFilter(filterType) {
    currentFilter = filterType;
    
    // Update active class on buttons
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filterType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTasks();
}

// --- 5. UI Rendering ---

// Main function to render tasks to the screen based on current filter
function renderTasks() {
    // Clear current list
    taskList.innerHTML = '';
    
    // Determine which tasks to show based on filter
    let tasksToShow = tasks;
    if (currentFilter === 'Pending') {
        tasksToShow = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'Completed') {
        tasksToShow = tasks.filter(task => task.completed);
    }
    
    // If no tasks match the filter but we have tasks in total, show empty message
    if (tasksToShow.length === 0 && tasks.length > 0) {
        emptyMessage.classList.remove('hidden');
        emptyMessage.innerHTML = `<p>No ${currentFilter.toLowerCase()} tasks found.</p>`;
    } else if (tasks.length > 0) {
        emptyMessage.classList.add('hidden');
        // Reset empty message content back to original if it was changed
        emptyMessage.innerHTML = `<p>No tasks available. Add a task to get started!</p>`;
    }
    
    // Create HTML for each task and append it
    tasksToShow.forEach(task => {
        // Create an li element
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        // Determine CSS class for priority badge
        let priorityClass = '';
        if (task.priority === 'High') priorityClass = 'priority-high';
        else if (task.priority === 'Medium') priorityClass = 'priority-medium';
        else priorityClass = 'priority-low';
        
        // Set the inner HTML
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <div class="task-details">
                    <span class="task-text">${task.text}</span>
                    <div class="task-badges">
                        <span class="badge category-badge">${task.category}</span>
                        <span class="badge ${priorityClass}">${task.priority}</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="editTask(${task.id})" title="Edit">✏️</button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
            </div>
        `;
        
        // Add to DOM
        taskList.appendChild(li);
    });
    
    updateStats();
}

// --- 6. Event Listeners ---
// Connecting UI actions to our functions

// Click event for the Add button
addBtn.addEventListener('click', addTask);

// Allow adding task by pressing Enter key
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Click event for Clear Completed button
clearCompletedBtn.addEventListener('click', clearCompleted);

// Click events for filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// --- 7. Initialization ---
// Render tasks when the app first loads
renderTasks();
