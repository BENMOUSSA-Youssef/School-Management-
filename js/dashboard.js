/**
 * ============================================
 * dashboard.js - Dashboard Logic
 * ============================================
 * 
 * This file handles the dashboard page:
 * - Display total students count
 * - Display total modules count
 * - Calculate and display success rate
 * - Find and display best student
 */

/**
 * Calculate average grade for a student
 * @param {string} studentId - Student ID
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
 * Calculate success rate (percentage of students with average >= 10)
 * @returns {number} Success rate percentage
 */
function calculateSuccessRate() {
    const students = getStudents();
    
    if (students.length === 0) {
        return 0;
    }
    
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
 * Find the best student (highest average)
 * @returns {Object|null} Best student object with average or null
 */
function findBestStudent() {
    const students = getStudents();
    
    if (students.length === 0) {
        return null;
    }
    
    let bestStudent = null;
    let bestAverage = -1;
    
    students.forEach(student => {
        const average = calculateStudentAverage(student.id);
        if (average !== null && average > bestAverage) {
            bestAverage = average;
            bestStudent = {
                ...student,
                average: average
            };
        }
    });
    
    return bestStudent;
}

/**
 * Display statistics on the dashboard
 */
function displayStatistics() {
    const students = getStudents();
    const modules = getModules();
    const successRate = calculateSuccessRate();
    const bestStudent = findBestStudent();
    
    // Get statistics container
    const statsGrid = document.getElementById('statsGrid');
    
    // Clear previous content
    statsGrid.innerHTML = '';
    
    // Create statistics cards
    const stats = [
        {
            value: students.length,
            label: 'Total Students',
            icon: '👥'
        },
        {
            value: modules.length,
            label: 'Total Modules',
            icon: '📚'
        },
        {
            value: successRate + '%',
            label: 'Success Rate',
            icon: '✅'
        }
    ];
    
    stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="icon">${stat.icon}</div>
            <h3>${stat.value}</h3>
            <p>${stat.label}</p>
        `;
        statsGrid.appendChild(statCard);
    });
    
    // Display best student
    const bestStudentDiv = document.getElementById('bestStudent');
    
    if (bestStudent) {
        const mention = getMention(bestStudent.average);
        const mentionClass = bestStudent.average >= 10 ? 'badge-success' : 'badge-danger';
        bestStudentDiv.innerHTML = `
            <div style="text-align: center; padding: 1.5rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.8;">🏆</div>
                <h3 style="color: var(--text-primary); font-size: 1.75rem; font-weight: 700; margin-bottom: 1.25rem; letter-spacing: -0.025em;">
                    ${bestStudent.name}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                    <div>
                        <p style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">CIN</p>
                        <p style="color: var(--text-primary); font-size: 1.125rem; font-weight: 600;">${bestStudent.cin}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Group</p>
                        <p style="color: var(--text-primary); font-size: 1.125rem; font-weight: 600;">${bestStudent.group}</p>
                    </div>
                </div>
                <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <p style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Average</p>
                    <p style="color: var(--primary-color); font-size: 2.5rem; font-weight: 700; line-height: 1; margin-bottom: 0.75rem;">${bestStudent.average.toFixed(2)}<span style="font-size: 1.25rem; color: var(--text-secondary);">/20</span></p>
                    <p style="margin-top: 0.75rem;">
                        <span class="badge ${mentionClass}" style="font-size: 0.875rem; padding: 0.5rem 1rem;">${mention}</span>
                    </p>
                </div>
            </div>
        `;
    } else {
        bestStudentDiv.innerHTML = `
            <p class="empty-state">No data available yet. Add students and grades to see statistics.</p>
        `;
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    displayStatistics();
});

