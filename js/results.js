/**
 * ============================================
 * results.js - Results & Statistics Logic
 * ============================================
 * 
 * This file handles:
 * - Calculating student averages using module coefficients
 * - Determining pass/fail status
 * - Assigning mentions (Très Bien, Bien, Assez Bien, Ajourné)
 * - Sorting students by average or name
 * - Filtering passed/failed students
 */

// Global variable to store all results data
let allResults = [];

/**
 * Calculate average grade for a student using module coefficients
 * @param {string} studentId - Student ID
 * @returns {Object} Object with average, hasGrades, and moduleCount
 */
function calculateStudentAverage(studentId) {
    const modules = getModules();
    const studentGrades = getStudentGrades(studentId);
    
    if (modules.length === 0) {
        return { average: null, hasGrades: false, moduleCount: 0 };
    }
    
    let totalPoints = 0;
    let totalCoefficient = 0;
    let gradedModules = 0;
    
    modules.forEach(module => {
        const grade = studentGrades[module.id];
        if (grade !== undefined && grade !== null) {
            totalPoints += grade * module.coefficient;
            totalCoefficient += module.coefficient;
            gradedModules++;
        }
    });
    
    if (totalCoefficient === 0) {
        return { average: null, hasGrades: false, moduleCount: gradedModules };
    }
    
    const average = totalPoints / totalCoefficient;
    return { 
        average: average, 
        hasGrades: true, 
        moduleCount: gradedModules,
        totalModules: modules.length
    };
}

/**
 * Get mention based on average
 * @param {number} average - Average grade
 * @returns {Object} Object with mention text and badge class
 */
function getMention(average) {
    if (average >= 16) {
        return { text: 'Très Bien', class: 'badge-success' };
    }
    if (average >= 14) {
        return { text: 'Bien', class: 'badge-success' };
    }
    if (average >= 12) {
        return { text: 'Assez Bien', class: 'badge-info' };
    }
    if (average >= 10) {
        return { text: 'Passable', class: 'badge-warning' };
    }
    return { text: 'Ajourné', class: 'badge-danger' };
}

/**
 * Get status badge (Passed/Failed)
 * @param {number} average - Average grade
 * @returns {Object} Object with status text and badge class
 */
function getStatus(average) {
    if (average === null) {
        return { text: 'No Grades', class: 'badge-secondary' };
    }
    if (average >= 10) {
        return { text: 'Passed', class: 'badge-success' };
    }
    return { text: 'Failed', class: 'badge-danger' };
}

/**
 * Calculate all student results
 * This function calculates averages for ALL students, even if they don't have grades yet
 */
function calculateAllResults() {
    const students = getStudents();
    const modules = getModules();
    allResults = [];
    
    students.forEach(student => {
        const result = calculateStudentAverage(student.id);
        const average = result.average;
        
        allResults.push({
            student: student,
            average: average,
            hasGrades: result.hasGrades,
            moduleCount: result.moduleCount,
            totalModules: modules.length || 0
        });
    });
}

/**
 * Find student record for logged-in user using userId
 * @returns {Object|null} Student record or null
 */
function findStudentForUser() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
        return null;
    }
    
    // Use getStudentByUserId from data.js to find student by userId
    return getStudentByUserId(currentUser.id);
}

/**
 * Display results table
 */
