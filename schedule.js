/**
 * Schedule Module - Full Functionality
 * StoneBeam-NH Construction Management
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // State management
    let currentDate = new Date();
    let tasks = JSON.parse(localStorage.getItem('schedule_tasks') || '[]');
    let projects = JSON.parse(localStorage.getItem('schedule_projects') || '[]');
    let currentView = 'calendar';
    let currentFilter = { project: 'all', status: 'all' };
    
    // DOM elements
    const addTaskBtn = document.getElementById('add-task-btn');
    const addProjectBtn = document.getElementById('add-project-btn');
    const taskModal = document.getElementById('task-modal');
    const projectModal = document.getElementById('project-modal');
    const taskForm = document.getElementById('task-form');
    const projectForm = document.getElementById('project-form');
    const viewBtns = document.querySelectorAll('.view-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectFilter = document.getElementById('project-filter');
    
    // Initialize
    init();
    
    function init() {
        setupEventListeners();
        loadProjects();
        updateStats();
        renderCurrentView();
        updateUpcomingTasks();
        setDefaultDates();
    }
    
    function setupEventListeners() {
        // Modal controls
        addTaskBtn.addEventListener('click', () => openTaskModal());
        addProjectBtn.addEventListener('click', () => openProjectModal());
        document.getElementById('close-modal').addEventListener('click', closeTaskModal);
        document.getElementById('close-project-modal').addEventListener('click', closeProjectModal);
        document.getElementById('cancel-task').addEventListener('click', closeTaskModal);
        document.getElementById('cancel-project').addEventListener('click', closeProjectModal);
        
        // Form submissions
        taskForm.addEventListener('submit', handleTaskSubmit);
        projectForm.addEventListener('submit', handleProjectSubmit);
        
        // View toggles
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => switchView(btn.dataset.view));
        });
        
        // Filters
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => setStatusFilter(btn.dataset.status));
        });
        
        projectFilter.addEventListener('change', (e) => {
            currentFilter.project = e.target.value;
            renderCurrentView();
        });
        
        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => navigateMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => navigateMonth(1));
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === taskModal) closeTaskModal();
            if (e.target === projectModal) closeProjectModal();
        });
    }
    
    function setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        
        document.getElementById('task-start-date').value = today;
        document.getElementById('task-end-date').value = tomorrow;
        document.getElementById('project-start').value = today;
    }
    
    // Modal functions
    function openTaskModal(task = null) {
        document.getElementById('modal-title').textContent = task ? 'Edit Task' : 'Add New Task';
        
        if (task) {
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-project').value = task.project || '';
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-start-date').value = task.startDate;
            document.getElementById('task-end-date').value = task.endDate;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-assignee').value = task.assignee || '';
            taskForm.dataset.editId = task.id;
        } else {
            taskForm.reset();
            setDefaultDates();
            delete taskForm.dataset.editId;
        }
        
        taskModal.style.display = 'flex';
    }
    
    function closeTaskModal() {
        taskModal.style.display = 'none';
        taskForm.reset();
        delete taskForm.dataset.editId;
    }
    
    function openProjectModal() {
        projectModal.style.display = 'flex';
    }
    
    function closeProjectModal() {
        projectModal.style.display = 'none';
        projectForm.reset();
    }
    
    // Form handlers
    function handleTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(taskForm);
        const task = {
            id: taskForm.dataset.editId || Date.now().toString(),
            title: document.getElementById('task-title').value,
            project: document.getElementById('task-project').value,
            priority: document.getElementById('task-priority').value,
            startDate: document.getElementById('task-start-date').value,
            endDate: document.getElementById('task-end-date').value,
            description: document.getElementById('task-description').value,
            assignee: document.getElementById('task-assignee').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        if (taskForm.dataset.editId) {
            const index = tasks.findIndex(t => t.id === taskForm.dataset.editId);
            if (index !== -1) {
                tasks[index] = { ...tasks[index], ...task };
            }
        } else {
            tasks.push(task);
        }
        
        saveTasks();
        updateStats();
        renderCurrentView();
        updateUpcomingTasks();
        closeTaskModal();
        showNotification('Task saved successfully!', 'success');
    }
    
    function handleProjectSubmit(e) {
        e.preventDefault();
        
        const project = {
            id: Date.now().toString(),
            name: document.getElementById('project-name').value,
            description: document.getElementById('project-description').value,
            startDate: document.getElementById('project-start').value,
            endDate: document.getElementById('project-end').value,
            createdAt: new Date().toISOString()
        };
        
        projects.push(project);
        saveProjects();
        loadProjects();
        closeProjectModal();
        showNotification('Project created successfully!', 'success');
    }
    
    // View switching
    function switchView(view) {
        currentView = view;
        
        viewBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        document.querySelectorAll('.view-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${view}-view`).classList.add('active');
        
        renderCurrentView();
    }
    
    function setStatusFilter(status) {
        currentFilter.status = status;
        
        filterBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-status="${status}"]`).classList.add('active');
        
        renderCurrentView();
    }
    
    // Rendering functions
    function renderCurrentView() {
        switch(currentView) {
            case 'calendar':
                renderCalendar();
                break;
            case 'list':
                renderTaskList();
                break;
            case 'gantt':
                renderTimeline();
                break;
        }
    }
    
    function renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthHeader = document.getElementById('current-month');
        
        // Update month header
        monthHeader.textContent = currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        // Clear existing calendar days
        const existingDays = calendarGrid.querySelectorAll('.calendar-day');
        existingDays.forEach(day => day.remove());
        
        // Get first day of month and number of days
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            
            const dayElement = createCalendarDay(day);
            calendarGrid.appendChild(dayElement);
        }
    }
    
    function createCalendarDay(date) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = date.toDateString() === new Date().toDateString();
        
        if (!isCurrentMonth) dayElement.classList.add('other-month');
        if (isToday) dayElement.classList.add('today');
        
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = getFilteredTasks().filter(task => 
            task.startDate <= dateStr && task.endDate >= dateStr
        );
        
        dayElement.innerHTML = `
            <div class="day-number">${date.getDate()}</div>
            <div class="day-tasks">
                ${dayTasks.slice(0, 3).map(task => `
                    <div class="task-dot ${task.priority}" title="${task.title}"></div>
                `).join('')}
                ${dayTasks.length > 3 ? `<div class="more-tasks">+${dayTasks.length - 3}</div>` : ''}
            </div>
        `;
        
        dayElement.addEventListener('click', () => {
            const tasksForDay = dayTasks;
            if (tasksForDay.length > 0) {
                showDayTasks(date, tasksForDay);
            } else {
                openTaskModal();
                document.getElementById('task-start-date').value = dateStr;
                document.getElementById('task-end-date').value = dateStr;
            }
        });
        
        return dayElement;
    }
    
    function renderTaskList() {
        const taskList = document.getElementById('task-list');
        const filteredTasks = getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="no-tasks-message">
                    <i class="fa-regular fa-calendar-xmark"></i>
                    <h3>No tasks found</h3>
                    <p>Try adjusting your filters or add a new task</p>
                </div>
            `;
            return;
        }
        
        // Sort tasks by date
        filteredTasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        taskList.innerHTML = filteredTasks.map(task => createTaskCard(task)).join('');
    }
    
    function createTaskCard(task) {
        const project = projects.find(p => p.id === task.project);
        const isOverdue = new Date(task.endDate) < new Date() && task.status !== 'completed';
        
        return `
            <div class="task-card ${task.status} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-info">
                        <h3>${task.title}</h3>
                        <div class="task-meta">
                            <span class="priority ${task.priority}"><i class="fa-solid fa-flag"></i> ${task.priority}</span>
                            ${project ? `<span class="project"><i class="fa-solid fa-folder"></i> ${project.name}</span>` : ''}
                            ${task.assignee ? `<span class="assignee"><i class="fa-solid fa-user"></i> ${task.assignee}</span>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn edit-task" onclick="editTask('${task.id}')">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="action-btn delete-task" onclick="deleteTask('${task.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-dates">
                    <span><i class="fa-regular fa-calendar"></i> ${formatDate(task.startDate)} - ${formatDate(task.endDate)}</span>
                    ${isOverdue ? '<span class="overdue-badge"><i class="fa-solid fa-exclamation-triangle"></i> Overdue</span>' : ''}
                </div>
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                <div class="task-status">
                    <select onchange="updateTaskStatus('${task.id}', this.value)" class="status-select">
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
        `;
    }
    
    function renderTimeline() {
        const timelineContent = document.getElementById('timeline-content');
        const timelineDates = document.getElementById('timeline-dates');
        const filteredTasks = getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            timelineContent.innerHTML = `
                <div class="no-tasks-message">
                    <i class="fa-solid fa-chart-gantt"></i>
                    <h3>No projects to display</h3>
                    <p>Add tasks with dates to see the timeline</p>
                </div>
            `;
            return;
        }
        
        // Generate timeline
        const sortedTasks = filteredTasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const startDate = new Date(sortedTasks[0].startDate);
        const endDate = new Date(Math.max(...sortedTasks.map(t => new Date(t.endDate))));
        
        // Generate date headers
        const dates = [];
        const current = new Date(startDate);
        while (current <= endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        timelineDates.innerHTML = dates.map(date => 
            `<div class="timeline-date">${date.getDate()}</div>`
        ).join('');
        
        // Generate timeline bars
        timelineContent.innerHTML = sortedTasks.map(task => {
            const taskStart = new Date(task.startDate);
            const taskEnd = new Date(task.endDate);
            const startOffset = Math.max(0, (taskStart - startDate) / (1000 * 60 * 60 * 24));
            const duration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24) + 1;
            const totalDays = dates.length;
            
            return `
                <div class="timeline-row">
                    <div class="timeline-task-info">
                        <h4>${task.title}</h4>
                        <span class="timeline-dates">${formatDate(task.startDate)} - ${formatDate(task.endDate)}</span>
                    </div>
                    <div class="timeline-bar-container">
                        <div class="timeline-bar ${task.status} ${task.priority}" 
                             style="left: ${(startOffset / totalDays) * 100}%; width: ${(duration / totalDays) * 100}%">
                            <span class="timeline-bar-text">${task.title}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Utility functions
    function getFilteredTasks() {
        return tasks.filter(task => {
            const projectMatch = currentFilter.project === 'all' || task.project === currentFilter.project;
            const statusMatch = currentFilter.status === 'all' || task.status === currentFilter.status;
            return projectMatch && statusMatch;
        });
    }
    
    function updateStats() {
        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const overdueTasks = tasks.filter(t => 
            new Date(t.endDate) < new Date() && t.status !== 'completed'
        ).length;
        
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('pending-tasks').textContent = pendingTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('overdue-tasks').textContent = overdueTasks;
    }
    
    function updateUpcomingTasks() {
        const upcomingContainer = document.getElementById('upcoming-tasks');
        const upcoming = tasks
            .filter(task => {
                const taskDate = new Date(task.endDate);
                const today = new Date();
                const daysDiff = (taskDate - today) / (1000 * 60 * 60 * 24);
                return daysDiff >= 0 && daysDiff <= 7 && task.status !== 'completed';
            })
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
            .slice(0, 5);
        
        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = '<p class="no-tasks">No upcoming deadlines</p>';
            return;
        }
        
        upcomingContainer.innerHTML = upcoming.map(task => `
            <div class="upcoming-task">
                <div class="upcoming-task-info">
                    <h5>${task.title}</h5>
                    <span class="upcoming-date">${formatDate(task.endDate)}</span>
                </div>
                <div class="priority-indicator ${task.priority}"></div>
            </div>
        `).join('');
    }
    
    function loadProjects() {
        const taskProjectSelect = document.getElementById('task-project');
        const projectFilterSelect = document.getElementById('project-filter');
        
        // Update task project dropdown
        taskProjectSelect.innerHTML = '<option value="">Select Project</option>' +
            projects.map(project => `<option value="${project.id}">${project.name}</option>`).join('');
        
        // Update project filter
        projectFilterSelect.innerHTML = '<option value="all">All Projects</option>' +
            projects.map(project => `<option value="${project.id}">${project.name}</option>`).join('');
    }
    
    function navigateMonth(direction) {
        currentDate.setMonth(currentDate.getMonth() + direction);
        renderCalendar();
    }
    
    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    function saveTasks() {
        localStorage.setItem('schedule_tasks', JSON.stringify(tasks));
    }
    
    function saveProjects() {
        localStorage.setItem('schedule_projects', JSON.stringify(projects));
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Global functions for inline event handlers
    window.editTask = function(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) openTaskModal(task);
    };
    
    window.deleteTask = function(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            updateStats();
            renderCurrentView();
            updateUpcomingTasks();
            showNotification('Task deleted successfully!', 'success');
        }
    };
    
    window.updateTaskStatus = function(taskId, status) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.status = status;
            saveTasks();
            updateStats();
            renderCurrentView();
            updateUpcomingTasks();
            showNotification('Task status updated!', 'success');
        }
    };
    
    function showDayTasks(date, dayTasks) {
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const taskList = dayTasks.map(task => `
            <div class="day-task-item">
                <span class="task-title">${task.title}</span>
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </div>
        `).join('');
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Tasks for ${dateStr}</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="day-tasks-list">
                    ${taskList}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
});