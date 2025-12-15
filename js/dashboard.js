/**
 * ============================================
 * dashboard.js - Professional Dashboard Logic
 * ============================================
 * 
 * Complete dashboard with teacher and student views
 * Includes: metrics, charts, attendance, ranking, insights
 */

// Global calendar variables
window.currentMonth = new Date().getMonth();
window.currentYear = new Date().getFullYear();

/**
 * Calculate average grade for a student
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
 */
function getMention(average) {
    if (average >= 16) return 'Très Bien';
    if (average >= 14) return 'Bien';
    if (average >= 12) return 'Assez Bien';
    if (average >= 10) return 'Passable';
    return 'Ajourné';
}

/**
 * Get all students with averages
 */
function getAllStudentsWithAverages() {
    const students = getStudents();
    return students.map(student => {
        const average = calculateStudentAverage(student.id);
        return {
            ...student,
            average: average
        };
    }).filter(s => s.average !== null);
}

/**
 * ============================================
 * TEACHER DASHBOARD FUNCTIONS
 * ============================================

/**
 * Display teacher statistics
 */
function displayTeacherStatistics() {
    const students = getStudents();
    const modules = getModules();
    const grades = getGrades();
    const successRate = calculateSuccessRate();
    const classAverage = calculateOverallAverage();
    const bestStudent = findBestStudent();
    const worstStudent = findWorstStudent();
    
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
            value: grades.length,
            label: 'Total Grades',
            icon: '📝',
            trend: '+45',
            trendUp: true,
            color: 'var(--warning)'
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
            value: classAverage.toFixed(1) + '/20',
            label: 'Class Average',
            icon: '📊',
            trend: '+0.8',
            trendUp: true,
            color: 'var(--primary-light)'
        },
        {
            value: bestStudent ? bestStudent.average.toFixed(1) : 'N/A',
            label: 'Best Student',
            icon: '🏆',
            trend: bestStudent ? bestStudent.name.split(' ')[0] : 'N/A',
            trendUp: true,
            color: 'var(--success)'
        },
        {
            value: worstStudent ? worstStudent.average.toFixed(1) : 'N/A',
            label: 'Worst Student',
            icon: '📉',
            trend: worstStudent ? worstStudent.name.split(' ')[0] : 'N/A',
            trendUp: false,
            color: 'var(--danger)'
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
 * Find worst student
 */
function findWorstStudent() {
    const studentsWithAverages = getAllStudentsWithAverages();
    if (studentsWithAverages.length === 0) return null;
    
    return studentsWithAverages.reduce((worst, current) => {
        return current.average < worst.average ? current : worst;
    });
}

/**
 * Find best student
 */
function findBestStudent() {
    const studentsWithAverages = getAllStudentsWithAverages();
    if (studentsWithAverages.length === 0) return null;
    
    return studentsWithAverages.reduce((best, current) => {
        return current.average > best.average ? current : best;
    });
}

/**
 * Calculate success rate
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
 * Calculate overall average
 */
function calculateOverallAverage() {
    const studentsWithAverages = getAllStudentsWithAverages();
    if (studentsWithAverages.length === 0) return 0;
    
    const total = studentsWithAverages.reduce((sum, s) => sum + s.average, 0);
    return total / studentsWithAverages.length;
}

/**
 * Display performance bar chart
 */
function updatePerformanceChart() {
    const studentsWithAverages = getAllStudentsWithAverages();
    const container = document.getElementById('performanceChart');
    
    if (studentsWithAverages.length === 0) {
        container.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }
    
    // Sort and get top 10
    const topStudents = studentsWithAverages
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);
    
    const maxAverage = Math.max(...topStudents.map(s => s.average), 20);
    
    let chartHTML = '<div class="bar-chart">';
    
    topStudents.forEach(student => {
        const percentage = (student.average / maxAverage) * 100;
        const color = student.average >= 16 ? 'var(--success)' : 
                     student.average >= 14 ? 'var(--info)' : 
                     student.average >= 12 ? 'var(--warning)' : 
                     student.average >= 10 ? 'var(--primary)' : 'var(--danger)';
        
        chartHTML += `
            <div class="bar-chart-item">
                <div class="bar-chart-label">
                    <span>${student.name}</span>
                    <span class="bar-value">${student.average.toFixed(1)}/20</span>
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
 * Display grade distribution bar chart (0-20)
 */
function displayGradeBarChart() {
    const studentsWithAverages = getAllStudentsWithAverages();
    const container = document.getElementById('gradeBarChart');
    
    if (studentsWithAverages.length === 0) {
        container.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }
    
    // Create ranges: 0-4, 5-9, 10-12, 13-15, 16-18, 19-20
    const ranges = [
        { label: '0-4', min: 0, max: 4, count: 0, color: 'var(--danger)' },
        { label: '5-9', min: 5, max: 9, count: 0, color: 'var(--warning)' },
        { label: '10-12', min: 10, max: 12, count: 0, color: 'var(--primary)' },
        { label: '13-15', min: 13, max: 15, count: 0, color: 'var(--info)' },
        { label: '16-18', min: 16, max: 18, count: 0, color: 'var(--success)' },
        { label: '19-20', min: 19, max: 20, count: 0, color: 'var(--success)' }
    ];
    
    studentsWithAverages.forEach(student => {
        ranges.forEach(range => {
            if (student.average >= range.min && student.average <= range.max) {
                range.count++;
            }
        });
    });
    
    const maxCount = Math.max(...ranges.map(r => r.count));
    
    let chartHTML = '<div class="bar-chart">';
    ranges.forEach(range => {
        const percentage = maxCount > 0 ? (range.count / maxCount) * 100 : 0;
        chartHTML += `
            <div class="bar-chart-item">
                <div class="bar-chart-label">
                    <span>${range.label}</span>
                    <span class="bar-value">${range.count} students</span>
                </div>
                <div class="bar-chart-bar">
                    <div class="bar-fill" style="width: ${percentage}%; background: ${range.color};"></div>
                </div>
            </div>
        `;
    });
    chartHTML += '</div>';
    container.innerHTML = chartHTML;
}

/**
 * Display pass/fail pie chart
 */
function displayPassFailChart() {
    const students = getStudents();
    const container = document.getElementById('passFailChart');
    
    if (students.length === 0) {
        container.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }
    
    let passed = 0;
    let failed = 0;
    
    students.forEach(student => {
        const average = calculateStudentAverage(student.id);
        if (average !== null) {
            if (average >= 10) passed++;
            else failed++;
        }
    });
    
    const total = passed + failed;
    if (total === 0) {
        container.innerHTML = '<p class="empty-state">No grades available</p>';
        return;
    }
    
    const passedPercent = (passed / total) * 100;
    const failedPercent = (failed / total) * 100;
    
    const passedDash = passedPercent * 3.14;
    const failedDash = failedPercent * 3.14;
    
    container.innerHTML = `
        <div class="pie-chart-container">
            <div class="pie-chart">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="transparent" stroke="var(--bg-tertiary)" stroke-width="30"></circle>
                    <circle cx="100" cy="100" r="80" fill="transparent" 
                            stroke="var(--success)" stroke-width="30" 
                            stroke-dasharray="${passedDash} ${failedDash}"
                            stroke-dashoffset="0" transform="rotate(-90 100 100)"></circle>
                    <circle cx="100" cy="100" r="80" fill="transparent" 
                            stroke="var(--danger)" stroke-width="30" 
                            stroke-dasharray="${failedDash} ${passedDash}"
                            stroke-dashoffset="${-passedDash}" transform="rotate(-90 100 100)"></circle>
                </svg>
                <div class="pie-chart-text">
                    <div class="pie-value">${total}</div>
                    <div class="pie-label">Total</div>
                </div>
            </div>
            <div class="pie-legend">
                <div class="pie-legend-item">
                    <div class="pie-legend-color" style="background: var(--success);"></div>
                    <span>Passed: ${passed} (${passedPercent.toFixed(1)}%)</span>
                </div>
                <div class="pie-legend-item">
                    <div class="pie-legend-color" style="background: var(--danger);"></div>
                    <span>Failed: ${failed} (${failedPercent.toFixed(1)}%)</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display top and worst students
 */
function displayTopWorstStudents() {
    const bestStudent = findBestStudent();
    const worstStudent = findWorstStudent();
    const container = document.getElementById('topWorstStudents');
    
    let html = '<div class="top-students">';
    
    if (bestStudent) {
        const mention = getMention(bestStudent.average);
        html += `
            <div class="top-student-item best">
                <div class="top-student-rank" style="background: var(--success);">🏆</div>
                <div class="top-student-info">
                    <div class="top-student-name">${bestStudent.name} <span class="badge badge-success">Best</span></div>
                    <div class="top-student-details">${bestStudent.group} • CIN: ${bestStudent.cin}</div>
                </div>
                <div class="top-student-score">
                    <div class="top-student-average">${bestStudent.average.toFixed(2)}</div>
                    <span class="badge badge-success">${mention}</span>
                </div>
            </div>
        `;
    }
    
    if (worstStudent) {
        const mention = getMention(worstStudent.average);
        html += `
            <div class="top-student-item worst">
                <div class="top-student-rank" style="background: var(--danger);">📉</div>
                <div class="top-student-info">
                    <div class="top-student-name">${worstStudent.name} <span class="badge badge-danger">Needs Help</span></div>
                    <div class="top-student-details">${worstStudent.group} • CIN: ${worstStudent.cin}</div>
                </div>
                <div class="top-student-score">
                    <div class="top-student-average">${worstStudent.average.toFixed(2)}</div>
                    <span class="badge badge-danger">${mention}</span>
                </div>
            </div>
        `;
    }
    
    if (!bestStudent && !worstStudent) {
        html += '<p class="empty-state">No students with grades yet</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Display success metrics (donut charts)
 */
function displaySuccessMetrics() {
    const successRate = calculateSuccessRate();
    const classAverage = calculateOverallAverage();
    const averagePercentage = (classAverage / 20) * 100;
    
    const container = document.getElementById('successMetrics');
    
    container.innerHTML = `
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
                        <div class="donut-value">${classAverage.toFixed(1)}</div>
                        <div class="donut-label">Class Avg</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display attendance metrics (simulated)
 */
function displayAttendanceMetrics() {
    const students = getStudents();
    const container = document.getElementById('attendanceMetrics');
    
    // Simulate attendance data (in real app, this would come from attendance records)
    const totalDays = 30;
    const averageAttendance = 85; // Simulated
    const attendancePercentage = averageAttendance;
    
    container.innerHTML = `
        <div class="metrics-grid">
            <div class="metric-item">
                <div class="donut-chart">
                    <svg class="donut" width="120" height="120">
                        <circle class="donut-ring" cx="60" cy="60" r="50" fill="transparent" stroke="var(--bg-tertiary)" stroke-width="12"></circle>
                        <circle class="donut-segment" cx="60" cy="60" r="50" fill="transparent" 
                                stroke="var(--info)" stroke-width="12" 
                                stroke-dasharray="${attendancePercentage * 3.14} ${(100 - attendancePercentage) * 3.14}"
                                stroke-dashoffset="78.5" transform="rotate(-90 60 60)"></circle>
                    </svg>
                    <div class="donut-text">
                        <div class="donut-value">${attendancePercentage}%</div>
                        <div class="donut-label">Attendance</div>
                    </div>
                </div>
            </div>
            <div class="metric-item">
                <div style="text-align: center; padding: var(--spacing-md);">
                    <div style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${students.length}</div>
                    <div style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Total Students</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display performance trends line chart
 */
function displayTrendsChart() {
    const container = document.getElementById('trendsChart');
    
    // Simulate trend data (in real app, this would track historical data)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const averages = [12.5, 13.2, 13.8, 14.1, 14.5, 14.8]; // Simulated trend
    
    const maxValue = 20;
    const chartHeight = 200;
    const chartWidth = 100;
    const points = [];
    
    months.forEach((month, index) => {
        const x = (index / (months.length - 1)) * chartWidth;
        const y = chartHeight - (averages[index] / maxValue) * chartHeight;
        points.push(`${x},${y}`);
    });
    
    const pathData = `M ${points.join(' L ')}`;
    
    container.innerHTML = `
        <div class="line-chart-container">
            <svg viewBox="0 0 100 200" class="line-chart">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--primary);stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:var(--primary);stop-opacity:0" />
                    </linearGradient>
                </defs>
                <path d="${pathData}" fill="none" stroke="var(--primary)" stroke-width="2" />
                <path d="${pathData} L ${chartWidth},${chartHeight} L 0,${chartHeight}" fill="url(#gradient)" />
                ${months.map((month, index) => {
                    const x = (index / (months.length - 1)) * chartWidth;
                    return `<circle cx="${x}" cy="${chartHeight - (averages[index] / maxValue) * chartHeight}" r="2" fill="var(--primary)" />`;
                }).join('')}
                <g class="chart-labels">
                    ${months.map((month, index) => {
                        const x = (index / (months.length - 1)) * chartWidth;
                        return `<text x="${x}" y="${chartHeight + 10}" text-anchor="middle" font-size="8" fill="var(--text-secondary)">${month}</text>`;
                    }).join('')}
                </g>
            </svg>
            <div class="chart-info">
                <div style="font-size: 12px; color: var(--text-secondary); text-align: center; margin-top: var(--spacing-md);">
                    Average class performance over 6 months
                </div>
            </div>
        </div>
    `;
}

/**
 * Display calendar
 */
function displayCalendar() {
    const container = document.getElementById('calendarWidget');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    const firstDay = new Date(window.currentYear, window.currentMonth, 1).getDay();
    const daysInMonth = new Date(window.currentYear, window.currentMonth + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === window.currentMonth && today.getFullYear() === window.currentYear;
    const todayDate = isCurrentMonth ? today.getDate() : null;
    
    // Update month display
    const monthEl = document.getElementById('calendarMonth');
    if (monthEl) {
        monthEl.textContent = `${monthNames[window.currentMonth]} ${window.currentYear}`;
    }
    
    let html = `
        <div class="calendar">
            <div class="calendar-weekdays">
                ${dayNames.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
            </div>
            <div class="calendar-days">
    `;
    
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Simulate some dates with events (yellow dots)
    const eventDates = [4, 5, 10, 11, 16, 17];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === todayDate;
        const hasEvent = eventDates.includes(day);
        html += `<div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" onclick="selectCalendarDay(${day})" title="Click to view events">${day}</div>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Display assessment completion chart (horizontal bars)
 */
function updateAssessmentChart() {
    const user = getCurrentUser();
    if (!user) return;
    
    const container = document.getElementById('assessmentChart');
    if (!container) return;
    
    let modules = [];
    let completionData = [];
    
    if (user.role === 'teacher') {
        // For teachers: show module completion by students
        modules = getModules();
        const students = getStudents();
        const grades = getGrades();
        
        modules.forEach(module => {
            const moduleGrades = grades.filter(g => g.moduleId === module.id);
            const totalPossible = students.length;
            const completed = moduleGrades.length;
            const percentage = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
            completionData.push({
                name: module.name,
                percentage: percentage
            });
        });
    } else {
        // For students: show their own module completion
        const student = getStudentByUserId(user.id);
        if (student) {
            modules = getModules();
            const studentGrades = getStudentGrades(student.id);
            
            modules.forEach(module => {
                const hasGrade = studentGrades[module.id] !== undefined;
                completionData.push({
                    name: module.name,
                    percentage: hasGrade ? 100 : 0
                });
            });
        }
    }
    
    if (completionData.length === 0) {
        container.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }
    
    // Sort by percentage descending
    completionData.sort((a, b) => b.percentage - a.percentage);
    
    let html = '<div class="assessment-bars">';
    
    // X-axis labels
    html += '<div class="chart-axis">';
    for (let i = 0; i <= 100; i += 20) {
        html += `<span class="axis-label">${i}</span>`;
    }
    html += '</div>';
    
    // Bars
    completionData.forEach(item => {
        const color = item.percentage >= 80 ? 'var(--success)' : 
                     item.percentage >= 60 ? 'var(--info)' : 
                     item.percentage >= 40 ? 'var(--warning)' : 'var(--danger)';
        
        html += `
            <div class="assessment-bar-item">
                <div class="assessment-bar-label">${item.name}</div>
                <div class="assessment-bar-container">
                    <div class="assessment-bar-fill" style="width: ${item.percentage}%; background: ${color};"></div>
                    <span class="assessment-bar-value">${item.percentage}%</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Update circular progress indicators
 */
function updateCircularProgress() {
    const user = getCurrentUser();
    if (!user) return;
    
    if (user.role === 'teacher') {
        // For teachers: show class averages
        const successRate = calculateSuccessRate();
        const attendance = 85; // Simulated
        
        updateProgressCircle('examReadiness', successRate, 'var(--primary)');
        updateProgressCircle('attendanceProgress', attendance, 'var(--info)');
    } else {
        // For students: show personal metrics
        const student = getStudentByUserId(user.id);
        if (student) {
            const average = calculateStudentAverage(student.id);
            const examReadiness = average !== null ? Math.round((average / 20) * 100) : 0;
            const attendance = 90; // Simulated
            
            updateProgressCircle('examReadiness', examReadiness, 'var(--primary)');
            updateProgressCircle('attendanceProgress', attendance, 'var(--info)');
        }
    }
}

/**
 * Update a circular progress circle
 */
function updateProgressCircle(containerId, percentage, color) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const circle = container.querySelector('.progress-ring-circle');
    const valueSpan = container.querySelector('.progress-value');
    
    if (!circle || !valueSpan) {
        // Try again after a short delay in case DOM isn't ready
        setTimeout(() => updateProgressCircle(containerId, percentage, color), 100);
        return;
    }
    
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = color;
    valueSpan.textContent = percentage + '%';
}

/**
 * Display recent activity in modern format
 */
function displayRecentActivityModern() {
    const user = getCurrentUser();
    if (!user) return;
    
    const container = document.getElementById('recentActivityList');
    if (!container) return;
    
    const activities = [];
    
    if (user.role === 'teacher') {
        const students = getStudents();
        const modules = getModules();
        const grades = getGrades();
        
        // Recent students added
        if (students.length > 0) {
            const recentStudent = students[students.length - 1];
            activities.push({
                icon: '👥',
                title: `Student Added: ${recentStudent.name}`,
                description: `Group: ${recentStudent.group}`,
                color: 'var(--primary)',
                borderColor: 'var(--primary)'
            });
        }
        
        // Recent grades assigned
        if (grades.length > 0) {
            const recentGrade = grades[grades.length - 1];
            const student = getStudentById(recentGrade.studentId);
            const module = getModuleById(recentGrade.moduleId);
            if (student && module) {
                activities.push({
                    icon: '📝',
                    title: `Grade Assigned: ${module.name}`,
                    description: `${student.name}: ${recentGrade.grade}/20`,
                    color: 'var(--success)',
                    borderColor: 'var(--success)'
                });
            }
        }
        
        // Modules
        if (modules.length > 0) {
            const recentModule = modules[modules.length - 1];
            activities.push({
                icon: '📚',
                title: `Module: ${recentModule.name}`,
                description: `Coefficient: ${recentModule.coefficient}`,
                color: 'var(--info)',
                borderColor: 'var(--info)'
            });
        }
    } else {
        // Student view
        const student = getStudentByUserId(user.id);
        if (student) {
            const modules = getModules();
            const studentGrades = getStudentGrades(student.id);
            const gradedModules = modules.filter(m => studentGrades[m.id] !== undefined);
            
            gradedModules.slice(-3).forEach(module => {
                const grade = studentGrades[module.id];
                const color = grade >= 16 ? 'var(--success)' : 
                             grade >= 14 ? 'var(--info)' : 
                             grade >= 12 ? 'var(--warning)' : 
                             grade >= 10 ? 'var(--primary)' : 'var(--danger)';
                
                activities.push({
                    icon: '📚',
                    title: `${module.name}`,
                    description: `Grade: ${grade.toFixed(1)}/20`,
                    color: color,
                    borderColor: color
                });
            });
        }
    }
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="empty-state">No recent activity</p>';
        return;
    }
    
    let html = '<div class="activity-cards">';
    activities.forEach(activity => {
        html += `
            <div class="activity-card-modern" style="border-left-color: ${activity.borderColor};">
                <div class="activity-card-icon" style="background: ${activity.color}20; color: ${activity.color};">
                    ${activity.icon}
                </div>
                <div class="activity-card-content">
                    <div class="activity-card-title">${activity.title}</div>
                    <div class="activity-card-desc">${activity.description}</div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Initialize dashboard
 */
function initializeDashboard() {
    displayCalendar();
    updateAssessmentChart();
    updateCircularProgress();
    displayRecentActivityModern();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

/**
 * ============================================
 * STUDENT DASHBOARD FUNCTIONS
 * ============================================

/**
 * Display student statistics
 */
function displayStudentStatistics() {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') return;
    
    const student = getStudentByUserId(user.id);
    if (!student) {
        document.getElementById('statsGrid').innerHTML = '<p class="empty-state">Student record not found. Please contact your teacher.</p>';
        return;
    }
    
    const average = calculateStudentAverage(student.id);
    const modules = getModules();
    const studentGrades = getStudentGrades(student.id);
    const gradedModules = modules.filter(m => studentGrades[m.id] !== undefined);
    const passedModules = gradedModules.filter(m => studentGrades[m.id] >= 10).length;
    
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';
    
    const stats = [
        {
            value: average !== null ? average.toFixed(1) + '/20' : 'N/A',
            label: 'My Average',
            icon: '📊',
            trend: average !== null ? getMention(average) : 'N/A',
            trendUp: average !== null && average >= 10,
            color: average !== null && average >= 10 ? 'var(--success)' : 'var(--danger)'
        },
        {
            value: average !== null && average >= 10 ? 'Passed' : 'Failed',
            label: 'Status',
            icon: average !== null && average >= 10 ? '✅' : '❌',
            trend: average !== null ? (average >= 10 ? '+0%' : '-0%') : 'N/A',
            trendUp: average !== null && average >= 10,
            color: average !== null && average >= 10 ? 'var(--success)' : 'var(--danger)'
        },
        {
            value: gradedModules.length + '/' + modules.length,
            label: 'Graded Modules',
            icon: '📚',
            trend: '+0',
            trendUp: true,
            color: 'var(--info)'
        },
        {
            value: passedModules + '/' + gradedModules.length,
            label: 'Passed Modules',
            icon: '🎯',
            trend: gradedModules.length > 0 ? Math.round((passedModules / gradedModules.length) * 100) + '%' : '0%',
            trendUp: true,
            color: 'var(--success)'
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
 * Display student's grades bar chart
 */
function displayMyGradesChart() {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') return;
    
    const container = document.getElementById('myGradesChart');
    if (!container) return;
    
    const student = getStudentByUserId(user.id);
    if (!student) {
        container.innerHTML = '<p class="empty-state">Student record not found</p>';
        return;
    }
    
    const modules = getModules();
    const studentGrades = getStudentGrades(student.id);
    
    const gradedModules = modules.filter(m => studentGrades[m.id] !== undefined);
    
    if (gradedModules.length === 0) {
        container.innerHTML = '<p class="empty-state">No grades available yet</p>';
        return;
    }
    
    let chartHTML = '<div class="bar-chart">';
    
    gradedModules.forEach(module => {
        const grade = studentGrades[module.id];
        const percentage = (grade / 20) * 100;
        const color = grade >= 16 ? 'var(--success)' : 
                     grade >= 14 ? 'var(--info)' : 
                     grade >= 12 ? 'var(--warning)' : 
                     grade >= 10 ? 'var(--primary)' : 'var(--danger)';
        
        chartHTML += `
            <div class="bar-chart-item">
                <div class="bar-chart-label">
                    <span>${module.name}</span>
                    <span class="bar-value">${grade.toFixed(1)}/20</span>
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
 * Display radar chart for student performance
 */
function displayRadarChart() {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') return;
    
    const container = document.getElementById('radarChart');
    if (!container) return;
    
    const student = getStudentByUserId(user.id);
    if (!student) {
        container.innerHTML = '<p class="empty-state">Student record not found</p>';
        return;
    }
    
    const modules = getModules();
    const studentGrades = getStudentGrades(student.id);
    
    const gradedModules = modules.filter(m => studentGrades[m.id] !== undefined).slice(0, 6);
    
    if (gradedModules.length === 0) {
        container.innerHTML = '<p class="empty-state">No grades available for radar chart</p>';
        return;
    }
    
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / gradedModules.length;
    
    // Create polygon points
    const points = gradedModules.map((module, index) => {
        const grade = studentGrades[module.id];
        const normalizedGrade = (grade / 20) * 100; // Normalize to 0-100
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const distance = (normalizedGrade / 100) * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        return { x, y, module, grade };
    });
    
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';
    
    // Create grid circles
    const gridCircles = [0.25, 0.5, 0.75, 1].map(scale => {
        const r = radius * scale;
        return `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="var(--border-light)" stroke-width="1" opacity="0.3" />`;
    }).join('');
    
    // Create axis lines
    const axisLines = gradedModules.map((module, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="var(--border-light)" stroke-width="1" opacity="0.3" />`;
    }).join('');
    
    // Create labels
    const labels = points.map((p, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const labelX = centerX + Math.cos(angle) * (radius + 20);
        const labelY = centerY + Math.sin(angle) * (radius + 20);
        return `<text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="10" fill="var(--text-secondary)">${p.module.name.substring(0, 8)}</text>`;
    }).join('');
    
    container.innerHTML = `
        <div class="radar-chart-container">
            <svg viewBox="0 0 300 300" class="radar-chart">
                ${gridCircles}
                ${axisLines}
                <polygon points="${points.map(p => `${p.x},${p.y}`).join(' ')}" 
                         fill="var(--primary)" opacity="0.3" stroke="var(--primary)" stroke-width="2" />
                ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--primary)" />`).join('')}
                ${labels}
            </svg>
        </div>
    `;
}

/**
 * Display student's grade trends
 */
function displayMyTrendsChart() {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') return;
    
    const container = document.getElementById('myTrendsChart');
    
    // Simulate trend data (in real app, this would track historical grades)
    const modules = getModules();
    const student = getStudentByUserId(user.id);
    if (!student) return;
    
    const studentGrades = getStudentGrades(student.id);
    const gradedModules = modules.filter(m => studentGrades[m.id] !== undefined);
    
    if (gradedModules.length === 0) {
        container.innerHTML = '<p class="empty-state">No grades available</p>';
        return;
    }
    
    // Use actual grades as trend data
    const grades = gradedModules.map(m => studentGrades[m.id]);
    const labels = gradedModules.map(m => m.name.substring(0, 6));
    
    const maxValue = 20;
    const chartHeight = 200;
    const chartWidth = 100;
    const points = [];
    
    grades.forEach((grade, index) => {
        const x = (index / (grades.length - 1)) * chartWidth;
        const y = chartHeight - (grade / maxValue) * chartHeight;
        points.push(`${x},${y}`);
    });
    
    const pathData = `M ${points.join(' L ')}`;
    
    container.innerHTML = `
        <div class="line-chart-container">
            <svg viewBox="0 0 100 200" class="line-chart">
                <defs>
                    <linearGradient id="myGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--primary);stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:var(--primary);stop-opacity:0" />
                    </linearGradient>
                </defs>
                <path d="${pathData}" fill="none" stroke="var(--primary)" stroke-width="2" />
                <path d="${pathData} L ${chartWidth},${chartHeight} L 0,${chartHeight}" fill="url(#myGradient)" />
                ${grades.map((grade, index) => {
                    const x = (index / (grades.length - 1)) * chartWidth;
                    return `<circle cx="${x}" cy="${chartHeight - (grade / maxValue) * chartHeight}" r="2" fill="var(--primary)" />`;
                }).join('')}
                <g class="chart-labels">
                    ${labels.map((label, index) => {
                        const x = (index / (labels.length - 1)) * chartWidth;
                        return `<text x="${x}" y="${chartHeight + 10}" text-anchor="middle" font-size="8" fill="var(--text-secondary)">${label}</text>`;
                    }).join('')}
                </g>
            </svg>
        </div>
    `;
}

/**
 * Display student's pass/fail modules pie chart
 */
function displayMyPassFailChart() {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') return;
    
    const student = getStudentByUserId(user.id);
    if (!student) return;
    
    const modules = getModules();
    const studentGrades = getStudentGrades(student.id);
    const container = document.getElementById('myPassFailChart');
    
    const gradedModules = modules.filter(m => studentGrades[m.id] !== undefined);
    
    if (gradedModules.length === 0) {
        container.innerHTML = '<p class="empty-state">No grades available</p>';
        return;
    }
    
    let passed = 0;
    let failed = 0;
    
    gradedModules.forEach(module => {
        const grade = studentGrades[module.id];
        if (grade >= 10) passed++;
        else failed++;
    });
    
    const total = passed + failed;
    const passedPercent = (passed / total) * 100;
    const failedPercent = (failed / total) * 100;
    
    const passedDash = passedPercent * 3.14;
    const failedDash = failedPercent * 3.14;
    
    container.innerHTML = `
        <div class="pie-chart-container">
            <div class="pie-chart">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="transparent" stroke="var(--bg-tertiary)" stroke-width="30"></circle>
                    <circle cx="100" cy="100" r="80" fill="transparent" 
                            stroke="var(--success)" stroke-width="30" 
                            stroke-dasharray="${passedDash} ${failedDash}"
                            stroke-dashoffset="0" transform="rotate(-90 100 100)"></circle>
                    <circle cx="100" cy="100" r="80" fill="transparent" 
                            stroke="var(--danger)" stroke-width="30" 
                            stroke-dasharray="${failedDash} ${passedDash}"
                            stroke-dashoffset="${-passedDash}" transform="rotate(-90 100 100)"></circle>
                </svg>
                <div class="pie-chart-text">
                    <div class="pie-value">${total}</div>
                    <div class="pie-label">Modules</div>
                </div>
            </div>
            <div class="pie-legend">
                <div class="pie-legend-item">
                    <div class="pie-legend-color" style="background: var(--success);"></div>
                    <span>Passed: ${passed}</span>
                </div>
                <div class="pie-legend-item">
                    <div class="pie-legend-color" style="background: var(--danger);"></div>
                    <span>Failed: ${failed}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display student's performance metrics
 */
function displayMyPerformanceMetrics() {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') return;
    
    const student = getStudentByUserId(user.id);
    if (!student) return;
    
    const average = calculateStudentAverage(student.id);
    const container = document.getElementById('myPerformanceMetrics');
    
    if (average === null) {
        container.innerHTML = '<p class="empty-state">No grades available</p>';
        return;
    }
    
    const averagePercentage = (average / 20) * 100;
    const mention = getMention(average);
    
    container.innerHTML = `
        <div class="metrics-grid">
            <div class="metric-item">
                <div class="donut-chart">
                    <svg class="donut" width="120" height="120">
                        <circle class="donut-ring" cx="60" cy="60" r="50" fill="transparent" stroke="var(--bg-tertiary)" stroke-width="12"></circle>
                        <circle class="donut-segment" cx="60" cy="60" r="50" fill="transparent" 
                                stroke="${average >= 10 ? 'var(--success)' : 'var(--danger)'}" stroke-width="12" 
                                stroke-dasharray="${averagePercentage * 3.14} ${(100 - averagePercentage) * 3.14}"
                                stroke-dashoffset="78.5" transform="rotate(-90 60 60)"></circle>
                    </svg>
                    <div class="donut-text">
                        <div class="donut-value">${average.toFixed(1)}</div>
                        <div class="donut-label">Average</div>
                    </div>
                </div>
            </div>
            <div class="metric-item">
                <div style="text-align: center; padding: var(--spacing-md);">
                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
                        <span class="badge ${average >= 10 ? 'badge-success' : 'badge-danger'}">${mention}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Mention</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display student ranking
 */
function displayMyRanking() {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') return;
    
    const student = getStudentByUserId(user.id);
    if (!student) return;
    
    const studentsWithAverages = getAllStudentsWithAverages();
    const container = document.getElementById('myRanking');
    
    if (studentsWithAverages.length === 0) {
        container.innerHTML = '<p class="empty-state">No ranking data available</p>';
        return;
    }
    
    // Sort by average
    const sorted = studentsWithAverages.sort((a, b) => b.average - a.average);
    const myRank = sorted.findIndex(s => s.id === student.id) + 1;
    const totalStudents = sorted.length;
    const percentile = Math.round(((totalStudents - myRank + 1) / totalStudents) * 100);
    
    container.innerHTML = `
        <div class="ranking-display">
            <div class="ranking-number">#${myRank}</div>
            <div class="ranking-info">
                <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">
                    Out of ${totalStudents} students
                </div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    Top ${percentile}% of class
                </div>
            </div>
            <div class="ranking-bar">
                <div class="ranking-fill" style="width: ${percentile}%; background: var(--primary);"></div>
            </div>
        </div>
    `;
}

/**
 * Display recent grades
 */
function displayRecentGrades() {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') return;
    
    const student = getStudentByUserId(user.id);
    if (!student) return;
    
    const modules = getModules();
    const studentGrades = getStudentGrades(student.id);
    const container = document.getElementById('recentGrades');
    
    const gradedModules = modules
        .filter(m => studentGrades[m.id] !== undefined)
        .map(m => ({
            ...m,
            grade: studentGrades[m.id]
        }))
        .sort((a, b) => b.grade - a.grade)
        .slice(0, 5);
    
    if (gradedModules.length === 0) {
        container.innerHTML = '<p class="empty-state">No grades available</p>';
        return;
    }
    
    let html = '<div class="recent-grades">';
    gradedModules.forEach(module => {
        const color = module.grade >= 16 ? 'var(--success)' : 
                     module.grade >= 14 ? 'var(--info)' : 
                     module.grade >= 12 ? 'var(--warning)' : 
                     module.grade >= 10 ? 'var(--primary)' : 'var(--danger)';
        
        html += `
            <div class="recent-grade-item">
                <div class="recent-grade-icon" style="background: ${color}20; color: ${color};">
                    📚
                </div>
                <div class="recent-grade-info">
                    <div class="recent-grade-module">${module.name}</div>
                    <div class="recent-grade-date">Coef: ${module.coefficient}</div>
                </div>
                <div class="recent-grade-score" style="color: ${color};">
                    ${module.grade.toFixed(1)}/20
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Display performance insights
 */
function displayPerformanceInsights() {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') return;
    
    const student = getStudentByUserId(user.id);
    if (!student) return;
    
    const modules = getModules();
    const studentGrades = getStudentGrades(student.id);
    const container = document.getElementById('performanceInsights');
    
    const gradedModules = modules.filter(m => studentGrades[m.id] !== undefined);
    
    if (gradedModules.length === 0) {
        container.innerHTML = '<p class="empty-state">No insights available yet</p>';
        return;
    }
    
    const average = calculateStudentAverage(student.id);
    const weakSubjects = gradedModules
        .filter(m => studentGrades[m.id] < 10)
        .map(m => m.name);
    
    const strongSubjects = gradedModules
        .filter(m => studentGrades[m.id] >= 16)
        .map(m => m.name);
    
    let html = '<div class="insights-list">';
    
    if (average !== null) {
        if (average >= 16) {
            html += '<div class="insight-item success"><strong>Excellent!</strong> You are performing exceptionally well. Keep up the great work!</div>';
        } else if (average >= 14) {
            html += '<div class="insight-item info"><strong>Great job!</strong> You are doing well. Continue to maintain this level of performance.</div>';
        } else if (average >= 12) {
            html += '<div class="insight-item warning"><strong>Good progress!</strong> You are on the right track. Focus on improving weaker areas.</div>';
        } else if (average >= 10) {
            html += '<div class="insight-item primary"><strong>Keep working!</strong> You are passing, but there is room for improvement.</div>';
        } else {
            html += '<div class="insight-item danger"><strong>Needs attention!</strong> Focus on studying harder and seek help if needed.</div>';
        }
    }
    
    if (weakSubjects.length > 0) {
        html += `<div class="insight-item warning"><strong>Focus Areas:</strong> Consider spending more time on: ${weakSubjects.join(', ')}</div>`;
    }
    
    if (strongSubjects.length > 0) {
        html += `<div class="insight-item success"><strong>Strong Subjects:</strong> You excel in: ${strongSubjects.join(', ')}</div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * ============================================
 * INITIALIZATION
 * ============================================

/**
 * Initialize dashboard based on user role
 */
function initializeDashboard() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Always initialize these for the new dashboard design
    displayCalendar();
    updateAssessmentChart();
    updateCircularProgress();
    displayRecentActivityModern();
    
    // Additional features based on role
    if (user.role === 'student') {
        // Show student-specific charts
        displayMyGradesChart();
        displayRadarChart();
        displayMyPerformanceMetrics();
        displayMyRanking();
        displayRecentGrades();
    }
}

/**
 * Make calendar interactive - handle day clicks
 */
function selectCalendarDay(day) {
    // You can add functionality here to show events for that day
    console.log(`Selected day: ${day}`);
    // For now, just highlight the selected day
    const calendarDays = document.querySelectorAll('.calendar-day:not(.empty)');
    calendarDays.forEach(dayEl => {
        dayEl.classList.remove('selected');
        if (parseInt(dayEl.textContent) === day) {
            dayEl.classList.add('selected');
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

// Also initialize on window load as backup
window.addEventListener('load', () => {
    initializeDashboard();
});