function displayResults() {
    // Calculate all results first
    calculateAllResults();
    
    const container = document.getElementById('resultsTableContainer');
    if (!container) {
        console.error('Results container not found!');
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        container.innerHTML = '<p class="empty-state">Please log in to view results.</p>';
        return;
    }
    
    const isStudent = currentUser.role === 'student';
    
    // For students, show only their own results
    let resultsToShow = [...allResults];
    if (isStudent) {
        const studentRecord = findStudentForUser();
        if (studentRecord) {
            resultsToShow = allResults.filter(r => r.student.id === studentRecord.id);
        } else {
            container.innerHTML = '<p class="empty-state">No student record found. Please contact your teacher.</p>';
            return;
        }
    }
    
    // Always show students, even if they don't have grades yet
    // This way teachers can see all students and their status
    
    // Get filter and sort values (only for teachers)
    let filterValue = 'all';
    let sortValue = 'name';
    
    if (!isStudent) {
        const filterSelect = document.getElementById('filterStatus');
        const sortSelect = document.getElementById('sortBy');
        if (filterSelect) filterValue = filterSelect.value;
        if (sortSelect) sortValue = sortSelect.value;
    }
    
    // Filter results based on selected filter
    let filteredResults = [...resultsToShow];
    
    if (filterValue === 'passed') {
        // Show only students with average >= 10
        filteredResults = filteredResults.filter(r => r.average !== null && r.average >= 10);
    } else if (filterValue === 'failed') {
        // Show only students with average < 10 (or no grades)
        filteredResults = filteredResults.filter(r => {
            // Include students with no grades or average < 10
            return r.average === null || r.average < 10;
        });
    }
    // If filterValue === 'all', show all students (no filtering)
    
    // Sort results
    filteredResults.sort((a, b) => {
        if (sortValue === 'name') {
            return a.student.name.localeCompare(b.student.name);
        } else if (sortValue === 'average-desc') {
            const avgA = a.average !== null ? a.average : -1;
            const avgB = b.average !== null ? b.average : -1;
            return avgB - avgA;
        } else if (sortValue === 'average-asc') {
            const avgA = a.average !== null ? a.average : 999;
            const avgB = b.average !== null ? b.average : 999;
            return avgA - avgB;
        }
        return 0;
    });
    
    // For students, show a detailed card view
    if (isStudent) {
        const studentRecord = findStudentForUser();
        if (!studentRecord) {
            container.innerHTML = '<p class="empty-state">No student record found. Please contact your teacher.</p>';
            return;
        }
        
        const student = studentRecord;
        // Find the result for this student
        const studentResult = allResults.find(r => r.student.id === student.id);
        const average = studentResult ? studentResult.average : null;
        const status = getStatus(average);
        const mention = average !== null ? getMention(average) : { text: 'N/A', class: 'badge-secondary' };
        const modules = getModules();
        const studentGrades = getStudentGrades(student.id);
        const studentAbsences = getStudentAbsences(student.id);
        const totalAbsences = getTotalAbsences(student.id);
        
        // Color code the average
        let averageColor = 'var(--text-primary)';
        if (average !== null) {
            if (average >= 16) averageColor = 'var(--success)';
            else if (average >= 14) averageColor = 'var(--info)';
            else if (average >= 12) averageColor = 'var(--warning)';
            else if (average >= 10) averageColor = 'var(--primary)';
            else averageColor = 'var(--danger)';
        }
        
        let studentViewHTML = `
            <div class="student-results-view">
                <!-- Summary Card -->
                <div class="card" style="margin-bottom: var(--spacing-lg);">
                    <div class="card-header">
                        <h2>My Academic Summary</h2>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); padding: var(--spacing-lg);">
                        <div class="summary-stat">
                            <div class="stat-label">Overall Average</div>
                            <div class="stat-value" style="color: ${averageColor}; font-size: 32px; font-weight: 700;">
                                ${average !== null ? average.toFixed(2) : 'N/A'}<span style="font-size: 18px;">/20</span>
                            </div>
                        </div>
                        <div class="summary-stat">
                            <div class="stat-label">Status</div>
                            <div class="stat-value">
                                <span class="badge ${status.class}" style="font-size: 16px; padding: 8px 16px;">${status.text}</span>
                            </div>
                        </div>
                        <div class="summary-stat">
                            <div class="stat-label">Mention</div>
                            <div class="stat-value">
                                <span class="badge ${mention.class} mention" style="font-size: 16px; padding: 8px 16px;">${mention.text}</span>
                            </div>
                        </div>
                        <div class="summary-stat">
                            <div class="stat-label">Total Absences</div>
                            <div class="stat-value" style="color: ${totalAbsences > 10 ? 'var(--danger)' : totalAbsences > 5 ? 'var(--warning)' : 'var(--success)'}; font-size: 32px; font-weight: 700;">
                                ${totalAbsences}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Detailed Module Cards -->
                <div class="card">
                    <div class="card-header">
                        <h2>My Grades & Absences by Module</h2>
                    </div>
                    <div style="padding: var(--spacing-lg);">
        `;
        
        if (modules.length === 0) {
            studentViewHTML += '<p class="empty-state">No modules available.</p>';
        } else {
            modules.forEach(module => {
                const grade = studentGrades[module.id];
                const absenceCount = studentAbsences[module.id] || 0;
                const examDate = module.examDate ? new Date(module.examDate).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) : 'Not scheduled';
                
                let gradeColor = 'var(--text-secondary)';
                let gradeText = 'No grade yet';
                if (grade !== undefined && grade !== null) {
                    gradeText = grade.toFixed(2) + '/20';
                    if (grade >= 16) gradeColor = 'var(--success)';
                    else if (grade >= 14) gradeColor = 'var(--info)';
                    else if (grade >= 12) gradeColor = 'var(--warning)';
                    else if (grade >= 10) gradeColor = 'var(--primary)';
                    else gradeColor = 'var(--danger)';
                }
                
                studentViewHTML += `
                    <div class="module-card" style="border: 1px solid var(--border-medium); border-radius: 12px; padding: var(--spacing-lg); margin-bottom: var(--spacing-md); background: var(--bg-secondary);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-md);">
                            <div>
                                <h3 style="margin: 0 0 4px 0; color: var(--text-primary);">${module.name}</h3>
                                <div style="font-size: 13px; color: var(--text-secondary);">Coefficient: ${module.coefficient}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 24px; font-weight: 700; color: ${gradeColor};">
                                    ${gradeText}
                                </div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md); margin-top: var(--spacing-md);">
                            <div>
                                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Exam Date</div>
                                <div style="font-weight: 600; color: var(--text-primary);">${examDate}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Absences</div>
                                <div style="font-weight: 600; color: ${absenceCount > 5 ? 'var(--danger)' : absenceCount > 3 ? 'var(--warning)' : 'var(--success)'};">
                                    ${absenceCount} ${absenceCount === 1 ? 'absence' : 'absences'}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        studentViewHTML += `
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = studentViewHTML;
        return;
    }
    
    // For teachers, show table view
    let tableHTML = `
        <div class="table-container">
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>CIN</th>
                        <th>Group</th>
                        <th>Average</th>
                        <th>Status</th>
                        <th>Mention</th>
                        <th>Total Absences</th>
                        <th>Grades & Details</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each student
    filteredResults.forEach(result => {
        const student = result.student;
        const average = result.average;
        const status = getStatus(average);
        const mention = average !== null ? getMention(average) : { text: 'N/A', class: 'badge-secondary' };
        const totalAbsences = getTotalAbsences(student.id);
        
        // Show detailed grade breakdown
        let gradesCell = `${result.moduleCount}/${result.totalModules} modules`;
        const modules = getModules();
        const studentGrades = getStudentGrades(student.id);
        const studentAbsences = getStudentAbsences(student.id);
        
        if (modules.length > 0) {
            const gradesList = modules.map(m => {
                const grade = studentGrades[m.id];
                const absence = studentAbsences[m.id] || 0;
                const examDate = m.examDate ? new Date(m.examDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'No date';
                
                if (grade !== undefined) {
                    const color = grade >= 16 ? 'var(--success)' : 
                                 grade >= 14 ? 'var(--info)' : 
                                 grade >= 12 ? 'var(--warning)' : 
                                 grade >= 10 ? 'var(--primary)' : 'var(--danger)';
                    return `<div style="margin-bottom: 6px; font-size: 11px;">
                        <strong style="color: ${color};">${m.name}: ${grade.toFixed(2)}/20</strong><br>
                        <span style="color: var(--text-secondary);">Abs: ${absence} | Exam: ${examDate}</span>
                    </div>`;
                } else {
                    return `<div style="margin-bottom: 6px; font-size: 11px; color: var(--text-secondary);">
                        ${m.name}: No grade | Abs: ${absence} | Exam: ${examDate}
                    </div>`;
                }
            }).join('');
            gradesCell = `<div style="text-align: left; font-size: 11px; max-width: 300px;">${gradesList}</div>`;
        } else {
            gradesCell = '<span style="color: var(--text-secondary);">No modules</span>';
        }
        
        // Color code the average
        let averageColor = 'var(--text-primary)';
        if (average !== null) {
            if (average >= 16) averageColor = 'var(--success)';
            else if (average >= 14) averageColor = 'var(--info)';
            else if (average >= 12) averageColor = 'var(--warning)';
            else if (average >= 10) averageColor = 'var(--primary)';
            else averageColor = 'var(--danger)';
        }
        
        tableHTML += `
            <tr>
                <td><strong>${student.name}</strong></td>
                <td>${student.cin}</td>
                <td>${student.group}</td>
                <td class="average" style="color: ${averageColor}; font-weight: 700;">
                    ${average !== null ? average.toFixed(2) + '/20' : 'N/A'}
                </td>
                <td>
                    <span class="badge ${status.class}">${status.text}</span>
                </td>
                <td>
                    <span class="badge ${mention.class} mention">${mention.text}</span>
                </td>
                <td style="color: ${totalAbsences > 10 ? 'var(--danger)' : totalAbsences > 5 ? 'var(--warning)' : 'var(--success)'}; font-weight: 600;">
                    ${totalAbsences}
                </td>
                <td>
                    ${gradesCell}
                </td>
            </tr>
        `;
    });
    
    // If no filtered results, show a message
    if (filteredResults.length === 0) {
        let message = '';
        if (filterValue === 'passed') {
            message = 'No students have passed yet (average ≥ 10).';
        } else if (filterValue === 'failed') {
            message = 'No students have failed. All students are passing!';
        } else {
            message = 'No results to display.';
        }
        tableHTML = `<p class="empty-state">${message}</p>`;
    } else {
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    container.innerHTML = tableHTML;
}

/**
 * Filter results based on status
 */
function filterResults() {
    displayResults();
}

/**
 * Sort results
 */
function sortResults() {
    displayResults();
}

/**
 * ============================================
 * PAGE INITIALIZATION
 * ============================================
 * 
 * This runs when the page finishes loading
 */
document.addEventListener('DOMContentLoaded', () => {
    // Display all results
    displayResults();
});

// Backup initialization on window load
window.addEventListener('load', () => {
    const container = document.getElementById('resultsTableContainer');
    if (container && (!container.innerHTML || container.innerHTML.trim() === '')) {
        displayResults();
    }
});

