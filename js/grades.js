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
 * Handle absence input change
 * @param {number} studentId - Student ID
 * @param {number} moduleId - Module ID
 * @param {HTMLInputElement} input - Input element
 */
function handleAbsenceChange(studentId, moduleId, input) {
    const value = input.value.trim();
    studentId = parseInt(studentId);
    moduleId = parseInt(moduleId);
    
    // Remove invalid class
    input.classList.remove('invalid');
    
    // If empty, set to 0
    if (value === '') {
        setAbsenceCount(studentId, moduleId, 0);
        input.value = 0;
        return;
    }
    
    // Validate absence count (must be non-negative integer)
    const count = parseInt(value);
    if (isNaN(count) || count < 0) {
        input.classList.add('invalid');
        alert('Please enter a valid absence count (0 or positive number)!');
        const previousCount = getAbsenceCount(studentId, moduleId);
        input.value = previousCount;
        return;
    }
    
    // Save absence count
    setAbsenceCount(studentId, moduleId, count);
    
    // Show success feedback
    input.style.borderColor = '#28a745';
    input.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.3)';
    setTimeout(() => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    }, 1000);
    
    console.log(`Absence saved: Student ${studentId}, Module ${moduleId}, Count: ${count}`);
}

/**
 * Handle grade input change
 * This function is called when a teacher enters or changes a grade
 * @param {number} studentId - Student ID
 * @param {number} moduleId - Module ID
 * @param {HTMLInputElement} input - Input element
 */
function handleGradeChange(studentId, moduleId, input) {
    const value = input.value.trim();
    
    // Convert to numbers to ensure correct type
    studentId = parseInt(studentId);
    moduleId = parseInt(moduleId);
    
    // Remove all grade classes first
    input.classList.remove('invalid', 'grade-excellent', 'grade-very-good', 'grade-good', 'grade-pass', 'grade-fail');
    
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
    
    // Add color class based on grade
    if (grade >= 16) input.classList.add('grade-excellent');
    else if (grade >= 14) input.classList.add('grade-very-good');
    else if (grade >= 12) input.classList.add('grade-good');
    else if (grade >= 10) input.classList.add('grade-pass');
    else input.classList.add('grade-fail');
    
    // Show success feedback
    input.style.borderColor = '#28a745';
    input.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.3)';
    setTimeout(() => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    }, 1000);
    
    console.log(`Grade saved: Student ${studentId}, Module ${moduleId}, Grade: ${grade}`);
}

/**
 * Display grades table
 * This function creates an interactive table where teachers can assign grades
 */
