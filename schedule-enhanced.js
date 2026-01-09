// Enhanced Schedule Manager with Real Web Functionality
class EnhancedScheduleManager {
    constructor() {
        this.currentDate = new Date();
        this.events = this.loadEvents();
        this.currentView = 'month';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCalendar();
        this.renderUpcomingEvents();
        this.updateStats();
        this.setupRealTimeUpdates();
    }

    setupEventListeners() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
            this.updateStats();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
            this.updateStats();
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.renderCalendar();
            });
        });

        document.getElementById('add-event-btn').addEventListener('click', () => {
            this.showAddEventModal();
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportCalendar();
        });
    }

    renderCalendar() {
        const monthYear = document.getElementById('month-year');
        const calendarGrid = document.querySelector('.calendar-grid');

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        calendarGrid.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (date.getMonth() !== this.currentDate.getMonth()) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isToday(date)) {
                dayElement.classList.add('today');
            }

            const dayEvents = this.getEventsForDate(date);
            if (dayEvents.length > 0) {
                dayElement.classList.add('has-events');
            }

            dayElement.innerHTML = `
                <div class="day-number">${date.getDate()}</div>
                <div class="day-events">
                    ${dayEvents.slice(0, 3).map(event => `
                        <div class="event-dot ${event.type}" title="${event.title} - ${event.time}"></div>
                    `).join('')}
                    ${dayEvents.length > 3 ? `<div class="more-events">+${dayEvents.length - 3}</div>` : ''}
                </div>
            `;

            dayElement.addEventListener('click', () => {
                this.showDayEvents(date, dayEvents);
            });

            calendarGrid.appendChild(dayElement);
        }
    }

    renderUpcomingEvents() {
        const eventsList = document.querySelector('.events-list');
        const upcomingEvents = this.getUpcomingEvents();

        eventsList.innerHTML = upcomingEvents.map(event => `
            <div class="event-item" data-event-id="${event.id}">
                <div class="event-time">${this.formatEventDate(event.date)} - ${event.time}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-location"><i class="fa-solid fa-location-dot"></i> ${event.location}</div>
                <div class="event-type ${event.type}">${this.capitalizeFirst(event.type)}</div>
                <div class="event-actions">
                    <button onclick="enhancedScheduleManager.editEvent('${event.id}')" class="btn-edit" title="Edit">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button onclick="enhancedScheduleManager.deleteEvent('${event.id}')" class="btn-delete" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    }

    getUpcomingEvents() {
        const now = new Date();
        return this.events
            .filter(event => new Date(event.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 8);
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    formatEventDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showAddEventModal() {
        const modal = this.createEventModal();
        document.body.appendChild(modal);
    }

    createEventModal(event = null) {
        const isEdit = event !== null;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content event-modal">
                <div class="modal-header">
                    <h3><i class="fa-solid fa-calendar-plus"></i> ${isEdit ? 'Edit Event' : 'Add New Event'}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form class="event-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="event-title">Event Title</label>
                            <input type="text" id="event-title" value="${event ? event.title : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="event-type">Event Type</label>
                            <select id="event-type" required>
                                <option value="meeting" ${event && event.type === 'meeting' ? 'selected' : ''}>Meeting</option>
                                <option value="inspection" ${event && event.type === 'inspection' ? 'selected' : ''}>Inspection</option>
                                <option value="delivery" ${event && event.type === 'delivery' ? 'selected' : ''}>Delivery</option>
                                <option value="audit" ${event && event.type === 'audit' ? 'selected' : ''}>Audit</option>
                                <option value="review" ${event && event.type === 'review' ? 'selected' : ''}>Review</option>
                                <option value="deadline" ${event && event.type === 'deadline' ? 'selected' : ''}>Deadline</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="event-date">Date</label>
                            <input type="date" id="event-date" value="${event ? event.date : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="event-time">Time</label>
                            <input type="time" id="event-time" value="${event ? event.time : ''}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="event-location">Location</label>
                        <input type="text" id="event-location" value="${event ? event.location : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="event-description">Description</label>
                        <textarea id="event-description" rows="3">${event ? event.description || '' : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="event-priority">Priority</label>
                        <select id="event-priority">
                            <option value="low" ${event && event.priority === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${event && event.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${event && event.priority === 'high' ? 'selected' : ''}>High</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancel</button>
                        <button type="submit" class="btn-save">${isEdit ? 'Update' : 'Add'} Event</button>
                    </div>
                </form>
            </div>
        `;

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        modal.querySelector('.event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const eventData = {
                id: event ? event.id : Date.now().toString(),
                title: document.getElementById('event-title').value,
                date: document.getElementById('event-date').value,
                time: document.getElementById('event-time').value,
                location: document.getElementById('event-location').value,
                type: document.getElementById('event-type').value,
                description: document.getElementById('event-description').value,
                priority: document.getElementById('event-priority').value
            };

            if (isEdit) {
                this.updateEvent(eventData);
            } else {
                this.addEvent(eventData);
            }
            modal.remove();
        });

        return modal;
    }

    addEvent(eventData) {
        this.events.push(eventData);
        this.saveEvents();
        this.renderCalendar();
        this.renderUpcomingEvents();
        this.updateStats();
        this.showNotification('Event added successfully!', 'success');
    }

    updateEvent(eventData) {
        const index = this.events.findIndex(e => e.id === eventData.id);
        if (index !== -1) {
            this.events[index] = eventData;
            this.saveEvents();
            this.renderCalendar();
            this.renderUpcomingEvents();
            this.updateStats();
            this.showNotification('Event updated successfully!', 'success');
        }
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            const modal = this.createEventModal(event);
            document.body.appendChild(modal);
        }
    }

    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== eventId);
            this.saveEvents();
            this.renderCalendar();
            this.renderUpcomingEvents();
            this.updateStats();
            this.showNotification('Event deleted successfully!', 'success');
        }
    }

    showDayEvents(date, events) {
        if (events.length === 0) {
            this.showNotification(`No events scheduled for ${this.formatEventDate(date.toISOString())}`, 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content day-events-modal">
                <div class="modal-header">
                    <h3><i class="fa-solid fa-calendar-day"></i> Events for ${this.formatEventDate(date.toISOString())}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="day-events-list">
                    ${events.map(event => `
                        <div class="event-item detailed">
                            <div class="event-header">
                                <div class="event-time"><i class="fa-solid fa-clock"></i> ${event.time}</div>
                                <div class="event-type ${event.type}">${this.capitalizeFirst(event.type)}</div>
                            </div>
                            <div class="event-title">${event.title}</div>
                            <div class="event-location"><i class="fa-solid fa-location-dot"></i> ${event.location}</div>
                            ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                            <div class="event-actions">
                                <button onclick="enhancedScheduleManager.editEvent('${event.id}')" class="btn-edit">
                                    <i class="fa-solid fa-edit"></i> Edit
                                </button>
                                <button onclick="enhancedScheduleManager.deleteEvent('${event.id}')" class="btn-delete">
                                    <i class="fa-solid fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        document.body.appendChild(modal);
    }

    updateStats() {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        const monthEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        });

        const stats = {
            siteVisits: monthEvents.filter(e => e.type === 'inspection' || e.type === 'audit').length,
            milestones: monthEvents.filter(e => e.type === 'review' || e.type === 'deadline').length,
            deliveries: monthEvents.filter(e => e.type === 'delivery').length
        };

        document.querySelector('.stats-grid .stat:nth-child(1) .stat-number').textContent = stats.siteVisits;
        document.querySelector('.stats-grid .stat:nth-child(2) .stat-number').textContent = stats.milestones;
        document.querySelector('.stats-grid .stat:nth-child(3) .stat-number').textContent = stats.deliveries;
    }

    exportCalendar() {
        const events = this.events.map(event => ({
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            type: event.type,
            description: event.description || '',
            priority: event.priority || 'medium'
        }));

        const dataStr = JSON.stringify(events, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `construction-schedule-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Schedule exported successfully!', 'success');
    }

    setupRealTimeUpdates() {
        // Update every minute to refresh current time indicators
        setInterval(() => {
            this.renderCalendar();
        }, 60000);
    }

    loadEvents() {
        const stored = localStorage.getItem('scheduleEvents');
        if (stored) {
            return JSON.parse(stored);
        }

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        return [
            {
                id: '1',
                title: 'Foundation Inspection - Skyline Residency',
                date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-08`,
                time: '09:00',
                location: 'Bopal, Ahmedabad',
                type: 'inspection',
                description: 'Structural foundation quality check and approval',
                priority: 'high'
            },
            {
                id: '2',
                title: 'Client Review - TechHub Office Complex',
                date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-12`,
                time: '14:30',
                location: 'Gandhinagar Site Office',
                type: 'meeting',
                description: 'Monthly progress review with client stakeholders',
                priority: 'medium'
            },
            {
                id: '3',
                title: 'Material Delivery - Industrial Park Phase-II',
                date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-18`,
                time: '11:00',
                location: 'Sanand Industrial Area',
                type: 'delivery',
                description: 'Steel reinforcement and concrete delivery',
                priority: 'high'
            },
            {
                id: '4',
                title: 'Safety Audit - Green Valley Apartments',
                date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-22`,
                time: '16:00',
                location: 'Bopal Construction Site',
                type: 'audit',
                description: 'Monthly safety compliance audit',
                priority: 'high'
            },
            {
                id: '5',
                title: 'Progress Review - Metro Mall Extension',
                date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-28`,
                time: '10:00',
                location: 'SG Highway Office',
                type: 'review',
                description: 'Quarterly progress assessment meeting',
                priority: 'medium'
            }
        ];
    }

    saveEvents() {
        localStorage.setItem('scheduleEvents', JSON.stringify(this.events));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize enhanced schedule manager
let enhancedScheduleManager;
document.addEventListener('DOMContentLoaded', () => {
    enhancedScheduleManager = new EnhancedScheduleManager();
});