/**
 * ============================================
 * data.js - Shared Data Management
 * ============================================
 * 
 * This file handles all localStorage operations for:
 * - Students (with userId linking to users)
 * - Modules
 * - Grades
 * 
 * All data is stored as JSON strings in localStorage
 * IDs are numbers for consistency
 */

// ============================================
// STUDENT DATA MANAGEMENT
// ============================================

/**
 * Get all students from localStorage
 * @returns {Array} Array of student objects with {id, name, cin, group, userId}
 */
function getStudents() {
    const studentsJSON = localStorage.getItem('students');
    return studentsJSON ? JSON.parse(studentsJSON) : [];
}

/**
 * Save students array to localStorage
 * @param {Array} students - Array of student objects
 */
function saveStudents(students) {
    localStorage.setItem('students', JSON.stringify(students));
}

/**
 * Add a new student
 * @param {Object} student - Student object with name, cin, group, userId
 * @returns {boolean} True if added successfully, false if CIN already exists
 */
function addStudent(student) {
    const students = getStudents();
    
    // Check if CIN already exists
    if (students.some(s => s.cin === student.cin)) {
        return false;
    }
    
    // Add unique numeric ID
    const maxId = students.length > 0 ? Math.max(...students.map(s => s.id || 0)) : 0;
    student.id = maxId + 1;
    students.push(student);
    saveStudents(students);
    return true;
}

/**
 * Update an existing student
 * @param {number} id - Student ID
 * @param {Object} updatedStudent - Updated student data
 * @returns {boolean} True if updated successfully
 */
function updateStudent(id, updatedStudent) {
    const students = getStudents();
    const index = students.findIndex(s => s.id === id);
    
    if (index === -1) return false;
    
    // Preserve ID and check CIN uniqueness (if changed)
    updatedStudent.id = id;
    const otherStudents = students.filter(s => s.id !== id);
    if (otherStudents.some(s => s.cin === updatedStudent.cin)) {
        return false; // CIN already exists in another student
    }
    
    students[index] = updatedStudent;
    saveStudents(students);
    return true;
}

/**
 * Delete a student by ID
 * @param {number} id - Student ID
 */
function deleteStudent(id) {
    const students = getStudents();
    const filtered = students.filter(s => s.id !== id);
    saveStudents(filtered);
    
    // Also delete all grades for this student
    deleteStudentGrades(id);
}

/**
 * Get a student by ID
 * @param {number} id - Student ID
 * @returns {Object|null} Student object or null if not found
 */
function getStudentById(id) {
    const students = getStudents();
    return students.find(s => s.id === id) || null;
}

/**
 * Get a student by userId (links student record to user account)
 * @param {number} userId - User ID
 * @returns {Object|null} Student object or null if not found
 */
function getStudentByUserId(userId) {
    const students = getStudents();
    return students.find(s => s.userId === userId) || null;
}

// ============================================
// MODULE DATA MANAGEMENT
// ============================================

/**
 * Get all modules from localStorage
 * @returns {Array} Array of module objects with {id, name, coefficient}
 */
function getModules() {
    const modulesJSON = localStorage.getItem('modules');
    return modulesJSON ? JSON.parse(modulesJSON) : [];
}

/**
 * Save modules array to localStorage
 * @param {Array} modules - Array of module objects
 */
function saveModules(modules) {
    localStorage.setItem('modules', JSON.stringify(modules));
}

/**
 * Add a new module
 * @param {Object} module - Module object with name, coefficient, and optional examDate
 * @returns {boolean} True if added successfully, false if name already exists
 */
function addModule(module) {
    const modules = getModules();
    
    // Check if module name already exists
    if (modules.some(m => m.name.toLowerCase() === module.name.toLowerCase())) {
        return false;
    }
    
    // Add unique numeric ID (ensure it's a number, not a string)
    const maxId = modules.length > 0 ? Math.max(...modules.map(m => {
        const id = typeof m.id === 'string' ? parseInt(m.id) : m.id;
        return isNaN(id) ? 0 : id;
    })) : 0;
    module.id = maxId + 1; // Ensure it's always a number
    // Ensure examDate is included (can be empty string)
    if (!module.examDate) module.examDate = '';
    modules.push(module);
    saveModules(modules);
    return true;
}

/**
 * Update an existing module
 * @param {number} id - Module ID
 * @param {Object} updatedModule - Updated module data
 * @returns {boolean} True if updated successfully
 */
