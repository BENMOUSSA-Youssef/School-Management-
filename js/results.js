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
 */
function calculateAllResults() {
    const students = getStudents();
    allResults = [];
    
    students.forEach(student => {
        const result = calculateStudentAverage(student.id);
        const average = result.average;
        
        allResults.push({
            student: student,
            average: average,
            hasGrades: result.hasGrades,
            moduleCount: result.moduleCount,
            totalModules: result.totalModules || 0
        });
    });
}

/**
 * Find student record for logged-in user
 * @returns {Object|null} Student record or null
 */
function findStudentForUser() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
        return null;
    }
    
    const students = getStudents();
    // Try to match by name (case-insensitive)
    const student = students.find(s => 
        s.name.toLowerCase() === currentUser.name.toLowerCase() ||
        s.cin === currentUser.email.split('@')[0] // Simple matching
    );
    
    return student || null;
}

/**
 * Display results table
 */
function displayResults() {
    calculateAllResults();
    
    const container = document.getElementById('resultsTableContainer');
    const currentUser = getCurrentUser();
    const isStudent = currentUser && currentUser.role === 'student';
    
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
    
    if (resultsToShow.length === 0) {
        container.innerHTML = '<p class="empty-state">No results found.</p>';
        return;
    }
    
    // Get filter and sort values (only for teachers)
    let filterValue = 'all';
    let sortValue = 'name';
    
    if (!isStudent) {
        const filterSelect = document.getElementById('filterStatus');
        const sortSelect = document.getElementById('sortBy');
        if (filterSelect) filterValue = filterSelect.value;
        if (sortSelect) sortValue = sortSelect.value;
    }
    
    // Filter results
    let filteredResults = [...resultsToShow];
    
    if (filterValue === 'passed') {
        filteredResults = filteredResults.filter(r => r.average !== null && r.average >= 10);
    } else if (filterValue === 'failed') {
        filteredResults = filteredResults.filter(r => r.average !== null && r.average < 10);
    }
    
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
    
    // Create table
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
                        <th>Grades</th>
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
        
        // For students, show detailed grade breakdown
        let gradesCell = `${result.moduleCount}/${result.totalModules}`;
        if (isStudent && result.moduleCount > 0) {
            const modules = getModules();
            const studentGrades = getStudentGrades(student.id);
            const gradesList = modules
                .filter(m => studentGrades[m.id] !== undefined)
                .map(m => `${m.name}: ${studentGrades[m.id].toFixed(2)}`)
                .join('<br>');
            gradesCell = `<div style="text-align: left;"><small>${gradesList}</small></div>`;
        }
        
        tableHTML += `
            <tr>
                <td>${student.name}</td>
                <td>${student.cin}</td>
                <td>${student.group}</td>
                <td class="average">
                    ${average !== null ? average.toFixed(2) + '/20' : 'N/A'}
                </td>
                <td>
                    <span class="badge ${status.class}">${status.text}</span>
                </td>
                <td>
                    <span class="badge ${mention.class} mention">${mention.text}</span>
                </td>
                <td>
                    ${gradesCell}
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
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

// Initialize results page when it loads
document.addEventListener('DOMContentLoaded', () => {
    displayResults();
});

