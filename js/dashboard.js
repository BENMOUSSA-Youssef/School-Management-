/**
 * ============================================
 * dashboard.js - Professional Dashboard Logic
 * ============================================
 * 
 * This file handles all dashboard features:
 * - Statistics cards with trends
 * - Performance charts
 * - Grade distribution
 * - Top students list
 * - Success metrics (donut charts)
 * - Calendar widget
 * - Recent activity feed
 */

/**
 * Calculate average grade for a student
 * @param {number} studentId - Student ID
 * @returns {number|null} Average grade or null if no grades
 */
function calculateStudentAverage(studentId) {
    const modules = getModules();
    const studentGrades = getStudentGrades(studentId);
    
    if (modules.length === 0 || Object.keys(studentGrades).length === 0) {
        return null;
    }
    
    let totalPoints = 0;
    let totalCoefficient = 0;
    
    modules.forEach(module => {
        const grade = studentGrades[module.id];
        if (grade !== undefined && grade !== null) {
            totalPoints += grade * module.coefficient;
            totalCoefficient += module.coefficient;
        }
    });
    
    if (totalCoefficient === 0) {
        return null;
    }
    
    return totalPoints / totalCoefficient;
}

/**
 * Get mention based on average
 * @param {number} average - Average grade
 * @returns {string} Mention text
 */
function getMention(average) {
    if (average >= 16) return 'Très Bien';
    if (average >= 14) return 'Bien';
    if (average >= 12) return 'Assez Bien';
    if (average >= 10) return 'Passable';
    return 'Ajourné';
}

/**
 * Calculate success rate
 * @returns {number} Success rate percentage
 */
function calculateSuccessRate() {
    const students = getStudents();
    if (students.length === 0) return 0;
    
    let passedCount = 0;
    students.forEach(student => {
        const average = calculateStudentAverage(student.id);
        if (average !== null && average >= 10) {
            passedCount++;
        }
    });
    
    return Math.round((passedCount / students.length) * 100);
}

/**
 * Calculate average grade across all students
 * @returns {number} Overall average
 */
function calculateOverallAverage() {
    const students = getStudents();
    if (students.length === 0) return 0;
    
    let totalAverage = 0;
    let count = 0;
    
    students.forEach(student => {
        const average = calculateStudentAverage(student.id);
        if (average !== null) {
            totalAverage += average;
            count++;
        }
    });
    
    return count > 0 ? totalAverage / count : 0;
}

/**
 * Get grade distribution
 * @returns {Object} Distribution object
 */
function getGradeDistribution() {
    const students = getStudents();
    const distribution = {
        excellent: 0, // >= 16
        veryGood: 0,  // 14-15.99
        good: 0,      // 12-13.99
        pass: 0,      // 10-11.99
        fail: 0       // < 10
    };
    
    students.forEach(student => {
        const average = calculateStudentAverage(student.id);
        if (average !== null) {
            if (average >= 16) distribution.excellent++;
            else if (average >= 14) distribution.veryGood++;
            else if (average >= 12) distribution.good++;
            else if (average >= 10) distribution.pass++;
            else distribution.fail++;
        }
    });
    
    return distribution;
}

/**
 * Get top students
 * @param {number} limit - Number of students to return
 * @returns {Array} Array of top students
 */
function getTopStudents(limit = 5) {
    const students = getStudents();
    const studentsWithAverages = [];
    
    students.forEach(student => {
        const average = calculateStudentAverage(student.id);
        if (average !== null) {
            studentsWithAverages.push({
                ...student,
                average: average
            });
        }
    });
    
    return studentsWithAverages
        .sort((a, b) => b.average - a.average)
        .slice(0, limit);
}

/**
 * Display statistics cards
 */