function updateModule(id, updatedModule) {
    const modules = getModules();
    // Convert to number for comparison
    const numId = typeof id === 'string' ? parseInt(id) : id;
    
    const index = modules.findIndex(m => {
        const moduleId = typeof m.id === 'string' ? parseInt(m.id) : m.id;
        return moduleId === numId;
    });
    
    if (index === -1) return false;
    
    // Preserve ID as number and check name uniqueness (if changed)
    updatedModule.id = numId; // Ensure ID is always a number
    const otherModules = modules.filter(m => {
        const moduleId = typeof m.id === 'string' ? parseInt(m.id) : m.id;
        return moduleId !== numId;
    });
    if (otherModules.some(m => m.name.toLowerCase() === updatedModule.name.toLowerCase())) {
        return false; // Name already exists in another module
    }
    
    modules[index] = updatedModule;
    saveModules(modules);
    return true;
}

/**
 * Delete a module by ID
 * @param {number} id - Module ID
 */
function deleteModule(id) {
    const modules = getModules();
    // Convert to number for comparison
    const numId = typeof id === 'string' ? parseInt(id) : id;
    
    // Filter out the module, comparing as numbers
    const filtered = modules.filter(m => {
        const moduleId = typeof m.id === 'string' ? parseInt(m.id) : m.id;
        return moduleId !== numId;
    });
    
    saveModules(filtered);
    
    // Also delete all grades for this module
    deleteModuleGrades(numId);
}

/**
 * Get a module by ID
 * @param {number|string} id - Module ID
 * @returns {Object|null} Module object or null if not found
 */
function getModuleById(id) {
    const modules = getModules();
    // Convert to number for comparison to handle both string and number IDs
    const numId = typeof id === 'string' ? parseInt(id) : id;
    if (isNaN(numId)) return null;
    
    return modules.find(m => {
        // Compare as numbers to handle type mismatches
        const moduleId = typeof m.id === 'string' ? parseInt(m.id) : m.id;
        return moduleId === numId;
    }) || null;
}

// ============================================
// GRADES DATA MANAGEMENT
// ============================================

/**
 * Get all grades from localStorage
 * Grades are stored as array: [{studentId, moduleId, grade}, ...]
 * @returns {Array} Array of grade objects
 */
function getGrades() {
    const gradesJSON = localStorage.getItem('grades');
    return gradesJSON ? JSON.parse(gradesJSON) : [];
}

/**
 * Save grades array to localStorage
 * @param {Array} grades - Array of grade objects
 */
function saveGrades(grades) {
    localStorage.setItem('grades', JSON.stringify(grades));
}

/**
 * Get grade for a specific student and module
 * @param {number} studentId - Student ID
 * @param {number} moduleId - Module ID
 * @returns {number|null} Grade value or null if not found
 */
function getGrade(studentId, moduleId) {
    const grades = getGrades();
    const gradeObj = grades.find(g => g.studentId === studentId && g.moduleId === moduleId);
    return gradeObj ? gradeObj.grade : null;
}

/**
 * Set grade for a specific student and module
 * @param {number} studentId - Student ID
 * @param {number} moduleId - Module ID
 * @param {number} grade - Grade value (0-20) or null to delete
 */
function setGrade(studentId, moduleId, grade) {
    let grades = getGrades();
    
    // Find existing grade
    const index = grades.findIndex(g => g.studentId === studentId && g.moduleId === moduleId);
    
    if (grade === null || grade === '' || isNaN(grade)) {
        // Remove grade if empty or invalid
        if (index !== -1) {
            grades.splice(index, 1);
        }
    } else {
        const gradeValue = parseFloat(grade);
        if (index !== -1) {
            // Update existing grade
            grades[index].grade = gradeValue;
        } else {
            // Add new grade
            grades.push({
                studentId: studentId,
                moduleId: moduleId,
                grade: gradeValue
            });
        }
    }
    
    saveGrades(grades);
}

/**
 * Delete all grades for a specific student
 * @param {number} studentId - Student ID
 */
function deleteStudentGrades(studentId) {
    let grades = getGrades();
    grades = grades.filter(g => g.studentId !== studentId);
    saveGrades(grades);
}

/**
 * Delete all grades for a specific module
 * @param {number} moduleId - Module ID
 */
