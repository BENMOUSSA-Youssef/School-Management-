/**
 * ============================================
 * grades.js - Grades Management Logic
 * ============================================
 * 
 * This file handles:
 * - Displaying grades table (students x modules)
 * - Assigning grades (0-20)
 * - Validating grade inputs
 * - Auto-saving grades to localStorage
 */

/**
 * Validate grade value (must be between 0 and 20)
 * @param {number} grade - Grade value to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidGrade(grade) {
    const numGrade = parseFloat(grade);
    return !isNaN(numGrade) && numGrade >= 0 && numGrade <= 20;
}

/**
 * Handle grade input change
 * @param {string} studentId - Student ID
 * @param {string} moduleId - Module ID
 * @param {HTMLInputElement} input - Input element
 */
function handleGradeChange(studentId, moduleId, input) {
    const value = input.value.trim();
    
    // Remove invalid class
    input.classList.remove('invalid');
    
    // If empty, remove grade
    if (value === '') {
        setGrade(studentId, moduleId, null);
        return;
    }
    
    // Validate grade
    if (!isValidGrade(value)) {
        input.classList.add('invalid');
        alert('Please enter a valid grade between 0 and 20!');
        // Restore previous value
        const previousGrade = getGrade(studentId, moduleId);
        input.value = previousGrade !== null ? previousGrade : '';
        return;
    }
    
    // Save grade
    const grade = parseFloat(value);
    setGrade(studentId, moduleId, grade);
    
    // Show success feedback (optional - you can remove this if too noisy)
    input.style.borderColor = '#28a745';
    setTimeout(() => {
        input.style.borderColor = '';
    }, 1000);
}

/**
 * Display grades table
 */
function displayGradesTable() {
    const students = getStudents();
    const modules = getModules();
    const container = document.getElementById('gradesTableContainer');
    
    // Check if we have students and modules
    if (students.length === 0) {
        container.innerHTML = '<p class="empty-state">No students found. Please add students first.</p>';
        return;
    }
    
    if (modules.length === 0) {
        container.innerHTML = '<p class="empty-state">No modules found. Please add modules first.</p>';
        return;
    }
    
    // Create table
    let tableHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>CIN</th>
                        <th>Group</th>
    `;
    
    // Add module headers
    modules.forEach(module => {
        tableHTML += `<th>${module.name}<br><small>(Coef: ${module.coefficient})</small></th>`;
    });
    
    tableHTML += `
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each student
    students.forEach(student => {
        tableHTML += `
            <tr>
                <td>${student.name}</td>
                <td>${student.cin}</td>
                <td>${student.group}</td>
        `;
        
        // Add grade inputs for each module
        modules.forEach(module => {
            const currentGrade = getGrade(student.id, module.id);
            const gradeValue = currentGrade !== null ? currentGrade : '';
            
            tableHTML += `
                <td>
                    <input 
                        type="number" 
                        class="grade-input" 
                        min="0" 
                        max="20" 
                        step="0.01"
                        value="${gradeValue}"
                        placeholder="0-20"
                        onchange="handleGradeChange('${student.id}', '${module.id}', this)"
                        onblur="handleGradeChange('${student.id}', '${module.id}', this)"
                    >
                </td>
            `;
        });
        
        tableHTML += `</tr>`;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

/**
 * ============================================
 * PAGE INITIALIZATION
 * ============================================
 * 
 * This runs when the page finishes loading
 */
document.addEventListener('DOMContentLoaded', () => {
    // Display the grades table
    displayGradesTable();
});

// Backup initialization on window load
window.addEventListener('load', () => {
    const container = document.getElementById('gradesTableContainer');
    if (container && (!container.innerHTML || container.innerHTML.trim() === '')) {
        displayGradesTable();
    }
});