function displayGradesTable() {
    console.log('🔍 Starting displayGradesTable()...');
    
    // Get data from localStorage
    const students = getStudents();
    const modules = getModules();
    
    console.log('📊 Data loaded:', {
        studentsCount: students.length,
        modulesCount: modules.length,
        students: students.map(s => ({ id: s.id, name: s.name })),
        modules: modules.map(m => ({ id: m.id, name: m.name }))
    });
    
    const container = document.getElementById('gradesTableContainer');
    const statusEl = document.getElementById('tableStatus');
    
    if (!container) {
        console.error('❌ Grades table container not found!');
        if (statusEl) statusEl.textContent = 'Error: Container not found';
        return;
    }
    
    // Update status
    if (statusEl) statusEl.textContent = 'Loading...';
    
    // Check if we have students and modules
    if (students.length === 0) {
        console.warn('⚠️ No students found in localStorage');
        container.innerHTML = '<p class="empty-state">❌ No students found. Please add students first from the <a href="students.html">Students page</a>.</p>';
        if (statusEl) statusEl.textContent = 'No students';
        return;
    }
    
    if (modules.length === 0) {
        console.warn('⚠️ No modules found in localStorage');
        container.innerHTML = '<p class="empty-state">❌ No modules found. Please add modules first from the <a href="modules.html">Modules page</a>.</p>';
        if (statusEl) statusEl.textContent = 'No modules';
        return;
    }
    
    console.log('✅ Data check passed:', students.length, 'students,', modules.length, 'modules');
    if (statusEl) statusEl.textContent = `Ready: ${students.length} students × ${modules.length} modules`;
    
    // Create table with proper styling
    let tableHTML = `
        <div class="table-container" style="overflow-x: auto; width: 100%; background: var(--bg-primary); border-radius: 12px; padding: var(--spacing-md); margin-top: var(--spacing-md);">
            <table style="width: 100%; min-width: 800px; border-collapse: collapse; background: var(--bg-primary);">
                <thead style="background: var(--bg-secondary);">
                    <tr>
                        <th style="position: sticky; left: 0; background: var(--bg-secondary); z-index: 10; padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--border-medium);">Student Name</th>
                        <th style="position: sticky; left: 150px; background: var(--bg-secondary); z-index: 10; padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--border-medium);">CIN</th>
                        <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--border-medium);">Group</th>
    `;
    
    // Add module headers with exam dates
    modules.forEach(module => {
        const examDate = module.examDate ? new Date(module.examDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'No date';
        tableHTML += `<th style="padding: 12px; text-align: center; font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--border-medium); min-width: 180px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${module.name}</div>
            <div style="font-size: 11px; color: var(--text-secondary); font-weight: normal;">
                Coef: ${module.coefficient} | Exam: ${examDate}
            </div>
        </th>`;
    });
    
    tableHTML += `
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each student
    console.log('📝 Creating table rows for', students.length, 'students...');
    students.forEach((student, studentIndex) => {
        // Ensure student ID is a number
        const studentId = typeof student.id === 'string' ? parseInt(student.id) : student.id;
        console.log(`  Creating row ${studentIndex + 1} for student:`, student.name, 'ID:', studentId);
        
        tableHTML += `
            <tr style="border-bottom: 1px solid var(--border-medium);">
                <td style="position: sticky; left: 0; background: var(--bg-primary); z-index: 5; padding: 12px; font-weight: 600; color: var(--text-primary);">${student.name}</td>
                <td style="position: sticky; left: 150px; background: var(--bg-primary); z-index: 5; padding: 12px; color: var(--text-primary);">${student.cin}</td>
                <td style="padding: 12px; color: var(--text-primary);">${student.group}</td>
        `;
        
        // Add grade and absence inputs for each module
        modules.forEach((module, moduleIndex) => {
            // Ensure module ID is a number
            const moduleId = typeof module.id === 'string' ? parseInt(module.id) : module.id;
            
            const currentGrade = getGrade(studentId, moduleId);
            const gradeValue = currentGrade !== null ? currentGrade : '';
            const currentAbsence = getAbsenceCount(studentId, moduleId);
            
            // Color code based on grade
            let inputClass = 'grade-input';
            if (currentGrade !== null) {
                if (currentGrade >= 16) inputClass += ' grade-excellent';
                else if (currentGrade >= 14) inputClass += ' grade-very-good';
                else if (currentGrade >= 12) inputClass += ' grade-good';
                else if (currentGrade >= 10) inputClass += ' grade-pass';
                else inputClass += ' grade-fail';
            }
            
            tableHTML += `
                <td style="min-width: 180px; padding: 12px; vertical-align: top;">
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div>
                            <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 6px; font-weight: 500;">Grade (0-20)</label>
                            <input 
                                type="number" 
                                class="${inputClass}" 
                                min="0" 
                                max="20" 
                                step="0.01"
                                value="${gradeValue}"
                                placeholder="0-20"
                                onchange="handleGradeChange(${studentId}, ${moduleId}, this)"
                                onblur="handleGradeChange(${studentId}, ${moduleId}, this)"
                                onkeypress="if(event.key==='Enter') this.blur()"
                                style="width: 100%; padding: 8px; border: 1px solid var(--border-medium); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;"
                            >
                        </div>
                        <div>
                            <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 6px; font-weight: 500;">Absences</label>
                            <input 
                                type="number" 
                                class="absence-input" 
                                min="0" 
                                step="1"
                                value="${currentAbsence}"
                                placeholder="0"
                                onchange="handleAbsenceChange(${studentId}, ${moduleId}, this)"
                                onblur="handleAbsenceChange(${studentId}, ${moduleId}, this)"
                                onkeypress="if(event.key==='Enter') this.blur()"
                                style="width: 100%; padding: 8px; border: 1px solid var(--border-medium); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary); font-size: 14px;"
                            >
                        </div>
                    </div>
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
    
    // Debug: Log table HTML info
    console.log('📄 Table HTML generated, length:', tableHTML.length);
    console.log('📄 Table HTML preview (first 500 chars):', tableHTML.substring(0, 500));
    
    // Clear container first
    container.innerHTML = '';
    
    // Set the HTML
    container.innerHTML = tableHTML;
    console.log('✅ HTML inserted into container');
    
    // Force display with important styles
    container.style.setProperty('display', 'block', 'important');
    container.style.setProperty('visibility', 'visible', 'important');
    container.style.setProperty('opacity', '1', 'important');
    container.style.setProperty('height', 'auto', 'important');
    container.style.setProperty('min-height', '200px', 'important');
    container.style.setProperty('width', '100%', 'important');
    
    // Verify the table was inserted
    const insertedTable = container.querySelector('table');
    if (!insertedTable) {
        console.error('❌ Table was not inserted into container!');
        console.error('Container HTML:', container.innerHTML.substring(0, 200));
        container.innerHTML = '<div style="padding: 20px; background: var(--danger); color: white; border-radius: 8px; margin: 20px;"><strong>❌ Error:</strong> Table failed to render.<br>HTML length: ' + tableHTML.length + '<br>Check console for details.</div>';
        return;
    }
    
    // Verify rows exist
    const rows = insertedTable.querySelectorAll('tbody tr');
    if (rows.length === 0) {
        console.error('❌ No table rows found!');
        console.error('Table HTML:', tableHTML.substring(0, 1000));
        container.innerHTML = '<div style="padding: 20px; background: var(--warning); color: white; border-radius: 8px; margin: 20px;"><strong>⚠️ Warning:</strong> Table created but no rows found.<br>Students: ' + students.length + '<br>Modules: ' + modules.length + '<br>Check console for details.</div>';
        return;
    }
    
    // Log success
    console.log(`✅ Grades table displayed: ${students.length} students, ${modules.length} modules`);
    console.log('✅ Table rows:', rows.length);
    console.log('✅ Table cells:', insertedTable.querySelectorAll('td').length);
    console.log('✅ Input fields:', insertedTable.querySelectorAll('input').length);
    
    // Update status
    if (statusEl) {
        statusEl.textContent = `✅ Displayed: ${rows.length} rows`;
        statusEl.style.color = 'var(--success)';
    }
}

/**
 * ============================================
 * PAGE INITIALIZATION
 * ============================================
 * 
 * This runs when the page finishes loading
 */

// Make functions available globally for onclick handlers
window.handleGradeChange = handleGradeChange;
window.handleAbsenceChange = handleAbsenceChange;
window.displayGradesTable = displayGradesTable;

// Test function to verify localStorage data
window.testLocalStorage = function() {
    console.log('🧪 Testing localStorage...');
    const students = getStudents();
    const modules = getModules();
    const grades = getGrades();
    const absences = getAbsences();
    
    console.log('📦 localStorage data:');
    console.log('  Students:', students.length, students);
    console.log('  Modules:', modules.length, modules);
    console.log('  Grades:', grades.length, grades);
    console.log('  Absences:', absences.length, absences);
    
    // Check raw localStorage
    console.log('📦 Raw localStorage:');
    console.log('  students:', localStorage.getItem('students'));
    console.log('  modules:', localStorage.getItem('modules'));
    console.log('  grades:', localStorage.getItem('grades'));
    console.log('  absences:', localStorage.getItem('absences'));
    
    return { students, modules, grades, absences };
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Content Loaded - Initializing grades table');
    console.log('📦 Checking localStorage...');
    
    // First, verify data exists
    const students = getStudents();
    const modules = getModules();
    console.log('📊 Initial check - Students:', students.length, 'Modules:', modules.length);
    
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        console.log('🚀 Calling displayGradesTable()...');
        displayGradesTable();
    }, 100);
});

// Backup initialization on window load
window.addEventListener('load', () => {
    console.log('Window Loaded - Checking grades table');
    setTimeout(() => {
        const container = document.getElementById('gradesTableContainer');
        if (container) {
            if (!container.innerHTML || container.innerHTML.trim() === '') {
                console.log('Container is empty, displaying table...');
                displayGradesTable();
            } else {
                console.log('Container already has content');
            }
        } else {
            console.error('Container not found!');
        }
    }, 200);
});

