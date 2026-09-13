/**
 * TaskFlow — To-Do List Web App
 * Author: KHAN SAHEEM
 * GitHub: https://github.com/khansaheem786
 * Pure Vanilla JavaScript Application Logic
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Constants & Configuration
  // ---------------------------------------------------------------------------
  const STORAGE_KEY_TASKS = 'taskflow_tasks';
  const STORAGE_KEY_THEME = 'taskflow_theme';

  const FILTERS = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
  };

  // ---------------------------------------------------------------------------
  // 2. State Management
  // ---------------------------------------------------------------------------
  let tasks = [];
  let currentFilter = FILTERS.ALL;
  let editingTaskId = null;

  // ---------------------------------------------------------------------------
  // 3. DOM Element References
  // ---------------------------------------------------------------------------
  const elements = {
    html: document.documentElement,
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    addTaskForm: document.getElementById('add-task-form'),
    taskInput: document.getElementById('task-input'),
    addTaskBtn: document.getElementById('add-task-btn'),
    inputFeedback: document.getElementById('input-feedback'),
    feedbackText: document.getElementById('feedback-text'),
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    totalCount: document.getElementById('total-tasks-count'),
    activeCount: document.getElementById('active-tasks-count'),
    completedCount: document.getElementById('completed-tasks-count'),
    clearCompletedBtn: document.getElementById('clear-completed-btn'),
    filterTabs: {
      all: document.getElementById('filter-all'),
      active: document.getElementById('filter-active'),
      completed: document.getElementById('filter-completed')
    },
    progressBar: document.getElementById('progress-bar'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    progressText: document.getElementById('progress-text'),
    progressPercent: document.getElementById('progress-percent'),
    progressStatusNote: document.getElementById('progress-status-note'),
    currentYear: document.getElementById('current-year')
  };

  // ---------------------------------------------------------------------------
  // 4. Utility Functions
  // ---------------------------------------------------------------------------

  /**
   * Generates a cryptographically sound or timestamp-random unique ID.
   * @returns {string} Unique task ID
   */
  function generateUniqueId() {
    return 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Trims whitespace and sanitizes text length.
   * @param {string} str - Raw string
   * @returns {string} Clean string
   */
  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.trim();
  }

  // ---------------------------------------------------------------------------
  // 5. LocalStorage Management (Safe & Resilient)
  // ---------------------------------------------------------------------------

  /**
   * Loads tasks safely from browser LocalStorage.
   * Recovers gracefully from corruption or invalid data.
   * @returns {Array} List of validated task objects
   */
  function loadTasks() {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY_TASKS);
      if (!rawData) {
        return [];
      }

      const parsed = JSON.parse(rawData);
      if (!Array.isArray(parsed)) {
        console.warn('TaskFlow: Saved tasks format was not an array. Resetting.');
        return [];
      }

      // Filter and validate individual task schema
      return parsed.filter(item => {
        return (
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.completed === 'boolean'
        );
      });
    } catch (err) {
      console.error('TaskFlow: Error parsing LocalStorage data. Recovering gracefully.', err);
      return [];
    }
  }

  /**
   * Saves current tasks array to LocalStorage safely.
   */
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (err) {
      console.error('TaskFlow: Failed to write tasks to LocalStorage.', err);
    }
  }

  /**
   * Loads theme preference from LocalStorage or system preference.
   * @returns {string} 'dark' | 'light'
   */
  function loadTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch (err) {
      console.warn('TaskFlow: Could not read theme preference from storage.', err);
    }

    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  /**
   * Saves theme preference to LocalStorage.
   * @param {string} theme - 'dark' | 'light'
   */
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (err) {
      console.warn('TaskFlow: Could not save theme preference.', err);
    }
  }

  /**
   * Applies the theme to the root HTML document.
   * @param {string} theme - 'dark' | 'light'
   */
  function applyTheme(theme) {
    elements.html.setAttribute('data-theme', theme);
  }

  /**
   * Toggles between dark and light themes.
   */
  function toggleTheme() {
    const current = elements.html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  }

  // ---------------------------------------------------------------------------
  // 6. Validation & Feedback Helpers
  // ---------------------------------------------------------------------------

  let feedbackTimeout = null;

  /**
   * Shows a user-friendly validation error message.
   * @param {string} message - Validation description
   */
  function showValidation(message) {
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
    }
    elements.feedbackText.textContent = message;
    elements.inputFeedback.classList.remove('hidden');
    elements.taskInput.classList.add('input-error');

    feedbackTimeout = setTimeout(() => {
      clearValidation();
    }, 4000);
  }

  /**
   * Hides the validation error message.
   */
  function clearValidation() {
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
      feedbackTimeout = null;
    }
    elements.inputFeedback.classList.add('hidden');
    elements.taskInput.classList.remove('input-error');
  }

  // ---------------------------------------------------------------------------
  // 7. Task Operations (CRUD)
  // ---------------------------------------------------------------------------

  /**
   * Adds a new task to the list.
   * @param {string} title - Task title text
   * @returns {boolean} Success status
   */
  function addTask(title) {
    const cleanTitle = sanitizeInput(title);

    if (!cleanTitle) {
      showValidation('Please enter a task title before adding.');
      elements.taskInput.focus();
      return false;
    }

    const newTask = {
      id: generateUniqueId(),
      title: cleanTitle,
      completed: false,
      createdAt: Date.now()
    };

    // Consistent ordering: Newest tasks placed at the top
    tasks.unshift(newTask);

    saveTasks();
    clearValidation();
    elements.taskInput.value = '';
    elements.taskInput.focus();

    render();
    return true;
  }

  /**
   * Toggles task completion state.
   * @param {string} id - Task identifier
   */
  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    render();
  }

  /**
   * Initiates editing mode for a task.
   * @param {string} id - Task identifier
   */
  function editTask(id) {
    editingTaskId = id;
    renderTasks();
  }

  /**
   * Saves updated title for a task.
   * @param {string} id - Task identifier
   * @param {string} newTitle - New title text
   */
  function saveEdit(id, newTitle) {
    const cleanTitle = sanitizeInput(newTitle);
    const task = tasks.find(t => t.id === id);

    if (!task) {
      cancelEdit();
      return;
    }

    if (!cleanTitle) {
      // Prevent empty edited tasks
      const editInput = document.getElementById(`edit-input-${id}`);
      if (editInput) {
        editInput.classList.add('input-error');
        editInput.focus();
      }
      return;
    }

    task.title = cleanTitle;
    editingTaskId = null;
    saveTasks();
    render();
  }

  /**
   * Cancels editing mode without saving changes.
   */
  function cancelEdit() {
    editingTaskId = null;
    renderTasks();
  }

  /**
   * Deletes an individual task by ID with exit animation.
   * @param {string} id - Task identifier
   */
  function deleteTask(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const taskElement = document.getElementById(`task-item-${id}`);

    if (taskElement) {
      taskElement.classList.add('deleting');
      taskElement.addEventListener('animationend', () => {
        tasks.splice(taskIndex, 1);
        if (editingTaskId === id) {
          editingTaskId = null;
        }
        saveTasks();
        render();
      }, { once: true });
    } else {
      tasks.splice(taskIndex, 1);
      if (editingTaskId === id) {
        editingTaskId = null;
      }
      saveTasks();
      render();
    }
  }

  /**
   * Clears all completed tasks from storage and UI.
   */
  function clearCompleted() {
    const completedTasksCount = tasks.filter(t => t.completed).length;
    if (completedTasksCount === 0) return;

    tasks = tasks.filter(t => !t.completed);
    if (editingTaskId && !tasks.some(t => t.id === editingTaskId)) {
      editingTaskId = null;
    }

    saveTasks();
    render();
  }

  // ---------------------------------------------------------------------------
  // 8. Filtering & Data Queries
  // ---------------------------------------------------------------------------

  /**
   * Sets the active task filter.
   * @param {string} filter - 'all' | 'active' | 'completed'
   */
  function setFilter(filter) {
    if (!Object.values(FILTERS).includes(filter)) return;
    currentFilter = filter;

    // Update filter tab active states and aria attributes
    Object.keys(elements.filterTabs).forEach(key => {
      const tab = elements.filterTabs[key];
      const isSelected = key === filter;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    render();
  }

  /**
   * Retrieves tasks filtered by the current filter setting.
   * @returns {Array} Filtered tasks
   */
  function getFilteredTasks() {
    switch (currentFilter) {
      case FILTERS.ACTIVE:
        return tasks.filter(t => !t.completed);
      case FILTERS.COMPLETED:
        return tasks.filter(t => t.completed);
      case FILTERS.ALL:
      default:
        return tasks;
    }
  }

  // ---------------------------------------------------------------------------
  // 9. UI Rendering (Safe DOM Construction)
  // ---------------------------------------------------------------------------

  /**
   * Updates task statistics counters.
   */
  function updateCounters() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    elements.totalCount.textContent = total;
    elements.activeCount.textContent = active;
    elements.completedCount.textContent = completed;

    // Enable / disable "Clear Completed" button gracefully
    elements.clearCompletedBtn.disabled = completed === 0;
  }

  /**
   * Updates the progress bar and summary indicator.
   */
  function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    elements.progressText.textContent = `${completed} of ${total} tasks completed`;
    elements.progressPercent.textContent = `${percent}% complete`;
    elements.progressBarFill.style.width = `${percent}%`;
    elements.progressBar.setAttribute('aria-valuenow', percent);

    if (total === 0) {
      elements.progressStatusNote.textContent = 'No tasks yet';
      elements.progressBarFill.classList.remove('all-complete');
    } else if (completed === total) {
      elements.progressStatusNote.textContent = 'All tasks completed!';
      elements.progressBarFill.classList.add('all-complete');
    } else if (completed === 0) {
      elements.progressStatusNote.textContent = 'Ready to start';
      elements.progressBarFill.classList.remove('all-complete');
    } else {
      elements.progressStatusNote.textContent = `${total - completed} remaining`;
      elements.progressBarFill.classList.remove('all-complete');
    }
  }

  /**
   * Renders the empty state layout with safe SVG icons and tailored copy.
   * @param {string} filter - Active filter mode
   */
  function renderEmptyState(filter) {
    elements.emptyState.innerHTML = ''; // Only clearing container for dynamic UI state

    const iconWrap = document.createElement('div');
    iconWrap.className = 'empty-icon-wrap';
    iconWrap.setAttribute('aria-hidden', 'true');

    const titleEl = document.createElement('h2');
    titleEl.className = 'empty-title';

    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'empty-subtitle';

    let iconSvg = '';
    let titleText = '';
    let subtitleText = '';

    if (tasks.length === 0) {
      iconSvg = `
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
      `;
      titleText = "You're all caught up!";
      subtitleText = 'Add a task to get started.';
    } else if (filter === FILTERS.ACTIVE) {
      iconSvg = `
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;
      titleText = 'No active tasks.';
      subtitleText = 'Great job! Everything has been completed.';
    } else if (filter === FILTERS.COMPLETED) {
      iconSvg = `
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 14 14"></polyline>
        </svg>
      `;
      titleText = 'No completed tasks yet.';
      subtitleText = 'Check off tasks as you finish them.';
    }

    iconWrap.innerHTML = iconSvg;
    titleEl.textContent = titleText;
    subtitleEl.textContent = subtitleText;

    elements.emptyState.appendChild(iconWrap);
    elements.emptyState.appendChild(titleEl);
    elements.emptyState.appendChild(subtitleEl);
    elements.emptyState.classList.remove('hidden');
  }

  /**
   * Creates a single task DOM element using strict safe DOM manipulation APIs.
   * Avoids innerHTML for user task title text to guarantee XSS safety.
   * @param {Object} task - Task item object
   * @returns {HTMLElement} `<li>` task element
   */
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.id = `task-item-${task.id}`;
    li.setAttribute('data-id', task.id);

    // If currently editing this task
    if (editingTaskId === task.id) {
      li.classList.add('editing');

      const editForm = document.createElement('form');
      editForm.className = 'edit-form';
      editForm.onsubmit = e => e.preventDefault();

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'edit-input';
      input.id = `edit-input-${task.id}`;
      input.value = task.title;
      input.setAttribute('aria-label', 'Edit task title');
      input.maxLength = 200;

      const actionsWrap = document.createElement('div');
      actionsWrap.className = 'edit-actions';

      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'save-edit-btn';
      saveBtn.textContent = 'Save';
      saveBtn.setAttribute('data-action', 'save-edit');
      saveBtn.setAttribute('aria-label', 'Save task changes');

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'cancel-edit-btn';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.setAttribute('data-action', 'cancel-edit');
      cancelBtn.setAttribute('aria-label', 'Cancel editing task');

      actionsWrap.appendChild(saveBtn);
      actionsWrap.appendChild(cancelBtn);

      editForm.appendChild(input);
      editForm.appendChild(actionsWrap);
      li.appendChild(editForm);

      // Keyboard behavior for editing
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveEdit(task.id, input.value);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelEdit();
        }
      });

      // Auto-focus and select text
      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });

      return li;
    }

    // Normal Task Item View
    // 1. Checkbox Wrapper
    const checkboxWrap = document.createElement('label');
    checkboxWrap.className = 'task-checkbox-wrap';
    checkboxWrap.setAttribute('aria-label', `Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('data-action', 'toggle');
    checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);

    const customCheck = document.createElement('span');
    customCheck.className = 'checkbox-custom';
    customCheck.setAttribute('aria-hidden', 'true');
    customCheck.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    checkboxWrap.appendChild(checkbox);
    checkboxWrap.appendChild(customCheck);

    // 2. Task Title Content Wrap
    const contentWrap = document.createElement('div');
    contentWrap.className = 'task-content-wrap';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    // SAFE DOM: Strictly set textContent to prevent XSS injection
    titleSpan.textContent = task.title;

    contentWrap.appendChild(titleSpan);

    // 3. Action Buttons (Edit & Delete)
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'task-actions';

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-btn edit-btn';
    editBtn.setAttribute('data-action', 'edit');
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.title = 'Edit task';
    editBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    `;

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.setAttribute('data-action', 'delete');
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.title = 'Delete task';
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;

    actionsWrap.appendChild(editBtn);
    actionsWrap.appendChild(deleteBtn);

    // Assemble Task Item
    li.appendChild(checkboxWrap);
    li.appendChild(contentWrap);
    li.appendChild(actionsWrap);

    return li;
  }

  /**
   * Renders the task list based on current filter.
   */
  function renderTasks() {
    const filtered = getFilteredTasks();

    elements.taskList.innerHTML = '';

    if (filtered.length === 0) {
      elements.taskList.classList.add('hidden');
      renderEmptyState(currentFilter);
    } else {
      elements.emptyState.classList.add('hidden');
      elements.taskList.classList.remove('hidden');

      const fragment = document.createDocumentFragment();
      filtered.forEach(task => {
        fragment.appendChild(createTaskElement(task));
      });
      elements.taskList.appendChild(fragment);
    }
  }

  /**
   * Main render method: synchronizes tasks, counters, and progress.
   */
  function render() {
    renderTasks();
    updateCounters();
    updateProgress();
  }

  // ---------------------------------------------------------------------------
  // 10. Event Listeners & Event Delegation
  // ---------------------------------------------------------------------------

  /**
   * Sets up all event listeners cleanly.
   */
  function setupEventListeners() {
    // 1. Theme Toggle
    elements.themeToggleBtn.addEventListener('click', () => {
      toggleTheme();
    });

    // 2. Add Task Form Submit
    elements.addTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(elements.taskInput.value);
    });

    // Clear validation error on user typing
    elements.taskInput.addEventListener('input', () => {
      if (!elements.inputFeedback.classList.contains('hidden')) {
        clearValidation();
      }
    });

    // 3. Filter Tabs Click
    Object.keys(elements.filterTabs).forEach(filterKey => {
      const tab = elements.filterTabs[filterKey];
      tab.addEventListener('click', () => {
        setFilter(filterKey);
      });
    });

    // 4. Clear Completed
    elements.clearCompletedBtn.addEventListener('click', () => {
      clearCompleted();
    });

    // 5. Event Delegation on Task List (Handles Toggle, Edit, Delete, Save, Cancel)
    elements.taskList.addEventListener('click', (e) => {
      const target = e.target;
      const taskItem = target.closest('.task-item');
      if (!taskItem) return;

      const taskId = taskItem.getAttribute('data-id');
      if (!taskId) return;

      // Identify action
      const actionEl = target.closest('[data-action]');
      if (!actionEl) return;

      const action = actionEl.getAttribute('data-action');

      if (action === 'toggle') {
        toggleTask(taskId);
      } else if (action === 'delete') {
        deleteTask(taskId);
      } else if (action === 'edit') {
        editTask(taskId);
      } else if (action === 'save-edit') {
        const editInput = document.getElementById(`edit-input-${taskId}`);
        if (editInput) {
          saveEdit(taskId, editInput.value);
        }
      } else if (action === 'cancel-edit') {
        cancelEdit();
      }
    });

    // Handle Checkbox Change via delegation
    elements.taskList.addEventListener('change', (e) => {
      if (e.target.matches('.task-checkbox')) {
        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
          const taskId = taskItem.getAttribute('data-id');
          if (taskId) {
            toggleTask(taskId);
          }
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 11. Application Initialization
  // ---------------------------------------------------------------------------
  function init() {
    // 1. Initialize Theme
    const activeTheme = loadTheme();
    applyTheme(activeTheme);

    // 2. Load Tasks
    tasks = loadTasks();

    // 3. Set Current Year in Footer
    if (elements.currentYear) {
      elements.currentYear.textContent = new Date().getFullYear();
    }

    // 4. Bind Events
    setupEventListeners();

    // 5. Initial Render
    render();
  }

  // Run initialization once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