function displayStatistics() {
    const students = getStudents();
    const modules = getModules();
    const successRate = calculateSuccessRate();
    const overallAverage = calculateOverallAverage();
    
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';
    
    const stats = [
        {
            value: students.length,
            label: 'Total Students',
            icon: '👥',
            trend: '+12%',
            trendUp: true,
            color: 'var(--primary)'
        },
        {
            value: modules.length,
            label: 'Total Modules',
            icon: '📚',
            trend: '+3',
            trendUp: true,
            color: 'var(--info)'
        },
        {
            value: successRate + '%',
            label: 'Success Rate',
            icon: '✅',
            trend: '+5%',
            trendUp: true,
            color: 'var(--success)'
        },
        {
            value: overallAverage.toFixed(1) + '/20',
            label: 'Overall Average',
            icon: '📊',
            trend: '+0.8',
            trendUp: true,
            color: 'var(--warning)'
        }
    ];
    
    stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="stat-card-header">
                <div class="stat-icon" style="background: ${stat.color}20; color: ${stat.color};">${stat.icon}</div>
                <span class="stat-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}">${stat.trend}</span>
            </div>
            <h3>${stat.value}</h3>
            <p>${stat.label}</p>
        `;
        statsGrid.appendChild(statCard);
    });
}

/**
 * Display performance chart
 */
function updatePerformanceChart() {
    const students = getStudents();
    const container = document.getElementById('performanceChart');
    
    if (students.length === 0) {
        container.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }
    
    // Get top 5 students for the chart
    const topStudents = getTopStudents(5);
    const maxAverage = Math.max(...topStudents.map(s => s.average), 20);
    
    let chartHTML = '<div class="bar-chart">';
    
    topStudents.forEach((student, index) => {
        const percentage = (student.average / maxAverage) * 100;
        const color = student.average >= 16 ? 'var(--success)' : 
                     student.average >= 14 ? 'var(--info)' : 
                     student.average >= 12 ? 'var(--warning)' : 
                     student.average >= 10 ? 'var(--primary)' : 'var(--danger)';
        
        chartHTML += `
            <div class="bar-chart-item">
                <div class="bar-chart-label">
                    <span>${student.name.split(' ')[0]}</span>
                    <span class="bar-value">${student.average.toFixed(1)}</span>
                </div>
                <div class="bar-chart-bar">
                    <div class="bar-fill" style="width: ${percentage}%; background: ${color};"></div>
                </div>
            </div>
        `;
    });
    
    chartHTML += '</div>';
    container.innerHTML = chartHTML;
}

/**
 * Display grade distribution
 */
function displayGradeDistribution() {
    const distribution = getGradeDistribution();
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    
    const container = document.getElementById('gradeDistribution');
    
    if (total === 0) {
        container.innerHTML = '<p class="empty-state">No grades available</p>';
        return;
    }
    
    const items = [
        { label: 'Excellent (≥16)', value: distribution.excellent, color: 'var(--success)' },
        { label: 'Very Good (14-16)', value: distribution.veryGood, color: 'var(--info)' },
        { label: 'Good (12-14)', value: distribution.good, color: 'var(--warning)' },
        { label: 'Pass (10-12)', value: distribution.pass, color: 'var(--primary)' },
        { label: 'Fail (<10)', value: distribution.fail, color: 'var(--danger)' }
    ];
    
    let html = '<div class="distribution-list">';
    
    items.forEach(item => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        html += `
            <div class="distribution-item">
                <div class="distribution-header">
                    <span class="distribution-label">${item.label}</span>
                    <span class="distribution-value">${item.value} (${percentage.toFixed(1)}%)</span>
                </div>
                <div class="distribution-bar">
                    <div class="distribution-fill" style="width: ${percentage}%; background: ${item.color};"></div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Display top students
 */
function displayTopStudents() {
    const topStudents = getTopStudents(5);
    const container = document.getElementById('topStudents');
    
    if (topStudents.length === 0) {
        container.innerHTML = '<p class="empty-state">No students with grades yet</p>';
        return;
    }
    
    let html = '<div class="top-students">';
    
    topStudents.forEach((student, index) => {
        const mention = getMention(student.average);
        const badgeClass = student.average >= 16 ? 'badge-success' : 
                          student.average >= 14 ? 'badge-info' : 
                          student.average >= 12 ? 'badge-warning' : 
                          student.average >= 10 ? 'badge-primary' : 'badge-danger';
        
        html += `
            <div class="top-student-item">
                <div class="top-student-rank">#${index + 1}</div>
                <div class="top-student-info">
                    <div class="top-student-name">${student.name}</div>
                    <div class="top-student-details">${student.group} • CIN: ${student.cin}</div>
                </div>
                <div class="top-student-score">
                    <div class="top-student-average">${student.average.toFixed(2)}</div>
                    <span class="badge ${badgeClass}">${mention}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Display success metrics (donut charts)
 */
function displaySuccessMetrics() {
    const students = getStudents();
    const successRate = calculateSuccessRate();
    const failRate = 100 - successRate;
    const overallAverage = calculateOverallAverage();
    const averagePercentage = (overallAverage / 20) * 100;
    
    const container = document.getElementById('successMetrics');
    
    let html = `
        <div class="metrics-grid">
            <div class="metric-item">
                <div class="donut-chart" data-percentage="${successRate}">
                    <svg class="donut" width="120" height="120">
                        <circle class="donut-ring" cx="60" cy="60" r="50" fill="transparent" stroke="var(--bg-tertiary)" stroke-width="12"></circle>
                        <circle class="donut-segment" cx="60" cy="60" r="50" fill="transparent" 
                                stroke="var(--success)" stroke-width="12" 
                                stroke-dasharray="${successRate * 3.14} ${(100 - successRate) * 3.14}"
                                stroke-dashoffset="78.5" transform="rotate(-90 60 60)"></circle>
                    </svg>
                    <div class="donut-text">
                        <div class="donut-value">${successRate}%</div>
                        <div class="donut-label">Success Rate</div>
                    </div>
                </div>
            </div>
            <div class="metric-item">
                <div class="donut-chart" data-percentage="${averagePercentage}">
                    <svg class="donut" width="120" height="120">
                        <circle class="donut-ring" cx="60" cy="60" r="50" fill="transparent" stroke="var(--bg-tertiary)" stroke-width="12"></circle>
                        <circle class="donut-segment" cx="60" cy="60" r="50" fill="transparent" 
                                stroke="var(--primary)" stroke-width="12" 
                                stroke-dasharray="${averagePercentage * 3.14} ${(100 - averagePercentage) * 3.14}"
                                stroke-dashoffset="78.5" transform="rotate(-90 60 60)"></circle>
                    </svg>
                    <div class="donut-text">
                        <div class="donut-value">${overallAverage.toFixed(1)}</div>
                        <div class="donut-label">Avg Score</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Display calendar widget
 */
function displayCalendar() {
    const container = document.getElementById('calendarWidget');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let html = `
        <div class="calendar">
            <div class="calendar-header">
                <h3>${monthNames[month]} ${year}</h3>
            </div>
            <div class="calendar-weekdays">
                ${dayNames.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
            </div>
            <div class="calendar-days">
    `;
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today;
        html += `<div class="calendar-day ${isToday ? 'today' : ''}">${day}</div>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Display recent activity
 */
function displayRecentActivity() {
    const container = document.getElementById('recentActivity');
    const students = getStudents();
    const modules = getModules();
    const grades = getGrades();
    
    const activities = [];
    
    // Simulate recent activities (in real app, this would come from a log)
    if (students.length > 0) {
        activities.push({
            icon: '👥',
            text: `${students.length} student${students.length > 1 ? 's' : ''} registered`,
            time: 'Today',
            color: 'var(--primary)'
        });
    }
    
    if (modules.length > 0) {
        activities.push({
            icon: '📚',
            text: `${modules.length} module${modules.length > 1 ? 's' : ''} available`,
            time: 'Today',
            color: 'var(--info)'
        });
    }
    
    if (grades.length > 0) {
        activities.push({
            icon: '📝',
            text: `${grades.length} grade${grades.length > 1 ? 's' : ''} assigned`,
            time: 'This week',
            color: 'var(--success)'
        });
    }
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="empty-state">No recent activity</p>';
        return;
    }
    
    let html = '<div class="activity-items">';
    activities.forEach(activity => {
        html += `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color}20; color: ${activity.color};">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

/**
 * Initialize all dashboard components
 */
function initializeDashboard() {
    displayStatistics();
    updatePerformanceChart();
    displayGradeDistribution();
    displayTopStudents();
    displaySuccessMetrics();
    displayCalendar();
    displayRecentActivity();
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});