function deleteModuleGrades(moduleId) {
    let grades = getGrades();
    grades = grades.filter(g => g.moduleId !== moduleId);
    saveGrades(grades);
}

/**
 * Get all grades for a specific student
 * @param {number} studentId - Student ID
 * @returns {Object} Object with moduleId as keys and grade as values
 */
function getStudentGrades(studentId) {
    const grades = getGrades();
    const studentGrades = {};
    
    grades.forEach(gradeObj => {
        if (gradeObj.studentId === studentId) {
            studentGrades[gradeObj.moduleId] = gradeObj.grade;
        }
    });
    
    return studentGrades;
}

// ============================================
// ABSENCE DATA MANAGEMENT
// ============================================

/**
 * Get all absences from localStorage
 * Absences are stored as: [{studentId, moduleId, count}, ...]
 * @returns {Array} Array of absence objects
 */
function getAbsences() {
    const absencesJSON = localStorage.getItem('absences');
    return absencesJSON ? JSON.parse(absencesJSON) : [];
}

/**
 * Save absences array to localStorage
 * @param {Array} absences - Array of absence objects
 */
function saveAbsences(absences) {
    localStorage.setItem('absences', JSON.stringify(absences));
}

/**
 * Get absence count for a specific student and module
 * @param {number} studentId - Student ID
 * @param {number} moduleId - Module ID
 * @returns {number} Absence count (default 0)
 */
function getAbsenceCount(studentId, moduleId) {
    const absences = getAbsences();
    // Convert to numbers to ensure proper comparison
    const sid = typeof studentId === 'string' ? parseInt(studentId) : studentId;
    const mid = typeof moduleId === 'string' ? parseInt(moduleId) : moduleId;
    const absenceObj = absences.find(a => 
        (typeof a.studentId === 'string' ? parseInt(a.studentId) : a.studentId) === sid &&
        (typeof a.moduleId === 'string' ? parseInt(a.moduleId) : a.moduleId) === mid
    );
    return absenceObj ? (typeof absenceObj.count === 'string' ? parseInt(absenceObj.count) : absenceObj.count) : 0;
}

/**
 * Set absence count for a specific student and module
 * @param {number} studentId - Student ID
 * @param {number} moduleId - Module ID
 * @param {number} count - Absence count
 */
function setAbsenceCount(studentId, moduleId, count) {
    let absences = getAbsences();
    const countValue = parseInt(count) || 0;
    
    // Convert to numbers to ensure proper comparison
    const sid = typeof studentId === 'string' ? parseInt(studentId) : studentId;
    const mid = typeof moduleId === 'string' ? parseInt(moduleId) : moduleId;
    
    // Find existing absence record
    const index = absences.findIndex(a => 
        (typeof a.studentId === 'string' ? parseInt(a.studentId) : a.studentId) === sid &&
        (typeof a.moduleId === 'string' ? parseInt(a.moduleId) : a.moduleId) === mid
    );
    
    if (countValue === 0) {
        // Remove absence record if count is 0
        if (index !== -1) {
            absences.splice(index, 1);
        }
    } else {
        if (index !== -1) {
            // Update existing absence
            absences[index].count = countValue;
        } else {
            // Add new absence record (ensure IDs are numbers)
            absences.push({
                studentId: sid,
                moduleId: mid,
                count: countValue
            });
        }
    }
    
    saveAbsences(absences);
}

/**
 * Get all absences for a specific student
 * @param {number} studentId - Student ID
 * @returns {Object} Object with moduleId as keys and absence count as values
 */
function getStudentAbsences(studentId) {
    const absences = getAbsences();
    const studentAbsences = {};
    
    absences.forEach(absenceObj => {
        if (absenceObj.studentId === studentId) {
            studentAbsences[absenceObj.moduleId] = absenceObj.count;
        }
    });
    
    return studentAbsences;
}

/**
 * Get total absence count for a student across all modules
 * @param {number} studentId - Student ID
 * @returns {number} Total absence count
 */
function getTotalAbsences(studentId) {
    const studentAbsences = getStudentAbsences(studentId);
    return Object.values(studentAbsences).reduce((sum, count) => sum + count, 0);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all data from localStorage
 * WARNING: This will delete all students, modules, grades, and absences
 */
function clearAllData() {
    localStorage.removeItem('students');
    localStorage.removeItem('modules');
    localStorage.removeItem('grades');
    localStorage.removeItem('absences');
}
